import React from 'react';
import {
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  Award,
  FileCheck,
  Archive,
  FileEdit,
} from 'lucide-react';

export const StatusBadge = ({ status, type = 'application' }) => {
  const norm = (status || '').toLowerCase();

  if (type === 'job') {
    switch (norm) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Published
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Archive className="w-3.5 h-3.5" /> Closed
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <FileEdit className="w-3.5 h-3.5" /> Draft
          </span>
        );
    }
  }

  // Application statuses
  switch (norm) {
    case 'submitted':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
          <Clock className="w-3.5 h-3.5" /> Submitted
        </span>
      );
    case 'reviewing':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Eye className="w-3.5 h-3.5" /> Under Review
        </span>
      );
    case 'shortlisted':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-brand-700 border border-brand-200">
          <Award className="w-3.5 h-3.5" /> Shortlisted
        </span>
      );
    case 'hired':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <FileCheck className="w-3.5 h-3.5" /> Hired
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5" /> Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          {status}
        </span>
      );
  }
};
