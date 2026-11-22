import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, Frown, ArrowRight, Search } from 'lucide-react';
import { jobAPI } from '../api/client';
import { JobCard } from '../components/JobCard';
import { FilterSidebar } from '../components/FilterSidebar';
import { Pagination } from '../components/Pagination';

export const JobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const currentFilters = {
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
    jobType: searchParams.get('jobType') || '',
    workplaceMode: searchParams.get('workplaceMode') || '',
    experienceLevel: searchParams.get('experienceLevel') || '',
    minSalary: searchParams.get('minSalary') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page'), 10) || 1,
  };

  useEffect(() => { fetchJobs(); }, [searchParams]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {};
      for (const [key, val] of searchParams.entries()) if (val) params[key] = val;
      params.limit = 9;
      const res = await jobAPI.getJobs(params);
      if (res.data.success) {
        setJobs(res.data.data);
        setTotalJobs(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const updated = new URLSearchParams(searchParams);
    if (value) updated.set(key, value);
    else updated.delete(key);
    if (key !== 'page') updated.set('page', '1');
    setSearchParams(updated);
  };
  const handleClearFilters = () => setSearchParams(new URLSearchParams());
  const handlePageChange = (page) => {
    handleFilterChange('page', page.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page-shell">
      <div className="feed-layout">
        <aside className="hidden lg:block">
          <div className="feed-rail">
            <section className="jobs-side-panel">
              <h2>Refine your search</h2>
              <FilterSidebar filters={currentFilters} onFilterChange={handleFilterChange} onClearFilters={handleClearFilters} totalJobs={totalJobs} />
            </section>
          </div>
        </aside>

        <main className="feed-main">
          <header className="feed-heading">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 style={{fontSize: 22, fontWeight: 800}}>Explore jobs</h1>
                <p>{totalJobs} open {totalJobs === 1 ? 'role' : 'roles'} matching your search</p>
              </div>
              <button onClick={() => setMobileFilterOpen(true)} className="lg:hidden inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700">
                <SlidersHorizontal size={15} /> Filters
              </button>
            </div>
          </header>
          <div className="feed-tabs"><button className="feed-tab active" type="button">For you</button><button className="feed-tab" type="button" onClick={() => handleFilterChange('sort', 'newest')}>Latest</button></div>
          <div className="jobs-toolbar">
            <span className="inline-flex items-center gap-2 text-xs text-slate-500"><Search size={14}/>{currentFilters.keyword || currentFilters.location ? 'Filtered results' : 'All opportunities'}</span>
            <label className="inline-flex items-center gap-2">Sort by
              <select aria-label="Sort jobs" value={currentFilters.sort} onChange={(e) => handleFilterChange('sort', e.target.value)}>
                <option value="newest">Newest</option><option value="oldest">Oldest</option><option value="salary-high">Highest salary</option><option value="salary-low">Lowest salary</option><option value="views">Most viewed</option>
              </select>
            </label>
          </div>

          {loading ? (
            <div>{[1, 2, 3, 4].map((i) => <div key={i} style={{height: 185, borderBottom: '1px solid #252e32', padding: 20}}><div className="animate-pulse h-4 w-1/3 rounded bg-slate-100 mb-4"/><div className="animate-pulse h-3 w-1/2 rounded bg-slate-100 mb-8"/><div className="animate-pulse h-3 w-full rounded bg-slate-100"/></div>)}</div>
          ) : jobs.length === 0 ? (
            <div style={{padding: '56px 20px', textAlign: 'center'}}>
              <Frown size={30} color="#89968f" style={{margin: '0 auto 12px'}} />
              <h2 style={{fontSize: 18, fontWeight: 750, margin: '0 0 6px'}}>No matching jobs found</h2>
              <p style={{fontSize: 13, color: '#99a69f', maxWidth: 340, margin: '0 auto 16px'}}>Try a broader search or clear your filters to see more roles.</p>
              <button onClick={handleClearFilters} className="pill-button">Clear filters</button>
            </div>
          ) : (
            <>
              <div className="jobs-feed-grid">{jobs.map((job) => <JobCard key={job._id} job={job} />)}</div>
              <div style={{padding: 16}}><Pagination currentPage={currentFilters.page} totalPages={totalPages} onPageChange={handlePageChange} /></div>
            </>
          )}

          {mobileFilterOpen && <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/40 flex justify-end" role="dialog" aria-modal="true" aria-label="Job filters">
            <div className="w-full max-w-sm bg-white h-full p-5 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100"><strong>Filters</strong><button onClick={() => setMobileFilterOpen(false)} className="rounded-full px-3 py-2 text-xs font-bold hover:bg-slate-100">Close</button></div>
              <FilterSidebar filters={currentFilters} onFilterChange={handleFilterChange} onClearFilters={handleClearFilters} totalJobs={totalJobs} />
              <button onClick={() => setMobileFilterOpen(false)} className="pill-button w-full mt-5">Show {totalJobs} jobs</button>
            </div>
          </div>}
        </main>

        <aside className="feed-rail">
          <section className="rail-card"><h2>Popular searches</h2>
            {[['Remote engineering', '/jobs?keyword=engineering&workplaceMode=remote'], ['Product design', '/jobs?keyword=design'], ['Early career', '/jobs?experienceLevel=entry']].map(([label, url]) => <Link key={label} className="rail-link" to={url}><span>{label}<small style={{display:'block', marginTop:4}}>Browse matching roles</small></span><ArrowRight size={15}/></Link>)}
          </section>
          <section className="rail-card"><h3>Keep your search moving</h3><p>Upload a resume and track every application from your candidate dashboard.</p><Link to="/candidate/resumes" className="rail-cta">Manage my resume</Link></section>
        </aside>
      </div>
    </div>
  );
};
