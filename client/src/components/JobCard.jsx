import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Clock, ArrowUpRight } from 'lucide-react';

export const JobCard = ({ job }) => {
  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return salary?.isNegotiable ? 'Negotiable' : 'Salary not disclosed';
    const formatNum = (num) => num >= 1000 ? `$${(num / 1000).toFixed(0)}k` : `$${num}`;
    let str = '';
    if (salary.min && salary.max) str = `${formatNum(salary.min)} – ${formatNum(salary.max)}`;
    else if (salary.min) str = `From ${formatNum(salary.min)}`;
    else if (salary.max) str = `Up to ${formatNum(salary.max)}`;
    const period = salary.period === 'hourly' ? '/hr' : salary.period === 'monthly' ? '/mo' : '/yr';
    return `${str}${period}`;
  };

  const formatTimeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 3600) return 'Just now';
    const hours = Math.floor(diff / 3600);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return days === 1 ? 'Yesterday' : `${days}d ago`;
  };

  return (
    <article className="feed-job-card">
      <div className="flex items-start gap-3">
        {job.companyLogo ? <img src={job.companyLogo} alt={`${job.companyName} logo`} className="w-11 h-11 rounded-xl object-cover border border-slate-100" /> : <div className="w-11 h-11 shrink-0 rounded-xl bg-brand-50 text-brand-700 font-extrabold flex items-center justify-center">{job.companyName?.charAt(0).toUpperCase() || 'C'}</div>}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="job-company truncate">{job.companyName}</p>
              <Link to={`/jobs/${job._id}`}><h3 className="text-base font-bold text-slate-900 hover:text-brand-700 transition-colors truncate">{job.title}</h3></Link>
            </div>
            <Link aria-label={`View ${job.title}`} to={`/jobs/${job._id}`} className="rounded-full p-2 text-brand-700 hover:bg-brand-50"><ArrowUpRight size={18}/></Link>
          </div>
          <div className="job-metadata flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs">
            <span className="inline-flex items-center gap-1"><MapPin size={14}/>{job.location}</span>
            <span className="inline-flex items-center gap-1"><Briefcase size={14}/><span className="capitalize">{job.jobType}</span></span>
            <span className="font-semibold text-slate-800">{formatSalary(job.salary)}</span>
            {job.workplaceMode && <span className="capitalize">{job.workplaceMode}</span>}
          </div>
          <p className="job-description mt-3 line-clamp-3">{job.description}</p>
          {job.skillsRequired?.length > 0 && <div className="job-skills flex flex-wrap gap-1.5 mt-3">{job.skillsRequired.slice(0, 4).map((skill, index) => <span key={index} className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] text-slate-600">{skill}</span>)}{job.skillsRequired.length > 4 && <span className="px-1.5 py-1 text-[11px] text-slate-500">+{job.skillsRequired.length - 4}</span>}</div>}
          <div className="job-actions border-t border-slate-100 mt-4 pt-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500"><Clock size={13}/>{formatTimeAgo(job.createdAt)}</span>
            <Link to={`/jobs/${job._id}`} className="text-xs font-bold text-brand-700 hover:text-brand-700">View role <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </div>
    </article>
  );
};
