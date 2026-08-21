import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Code2 } from 'lucide-react';

export default function RelatedBlogs({ blogs = [] }) {
  if (!blogs || blogs.length === 0) return null;

  return (
    <div className="mt-16 border-t border-white/10 pt-10">
      <div className="flex items-center gap-2 mb-6">
        <Code2 className="w-5 h-5 text-[#FF5700]" />
        <h3 className="text-xl font-bold text-white tracking-tight">Continue Practicing</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {blogs.map((blog) => (
          <Link
            key={blog._id}
            to={`/blogs/${blog.slug}`}
            className="group bg-[#121212] border border-white/10 rounded-2xl p-5 hover:border-[#FF5700]/50 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className={`
                  text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded
                  ${blog.problem?.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                    blog.problem?.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400' :
                    'bg-amber-500/10 text-amber-400'}
                `}>
                  {blog.problem?.difficulty || 'Medium'}
                </span>
                <span className="text-[#71717A] text-xs">•</span>
                <span className="text-[#A1A1AA] text-xs font-medium truncate">
                  {blog.problem?.topics?.slice(0, 2).join(' · ') || 'Algorithm'}
                </span>
              </div>
              
              <h4 className="text-base font-bold text-white mb-2 group-hover:text-[#FF5700] transition-colors line-clamp-2">
                {blog.title}
              </h4>
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#71717A]">
              <div className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>{blog.readingTime || 5} min read</span>
              </div>
              <span className="text-white font-semibold group-hover:text-[#FF5700] flex items-center gap-1 transition-colors">
                Read Solution <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
