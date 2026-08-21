import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export default function BlogError({ message }) {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center bg-[#090909] text-text-primary px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#151515] border border-white/10 flex items-center justify-center mb-6">
        <FileQuestion className="w-8 h-8 text-[#FF5700]" />
      </div>
      
      <h1 className="text-3xl font-extrabold text-white mb-3">Blog Article Not Found</h1>
      <p className="text-base text-[#A1A1AA] max-w-md mb-8 leading-relaxed">
        {message || "This solution hasn't been published yet or the link might be broken."}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF5700] text-white font-semibold rounded-xl hover:bg-[#e04d00] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Articles
        </Link>
        <Link
          to="/problems"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#151515] border border-white/10 text-white font-semibold rounded-xl hover:bg-white/5 transition-colors"
        >
          Browse DSA Problems
        </Link>
      </div>
    </div>
  );
}
