import React, { useEffect, useRef, useState } from 'react';
import { Play, Send, Loader2, Database, AlertTriangle, ChevronDown } from 'lucide-react';

const SQL_TEMPLATE = `-- Write your SQL query here
SELECT *
FROM your_table
WHERE condition;
`;

/**
 * SQLEditorPanel — right-top panel for writing SQL queries.
 * Uses a styled textarea (Monaco-less fallback for broad compatibility).
 * Shows a "Live SQL sandbox coming soon" notice prominently.
 */
export default function SQLEditorPanel({
  problem,
  code,
  setCode,
  onRun,
  onSubmit,
  running,
  submitting,
  consoleOpen,
  setConsoleOpen,
  isFullscreen,
  onToggleFullscreen,
}) {
  const textareaRef = useRef(null);
  const [lineCount, setLineCount] = useState(1);

  // Auto-set template on mount if code is empty
  useEffect(() => {
    if (!code) {
      setCode(SQL_TEMPLATE);
    }
  }, []);

  // Sync line count for gutter
  useEffect(() => {
    const lines = (code || '').split('\n').length;
    setLineCount(Math.max(lines, 8));
  }, [code]);

  // Tab key inserts spaces instead of navigating away
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newVal = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newVal);
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2;
          textareaRef.current.selectionEnd = start + 2;
        }
      });
    }
    // Ctrl/Cmd + Enter → Run
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun?.();
    }
    // Ctrl/Cmd + Shift + Enter → Submit
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
      e.preventDefault();
      onSubmit?.();
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0d1117] overflow-hidden">
      {/* Top toolbar */}
      <div className="h-10 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-4 shrink-0 gap-3">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-semibold text-zinc-300">SQL Query</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 font-mono">
            SQL
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Run button */}
          <button
            onClick={onRun}
            disabled={running || submitting}
            title="Run query (Ctrl+Enter)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              running
                ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                : 'bg-[#21262d] text-zinc-300 hover:text-white border border-[#30363d] hover:border-zinc-500'
            }`}
          >
            {running ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3 text-emerald-400" />
            )}
            {running ? 'Running...' : 'Run'}
          </button>

          {/* Submit button */}
          <button
            onClick={onSubmit}
            disabled={running || submitting}
            title="Submit query (Ctrl+Shift+Enter)"
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              submitting
                ? 'bg-indigo-600/50 text-indigo-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
            }`}
          >
            {submitting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Send className="w-3 h-3" />
            )}
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>

      {/* SQL Sandbox notice */}
      <div className="mx-3 mt-2 mb-0 flex items-center gap-2 px-3 py-2 bg-amber-500/8 border border-amber-500/20 rounded-xl shrink-0">
        <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
        <p className="text-[10px] text-amber-300/80">
          <span className="font-semibold text-amber-300">Live SQL sandbox coming soon.</span>{' '}
          Results are currently simulated — write your best query and submit to track progress.
        </p>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-hidden flex mt-2">
        {/* Line numbers */}
        <div className="w-10 shrink-0 bg-[#0d1117] text-right pr-2 pt-3 select-none overflow-hidden">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="text-[11px] text-zinc-600 font-mono leading-[1.625rem]">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          className="flex-1 bg-[#0d1117] text-zinc-200 text-[13px] font-mono leading-[1.625rem]
            resize-none outline-none border-none p-3 pl-2 overflow-auto
            caret-indigo-400 selection:bg-indigo-500/30"
          style={{
            tabSize: 2,
            minHeight: '100%',
          }}
          placeholder="-- Write your SQL query here..."
        />
      </div>

      {/* Bottom status bar */}
      <div className="h-6 bg-[#161b22] border-t border-[#30363d] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3 text-[10px] text-zinc-500">
          <span>Ln {(code || '').split('\n').length}</span>
          <span>Col {((code || '').split('\n').pop()?.length || 0) + 1}</span>
          <span>{(code || '').length} chars</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-zinc-600">
          <span>Ctrl+Enter to Run</span>
          <span className="text-zinc-700">|</span>
          <span>Ctrl+Shift+Enter to Submit</span>
        </div>
      </div>
    </div>
  );
}
