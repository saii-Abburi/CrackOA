import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Sigma } from 'lucide-react';

export default function FormulaBlock({ formula, title, inline = false }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && formula) {
      try {
        katex.render(formula, containerRef.current, {
          displayMode: !inline,
          throwOnError: false,
        });
      } catch (err) {
        if (containerRef.current) {
          containerRef.current.innerText = formula;
        }
      }
    }
  }, [formula, inline]);

  if (inline) {
    return <span ref={containerRef} className="font-mono text-amber-300 px-1" />;
  }

  return (
    <div className="my-6 p-4 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-bg-card to-bg-card shadow-lg overflow-x-auto">
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-border/50 text-xs font-semibold text-amber-400">
        <div className="flex items-center gap-1.5 uppercase tracking-wider">
          <Sigma className="w-4 h-4 text-amber-400" />
          <span>{title || 'Mathematical Formula / Relation'}</span>
        </div>
        <span className="text-[10px] text-text-muted font-mono">LaTeX</span>
      </div>
      <div className="py-2 text-center text-white text-base overflow-x-auto no-scrollbar">
        <div ref={containerRef} />
      </div>
    </div>
  );
}
