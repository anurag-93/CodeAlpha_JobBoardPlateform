import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Building2,
  ExternalLink,
  ChevronLeft,
  CheckCircle2,
  Users,
  Eye,
  Calendar,
  Share2,
} from 'lucide-react';
import { jobAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ApplyModal } from '../components/ApplyModal';
import { StatusBadge } from '../components/StatusBadge';

export const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationDetails, setApplicationDetails] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const res = await jobAPI.getJobById(id);
      if (res.data.success) {
        setJob(res.data.data);
        setHasApplied(res.data.hasApplied);
        setApplicationDetails(res.data.applicationDetails);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Job listing not found');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) {
      return salary?.isNegotiable ? 'Negotiable' : 'Competitive / Disclosed upon interview';
    }
    const formatNum = (num) => (num >= 1000 ? `$${(num / 1000).toFixed(0)}k` : `$${num}`);
    let str = '';
    if (salary.min && salary.max) str = `${formatNum(salary.min)} - ${formatNum(salary.max)}`;
    else if (salary.min) str = `From ${formatNum(salary.min)}`;
    else if (salary.max) str = `Up to ${formatNum(salary.max)}`;
    const period = salary.period === 'hourly' ? '/hr' : salary.period === 'monthly' ? '/mo' : '/year';
    return `${str} ${period}`;
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-800">Job Not Found</h3>
        <p className="text-xs text-slate-500">{error || 'This listing may have expired or been removed.'}</p>
        <Link
          to="/jobs"
          className="inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Jobs
        </Link>
      </div>
    );
  }

  const isOwner = user && job.employer && (job.employer._id === user._id || job.employer === user._id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to listings
      </button>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={job.companyName}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white font-extrabold flex items-center justify-center text-xl shadow-md">
                {job.companyName?.charAt(0).toUpperCase() || 'C'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">{job.companyName}</span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs font-semibold text-brand-600 capitalize">
                  {job.workplaceMode}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-3 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1 capitalize">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{job.jobType}</span>
                </div>
                <div className="flex items-center gap-1 capitalize font-semibold text-brand-700">
                  <span>{job.experienceLevel} Level</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{job.viewsCount || 0} views</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap sm:flex-col items-end gap-3 shrink-0">
            {isOwner ? (
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <Link
                  to={`/employer/jobs/${job._id}/applicants`}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Users className="w-4 h-4" />
                  <span>View Applicants ({job.applicationsCount || 0})</span>
                </Link>
                <Link
                  to={`/employer/jobs/${job._id}/edit`}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs text-center"
                >
                  Edit Listing
                </Link>
              </div>
            ) : hasApplied ? (
              <div className="p-3.5 bg-brand-50 border border-brand-200 rounded-2xl text-left space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-600" />
                  <span className="text-xs font-bold text-brand-900">Application Submitted</span>
                </div>
                <p className="text-[11px] text-brand-700">
                  Current Status: <StatusBadge status={applicationDetails?.status || 'submitted'} />
                </p>
                <Link
                  to="/candidate/applications"
                  className="text-[11px] font-bold text-brand-700 hover:underline block pt-1"
                >
                  View in Applications →
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  title="Share listing"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                {copiedLink && (
                  <span className="text-[11px] text-emerald-600 font-bold">Link copied!</span>
                )}

                {isAuthenticated ? (
                  user.role === 'candidate' ? (
                    <button
                      onClick={() => setIsApplyModalOpen(true)}
                      className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02]"
                    >
                      Apply for this Position
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      Signed in as {user.role}
                    </span>
                  )
                ) : (
                  <Link
                    to={`/login?redirect=/jobs/${job._id}`}
                    className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02]"
                  >
                    Sign in to Apply
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Salary Highlight Pill */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Compensation
            </span>
            <div className="text-lg font-extrabold text-slate-900">
              {formatSalary(job.salary)}
            </div>
          </div>
          {job.salary?.isNegotiable && (
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
              Salary Negotiable
            </span>
          )}
        </div>
      </div>

      {/* Main Details Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Job Description, Requirements */}
        <div className="lg:col-span-2 space-y-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8">
          {/* About the role */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">Role Overview</h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </section>

          {/* Responsibilities */}
          {job.responsibilities?.length > 0 && (
            <section className="space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Key Responsibilities</h2>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                {job.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-2 shrink-0"></span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Requirements */}
          {job.requirements?.length > 0 && (
            <section className="space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Qualifications & Requirements</h2>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0"></span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Skills Required */}
          {job.skillsRequired?.length > 0 && (
            <section className="space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Required Skills & Tools</h2>
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar: Company Card & Meta */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">About the Hiring Company</h3>
            <div className="flex items-center gap-3">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={job.companyName}
                  className="w-12 h-12 rounded-xl object-cover border"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center">
                  {job.companyName?.charAt(0)}
                </div>
              )}
              <div>
                <h4 className="font-bold text-sm text-slate-900">{job.companyName}</h4>
                {job.companyWebsite && (
                  <a
                    href={job.companyWebsite}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-brand-600 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    Visit Website <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {job.employer?.companyDescription && (
              <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                {job.employer.companyDescription}
              </p>
            )}
          </div>

          {/* Safe job guidelines */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200/80 p-5 text-xs text-slate-500 space-y-2">
            <span className="font-bold text-slate-700 block">Job Board Guarantee</span>
            <p className="leading-relaxed">
              Every job listing on CareerForge is verified. We never share your personal resume or phone number publicly.
            </p>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <ApplyModal
        job={job}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={(appData) => {
          setHasApplied(true);
          setApplicationDetails(appData);
        }}
      />
    </div>
  );
};
