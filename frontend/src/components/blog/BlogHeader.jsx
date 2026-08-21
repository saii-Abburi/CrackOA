import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Clock,
  MessageSquare,
  Pencil,
  MoreVertical,
  ThumbsUp,
  Share2,
  Flag,
  Check,
  Heart
} from 'lucide-react';
import { toggleBlogLike, fetchBlogLikeStatus, reportBlog } from '../../api/blog.api';
import { useAuth } from '../../context/AuthContext';

export default function BlogHeader({ blog, onEdit }) {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(blog?.likesCount || 0);
  const [copied, setCopied] = useState(false);
  const [reported, setReported] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch persistent like status from backend
  useEffect(() => {
    if (blog?._id) {
      loadLikeStatus();
    }
  }, [blog?._id, user]);

  const loadLikeStatus = async () => {
    try {
      const res = await fetchBlogLikeStatus(blog._id);
      if (res.data) {
        setLiked(Boolean(res.data.liked));
        setLikesCount(res.data.likesCount || 0);
      }
    } catch (err) {
      console.error('Error fetching like status', err);
    }
  };

  if (!blog) return null;

  const { title, excerpt, problem, readingTime, publishedAt, topics } = blog;

  const dateStr = publishedAt
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(publishedAt))
    : 'Recently';

  const displayTopics = topics?.length ? topics : problem?.topics || [];

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  const handleCommentClick = () => {
    const commentsEl = document.getElementById('blog-comments') || document.getElementById('blog-cta') || document.querySelector('footer');
    if (commentsEl) {
      commentsEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      triggerToast('Comments section');
    }
  };

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(blog);
    } else if (user?.role === 'admin') {
      navigate(`/admin/blogs?edit=${blog._id}`);
    } else {
      navigate(`/my-blogs?edit=${blog._id}`);
    }
  };

  const handleLike = async () => {
    if (!user) {
      triggerToast('Please log in to like this article');
      setMenuOpen(false);
      return;
    }

    try {
      const res = await toggleBlogLike(blog._id);
      if (res.data) {
        setLiked(res.data.liked);
        setLikesCount(res.data.likesCount);
        if (updateUser && res.data.likedBlogs) {
          updateUser({ likedBlogs: res.data.likedBlogs });
        }
        triggerToast(res.data.liked ? 'Saved to liked articles!' : 'Removed from liked articles');
      }
    } catch (err) {
      triggerToast('Failed to update like status');
    } finally {
      setMenuOpen(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      triggerToast('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      triggerToast('URL copied to clipboard!');
    }
    setMenuOpen(false);
  };

  const handleReport = async () => {
    if (!user) {
      triggerToast('Please log in to report this article');
      setMenuOpen(false);
      return;
    }

    try {
      await reportBlog(blog._id, 'Inappropriate content reported by user');
      setReported(true);
      triggerToast('Report submitted for admin review');
    } catch (err) {
      triggerToast('Failed to submit report');
    } finally {
      setMenuOpen(false);
    }
  };

  return (
    <header className="mb-8 relative">
      {/* Toast Feedback Popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E1E22] text-white border border-white/20 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#71717A] mb-5 font-medium">
        <Link to="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/problems" className="hover:text-white transition-colors">
          Problems
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/blogs" className="hover:text-white transition-colors">
          Blogs
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#A1A1AA] truncate">{problem?.title || title}</span>
      </nav>

      {/* Title & Action Bar */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-[28px] sm:text-[36px] lg:text-[44px] font-extrabold text-white leading-[1.15] tracking-tight flex-1">
          {title} — Complete Solution
        </h1>

        {/* Action Buttons: Comment, Edit, 3-Dots Menu */}
        <div className="relative flex items-center gap-1 shrink-0 pt-1.5" ref={menuRef}>
          <button
            onClick={handleCommentClick}
            className="p-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-colors"
            title="Comments"
            aria-label="Comments"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          <button
            onClick={handleEditClick}
            className="p-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-colors"
            title="Edit Article"
            aria-label="Edit Article"
          >
            <Pencil className="w-5 h-5" />
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`p-2 rounded-xl transition-colors ${
              menuOpen ? 'text-white bg-white/10' : 'text-[#A1A1AA] hover:text-white hover:bg-white/10'
            }`}
            title="More options"
            aria-label="More options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* Popover Dropdown Menu (Like, Share, Report) */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-[#141417] border border-white/15 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] py-1.5 z-50">
              <button
                onClick={handleLike}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#D4D4D8] hover:text-white hover:bg-white/10 transition-colors"
              >
                <ThumbsUp className={`w-4 h-4 ${liked ? 'text-accent fill-accent' : ''}`} />
                <span>{liked ? 'Liked' : 'Like'}</span>
              </button>

              <button
                onClick={handleShare}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#D4D4D8] hover:text-white hover:bg-white/10 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Share'}</span>
              </button>

              <button
                onClick={handleReport}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#D4D4D8] hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Flag className={`w-4 h-4 ${reported ? 'text-red-400 fill-red-400' : ''}`} />
                <span>{reported ? 'Reported' : 'Report'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Badges & Meta */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span
          className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider ${problem?.difficulty === 'Easy'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : problem?.difficulty === 'Hard'
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
        >
          {problem?.difficulty || 'Medium'}
        </span>

        {displayTopics.slice(0, 4).map((topic) => (
          <span
            key={topic}
            className="px-2.5 py-1 rounded bg-[#151515] border border-white/10 text-[#A1A1AA] text-xs font-medium"
          >
            {topic}
          </span>
        ))}

        <div className="flex items-center gap-2 text-xs text-[#71717A] font-medium ml-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{readingTime || 6} min read</span>
          <span>·</span>
          <span>Updated {dateStr}</span>
        </div>
      </div>

      {/* Excerpt */}
      {excerpt && (
        <p className="text-base sm:text-lg text-[#A1A1AA] leading-relaxed max-w-[760px] mb-6">
          {excerpt}
        </p>
      )}
    </header>
  );
}
