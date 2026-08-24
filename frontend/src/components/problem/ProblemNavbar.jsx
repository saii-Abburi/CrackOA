import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Code2, Flame, Search, ChevronRight, Maximize2, Minimize2,
  ArrowLeft, CheckCircle2, RotateCcw, Share2, Sparkles, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ProblemNavbar({
  problem,
  isFullscreen,
  onToggleFullscreen,
  onResetCode,
  streakCount = 7
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const title = problem?.title || 'Problem';
  const leetcodeId = problem?.leetcodeId || problem?.number;
  const companyName = problem?.companies?.[0]?.name || problem?.company || 'Company';

  return (
    <header className="h-12 min-h-[48px] bg-[#0c1017] border-b border-white/[0.08] px-4 flex items-center justify-between text-zinc-300 font-sans text-xs select-none z-30">
      {/* Left side: Logo & Company-wise Breadcrumbs */}
      <div className="flex items-center gap-3 overflow-hidden">
        <Link
          to="/problems"
          className="flex items-center gap-1.5 font-bold text-white tracking-tight hover:text-indigo-400 transition-colors shrink-0"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Code2 className="w-4 h-4" />
          </div>
          <span className="hidden sm:inline text-sm font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            CodeRank
          </span>
        </Link>

        <span className="text-zinc-700 font-light hidden sm:inline">|</span>

        {/* Interview Preparation Breadcrumb Trail */}
        <nav className="flex items-center gap-1.5 overflow-hidden text-xs text-zinc-400">
          <Link to="/problems" className="hover:text-zinc-200 transition-colors shrink-0">
            Problems
          </Link>
          <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0" />

          {companyName && (
            <>
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-medium shrink-0 border border-indigo-500/20">
                {companyName} Sheet
              </span>
              <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0" />
            </>
          )}

          <span className="text-zinc-100 font-medium truncate max-w-[200px] sm:max-w-[320px]">
            {leetcodeId ? `#${leetcodeId} ${title}` : title}
          </span>
        </nav>
      </div>

      {/* Right side: Developer controls & Status */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Streak Counter */}
        <div
          title={`${streakCount} Day Active Problem Solving Streak!`}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs font-semibold cursor-help"
        >
          <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-500 animate-pulse" />
          <span>{streakCount}</span>
        </div>

        {/* Quick Back to Sheet */}
        <button
          onClick={() => navigate(-1)}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800/80 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white transition-all text-xs font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Sheet</span>
        </button>

        {/* Reset Code Shortcut */}
        {onResetCode && (
          <button
            onClick={onResetCode}
            title="Reset starter code signature"
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Fullscreen IDE Toggle */}
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen Code Editor (Esc)" : "Fullscreen Code Editor"}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
        >
          {isFullscreen ? (
            <Minimize2 className="w-3.5 h-3.5 text-indigo-400" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>

        {/* User Profile avatar */}
        <div className="w-6 h-6 rounded-full bg-indigo-600/80 border border-indigo-400/30 flex items-center justify-center font-bold text-[10px] text-white">
          {user?.name?.[0]?.toUpperCase() || <User className="w-3 h-3" />}
        </div>
      </div>
    </header>
  );
}
