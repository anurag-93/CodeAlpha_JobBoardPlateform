import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Resume from '../models/Resume.js';

// @desc    Get system-wide platform statistics and analytics
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getPlatformStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      candidateCount,
      employerCount,
      adminCount,
      totalJobs,
      publishedJobs,
      draftJobs,
      closedJobs,
      totalApplications,
      totalResumes,
      submittedApps,
      reviewingApps,
      shortlistedApps,
      hiredApps,
      rejectedApps,
      recentUsers,
      recentJobs,
      recentApplications,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'candidate' }),
      User.countDocuments({ role: 'employer' }),
      User.countDocuments({ role: 'admin' }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'published' }),
      Job.countDocuments({ status: 'draft' }),
      Job.countDocuments({ status: 'closed' }),
      Application.countDocuments(),
      Resume.countDocuments(),
      Application.countDocuments({ status: 'submitted' }),
      Application.countDocuments({ status: 'reviewing' }),
      Application.countDocuments({ status: 'shortlisted' }),
      Application.countDocuments({ status: 'hired' }),
      Application.countDocuments({ status: 'rejected' }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt isActive'),
      Job.find().sort({ createdAt: -1 }).limit(5).populate('employer', 'name email companyName'),
      Application.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('candidate', 'name email')
        .populate('job', 'title companyName'),
    ]);

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          candidates: candidateCount,
          employers: employerCount,
          admins: adminCount,
        },
        jobs: {
          total: totalJobs,
          published: publishedJobs,
          draft: draftJobs,
          closed: closedJobs,
        },
        applications: {
          total: totalApplications,
          submitted: submittedApps,
          reviewing: reviewingApps,
          shortlisted: shortlistedApps,
          hired: hiredApps,
          rejected: rejectedApps,
        },
        resumes: {
          total: totalResumes,
        },
        recentUsers,
        recentJobs,
        recentApplications,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with filtering, search, and pagination
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }, { companyName: regex }];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active/inactive status
// @route   PATCH /api/admin/users/:id/toggle-status
// @access  Private (Admin)
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Protect against self-deactivation by admin
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own admin account',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own admin account',
      });
    }

    // Cascade delete user data
    if (user.role === 'employer') {
      const employerJobs = await Job.find({ employer: user._id });
      const jobIds = employerJobs.map((j) => j._id);
      await Application.deleteMany({ job: { $in: jobIds } });
      await Job.deleteMany({ employer: user._id });
    } else if (user.role === 'candidate') {
      await Application.deleteMany({ candidate: user._id });
      await Resume.deleteMany({ candidate: user._id });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User and associated data deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs (including draft and closed)
// @route   GET /api/admin/jobs
// @access  Private (Admin)
export const getAllJobsAdmin = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: regex }, { companyName: regex }, { location: regex }];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('employer', 'name email companyName')
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

// @desc    Update any job status (e.g. approve/publish, close, draft)
// @route   PATCH /api/admin/jobs/:id/status
// @access  Private (Admin)
export const updateJobStatusAdmin = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['published', 'draft', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be published, draft, or closed',
      });
    }

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found',
      });
    }

    res.json({
      success: true,
      message: `Job status updated to ${status}`,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};
