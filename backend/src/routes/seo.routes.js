import { Router } from 'express';
import { SitemapStream, streamToPromise } from 'sitemap';
import Company from '../models/Company.js';
import Problem from '../models/Problem.js';
import Blog from '../models/Blog.js';
import env from '../config/env.js';

const router = Router();

// In-memory cache for sitemap
let sitemapCache;
let sitemapCacheTime;

router.get('/sitemap.xml', async (req, res, next) => {
  try {
    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600');

    // Return cached sitemap if within 1 hour
    if (sitemapCache && sitemapCacheTime && (Date.now() - sitemapCacheTime < 3600000)) {
      return res.status(200).send(sitemapCache);
    }

    const frontendUrl = process.env.PUBLIC_SITE_URL || (env.NODE_ENV === 'production' ? 'https://crack-oa-voie.vercel.app' : 'http://localhost:5173');
    // Ensure no trailing slash
    const baseUrl = frontendUrl.endsWith('/') ? frontendUrl.slice(0, -1) : frontendUrl;

    const smStream = new SitemapStream({ hostname: baseUrl });

    // Static pages
    smStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
    smStream.write({ url: '/problems', changefreq: 'daily', priority: 0.9 });
    smStream.write({ url: '/companies', changefreq: 'daily', priority: 0.9 });
    smStream.write({ url: '/topics', changefreq: 'weekly', priority: 0.8 });
    smStream.write({ url: '/blogs', changefreq: 'daily', priority: 0.9 });

    // Dynamic Companies
    const companies = await Company.find({}, 'slug updatedAt').lean();
    companies.forEach(company => {
      smStream.write({
        url: `/companies/${company.slug}/problems`,
        lastmod: company.updatedAt,
        changefreq: 'weekly',
        priority: 0.8
      });
    });

    // Dynamic Problems
    // Note: Assuming all problems in the DB are public
    const problems = await Problem.find({}, 'slug updatedAt leetcodeId title').lean();
    problems.forEach(prob => {
      // Use slug if it exists, otherwise construct from title as done in the frontend
      const slug = prob.slug || prob.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
      // Frontend is actually routing `/problems/:id` using MongoDB `_id` currently!
      // Wait, in my previous edit, I made frontend route to `/problems/${prob._id}`.
      // The instruction says: "Include dynamic problem pages. Example: /problems/two-sum"
      // If the frontend expects `two-sum` as the ID, I should output the Mongo ID here since that's what the frontend expects.
      smStream.write({
        url: `/problems/${prob._id}`,
        lastmod: prob.updatedAt,
        changefreq: 'monthly',
        priority: 0.7
      });
    });

    // Dynamic Blogs
    const blogs = await Blog.find({ published: true }, 'slug updatedAt').lean();
    blogs.forEach(blog => {
      smStream.write({
        url: `/blogs/${blog.slug}`,
        lastmod: blog.updatedAt,
        changefreq: 'weekly',
        priority: 0.8
      });
    });

    smStream.end();

    const sitemapOutput = (await streamToPromise(smStream)).toString();
    
    // Update cache
    sitemapCache = sitemapOutput;
    sitemapCacheTime = Date.now();

    res.status(200).send(sitemapOutput);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    next(error);
  }
});

export default router;
