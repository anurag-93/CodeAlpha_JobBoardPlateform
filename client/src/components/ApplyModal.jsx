import React, { useState, useEffect } from 'react';
import { X, UploadCloud, CheckCircle2, AlertCircle, FileText, Plus } from 'lucide-react';
import { resumeAPI, applicationAPI } from '../api/client';
import { Link } from 'react-router-dom';

export const ApplyModal = ({ job, isOpen, onClose, onSuccess }) => {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // New resume inline upload state
  const [newResumeFile, setNewResumeFile] = useState(null);
  const [newResumeTitle, setNewResumeTitle] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadResumes();
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  const loadResumes = async () => {
    try {
      const res = await resumeAPI.getMyResumes();
      if (res.data.success) {
        setResumes(res.data.data);
        const defaultResume = res.data.data.find((r) => r.isDefault) || res.data.data[0];
        if (defaultResume) {
          setSelectedResumeId(defaultResume._id);
        } else {
          setShowUploadForm(true);
        }
      }
    } catch (err) {
      console.error('Error fetching resumes:', err);
    }
  };

  const handleUploadNewResume = async (e) => {
    e.preventDefault();
    if (!newResumeFile) {
      setError('Please select a file (.pdf, .doc, .docx)');
      return;
    }
    try {
      setUploadingResume(true);
      setError('');
      const formData = new FormData();
      formData.append('resume', newResumeFile);
      formData.append('title', newResumeTitle || newResumeFile.name);
      formData.append('isDefault', resumes.length === 0);

      const res = await resumeAPI.uploadResume(formData);
      if (res.data.success) {
        const uploaded = res.data.data;
        setResumes([uploaded, ...resumes]);
        setSelectedResumeId(uploaded._id);
        setShowUploadForm(false);
        setNewResumeFile(null);
        setNewResumeTitle('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resume file.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!selectedResumeId) {
      setError('Please select or upload a resume to continue.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await applicationAPI.applyToJob({
        jobId: job._id,
        resumeId: selectedResumeId,
        coverLetter,
      });

      if (res.data.success) {
        setSuccess(true);
        if (onSuccess) onSuccess(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Apply for {job?.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{job?.companyName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-extrabold text-slate-900">
                Application Submitted!
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                The hiring team at {job?.companyName} has received your resume and application. You will receive updates as the team reviews your candidacy.
              </p>
              <div className="pt-4 flex items-center justify-center gap-3">
                <Link
                  to="/candidate/applications"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 transition-colors"
                >
                  View My Applications
                </Link>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitApplication} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Resume Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Select Resume <span className="text-rose-500">*</span>
                  </label>
                  {!showUploadForm && (
                    <button
                      type="button"
                      onClick={() => setShowUploadForm(true)}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Upload New
                    </button>
                  )}
                </div>

                {showUploadForm ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Upload New Resume File</span>
                      {resumes.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowUploadForm(false)}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Resume Label (e.g. FullStack_2026)"
                      value={newResumeTitle}
                      onChange={(e) => setNewResumeTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setNewResumeFile(e.target.files[0])}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                    />
                    <button
                      type="button"
                      onClick={handleUploadNewResume}
                      disabled={uploadingResume || !newResumeFile}
                      className="w-full py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
                    >
                      {uploadingResume ? 'Uploading...' : 'Save & Select Resume'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {resumes.map((r) => (
                      <label
                        key={r._id}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          selectedResumeId === r._id
                            ? 'border-brand-500 bg-brand-50/50 shadow-sm'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="resumeSelect"
                            value={r._id}
                            checked={selectedResumeId === r._id}
                            onChange={() => setSelectedResumeId(r._id)}
                            className="text-brand-600 focus:ring-brand-500"
                          />
                          <div>
                            <p className="font-bold text-slate-800">{r.title}</p>
                            <p className="text-[10px] text-slate-500">{r.originalName}</p>
                          </div>
                        </div>
                        {r.isDefault && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            Default
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Cover Letter */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Cover Note or Message to Employer (Optional)
                </label>
                <textarea
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Introduce yourself, your key accomplishments, or why you are excited about this position..."
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedResumeId}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 shadow-sm disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
