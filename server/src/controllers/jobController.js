import Job from '../models/Job.js';
import Application from '../models/Application.js';

// @desc    Get all published jobs with search, filtering, and pagination
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res, next) => {
  try {
    const {
      keyword,
      location,
      jobType,
      workplaceMode,
      experienceLevel,
      minSalary,
      maxSalary,
      sort = 'newest',
      page = 1,
      limit = 10,
    } = req.query;

    const query = { status: 'published' };

    // Search keyword across title, description, companyName, skills
    if (keyword && keyword.trim() !== '') {
      const regex = new RegExp(keyword.trim(), 'i');
      query.$or = [
        { title: regex },
        { description: regex },
        { companyName: regex },
        { skillsRequired: { $in: [regex] } },
      ];
    }

    // Location filter
    if (location && location.trim() !== '') {
      query.location = new RegExp(location.trim(), 'i');
    }

    // Job type filter (comma-separated or single)
    if (jobType) {
      const types = jobType.split(',').map((t) => t.trim());
      query.jobType = { $in: types };
    }

    // Workplace mode filter (remote, on-site, hybrid)
    if (workplaceMode) {
      const modes = workplaceMode.split(',').map((m) => m.trim());
      query.workplaceMode = { $in: modes };
    }

    // Experience level filter
    if (experienceLevel) {
      const levels = experienceLevel.split(',').map((l) => l.trim());
      query.experienceLevel = { $in: levels };
    }

    // Salary filter
    if (minSalary || maxSalary) {
      query.$and = query.$and || [];
      if (minSalary) {
        query.$and.push({
          $or: [
            { 'salary.max': { $gte: Number(minSalary) } },
            { 'salary.min': { $gte: Number(minSalary) } },
          ],
        });
      }
      if (maxSalary) {
        query.$and.push({
          'salary.min': { $lte: Number(maxSalary) },
        });
      }
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    else if (sort === 'salary-high') sortOption = { 'salary.max': -1 };
    else if (sort === 'salary-low') sortOption = { 'salary.min': 1 };
    else if (sort === 'views') sortOption = { viewsCount: -1 };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('employer', 'name email companyName companyLogo companyWebsite')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: jobs.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public (optional auth to check if candidate applied)
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'employer',
      'name email companyName companyLogo companyWebsite companyDescription'
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found',
      });
    }

    // Increment view count
    job.viewsCount = (job.viewsCount || 0) + 1;
    await job.save({ validateBeforeSave: false });

    let hasApplied = false;
    let applicationDetails = null;

    if (req.user && req.user.role === 'candidate') {
      const existingApp = await Application.findOne({
        job: job._id,
        candidate: req.user._id,
      });
      if (existingApp) {
        hasApplied = true;
        applicationDetails = {
          _id: existingApp._id,
          status: existingApp.status,
          createdAt: existingApp.createdAt,
        };
      }
    }

    res.json({
      success: true,
      data: job,
      hasApplied,
      applicationDetails,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a job listing
// @route   POST /api/jobs
// @access  Private (Employer & Admin)
export const createJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      companyName,
      companyWebsite,
      companyLogo,
      location,
      workplaceMode,
      jobType,
      experienceLevel,
      salary,
      requirements,
      responsibilities,
      skillsRequired,
      status = 'published',
      applicationDeadline,
    } = req.body;

    const parseArray = (field) => {
      if (Array.isArray(field)) return field;
      if (typeof field === 'string') {
        return field
          .split('\n')
          .map((item) => item.replace(/^[•\-\*]\s*/, '').trim())
          .filter(Boolean);
      }
      return [];
    };

    const job = await Job.create({
      title,
      description,
      employer: req.user._id,
      companyName: companyName || req.user.companyName || `${req.user.name}'s Company`,
      companyWebsite: companyWebsite || req.user.companyWebsite || '',
      companyLogo: companyLogo || req.user.companyLogo || '',
      location,
      workplaceMode,
      jobType,
      experienceLevel,
      salary: {
        min: salary?.min || 0,
        max: salary?.max || 0,
        currency: salary?.currency || 'USD',
        period: salary?.period || 'yearly',
        isNegotiable: Boolean(salary?.isNegotiable),
      },
      requirements: parseArray(requirements),
      responsibilities: parseArray(responsibilities),
      skillsRequired: Array.isArray(skillsRequired)
        ? skillsRequired
        : typeof skillsRequired === 'string'
        ? skillsRequired.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      status,
      applicationDeadline: applicationDeadline || undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Job listing created successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job listing
// @route   PUT /api/jobs/:id
// @access  Private (Employer who owns job, or Admin)
export const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found',
      });
    }

    // Check ownership or admin
    if (job.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job listing',
      });
    }

    const parseArray = (field) => {
      if (Array.isArray(field)) return field;
      if (typeof field === 'string') {
        return field
          .split('\n')
          .map((item) => item.replace(/^[•\-\*]\s*/, '').trim())
          .filter(Boolean);
      }
      return undefined;
    };

    const updateData = { ...req.body };
    if (req.body.requirements !== undefined) {
      updateData.requirements = parseArray(req.body.requirements);
    }
    if (req.body.responsibilities !== undefined) {
      updateData.responsibilities = parseArray(req.body.responsibilities);
    }
    if (req.body.skillsRequired !== undefined) {
      updateData.skillsRequired = Array.isArray(req.body.skillsRequired)
        ? req.body.skillsRequired
        : typeof req.body.skillsRequired === 'string'
        ? req.body.skillsRequired.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    }

    job = await Job.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Job listing updated successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job listing
