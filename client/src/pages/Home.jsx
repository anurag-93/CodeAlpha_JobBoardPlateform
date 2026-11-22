import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight, Sparkles, Users, BriefcaseBusiness } from 'lucide-react';
import { JobCard } from '../components/JobCard';
import { jobAPI } from '../api/client';

export const Home = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await jobAPI.getJobs({ limit: 6, sort: 'newest' });
        if (res.data.success) setFeaturedJobs(res.data.data);
      } catch (err) {
        console.error('Error fetching featured jobs:', err);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.append('keyword', keyword.trim());
    if (location.trim()) params.append('location', location.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  const categories = [
    ['Engineering', 'software'], ['Design', 'design'], ['Product', 'product'],
    ['Data', 'data'], ['Marketing', 'marketing'], ['Remote', 'remote'],
  ];

  return (
    <div className="page-shell">
      <div className="feed-layout">
        <aside className="hidden lg:block">
          <div className="feed-rail">
            <div className="rail-card">
              <h2>Make your next move</h2>
              <p>Find roles that match your skills, your goals, and the way you want to work.</p>
              <Link className="rail-cta" to="/jobs">Explore jobs</Link>
            </div>
            <Link className="rail-link" to="/candidate/dashboard">Candidate dashboard <ArrowRight size={15} /></Link>
            <div className="rail-card">
              <h3>For hiring teams</h3>
              <p>Meet people who are ready to make an impact.</p>
              <Link className="rail-cta" to="/register?role=employer">Post a job</Link>
            </div>
            <p style={{fontSize: 11, color: '#89968f', padding: '0 8px'}}>About · Help · Privacy · Terms</p>
          </div>
        </aside>

        <main className="feed-main">
          <section className="home-intro">
            <div className="home-kicker"><Sparkles size={13} style={{display:'inline', verticalAlign:'-2px'}} /> CareerForge opportunities</div>
            <h1>Your next opportunity<br className="hidden sm:block"/> starts here.</h1>
            <p>Discover teams building what’s next. Find a role that fits your skills and where you want to go.</p>
          </section>
          <form onSubmit={handleSearch} className="feed-search">
            <label className="feed-search-field"><Search size={17} color="#99a69f" /><input aria-label="Search jobs" placeholder="Role, skill, or company" value={keyword} onChange={(e) => setKeyword(e.target.value)} /></label>
            <label className="feed-search-field"><MapPin size={17} color="#99a69f" /><input aria-label="Search location" placeholder="Location or remote" value={location} onChange={(e) => setLocation(e.target.value)} /></label>
            <button type="submit" className="pill-button"><Search size={16} /> Search</button>
          </form>
          <div className="category-strip" aria-label="Popular job categories">
            {categories.map(([label, query]) => <Link key={label} className="category-chip" to={`/jobs?keyword=${encodeURIComponent(query)}`}>{label}</Link>)}
          </div>
          <div className="feed-heading">
            <h2 style={{fontSize: 20, fontWeight: 800}}>Latest opportunities</h2>
            <p>Fresh roles from teams looking for their next teammate.</p>
          </div>
          <div className="featured-feed">
            {loadingJobs ? (
              [1, 2, 3, 4].map((n) => <div key={n} style={{height: 190, borderBottom: '1px solid #252e32', padding: 20}}><div className="animate-pulse h-4 w-1/3 rounded bg-slate-100 mb-4"/><div className="animate-pulse h-3 w-1/2 rounded bg-slate-100 mb-8"/><div className="animate-pulse h-3 w-full rounded bg-slate-100"/></div>)
            ) : featuredJobs.length === 0 ? (
              <div style={{padding: '48px 20px', textAlign: 'center', color: '#99a69f'}}><BriefcaseBusiness size={28} style={{margin: '0 auto 10px'}}/><strong style={{display:'block', color:'#edf2ef'}}>No jobs posted yet</strong><span style={{fontSize:13}}>New opportunities will appear here.</span></div>
            ) : featuredJobs.map((job) => <JobCard key={job._id} job={job} />)}
          </div>
          <Link to="/jobs" className="feed-tab active" style={{display:'block', textDecoration:'none'}}>Show more jobs <ArrowRight size={15} style={{display:'inline', verticalAlign:'-3px', marginLeft:4}} /></Link>
        </main>

        <aside className="feed-rail">
          <div className="rail-card">
            <h2>Explore what’s hiring</h2>
            {['Remote roles', 'Full-time roles', 'Entry level', 'Product & design'].map((item, i) => <Link className="rail-link" key={item} to={['/jobs?workplaceMode=remote','/jobs?jobType=full-time','/jobs?experienceLevel=entry','/jobs?keyword=product'][i]}><span>{item}<small style={{display:'block', marginTop:4}}>Explore open positions</small></span><ArrowRight size={15}/></Link>)}
          </div>
          <div className="rail-card">
            <h3>Build your profile</h3>
            <p>Add your resume and keep track of every application from one place.</p>
            <Link className="rail-cta" to="/register?role=candidate"><Users size={15} style={{marginRight:6}}/> Join as a candidate</Link>
          </div>
          <p style={{fontSize: 11, color: '#89968f', padding: '0 8px'}}>CareerForge · A better way to find your next role.</p>
        </aside>
      </div>
    </div>
  );
};
