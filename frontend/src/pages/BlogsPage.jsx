import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader2, Clock, BookOpen, Plus, Edit3, Trash2, CheckCircle, Clock3, AlertCircle } from 'lucide-react';
import { fetchBlogs, fetchMyBlogs, createBlog, updateBlog, deleteBlog } from '../api/blog.api';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import BlogSectionBuilder from '../components/blog/BlogSectionBuilder';

const PAGE_SIZE = 12;

export default function BlogsPage() {
  const { user, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState('published'); // 'published' | 'my-submissions'
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [problems, setProblems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    problem: '',
    excerpt: '',
    contentRaw: '{\n  "sections": [\n    {\n      "type": "paragraph",\n      "content": "Write your detailed explanation, intuition, and algorithm breakdown here."\n    }\n  ]\n}',
    readingTime: 5
  });

  useEffect(() => {
    loadBlogs();
  }, [activeTab, search, difficulty, currentPage]);

  useEffect(() => {
    if (isAuthenticated) {
      loadProblems();
    }
  }, [isAuthenticated]);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      if (activeTab === 'my-submissions') {
        const res = await fetchMyBlogs({ page: currentPage, limit: PAGE_SIZE });
        setBlogs(res.data);
        if (res.pagination) setPagination(res.pagination);
      } else {
        const params = { page: currentPage, limit: PAGE_SIZE };
        if (search) params.search = search;
        if (difficulty !== 'All') params.difficulty = difficulty;

        const res = await fetchBlogs(params);
        setBlogs(res.data);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProblems = async () => {
    try {
      const res = await api.get('/problems?limit=500');
      setProblems(res.data.data.problems || res.data.data || []);
    } catch (err) {
      console.error('Failed to load problems:', err);
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, difficulty, activeTab]);

  const handleOpenModal = (blog = null) => {
    setError('');
    setSuccessMessage('');
    if (blog) {
      setCurrentBlog(blog);
      setFormData({
        title: blog.title,
        slug: blog.slug,
        problem: blog.problem?._id || '',
        excerpt: blog.excerpt,
        contentRaw: JSON.stringify(blog.content || { sections: [] }, null, 2),
        readingTime: blog.readingTime || 5
      });
    } else {
      setCurrentBlog(null);
      setFormData({
        title: '',
        slug: '',
        problem: '',
        excerpt: '',
        contentRaw: '{\n  "sections": [\n    {\n      "type": "paragraph",\n      "content": "Write your detailed explanation, intuition, and algorithm breakdown here."\n    }\n  ]\n}',
        readingTime: 5
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      let parsedContent;
      try {
        parsedContent = JSON.parse(formData.contentRaw);
      } catch (err) {
        throw new Error('Invalid JSON format in content field');
      }

      const generatedSlug = formData.slug.trim() || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      const payload = {
        title: formData.title,
        slug: generatedSlug,
        problem: formData.problem,
        excerpt: formData.excerpt,
        content: parsedContent,
        readingTime: Number(formData.readingTime) || 5
      };

      if (currentBlog) {
        await updateBlog(currentBlog._id, payload);
        setSuccessMessage('Blog updated! Changes are pending admin re-approval.');
      } else {
        await createBlog(payload);
        setSuccessMessage('Blog created successfully! It will be publicly visible after admin approval.');
      }

      setTimeout(() => {
        setIsModalOpen(false);
        if (activeTab !== 'my-submissions') {
          setActiveTab('my-submissions');
        } else {
          loadBlogs();
        }
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this article submission?')) {
      try {
        await deleteBlog(id);
        loadBlogs();
      } catch (err) {
        alert('Failed to delete blog');
      }
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pt-12 pb-24">
      <SEO 
        title="DSA Explanations & Solutions - CodeRank"
        description="Learn Data Structures and Algorithms with detailed, step-by-step explanations, intuition, and complexity analysis."
      />
      <div className="container-xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="max-w-3xl mb-10 text-center mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-accent bg-accent-dim text-accent text-xs font-semibold uppercase tracking-wider mb-6">
            <BookOpen className="w-4 h-4" /> Editorial & Articles
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
            Learn & Share DSA. <br/>
            <span className="text-text-muted font-normal">One problem at a time.</span>
          </h1>
          <p className="text-lg text-text-secondary mb-8">
            Master patterns, understand intuition, and explore optimal solutions contributed by top developers and admins.
          </p>

          {/* Action Header bar for authenticated users */}
          {isAuthenticated && (
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="bg-bg-card border border-border rounded-xl p-1 inline-flex gap-1">
                <button
                  onClick={() => setActiveTab('published')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'published'
                      ? 'bg-accent text-white shadow-md'
                      : 'text-text-secondary hover:text-white'
                  }`}
                >
                  Explore Articles
                </button>
                <button
                  onClick={() => setActiveTab('my-submissions')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'my-submissions'
                      ? 'bg-accent text-white shadow-md'
                      : 'text-text-secondary hover:text-white'
                  }`}
                >
                  My Submissions
                </button>
              </div>

              <button
                onClick={() => handleOpenModal()}
                className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
              >
                <Plus className="w-4 h-4" /> Write Article
              </button>
            </div>
          )}
        </div>

        {/* Filters (only for Explore tab) */}
        {activeTab === 'published' && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-10 max-w-5xl mx-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search articles by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-bg-card border border-border rounded-xl text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors shrink-0 ${
                    difficulty === diff
                      ? 'bg-accent text-white shadow-[0_0_15px_rgba(255,107,0,0.2)]'
                      : 'bg-bg-card border border-border text-text-secondary hover:text-white hover:bg-bg-elevated'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* User Banner for My Submissions */}
        {activeTab === 'my-submissions' && (
          <div className="max-w-5xl mx-auto mb-8 p-4 bg-bg-card border border-border rounded-xl flex items-center gap-3 text-sm text-text-secondary">
            <AlertCircle className="w-5 h-5 text-accent shrink-0" />
            <span>Articles submitted by you will undergo admin review before appearing on the public blog feed.</span>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
            <p className="text-text-muted">Loading articles...</p>
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="group flex flex-col bg-bg-card border border-border rounded-2xl p-6 hover:border-border-accent hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(255,107,0,0.1)] relative"
              >
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`
                      px-2.5 py-1 rounded text-[11px] font-semibold tracking-wide
                      ${blog.problem?.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                        blog.problem?.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400' :
                        'bg-amber-500/10 text-amber-400'}
                    `}>
                      {blog.problem?.difficulty || 'Medium'}
                    </span>
                    {blog.problem?.topics?.[0] && (
                      <span className="text-text-secondary text-[11px] font-medium tracking-wide uppercase">
                        • {blog.problem.topics[0]}
                      </span>
                    )}
                  </div>

                  {/* Submission Status Badge (for user submissions view) */}
                  {activeTab === 'my-submissions' && (
                    <div>
                      {blog.published ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock3 className="w-3 h-3" /> Pending Review
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <Link to={`/blogs/${blog.slug}`} className="block">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-accent transition-colors line-clamp-2 leading-tight">
                    {blog.title}
                  </h3>
                  
                  <p className="text-sm text-text-secondary mb-6 line-clamp-3 leading-relaxed">
                    {blog.excerpt}
                  </p>
                </Link>
                
                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-xs font-medium text-text-muted">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{blog.readingTime || 5} min read</span>
                  </div>
                  
                  {activeTab === 'my-submissions' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(blog)}
                        className="p-1.5 text-text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                        title="Edit Submission"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Submission"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-text-muted group-hover:text-white transition-colors">
                      {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">
              {activeTab === 'my-submissions' ? 'No blog submissions yet' : 'No articles found'}
            </h3>
            <p className="text-text-muted mb-6">
              {activeTab === 'my-submissions'
                ? 'Share your knowledge by writing an article solution for a problem!'
                : 'Try adjusting your search or filters.'}
            </p>
            {activeTab === 'my-submissions' && (
              <button onClick={() => handleOpenModal()} className="btn-primary">
                <Plus className="w-4 h-4 inline mr-1" /> Create Your First Article
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  currentPage === i + 1
                    ? 'bg-accent text-white shadow-[0_0_15px_rgba(255,107,0,0.3)]'
                    : 'bg-bg-card border border-border text-text-secondary hover:text-white hover:bg-bg-elevated'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Editor Modal for Creating/Editing Blogs */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-bg-card border border-border rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">{currentBlog ? 'Edit Blog Article' : 'Write New Blog Article'}</h2>
            <p className="text-xs text-text-muted mb-6">
              {user?.role === 'admin' 
                ? 'As an admin, your post can be directly published.' 
                : 'Your submitted article will be reviewed by admins before being published.'}
            </p>
            
            {error && (
              <div className="p-3 mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="p-3 mb-4 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                {successMessage}
              </div>
            )}
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Title *</label>
                  <input
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., How to solve Two Sum using Hash Map"
                    className="w-full p-2.5 bg-bg-elevated border border-border rounded-xl text-white text-sm focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Slug (URL identifier)</label>
                  <input
                    value={formData.slug}
                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="Auto-generated if empty"
                    className="w-full p-2.5 bg-bg-elevated border border-border rounded-xl text-white text-sm focus:border-accent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Associated Problem *</label>
                <select
                  required
                  value={formData.problem}
                  onChange={e => setFormData({ ...formData, problem: e.target.value })}
                  className="w-full p-2.5 bg-bg-elevated border border-border rounded-xl text-white text-sm focus:border-accent"
                >
                  <option value="">Select a LeetCode problem...</option>
                  {problems.map(p => (
                    <option key={p._id} value={p._id}>{p.leetcodeId}. {p.title} ({p.difficulty})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Excerpt * (Summary)</label>
                <textarea
                  required
                  rows={2}
                  value={formData.excerpt}
                  onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Provide a short, engaging preview of your solution intuition..."
                  className="w-full p-2.5 bg-bg-elevated border border-border rounded-xl text-white text-sm focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-2">Content Structure & Sections *</label>
                <BlogSectionBuilder
                  contentRaw={formData.contentRaw}
                  onChange={(newRaw) => setFormData({ ...formData, contentRaw: newRaw })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Reading Time (minutes)</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.readingTime}
                    onChange={e => setFormData({ ...formData, readingTime: e.target.value })}
                    className="w-full p-2.5 bg-bg-elevated border border-border rounded-xl text-white text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end pt-6 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-transparent border border-border text-white rounded-xl hover:bg-white/5 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-accent text-white rounded-xl font-semibold hover:bg-accent-hover disabled:opacity-50"
                >
                  {saving ? 'Submitting...' : currentBlog ? 'Update Article' : 'Submit for Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
