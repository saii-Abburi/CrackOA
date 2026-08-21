import React from 'react';
import { Cpu, HardDrive } from 'lucide-react';

export default function ComplexityCard({ time = 'O(N)', space = 'O(1)' }) {
  return (
    <div className="my-6 p-5 rounded-2xl border border-white/10 bg-[#121212] shadow-lg max-w-[760px]">
      <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#71717A] block mb-4">
        COMPLEXITY ANALYSIS
      </span>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3.5 rounded-xl bg-[#18181B] border border-white/5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#71717A] block">Time Complexity</span>
            <span className="text-base font-extrabold text-white font-mono">{time}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#18181B] border border-white/5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#71717A] block">Space Complexity</span>
            <span className="text-base font-extrabold text-white font-mono">{space}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
