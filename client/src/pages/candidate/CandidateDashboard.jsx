import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Clock,
  Award,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Building,
  UploadCloud,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { applicationAPI, resumeAPI } from '../../api/client';
import { StatusBadge } from '../../components/StatusBadge';

export const CandidateDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [appRes, resRes] = await Promise.all([
        applicationAPI.getMyApplications({ limit: 5 }),
        resumeAPI.getMyResumes(),
      ]);

      if (appRes.data.success) setApplications(appRes.data.data);
      if (resRes.data.success) setResumes(resRes.data.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusCounts = {
    total: applications.length,
    reviewing: applications.filter((a) => a.status === 'reviewing').length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    hired: applications.filter((a) => a.status === 'hired').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-brand-300 uppercase tracking-wider">
            Candidate Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            {user?.headline || 'Explore high-signal roles matching your tech stack.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/jobs"
            className="px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs shadow-md transition-colors"
          >
            Explore Jobs
          </Link>
          <Link
            to="/candidate/resumes"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors"
          >
            Manage Resumes
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Applied</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{applications.length}</div>
          <span className="text-[11px] text-slate-400">Applications submitted</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Under Review</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{statusCounts.reviewing}</div>
          <span className="text-[11px] text-slate-400">Being evaluated</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Shortlisted</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-brand-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{statusCounts.shortlisted}</div>
          <span className="text-[11px] text-brand-700 font-semibold">Ready for interview</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Hired / Offers</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{statusCounts.hired}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Successful hires</span>
        </div>
      </div>

      {/* Main Grid: Recent Applications & Resume Vault */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Applications */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Recent Applications
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Track status updates and employer feedback
              </p>
            </div>
            <Link
              to="/candidate/applications"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              All Applications <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">You haven't submitted any job applications yet.</p>
              <Link
                to="/jobs"
                className="inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
              >
                Find & Apply for Jobs
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {applications.map((app) => (
                <div key={app._id} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {app.job?.title || 'Job Listing'}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{app.job?.companyName}</span>
                      <span>•</span>
                      <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={app.status} />
                    <Link
                      to={`/jobs/${app.job?._id}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumes Sidebar Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Your Resumes
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Active files used for 1-click apply</p>
            </div>
            <Link
              to="/candidate/resumes"
              className="text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              Manage
            </Link>
          </div>

          {resumes.length === 0 ? (
            <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
              <UploadCloud className="w-8 h-8 text-brand-500 mx-auto" />
              <p className="text-xs text-slate-600">No resumes uploaded yet.</p>
              <Link
                to="/candidate/resumes"
                className="inline-block px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Upload Resume
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((r) => (
                <div
                  key={r._id}
                  className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/50 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{r.title}</h5>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {(r.fileSize / 1024 / 1024).toFixed(2)} MB • {r.originalName}
                      </span>
                    </div>
                  </div>
                  {r.isDefault && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Default
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
