import React, { useState } from 'react';
import {
  CheckCircle2, Clock, ChevronRight, Tag, Database,
  BarChart3, FileText, Lightbulb, Table2, ListChecks
} from 'lucide-react';
import { fetchSubmissionsApi } from '../../api/problem.api.js';

const DIFF_COLORS = {
  Easy: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  Medium: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  Hard: 'text-red-400 bg-red-400/10 border-red-400/30',
};

/**
 * Renders a SQL sample table as an HTML table.
 */
function SampleTable({ table }) {
  if (!table) return null;
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-indigo-300 mb-1.5 font-mono">
        📋 {table.name}
      </p>
      <div className="overflow-x-auto rounded-xl border border-[#30363d]">
        <table className="min-w-full text-xs font-mono">
          <thead>
            <tr className="bg-[#161b22] border-b border-[#30363d]">
              {(table.columns || []).map((col, i) => (
                <th key={i} className="px-3 py-2 text-left text-indigo-300 font-semibold whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(table.rows || []).map((row, ri) => (
              <tr key={ri} className="border-b border-[#21262d] last:border-0 hover:bg-[#161b22]/50 transition-colors">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-2 text-zinc-300 whitespace-nowrap">
                    {cell === null ? <span className="text-zinc-600 italic">NULL</span> : String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * SQLProblemPanel — left panel for the SQL problem workspace.
 * Tabs: Description | Schema | Expected Output | Explanation | Submissions
 */
export default function SQLProblemPanel({ problem, activeTab, setActiveTab }) {
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const sqlMeta = problem?.sqlMeta || {};

  const tabs = [
    { id: 'description', label: 'Description', icon: FileText },
    { id: 'schema', label: 'Schema', icon: Table2 },
    { id: 'expected', label: 'Expected Output', icon: ListChecks },
    { id: 'explanation', label: 'Explanation', icon: Lightbulb },
    { id: 'submissions', label: 'Submissions', icon: BarChart3 },
  ];

  const handleTabChange = async (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'submissions' && submissions.length === 0) {
      setLoadingSubmissions(true);
      try {
        const res = await fetchSubmissionsApi(problem._id);
        setSubmissions(res.data || []);
      } catch {
        setSubmissions([]);
      } finally {
        setLoadingSubmissions(false);
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0d1117] text-zinc-100 overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center gap-0.5 px-4 pt-3 pb-0 border-b border-[#30363d] shrink-0 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'text-indigo-400 border-indigo-500 bg-[#161b22] rounded-t-lg'
                  : 'text-zinc-500 border-transparent hover:text-zinc-300'
              }`}
            >
              <Icon className="w-3 h-3" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* ── Description Tab ─────────────────────────────────────────────── */}
        {activeTab === 'description' && (
          <div>
            {/* Title + badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${DIFF_COLORS[problem.difficulty] || 'text-zinc-400 bg-zinc-400/10 border-zinc-400/30'}`}>
                {problem.difficulty}
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <Database className="w-3 h-3" />
                SQL
              </span>
              {(problem.topics || []).map((t) => (
                <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#21262d] border border-[#30363d] text-zinc-400">
                  <Tag className="w-2.5 h-2.5" />
                  {t}
                </span>
              ))}
            </div>

            <h1 className="text-lg font-bold text-white mb-4 leading-snug">{problem.title}</h1>

            {/* Description (rendered as HTML or markdown-ish text) */}
            {problem.description ? (
              <div
                className="prose prose-invert prose-sm max-w-none text-zinc-300 leading-relaxed
                  prose-code:bg-[#161b22] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-indigo-300
                  prose-pre:bg-[#161b22] prose-pre:border prose-pre:border-[#30363d]
                  prose-strong:text-white prose-headings:text-white"
                dangerouslySetInnerHTML={{ __html: problem.description }}
              />
            ) : (
              <p className="text-zinc-500 text-sm italic">No description provided.</p>
            )}

            {/* Constraints */}
            {sqlMeta.constraints && sqlMeta.constraints.length > 0 && (
              <div className="mt-5">
                <h3 className="text-white text-sm font-semibold mb-2">Constraints</h3>
                <ul className="space-y-1.5">
                  {sqlMeta.constraints.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-zinc-400 font-mono">
                      <span className="text-indigo-400 mt-0.5 shrink-0">▸</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ── Schema Tab ──────────────────────────────────────────────────── */}
        {activeTab === 'schema' && (
          <div>
            <h2 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              Database Schema
            </h2>

            {sqlMeta.schemaDescription && (
              <div className="mb-4 p-3 bg-[#161b22] border border-[#30363d] rounded-xl">
                <pre className="text-xs text-indigo-200 font-mono whitespace-pre-wrap leading-relaxed">
                  {sqlMeta.schemaDescription}
                </pre>
              </div>
            )}

            {sqlMeta.sampleTables && sqlMeta.sampleTables.length > 0 ? (
              <div>
                <p className="text-zinc-500 text-xs mb-3">Sample data for testing:</p>
                {sqlMeta.sampleTables.map((table, i) => (
                  <SampleTable key={i} table={table} />
                ))}
              </div>
            ) : (
              <p className="text-zinc-600 text-sm italic">No sample tables defined.</p>
            )}
          </div>
        )}

        {/* ── Expected Output Tab ─────────────────────────────────────────── */}
        {activeTab === 'expected' && (
          <div>
            <h2 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-emerald-400" />
              Expected Output
            </h2>

            {sqlMeta.expectedOutput ? (
              <div className="p-4 bg-[#0a2518] border border-emerald-500/20 rounded-xl">
                <pre className="text-xs text-emerald-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {sqlMeta.expectedOutput}
                </pre>
              </div>
            ) : (
              <p className="text-zinc-600 text-sm italic">No expected output defined.</p>
            )}

            {/* Test cases */}
            {sqlMeta.testCases && sqlMeta.testCases.length > 0 && (
              <div className="mt-5">
                <h3 className="text-white text-sm font-semibold mb-3">Test Cases</h3>
                <div className="space-y-3">
                  {sqlMeta.testCases.map((tc, i) => (
                    <div key={i} className="p-3 bg-[#161b22] border border-[#30363d] rounded-xl">
                      <p className="text-xs font-semibold text-zinc-300 mb-1">
                        Case {i + 1}{tc.description ? `: ${tc.description}` : ''}
                      </p>
                      {tc.expectedOutput && (
                        <pre className="text-xs text-emerald-300 font-mono whitespace-pre-wrap mt-1">
                          {tc.expectedOutput}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Explanation Tab ─────────────────────────────────────────────── */}
        {activeTab === 'explanation' && (
          <div>
            <h2 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Explanation
            </h2>

            {sqlMeta.explanation ? (
              <div
                className="prose prose-invert prose-sm max-w-none text-zinc-300 leading-relaxed
                  prose-code:bg-[#161b22] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-indigo-300
                  prose-pre:bg-[#161b22] prose-pre:border prose-pre:border-[#30363d]
                  prose-strong:text-white"
                dangerouslySetInnerHTML={{ __html: sqlMeta.explanation.replace(/\n/g, '<br/>') }}
              />
            ) : (
              <p className="text-zinc-600 text-sm italic">
                Explanation will be available after you attempt the problem.
              </p>
            )}
          </div>
        )}

        {/* ── Submissions Tab ─────────────────────────────────────────────── */}
        {activeTab === 'submissions' && (
          <div>
            <h2 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              My Submissions
            </h2>

            {loadingSubmissions ? (
              <div className="flex items-center gap-2 text-zinc-500 text-xs">
                <span className="animate-spin">⟳</span> Loading submissions...
              </div>
            ) : submissions.length === 0 ? (
              <p className="text-zinc-600 text-sm italic">No submissions yet. Write your SQL query and hit Submit!</p>
            ) : (
              <div className="space-y-2">
                {submissions.map((sub) => (
                  <div key={sub._id} className="flex items-center justify-between p-3 bg-[#161b22] border border-[#30363d] rounded-xl">
                    <div className="flex items-center gap-2">
                      {sub.status === 'Accepted' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Clock className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`text-xs font-semibold ${sub.status === 'Accepted' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {sub.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span>{sub.runtime}ms</span>
                      <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
