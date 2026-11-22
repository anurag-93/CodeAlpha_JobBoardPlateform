import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users,
  Search,
  FileText,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  ChevronDown,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { applicationAPI, resumeAPI } from '../../api/client';
import { StatusBadge } from '../../components/StatusBadge';

export const JobApplicantsPage = () => {
  const { jobId } = useParams();

  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Status update modal state
  const [selectedApp, setSelectedApp] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Notes state
  const [editingNotesAppId, setEditingNotesAppId] = useState(null);
  const [currentNotes, setCurrentNotes] = useState('');

  useEffect(() => {
    fetchApplicants();
  }, [jobId, filterStatus]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await applicationAPI.getJobApplicants(jobId, params);
      if (res.data.success) {
        setJob(res.data.job);
        setApplicants(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchApplicants();
  };

  const handleOpenStatusModal = (app) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setStatusNote('');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      setUpdatingStatus(true);
      const res = await applicationAPI.updateStatus(selectedApp._id, {
        status: newStatus,
        note: statusNote,
      });

      if (res.data.success) {
        setApplicants(
          applicants.map((a) => (a._id === selectedApp._id ? res.data.data : a))
        );
        setSelectedApp(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async (appId) => {
    try {
      const res = await applicationAPI.updateNotes(appId, { notes: currentNotes });
      if (res.data.success) {
        setApplicants(
          applicants.map((a) =>
            a._id === appId ? { ...a, employerNotes: currentNotes } : a
          )
        );
        setEditingNotesAppId(null);
      }
    } catch (err) {
      alert('Failed to save notes');
    }
  };

  const handleDownloadResume = async (resumeId, filename) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/resumes/${resumeId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Unauthorized or file missing');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'candidate_resume.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Could not download resume: ' + err.message);
    }
  };

  const statuses = [
    { label: 'All Applicants', value: 'all' },
    { label: 'Submitted', value: 'submitted' },
    { label: 'Under Review', value: 'reviewing' },
    { label: 'Shortlisted', value: 'shortlisted' },
    { label: 'Hired', value: 'hired' },
    { label: 'Declined', value: 'rejected' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/employer/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Job Listings
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {job?.title || 'Job Applicants'}
            </h1>
            {job?.status && <StatusBadge status={job.status} type="job" />}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review applicant resumes, update statuses, and log internal recruiter feedback notes
          </p>
        </div>

        <Link
          to={`/jobs/${jobId}`}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
        >
          View Public Post
        </Link>
      </div>

      {/* Toolbar: Search & Status Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => setFilterStatus(s.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterStatus === s.value
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search candidate or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </form>
      </div>

      {/* Applicants List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-white rounded-3xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : applicants.length === 0 ? (
        <div className="py-16 bg-white rounded-3xl border border-slate-200 text-center space-y-3 px-4">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No applicants found</h3>
          <p className="text-xs text-slate-500">
            {filterStatus === 'all'
              ? 'No candidates have applied to this position yet.'
              : `No applicants currently under status "${filterStatus}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applicants.map((app) => {
            const candidate = app.candidate;
            return (
              <div
                key={app._id}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Candidate Profile summary */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white font-extrabold flex items-center justify-center text-base shadow-sm shrink-0">
                      {candidate?.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{candidate?.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {candidate?.headline || 'Candidate'}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2">
                        {candidate?.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {candidate.email}
                          </span>
                        )}
                        {candidate?.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {candidate.phone}
                          </span>
                        )}
                        {candidate?.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {candidate.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                          <Calendar className="w-3 h-3" />
                          Applied {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center gap-3 self-end sm:self-start">
                    <StatusBadge status={app.status} />

                    <button
                      onClick={() => handleOpenStatusModal(app)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                    >
                      Update Status
                    </button>
                  </div>
                </div>

                {/* Candidate Skills Pills */}
                {candidate?.skills?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-400 mr-1">Skills:</span>
                    {candidate.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Cover Letter Box */}
                {app.coverLetter && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Cover Note
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {app.coverLetter}
                    </p>
                  </div>
                )}

                {/* Bottom Row: Resume Download + Employer Notes */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Resume button */}
                  <button
                    onClick={() =>
                      handleDownloadResume(
                        app.resume?._id || app.resume,
                        app.resumeSnapshot?.originalName || 'resume.pdf'
                      )
                    }
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl text-xs font-bold transition-colors w-fit"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Attached Resume ({app.resumeSnapshot?.originalName || 'PDF'})</span>
                  </button>

                  {/* Internal Recruiter Notes */}
                  <div className="flex items-center gap-2 text-xs">
                    {editingNotesAppId === app._id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={currentNotes}
                          onChange={(e) => setCurrentNotes(e.target.value)}
                          placeholder="Add private evaluation notes..."
                          className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                        />
                        <button
                          onClick={() => handleSaveNotes(app._id)}
                          className="px-2.5 py-1.5 bg-slate-900 text-white rounded-lg font-bold text-xs"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingNotesAppId(null)}
                          className="text-xs text-slate-400"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Notes:</span>
                        <span className="text-slate-700 italic">
                          {app.employerNotes || 'No notes added yet.'}
                        </span>
                        <button
                          onClick={() => {
                            setEditingNotesAppId(app._id);
                            setCurrentNotes(app.employerNotes || '');
                          }}
                          className="text-brand-600 font-bold hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Update Status Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 animate-in fade-in duration-150">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">
                Update Candidate Status
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Candidate: <span className="font-bold text-slate-800">{selectedApp.candidate?.name}</span>
              </p>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">Select Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  <option value="submitted">Submitted</option>
                  <option value="reviewing">Under Review</option>
                  <option value="shortlisted">Shortlisted (Invite to Interview)</option>
                  <option value="hired">Hired / Extended Offer</option>
                  <option value="rejected">Rejected / Declined</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Status Note / Feedback (Optional)
                </label>
                <textarea
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Cleared technical interview. Advancing to final loop."
                  className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 disabled:opacity-50"
                >
                  {updatingStatus ? 'Updating...' : 'Save Status Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
