import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  Award,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  FileText,
  Building2,
} from 'lucide-react';
import { jobAPI } from '../../api/client';
import { StatusBadge } from '../../components/StatusBadge';

export const EmployerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await jobAPI.getEmployerStats();
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Error fetching employer stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Employer Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-brand-300 uppercase tracking-wider">
            Employer Management Suite
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Recruitment Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Monitor applicant pipelines, evaluate resumes, and manage job listing lifecycles.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/employer/jobs/new"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Listing</span>
          </Link>
          <Link
            to="/employer/jobs"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors"
          >
            View All Listings
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Listings</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats?.totalJobs || 0}</div>
          <span className="text-[11px] text-slate-400">Created across company</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Jobs</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats?.activeJobs || 0}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Accepting applications</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Applicants</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats?.totalApplications || 0}</div>
          <span className="text-[11px] text-slate-400">All submissions received</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Shortlisted</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-brand-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {stats?.statusBreakdown?.shortlisted || 0}
          </div>
          <span className="text-[11px] text-brand-700 font-semibold">Qualified for interviews</span>
        </div>
      </div>

      {/* Breakdown Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900">Applicant Pipeline Distribution</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-3 bg-brand-50 rounded-xl border border-brand-200 text-center">
            <span className="text-xs font-bold text-brand-700 block">Submitted</span>
            <span className="text-lg font-extrabold text-brand-900 mt-1 block">
              {stats?.statusBreakdown?.submitted || 0}
            </span>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-center">
            <span className="text-xs font-bold text-amber-700 block">Under Review</span>
            <span className="text-lg font-extrabold text-amber-900 mt-1 block">
              {stats?.statusBreakdown?.reviewing || 0}
            </span>
          </div>

          <div className="p-3 bg-brand-50 rounded-xl border border-brand-200 text-center">
            <span className="text-xs font-bold text-brand-700 block">Shortlisted</span>
            <span className="text-lg font-extrabold text-brand-900 mt-1 block">
              {stats?.statusBreakdown?.shortlisted || 0}
            </span>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-center">
            <span className="text-xs font-bold text-emerald-700 block">Hired</span>
            <span className="text-lg font-extrabold text-emerald-900 mt-1 block">
              {stats?.statusBreakdown?.hired || 0}
            </span>
          </div>

          <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 text-center">
            <span className="text-xs font-bold text-rose-700 block">Declined</span>
            <span className="text-lg font-extrabold text-rose-900 mt-1 block">
              {stats?.statusBreakdown?.rejected || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Incoming Applications */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Recent Candidate Applications
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Latest submissions awaiting recruiter review</p>
          </div>
          <Link
            to="/employer/jobs"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            Manage Jobs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading incoming candidates...</div>
        ) : !stats?.recentApplications || stats.recentApplications.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No applications received yet. Share your job links to attract candidates!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats.recentApplications.map((app) => (
              <div
                key={app._id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{app.candidate?.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Applied for <span className="font-semibold text-slate-800">{app.job?.title}</span> •{' '}
                    {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={app.status} />
                  <Link
                    to={`/employer/jobs/${app.job?._id}/applicants`}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                  >
                    Review Applicant
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
