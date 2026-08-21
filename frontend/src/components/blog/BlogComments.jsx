import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Trash2, Loader2, User as UserIcon, Lock } from 'lucide-react';
import { fetchBlogComments, addBlogComment, deleteBlogComment } from '../../api/blog.api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function BlogComments({ blogId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (blogId) {
      loadComments();
    }
  }, [blogId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const res = await fetchBlogComments(blogId);
      setComments(res.data || []);
    } catch (err) {
      console.error('Failed to load comments', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setSubmitting(true);
      setError('');
      const res = await addBlogComment(blogId, content);
      setComments((prev) => [res.data, ...prev]);
      setContent('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      setDeletingId(commentId);
      await deleteBlogComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      alert('Failed to delete comment');
    } finally {
      setDeletingId(null);
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSec = Math.floor((now - date) / 1000);

    if (diffInSec < 60) return 'Just now';
    if (diffInSec < 3600) return `${Math.floor(diffInSec / 60)}m ago`;
    if (diffInSec < 86400) return `${Math.floor(diffInSec / 3600)}h ago`;
    return `${Math.floor(diffInSec / 86400)}d ago`;
  };

  return (
    <section id="blog-comments" className="mt-12 pt-8 border-t border-white/10 max-w-[760px]">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
          <MessageSquare className="w-5 h-5 text-[#FF5700]" />
          <span>Discussion ({comments.length})</span>
        </h3>
      </div>

      {/* Post Comment Form or Login Alert */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8 bg-[#121212] border border-white/10 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-full bg-[#FF5700]/20 text-[#FF5700] border border-[#FF5700]/30 flex items-center justify-center text-xs font-bold shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
            <span className="text-xs font-semibold text-white">{user.name}</span>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Share your thoughts, ask a question, or post an alternative solution..."
            className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl p-3 text-sm text-white placeholder-[#71717A] focus:outline-none focus:border-[#FF5700] transition-colors resize-y min-h-[90px]"
          />

          {error && <div className="text-xs text-red-400 font-medium">{error}</div>}

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#71717A] font-mono">
              {content.length} / 1000
            </span>

            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="px-4 py-2 bg-[#FF5700] text-white text-xs font-bold rounded-xl hover:bg-[#FF5700]/90 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md shrink-0"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Comment</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-[#121212] border border-white/10 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-[#FF5700]" />
            <span className="text-xs sm:text-sm text-[#A1A1AA]">
              Log in to join the discussion and post comments.
            </span>
          </div>
          <Link
            to="/login"
            className="px-4 py-2 bg-[#FF5700] text-white text-xs font-bold rounded-xl hover:bg-[#FF5700]/90 transition-all shrink-0"
          >
            Log In
          </Link>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="py-8 text-center text-[#71717A]">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#FF5700]" />
          <span className="text-xs">Loading comments...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center text-[#71717A] bg-[#121212]/50 border border-white/5 rounded-2xl">
          <p className="text-xs font-medium">No comments yet. Be the first to share your solution or question!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => {
            const isOwner = user && (user._id === c.user?._id || user._id === c.user);
            const isAdmin = user && user.role === 'admin';
            const canDelete = isOwner || isAdmin;

            return (
              <div
                key={c._id}
                className="p-4 bg-[#121212] border border-white/10 rounded-2xl space-y-2 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#1F1F23] text-white border border-white/10 flex items-center justify-center text-xs font-bold shrink-0">
                      {c.user?.name ? c.user.name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5 text-[#71717A]" />}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{c.user?.name || 'Anonymous'}</span>
                      {c.user?.role === 'admin' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#FF5700]/20 text-[#FF5700] border border-[#FF5700]/30 uppercase">
                          Admin
                        </span>
                      )}
                      <span className="text-[11px] text-[#71717A]">· {formatTimeAgo(c.createdAt)}</span>
                    </div>
                  </div>

                  {canDelete && (
                    <button
                      onClick={() => handleDelete(c._id)}
                      disabled={deletingId === c._id}
                      className="p-1 text-[#71717A] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete comment"
                    >
                      {deletingId === c._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-[#D4D4D8] leading-relaxed pl-9 whitespace-pre-wrap">
                  {c.content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
