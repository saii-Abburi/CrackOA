import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Loader2, Search, Code2, AlertCircle, CheckCircle2, ChevronRight
} from 'lucide-react';
import api from '../api/axiosInstance.js';
import { fetchUserProgress, upsertProgress, deleteProgress } from '../api/progress.api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ProblemsTable from '../components/ProblemsTable.jsx';
import SEO from '../components/SEO.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';

const PAGE_SIZE = 20;

export default function CompanyDetailPage() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const [company, setCompany] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [solvedSet, setSolvedSet] = useState(new Set());

  // Fetch company + problems
  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [compRes, probRes] = await Promise.all([
          api.get(`/companies/${slug}`),
          api.get(`/companies/${slug}/problems`),
        ]);
        setCompany(compRes.data.data);
        setProblems(probRes.data.data || []);
      } catch (err) {
        console.error('Failed to load company problems:', err);
        setError(err.message || 'Failed to load company sheet.');
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyData();
  }, [slug]);

  // Fetch user progress
  useEffect(() => {
    if (!isAuthenticated) return;
    const loadProgress = async () => {
      try {
        const progress = await fetchUserProgress();
        const solved = new Set(
          progress
            .filter((p) => p.status === 'solved')
            .map((p) => (typeof p.problem === 'object' ? p.problem._id : p.problem))
        );
        setSolvedSet(solved);
      } catch {
        // Not logged in or error — ignore
      }
    };
    loadProgress();
  }, [isAuthenticated]);

  // Filter problems
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        String(p.leetcodeId).includes(search);
      const matchDiff = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
      return matchSearch && matchDiff;
    });
  }, [problems, search, difficultyFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, difficultyFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / PAGE_SIZE));
  const paginatedProblems = filteredProblems.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Progress toggle handler
  const handleToggleSolved = async (problemId, shouldSolve) => {
    // Optimistic update
    setSolvedSet((prev) => {
      const next = new Set(prev);
      if (shouldSolve) next.add(problemId);
      else next.delete(problemId);
      return next;
    });

    try {
      if (shouldSolve) {
        await upsertProgress(problemId, { status: 'solved' });
      } else {
        await deleteProgress(problemId);
      }
    } catch {
      // Revert on error
      setSolvedSet((prev) => {
        const next = new Set(prev);
        if (shouldSolve) next.delete(problemId);
        else next.add(problemId);
        return next;
      });
    }
  };

  // Stats calculations
  const solvedCount = problems.filter((p) => solvedSet.has(p._id)).length;
  const progressPct = problems.length > 0 ? Math.round((solvedCount / problems.length) * 100) : 0;
  
  const difficultyStats = useMemo(() => {
    return problems.reduce((acc, curr) => {
      acc[curr.difficulty] = (acc[curr.difficulty] || 0) + 1;
      return acc;
    }, { Easy: 0, Medium: 0, Hard: 0 });
  }, [problems]);

  // SEO & Structured Data
  const breadcrumbItems = [
    { name: 'Companies', url: '/companies' },
    { name: company ? company.name : 'Loading...', url: '' }
  ];

  const structuredData = company ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Companies",
        "item": `${typeof window !== 'undefined' ? window.location.origin : ''}/companies`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": `${company.name} DSA Sheet`
      }
    ]
  } : null;

  return (
    <div className="min-h-screen pt-8 pb-16 bg-bg-primary text-text-primary">
      {company && (
        <SEO 
          title={`${company.name} DSA Sheet 2026 - Coding Interview Questions`}
          description={company.description || `Practice frequently asked ${company.name} coding interview questions with difficulty, frequency, LeetCode links, and progress tracking. Prepare for ${company.name} technical interviews with a structured DSA sheet.`}
          structuredData={structuredData}
        />
      )}
      
      <div className="container-xl px-4 sm:px-6">
        {/* Breadcrumbs & Back */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Breadcrumbs items={breadcrumbItems} />
          <Link
            to="/companies"
            className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-accent animate-spin mb-3" />
            <p className="text-text-muted text-sm">Loading company DSA sheet...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center bg-bg-card border border-red-500/30 rounded-2xl p-8 max-w-md mx-auto">
            <p className="text-red-400 font-bold mb-2">Company Sheet Not Found</p>
            <p className="text-text-muted text-xs mb-6">{error}</p>
            <Link to="/companies" className="btn-primary text-xs py-2 px-4">
              Return to Directory
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Banner Header */}
            <div className="bg-bg-card border border-border rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center font-black text-accent text-2xl shrink-0">
                  {company?.name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="section-badge">Company Sheet</span>
                    <span className="text-xs text-accent font-semibold px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
                      Verified Questions
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {company?.name} DSA Sheet
                  </h1>
                  <p className="text-text-secondary text-xs sm:text-sm mt-1 max-w-2xl">
                    {company?.description || `Top interviewed data structures and algorithms questions asked at ${company?.name}. Start preparing for your technical interviews with this curated list.`}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto">
                <div className="bg-bg-elevated border border-border rounded-2xl px-6 py-4 text-center flex-1 sm:flex-none">
                  <p className="text-3xl font-black text-accent">{problems.length}</p>
                  <p className="text-text-muted text-xs font-semibold">Total Problems</p>
                </div>
                {isAuthenticated && (
                  <div className="bg-bg-elevated border border-emerald-500/20 rounded-2xl px-6 py-4 text-center flex-1 sm:flex-none">
                    <p className="text-3xl font-black text-emerald-400">{solvedCount}</p>
                    <p className="text-text-muted text-xs font-semibold">Solved ({progressPct}%)</p>
                  </div>
                )}
              </div>
            </div>

            {/* SEO Textual Content Sections */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* About Section */}
              <div className="bg-bg-card border border-border rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-3">About this Sheet</h2>
                <p className="text-sm text-text-secondary leading-relaxed mb-4">
                  This curated {company?.name} DSA sheet contains the most frequently asked coding interview questions during their technical rounds. The problems are ranked by frequency and sourced directly from recent interview experiences. 
                </p>
                <h3 className="text-sm font-bold text-white mb-2">How to use this sheet:</h3>
                <ul className="text-sm text-text-secondary space-y-2 list-disc list-inside">
                  <li>Sort by <strong>Frequency</strong> to tackle the most common patterns first.</li>
                  <li>Use the <strong>Difficulty</strong> filters to gradually step up your prep.</li>
                  <li>Log in to track your <strong>Progress</strong> and maintain your daily solving streak.</li>
                </ul>
              </div>

              {/* Difficulty Distribution */}
              <div className="bg-bg-card border border-border rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">Difficulty Distribution</h2>
                <div className="space-y-4">
                  {/* Easy */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-emerald-400 font-semibold">Easy</span>
                      <span className="text-text-muted">{difficultyStats.Easy} problems</span>
                    </div>
                    <div className="w-full bg-bg-elevated rounded-full h-1.5">
                      <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${problems.length ? (difficultyStats.Easy / problems.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                  {/* Medium */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-amber-400 font-semibold">Medium</span>
                      <span className="text-text-muted">{difficultyStats.Medium} problems</span>
                    </div>
                    <div className="w-full bg-bg-elevated rounded-full h-1.5">
                      <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${problems.length ? (difficultyStats.Medium / problems.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                  {/* Hard */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-red-400 font-semibold">Hard</span>
                      <span className="text-text-muted">{difficultyStats.Hard} problems</span>
                    </div>
                    <div className="w-full bg-bg-elevated rounded-full h-1.5">
                      <div className="bg-red-400 h-1.5 rounded-full" style={{ width: `${problems.length ? (difficultyStats.Hard / problems.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar (when logged in) */}
            {isAuthenticated && problems.length > 0 && (
              <div className="bg-bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white text-sm font-semibold">Your Progress</p>
                  <span className="text-accent font-bold text-sm">{progressPct}%</span>
                </div>
                <div className="w-full bg-bg-elevated rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}

            <h2 className="text-xl font-bold text-white pt-4 border-t border-border">
              {company?.name} Interview Problems
            </h2>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search problem by title or LeetCode ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-card border border-border rounded-xl text-white text-xs placeholder:text-text-muted focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 ${difficultyFilter === diff
                        ? 'bg-accent text-white'
                        : 'bg-bg-card border border-border text-text-secondary hover:text-white'
                      }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Problems Table */}
            <ProblemsTable
              problems={paginatedProblems}
              columns={['status', 'title', 'practice', 'difficulty', 'acceptance', 'frequency']}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              solvedSet={solvedSet}
              onToggleSolved={handleToggleSolved}
              isAuthenticated={isAuthenticated}
              emptyMessage="No problems match your current search and difficulty filters."
              totalCount={filteredProblems.length}
              pageSize={PAGE_SIZE}
            />
          </div>
        )}
      </div>
    </div>
  );
}
