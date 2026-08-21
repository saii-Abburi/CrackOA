import { useState, useEffect } from 'react';
import { fetchAdminBlogs, fetchAdminBlogById, deleteBlog, createBlog, updateBlog, fetchAdminReports, updateAdminReportStatus } from '../api/blog.api';
import api from '../api/axiosInstance.js';
import { Plus, Edit3, Trash2, CheckCircle, XCircle, Loader2, ArrowLeft, Eye, ShieldCheck, Clock, User, AlertCircle, FileText, Flag, AlertTriangle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import BlogContent from '../components/blog/BlogContent';
import BlogSectionBuilder from '../components/blog/BlogSectionBuilder';

export default function AdminBlogsPage() {
  const location = useLocation();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'published' | 'reports'

  // Reports state
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Edit / Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);

  // Verification & Review Drawer State
  const [reviewBlog, setReviewBlog] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '', slug: '', problem: '', excerpt: '',
    contentRaw: '{"sections": []}',
    published: false,
    metaTitle: '', metaDescription: '', keywords: '', readingTime: 5
  });

  useEffect(() => {
    loadBlogs();
    loadProblems();
    loadReports();
  }, [page]);

  // Handle direct ?edit={blogId} navigation from BlogHeader
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const editId = searchParams.get('edit');
    if (editId) {
      fetchAdminBlogById(editId)
        .then((res) => {
          if (res.data) {
            handleOpenModal(res.data);
          }
        })
        .catch((err) => console.error('Failed to load blog for edit', err));
    }
  }, [location.search]);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminBlogs({ page, limit: 15 });
      setBlogs(res.data);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    setLoadingReports(true);
    try {
      const res = await fetchAdminReports({ page: 1, limit: 50 });
      setReports(res.data || []);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleDismissReport = async (reportId) => {
    try {
      await updateAdminReportStatus(reportId, 'dismissed');
      setReports((prev) => prev.map((r) => (r._id === reportId ? { ...r, status: 'dismissed' } : r)));
    } catch (err) {
      alert('Failed to update report status');
    }
  };

  const loadProblems = async () => {
    try {
      const res = await api.get('/problems?limit=500');
      setProblems(res.data.data.problems || res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBlogs = blogs.filter((blog) => {
    if (filterStatus === 'pending') return !blog.published;
    if (filterStatus === 'published') return blog.published;
    return true;
  });

  const pendingCount = blogs.filter((b) => !b.published).length;

  const handleOpenModal = (blog = null) => {
    setError('');
    if (blog) {
      setCurrentBlog(blog);
      setFormData({
        title: blog.title,
        slug: blog.slug,
        problem: blog.problem?._id || '',
        excerpt: blog.excerpt,
        contentRaw: JSON.stringify(blog.content || { sections: [] }, null, 2),
        published: blog.published,
        metaTitle: blog.metaTitle || '',
        metaDescription: blog.metaDescription || '',
        keywords: blog.keywords ? blog.keywords.join(', ') : '',
        readingTime: blog.readingTime || 5
      });
    } else {
      setCurrentBlog(null);
      setFormData({
        title: '', slug: '', problem: '', excerpt: '',
        contentRaw: '{\n  "sections": []\n}',
        published: true, // Default to true when admin creates
        metaTitle: '', metaDescription: '', keywords: '', readingTime: 5
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenReview = (blog) => {
    setReviewBlog(blog);
    setIsReviewOpen(true);
  };

  const handleApproveBlog = async (blogToApprove) => {
    setVerifying(true);
    try {
      await updateBlog(blogToApprove._id, { published: true });
      if (reviewBlog && reviewBlog._id === blogToApprove._id) {
        setIsReviewOpen(false);
      }
      loadBlogs();
    } catch (err) {
      alert('Failed to approve blog');
    } finally {
      setVerifying(false);
    }
  };

  const handleUnpublishBlog = async (blogToUnpublish) => {
    setVerifying(true);
    try {
      await updateBlog(blogToUnpublish._id, { published: false });
      if (reviewBlog && reviewBlog._id === blogToUnpublish._id) {
        setIsReviewOpen(false);
      }
      loadBlogs();
    } catch (err) {
      alert('Failed to update blog status');
    } finally {
      setVerifying(false);
    }
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
        throw new Error('Invalid JSON in content field');
      }

      const payload = {
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        problem: formData.problem,
        excerpt: formData.excerpt,
        content: parsedContent,
        published: formData.published,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()) : [],
        readingTime: Number(formData.readingTime)
      };

      if (currentBlog) {
        await updateBlog(currentBlog._id, payload);
      } else {
        await createBlog(payload);
      }
      setIsModalOpen(false);
      loadBlogs();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await deleteBlog(id);
        if (reviewBlog && reviewBlog._id === id) setIsReviewOpen(false);
        loadBlogs();
      } catch (err) {
        alert('Failed to delete');
      }
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-bg-primary text-text-primary px-4 sm:px-6">
      <div className="container-xl max-w-6xl mx-auto">
        <div className="mb-4">
          <Link to="/admin" className="text-text-muted hover:text-white text-sm flex items-center gap-1 w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              Blog Verification & Management
              {pendingCount > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {pendingCount} Pending Approval
                </span>
              )}
            </h1>
            <p className="text-text-muted mt-1">Review user submissions, edit articles, and approve blogs for public feed.</p>
          </div>
          
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Admin Blog
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'all'
                ? 'bg-accent text-white shadow-md'
                : 'bg-bg-card border border-border text-text-secondary hover:text-white'
            }`}
          >
            All Submissions ({blogs.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterStatus === 'pending'
                ? 'bg-amber-500 text-black shadow-md font-extrabold'
                : 'bg-bg-card border border-border text-amber-400 hover:bg-amber-500/10'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Pending Review ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('published')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterStatus === 'published'
                ? 'bg-emerald-500 text-black shadow-md font-extrabold'
                : 'bg-bg-card border border-border text-emerald-400 hover:bg-emerald-500/10'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Approved & Published ({blogs.filter(b => b.published).length})
          </button>
          <button
            onClick={() => setFilterStatus('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterStatus === 'reports'
                ? 'bg-red-500 text-white shadow-md font-extrabold'
                : 'bg-bg-card border border-border text-red-400 hover:bg-red-500/10'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            User Reports Queue ({reports.filter(r => r.status === 'pending').length})
          </button>
        </div>

        {/* Table View (Blogs or Reports) */}
        <div className="bg-bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            {filterStatus === 'reports' ? (
              <table className="w-full text-left text-sm">
                <thead className="bg-bg-elevated text-text-muted uppercase tracking-wider font-semibold border-b border-border text-xs">
                  <tr>
                    <th className="px-5 py-4">Reported Blog Article</th>
                    <th className="px-5 py-4">Reporter</th>
                    <th className="px-5 py-4">Reason / Notes</th>
                    <th className="px-5 py-4 text-center">Status</th>
                    <th className="px-5 py-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loadingReports ? (
                    <tr><td colSpan={5} className="py-12 text-center text-text-muted"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                  ) : reports.length === 0 ? (
                    <tr><td colSpan={5} className="py-12 text-center text-text-muted">No user reports found. All blogs are clean!</td></tr>
                  ) : (
                    reports.map((rep) => (
                      <tr key={rep._id} className="hover:bg-bg-elevated/40 transition-colors">
                        <td className="px-5 py-4 font-medium text-white max-w-xs">
                          <div className="font-bold line-clamp-1">{rep.blog?.title || 'Deleted Article'}</div>
                          <span className="text-xs text-text-muted font-mono">{rep.blog?.slug || 'N/A'}</span>
                        </td>
                        <td className="px-5 py-4 text-text-secondary text-xs">
                          <div className="flex items-center gap-1.5 font-semibold text-white">
                            <User className="w-3.5 h-3.5 text-accent shrink-0" />
                            {rep.reporter?.name || 'Anonymous User'}
                          </div>
                          {rep.reporter?.email && <div className="text-[11px] text-text-muted">{rep.reporter.email}</div>}
                        </td>
                        <td className="px-5 py-4 text-text-secondary text-xs max-w-xs">
                          <span className="text-red-400 font-medium">{rep.reason}</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          {rep.status === 'dismissed' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-text-muted text-xs font-medium">
                              Dismissed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold animate-pulse">
                              <AlertTriangle className="w-3.5 h-3.5" /> Pending Review
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end items-center gap-2">
                            {rep.blog && (
                              <button
                                onClick={() => handleOpenReview(rep.blog)}
                                className="px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
                                title="Inspect reported blog article"
                              >
                                <Eye className="w-3.5 h-3.5" /> Inspect
                              </button>
                            )}

                            {rep.status !== 'dismissed' && (
                              <button
                                onClick={() => handleDismissReport(rep._id)}
                                className="px-3 py-1.5 rounded-lg bg-white/10 text-text-secondary hover:text-white text-xs font-semibold transition-all"
                                title="Dismiss report"
                              >
                                Dismiss
                              </button>
                            )}

                            {rep.blog && (
                              <button
                                onClick={() => handleDelete(rep.blog._id)}
                                className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                title="Delete reported article"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-bg-elevated text-text-muted uppercase tracking-wider font-semibold border-b border-border text-xs">
                  <tr>
                    <th className="px-5 py-4">Title & Slug</th>
                    <th className="px-5 py-4">Author</th>
                    <th className="px-5 py-4">Associated Problem</th>
                    <th className="px-5 py-4 text-center">Approval Status</th>
                    <th className="px-5 py-4 text-right">Verification Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr><td colSpan={5} className="py-12 text-center text-text-muted"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                  ) : filteredBlogs.length === 0 ? (
                    <tr><td colSpan={5} className="py-12 text-center text-text-muted">No blogs found for this filter.</td></tr>
                  ) : (
                    filteredBlogs.map((blog) => (
                      <tr key={blog._id} className="hover:bg-bg-elevated/40 transition-colors">
                        <td className="px-5 py-4 font-medium text-white max-w-xs">
                          <div className="font-bold line-clamp-1">{blog.title}</div>
                          <span className="text-xs text-text-muted font-mono">{blog.slug}</span>
                        </td>
                        <td className="px-5 py-4 text-text-secondary text-xs">
                          <div className="flex items-center gap-1.5 font-semibold text-white">
                            <User className="w-3.5 h-3.5 text-accent shrink-0" />
                            {blog.author?.name || 'Admin'}
                          </div>
                          {blog.author?.email && <div className="text-[11px] text-text-muted">{blog.author.email}</div>}
                        </td>
                        <td className="px-5 py-4 text-text-secondary text-xs">
                          {blog.problem?.title || 'Unknown'} (ID: {blog.problem?.leetcodeId || '?'})
                        </td>
                        <td className="px-5 py-4 text-center">
                          {blog.published ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                              <CheckCircle className="w-3.5 h-3.5" /> Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold animate-pulse">
                              <Clock className="w-3.5 h-3.5" /> Pending Verification
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end items-center gap-2">
                            {/* Review & Verify Button */}
                            <button
                              onClick={() => handleOpenReview(blog)}
                              className="px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
                              title="Review content and verify"
                            >
                              <Eye className="w-3.5 h-3.5" /> Review
                            </button>

                            {/* Quick Approve / Unpublish Button */}
                            {!blog.published ? (
                              <button
                                onClick={() => handleApproveBlog(blog)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-extrabold hover:bg-emerald-400 text-xs flex items-center gap-1 transition-all shadow-md"
                                title="Approve and Publish immediately"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" /> Approve
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUnpublishBlog(blog)}
                                className="p-1.5 text-text-muted hover:text-amber-400 hover:bg-amber-500/10 rounded-lg text-xs"
                                title="Unpublish / Set to Pending"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}

                            <button onClick={() => handleOpenModal(blog)} className="p-1.5 text-text-muted hover:text-accent hover:bg-accent/10 rounded-lg" title="Edit Article"><Edit3 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(blog._id)} className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
             <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
                <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 bg-bg-elevated border border-border rounded text-sm disabled:opacity-50">Prev</button>
                <button disabled={page === pagination.totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 bg-bg-elevated border border-border rounded text-sm disabled:opacity-50">Next</button>
             </div>
          )}
        </div>
      </div>

      {/* Review & Verification Modal */}
      {isReviewOpen && reviewBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-bg-card border border-border rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
              <div>
                <span className="text-xs font-bold text-accent uppercase tracking-wider">Blog Verification & Review</span>
                <h2 className="text-2xl font-bold text-white mt-1">{reviewBlog.title}</h2>
                <div className="flex items-center gap-4 text-xs text-text-muted mt-2">
                  <span>Author: <strong className="text-white">{reviewBlog.author?.name || 'Admin'}</strong> ({reviewBlog.author?.email || 'N/A'})</span>
                  <span>Problem: <strong className="text-white">{reviewBlog.problem?.title}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {reviewBlog.published ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                    ✓ Approved & Published
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">
                    ⏳ Pending Review
                  </span>
                )}
              </div>
            </div>

            {/* Rendered Content Preview */}
            <div className="bg-[#0A0A0A] border border-border p-6 rounded-xl overflow-y-auto mb-6 flex-1 max-h-[50vh]">
              <div className="mb-4 p-3 bg-bg-card border border-border rounded-lg text-xs text-text-secondary">
                <strong className="text-white">Excerpt:</strong> {reviewBlog.excerpt}
              </div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4 border-b border-border pb-2">Full Formatted Article Preview</h4>
              <BlogContent content={reviewBlog.content} />
            </div>

            {/* Action Footer */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border mt-auto">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDelete(reviewBlog._id)}
                  className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl text-xs font-semibold border border-red-500/20"
                >
                  Delete Submission
                </button>
                <button
                  type="button"
                  onClick={() => { setIsReviewOpen(false); handleOpenModal(reviewBlog); }}
                  className="px-4 py-2 bg-bg-elevated border border-border text-white rounded-xl text-xs font-semibold hover:bg-white/5"
                >
                  Edit Article
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsReviewOpen(false)}
                  className="px-5 py-2.5 bg-transparent border border-border text-white rounded-xl text-sm font-semibold hover:bg-white/5"
                >
                  Close
                </button>

                {!reviewBlog.published ? (
                  <button
                    type="button"
                    disabled={verifying}
                    onClick={() => handleApproveBlog(reviewBlog)}
                    className="px-6 py-2.5 bg-emerald-500 text-black font-extrabold rounded-xl text-sm hover:bg-emerald-400 shadow-lg flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" /> Approve & Publish Article
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={verifying}
                    onClick={() => handleUnpublishBlog(reviewBlog)}
                    className="px-6 py-2.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-sm font-semibold hover:bg-amber-500/30"
                  >
                    Unpublish / Set to Pending
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-bg-card border border-border rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">{currentBlog ? 'Edit Blog' : 'Create Blog'}</h2>
            <p className="text-xs text-text-muted mb-6">Use the visual section builder or templates to quickly compose formatted articles.</p>
            
            {error && <div className="p-3 mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">{error}</div>}
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Title *</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2.5 bg-bg-elevated border border-border rounded-xl text-white text-sm focus:border-accent" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Slug (auto-generated if empty)</label>
                  <input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full p-2.5 bg-bg-elevated border border-border rounded-xl text-white text-sm focus:border-accent" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Associated Problem *</label>
                <select required value={formData.problem} onChange={e => setFormData({...formData, problem: e.target.value})} className="w-full p-2.5 bg-bg-elevated border border-border rounded-xl text-white text-sm focus:border-accent">
                  <option value="">Select a Problem...</option>
                  {problems.map(p => (
                    <option key={p._id} value={p._id}>{p.leetcodeId}. {p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Excerpt * (Summary)</label>
                <textarea required rows={2} value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="w-full p-2.5 bg-bg-elevated border border-border rounded-xl text-white text-sm focus:border-accent" />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-2">Content Structure & Sections *</label>
                <BlogSectionBuilder
                  contentRaw={formData.contentRaw}
                  onChange={(newRaw) => setFormData({ ...formData, contentRaw: newRaw })}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border pt-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Meta Title (SEO)</label>
                  <input value={formData.metaTitle} onChange={e => setFormData({...formData, metaTitle: e.target.value})} className="w-full p-2.5 bg-bg-elevated border border-border rounded-xl text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Keywords (SEO, comma separated)</label>
                  <input value={formData.keywords} onChange={e => setFormData({...formData, keywords: e.target.value})} className="w-full p-2.5 bg-bg-elevated border border-border rounded-xl text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Reading Time (mins)</label>
                  <input type="number" value={formData.readingTime} onChange={e => setFormData({...formData, readingTime: e.target.value})} className="w-full p-2.5 bg-bg-elevated border border-border rounded-xl text-white text-sm" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="published" checked={formData.published} onChange={e => setFormData({...formData, published: e.target.checked})} className="w-4 h-4 accent-accent" />
                <label htmlFor="published" className="text-sm font-bold text-white">Approved & Published (Visible to public)</label>
              </div>

              <div className="flex gap-4 justify-end pt-6 border-t border-border mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-transparent border border-border text-white rounded-xl hover:bg-white/5 font-semibold">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-accent text-white rounded-xl font-semibold hover:bg-accent-hover disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Blog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
