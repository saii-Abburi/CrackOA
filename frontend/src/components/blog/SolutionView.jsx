import React from 'react';
import { ExternalLink, User, Calendar, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock';
import ComplexityCard from './ComplexityCard';

const difficultyColors = {
  Easy: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  Medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  Hard: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

const platformIcons = {
  LeetCode: '🟡',
  GeeksforGeeks: '🟢',
  Codeforces: '🔵',
  HackerRank: '🟩',
  CodeChef: '⭐',
  Other: '📋',
};

// Markdown components matching existing BlogContent styling
const markdownComponents = {
  h1({ children }) {
    return <h3 className="text-xl font-bold text-white mt-6 mb-3">{children}</h3>;
  },
  h2({ children }) {
    return <h4 className="text-lg font-bold text-white mt-5 mb-2">{children}</h4>;
  },
  h3({ children }) {
    return <h5 className="text-base font-bold text-white mt-4 mb-2">{children}</h5>;
  },
  p({ children }) {
    return <p className="text-[16px] leading-[1.75] text-[#A1A1AA] mb-4">{children}</p>;
  },
  strong({ children }) {
    return <strong className="font-bold text-white">{children}</strong>;
  },
  em({ children }) {
    return <em className="italic text-[#E4E4E7]">{children}</em>;
  },
  code({ node, inline, className, children, ...props }) {
    const codeString = String(children).replace(/\n$/, '');
    if (!inline && codeString.includes('\n')) {
      const match = /language-(\w+)/.exec(className || '');
      return <CodeBlock code={codeString} language={match?.[1] || 'text'} />;
    }
    return (
      <code className="px-1.5 py-0.5 rounded bg-[#151515] border border-white/10 text-[#FF5700] font-mono text-xs font-medium">
        {children}
      </code>
    );
  },
  ul({ children }) {
    return <ul className="list-disc list-outside pl-6 mb-4 space-y-1.5 text-[15px] text-[#A1A1AA]">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="list-decimal list-outside pl-6 mb-4 space-y-1.5 text-[15px] text-[#A1A1AA]">{children}</ol>;
  },
  li({ children }) {
    return <li className="leading-relaxed">{children}</li>;
  },
  blockquote({ children }) {
    return (
      <blockquote className="border-l-4 border-[#FF5700] bg-[#121212] p-4 my-4 rounded-r-xl text-[#E4E4E7] italic font-medium">
        {children}
      </blockquote>
    );
  },
  a({ href, children }) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#FF5700] hover:underline font-semibold">
        {children}
      </a>
    );
  },
  table({ children }) {
    return (
      <div className="overflow-x-auto my-4 border border-white/10 rounded-xl bg-[#121212] shadow-lg">
        <table className="w-full text-left text-sm text-[#A1A1AA]">{children}</table>
      </div>
    );
  },
  thead({ children }) {
    return <thead className="bg-[#18181B] text-white uppercase text-xs tracking-wider border-b border-white/10">{children}</thead>;
  },
  th({ children }) {
    return <th className="px-4 py-3 font-bold text-[#FF5700]">{children}</th>;
  },
  td({ children }) {
    return <td className="px-4 py-3 border-b border-white/5">{children}</td>;
  },
};

/**
 * SolutionView — Renders a published CODING_SOLUTION blog in LeetCode editorial format.
 * Reuses CodeBlock, ComplexityCard and markdown rendering from the existing system.
 */
