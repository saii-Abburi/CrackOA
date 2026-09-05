import { useState, useMemo } from 'react';
import { Eye, Edit3, Loader2, AlertCircle, Sparkles, ExternalLink, Code2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock';
import ComplexityCard from './ComplexityCard';
import { parseSolutionMarkdown, buildSolutionMarkdown, DEFAULT_LEETCODE_TEMPLATE } from '../../utils/solutionParser';

const PLATFORMS = ['LeetCode', 'GeeksforGeeks', 'Codeforces', 'HackerRank', 'CodeChef', 'Other'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const difficultyColors = {
  Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Hard: 'bg-red-500/10 text-red-400 border-red-500/30',
};

/**
 * Single-Input LeetCode-Style Solution Editor
 * The author writes/pastes everything into ONE single editor.
 * CodeRank automatically parses # Intuition, # Approach, # Complexity, # Code.
 */
export default function CodingSolutionEditor({ blog, onSave, onClose, saving, error }) {
  const [mode, setMode] = useState('edit'); // 'edit' | 'preview'
  const [title, setTitle] = useState(blog?.title || '');
  const [slug, setSlug] = useState(blog?.slug || '');
  const [platform, setPlatform] = useState(blog?.platform || 'LeetCode');
  const [difficulty, setDifficulty] = useState(blog?.difficulty || 'Medium');
  const [problemUrl, setProblemUrl] = useState(blog?.problemUrl || '');
  const [tags, setTags] = useState(blog?.tags?.join(', ') || '');
  const [content, setContent] = useState(() => buildSolutionMarkdown(blog));

  // Automatically parse markdown into structured fields in real-time
  const parsed = useMemo(() => parseSolutionMarkdown(content), [content]);

  // Auto-generate slug from title
  const handleTitleChange = (val) => {
    setTitle(val);
    if (!blog) {
      const generated = val.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-');
      setSlug(generated);
    }
  };

  const handleInsertTemplate = () => {
    if (content.trim() && !window.confirm('Replace existing content with standard LeetCode template?')) {
      return;
    }
    setContent(DEFAULT_LEETCODE_TEMPLATE);
  };

  const handleInsertSection = (sectionName, templateStr) => {
    setContent((prev) => prev.trim() + '\n\n' + templateStr);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const tagsArray = tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    // Save with both parsed structured fields AND raw markdown
    onSave({
      title,
      slug,
      blogType: 'CODING_SOLUTION',
      platform,
      problemUrl,
      difficulty,
      tags: tagsArray,
      excerpt: parsed.excerpt,
      intuition: parsed.intuition,
      approach: parsed.approach,
      timeComplexity: parsed.timeComplexity,
      spaceComplexity: parsed.spaceComplexity,
      code: parsed.code,
      codeLanguage: parsed.codeLanguage,
      rawMarkdown: content,
    });
  };

  const inputClass = 'w-full bg-bg-card border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:border-accent focus:outline-none transition-colors';
  const labelClass = 'block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1.5';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#121215] border border-white/15 rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">

        {/* ── Top Bar Header ── */}
        <div className="px-6 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#1A1A20] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                {blog ? 'Edit Solution' : 'Write Solution Editorial'}
              </h2>
              <p className="text-[11px] text-text-muted">Single-input LeetCode Markdown parser</p>
            </div>
          </div>

          {/* Mode Switcher & Close */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-bg-card p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setMode('edit')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  mode === 'edit' ? 'bg-accent text-white shadow-sm' : 'text-text-muted hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                type="button"
                onClick={() => setMode('preview')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  mode === 'preview' ? 'bg-accent text-white shadow-sm' : 'text-text-muted hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Live Preview
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-text-muted hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Form Body ── */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          
          {/* Metadata Row (Title, Platform, Difficulty, Tags, URL) */}
          <div className="p-4 bg-[#16161B] border-b border-white/10 shrink-0 space-y-3">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-6">
                <label className={labelClass}>Solution Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Clean 2-Pointer Greedy Solution with O(N) Time"
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-3">
                <label className={labelClass}>Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className={inputClass}
                >
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className={labelClass}>Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className={inputClass}
                >
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-6">
                <label className={labelClass}>Problem URL (Optional)</label>
                <input
                  type="url"
                  value={problemUrl}
                  onChange={(e) => setProblemUrl(e.target.value)}
                  placeholder="https://leetcode.com/problems/..."
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-6">
                <label className={labelClass}>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Array, Greedy, Two Pointers"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* ── Main Editor Area ── */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {mode === 'edit' ? (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Toolbar */}
                <div className="px-4 py-2 bg-[#141418] border-b border-white/10 flex flex-wrap items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-text-muted uppercase mr-1">Quick Add:</span>
                    <button
                      type="button"
                      onClick={() => handleInsertSection('Intuition', '# Intuition\nDescribe your first thoughts...')}
                      className="px-2.5 py-1 rounded bg-bg-card border border-white/10 hover:border-accent text-[11px] text-text-secondary hover:text-white transition-all font-semibold"
                    >
                      + Intuition
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertSection('Approach', '# Approach\n1. Step one\n2. Step two')}
                      className="px-2.5 py-1 rounded bg-bg-card border border-white/10 hover:border-accent text-[11px] text-text-secondary hover:text-white transition-all font-semibold"
                    >
                      + Approach
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertSection('Complexity', '# Complexity\n- Time complexity: O(n)\n- Space complexity: O(1)')}
                      className="px-2.5 py-1 rounded bg-bg-card border border-white/10 hover:border-accent text-[11px] text-text-secondary hover:text-white transition-all font-semibold"
                    >
                      + Complexity
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertSection('Code', '# Code\n```cpp\n// Your solution code\n```')}
                      className="px-2.5 py-1 rounded bg-bg-card border border-white/10 hover:border-emerald-500 text-[11px] text-emerald-400 transition-all font-semibold"
                    >
                      + Code
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleInsertTemplate}
                    className="px-3 py-1 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent hover:text-white text-[11px] font-bold transition-all flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Insert LeetCode Scaffolding
                  </button>
                </div>

                {/* Single Markdown Textarea */}
                <div className="flex-1 p-4 overflow-hidden flex flex-col bg-[#0A0A0C]">
                  <textarea
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="# Intuition&#10;Write your intuition here...&#10;&#10;# Approach&#10;Explain step-by-step...&#10;&#10;# Complexity&#10;- Time complexity: O(n)&#10;- Space complexity: O(1)&#10;&#10;# Code&#10;```python&#10;class Solution:&#10;    def solve(self):&#10;        pass&#10;```"
                    className="flex-1 w-full bg-transparent text-white font-mono text-xs sm:text-sm leading-relaxed resize-none focus:outline-none placeholder:text-text-muted/40 p-2 overflow-y-auto"
                    spellCheck={false}
                  />
                </div>
              </div>
            ) : (
              /* ── Live Preview Mode ── */
              <div className="flex-1 overflow-y-auto p-6 max-w-[760px] mx-auto w-full space-y-8">
                {/* Header Preview */}
                <header className="space-y-4 pb-4 border-b border-white/10">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
                    {title || 'Untitled Solution'}
                  </h1>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {difficulty && (
                      <span className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider border ${difficultyColors[difficulty] || difficultyColors.Medium}`}>
                        {difficulty}
                      </span>
                    )}
                    {platform && (
                      <span className="px-2.5 py-1 rounded bg-[#151515] border border-white/10 text-white text-xs font-semibold">
                        {platform}
                      </span>
                    )}
                    {tags.split(',').filter(t => t.trim()).map(tag => (
                      <span key={tag.trim()} className="px-2.5 py-1 rounded bg-[#151515] border border-white/10 text-[#A1A1AA] text-xs font-medium">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>

                  {problemUrl && (
                    <a
                      href={problemUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-accent font-bold hover:underline"
                    >
                      View Problem on {platform} <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </header>

                {/* Problem Statement / Excerpt */}
                {parsed.excerpt && parsed.excerpt !== parsed.intuition && (
                  <section>
                    <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2.5">
                      <span className="w-1.5 h-6 rounded-full bg-sky-500 inline-block" />
                      Problem Statement
                    </h2>
                    <div className="text-[#A1A1AA] text-sm leading-relaxed prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsed.excerpt}</ReactMarkdown>
                    </div>
                  </section>
                )}

                {/* Intuition */}
                {parsed.intuition && (
                  <section>
                    <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2.5">
                      <span className="w-1.5 h-6 rounded-full bg-amber-500 inline-block" />
                      Intuition
                    </h2>
                    <div className="text-[#A1A1AA] text-sm leading-relaxed prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsed.intuition}</ReactMarkdown>
                    </div>
                  </section>
                )}

                {/* Approach */}
                {parsed.approach && (
                  <section>
                    <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2.5">
                      <span className="w-1.5 h-6 rounded-full bg-emerald-500 inline-block" />
                      Approach
                    </h2>
                    <div className="text-[#A1A1AA] text-sm leading-relaxed prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsed.approach}</ReactMarkdown>
                    </div>
                  </section>
                )}

                {/* Complexity */}
                {(parsed.timeComplexity || parsed.spaceComplexity) && (
                  <section>
                    <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2.5">
                      <span className="w-1.5 h-6 rounded-full bg-purple-500 inline-block" />
                      Complexity
                    </h2>
                    <ComplexityCard time={parsed.timeComplexity} space={parsed.spaceComplexity} />
                  </section>
                )}

                {/* Code Block */}
                {parsed.code && (
                  <section>
                    <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2.5">
                      <span className="w-1.5 h-6 rounded-full bg-[#FF5700] inline-block" />
                      Code
                    </h2>
                    <CodeBlock code={parsed.code} language={parsed.codeLanguage} />
                  </section>
                )}

                {!parsed.intuition && !parsed.approach && !parsed.code && (
                  <div className="py-16 text-center text-text-muted">
                    <p className="text-sm font-semibold">Nothing to preview yet</p>
                    <p className="text-xs mt-1">Switch to Edit mode and start writing your solution with # Intuition, # Approach, etc.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Footer Bottom Actions ── */}
          <div className="px-6 py-3 bg-[#1A1A20] border-t border-white/10 flex items-center justify-between shrink-0">
            <div className="text-xs text-text-muted flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Parsed: <strong>{parsed.codeLanguage || 'text'}</strong> ({parsed.code ? 'Code found' : 'No code'}) · <strong>{parsed.timeComplexity}</strong></span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-text-muted hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{blog ? 'Update Solution' : 'Publish Solution'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
