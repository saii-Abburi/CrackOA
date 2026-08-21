import React from 'react';
import { Lightbulb, AlertTriangle, Info, AlertCircle, Bookmark } from 'lucide-react';

export default function Callout({ type = 'TIP', content }) {
  let borderColor = 'border-[#FF5700]';
  let bgColor = 'bg-[#FF5700]/5';
  let titleColor = 'text-[#FF5700]';
  let Icon = Lightbulb;
  let title = type;

  switch (String(type).toUpperCase()) {
    case 'KEY IDEA':
    case 'TIP':
      borderColor = 'border-[#FF5700]';
      bgColor = 'bg-[#FF5700]/5';
      titleColor = 'text-[#FF5700]';
      Icon = Lightbulb;
      title = type === 'KEY IDEA' ? 'KEY IDEA' : 'TIP';
      break;
    case 'IMPORTANT':
    case 'NOTE':
      borderColor = 'border-sky-500';
      bgColor = 'bg-sky-500/5';
      titleColor = 'text-sky-400';
      Icon = Bookmark;
      title = type;
      break;
    case 'WARNING':
      borderColor = 'border-amber-500';
      bgColor = 'bg-amber-500/5';
      titleColor = 'text-amber-400';
      Icon = AlertTriangle;
      break;
    case 'DANGER':
      borderColor = 'border-red-500';
      bgColor = 'bg-red-500/5';
      titleColor = 'text-red-400';
      Icon = AlertCircle;
      break;
    default:
      borderColor = 'border-white/20';
      bgColor = 'bg-[#121212]';
      titleColor = 'text-white';
  }

  return (
    <div className={`my-6 p-4 rounded-xl border-l-4 ${borderColor} ${bgColor} flex gap-4 items-start shadow-sm max-w-[760px]`}>
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${titleColor}`} />
      <div>
        <span className={`block text-xs font-bold uppercase tracking-wider mb-1 ${titleColor}`}>
          {title}
        </span>
        <div className="text-sm sm:text-base leading-relaxed text-[#D4D4D8]">
          {content}
        </div>
      </div>
    </div>
  );
}
