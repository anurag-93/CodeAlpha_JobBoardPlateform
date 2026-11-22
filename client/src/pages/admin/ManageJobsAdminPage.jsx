import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Trash2,
  ExternalLink,
  Users,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { adminAPI, jobAPI } from '../../api/client';
import { StatusBadge } from '../../components/StatusBadge';

export const ManageJobsAdminPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAdminJobs();
  }, [statusFilter]);

  const fetchAdminJobs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await adminAPI.getJobs(params);
      if (res.data.success) {
        setJobs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAdminJobs();
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      const res = await adminAPI.updateJobStatus(jobId, newStatus);
      if (res.data.success) {
        setJobs(
          jobs.map((j) => (j._id === jobId ? { ...j, status: newStatus } : j))
        );
      }
    } catch (err) {
      alert('Failed to update job status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job listing permanently?')) return;
    try {
      const res = await jobAPI.deleteJob(id);
      if (res.data.success) {
        setJobs(jobs.filter((j) => j._id !== id));
      }
    } catch (err) {
      alert('Failed to delete job');
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
            All Platform Job Listings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global moderation, quality control, and listing status management
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === s.value
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search title, company, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </form>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="py-16 bg-white rounded-3xl border border-slate-200 text-center space-y-3 px-4">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No jobs found</h3>
          <p className="text-xs text-slate-500">No job listings found matching this filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-6">Job Title</th>
                  <th className="py-3.5 px-4">Company</th>
                  <th className="py-3.5 px-4">Employer Account</th>
                  <th className="py-3.5 px-4 text-center">Applicants</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="font-bold text-slate-900 hover:text-brand-600 transition-colors block text-xs"
                      >
                        {job.title}
                      </Link>
                      <span className="text-[11px] text-slate-400 capitalize">
                        {job.location} • {job.workplaceMode}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-800">
                      {job.companyName}
                    </td>

                    <td className="py-4 px-4 text-slate-500">
                      {job.employer?.name || '—'}
                      <span className="block text-[10px] text-slate-400">{job.employer?.email}</span>
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-slate-800">
                      {job.applicationsCount || 0}
                    </td>

                    <td className="py-4 px-4">
                      <select
                        value={job.status}
                        onChange={(e) => handleStatusChange(job._id, e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2 py-1 font-semibold"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/jobs/${job._id}`}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                          title="View listing"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(job._id)}
                          className="p-1.5 rounded-lg border border-slate-200 text-rose-500 hover:bg-rose-50"
                          title="Delete listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
