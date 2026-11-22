import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a job title'],
      trim: true,
      maxlength: [150, 'Job title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a job description'],
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: {
      type: String,
      required: [true, 'Please provide the hiring company name'],
      trim: true,
    },
    companyWebsite: {
      type: String,
      trim: true,
      default: '',
    },
    companyLogo: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      required: [true, 'Please provide a location (e.g. San Francisco, CA or Worldwide)'],
      trim: true,
    },
    workplaceMode: {
      type: String,
      enum: {
        values: ['remote', 'on-site', 'hybrid'],
        message: 'Workplace mode must be remote, on-site, or hybrid',
      },
      default: 'remote',
    },
    jobType: {
      type: String,
      enum: {
        values: ['full-time', 'part-time', 'contract', 'internship', 'temporary'],
        message: 'Job type must be full-time, part-time, contract, internship, or temporary',
      },
      default: 'full-time',
    },
    experienceLevel: {
      type: String,
      enum: {
        values: ['entry', 'mid', 'senior', 'lead', 'executive'],
        message: 'Experience level must be entry, mid, senior, lead, or executive',
      },
      default: 'mid',
    },
    salary: {
      min: {
        type: Number,
        default: 0,
        min: [0, 'Salary min cannot be negative'],
      },
      max: {
        type: Number,
        default: 0,
        min: [0, 'Salary max cannot be negative'],
      },
      currency: {
        type: String,
        default: 'USD',
        trim: true,
      },
      period: {
        type: String,
        enum: ['yearly', 'monthly', 'hourly'],
        default: 'yearly',
      },
      isNegotiable: {
        type: Boolean,
        default: false,
      },
    },
    requirements: {
      type: [String],
      default: [],
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    skillsRequired: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'published',
    },
    applicationDeadline: {
      type: Date,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ employer: 1 });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ jobType: 1, workplaceMode: 1, experienceLevel: 1 });
jobSchema.index({
  title: 'text',
  description: 'text',
  companyName: 'text',
  skillsRequired: 'text',
  location: 'text',
});

const Job = mongoose.model('Job', jobSchema);
export default Job;
