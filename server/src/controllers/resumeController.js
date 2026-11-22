import fs from 'fs';
import path from 'path';
import Resume from '../models/Resume.js';
import Application from '../models/Application.js';

// @desc    Upload a new resume
// @route   POST /api/resumes
// @access  Private (Candidate)
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume file (PDF, DOC, or DOCX)',
      });
    }

    const { title, isDefault } = req.body;
    const existingResumesCount = await Resume.countDocuments({ candidate: req.user._id });

    // If first resume, default to true
    const shouldBeDefault = isDefault === 'true' || isDefault === true || existingResumesCount === 0;

    const resume = await Resume.create({
      candidate: req.user._id,
      title: title?.trim() || req.file.originalname,
      originalName: req.file.originalname,
      filename: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      isDefault: shouldBeDefault,
    });

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: resume,
    });
  } catch (error) {
    // If multer stored the file but db failed, clean up file
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        // ignore
      }
    }
    next(error);
  }
};

// @desc    Get all resumes for the logged in candidate
// @route   GET /api/resumes
// @access  Private (Candidate)
export const getMyResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ candidate: req.user._id }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.json({
      success: true,
      count: resumes.length,
      data: resumes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set a resume as default
// @route   PUT /api/resumes/:id/default
// @access  Private (Candidate)
export const setDefaultResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      candidate: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    resume.isDefault = true;
    await resume.save();

    res.json({
      success: true,
      message: 'Resume set as default successfully',
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a resume
// @route   DELETE /api/resumes/:id
// @access  Private (Candidate & Admin)
export const deleteResume = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      query.candidate = req.user._id;
    }

    const resume = await Resume.findOne(query);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or unauthorized',
      });
    }

    // Check if resume is actively referenced in any application
    const activeApp = await Application.findOne({ resume: resume._id });
    if (activeApp) {
      // Keep file record or mark inactive if desired, or delete since snapshot exists
      // Application holds snapshot of filename and originalName, so safe to delete Resume record
    }

    // Remove file from disk if it exists
    if (fs.existsSync(resume.filePath)) {
      try {
        fs.unlinkSync(resume.filePath);
      } catch (err) {
        console.warn('Could not unlink resume file:', err.message);
      }
    }

    await resume.deleteOne();

    // If deleted resume was default, set next available resume as default
    if (resume.isDefault) {
      const nextResume = await Resume.findOne({ candidate: resume.candidate }).sort({ createdAt: -1 });
      if (nextResume) {
        nextResume.isDefault = true;
        await nextResume.save();
      }
    }

    res.json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download / view resume file (Protected access)
// @route   GET /api/resumes/:id/download
// @access  Private (Candidate owner, Employer who received it, Admin)
export const getResumeFile = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    // Authorization checks
    let isAuthorized = false;

    // 1. Admin can view any resume
    if (req.user.role === 'admin') {
      isAuthorized = true;
    }

    // 2. Candidate owner can view their own resume
    if (req.user.role === 'candidate' && resume.candidate.toString() === req.user._id.toString()) {
      isAuthorized = true;
    }

    // 3. Employer can view if candidate applied to their job with this resume
    if (req.user.role === 'employer') {
      const application = await Application.findOne({
        resume: resume._id,
        employer: req.user._id,
      });
      if (application) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resume',
      });
    }

    if (!fs.existsSync(resume.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Resume file not found on disk',
      });
    }

    // Set appropriate content disposition and send
    res.setHeader('Content-Type', resume.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(resume.originalName)}"`
    );
    res.sendFile(path.resolve(resume.filePath));
  } catch (error) {
    next(error);
  }
};
