import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Calendar,
  Clock,
  Building,
  ChevronDown,
  ChevronUp,
  FileText,
  MapPin,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { applicationAPI } from '../../api/client';
import { StatusBadge } from '../../components/StatusBadge';

export const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedAppId, setExpandedAppId] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, [activeTab]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTab !== 'all') {
        params.status = activeTab;
      }
      const res = await applicationAPI.getMyApplications(params);
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { label: 'All Applications', value: 'all' },
    { label: 'Submitted', value: 'submitted' },
    { label: 'Under Review', value: 'reviewing' },
    { label: 'Shortlisted', value: 'shortlisted' },
    { label: 'Hired', value: 'hired' },
    { label: 'Declined', value: 'rejected' },
  ];

  const toggleExpand = (id) => {
    setExpandedAppId(expandedAppId === id ? null : id);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Job Applications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track status progress, feedback notes, and review history
          </p>
        </div>
        <Link
          to="/jobs"
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors shadow-2xs"
        >
          Find More Jobs
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.value
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="py-16 bg-white rounded-3xl border border-slate-200 text-center space-y-3 px-4">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No applications in this category</h3>
          <p className="text-xs text-slate-500">
            {activeTab === 'all'
              ? 'You have not submitted any applications yet.'
              : `You have no applications with status "${activeTab}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const isExpanded = expandedAppId === app._id;
            return (
              <div
                key={app._id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
              >
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">
                        {app.job?.companyName || 'Hiring Company'}
                      </span>
                      <span className="text-xs text-slate-300">•</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {app.job?.location}
                      </span>
                    </div>

                    <Link
                      to={`/jobs/${app.job?._id}`}
                      className="text-lg font-bold text-slate-900 hover:text-brand-600 transition-colors line-clamp-1"
                    >
                      {app.job?.title || 'Job Listing'}
                    </Link>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Applied on {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                      {app.resume && (
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                          <FileText className="w-3.5 h-3.5 text-brand-600" />
                          {app.resume?.originalName || 'Attached Resume'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <StatusBadge status={app.status} />

                    <button
                      onClick={() => toggleExpand(app._id)}
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1 text-xs font-semibold"
                    >
                      <span>Timeline</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Timeline & Details Drawer */}
                {isExpanded && (
                  <div className="bg-slate-50/70 border-t border-slate-100 p-5 sm:p-6 space-y-6 animate-in fade-in duration-150">
                    {/* Status History Timeline */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                        Application Progress Timeline
                      </h4>
                      <div className="space-y-4">
                        {app.statusHistory?.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-3 relative">
                            <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800 capitalize">
                                  {step.status}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(step.changedAt).toLocaleString()}
                                </span>
                              </div>
                              {step.note && (
                                <p className="text-xs text-slate-600 mt-0.5">{step.note}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cover Letter excerpt */}
                    {app.coverLetter && (
                      <div className="pt-4 border-t border-slate-200/60">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                          Your Submitted Note to Employer
                        </h4>
                        <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                          {app.coverLetter}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
