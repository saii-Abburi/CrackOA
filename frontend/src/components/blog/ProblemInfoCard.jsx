import React, { useState } from 'react';
import { syncProblemWithLeetCodeApi } from '../../api/problem.api';

/**
 * Custom Animated SVGs with micro-interactions
 */

// Animated Refresh/Sync Icon for LeetCode Direct Sync
const AnimatedSyncIcon = ({ syncing }) => (
  <svg 
    className={`w-4 h-4 text-orange-400 ${syncing ? 'animate-spin' : 'transition-transform duration-300 group-hover:rotate-180'}`} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21.5 2v6h-6M2.5 22v-6h6" />
    <path d="M2 11.5a10 10 0 0 1 18.8-4.3L21.5 8M22 12.5a10 10 0 0 1-18.8 4.2L2.5 16" />
  </svg>
);

// Animated Diagonal Arrow for External Links
const AnimatedExternalArrow = () => (
  <svg 
    className="w-4 h-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <line x1="7" y1="17" x2="17" y2="7" className="transition-all duration-200 group-hover:stroke-indigo-400" />
    <polyline points="7 7 17 7 17 17" className="transition-all duration-200 group-hover:stroke-indigo-400" />
  </svg>
);

// Interactive Spring-Bounce Bookmark SVG
const AnimatedBookmarkIcon = ({ bookmarked }) => (
  <svg 
    className={`w-4 h-4 transition-all duration-300 transform active:scale-75 ${
      bookmarked 
        ? 'text-amber-400 fill-amber-400 scale-110' 
        : 'text-zinc-400 hover:text-zinc-200 fill-none hover:scale-105'
    }`} 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

// Interactive Draw & Pop Checkmark
const AnimatedSolvedCheck = ({ solved }) => (
  <svg 
    className={`w-4 h-4 transition-all duration-300 transform active:scale-90 ${
      solved 
        ? 'text-emerald-400 fill-emerald-500/20 scale-105' 
        : 'text-zinc-500 hover:text-zinc-300 fill-none'
    }`} 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" className="transition-colors duration-200" />
    <path 
      d="M8 12l3 3 5-5" 
      className={`transition-all duration-300 ${
        solved ? 'stroke-dashoffset-0 opacity-100' : 'opacity-40 stroke-zinc-600'
      }`} 
    />
  </svg>
);

// Animated Copy Button SVG
const AnimatedCopyIcon = ({ copied }) => (
  <div className="relative w-4 h-4 flex items-center justify-center">
    {copied ? (
      <svg 
        className="w-4 h-4 text-emerald-400 animate-in zoom-in-75 duration-200" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ) : (
      <svg 
        className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 transition-transform duration-200 group-hover:scale-105" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    )}
  </div>
);

// Animated Accuracy Ring SVG
const AnimatedAccuracyGauge = ({ percentage = 0 }) => {
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const numPercent = Math.min(100, Math.max(0, Number(percentage) || 0));
  const strokeDashoffset = circumference - (numPercent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-7 h-7">
      <svg className="w-7 h-7 -rotate-90 transform" viewBox="0 0 28 28">
        <circle
          cx="14"
          cy="14"
          r={radius}
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-zinc-800"
          fill="none"
        />
        <circle
          cx="14"
          cy="14"
          r={radius}
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-indigo-400 transition-all duration-1000 ease-out"
          fill="none"
        />
      </svg>
      <span className="absolute font-mono text-[9px] font-medium text-zinc-300">
        {Math.round(numPercent)}%
      </span>
    </div>
  );
};

// Animated Radar Pulse for Difficulty
const DifficultyBadge = ({ difficulty = 'Medium' }) => {
  const normalizedDiff = (difficulty || 'Medium').toLowerCase();
  
  const configs = {
    easy: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      dot: 'bg-emerald-400',
      ping: 'bg-emerald-400/40',
    },
    medium: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      dot: 'bg-amber-400',
      ping: 'bg-amber-400/40',
    },
    hard: {
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      dot: 'bg-rose-400',
      ping: 'bg-rose-400/40',
    },
  };

  const current = configs[normalizedDiff] || configs.medium;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border font-mono tracking-tight ${current.bg}`}>
      <span className="relative flex h-1.5 w-1.5">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.ping}`} />
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${current.dot}`} />
      </span>
      {difficulty || 'Medium'}
    </span>
  );
};

/**
 * Main ProblemInfoCard Component reading real data from problem prop
 */
export default function ProblemInfoCard({ problem: initialProblem, onToggleSolve, onToggleBookmark, onProblemUpdated }) {
  if (!initialProblem) return null;

  const [problemData, setProblemData] = useState(initialProblem);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState(null);

  // Sync state if initialProblem prop changes
  React.useEffect(() => {
    setProblemData(initialProblem);
  }, [initialProblem]);

  // Derive fields from problem state
  const problem = problemData || {};
  const targetId = problem._id || problem.leetcodeId || problem.slug;
  const leetcodeId = problem.leetcodeId || problem.id || problem.number;
  const title = problem.title || 'Untitled Problem';
  const difficulty = problem.difficulty || 'Medium';
  const topics = Array.isArray(problem.topics) ? problem.topics : (problem.topics ? [problem.topics] : []);
  const companies = Array.isArray(problem.companies) ? problem.companies : (problem.companies ? [problem.companies] : []);
  
  const leetcodeUrl =
    problem.leetcodeUrl ||
    (problem.slug || problem.title
      ? `https://leetcode.com/problems/${problem.slug || problem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/`
      : null);

  const acceptanceRate = problem.acceptanceRate || problem.accuracy || null;
  const timeComplexity = problem.timeComplexity || null;
  const spaceComplexity = problem.spaceComplexity || null;
  const frequency = problem.frequency || null;
  const description = problem.description || problem.summary || null;

  // Local interactive states
  const [solved, setSolved] = useState(Boolean(problem.isSolved || problem.solved));
  const [bookmarked, setBookmarked] = useState(Boolean(problem.isBookmarked || problem.bookmarked));
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleToggleSolve = () => {
    const nextState = !solved;
    setSolved(nextState);
    if (onToggleSolve) onToggleSolve(problem, nextState);
  };

  const handleToggleBookmark = () => {
    const nextState = !bookmarked;
    setBookmarked(nextState);
    if (onToggleBookmark) onToggleBookmark(problem, nextState);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(leetcodeUrl || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSyncLeetCode = async () => {
    if (syncing || !targetId) return;
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await syncProblemWithLeetCodeApi(targetId);
      if (res.data) {
        setProblemData(res.data);
        if (onProblemUpdated) onProblemUpdated(res.data);
        setSyncMsg({ type: 'success', text: 'Synced live data from LeetCode!' });
      }
    } catch (err) {
      console.error('Sync failed:', err);
      setSyncMsg({ type: 'error', text: err.response?.data?.message || 'Failed to sync from LeetCode' });
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(null), 3500);
    }
  };

  const hasMetrics = acceptanceRate || timeComplexity || spaceComplexity || frequency;
  const isHtml = description && (description.includes('<p>') || description.includes('<code>') || description.includes('<div>'));

  return (
    <div className="group relative w-full rounded-xl bg-[#0e131f] border border-white/[0.08] hover:border-white/[0.16] shadow-xl hover:shadow-2xl transition-all duration-300 p-5 md:p-6 text-zinc-100 overflow-hidden mb-8">
      
      {/* Subtle top edge specular highlight line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent pointer-events-none" />

      {/* Header Row: Problem Number, Title, Difficulty & Quick Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div className="flex items-start md:items-center gap-3 flex-wrap">
          {leetcodeId && (
            <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/25 font-mono text-xs font-semibold text-indigo-300">
              #{String(leetcodeId).padStart(3, '0')}
            </span>
          )}
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors">
            {title}
          </h2>
          <DifficultyBadge difficulty={difficulty} />
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-1.5 self-end md:self-auto bg-[#111625] p-1 rounded-lg border border-white/[0.06]">
          {/* Direct LeetCode Live Sync Button */}
          <button
            onClick={handleSyncLeetCode}
            disabled={syncing}
            title="Fetch live statement & metrics directly from LeetCode"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-orange-500/10 border border-transparent hover:border-orange-500/30 text-orange-400 text-xs font-medium transition-all group/sync disabled:opacity-50"
          >
            <AnimatedSyncIcon syncing={syncing} />
            <span>{syncing ? 'Syncing...' : 'Sync LeetCode'}</span>
          </button>

          {/* Solved Toggle */}
          <button
            onClick={handleToggleSolve}
            title={solved ? "Mark as unsolved" : "Mark as solved"}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-zinc-800/80 text-xs font-medium transition-colors"
          >
            <AnimatedSolvedCheck solved={solved} />
            <span className={solved ? "text-emerald-400 font-medium" : "text-zinc-400"}>
              {solved ? "Solved" : "Solve"}
            </span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={handleToggleBookmark}
            title={bookmarked ? "Remove bookmark" : "Bookmark problem"}
            className="p-1.5 rounded-md hover:bg-zinc-800/80 transition-colors"
          >
            <AnimatedBookmarkIcon bookmarked={bookmarked} />
          </button>

          {/* Copy Share Link */}
          <button
            onClick={handleCopyLink}
            title="Copy Problem Link"
            className="p-1.5 rounded-md hover:bg-zinc-800/80 transition-colors"
          >
            <AnimatedCopyIcon copied={copied} />
          </button>

          {/* External Problem Link */}
          {leetcodeUrl && (
            <a
              href={leetcodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-md bg-[#FF5700]/15 hover:bg-[#FF5700]/25 border border-[#FF5700]/30 text-[#FF7A00] text-xs font-medium transition-all group/link"
            >
              <span>LeetCode</span>
              <AnimatedExternalArrow />
            </a>
          )}
        </div>
      </div>

      {/* Sync Status Toast message */}
      {syncMsg && (
        <div className={`mt-2 py-1.5 px-3 rounded text-xs font-medium ${syncMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
          {syncMsg.text}
        </div>
      )}

      {/* Metrics Row */}
      {hasMetrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 py-3 px-4 rounded-lg bg-[#111625]/80 border border-indigo-500/15">
          {acceptanceRate !== null && acceptanceRate !== undefined && (
            <div className="flex items-center gap-3">
              <AnimatedAccuracyGauge percentage={acceptanceRate} />
              <div>
                <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">Acceptance Rate</div>
                <div className="font-mono text-sm font-semibold text-zinc-200">{acceptanceRate}%</div>
              </div>
            </div>
          )}

          {timeComplexity && (
            <div>
              <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">Time Complexity</div>
              <div className="font-mono text-sm font-semibold text-indigo-300">{timeComplexity}</div>
            </div>
          )}

          {spaceComplexity && (
            <div>
              <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">Space Complexity</div>
              <div className="font-mono text-sm font-semibold text-indigo-300">{spaceComplexity}</div>
            </div>
          )}

          {frequency && (
            <div>
              <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">Frequency</div>
              <div className="font-mono text-sm font-semibold text-amber-300/90">{frequency}</div>
            </div>
          )}
        </div>
      )}

      {/* Description Snippet (Collapsible) */}
      {description && (
        <div className="my-4">
          {isHtml ? (
            <div
              className={`text-sm text-zinc-300 leading-relaxed overflow-hidden prose prose-invert max-w-none ${expanded ? '' : 'max-h-24 mask-linear'}`}
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : (
            <p className={`text-sm text-zinc-300 leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
              {description}
            </p>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
          >
            {expanded ? "Show less" : "Read full problem statement"}
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      )}


      {/* Tags Section: Targeted Companies & Topic Categories */}
      {(companies.length > 0 || topics.length > 0) && (
        <div className="space-y-3 pt-3 border-t border-white/[0.06]">
          {/* Companies Asking */}
          {companies.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-zinc-500 font-medium mr-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18M9 8h1m4 0h1m-5 4h1m4 0h1m-5 4h1m4 0h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                </svg>
                Companies:
              </span>
              {companies.map((company, index) => (
                <span
                  key={index}
                  className="px-2.5 py-0.5 rounded-md bg-indigo-950/40 hover:bg-indigo-900/40 text-indigo-200 hover:text-white border border-indigo-500/20 text-xs font-medium transition-all duration-150"
                >
                  {typeof company === 'string' ? company : company.name || company.title}
                </span>
              ))}
            </div>
          )}

          {/* Algorithm Topic Tags */}
          {topics.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-zinc-500 font-medium mr-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
                Topics:
              </span>
              {topics.map((topic, index) => (
                <span
                  key={index}
                  className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono hover:bg-indigo-500/25 transition-colors"
                >
                  #{typeof topic === 'string' ? topic : topic.name || topic.title}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

// Backwards compatibility alias export
export { ProblemInfoCard, ProblemInfoCard as ProblemInfo };
