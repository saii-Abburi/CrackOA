import { useState, useEffect } from 'react';
import { Search, Loader2, Database, Code2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance.js';
import { fetchUserProgress, upsertProgress, deleteProgress } from '../api/progress.api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ProblemsTable from '../components/ProblemsTable.jsx';
import SEO from '../components/SEO.jsx';

const PAGE_SIZE = 20;

const DOMAIN_CONFIG = {
  all: {
    label: 'All Problems',
    badge: 'All Domains',
    placeholder: 'Search by title or LeetCode ID...',
    description: 'Browse all problems — DSA, SQL, and more.',
    icon: null,
  },
  dsa: {
    label: 'DSA Problems',
    badge: 'DSA Directory',
    placeholder: 'Search by title or LeetCode ID...',
    description: 'Browse, search, and practice top interviewed Data Structures & Algorithms problems.',
    icon: Code2,
  },
  sql: {
    label: 'SQL Problems',
    badge: 'SQL Directory',
    placeholder: 'Search SQL problems...',
    description: 'Practice SQL queries — SELECT, JOINs, Window Functions, CTEs, and more.',
    icon: Database,
  },
};

export default function ProblemsPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [domain, setDomain] = useState('all'); // 'all' | 'dsa' | 'sql'
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [solvedSet, setSolvedSet] = useState(new Set());

  const config = DOMAIN_CONFIG[domain] || DOMAIN_CONFIG.all;

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
        if (domain !== 'all') params.set('domain', domain);

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
  }, [search, difficulty, domain, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, difficulty, domain]);

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

  // Progress toggle handler
  const handleToggleSolved = async (problemId, shouldSolve) => {
    const idStr = String(problemId);
    // Optimistic update
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
      console.error('Failed to update progress:', err);
      // Revert on error
      setSolvedSet((prev) => {
        const next = new Set(prev);
        if (shouldSolve) next.delete(idStr);
        else next.add(idStr);
        return next;
      });
    }
  };

  // For SQL problems, clicking the problem row navigates to /sql/:id
  const handleProblemClick = (problem) => {
    if (problem.domain === 'sql') {
      navigate(`/sql/${problem.slug || problem._id}`);
    }
    // For DSA, ProblemsTable handles navigation internally
  };

  const seoTitle =
    domain === 'sql'
      ? 'SQL Problems — CodeRank'
      : domain === 'dsa'
      ? 'DSA Problems — CodeRank'
      : 'All Problems — CodeRank';

  const seoDescription =
    domain === 'sql'
      ? 'Practice SQL interview questions covering SELECT, JOINs, Window Functions, CTEs, and more.'
      : 'Browse, search, and practice top interviewed Data Structures & Algorithms problems. Filter by difficulty, company, and acceptance rate.';

  // Columns depend on domain
  const columns =
    domain === 'sql'
      ? ['status', 'title', 'difficulty', 'practice']
      : ['status', 'id', 'title', 'difficulty', 'acceptance', 'companies', 'practice'];

  const DomainIcon = config.icon;

  return (
    <div className="min-h-screen pt-8 pb-16 bg-bg-primary text-text-primary">
      <SEO title={seoTitle} description={seoDescription} />
      <div className="container-xl px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-2xl mb-8">
          <span className="section-badge mb-3 flex items-center gap-1.5 w-fit">
            {DomainIcon && <DomainIcon className="w-3 h-3" />}
            {config.badge}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            {config.label}
          </h1>
          <p className="text-text-secondary text-base">{config.description}</p>
        </div>

        {/* Domain switcher */}
        <div className="flex items-center gap-1 mb-6 bg-bg-card border border-border rounded-xl p-1 w-fit">
          {[
            { id: 'all', label: 'All' },
            { id: 'dsa', label: '⚙️ DSA' },
            { id: 'sql', label: '🗄️ SQL' },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setDomain(d.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                domain === d.id
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder={config.placeholder}
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
            <p className="text-text-muted text-sm">Fetching {config.label.toLowerCase()}...</p>
          </div>
        ) : (
          <ProblemsTable
            problems={problems}
            columns={columns}
            currentPage={pagination.page || currentPage}
            totalPages={pagination.totalPages || 1}
            onPageChange={setCurrentPage}
            solvedSet={solvedSet}
            onToggleSolved={handleToggleSolved}
            isAuthenticated={isAuthenticated}
            emptyMessage={`No ${config.label.toLowerCase()} found matching your query.`}
            totalCount={pagination.total || 0}
            pageSize={PAGE_SIZE}
            domain={domain}
          />
        )}
      </div>
    </div>
  );
}
