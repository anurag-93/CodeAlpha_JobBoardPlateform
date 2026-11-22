import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Eye,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  Archive,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { jobAPI } from '../../api/client';
import { StatusBadge } from '../../components/StatusBadge';

export const ManageJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployerJobs();
  }, [filterStatus]);

  const fetchEmployerJobs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      const res = await jobAPI.getEmployerJobs(params);
      if (res.data.success) {
        setJobs(res.data.data);
      }
    } catch (err) {
      setError('Failed to load job listings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'published' ? 'closed' : 'published';
    try {
      const res = await jobAPI.updateJob(job._id, { status: newStatus });
      if (res.data.success) {
        setJobs(jobs.map((j) => (j._id === job._id ? { ...j, status: newStatus } : j)));
      }
    } catch (err) {
      alert('Failed to update job status');
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job listing and its applications?')) {
      return;
    }
    try {
      const res = await jobAPI.deleteJob(id);
      if (res.data.success) {
        setJobs(jobs.filter((j) => j._id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete job');
    }
  };

  const statuses = [
    { label: 'All Jobs', value: 'all' },
    { label: 'Published', value: 'published' },
    { label: 'Drafts', value: 'draft' },
    { label: 'Closed', value: 'closed' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Manage Job Listings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review status, edit job requirements, and review incoming candidate pipelines
          </p>
        </div>

        <Link
          to="/employer/jobs/new"
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Job</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilterStatus(s.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === s.value
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="py-16 bg-white rounded-3xl border border-slate-200 text-center space-y-3 px-4">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No jobs found in this category</h3>
          <p className="text-xs text-slate-500">Post a new job opening to start receiving candidates.</p>
          <Link
            to="/employer/jobs/new"
            className="inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
          >
            Create Job Listing
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-6">Job Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Applicants</th>
                  <th className="py-3.5 px-4 text-center">Views</th>
                  <th className="py-3.5 px-4">Date Posted</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="font-bold text-slate-900 hover:text-brand-600 transition-colors text-sm block"
                      >
                        {job.title}
                      </Link>
                      <div className="flex items-center gap-2 text-slate-400 mt-1">
                        <span>{job.location}</span>
                        <span>•</span>
                        <span className="capitalize">{job.workplaceMode}</span>
                        <span>•</span>
                        <span className="capitalize">{job.jobType}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={job.status} type="job" />
                    </td>

                    <td className="py-4 px-4 text-center">
                      <Link
                        to={`/employer/jobs/${job._id}/applicants`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{job.applicationsCount || 0}</span>
                      </Link>
                    </td>

                    <td className="py-4 px-4 text-center font-semibold text-slate-500">
                      {job.viewsCount || 0}
                    </td>

                    <td className="py-4 px-4 text-slate-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/employer/jobs/${job._id}/applicants`}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                        >
                          Applicants
                        </Link>

                        <button
                          onClick={() => handleToggleStatus(job)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            job.status === 'published'
                              ? 'border-amber-200 text-amber-600 hover:bg-amber-50'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={job.status === 'published' ? 'Close job' : 'Publish job'}
                        >
                          {job.status === 'published' ? (
                            <Archive className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>

                        <Link
                          to={`/employer/jobs/${job._id}/edit`}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                          title="Edit job"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleDeleteJob(job._id)}
                          className="p-1.5 rounded-lg border border-slate-200 text-rose-500 hover:bg-rose-50"
                          title="Delete job"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
