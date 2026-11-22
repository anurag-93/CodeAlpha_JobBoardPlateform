import React from 'react';
import { Search, MapPin, Filter, RotateCcw, DollarSign } from 'lucide-react';

export const FilterSidebar = ({
  filters,
  onFilterChange,
  onClearFilters,
  totalJobs = 0,
}) => {
  const jobTypes = [
    { label: 'Full-time', value: 'full-time' },
    { label: 'Part-time', value: 'part-time' },
    { label: 'Contract', value: 'contract' },
    { label: 'Internship', value: 'internship' },
  ];

  const workplaceModes = [
    { label: 'Remote', value: 'remote' },
    { label: 'Hybrid', value: 'hybrid' },
    { label: 'On-site', value: 'on-site' },
  ];

  const experienceLevels = [
    { label: 'All Levels', value: '' },
    { label: 'Entry Level', value: 'entry' },
    { label: 'Mid Level', value: 'mid' },
    { label: 'Senior Level', value: 'senior' },
    { label: 'Lead / Principal', value: 'lead' },
    { label: 'Executive', value: 'executive' },
  ];

  const handleArrayToggle = (key, value) => {
    const current = filters[key] ? filters[key].split(',').filter(Boolean) : [];
    let updated;
    if (current.includes(value)) {
      updated = current.filter((item) => item !== value);
    } else {
      updated = [...current, value];
    }
    onFilterChange(key, updated.join(','));
  };

  const isChecked = (key, value) => {
    if (!filters[key]) return false;
    return filters[key].split(',').includes(value);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-600" />
          <h3 className="font-bold text-sm text-slate-800">Filter Jobs</h3>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
            {totalJobs}
          </span>
        </div>
        <button
          onClick={onClearFilters}
          className="text-xs text-slate-400 hover:text-brand-600 flex items-center gap-1 transition-colors"
          title="Reset all filters"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Keyword Search */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">Keywords</label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Title, skill, or company..."
            value={filters.keyword || ''}
            onChange={(e) => onFilterChange('keyword', e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">Location</label>
        <div className="relative">
          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="City, state or Worldwide..."
            value={filters.location || ''}
            onChange={(e) => onFilterChange('location', e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>
      </div>

      {/* Workplace Mode */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700">Workplace Mode</label>
        <div className="space-y-1.5">
          {workplaceModes.map((mode) => (
            <label
              key={mode.value}
              className="flex items-center space-x-2.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={isChecked('workplaceMode', mode.value)}
                onChange={() => handleArrayToggle('workplaceMode', mode.value)}
                className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500"
              />
              <span>{mode.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Job Type */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700">Job Type</label>
        <div className="space-y-1.5">
          {jobTypes.map((type) => (
            <label
              key={type.value}
              className="flex items-center space-x-2.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={isChecked('jobType', type.value)}
                onChange={() => handleArrayToggle('jobType', type.value)}
                className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500"
              />
              <span>{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">Experience Level</label>
        <select
          value={filters.experienceLevel || ''}
          onChange={(e) => onFilterChange('experienceLevel', e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        >
          {experienceLevels.map((lvl) => (
            <option key={lvl.value} value={lvl.value}>
              {lvl.label}
            </option>
          ))}
        </select>
      </div>

      {/* Minimum Annual Salary */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">Minimum Annual Salary</label>
        <div className="relative">
          <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="number"
            placeholder="e.g. 100000"
            step="10000"
            value={filters.minSalary || ''}
            onChange={(e) => onFilterChange('minSalary', e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
      </div>
    </div>
  );
};
