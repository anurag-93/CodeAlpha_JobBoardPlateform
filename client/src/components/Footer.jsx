import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Heart, Github, Linkedin, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                CareerForge
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering engineers, designers, and fast-growing companies to connect seamlessly through high-signal opportunities.
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-800 px-2.5 py-1 rounded-md text-emerald-400 border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                MERN Stack Production Ready
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/jobs" className="hover:text-white transition-colors">
                  Browse All Jobs
                </Link>
              </li>
              <li>
                <Link to="/jobs?workplaceMode=remote" className="hover:text-white transition-colors">
                  Remote Jobs
                </Link>
              </li>
              <li>
                <Link to="/jobs?jobType=full-time" className="hover:text-white transition-colors">
                  Full-Time Opportunities
                </Link>
              </li>
              <li>
                <Link to="/jobs?experienceLevel=entry" className="hover:text-white transition-colors">
                  Entry Level Roles
                </Link>
              </li>
            </ul>
          </div>

          {/* Candidate & Employer */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/candidate/dashboard" className="hover:text-white transition-colors">
                  Candidate Portal
                </Link>
              </li>
              <li>
                <Link to="/candidate/resumes" className="hover:text-white transition-colors">
                  Resume Vault
                </Link>
              </li>
              <li>
                <Link to="/employer/dashboard" className="hover:text-white transition-colors">
                  Employer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/employer/jobs/new" className="hover:text-white transition-colors">
                  Post a Job Listing
                </Link>
              </li>
            </ul>
          </div>

          {/* Demo Accounts */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
              Instant Demo Access
            </h4>
            <div className="text-[11px] text-slate-400 space-y-1.5">
              <p><span className="text-slate-200 font-semibold">Admin:</span> admin@jobboard.com</p>
              <p><span className="text-slate-200 font-semibold">Employer:</span> employer@techcorp.io</p>
              <p><span className="text-slate-200 font-semibold">Candidate:</span> alex.chen@example.com</p>
              <p className="text-[10px] text-brand-400 pt-1">Default password: Password123!</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CareerForge. CodeAlpha Internship Project.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Engineered with React, Node.js, Express & MongoDB
          </p>
        </div>
      </div>
    </footer>
  );
};
