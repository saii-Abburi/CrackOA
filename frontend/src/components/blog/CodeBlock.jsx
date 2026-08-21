import React, { useState } from 'react';
import { Copy, Check, Code2 } from 'lucide-react';

export default function CodeBlock({ code, language = 'cpp' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code', err);
    }
  };

  const lines = typeof code === 'string' ? code.split('\n') : [];
  const normalizedLang = (language || 'text').toLowerCase();

  const getLangDisplayName = (lang) => {
    switch (lang) {
      case 'cpp':
      case 'c++':
        return 'C++';
      case 'java':
        return 'Java';
      case 'python':
      case 'py':
        return 'Python';
      case 'javascript':
      case 'js':
        return 'JavaScript';
      case 'typescript':
      case 'ts':
        return 'TypeScript';
      case 'go':
        return 'Go';
      case 'rust':
        return 'Rust';
      case 'sql':
        return 'SQL';
      default:
        return lang.toUpperCase();
    }
  };

  return (
    <div className="relative my-7 rounded-2xl overflow-hidden border border-white/10 bg-[#0D1117] shadow-xl max-w-[760px]">
      {/* Codeblock Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161B22] border-b border-white/10 select-none">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5 mr-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          <Code2 className="w-3.5 h-3.5 text-[#FF5700]" />
          <span className="text-xs font-mono font-bold text-white tracking-wider">
            {getLangDisplayName(normalizedLang)}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-white px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-medium"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied ✓</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area with Line Numbers */}
      <div className="p-4 overflow-x-auto no-scrollbar font-mono text-sm leading-relaxed flex">
        {/* Line numbers */}
        <div className="select-none text-[#71717A]/40 text-right pr-4 border-r border-white/10 shrink-0 font-mono text-xs leading-relaxed space-y-0.5">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Code Content */}
        <pre className="pl-4 text-[#E6EDE3] overflow-x-auto whitespace-pre font-mono text-xs sm:text-sm leading-relaxed w-full">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
