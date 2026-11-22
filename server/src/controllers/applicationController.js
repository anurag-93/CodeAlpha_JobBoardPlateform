import Application from '../models/Application.js';
import Job from '../models/Job.js';
import Resume from '../models/Resume.js';
import Notification from '../models/Notification.js';

// @desc    Apply to a job
// @route   POST /api/applications
// @access  Private (Candidate)
export const applyToJob = async (req, res, next) => {
  try {
    const { jobId, resumeId, coverLetter } = req.body;

    if (!jobId || !resumeId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID and Resume ID are required to apply',
      });
    }

    // Verify Job exists and is published
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found',
      });
    }

    if (job.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'This job listing is no longer accepting applications',
      });
    }

    // Give a readable response for the common case; the unique schema index also
    // prevents duplicate submissions that race between this check and insert.
    const existingApplication = await Application.findOne({
      job: jobId,
      candidate: req.user._id,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job listing',
        applicationId: existingApplication._id,
      });
    }

    // Verify Resume exists and belongs to candidate
    const resume = await Resume.findOne({
      _id: resumeId,
      candidate: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Selected resume not found or does not belong to you',
      });
    }

    // Create Application
    const application = await Application.create({
      job: jobId,
      candidate: req.user._id,
      employer: job.employer,
      resume: resume._id,
      resumeSnapshot: {
        originalName: resume.originalName,
        filename: resume.filename,
        filePath: resume.filePath,
        mimeType: resume.mimeType,
        fileSize: resume.fileSize,
      },
      coverLetter: coverLetter || '',
      status: 'submitted',
      statusHistory: [
        {
          status: 'submitted',
          changedBy: req.user._id,
          note: 'Application submitted by candidate',
          changedAt: new Date(),
        },
      ],
    });

    // Increment application count on job
    job.applicationsCount = (job.applicationsCount || 0) + 1;
    await job.save({ validateBeforeSave: false });

    // Create Notification for Employer
    try {
      await Notification.create({
        recipient: job.employer,
        sender: req.user._id,
        type: 'application_received',
        title: 'New Candidate Application',
        message: `${req.user.name} applied for "${job.title}"`,
        link: `/employer/jobs/${job._id}/applicants`,
        relatedJob: job._id,
        relatedApplication: application._id,
      });
    } catch (notifErr) {
      console.warn('Failed to dispatch notification to employer:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applications for logged-in candidate
// @route   GET /api/applications/my-applications
// @access  Private (Candidate)
export const getMyApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { candidate: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate('job', 'title companyName location workplaceMode jobType salary status')
      .populate('resume', 'originalName title createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: applications.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applicants for a specific job
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer who owns job, or Admin)
export const getJobApplicants = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { status, search, page = 1, limit = 20 } = req.query;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found',
      });
    }

    if (job.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applicants for this job',
      });
    }

    const query = { job: jobId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    let applications = await Application.find(query)
      .populate('candidate', 'name email headline phone location skills experienceYears')
      .populate('resume', 'originalName title fileSize createdAt')
      .sort({ createdAt: -1 });

    // Optional text search filter on candidate name, email, or skills
    if (search && search.trim() !== '') {
      const term = search.trim().toLowerCase();
      applications = applications.filter((app) => {
        const c = app.candidate;
        if (!c) return false;
        return (
          c.name?.toLowerCase().includes(term) ||
          c.email?.toLowerCase().includes(term) ||
          c.headline?.toLowerCase().includes(term) ||
          c.skills?.some((s) => s.toLowerCase().includes(term))
        );
      });
    }

    const total = applications.length;
    const paginatedApps = applications.slice(skip, skip + limitNum);

    res.json({
      success: true,
      job: {
        _id: job._id,
        title: job.title,
        status: job.status,
        applicationsCount: job.applicationsCount,
      },
      count: paginatedApps.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      data: paginatedApps,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications received across all employer's jobs
// @route   GET /api/applications/employer/all
// @access  Private (Employer)
export const getAllEmployerApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { employer: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate('job', 'title location workplaceMode')
      .populate('candidate', 'name email headline phone skills')
      .populate('resume', 'originalName title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: applications.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application details
// @route   GET /api/applications/:id
// @access  Private (Candidate owner, Employer, Admin)
export const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('candidate', 'name email headline bio phone location skills experienceYears')
      .populate('resume')
      .populate('statusHistory.changedBy', 'name role');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    const isCandidate = application.candidate?._id?.toString() === req.user._id.toString();
    const isEmployer = application.employer?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCandidate && !isEmployer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application',
      });
    }

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status
// @route   PATCH /api/applications/:id/status
// @access  Private (Employer who owns job, or Admin)
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    const allowedStatuses = ['submitted', 'reviewing', 'shortlisted', 'rejected', 'hired'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`,
      });
    }

    const application = await Application.findById(req.params.id).populate('job', 'title');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (application.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application status',
      });
    }

    const previousStatus = application.status;
    application.status = status;
    application.statusHistory.push({
      status,
      changedBy: req.user._id,
      note: note || `Status changed from ${previousStatus} to ${status}`,
      changedAt: new Date(),
    });

    await application.save();

    // Notify Candidate of status change
    try {
      const statusLabels = {
        reviewing: 'Under Review',
        shortlisted: 'Shortlisted 🎉',
        hired: 'Hired 🚀 Congratulations!',
        rejected: 'Declined',
        submitted: 'Received',
      };

      await Notification.create({
        recipient: application.candidate,
        sender: req.user._id,
        type: 'status_changed',
        title: `Application Status Updated: ${statusLabels[status] || status}`,
        message: `Your application for "${application.job?.title || 'a job'}" has moved to ${statusLabels[status] || status}.`,
        link: `/candidate/applications`,
        relatedJob: application.job?._id,
        relatedApplication: application._id,
      });
    } catch (notifErr) {
      console.warn('Failed to dispatch notification to candidate:', notifErr.message);
    }

    res.json({
      success: true,
      message: `Application status updated to ${status}`,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or update internal employer notes on an application
// @route   PATCH /api/applications/:id/notes
// @access  Private (Employer who owns job, or Admin)
export const updateEmployerNotes = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (application.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update notes on this application',
      });
    }

    application.employerNotes = notes || '';
    await application.save();

    res.json({
      success: true,
      message: 'Employer notes updated',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};
