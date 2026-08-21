import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const LANGUAGE_LABELS = {
  cpp: 'C++',
  'c++': 'C++',
  java: 'Java',
  python: 'Python',
  py: 'Python',
  javascript: 'JavaScript',
  js: 'JavaScript',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  csharp: 'C#',
  cs: 'C#',
  go: 'Go',
  rust: 'Rust',
  sql: 'SQL',
};

export default function CodeTabs({ codeMap = {}, defaultLanguage }) {
  // Normalize codeMap entries: ignore empty/blank string values
  const availableLanguages = Object.keys(codeMap).filter(
    (lang) => typeof codeMap[lang] === 'string' && codeMap[lang].trim().length > 0
  );

  // Determine initial active language
  const initialLang =
    defaultLanguage && availableLanguages.includes(defaultLanguage)
      ? defaultLanguage
      : availableLanguages[0] || 'cpp';

  const [activeLang, setActiveLang] = useState(initialLang);
  const [copied, setCopied] = useState(false);

  if (availableLanguages.length === 0) {
    return null;
  }

  const currentCode = codeMap[activeLang] || '';
  const lines = currentCode.split('\n');

  const getDisplayName = (langKey) => {
    const key = langKey.toLowerCase();
    return LANGUAGE_LABELS[key] || langKey.toUpperCase();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code to clipboard', err);
    }
  };

  return (
    <div className="relative my-6 rounded-2xl overflow-hidden border border-white/10 bg-[#0D1117] shadow-xl max-w-[760px]">
      {/* Header with Language Tabs & Copy Button */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161B22] border-b border-white/10 select-none flex-wrap gap-2">
        {/* Dynamic Language Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <div className="flex gap-1.5 mr-3 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>

          <div className="flex items-center gap-1">
            {availableLanguages.map((langKey) => {
              const isActive = activeLang === langKey;
              return (
                <button
                  key={langKey}
                  onClick={() => setActiveLang(langKey)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    isActive
                      ? 'bg-[#FF5700] text-white shadow-md'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {getDisplayName(langKey)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-white px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-medium shrink-0 ml-auto"
          aria-label="Copy code snippet"
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

      {/* Code Viewer Area with Line Numbers */}
      <div className="p-4 overflow-x-auto no-scrollbar font-mono text-sm leading-relaxed flex">
        {/* Line Numbers */}
        <div className="select-none text-[#71717A]/40 text-right pr-4 border-r border-white/10 shrink-0 font-mono text-xs leading-relaxed space-y-0.5">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Code Content */}
        <pre className="pl-4 text-[#E6EDE3] overflow-x-auto whitespace-pre font-mono text-xs sm:text-sm leading-relaxed w-full">
          <code>{currentCode}</code>
        </pre>
      </div>
    </div>
  );
}
