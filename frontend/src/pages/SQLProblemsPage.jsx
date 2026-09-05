import { useState, useEffect } from 'react';
import { Search, Loader2, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance.js';
import { fetchUserProgress, upsertProgress, deleteProgress } from '../api/progress.api.js';
import { useAuth } from '../context/AuthContext.jsx';
import SEO from '../components/SEO.jsx';

const PAGE_SIZE = 20;

const DIFF_STYLES = {
  Easy: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25',
  Medium: 'text-amber-400 bg-amber-400/10 border-amber-400/25',
  Hard: 'text-red-400 bg-red-400/10 border-red-400/25',
};

// SQL topic categories in display order
const SQL_TOPICS = [
  'All',
  'SELECT', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING',
  'JOINs', 'Subqueries', 'CTEs', 'Window Functions',
  'Aggregate Functions', 'CASE', 'Date/Time', 'String Functions', 'Advanced SQL',
];

export default function SQLProblemsPage() {
  const { isAuthenticated } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [topic, setTopic] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [solvedSet, setSolvedSet] = useState(new Set());

  // Fetch SQL problems
  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage,
          limit: PAGE_SIZE,
          domain: 'sql',
        });
        if (difficulty !== 'All') params.set('difficulty', difficulty);
        if (search) params.set('search', search);
        if (topic !== 'All') params.set('topic', topic);

        const res = await api.get(`/problems?${params.toString()}`);
        setProblems(res.data.data.problems || res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      } catch (err) {
        console.error('Failed to fetch SQL problems:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchProblems, 300);
    return () => clearTimeout(timer);
  }, [search, difficulty, topic, currentPage]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, difficulty, topic]);

  // Fetch user progress
  useEffect(() => {
    if (!isAuthenticated) return;
    const loadProgress = async () => {
      try {
        const progress = await fetchUserProgress();
        const solved = new Set(
          (progress || [])
            .filter((p) => p && p.status === 'solved' && p.problem)
            .map((p) => String(typeof p.problem === 'object' ? p.problem?._id : p.problem))
        );
        setSolvedSet(solved);
      } catch (err) {
        console.error('Failed to load user progress:', err);
      }
    };
    loadProgress();
  }, [isAuthenticated]);

  const handleToggleSolved = async (problemId, shouldSolve) => {
    const idStr = String(problemId);
    setSolvedSet((prev) => {
      const next = new Set(prev);
      if (shouldSolve) next.add(idStr);
      else next.delete(idStr);
      return next;
    });
    try {
      if (shouldSolve) {
        await upsertProgress(problemId, { status: 'solved' });
      } else {
        await deleteProgress(problemId);
      }
    } catch (err) {
      console.error('Failed to update SQL problem progress:', err);
      setSolvedSet((prev) => {
        const next = new Set(prev);
        if (shouldSolve) next.delete(idStr);
        else next.add(idStr);
        return next;
      });
    }
  };

  const totalPages = pagination.totalPages || 1;

  return (
    <div className="min-h-screen pt-8 pb-16 bg-bg-primary text-text-primary">
      <SEO
        title="SQL Problems — CodeRank"
        description="Practice SQL interview questions covering SELECT, JOINs, Window Functions, CTEs, aggregations and more. Track your SQL progress and prepare smarter."
      />
      <div className="container-xl px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-2xl mb-8">
          <span className="section-badge mb-3 flex items-center gap-1.5 w-fit">
            <Database className="w-3 h-3" />
            SQL Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            SQL Problems
          </h1>
          <p className="text-text-secondary text-base">
            Practice SQL queries — from basic SELECT statements to advanced window functions and CTEs.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Row 1: Search + Difficulty */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search SQL problems..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-bg-card border border-border rounded-xl text-white text-xs placeholder:text-text-muted focus:outline-none focus:border-accent"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                    difficulty === diff
                      ? 'bg-accent text-white'
                      : 'bg-bg-card border border-border text-text-secondary hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Topic filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {SQL_TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors border ${
                  topic === t
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                    : 'bg-bg-card border-border text-text-muted hover:text-white hover:border-border-subtle'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-3 mb-4 text-xs text-text-muted">
          <span>
            {loading ? '—' : pagination.total || 0} problems
          </span>
          {!loading && topic !== 'All' && (
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              {topic}
            </span>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-accent animate-spin mb-3" />
            <p className="text-text-muted text-sm">Fetching SQL problems...</p>
          </div>
        ) : problems.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <Database className="w-12 h-12 text-text-dim" />
            <p className="text-text-muted text-sm">No SQL problems found.</p>
            {search || difficulty !== 'All' || topic !== 'All' ? (
              <button
                onClick={() => { setSearch(''); setDifficulty('All'); setTopic('All'); }}
                className="text-xs text-accent hover:underline"
              >
                Clear filters
              </button>
            ) : (
              <p className="text-text-dim text-xs">SQL problems are being added. Check back soon!</p>
            )}
          </div>
        ) : (
          <>
            {/* Problem rows */}
            <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
              <div className="hidden sm:grid grid-cols-[2rem_1fr_7rem_8rem_6rem] gap-4 px-5 py-3 border-b border-border text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                <span />
                <span>Title</span>
                <span>Difficulty</span>
                <span>Topic</span>
                <span>Practice</span>
              </div>

              <div className="divide-y divide-border">
                {problems.map((problem, idx) => {
                  const isSolved = solvedSet.has(problem._id);
                  const topicLabel = problem.topics?.[0] || '—';

                  return (
                    <div
                      key={problem._id}
                      className="grid grid-cols-[2rem_1fr] sm:grid-cols-[2rem_1fr_7rem_8rem_6rem] gap-4 px-5 py-3.5 items-center hover:bg-bg-elevated/40 transition-colors group"
                    >
                      {/* Solved toggle */}
                      <button
                        onClick={() => isAuthenticated && handleToggleSolved(problem._id, !isSolved)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSolved
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-border hover:border-emerald-500/50'
                        }`}
                        title={isAuthenticated ? (isSolved ? 'Mark unsolved' : 'Mark solved') : 'Login to track progress'}
                      >
                        {isSolved && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      {/* Title */}
                      <div className="min-w-0">
                        <Link
                          to={`/sql/${problem.slug || problem._id}`}
                          className="text-sm font-medium text-white hover:text-accent transition-colors truncate block group-hover:text-accent"
                        >
                          {problem.title}
                        </Link>
                      </div>

                      {/* Difficulty */}
                      <div className="hidden sm:flex">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${DIFF_STYLES[problem.difficulty] || 'text-zinc-400 border-zinc-600'}`}>
                          {problem.difficulty}
                        </span>
                      </div>

                      {/* Topic */}
                      <div className="hidden sm:flex">
                        <span className="text-xs text-text-muted truncate max-w-[7rem]" title={topicLabel}>
                          {topicLabel}
                        </span>
                      </div>

                      {/* Practice link */}
                      <div className="hidden sm:flex">
                        <Link
                          to={`/sql/${problem.slug || problem._id}`}
                          className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all"
                        >
                          Solve →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-bg-card border border-border text-text-secondary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>
                <span className="text-xs text-text-muted">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-bg-card border border-border text-text-secondary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
