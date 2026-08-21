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

  const tocSections = blog.content || [];

  return (
    <>
      <SEO
        title={blog.metaTitle || `${blog.title} — Complete Solution | CompanyWiseSheet`}
        description={blog.metaDescription || blog.excerpt}
        keywords={blog.keywords?.length ? blog.keywords.join(', ') : ''}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          'headline': blog.title,
          'description': blog.excerpt,
          'datePublished': blog.publishedAt,
          'author': {
            '@type': 'Person',
            'name': blog.author?.name || 'CompanyWiseSheet Team',
          },
        }}
      />

      <BlogLayout toc={tocSections} title={blog.title}>
        <BlogHeader blog={blog} />
        <ProblemInfoCard problem={blog.problem} />
        <BlogContent content={blog.content} />
        <BlogComments blogId={blog._id} />
        <BlogCTA problem={blog.problem} />
        <RelatedBlogs blogs={related} />
      </BlogLayout>
    </>
  );
}
