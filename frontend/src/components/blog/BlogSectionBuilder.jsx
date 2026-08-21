import React, { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Sparkles, Code, Sigma, Type, AlignLeft, Info, HelpCircle, Layers, FileCode } from 'lucide-react';

const STANDARD_DSA_TEMPLATE = [
  {
    type: 'heading',
    level: 2,
    content: 'Problem Overview & Intuition'
  },
  {
    type: 'paragraph',
    content: 'Explain the core intuition behind the problem. What key pattern or data structure makes this problem simple?'
  },
  {
    type: 'callout',
    calloutType: 'KEY IDEA',
    content: 'Summarize the single most important observation or invariant in 1-2 sentences.'
  },
  {
    type: 'heading',
    level: 2,
    content: 'Step-by-Step Approach'
  },
  {
    type: 'unordered-list',
    content: [
      'Initialize necessary pointers, hash maps, or data structures.',
      'Traverse through the input data while maintaining problem constraints.',
      'Return the final computed result.'
    ]
  },
  {
    type: 'heading',
    level: 2,
    content: 'Mathematical Formula & Relation'
  },
  {
    type: 'formula',
    title: 'Recurrence Relation / Complexity Formula',
    content: 'T(n) = 2T(n/2) + O(n)'
  },
  {
    type: 'heading',
    level: 2,
    content: 'Implementation'
  },
  {
    type: 'code',
    language: 'cpp',
    content: '// Complete C++ Solution\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int solve(vector<int>& nums) {\n        // Implementation goes here\n        return 0;\n    }\n};'
  },
  {
    type: 'heading',
    level: 2,
    content: 'Complexity Analysis'
  },
  {
    type: 'complexity',
    content: {
      time: 'O(N)',
      space: 'O(1)'
    }
  }
];

const QUICK_SOLUTION_TEMPLATE = [
  {
    type: 'heading',
    level: 2,
    content: 'Intuition'
  },
  {
    type: 'paragraph',
    content: 'Short explanation of how to solve the problem.'
  },
  {
    type: 'code',
    language: 'cpp',
    content: 'class Solution {\npublic:\n    // Solution code\n};'
  },
  {
    type: 'complexity',
    content: {
      time: 'O(N)',
      space: 'O(1)'
    }
  }
];

