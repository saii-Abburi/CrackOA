import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Search, ArrowRight, Code2, Loader2 } from 'lucide-react';
import api from '../api/axiosInstance.js';
import SEO from '../components/SEO.jsx';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get('/companies');
        setCompanies(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch companies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": filtered.map((comp, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${typeof window !== 'undefined' ? window.location.origin : ''}/companies/${comp.slug}/problems`,
      "name": `${comp.name} DSA Sheet`
    }))
  };

  return (
    <div className="min-h-screen pt-8 pb-16 bg-bg-primary text-text-primary">
      <SEO 
        title="Company-Wise DSA Sheets - Practice Interview Questions"
        description="Select a target company like Amazon, Google, or Microsoft to practice the exact Data Structures and Algorithms questions asked in their technical interviews."
        structuredData={structuredData}
      />
      <div className="container-xl px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-2xl mb-10">
          <span className="section-badge mb-3">Company Sheets</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Company-Wise DSA Sheets
          </h1>
          <p className="text-text-secondary text-base">
            Select a target company to practice the exact DSA questions asked in their technical interviews.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search target company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-bg-card border border-border rounded-xl text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>

        {/* Company Cards Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-accent animate-spin mb-3" />
            <p className="text-text-muted text-sm">Loading company sheets...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((comp) => (
              <motion.div
                key={comp._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-bg-card border border-border hover:border-accent/40 rounded-2xl p-6 transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center font-bold text-accent text-lg">
                      {comp.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="px-3 py-1 bg-bg-elevated border border-border text-xs font-semibold text-text-secondary rounded-full flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-accent" /> {comp.totalProblems || 0} Problems
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
                    {comp.name} Sheet
                  </h2>
                  <p className="text-text-secondary text-xs leading-relaxed line-clamp-2 mb-6">
                    {comp.description || `Curated list of frequently asked ${comp.name} interview questions.`}
                  </p>
                </div>

                <Link
                  to={`/companies/${comp.slug}/problems`}
                  className="btn-secondary text-xs w-full py-2.5 justify-center group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-colors"
                >
                  Practice {comp.name} Sheet <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-bg-card border border-border rounded-2xl">
            <Building2 className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-40" />
            <p className="text-white font-semibold text-sm">No companies found</p>
            <p className="text-text-muted text-xs mt-1">Try searching for a different company name.</p>
          </div>
        )}
      </div>
    </div>
  );
}
