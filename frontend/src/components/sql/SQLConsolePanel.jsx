import React, { useState } from 'react';
import { CheckCircle2, XCircle, Loader2, Table2, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * SQLConsolePanel — bottom panel for SQL run/submit results.
 * Tabs: Test Result | Output
 */
export default function SQLConsolePanel({
  runResult,
  submitResult,
  running,
  submitting,
  activeConsoleTab,
  setActiveConsoleTab,
  problem,
}) {
  const [expanded, setExpanded] = useState({});

  const toggleExpanded = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const result = submitResult || runResult;
  const isLoading = running || submitting;
  const isSubmit = !!submitResult;

  return (
    <div className="h-full flex flex-col bg-[#0d1117] border-t border-[#30363d] text-zinc-100">
      {/* Tab bar */}
      <div className="h-9 bg-[#161b22] border-b border-[#30363d] flex items-center px-4 gap-1 shrink-0">
        {[
          { id: 'result', label: isSubmit ? 'Submit Result' : 'Run Result' },
          { id: 'expected', label: 'Expected Output' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveConsoleTab(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeConsoleTab === tab.id
                ? 'bg-[#21262d] text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeConsoleTab === 'result' && (
          <>
            {isLoading && (
              <div className="flex items-center gap-2 text-zinc-400 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                {running ? 'Executing query...' : 'Submitting...'}
              </div>
            )}

            {!isLoading && !result && (
              <p className="text-zinc-600 text-xs">
                Hit <kbd className="px-1 py-0.5 bg-[#21262d] border border-[#30363d] rounded text-[10px] font-mono">Run</kbd> to test your query
                or <kbd className="px-1 py-0.5 bg-[#21262d] border border-[#30363d] rounded text-[10px] font-mono">Submit</kbd> to record your solution.
              </p>
            )}

            {!isLoading && result && (
              <div>
                {/* Status header */}
                <div className="flex items-center gap-2 mb-3">
                  {result.status === 'Accepted' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className={`text-sm font-bold ${result.status === 'Accepted' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.status}
                  </span>
                  {isSubmit && result.status === 'Accepted' && (
                    <span className="text-[10px] text-emerald-400/60 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                      Progress recorded ✓
                    </span>
                  )}
                </div>

                {/* Metrics */}
                {result.status === 'Accepted' && (
                  <div className="flex gap-4 mb-4">
                    <div className="text-center px-3 py-2 bg-[#161b22] border border-[#30363d] rounded-xl">
                      <p className="text-emerald-400 text-sm font-bold">{result.runtime}ms</p>
                      <p className="text-zinc-600 text-[10px]">Runtime</p>
                    </div>
                    <div className="text-center px-3 py-2 bg-[#161b22] border border-[#30363d] rounded-xl">
                      <p className="text-indigo-400 text-sm font-bold">{result.memory}MB</p>
                      <p className="text-zinc-600 text-[10px]">Memory</p>
                    </div>
                    <div className="text-center px-3 py-2 bg-[#161b22] border border-[#30363d] rounded-xl">
                      <p className="text-amber-400 text-sm font-bold">{result.passedTestCases}/{result.totalTestCases}</p>
                      <p className="text-zinc-600 text-[10px]">Test cases</p>
                    </div>
                  </div>
                )}

                {/* Test case results */}
                {result.testCases && result.testCases.length > 0 && (
                  <div className="space-y-2">
                    {result.testCases.map((tc, i) => (
                      <div key={i} className="border border-[#30363d] rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleExpanded(`tc-${i}`)}
                          className="w-full flex items-center justify-between px-3 py-2 bg-[#161b22] text-xs hover:bg-[#21262d] transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {tc.passed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-red-400" />
                            )}
                            <span className={tc.passed ? 'text-emerald-400' : 'text-red-400'}>
                              Test {i + 1}{tc.description ? `: ${tc.description}` : ''}
                            </span>
                          </div>
                          {expanded[`tc-${i}`] ? (
                            <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                          )}
                        </button>
                        {expanded[`tc-${i}`] && (
                          <div className="px-3 py-3 space-y-2 bg-[#0d1117]">
                            {tc.input && (
                              <div>
                                <p className="text-[10px] text-zinc-500 font-semibold mb-1">INPUT</p>
                                <pre className="text-[11px] font-mono text-zinc-400 whitespace-pre-wrap">{tc.input}</pre>
                              </div>
                            )}
                            <div>
                              <p className="text-[10px] text-zinc-500 font-semibold mb-1">EXPECTED</p>
                              <pre className="text-[11px] font-mono text-emerald-300 whitespace-pre-wrap">{tc.expectedOutput}</pre>
                            </div>
                            <div>
                              <p className="text-[10px] text-zinc-500 font-semibold mb-1">OUTPUT</p>
                              <pre className="text-[11px] font-mono text-zinc-300 whitespace-pre-wrap">{tc.actualOutput}</pre>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Simulation note */}
                {result.sqlNote && (
                  <p className="mt-3 text-[10px] text-amber-400/60 italic">{result.sqlNote}</p>
                )}
              </div>
            )}
          </>
        )}

        {activeConsoleTab === 'expected' && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Table2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-white">Expected Result Set</span>
            </div>
            {problem?.sqlMeta?.expectedOutput ? (
              <pre className="text-[12px] font-mono text-emerald-300 bg-[#0a2518] border border-emerald-500/20 rounded-xl p-4 whitespace-pre-wrap">
                {problem.sqlMeta.expectedOutput}
              </pre>
            ) : (
              <p className="text-zinc-600 text-xs italic">No expected output defined for this problem.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