export default function BlogSectionBuilder({ contentRaw, onChange }) {
  const [activeMode, setActiveMode] = useState('visual'); // 'visual' | 'json'

  // Parse current contentRaw into sections array
  const getSectionsFromRaw = () => {
    try {
      const parsed = JSON.parse(contentRaw);
      return Array.isArray(parsed.sections) ? parsed.sections : [];
    } catch {
      return [];
    }
  };

  const sections = getSectionsFromRaw();

  const updateSections = (newSections) => {
    const jsonStr = JSON.stringify({ sections: newSections }, null, 2);
    onChange(jsonStr);
  };

  const handleApplyTemplate = (template) => {
    if (sections.length > 0 && !window.confirm('Replace current sections with selected template?')) {
      return;
    }
    updateSections(template);
  };

  const handleAddSection = (type) => {
    let newSec = { type, content: '' };
    if (type === 'heading') newSec = { type: 'heading', level: 2, content: 'Section Title' };
    if (type === 'code') newSec = { type: 'code', language: 'cpp', content: '// Write solution code here' };
    if (type === 'formula') newSec = { type: 'formula', title: 'Formula', content: '\\mathcal{O}(N \\log N)' };
    if (type === 'callout') newSec = { type: 'callout', calloutType: 'TIP', content: 'Key tip or observation' };
    if (type === 'unordered-list') newSec = { type: 'unordered-list', content: ['First step', 'Second step'] };
    if (type === 'complexity') newSec = { type: 'complexity', content: { time: 'O(N)', space: 'O(1)' } };

    updateSections([...sections, newSec]);
  };

  const handleUpdateSectionField = (index, field, value) => {
    const updated = [...sections];
    if (field === 'content') {
      updated[index].content = value;
    } else {
      updated[index][field] = value;
    }
    updateSections(updated);
  };

  const handleRemoveSection = (index) => {
    const updated = sections.filter((_, i) => i !== index);
    updateSections(updated);
  };

  const handleMoveSection = (index, direction) => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sections.length - 1)) return;
    const updated = [...sections];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    updateSections(updated);
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar: Templates & Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-bg-elevated/60 border border-border rounded-xl">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent shrink-0" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Load Preset Structure:</span>
          <button
            type="button"
            onClick={() => handleApplyTemplate(STANDARD_DSA_TEMPLATE)}
            className="px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/30 text-accent text-xs font-semibold hover:bg-accent hover:text-white transition-all flex items-center gap-1"
          >
            🌟 Full DSA Solution
          </button>
          <button
            type="button"
            onClick={() => handleApplyTemplate(QUICK_SOLUTION_TEMPLATE)}
            className="px-3 py-1.5 rounded-lg bg-bg-card border border-border text-text-secondary text-xs font-semibold hover:text-white transition-all"
          >
            ⚡ Quick Intuition
          </button>
        </div>

        <div className="flex items-center gap-1 bg-bg-card p-1 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setActiveMode('visual')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${activeMode === 'visual' ? 'bg-accent text-white shadow-sm' : 'text-text-muted hover:text-white'
              }`}
          >
            Visual Builder
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('json')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${activeMode === 'json' ? 'bg-accent text-white shadow-sm' : 'text-text-muted hover:text-white'
              }`}
          >
            Raw JSON Mode
          </button>
        </div>
      </div>

      {activeMode === 'visual' ? (
        <div className="space-y-3">
          {sections.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-border rounded-xl bg-bg-elevated/20">
              <Layers className="w-8 h-8 text-text-muted mx-auto mb-2" />
              <p className="text-sm font-semibold text-white mb-1">No content sections yet</p>
              <p className="text-xs text-text-muted mb-4">Click one of the preset templates above or add individual sections below.</p>
            </div>
          ) : (
            sections.map((sec, idx) => (
              <div key={idx} className="p-4 bg-bg-card border border-border rounded-xl space-y-3 relative group">
                <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-[11px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      {sec.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveSection(idx, 'up')}
                      className="p-1 text-text-muted hover:text-white disabled:opacity-30"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === sections.length - 1}
                      onClick={() => handleMoveSection(idx, 'down')}
                      className="p-1 text-text-muted hover:text-white disabled:opacity-30"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(idx)}
                      className="p-1 text-text-muted hover:text-red-400"
                      title="Delete section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Section Specific Inputs */}
                {sec.type === 'heading' && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <select
                      value={sec.level || 2}
                      onChange={(e) => handleUpdateSectionField(idx, 'level', Number(e.target.value))}
                      className="p-2 bg-bg-elevated border border-border rounded-lg text-xs text-white"
                    >
                      <option value={1}>H1 - Large Title</option>
                      <option value={2}>H2 - Major Section</option>
                      <option value={3}>H3 - Sub Heading</option>
                      <option value={4}>H4 - Small Label</option>
                    </select>
                    <input
                      type="text"
                      value={sec.content || ''}
                      onChange={(e) => handleUpdateSectionField(idx, 'content', e.target.value)}
                      placeholder="Heading Title..."
                      className="sm:col-span-3 p-2 bg-bg-elevated border border-border rounded-lg text-xs text-white font-bold"
                    />
                  </div>
                )}

                {sec.type === 'paragraph' && (
                  <div>
                    <textarea
                      rows={3}
                      value={sec.content || ''}
                      onChange={(e) => handleUpdateSectionField(idx, 'content', e.target.value)}
                      placeholder="Paragraph text... (supports **bold**, *italic*, `inline code`, and $LaTeX$ formula)"
                      className="w-full p-2.5 bg-bg-elevated border border-border rounded-lg text-xs text-white leading-relaxed"
                    />
                  </div>
                )}

                {sec.type === 'code' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-semibold text-text-muted">Language:</label>
                      <select
                        value={sec.language || 'cpp'}
                        onChange={(e) => handleUpdateSectionField(idx, 'language', e.target.value)}
                        className="p-1.5 bg-bg-elevated border border-border rounded-lg text-xs text-accent font-mono"
                      >
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="go">Go</option>
                        <option value="rust">Rust</option>
                        <option value="sql">SQL</option>
                      </select>
                    </div>
                    <textarea
                      rows={5}
                      value={sec.content || ''}
                      onChange={(e) => handleUpdateSectionField(idx, 'content', e.target.value)}
                      placeholder="Code snippet..."
                      className="w-full p-2.5 bg-[#0D1117] border border-border rounded-lg text-xs text-emerald-400 font-mono leading-relaxed"
                    />
                  </div>
                )}

                {sec.type === 'formula' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={sec.title || ''}
                      onChange={(e) => handleUpdateSectionField(idx, 'title', e.target.value)}
                      placeholder="Formula Title (e.g. Time Recurrence Relation)"
                      className="w-full p-2 bg-bg-elevated border border-border rounded-lg text-xs text-amber-400 font-bold"
                    />
                    <textarea
                      rows={2}
                      value={typeof sec.content === 'string' ? sec.content : ''}
                      onChange={(e) => handleUpdateSectionField(idx, 'content', e.target.value)}
                      placeholder="LaTeX Expression (e.g. \\mathcal{O}(N \\log N) or T(n) = 2T(n/2) + O(n))"
                      className="w-full p-2.5 bg-[#0A0A0A] border border-border rounded-lg text-xs text-amber-300 font-mono"
                    />
                  </div>
                )}

                {sec.type === 'callout' && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <select
                      value={sec.calloutType || 'TIP'}
                      onChange={(e) => handleUpdateSectionField(idx, 'calloutType', e.target.value)}
                      className="p-2 bg-bg-elevated border border-border rounded-lg text-xs text-accent font-bold"
                    >
                      <option value="TIP">TIP</option>
                      <option value="KEY IDEA">KEY IDEA</option>
                      <option value="IMPORTANT">IMPORTANT</option>
                      <option value="WARNING">WARNING</option>
                      <option value="DANGER">DANGER</option>
                    </select>
                    <input
                      type="text"
                      value={sec.content || ''}
                      onChange={(e) => handleUpdateSectionField(idx, 'content', e.target.value)}
                      placeholder="Callout text or key takeaway..."
                      className="sm:col-span-3 p-2 bg-bg-elevated border border-border rounded-lg text-xs text-white"
                    />
                  </div>
                )}

                {sec.type === 'unordered-list' && (
                  <div>
                    <textarea
                      rows={3}
                      value={Array.isArray(sec.content) ? sec.content.join('\n') : sec.content || ''}
                      onChange={(e) => handleUpdateSectionField(idx, 'content', e.target.value.split('\n'))}
                      placeholder="Enter list items (one item per line)..."
                      className="w-full p-2.5 bg-bg-elevated border border-border rounded-lg text-xs text-white"
                    />
                  </div>
                )}

                {sec.type === 'complexity' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-text-muted mb-1">Time Complexity:</label>
                      <input
                        type="text"
                        value={sec.content?.time || 'O(N)'}
                        onChange={(e) =>
                          handleUpdateSectionField(idx, 'content', {
                            ...(typeof sec.content === 'object' ? sec.content : {}),
                            time: e.target.value
                          })
                        }
                        className="w-full p-2 bg-bg-elevated border border-border rounded-lg text-xs text-emerald-400 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-text-muted mb-1">Space Complexity:</label>
                      <input
                        type="text"
                        value={sec.content?.space || 'O(1)'}
                        onChange={(e) =>
                          handleUpdateSectionField(idx, 'content', {
                            ...(typeof sec.content === 'object' ? sec.content : {}),
                            space: e.target.value
                          })
                        }
                        className="w-full p-2 bg-bg-elevated border border-border rounded-lg text-xs text-emerald-400 font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Add Section Buttons Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
            <span className="text-xs font-bold text-text-muted uppercase">Add Section:</span>
            <button
              type="button"
              onClick={() => handleAddSection('heading')}
              className="px-2.5 py-1 rounded bg-bg-elevated border border-border text-xs text-white hover:border-accent"
            >
              + Heading
            </button>
            <button
              type="button"
              onClick={() => handleAddSection('paragraph')}
              className="px-2.5 py-1 rounded bg-bg-elevated border border-border text-xs text-white hover:border-accent"
            >
              + Paragraph
            </button>
            <button
              type="button"
              onClick={() => handleAddSection('code')}
              className="px-2.5 py-1 rounded bg-bg-elevated border border-border text-xs text-emerald-400 hover:border-emerald-400"
            >
              + Code Block
            </button>
            <button
              type="button"
              onClick={() => handleAddSection('formula')}
              className="px-2.5 py-1 rounded bg-bg-elevated border border-border text-xs text-amber-400 hover:border-amber-400"
            >
              + Math Formula
            </button>
            <button
              type="button"
              onClick={() => handleAddSection('callout')}
              className="px-2.5 py-1 rounded bg-bg-elevated border border-border text-xs text-sky-400 hover:border-sky-400"
            >
              + Callout
            </button>
            <button
              type="button"
              onClick={() => handleAddSection('unordered-list')}
              className="px-2.5 py-1 rounded bg-bg-elevated border border-border text-xs text-white hover:border-accent"
            >
              + Bullet List
            </button>
            <button
              type="button"
              onClick={() => handleAddSection('complexity')}
              className="px-2.5 py-1 rounded bg-bg-elevated border border-border text-xs text-accent hover:border-accent"
            >
              + Complexity
            </button>
          </div>
        </div>
      ) : (
        <div>
          <textarea
            rows={12}
            value={contentRaw}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 font-mono bg-[#0A0A0A] border border-border rounded-xl text-emerald-400 text-xs focus:border-accent leading-relaxed"
          />
        </div>
      )}
    </div>
  );
}
