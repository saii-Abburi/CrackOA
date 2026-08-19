import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, Clock, Circle, ChevronDown } from 'lucide-react';
import { problems } from '../data/landingData.js';

const filters = ['All', 'Easy', 'Medium', 'Hard'];

function StatusBadge({ status }) {
  if (status === 'solved') return (
    <span className="flex items-center gap-1.5 status-solved">
      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Solved
    </span>
  );
  if (status === 'progress') return (
    <span className="flex items-center gap-1.5 status-progress">
      <Clock className="w-3.5 h-3.5" aria-hidden="true" /> In Progress
    </span>
  );
  return (
    <span className="flex items-center gap-1.5 status-not-started">
      <Circle className="w-3.5 h-3.5" aria-hidden="true" /> Not Started
    </span>
  );
}

function DiffBadge({ diff }) {
  const cls =
    diff === 'Easy' ? 'difficulty-easy' :
    diff === 'Medium' ? 'difficulty-medium' :
    'difficulty-hard';
  return <span className={cls}>{diff}</span>;
}

export default function ProblemsPreview() {
  const [active, setActive] = useState('All');
  const [query, setQuery] = useState('');

  const filtered = problems.filter((p) => {
    const matchDiff = active === 'All' || p.difficulty === active;
    const matchQuery = p.title.toLowerCase().includes(query.toLowerCase());
    return matchDiff && matchQuery;
  });

  return (
    <section className="py-24" aria-labelledby="problems-preview-heading">
      <div className="container-xl">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="section-badge mb-5">Problems</span>
          <h2 id="problems-preview-heading" className="section-heading mb-5">
            Your preparation,
            <br />
            <span className="text-gradient-accent">at a glance.</span>
          </h2>
          <p className="section-subheading mx-auto">
            Every problem shows difficulty, frequency, and company at a glance.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search problems..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-bg-card border border-border rounded-lg text-white text-sm
                         placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-colors"
              aria-label="Search problems"
            />
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-2" role="group" aria-label="Filter by difficulty">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  active === f
                    ? 'bg-accent text-white'
                    : 'bg-bg-card border border-border text-text-secondary hover:text-white hover:border-border-subtle'
                }`}
                aria-pressed={active === f}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <motion.div
          className="bg-bg-card border border-border rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-border text-text-muted text-xs font-semibold uppercase tracking-wider">
            <div className="col-span-5">Problem</div>
            <div className="col-span-2">Difficulty</div>
            <div className="col-span-2 hidden sm:block">Frequency</div>
            <div className="col-span-2 hidden sm:block">Company</div>
            <div className="col-span-3 sm:col-span-1 text-right">Status</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border">
            <AnimatePresence mode="popLayout">
              {filtered.length > 0 ? (
                filtered.map((p) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-bg-elevated/50 transition-colors group cursor-pointer"
                    role="row"
                  >
                    <div className="col-span-5">
                      <p className="text-white text-sm font-medium group-hover:text-accent transition-colors line-clamp-1">
                        {p.id}. {p.title}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <DiffBadge diff={p.difficulty} />
                    </div>
                    <div className="col-span-2 hidden sm:flex items-center gap-2">
                      <div className="flex-1 bg-bg-elevated rounded-full h-1" aria-hidden="true">
                        <div
                          className="h-1 rounded-full bg-accent/60"
                          style={{ width: `${p.frequency}%` }}
                        />
                      </div>
                      <span className="text-text-secondary text-xs shrink-0">{p.frequency}%</span>
                    </div>
                    <div className="col-span-2 hidden sm:block">
                      <span className="text-text-secondary text-xs font-medium">{p.company}</span>
                    </div>
                    <div className="col-span-3 sm:col-span-1 flex justify-end">
                      <StatusBadge status={p.status} />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-12 text-center text-text-muted text-sm">
                  No problems match your filters.
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border flex items-center justify-between">
            <span className="text-text-muted text-xs">
              Showing {filtered.length} of {problems.length} problems
            </span>
            <button className="flex items-center gap-1 text-accent text-xs font-medium hover:text-accent-hover transition-colors">
              View all problems <ChevronDown className="w-3 h-3 rotate-[-90deg]" aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
