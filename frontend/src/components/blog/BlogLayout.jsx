import React from 'react';
import TableOfContents from './TableOfContents';
import AdBanner from './AdBanner';

export default function BlogLayout({ children, toc = [], title }) {
  return (
    <div className="h-[calc(100vh-4rem)] bg-[#090909] text-text-primary pt-6 pb-6 font-sans overflow-hidden">
      <div className="container-xl px-4 sm:px-6 h-full flex flex-col">
        
        {/* Mobile Collapsible TOC (Hidden on desktop) */}
        <TableOfContents sections={toc} isMobile={true} />

        {/* 3-Column Desktop Grid */}
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-10 items-start justify-center flex-1 min-h-0 h-full">
          
          {/* Left Sidebar - Table of Contents (220–260px) */}
          <aside className="hidden lg:block w-[240px] shrink-0 h-full overflow-y-auto no-scrollbar py-2">
            <TableOfContents sections={toc} />
          </aside>

          {/* Center Main Article Content (700–780px) */}
          <main className="flex-1 w-full max-w-[760px] min-w-0 mx-auto h-full overflow-y-auto no-scrollbar py-2">
            {children}
          </main>

          {/* Right Sidebar - Sticky Advertisement (250–320px) */}
          <aside className="hidden xl:block w-[280px] shrink-0 h-full overflow-y-auto no-scrollbar space-y-6 py-2">
            <AdBanner type="square" />
            <AdBanner type="tall" />
          </aside>
          
          {/* Mobile/Tablet Ad Banner */}
          <div className="w-full xl:hidden flex justify-center mt-12">
            <AdBanner type="horizontal" />
          </div>

        </div>
      </div>
    </div>
  );
}
