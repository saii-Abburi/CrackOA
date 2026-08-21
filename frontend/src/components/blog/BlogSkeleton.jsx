import React from 'react';

export default function BlogSkeleton() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-text-primary pt-8 pb-16 animate-pulse">
      <div className="container-xl px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-start justify-center">
          
          {/* Left TOC Skeleton */}
          <aside className="hidden lg:block w-[240px] shrink-0 space-y-3 pt-6">
            <div className="h-4 w-24 bg-white/10 rounded" />
            <div className="h-3 w-36 bg-white/5 rounded" />
            <div className="h-3 w-44 bg-white/5 rounded" />
            <div className="h-3 w-40 bg-white/5 rounded" />
            <div className="h-3 w-32 bg-white/5 rounded" />
          </aside>

          {/* Center Main Article Skeleton */}
          <main className="flex-1 w-full max-w-[760px] min-w-0 space-y-6">
            {/* Breadcrumb skeleton */}
            <div className="h-3 w-48 bg-white/10 rounded" />
            
            {/* Badges skeleton */}
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-white/10 rounded" />
              <div className="h-6 w-24 bg-white/5 rounded" />
            </div>

            {/* Title skeleton */}
            <div className="h-12 w-3/4 bg-white/15 rounded-xl" />
            <div className="h-4 w-40 bg-white/10 rounded" />

            {/* Problem Info Card skeleton */}
            <div className="h-24 w-full bg-[#151515] border border-white/10 rounded-xl" />

            {/* Paragraph skeletons */}
            <div className="space-y-3 pt-4">
              <div className="h-4 w-full bg-white/10 rounded" />
              <div className="h-4 w-11/12 bg-white/10 rounded" />
              <div className="h-4 w-4/5 bg-white/10 rounded" />
            </div>

            {/* Codeblock skeleton */}
            <div className="h-48 w-full bg-[#111111] border border-white/10 rounded-xl" />

            {/* Paragraph skeletons */}
            <div className="space-y-3">
              <div className="h-4 w-full bg-white/10 rounded" />
              <div className="h-4 w-9/12 bg-white/10 rounded" />
            </div>
          </main>

          {/* Right Ad Skeleton */}
          <aside className="hidden xl:block w-[300px] shrink-0">
            <div className="h-[250px] w-[300px] bg-[#151515] border border-white/10 rounded-xl" />
          </aside>

        </div>
      </div>
    </div>
  );
}
