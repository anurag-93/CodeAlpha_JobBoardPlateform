import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    // Snapshot of the resume at application time
    resumeSnapshot: {
      originalName: String,
      filename: String,
      filePath: String,
      mimeType: String,
      fileSize: Number,
    },
    coverLetter: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['submitted', 'reviewing', 'shortlisted', 'rejected', 'hired'],
        message: 'Status must be submitted, reviewing, shortlisted, rejected, or hired',
      },
      default: 'submitted',
      index: true,
    },
    employerNotes: {
      type: String,
      trim: true,
      default: '',
    },
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        note: {
          type: String,
          default: '',
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications for the same job by the same candidate
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });
applicationSchema.index({ employer: 1, status: 1 });
applicationSchema.index({ candidate: 1, createdAt: -1 });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