// @route   DELETE /api/jobs/:id
// @access  Private (Employer who owns job, or Admin)
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found',
      });
    }

    if (job.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job listing',
      });
    }

    await job.deleteOne();
    // Also remove applications associated with this job
    await Application.deleteMany({ job: req.params.id });

    res.json({
      success: true,
      message: 'Job listing and related applications removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get jobs posted by the logged-in employer
// @route   GET /api/jobs/employer/my-jobs
// @access  Private (Employer)
export const getEmployerJobs = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { employer: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: jobs.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employer dashboard stats
// @route   GET /api/jobs/employer/stats
// @access  Private (Employer)
export const getEmployerStats = async (req, res, next) => {
  try {
    const employerId = req.user._id;

    const totalJobs = await Job.countDocuments({ employer: employerId });
    const activeJobs = await Job.countDocuments({ employer: employerId, status: 'published' });
    const closedJobs = await Job.countDocuments({ employer: employerId, status: 'closed' });
    const draftJobs = await Job.countDocuments({ employer: employerId, status: 'draft' });

    const totalApplications = await Application.countDocuments({ employer: employerId });
    const submittedCount = await Application.countDocuments({ employer: employerId, status: 'submitted' });
    const reviewingCount = await Application.countDocuments({ employer: employerId, status: 'reviewing' });
    const shortlistedCount = await Application.countDocuments({ employer: employerId, status: 'shortlisted' });
    const hiredCount = await Application.countDocuments({ employer: employerId, status: 'hired' });
    const rejectedCount = await Application.countDocuments({ employer: employerId, status: 'rejected' });

    // Recent 5 applications
    const recentApplications = await Application.find({ employer: employerId })
      .populate('candidate', 'name email headline phone')
      .populate('job', 'title location workplaceMode')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalJobs,
        activeJobs,
        closedJobs,
        draftJobs,
        totalApplications,
        statusBreakdown: {
          submitted: submittedCount,
          reviewing: reviewingCount,
          shortlisted: shortlistedCount,
          hired: hiredCount,
          rejected: rejectedCount,
        },
        recentApplications,
      },
    });
  } catch (error) {
    next(error);
  }
};
