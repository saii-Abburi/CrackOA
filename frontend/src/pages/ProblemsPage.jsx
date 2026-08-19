import { useState, useEffect } from 'react';
import {
  Search, Loader2
} from 'lucide-react';
import api from '../api/axiosInstance.js';
import { fetchUserProgress, upsertProgress, deleteProgress } from '../api/progress.api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ProblemsTable from '../components/ProblemsTable.jsx';
import SEO from '../components/SEO.jsx';

const PAGE_SIZE = 20;

export default function ProblemsPage() {
  const { isAuthenticated } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [solvedSet, setSolvedSet] = useState(new Set());

  // Fetch problems with server-side pagination
  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage,
          limit: PAGE_SIZE,
        });
        if (difficulty !== 'All') params.set('difficulty', difficulty);
        if (search) params.set('search', search);

        const res = await api.get(`/problems?${params.toString()}`);
        setProblems(res.data.data.problems || res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      } catch (err) {
        console.error('Failed to fetch problems:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchProblems, 300);
    return () => clearTimeout(timer);
  }, [search, difficulty, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, difficulty]);

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

  return (
    <div className="min-h-screen pt-8 pb-16 bg-bg-primary text-text-primary">
      <SEO 
        title="All DSA Problems - CodeRank"
        description="Browse, search, and practice top interviewed Data Structures and Algorithms problems. Filter by difficulty, company, and acceptance rate."
      />
      <div className="container-xl px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-2xl mb-8">
          <span className="section-badge mb-3">DSA Directory</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            All DSA Problems
          </h1>
          <p className="text-text-secondary text-base">
            Browse, search, and practice top interviewed Data Structures & Algorithms problems.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by title or LeetCode ID..."
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

        {/* Table */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-accent animate-spin mb-3" />
            <p className="text-text-muted text-sm">Fetching DSA problems...</p>
          </div>
        ) : (
          <ProblemsTable
            problems={problems}
            columns={['status', 'id', 'title', 'difficulty', 'acceptance', 'companies', 'practice']}
            currentPage={pagination.page || currentPage}
            totalPages={pagination.totalPages || 1}
            onPageChange={setCurrentPage}
            solvedSet={solvedSet}
            onToggleSolved={handleToggleSolved}
            isAuthenticated={isAuthenticated}
            emptyMessage="No problems found matching your query."
            totalCount={pagination.total || 0}
            pageSize={PAGE_SIZE}
          />
        )}
      </div>
    </div>
  );
}
