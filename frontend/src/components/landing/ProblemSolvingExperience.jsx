import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search, CheckCircle2, Clock, Circle,
  ChevronRight, Target, Code2, TrendingUp, Sparkles,
} from 'lucide-react';
import { problems } from '../../data/landingData.js';

const steps = [
  { number: '01', icon: Target, label: 'Choose', description: 'Pick your target company' },
  { number: '02', icon: Code2, label: 'Solve', description: 'Focus on high-frequency problems' },
  { number: '03', icon: TrendingUp, label: 'Track', description: 'Monitor your progress' },
  { number: '04', icon: Sparkles, label: 'Improve', description: 'Build interview readiness' },
];

const filters = ['All', 'Easy', 'Medium', 'Hard'];

function StatusBadge({ status }) {
  if (status === 'solved') return (
    <span className="flex items-center gap-1.5 status-solved">
      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Solved
    </span>
  );
  if (status === 'progress') return (
    <span className="flex items-center gap-1.5 status-progress">
      <Clock className="w-3.5 h-3.5" aria-hidden="true" /> Attempted
    </span>
  );
  return (
    <span className="flex items-center gap-1.5 status-not-started">
      <Circle className="w-3.5 h-3.5" aria-hidden="true" /> New
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

export default function ProblemSolvingExperience() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [query, setQuery] = useState('');

  const filtered = problems.filter((p) => {
    const matchDiff = activeFilter === 'All' || p.difficulty === activeFilter;
    const matchQuery = p.title.toLowerCase().includes(query.toLowerCase());
    return matchDiff && matchQuery;
  });

  return (
    <section className="py-24 bg-bg-secondary/30" aria-labelledby="problem-solving-heading">
      <div className="container-xl">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <span className="section-badge mb-5">How It Works</span>
          <h2 id="problem-solving-heading" className="section-heading mb-5">
            A focused path from{' '}
            <span className="text-gradient-accent">problem to progress.</span>
          </h2>
          <p className="section-subheading">
            Choose your target company, solve high-frequency problems, track your completion, and build real interview readiness.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-bg-card border border-border"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                <step.icon className="w-5 h-5 text-accent" aria-hidden="true" />
              </div>
              <div>
                <p className="text-text-muted text-xs font-mono mb-0.5">{step.number}</p>
                <p className="text-white font-semibold text-sm">{step.label}</p>
                <p className="text-text-secondary text-xs leading-relaxed mt-0.5">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Interactive Problems Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
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
            <div className="flex items-center gap-2" role="group" aria-label="Filter by difficulty">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    activeFilter === f
                      ? 'bg-accent text-white'
                      : 'bg-bg-card border border-border text-text-secondary hover:text-white hover:border-border-subtle'
                  }`}
                  aria-pressed={activeFilter === f}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-border text-text-muted text-xs font-semibold uppercase tracking-wider">
              <div className="col-span-5 sm:col-span-4">Problem</div>
              <div className="col-span-3 sm:col-span-2">Difficulty</div>
              <div className="col-span-2 hidden sm:block">Frequency</div>
              <div className="col-span-2 hidden sm:block">Company</div>
              <div className="col-span-4 sm:col-span-2 text-right">Status</div>
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
                      <div className="col-span-5 sm:col-span-4">
                        <p className="text-white text-sm font-medium group-hover:text-accent transition-colors line-clamp-1">
                          {p.id}. {p.title}
                        </p>
                        <p className="text-text-muted text-xs mt-0.5 sm:hidden">{p.company}</p>
                      </div>
                      <div className="col-span-3 sm:col-span-2">
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
                      <div className="col-span-4 sm:col-span-2 flex justify-end">
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
              <Link
                to="/problems"
                className="flex items-center gap-1 text-accent text-xs font-medium hover:text-accent-hover transition-colors"
              >
                View all problems <ChevronRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
