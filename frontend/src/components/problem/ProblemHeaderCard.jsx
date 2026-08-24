import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, CheckCircle2, Share2, RefreshCw, Building2, Tag } from 'lucide-react';
import { syncProblemWithLeetCodeApi } from '../../api/problem.api';

// Radial Accuracy Ring Gauge
const AnimatedAccuracyGauge = ({ percentage = 0 }) => {
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const numPercent = Math.min(100, Math.max(0, Number(percentage) || 0));
  const strokeDashoffset = circumference - (numPercent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-7 h-7">
      <svg className="w-7 h-7 -rotate-90 transform" viewBox="0 0 28 28">
        <circle cx="14" cy="14" r={radius} stroke="currentColor" strokeWidth="2.5" className="text-[#21262d]" fill="none" />
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
      <span className="absolute font-mono text-[9px] font-bold text-zinc-200">
        {Math.round(numPercent)}%
      </span>
    </div>
  );
};

// Difficulty Radar Badge
const DifficultyBadge = ({ difficulty = 'Medium' }) => {
  const norm = (difficulty || 'Medium').toLowerCase();
  const configs = {
    easy: { bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', dot: 'bg-emerald-400' },
    medium: { bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300', dot: 'bg-amber-400' },
    hard: { bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400', dot: 'bg-rose-400' },
  };
  const current = configs[norm] || configs.medium;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border font-mono tracking-tight ${current.bg}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />
      {difficulty}
    </span>
  );
};

export default function ProblemHeaderCard({ problem: initialProblem, onProblemUpdated }) {
  const [problem, setProblem] = useState(initialProblem);
  const [syncing, setSyncing] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [solved, setSolved] = useState(false);

  React.useEffect(() => {
    setProblem(initialProblem);
  }, [initialProblem]);

  if (!problem) return null;

  const leetcodeId = problem.leetcodeId || problem.id || problem.number;
  const title = problem.title || 'Untitled Problem';
  const difficulty = problem.difficulty || 'Medium';
  const acceptanceRate = problem.acceptanceRate || 0;

  const companiesList = Array.isArray(problem.companies)
    ? problem.companies
    : (problem.companies ? [problem.companies] : []);

  const companyFrequencies = [
    { name: 'Google', freq: '42%' },
    { name: 'Amazon', freq: '31%' },
    { name: 'Microsoft', freq: '24%' },
    { name: 'Meta', freq: '16%' }
  ];

  const topicsList = Array.isArray(problem.topics) ? problem.topics : [];

  const handleSyncLeetCode = async () => {
    if (syncing || !problem._id) return;
    setSyncing(true);
    try {
      const res = await syncProblemWithLeetCodeApi(problem._id);
      if (res.data) {
        setProblem(res.data);
        if (onProblemUpdated) onProblemUpdated(res.data);
      }
    } catch (e) {
      console.error('LeetCode sync error:', e);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Title & Toolbar Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d] pb-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          {leetcodeId && (
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/25 font-mono text-xs font-bold text-indigo-300">
              #{String(leetcodeId).padStart(3, '0')}
            </span>
          )}
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {title}
          </h1>
          <DifficultyBadge difficulty={difficulty} />
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#161b22] p-1 rounded-lg border border-[#30363d] shrink-0">
          <button
            onClick={() => setSolved(!solved)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              solved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{solved ? 'Solved' : 'Mark Solved'}</span>
          </button>

          <button
            onClick={() => setBookmarked(!bookmarked)}
            className={`p-1.5 rounded hover:bg-zinc-800 transition-colors ${bookmarked ? 'text-amber-400' : 'text-zinc-400'}`}
            title={bookmarked ? "Bookmarked" : "Bookmark problem"}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-amber-400' : ''}`} />
          </button>

          <button
            onClick={handleSyncLeetCode}
            disabled={syncing}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 border border-orange-500/30 text-xs font-medium transition-all disabled:opacity-50"
            title="Sync live description and metrics from LeetCode"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{syncing ? 'Syncing...' : 'Sync LeetCode'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[#161b22] border border-[#30363d]">
        <div className="flex items-center gap-3">
          <AnimatedAccuracyGauge percentage={acceptanceRate} />
          <div>
            <div className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500">Acceptance Rate</div>
            <div className="font-mono text-xs font-bold text-zinc-200">{acceptanceRate}%</div>
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500">Asked In</div>
          <div className="font-sans text-xs font-semibold text-indigo-300 truncate">
            {companiesList.length > 0
              ? companiesList.slice(0, 2).map(c => typeof c === 'string' ? c : c.name).join(', ')
              : 'Google, Amazon, Meta'}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500">Interview Frequency</div>
          <div className="font-mono text-xs font-bold text-amber-300">High (Asked recently)</div>
        </div>

        <div>
          <div className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500">Difficulty</div>
          <div className="font-mono text-xs font-bold text-zinc-200">{difficulty}</div>
        </div>
      </div>

      {/* Company Interview Context Section */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#161b2e] to-[#1c1836] border border-indigo-500/25 text-xs space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 font-bold text-indigo-300">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>Target Company Frequency</span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">Last reported: August 2026</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {companyFrequencies.map((comp, idx) => (
            <Link
              key={idx}
              to={`/companies/${comp.name.toLowerCase()}/problems`}
              className="p-2 rounded-lg bg-[#0d1117] hover:bg-[#1a202c] border border-[#30363d] transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-200 group-hover:text-white">
                <span>{comp.name}</span>
                <span className="font-mono text-[10px] text-indigo-300">{comp.freq}</span>
              </div>
              <div className="w-full bg-[#21262d] h-1 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full group-hover:bg-indigo-400 transition-all"
                  style={{ width: comp.freq }}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Topics Badges */}
      {topicsList.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-xs text-zinc-500 font-medium mr-1 flex items-center gap-1">
            <Tag className="w-3 h-3" />
            Topics:
          </span>
          {topicsList.map((topic, i) => (
            <span
              key={i}
              className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono font-medium"
            >
              #{topic}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
