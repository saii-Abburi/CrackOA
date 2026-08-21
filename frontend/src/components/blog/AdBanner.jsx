import React from 'react';

export default function AdBanner({ type = 'square' }) {
  const getDimensions = () => {
    switch (type) {
      case 'tall':
        return 'w-full max-w-[260px] h-[500px]';
      case 'horizontal':
        return 'w-full max-w-[728px] h-[90px]';
      case 'square':
      default:
        return 'w-full max-w-[260px] h-[250px]';
    }
  };

  return (
    <div
      className={`
        ${getDimensions()}
        bg-[#121215] border border-white/10 border-dashed rounded-2xl
        flex flex-col items-center justify-center text-center p-4 text-[#71717A]
        mx-auto shadow-sm select-none transition-all hover:border-white/20
      `}
    >
      <span className="text-[11px] uppercase tracking-widest font-extrabold text-[#FF5700]/70 mb-1">
        Advertisement
      </span>
      <span className="text-[10px] opacity-60 font-mono">Space reserved for AdSense</span>
    </div>
  );
}
