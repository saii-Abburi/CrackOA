import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { companies } from '../data/landingData.js';

const displayed = companies.slice(0, 6);

function CompanyInitials({ name }) {
  return (
    <div className="w-9 h-9 rounded-lg bg-bg-elevated border border-border flex items-center justify-center shrink-0">
      <span className="text-xs font-bold text-white">
        {name.slice(0, 2).toUpperCase()}
      </span>
    </div>
  );
}

export default function CompanySection() {
  return (
    <section className="py-24 bg-bg-secondary/30" aria-labelledby="company-section-heading">
      <div className="container-xl">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
          <div>
            <span className="section-badge mb-5">Companies</span>
            <h2 id="company-section-heading" className="section-heading">
              Your target company.
              <br />
              <span className="text-gradient-accent">Your preparation path.</span>
            </h2>
          </div>
          <Link
            to="/companies"
            className="btn-secondary self-start lg:self-auto shrink-0"
          >
            View all companies
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((c, i) => {
            const pct = Math.round((c.solved / c.total) * 100);
            return (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="group card-hover cursor-pointer"
                role="article"
                aria-label={`${c.name}: ${c.solved} of ${c.total} problems solved`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <CompanyInitials name={c.name} />
                  <div>
                    <h3 className="text-white font-semibold text-sm">{c.name}</h3>
                    <p className="text-text-muted text-xs">{c.total} problems</p>
                  </div>
                  <div className="ml-auto">
                    <span className="text-accent font-bold text-sm">{pct}%</span>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-text-muted mb-2">
                  <span>{c.solved} solved</span>
                  <span>{c.total - c.solved} remaining</span>
                </div>

                <div className="w-full bg-bg-elevated rounded-full h-1.5 mb-4" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                  <motion.div
                    className="h-1.5 rounded-full bg-gradient-to-r from-accent to-amber-400"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.06 + 0.3, ease: 'easeOut' }}
                  />
                </div>

                <Link
                  to={`/companies/${c.slug}/problems`}
                  className="flex items-center gap-1 text-accent text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  tabIndex={0}
                >
                  View problems <ChevronRight className="w-3 h-3" aria-hidden="true" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
