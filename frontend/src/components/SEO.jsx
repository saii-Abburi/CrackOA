import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

export default function SEO({
  title,
  description,
  canonicalUrl,
  type = 'website',
  name = 'CodeRank',
  image = 'https://coderank.dev/og-image.jpg', // Replace with an actual valid OG image URL if available
  noindex = false,
  structuredData,
}) {
  const location = useLocation();
  // Construct the absolute canonical URL, assuming the current origin is correct.
  // In CSR, window.location.origin is available.
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const url = canonicalUrl || `${siteUrl}${location.pathname}`;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Canonical Link */}
      <link rel="canonical" href={url} />

      {/* Indexing / Crawling */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={name} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta name="twitter:creator" content="@coderank" />
      <meta name="twitter:card" content={type === 'article' ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
