import React, { useState, useEffect } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Trash2,
  Star,
  Download,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { resumeAPI } from '../../api/client';

export const ManageResumesPage = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await resumeAPI.getMyResumes();
      if (res.data.success) {
        setResumes(res.data.data);
      }
    } catch (err) {
      setError('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a resume file (PDF, DOC, or DOCX)');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('resume', file);
      formData.append('title', title.trim() || file.name);
      formData.append('isDefault', isDefault || resumes.length === 0);

      const res = await resumeAPI.uploadResume(formData);
      if (res.data.success) {
        setSuccess('Resume uploaded successfully!');
        setFile(null);
        setTitle('');
        setIsDefault(false);
        // Reset file input
        const fileInput = document.getElementById('resumeFileInput');
        if (fileInput) fileInput.value = '';
        fetchResumes();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading resume file');
    } finally {
      setUploading(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await resumeAPI.setDefaultResume(id);
      if (res.data.success) {
        setResumes(
          resumes.map((r) => ({
            ...r,
            isDefault: r._id === id,
          }))
        );
      }
    } catch (err) {
      setError('Failed to update default resume');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this resume?')) return;
    try {
      const res = await resumeAPI.deleteResume(id);
      if (res.data.success) {
        setResumes(resumes.filter((r) => r._id !== id));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete resume');
    }
  };

  const handleDownload = async (resume) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/resumes/${resume._id}/download`, {
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
      a.download = resume.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Could not download resume file: ' + err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Manage Resumes
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload and manage your CVs for 1-click application submissions (PDF, DOC, DOCX up to 5MB)
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Upload New Resume Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-brand-600" />
          <span>Upload a New Resume</span>
        </h2>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">Resume Label</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Resume 2026"
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Resume File *</label>
              <input
                id="resumeFileInput"
                type="file"
                required
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files[0])}
                className="mt-1 w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500"
              />
              <span>Set as primary default resume for quick applications</span>
            </label>

            <button
              type="submit"
              disabled={uploading || !file}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm disabled:opacity-50 transition-colors"
            >
              {uploading ? 'Uploading File...' : 'Upload Resume'}
            </button>
          </div>
        </form>
      </div>

      {/* Uploaded Resumes List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Saved Resumes ({resumes.length})
        </h2>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading your resumes...</div>
        ) : resumes.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No resumes uploaded yet. Upload your first resume above!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {resumes.map((resume) => (
              <div
                key={resume._id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{resume.title}</h4>
                      {resume.isDefault && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Primary Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {resume.originalName} • {(resume.fileSize / 1024 / 1024).toFixed(2)} MB • Uploaded on{' '}
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!resume.isDefault && (
                    <button
                      onClick={() => handleSetDefault(resume._id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1"
                      title="Set as Default"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      <span>Make Default</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDownload(resume)}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                    title="Download resume"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(resume._id)}
                    className="p-2 rounded-lg border border-slate-200 text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Delete resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