export default function SolutionView({ blog }) {
  if (!blog) return null;

  const {
    title,
    author,
    publishedAt,
    platform,
    difficulty,
    problemUrl,
    tags = [],
    excerpt,
    intuition,
    approach,
    timeComplexity,
    spaceComplexity,
    code,
    codeLanguage = 'cpp',
    readingTime,
  } = blog;

  const dateStr = publishedAt
    ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(publishedAt))
    : 'Recently';

  const authorName = typeof author === 'object' ? author?.name : 'Anonymous';

  return (
    <article id="blog-content" className="space-y-8 max-w-[760px]">
      {/* ── Title & Meta ── */}
      <header className="space-y-5 pb-6 border-b border-white/10">
        <h1 className="text-[28px] sm:text-[36px] lg:text-[42px] font-extrabold text-white leading-[1.15] tracking-tight">
          {title}
        </h1>

        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-3">
          {difficulty && (
            <span className={`px-2.5 py-1 rounded text-xs font-extrabold uppercase tracking-wider ${difficultyColors[difficulty] || difficultyColors.Medium}`}>
              {difficulty}
            </span>
          )}
          {platform && (
            <span className="px-2.5 py-1 rounded bg-[#151515] border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5">
              <span>{platformIcons[platform] || '📋'}</span>
              {platform}
            </span>
          )}
          {tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 rounded bg-[#151515] border border-white/10 text-[#A1A1AA] text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>

        {/* Author & Date */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#71717A] font-medium">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span className="text-white">{authorName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{dateStr}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{readingTime || 5} min read</span>
          </div>
        </div>

        {/* View Problem Link */}
        {problemUrl && (
          <a
            href={problemUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent border border-accent/20 rounded-xl text-sm font-bold hover:bg-accent hover:text-white transition-all"
          >
            View Problem <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </header>

      {/* ── Problem Statement ── */}
      {excerpt && (
        <section id="problem-statement">
          <h2 id="problem-statement" className="text-[24px] sm:text-[28px] font-bold text-white mb-4 pb-2 border-b border-white/10 flex items-center gap-2.5">
            <span className="w-1.5 h-6 rounded-full bg-sky-500 inline-block shrink-0" />
            Problem Statement
          </h2>
          <div className="text-[#A1A1AA] max-w-[760px]">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {excerpt}
            </ReactMarkdown>
          </div>
        </section>
      )}

      {/* ── Intuition ── */}
      {intuition && (
        <section id="intuition">
          <h2 id="intuition" className="text-[24px] sm:text-[28px] font-bold text-white mb-4 pb-2 border-b border-white/10 flex items-center gap-2.5">
            <span className="w-1.5 h-6 rounded-full bg-amber-500 inline-block shrink-0" />
            Intuition
          </h2>
          <div className="text-[#A1A1AA] max-w-[760px]">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {intuition}
            </ReactMarkdown>
          </div>
        </section>
      )}

      {/* ── Approach ── */}
      {approach && (
        <section id="approach">
          <h2 id="approach" className="text-[24px] sm:text-[28px] font-bold text-white mb-4 pb-2 border-b border-white/10 flex items-center gap-2.5">
            <span className="w-1.5 h-6 rounded-full bg-emerald-500 inline-block shrink-0" />
            Approach
          </h2>
          <div className="text-[#A1A1AA] max-w-[760px]">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {approach}
            </ReactMarkdown>
          </div>
        </section>
      )}

      {/* ── Complexity Analysis ── */}
      {(timeComplexity || spaceComplexity) && (
        <section id="complexity">
          <h2 id="complexity" className="text-[24px] sm:text-[28px] font-bold text-white mb-4 pb-2 border-b border-white/10 flex items-center gap-2.5">
            <span className="w-1.5 h-6 rounded-full bg-purple-500 inline-block shrink-0" />
            Complexity Analysis
          </h2>
          <ComplexityCard time={timeComplexity || 'N/A'} space={spaceComplexity || 'N/A'} />
        </section>
      )}

      {/* ── Code ── */}
      {code && (
        <section id="code">
          <h2 id="code" className="text-[24px] sm:text-[28px] font-bold text-white mb-4 pb-2 border-b border-white/10 flex items-center gap-2.5">
            <span className="w-1.5 h-6 rounded-full bg-[#FF5700] inline-block shrink-0" />
            Code
          </h2>
          <CodeBlock code={code} language={codeLanguage} />
        </section>
      )}
    </article>
  );
}
