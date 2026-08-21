import React, { useState, useEffect } from 'react';
import { List, ChevronDown, ChevronRight } from 'lucide-react';

export default function TableOfContents({ sections = [], isMobile = false }) {
  const [activeId, setActiveId] = useState('');
  const [extractedHeadings, setExtractedHeadings] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Extract H2 & H3 headings dynamically from #blog-content container
  useEffect(() => {
    const extractHeadings = () => {
      let items = [];

      if (Array.isArray(sections) && sections.length > 0) {
        sections.forEach((sec) => {
          if (sec.type === 'heading' && sec.content) {
            const text = typeof sec.content === 'string' ? sec.content : String(sec.content);
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            items.push({
              id,
              text: text.trim(),
              level: Number(sec.level) || 2,
            });
          }
        });
      }

      // Query headings directly from #blog-content element
      if (items.length === 0) {
        const headingEls = Array.from(
          document.querySelectorAll('#blog-content h2, #blog-content h3')
        );

        items = headingEls
          .map((el) => {
            const text = el.textContent.trim();
            if (!text) return null;
            if (!el.id) {
              el.id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            }
            return {
              id: el.id,
              text,
              level: Number(el.tagName.replace('H', '')) || 2,
            };
          })
          .filter(Boolean);
      }

      // Filter out unwanted header titles & deduplicate by ID
      const ignoredTexts = ['on this page', 'comments', 'solve on leetcode'];
      const seenIds = new Set();
      const uniqueItems = [];

      items.forEach((item) => {
        const normalizedText = item.text.toLowerCase();
        if (ignoredTexts.includes(normalizedText)) return;
        if (seenIds.has(item.id)) return;

        seenIds.add(item.id);
        uniqueItems.push(item);
      });

      setExtractedHeadings(uniqueItems);
    };

    // Run extraction immediately and after short delay for DOM stabilization
    extractHeadings();
    const timer = setTimeout(extractHeadings, 150);
    return () => clearTimeout(timer);
  }, [sections]);

  // Setup IntersectionObserver for active section highlighting
  useEffect(() => {
    if (extractedHeadings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0.2,
      }
    );

    extractedHeadings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [extractedHeadings]);

  if (extractedHeadings.length === 0) return null;

  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveId(id);
      if (isMobile) setMobileOpen(false);
    }
  };

  // Mobile Collapsible View
  if (isMobile) {
    return (
      <div className="lg:hidden mb-8 border border-white/10 rounded-xl bg-[#121212] overflow-hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider bg-[#151515]"
        >
          <div className="flex items-center gap-2">
            <List className="w-4 h-4 text-[#FF5700]" />
            <span>Table of Contents ({extractedHeadings.length})</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${mobileOpen ? 'rotate-180' : ''}`} />
        </button>

        {mobileOpen && (
          <nav className="p-3 space-y-1 border-t border-white/10 max-h-64 overflow-y-auto no-scrollbar">
            {extractedHeadings.map((h, i) => {
              const isActive = activeId === h.id;
              return (
                <button
                  key={i}
                  onClick={() => handleScrollTo(h.id)}
                  className={`block w-full text-left py-1.5 px-3 rounded text-xs transition-colors truncate ${h.level === 3 ? 'pl-6 text-[11px]' : 'font-semibold'
                    } ${isActive
                      ? 'text-[#FF5700] bg-[#FF5700]/10 font-bold border-l-2 border-[#FF5700]'
                      : 'text-[#71717A] hover:text-white'
                    }`}
                >
                  {h.text}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    );
  }

  // Desktop Sticky View
  return (
    <nav className="text-[10px] font-sans">
      <h3 className="text-[#A1A1AA] font-bold tracking-wider text-[10px] uppercase mb-4 flex items-center gap-1.5">
        <List className="w-3.5 h-3.5 text-[#FF5700]" />
        ON THIS PAGE
      </h3>

      <div className="space-y-1 border-l border-white/10 pl-1">
        {extractedHeadings.map((h, i) => {
          const isActive = activeId === h.id;
          return (
            <button
              key={i}
              onClick={() => handleScrollTo(h.id)}
              className={`block w-full text-left py-1.5 px-3 transition-all duration-200 truncate rounded-r-md ${h.level === 3 ? 'pl-6 text-[11px]' : 'font-medium text-xs'
                } ${isActive
                  ? 'text-[#FF5700] border-l-2 border-[#FF5700] bg-[#FF5700]/10 font-bold -ml-[5px]'
                  : 'text-[#71717A] hover:text-white hover:bg-white/5'
                }`}
            >
              {h.text}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
