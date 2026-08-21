import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { fetchMyBlogs, createBlog, updateBlog, deleteBlog } from '../api/blog.api';
import api from '../api/axiosInstance.js';
import { Plus, Edit3, Trash2, Loader2, BookOpen, Clock, AlertCircle, CheckCircle2, ArrowLeft, Eye } from 'lucide-react';
import BlogContent from '../components/blog/BlogContent';
import BlogSectionBuilder from '../components/blog/BlogSectionBuilder';
import { useAuth } from '../context/AuthContext';

export default function UserBlogsPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Preview Drawer
  const [previewBlog, setPreviewBlog] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    problem: '',
    excerpt: '',
    contentRaw: '{"sections": []}',
    readingTime: 5,
  });

  useEffect(() => {
    loadMyBlogs();
    loadProblems();
  }, []);

  // Auto-open modal if ?edit={id} query string exists
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');
    if (editId) {
      api.get(`/blogs/my-blogs`).then((res) => {
        const found = (res.data?.data || []).find((b) => b._id === editId);
        if (found) {
          handleOpenModal(found);
        } else {
          // Fetch directly if not in initial array
          api.get(`/blogs/${editId}`).then((singleRes) => {
            if (singleRes.data?.data) handleOpenModal(singleRes.data.data);
          }).catch(() => {});
        }
      }).catch(() => {});
    }
  }, [location.search]);

  const loadMyBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetchMyBlogs({ limit: 50 });
      setBlogs(res.data || []);
    } catch (err) {
      console.error('Failed to load user blogs', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProblems = async () => {
    try {
      const res = await api.get('/problems?limit=500');
      setProblems(res.data.data || []);
    } catch (err) {
      console.error('Failed to load problems', err);
    }
  };

  const handleOpenModal = (blog = null) => {
    setCurrentBlog(blog);
    setError('');
    if (blog) {
      let contentStr = '{"sections": []}';
      if (blog.content) {
        contentStr = typeof blog.content === 'string' ? blog.content : JSON.stringify(blog.content);
      }
      setFormData({
        title: blog.title || '',
        slug: blog.slug || '',
        problem: blog.problem?._id || blog.problem || '',
        excerpt: blog.excerpt || '',
        contentRaw: contentStr,
        readingTime: blog.readingTime || 5,
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        problem: '',
        excerpt: '',
        contentRaw: '{"sections": []}',
        readingTime: 5,
      });
    }
    setIsModalOpen(true);
  };

  const handleTitleChange = (title) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-');
    setFormData((prev) => ({
      ...prev,
      title,
      slug: currentBlog ? prev.slug : slug,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let parsedContent;
      try {
        parsedContent = JSON.parse(formData.contentRaw);
      } catch (err) {
        throw new Error('Invalid JSON format in content structure.');
      }

      const payload = {
        title: formData.title,
        slug: formData.slug,
        problem: formData.problem,
        excerpt: formData.excerpt,
        content: parsedContent,
        readingTime: Number(formData.readingTime),
        published: false, // Non-admin edits/creates are submitted for approval
      };

      if (currentBlog) {
        await updateBlog(currentBlog._id, payload);
      } else {
        await createBlog(payload);
      }

      setIsModalOpen(false);
      navigate('/my-blogs', { replace: true });
      loadMyBlogs();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      await deleteBlog(id);
      setBlogs((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete blog');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pt-8 pb-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-accent" />
              <span className="text-xs uppercase tracking-widest text-accent font-bold">Author Studio</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">My Submitted Solution Blogs</h1>
            <p className="text-text-secondary text-sm mt-1">
              Write, edit, and track your educational DSA solution articles. Submitted edits require admin approval before going public.
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 shrink-0 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Solution</span>
          </button>
        </div>

        {/* Blogs List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
            <p className="text-text-muted text-sm">Loading your solution blogs...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="bg-[#121215] border border-white/10 rounded-2xl p-12 text-center space-y-4">
            <BookOpen className="w-12 h-12 text-text-muted mx-auto opacity-40" />
            <h3 className="text-xl font-bold text-white">No solution blogs submitted yet</h3>
            <p className="text-text-muted text-sm max-w-md mx-auto">
              Share your DSA insights! Write a LeetCode-style solution editorial to help developers solve problems efficiently.
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-2.5 bg-accent text-white font-semibold rounded-xl text-sm hover:bg-accent-hover transition-all"
            >
              Write Your First Blog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="bg-[#121215] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-white/20 transition-all space-y-4 shadow-md"
              >
                <div className="space-y-3">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    {blog.published ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Published
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Pending Approval
                      </span>
                    )}

                    <span className="text-xs text-text-muted">
                      {blog.readingTime || 5} min read
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug line-clamp-2">
                    {blog.title}
                  </h3>

                  <p className="text-text-muted text-xs line-clamp-2">
                    {blog.excerpt || 'No description provided.'}
                  </p>

                  {blog.problem && (
                    <div className="pt-2 text-xs text-text-secondary flex items-center gap-1">
                      <span className="font-semibold text-white">Problem:</span> {blog.problem.title}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => { setPreviewBlog(blog); setIsPreviewOpen(true); }}
                    className="text-xs text-text-muted hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(blog)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all"
                      title="Edit Blog"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                      title="Delete Blog"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121215] border border-white/15 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#1A1A20]">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {currentBlog ? 'Edit Solution Blog' : 'Write New Solution Blog'}
                </h2>
                <p className="text-xs text-text-muted">
                  Saving will submit the article for admin approval.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-white text-lg font-bold px-3 py-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Optimal 2-Pointer Approach for Two Sum"
                    className="w-full bg-bg-card border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="e.g. two-sum-optimal-solution"
                    className="w-full bg-bg-card border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                    Associated DSA Problem *
                  </label>
                  <select
                    required
                    value={formData.problem}
                    onChange={(e) => setFormData((prev) => ({ ...prev, problem: e.target.value }))}
                    className="w-full bg-bg-card border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-accent focus:outline-none"
                  >
                    <option value="">Select a problem...</option>
                    {problems.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.leetcodeId ? `#${p.leetcodeId} - ` : ''}{p.title} ({p.difficulty})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                    Estimated Reading Time (min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.readingTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, readingTime: e.target.value }))}
                    className="w-full bg-bg-card border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                  Short Excerpt / Problem Summary *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Concise overview of the solution approaches covered in this editorial..."
                  className="w-full bg-bg-card border border-white/10 rounded-xl p-3 text-white text-sm focus:border-accent focus:outline-none"
                />
              </div>

              {/* Graphical Section Builder */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                  Editorial Section Builder
                </label>
                <BlogSectionBuilder
                  value={formData.contentRaw}
                  onChange={(val) => setFormData((prev) => ({ ...prev, contentRaw: val }))}
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-text-muted hover:text-white text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl text-sm transition-all flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{currentBlog ? 'Submit Edits for Review' : 'Submit Solution Blog'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Article Preview Modal */}
      {isPreviewOpen && previewBlog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#090909] border border-white/15 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#1A1A20]">
              <h3 className="text-lg font-bold text-white">Preview: {previewBlog.title}</h3>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-text-muted hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <BlogContent content={previewBlog.content} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
