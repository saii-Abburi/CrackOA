import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchBlogBySlug, fetchRelatedBlogs } from '../api/blog.api';
import BlogLayout from '../components/blog/BlogLayout';
import BlogHeader from '../components/blog/BlogHeader';
import ProblemInfoCard from '../components/blog/ProblemInfoCard';
import BlogContent from '../components/blog/BlogContent';
import BlogComments from '../components/blog/BlogComments';
import RelatedBlogs from '../components/blog/RelatedBlogs';
import BlogCTA from '../components/blog/BlogCTA';
import BlogSkeleton from '../components/blog/BlogSkeleton';
import BlogError from '../components/blog/BlogError';
import SEO from '../components/SEO';
import SolutionView from '../components/blog/SolutionView';

export default function BlogPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBlogData = async () => {
      setLoading(true);
      setError(null);
      try {
        const blogRes = await fetchBlogBySlug(slug);
        if (!blogRes || !blogRes.data) {
          throw new Error('Blog article not found');
        }
        setBlog(blogRes.data);

        // Fetch related blogs after loading main blog
        try {
          const relatedRes = await fetchRelatedBlogs(slug);
          setRelated(relatedRes.data || []);
        } catch (relatedErr) {
          console.error('Failed to fetch related blogs:', relatedErr);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Article not found');
      } finally {
        setLoading(false);
      }
    };

    loadBlogData();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  if (loading) {
    return <BlogSkeleton />;
  }

  if (error || !blog) {
    return <BlogError message={error || 'This solution hasn\'t been published yet.'} />;
  }

  const isCodingSolution = blog.blogType === 'CODING_SOLUTION' || Boolean(blog.code || blog.intuition || blog.approach);
  
  // Construct TOC entries for solutions or fallback to article sections
  let tocSections = [];
  if (isCodingSolution) {
    if (blog.excerpt) tocSections.push({ type: 'heading', level: 2, content: 'Problem Statement', id: 'problem-statement' });
    if (blog.intuition) tocSections.push({ type: 'heading', level: 2, content: 'Intuition', id: 'intuition' });
    if (blog.approach) tocSections.push({ type: 'heading', level: 2, content: 'Approach', id: 'approach' });
    if (blog.timeComplexity || blog.spaceComplexity) tocSections.push({ type: 'heading', level: 2, content: 'Complexity Analysis', id: 'complexity' });
    if (blog.code) tocSections.push({ type: 'heading', level: 2, content: 'Code', id: 'code' });
  } else {
    tocSections = blog.content?.sections || blog.content || [];
  }

  return (
    <>
      <SEO
        title={blog.metaTitle || `${blog.title} — ${isCodingSolution ? 'Editorial & Solution' : 'Article'} | CodeRank`}
        description={blog.metaDescription || blog.excerpt || blog.intuition?.slice(0, 160)}
        keywords={blog.keywords?.length ? blog.keywords.join(', ') : (blog.tags?.join(', ') || '')}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          'headline': blog.title,
          'description': blog.excerpt || blog.intuition,
          'datePublished': blog.publishedAt,
          'author': {
            '@type': 'Person',
            'name': blog.author?.name || 'CodeRank Contributor',
          },
        }}
      />

      <BlogLayout toc={tocSections} title={blog.title}>
        {isCodingSolution ? (
          <>
            <SolutionView blog={blog} />
            <BlogComments blogId={blog._id} />
            {blog.problem && <BlogCTA problem={blog.problem} />}
            <RelatedBlogs blogs={related} />
          </>
        ) : (
          <>
            <BlogHeader blog={blog} />
            {blog.problem && <ProblemInfoCard problem={blog.problem} />}
            <BlogContent content={blog.content} />
            <BlogComments blogId={blog._id} />
            {blog.problem && <BlogCTA problem={blog.problem} />}
            <RelatedBlogs blogs={related} />
          </>
        )}
      </BlogLayout>
    </>
  );
}
