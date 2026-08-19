import { Router } from 'express';
import Company from '../models/Company.js';
import env from '../config/env.js';

const router = Router();

router.get('/sitemap.xml', async (req, res, next) => {
  try {
    const frontendUrl = env.NODE_ENV === 'production' ? 'https://coderank.dev' : 'http://localhost:5173';
    const companies = await Company.find({}, 'slug updatedAt').lean();

    const urls = [
      { url: '/', priority: '1.0' },
      { url: '/companies', priority: '0.9' },
      { url: '/problems', priority: '0.8' },
    ];

    companies.forEach(company => {
      urls.push({
        url: `/companies/${company.slug}/problems`,
        priority: '0.9',
        lastmod: company.updatedAt
      });
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${frontendUrl}${u.url}</loc>
    ${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ''}
    <priority>${u.priority}</priority>
    <changefreq>daily</changefreq>
  </url>`).join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.status(200).send(sitemap);
  } catch (error) {
    next(error);
  }
});

export default router;
