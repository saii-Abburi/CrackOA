import React, { useState, useEffect } from 'react';
import { Play, Send, RotateCcw, Maximize2, Minimize2, Settings, Terminal, Check } from 'lucide-react';

const STARTER_CODES = {
  python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Write your optimal solution here\n        pass\n`,
  cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your optimal solution here\n        return {};\n    }\n};\n`,
  java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your optimal solution here\n        return new int[]{};\n    }\n}\n`,
  javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    // Write your optimal solution here\n};\n`,
  typescript: `function twoSum(nums: number[], target: number): number[] {\n    // Write your optimal solution here\n    return [];\n};\n`,
  c: `/**\n * Note: The returned array must be malloced, assume caller calls free().\n */\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    *returnSize = 2;\n    int* result = (int*)malloc(2 * sizeof(int));\n    return result;\n}\n`
};

export default function CodeEditorPanel({
  problem,
  code,
  setCode,
  language,
  setLanguage,
  onRun,
  onSubmit,
  running,
  submitting,
  consoleOpen,
  setConsoleOpen,
  isFullscreen,
  onToggleFullscreen
}) {
  const [fontSize, setFontSize] = useState('14px');
  const [autoSaved, setAutoSaved] = useState(true);

  // Derive starter snippets if provided by LeetCode problem object
  useEffect(() => {
    if (problem?.codeSnippets && problem.codeSnippets.length > 0) {
      const match = problem.codeSnippets.find(
        (s) => s.langSlug === language || s.lang?.toLowerCase() === language
      );
      if (match && match.code) {
        setCode(match.code);
        return;
      }
    }
    if (!code || code === STARTER_CODES[language] || Object.values(STARTER_CODES).includes(code)) {
      setCode(STARTER_CODES[language] || STARTER_CODES.cpp);
    }
  }, [language, problem]);

  const handleTextareaChange = (e) => {
    setCode(e.target.value);
    setAutoSaved(false);
    setTimeout(() => setAutoSaved(true), 1200);
  };

  const handleKeyDown = (e) => {
    // Tab key indentation handling
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const val = e.target.value;
      e.target.value = val.substring(0, start) + '    ' + val.substring(end);
      e.target.selectionStart = e.target.selectionEnd = start + 4;
      setCode(e.target.value);
    }

    // Ctrl/Cmd + Enter -> Run Code
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onRun();
    }

    // Ctrl/Cmd + Shift + Enter -> Submit Code
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleReset = () => {
    const starter = STARTER_CODES[language] || STARTER_CODES.cpp;
    setCode(starter);
  };

  const lines = (code || '').split('\n');

  return (
    <div className="h-full flex flex-col bg-[#0d1117] text-zinc-100 font-sans select-none overflow-hidden">
      {/* Top Code Editor Toolbar */}
      <div className="h-10 bg-[#161b22] border-b border-[#30363d] px-3 flex items-center justify-between gap-2 shrink-0">
        {/* Language Selector Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#21262d] text-zinc-200 text-xs font-semibold px-2.5 py-1 rounded-md border border-[#30363d] focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="python">Python 3</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="c">C</option>
          </select>

          {/* Auto-saved indicator */}
          <span className="text-[11px] text-zinc-500 flex items-center gap-1 hidden sm:flex font-mono">
            <Check className="w-3 h-3 text-emerald-400" />
            <span>Saved</span>
          </span>
        </div>

        {/* Editor Settings & Controls */}
        <div className="flex items-center gap-2 text-xs">
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="bg-[#21262d] text-zinc-300 text-[11px] font-mono px-2 py-1 rounded border border-[#30363d] focus:outline-none"
            title="Font Size"
          >
            <option value="12px">12px</option>
            <option value="14px">14px</option>
            <option value="16px">16px</option>
          </select>

          <button
            onClick={handleReset}
            className="p-1.5 rounded hover:bg-[#21262d] text-zinc-400 hover:text-white transition-colors"
            title="Reset code signature"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onToggleFullscreen}
            className="p-1.5 rounded hover:bg-[#21262d] text-zinc-400 hover:text-white transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Editor"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-indigo-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Code Editor Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative bg-[#0d1117]">
        {/* Line numbers gutter */}
        <div className="w-11 bg-[#161b22] border-r border-[#30363d] text-zinc-500 font-mono text-xs py-3 select-none text-right pr-2 space-y-1 shrink-0 font-medium">
          {lines.map((_, i) => (
            <div key={i} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Textarea Editor */}
        <textarea
          value={code}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          style={{ fontSize }}
          className="flex-1 w-full bg-transparent text-indigo-100 font-mono leading-6 p-3 focus:outline-none resize-none tab-size-4 overflow-auto custom-scrollbar selection:bg-indigo-500/30 select-text"
          placeholder="// Write your solution code here..."
        />
      </div>

      {/* Editor Action Bottom Toolbar */}
      <div className="h-11 bg-[#161b22] border-t border-[#30363d] px-4 flex items-center justify-between shrink-0 select-none">
        <button
          onClick={() => setConsoleOpen(!consoleOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            consoleOpen ? 'bg-[#21262d] text-white' : 'text-zinc-400 hover:text-white hover:bg-[#21262d]/60'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span>Console</span>
          <span className="text-[10px] text-zinc-500 font-mono ml-1">{consoleOpen ? '▼' : '▲'}</span>
        </button>

        {/* Run & Submit Execution Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onRun}
            disabled={running || submitting}
            title="Run Code (Ctrl + Enter)"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-zinc-200 hover:text-white text-xs font-semibold transition-all border border-[#30363d] disabled:opacity-50 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>{running ? 'Running...' : 'Run Code'}</span>
          </button>

          <button
            onClick={onSubmit}
            disabled={running || submitting}
            title="Submit Solution (Ctrl + Shift + Enter)"
            className="flex items-center gap-1.5 px-5 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 shrink-0"
          >
            <Send className="w-3.5 h-3.5 fill-white" />
            <span>{submitting ? 'Submitting...' : 'Submit'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
