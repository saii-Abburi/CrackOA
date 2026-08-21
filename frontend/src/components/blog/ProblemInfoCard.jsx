import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function ProblemInfoCard({ problem }) {
  if (!problem) return null;

  const leetcodeUrl =
    problem.leetcodeUrl ||
    `https://leetcode.com/problems/${problem.slug || problem.title?.toLowerCase().replace(/[^a-z0-9]/g, '-')}/`;

  const topicsList = problem.topics?.length ? problem.topics.join(' · ') : 'DSA';

  return (
    <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-[#FF5700]/10 text-[#FF5700] font-mono text-xs font-bold border border-[#FF5700]/20">
            LeetCode #{problem.leetcodeId || '?'}
          </span>
          <h3 className="text-white font-bold text-base truncate">{problem.title}</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-1 text-xs">
          <div>
            <span className="text-[#71717A] block font-medium uppercase tracking-wider text-[10px] mb-0.5">Difficulty</span>
            <span
              className={`font-semibold ${
                problem.difficulty === 'Easy'
                  ? 'text-emerald-400'
                  : problem.difficulty === 'Hard'
                  ? 'text-red-400'
                  : 'text-amber-400'
              }`}
            >
              {problem.difficulty || 'Medium'}
            </span>
          </div>

          <div>
            <span className="text-[#71717A] block font-medium uppercase tracking-wider text-[10px] mb-0.5">Topics</span>
            <span className="text-text-secondary font-medium truncate block">{topicsList}</span>
          </div>
        </div>
      </div>

      <a
        href={leetcodeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF5700] text-white text-xs font-bold rounded-xl hover:bg-[#e04d00] transition-colors shrink-0 shadow-sm"
      >
        Solve on LeetCode <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}

// Alias export for backwards compatibility
export { ProblemInfoCard as ProblemInfo };
