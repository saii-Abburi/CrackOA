import { useState } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trash2 } from 'lucide-react';

/**
 * Reusable problems table with configurable columns, pagination, and progress checkboxes.
 *
 * Props:
 *  - problems        : array of problem objects to display on the current page
 *  - columns         : array of column keys to show, e.g. ['status','id','title','difficulty','acceptance','frequency','companies','practice','actions']
 *  - currentPage     : current page number (1-indexed)
 *  - totalPages      : total number of pages
 *  - onPageChange    : (page: number) => void
 *  - solvedSet       : Set<string> of problem _ids the user has solved
 *  - onToggleSolved  : (problemId: string, isSolved: boolean) => void
 *  - isAuthenticated : boolean — whether the user is logged in
 *  - emptyMessage    : string — message when no problems match
 *  - totalCount      : number — total number of results (for display)
 *  - pageSize        : number — items per page (for display)
 *  - onDelete        : (problemId: string) => void — optional handler for delete action
 *  - renderActions   : (problem: object) => ReactNode — optional custom renderer for actions column
 */
export default function ProblemsTable({
  problems = [],
  columns = ['status', 'title', 'difficulty', 'acceptance', 'practice'],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  solvedSet = new Set(),
  onToggleSolved,
  isAuthenticated = false,
  emptyMessage = 'No problems found.',
  totalCount = 0,
  pageSize = 20,
  onDelete,
  renderActions,
}) {
  const [loginPrompt, setLoginPrompt] = useState(false);

  const columnConfig = {
    status: { label: 'Status', align: '' },
    id: { label: 'ID', align: '' },
    title: { label: 'Problem Title', align: '' },
    difficulty: { label: 'Difficulty', align: '' },
    acceptance: { label: 'Acceptance', align: '' },
    frequency: { label: 'Frequency', align: '' },
    companies: { label: 'Companies', align: '' },
    practice: { label: 'Practice', align: 'text-right' },
    actions: { label: 'Action', align: 'text-right' },
  };

  const handleCheckboxChange = (prob) => {
    if (!isAuthenticated) {
      setLoginPrompt(true);
      setTimeout(() => setLoginPrompt(false), 3000);
      return;
    }
    const isSolved = solvedSet.has(prob._id);
    onToggleSolved?.(prob._id, !isSolved);
  };

  const getLinkUrl = (prob) =>
    prob.leetcodeUrl ||
    `https://leetcode.com/problems/${prob.slug || prob.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}/`;

  // Build page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        start = 2;
        end = Math.min(maxVisible, totalPages - 1);
      } else if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - maxVisible + 1);
        end = totalPages - 1;
      }

      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="space-y-4">
      {/* Login prompt toast */}
      {loginPrompt && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-bg-card border border-accent/40 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium">
            <span className="text-accent">⚡</span>
            <span>Please <a href="/login" className="text-accent underline underline-offset-2 font-semibold hover:text-accent-hover">log in</a> to track your progress</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-elevated text-text-muted uppercase tracking-wider font-semibold border-b border-border">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className={`px-5 py-4 ${columnConfig[col]?.align || ''}`}
                  >
                    {columnConfig[col]?.label || col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {problems.length > 0 ? (
                problems.map((prob) => {
                  const linkUrl = getLinkUrl(prob);
                  const isSolved = solvedSet.has(prob._id);

                  return (
                    <tr
                      key={prob._id}
                      className={`transition-colors ${
                        isSolved
                          ? 'bg-emerald-500/5 hover:bg-emerald-500/10'
                          : 'hover:bg-bg-elevated/40'
                      }`}
                    >
                      {columns.map((col) => {
                        switch (col) {
                          case 'status':
                            return (
                              <td key={col} className="px-5 py-4">
                                <label className="relative flex items-center cursor-pointer group">
                                  <input
                                    type="checkbox"
                                    checked={isSolved}
                                    onChange={() => handleCheckboxChange(prob)}
                                    className="peer sr-only"
                                  />
                                  <div className={`
                                    w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center
                                    transition-all duration-200
                                    ${isSolved
                                      ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                                      : 'border-gray-500 group-hover:border-emerald-400/60 bg-transparent'
                                    }
                                  `}>
                                    {isSolved && (
                                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                </label>
                              </td>
                            );

                          case 'id':
                            return (
                              <td key={col} className="px-5 py-4 font-mono font-bold text-accent">
                                {prob.leetcodeId}
                              </td>
                            );

                          case 'title':
                            return (
                              <td key={col} className="px-4 py-4 font-medium text-white max-w-xs">
                                <a
                                  href={linkUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className=" flex items-center gap-2 group text-sm"
                                >
                                  <span className="">{prob.title}</span>
                                </a>
                              </td>
                            );

                          case 'difficulty':
                            return (
                              <td key={col} className="px-5 py-4">
                                <span
                                  className={
                                    prob.difficulty === 'Easy'
                                      ? 'difficulty-easy'
                                      : prob.difficulty === 'Hard'
                                        ? 'difficulty-hard'
                                        : 'difficulty-medium'
                                  }
                                >
                                  {prob.difficulty}
                                </span>
                              </td>
                            );

                          case 'acceptance':
                            return (
                              <td key={col} className="px-5 py-4 text-text-secondary font-mono">
                                {prob.acceptanceRate ? `${prob.acceptanceRate}%` : '—'}
                              </td>
                            );

                          case 'frequency':
                            return (
                              <td key={col} className="px-5 py-4 text-text-secondary font-mono">
                                {prob.frequency ? `${prob.frequency}` : '—'}
                              </td>
                            );

                          case 'companies':
                            return (
                              <td key={col} className="px-5 py-4 text-sky-400 font-medium max-w-xs truncate">
                                {prob.companies && prob.companies.length > 0
                                  ? prob.companies.map((c) => c.name || c).join(', ')
                                  : 'General Sheet'}
                              </td>
                            );

                          case 'practice':
                            return (
                              <td key={col} className="px-5 py-4 text-right">
                                <a
                                  href={linkUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 hover:underline   text-accent rounded-lg text-xs font-semibold transition-all"
                                >
                                  Solve 
                                </a>
                              </td>
                            );

                          case 'actions':
                            return (
                              <td key={col} className="px-5 py-4 text-right">
                                {renderActions ? (
                                  renderActions(prob)
                                ) : onDelete ? (
                                  <button
                                    onClick={() => onDelete(prob._id)}
                                    className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors inline-flex items-center"
                                    title="Delete problem"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                ) : (
                                  '—'
                                )}
                              </td>
                            );

                          default:
                            return <td key={col} className="px-5 py-4">—</td>;
                        }
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center text-text-muted">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          {/* Results info */}
          <p className="text-text-muted text-xs font-medium">
            Showing <span className="text-white font-semibold">{startItem}–{endItem}</span> of{' '}
            <span className="text-white font-semibold">{totalCount}</span> problems
          </p>

          {/* Page controls */}
          <div className="flex items-center gap-1.5">
            {/* First page */}
            <button
              onClick={() => onPageChange?.(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-text-muted hover:text-white hover:bg-bg-elevated disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Previous */}
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-text-muted hover:text-white hover:bg-bg-elevated disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((pg, i) =>
                pg === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-text-muted text-xs select-none">
                    ···
                  </span>
                ) : (
                  <button
                    key={pg}
                    onClick={() => onPageChange?.(pg)}
                    className={`min-w-[32px] h-8 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      currentPage === pg
                        ? 'bg-accent text-white shadow-[0_0_12px_rgba(255,107,0,0.3)]'
                        : 'text-text-secondary hover:text-white hover:bg-bg-elevated'
                    }`}
                  >
                    {pg}
                  </button>
                )
              )}
            </div>

            {/* Next */}
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-text-muted hover:text-white hover:bg-bg-elevated disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last page */}
            <button
              onClick={() => onPageChange?.(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-text-muted hover:text-white hover:bg-bg-elevated disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
