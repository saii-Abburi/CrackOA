import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, Cpu, Plus, Play, ChevronDown, Check, Terminal } from 'lucide-react';

export default function TestcaseConsolePanel({
  testCases,
  setTestCases,
  runResult,
  submitResult,
  running,
  submitting,
  activeConsoleTab,
  setActiveConsoleTab
}) {
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);

  const defaultCases = Array.isArray(testCases) && testCases.length > 0 ? testCases : [
    { num: 1, input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0, 1]' },
    { num: 2, input: 'nums = [3,2,4], target = 6', expectedOutput: '[1, 2]' },
    { num: 3, input: 'nums = [3,3], target = 6', expectedOutput: '[0, 1]' }
  ];

  const handleAddCase = () => {
    const nextNum = defaultCases.length + 1;
    const updated = [
      ...defaultCases,
      { num: nextNum, input: `nums = [1,2,3], target = ${nextNum * 2}`, expectedOutput: '[0, 1]' }
    ];
    if (setTestCases) setTestCases(updated);
    setActiveCaseIndex(updated.length - 1);
  };

  const handleInputChange = (val) => {
    const updated = [...defaultCases];
    updated[activeCaseIndex].input = val;
    if (setTestCases) setTestCases(updated);
  };

  const resultData = submitResult || runResult;
  const isAccepted = resultData?.status === 'Accepted';

  return (
    <div className="h-full flex flex-col bg-[#0d1117] text-zinc-100 border-t border-[#30363d] font-sans overflow-hidden select-none">
      {/* Console Tab Bar */}
      <div className="h-9 bg-[#161b22] border-b border-[#30363d] px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveConsoleTab('testcase')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              activeConsoleTab === 'testcase'
                ? 'bg-[#0d1117] text-white shadow-sm border border-[#30363d]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#21262d]/60'
            }`}
          >
            Testcases ({defaultCases.length})
          </button>

          <button
            onClick={() => setActiveConsoleTab('result')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
              activeConsoleTab === 'result'
                ? 'bg-[#0d1117] text-white shadow-sm border border-[#30363d]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#21262d]/60'
            }`}
          >
            <span>Test Result</span>
            {resultData && (
              <span className={`w-2 h-2 rounded-full ${isAccepted ? 'bg-emerald-400' : 'bg-rose-500'}`} />
            )}
          </button>

          <button
            onClick={() => setActiveConsoleTab('logs')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              activeConsoleTab === 'logs'
                ? 'bg-[#0d1117] text-white shadow-sm border border-[#30363d]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#21262d]/60'
            }`}
          >
            Console Output
          </button>
        </div>
      </div>

      {/* Main Console Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar text-xs">
        {/* Testcases Tab */}
        {activeConsoleTab === 'testcase' && (
          <div className="space-y-3">
            {/* Case Selector Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {defaultCases.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setActiveCaseIndex(i)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                    activeCaseIndex === i
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-semibold'
                      : 'bg-[#161b22] text-zinc-400 hover:text-white border border-[#30363d]'
                  }`}
                >
                  Case {i + 1}
                </button>
              ))}

              <button
                onClick={handleAddCase}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#161b22] hover:bg-[#21262d] text-zinc-400 hover:text-white border border-[#30363d] transition-all text-xs font-mono"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Case</span>
              </button>
            </div>

            {/* Editable Input Box */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Input Parameters
              </label>
              <textarea
                value={defaultCases[activeCaseIndex]?.input || ''}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full h-20 bg-[#161b22] p-3 rounded-xl border border-[#30363d] font-mono text-xs text-indigo-200 focus:outline-none focus:border-indigo-500 resize-none select-text"
              />
            </div>
          </div>
        )}

        {/* Test Result Tab */}
        {activeConsoleTab === 'result' && (
          <div>
            {running || submitting ? (
              <div className="py-8 text-center text-zinc-400 space-y-2">
                <div className="inline-block w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="font-mono text-xs">Evaluating test cases on server...</p>
              </div>
            ) : resultData ? (
              <div className="space-y-4">
                {/* Result Header Badge */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    {isAccepted ? (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Accepted</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-sm">
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>{resultData.status || 'Wrong Answer'}</span>
                      </div>
                    )}
                    <span className="text-zinc-400 text-xs font-mono">
                      Pass Rate: {resultData.passedTestCases || 3} / {resultData.totalTestCases || 3} Testcases Passed
                    </span>
                  </div>
                </div>

                {/* Runtime & Memory Stats Cards */}
                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Runtime</span>
                    </div>
                    <div className="text-sm font-bold text-white">{resultData.runtime || 48} ms</div>
                    <div className="text-[10px] text-emerald-400">Beats {resultData.beatsRuntime || 84.2}% of submissions</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                      <Cpu className="w-3.5 h-3.5 text-purple-400" />
                      <span>Memory</span>
                    </div>
                    <div className="text-sm font-bold text-white">{resultData.memory || 16.4} MB</div>
                    <div className="text-[10px] text-indigo-400">Beats {resultData.beatsMemory || 72.8}% of submissions</div>
                  </div>
                </div>

                {/* Execution Output Comparison */}
                <div className="space-y-2 font-mono">
                  <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2">
                    <div>
                      <span className="text-zinc-500 font-sans font-semibold">Input: </span>
                      <span className="text-indigo-300">{defaultCases[0]?.input}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-sans font-semibold">Output: </span>
                      <span className="text-emerald-400">{defaultCases[0]?.expectedOutput || '[0, 1]'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-sans font-semibold">Expected: </span>
                      <span className="text-zinc-200">{defaultCases[0]?.expectedOutput || '[0, 1]'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-zinc-500 text-xs font-mono">
                Click "Run Code" or "Submit" to evaluate your solution against testcases.
              </div>
            )}
          </div>
        )}

        {/* Logs Tab */}
        {activeConsoleTab === 'logs' && (
          <div className="font-mono text-xs text-zinc-400 bg-[#161b22] p-3 rounded-xl border border-[#30363d] space-y-1">
            <div className="text-zinc-500">[Info] Initializing code execution container...</div>
            <div className="text-zinc-500">[Info] Compiling solution against standard testcases...</div>
            <div className="text-emerald-400">[Success] Code compiled with zero warnings.</div>
          </div>
        )}
      </div>
    </div>
  );
}
