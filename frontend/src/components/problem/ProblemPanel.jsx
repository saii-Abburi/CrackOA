import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, FileText, Code2, History, MessageSquare,
  Lightbulb, ChevronLeft, ChevronRight, Copy, Check, Sparkles,
  CheckCircle2, Clock, Cpu
} from 'lucide-react';
import ProblemHeaderCard from './ProblemHeaderCard.jsx';
import { fetchSubmissionsApi } from '../../api/problem.api.js';

export default function ProblemPanel({ problem, onProblemUpdated, activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const [openHintIndex, setOpenHintIndex] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  useEffect(() => {
    if (activeTab === 'submissions' && problem?._id) {
      setLoadingSubmissions(true);
      fetchSubmissionsApi(problem._id)
        .then((res) => setSubmissions(res.data || []))
        .catch((e) => console.error(e))
        .finally(() => setLoadingSubmissions(false));
    }
  }, [activeTab, problem?._id]);

  if (!problem) return null;

  const tabs = [
    { id: 'description', label: 'Description', icon: BookOpen },
    { id: 'editorial', label: 'Editorial', icon: FileText },
    { id: 'solutions', label: 'Solutions', icon: Code2 },
    { id: 'submissions', label: 'Submissions', icon: History },
    { id: 'discussion', label: 'Discussion', icon: MessageSquare },
  ];

  const description = problem.description || '';
  const isHtml = description.includes('<p>') || description.includes('<code>') || description.includes('<pre>');

  const sampleExamples = [
    {
      num: 1,
      input: 'nums = [2,7,11,15], target = 9',
      output: '[0,1]',
      explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
    },
    {
      num: 2,
      input: 'nums = [3,2,4], target = 6',
      output: '[1,2]',
      explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
    },
    {
      num: 3,
      input: 'nums = [3,3], target = 6',
      output: '[0,1]',
      explanation: 'Both elements add up to 6.'
    }
  ];

  const hints = Array.isArray(problem.hints) && problem.hints.length > 0 ? problem.hints : [
    'A really brute force way would be to search for all possible pairs of numbers but that would be O(n²). Can we do better?',
    'Try to use a hash table to check if the complement of the current element (target - nums[i]) exists in linear O(n) time.',
    'As we iterate through the array, store each element\'s value and index into a hash map for instant O(1) lookups.'
  ];

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-[#0d1117] text-zinc-100 border-r border-[#30363d] overflow-hidden select-text font-sans">
      {/* Top Tab Navigation Bar */}
      <div className="h-10 bg-[#161b22] border-b border-[#30363d] flex items-center px-2 gap-1 overflow-x-auto shrink-0 select-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#0d1117] text-white shadow-sm border border-[#30363d]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#21262d]/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Panel Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        {activeTab === 'description' && (
          <div className="space-y-6">
            {/* Header Metadata & Company Context Card */}
            <ProblemHeaderCard problem={problem} onProblemUpdated={onProblemUpdated} />

            {/* Problem Statement Prose / HTML */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-[#30363d] pb-1.5 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Problem Statement</span>
              </h3>

              {isHtml ? (
                <div
                  className="text-sm text-zinc-300 leading-relaxed space-y-3 prose prose-invert max-w-none
                    [&_p]:mb-3 [&_strong]:text-white [&_strong]:font-semibold
                    [&_pre]:bg-[#161b22] [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-[#30363d] [&_pre]:font-mono [&_pre]:text-xs [&_pre]:my-3 [&_pre]:overflow-x-auto
                    [&_code]:bg-[#1f242c] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-indigo-300 [&_code]:font-mono [&_code]:text-xs
                    [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:text-zinc-300"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              ) : (
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                  {description || 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.'}
                </p>
              )}
            </div>

            {/* Examples Cards */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-[#30363d] pb-1.5">
                Examples
              </h3>

              {sampleExamples.map((ex, idx) => (
                <div key={idx} className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 text-xs font-mono space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between text-zinc-400 font-sans font-bold">
                    <span className="text-white font-semibold">Example {ex.num}</span>
                    <button
                      onClick={() => handleCopy(`Input: ${ex.input}\nOutput: ${ex.output}`, idx)}
                      className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
                    >
                      {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 bg-[#0d1117] p-3 rounded-lg border border-[#30363d]">
                    <div>
                      <span className="text-zinc-500 font-semibold select-none">Input: </span>
                      <span className="text-indigo-300 font-semibold">{ex.input}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-semibold select-none">Output: </span>
                      <span className="text-emerald-400 font-semibold">{ex.output}</span>
                    </div>
                    {ex.explanation && (
                      <div className="text-zinc-300 pt-1 font-sans text-[11px] leading-relaxed">
                        <span className="text-zinc-500 font-semibold select-none font-mono">Explanation: </span>
                        {ex.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Constraints */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-[#30363d] pb-1.5">
                Constraints
              </h3>
              <ul className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 text-xs font-mono text-zinc-300 space-y-2 list-disc list-inside">
                <li><code className="text-indigo-300 font-bold">2 &lt;= nums.length &lt;= 10⁴</code></li>
                <li><code className="text-indigo-300 font-bold">-10⁹ &lt;= nums[i] &lt;= 10⁹</code></li>
                <li><code className="text-indigo-300 font-bold">-10⁹ &lt;= target &lt;= 10⁹</code></li>
                <li className="text-zinc-400 font-sans italic">Only one valid answer exists.</li>
              </ul>
            </div>

            {/* Collapsible Hints Accordion */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-[#30363d] pb-1.5 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Interview Hints ({hints.length})</span>
              </h3>

              <div className="space-y-2.5">
                {hints.map((hint, idx) => {
                  const isOpen = openHintIndex === idx;
                  return (
                    <div key={idx} className="border border-[#30363d] rounded-xl overflow-hidden bg-[#161b22]">
                      <button
                        onClick={() => setOpenHintIndex(isOpen ? null : idx)}
                        className="w-full text-left px-4 py-3 text-xs font-medium text-amber-300 hover:text-amber-200 flex items-center justify-between transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                          <span>Hint {idx + 1}</span>
                        </span>
                        <span className="text-zinc-500 font-mono">{isOpen ? 'Hide ▲' : 'Reveal ▼'}</span>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs text-zinc-300 border-t border-[#30363d] leading-relaxed bg-[#0d1117]">
                          {hint}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Editorial Tab */}
        {activeTab === 'editorial' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Official Solution Editorial</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Learn the step-by-step intuition, mathematical proof, and optimal Hash Map strategy for this problem.
              </p>
            </div>

            <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
              <h4 className="text-sm font-bold text-white">Approach 1: One-pass Hash Table (Optimal)</h4>
              <p>
                While iterating and inserting elements into the table, we also look back to check if the current element's complement (<code className="text-indigo-300">target - nums[i]</code>) already exists in the hash table.
              </p>

              <div className="p-3 bg-[#161b22] rounded-xl border border-[#30363d] font-mono text-xs space-y-1">
                <div className="text-emerald-400 font-bold">Time Complexity: O(N)</div>
                <div className="text-indigo-400 font-bold">Space Complexity: O(N)</div>
              </div>
            </div>
          </div>
        )}

        {/* Solutions Tab */}
        {activeTab === 'solutions' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white">Verified Multi-Language Implementations</h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 bg-[#161b22] rounded-xl border border-[#30363d]">
                <div className="text-indigo-400 font-bold mb-2">C++ Solution (Optimal Hash Map)</div>
                <pre className="text-zinc-300 leading-relaxed overflow-x-auto">
                  {`class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> mp;\n        for (int i = 0; i < nums.size(); i++) {\n            int diff = target - nums[i];\n            if (mp.count(diff)) return {mp[diff], i};\n            mp[nums[i]] = i;\n        }\n        return {};\n    }\n};`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Submissions History Tab */}
        {activeTab === 'submissions' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white">My Submissions History</h3>
            {loadingSubmissions ? (
              <div className="text-center text-xs text-zinc-500 py-8">Loading submission history...</div>
            ) : submissions.length > 0 ? (
              <div className="space-y-2 font-mono text-xs">
                {submissions.map((sub, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-emerald-400">{sub.status}</span>
                      <span className="text-zinc-500">•</span>
                      <span className="text-zinc-400">{sub.language?.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-4 text-zinc-400 text-[11px]">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-indigo-400" /> {sub.runtime} ms</span>
                      <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-purple-400" /> {sub.memory} MB</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-[#161b22] border border-[#30363d] text-center text-xs text-zinc-400">
                No past submissions found. Run or submit your code to view evaluation metrics!
              </div>
            )}
          </div>
        )}

        {/* Discussion Tab */}
        {activeTab === 'discussion' && (
          <div className="space-y-4 text-xs text-zinc-400">
            <h3 className="text-sm font-bold text-white">Community Discussion & Tips</h3>
            <p>Join the interview preparation community to discuss edge cases and optimizations.</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation Toolbar */}
      <div className="h-11 bg-[#161b22] border-t border-[#30363d] px-4 flex items-center justify-between text-xs text-zinc-400 shrink-0 select-none">
        <button
          onClick={() => navigate('/problems')}
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Problem</span>
        </button>

        <span className="font-mono text-[11px] text-zinc-400 font-medium">Problem 1 of 450</span>

        <button
          onClick={() => navigate('/problems')}
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          <span>Next Problem</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
