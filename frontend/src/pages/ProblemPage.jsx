import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, ExternalLink, ArrowLeft, BookOpen, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import api from '../api/axiosInstance';
import { fetchBlogs } from '../api/blog.api';
import SEO from '../components/SEO';
import ProblemInfo from '../components/blog/ProblemInfoCard';

export default function ProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [problem, setProblem] = useState(null);
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/problems/${id}`);
        const probData = res.data.data;
        setProblem(probData);

        // Fetch associated blog
        const blogsRes = await fetchBlogs({ problemId: probData._id });
        if (blogsRes.data && blogsRes.data.length > 0) {
          setBlog(blogsRes.data[0]);
        }
      } catch (err) {
        setError('Failed to load problem.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    window.scrollTo(0, 0);
  }, [id]);

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center pt-8 bg-bg-primary text-text-primary">
        <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
        <p className="text-text-muted">Loading problem...</p>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center pt-8 bg-bg-primary text-text-primary text-center px-4">
        <h2 className="text-3xl font-bold text-white mb-4">Problem Not Found</h2>
        <p className="text-text-secondary mb-8">{error}</p>
        <button onClick={() => navigate('/problems')} className="btn-primary">Browse All Problems</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pt-12 pb-24">
      <SEO title={`${problem.title} | CodeRank`} />

      <div className="container-xl max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="text-text-muted hover:text-white text-sm flex items-center gap-1.5 w-fit font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{location.state?.from?.includes('companies') ? 'Back to Company Sheet' : 'Back'}</span>
          </button>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-8">{problem.title}</h1>

        <ProblemInfo problem={problem} />

        {/* Description from the backend if available */}
        {problem.description && (
          <div className="bg-bg-card border border-border rounded-xl p-6 mb-8 text-text-secondary leading-relaxed">
            {problem.description}
          </div>
        )}

        {/* Prominent Blog Editorial CTA Card */}
        {blog ? (
          <div className="my-8 bg-gradient-to-r from-[#121215] via-[#1A1A20] to-[#251810] border border-[#FF5700]/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#FF5700]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between relative z-10">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-[#FF5700]/20 text-[#FF5700] border border-[#FF5700]/30 text-xs font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Official Solution Editorial
                  </span>
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {blog.readingTime || 6} min read
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                  {blog.title}
                </h3>

                <p className="text-text-secondary text-sm max-w-xl line-clamp-2 leading-relaxed">
                  {blog.excerpt || 'Step-by-step editorial with intuition, algorithm walkthrough, multi-language code snippets, and time/space complexity analysis.'}
                </p>

                <div className="flex items-center gap-2 pt-1 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Includes C++, Java, Python & JS Implementations</span>
                </div>
              </div>

              <Link
                to={`/blogs/${blog.slug}`}
                className="px-6 py-3 bg-[#FF5700] text-white font-bold rounded-xl hover:bg-[#FF5700]/90 transition-all shadow-lg flex items-center gap-2 shrink-0 text-sm"
              >
                <BookOpen className="w-4 h-4" />
                <span>Read Full Editorial</span>
                <ExternalLink className="w-4 h-4 ml-0.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="my-8 p-6 bg-[#121215] border border-white/10 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-text-muted" />
              <div>
                <h4 className="text-sm font-bold text-white">No solution blog published yet</h4>
                <p className="text-xs text-text-muted">Editorial for this problem is currently in review.</p>
              </div>
            </div>
            <Link
              to="/admin/blogs"
              className="px-4 py-2 bg-white/10 text-white hover:bg-white/20 text-xs font-semibold rounded-xl transition-all"
            >
              Write Solution
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
