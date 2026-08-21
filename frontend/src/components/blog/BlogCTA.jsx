import React from 'react';
import { ExternalLink, CheckCircle } from 'lucide-react';

export default function BlogCTA({ problem }) {
  if (!problem) return null;

  const leetcodeUrl =
    problem.leetcodeUrl ||
    `https://leetcode.com/problems/${problem.slug || problem.title?.toLowerCase().replace(/[^a-z0-9]/g, '-')}/`;

  return (
    <div className="my-14 bg-[#121212] border border-white/10 rounded-2xl p-8 text-center max-w-[760px] mx-auto shadow-lg">
      <div className="w-12 h-12 rounded-2xl bg-[#FF5700]/10 border border-[#FF5700]/20 flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-6 h-6 text-[#FF5700]" />
      </div>

      <h3 className="text-2xl font-extrabold text-white mb-3 tracking-tight">
        Ready to solve it yourself?
      </h3>

      <p className="text-sm sm:text-base text-[#A1A1AA] mb-6 max-w-lg mx-auto leading-relaxed">
        Now that you understand the intuition and approach, test your implementation skills by solving the problem on LeetCode without looking at the solution.
      </p>

      <a
        href={leetcodeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF5700] text-white font-bold text-sm rounded-xl hover:bg-[#e04d00] transition-colors shadow-md"
      >
        Solve Problem <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}
