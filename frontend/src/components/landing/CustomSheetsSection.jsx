import { motion } from 'framer-motion';
import { CheckCircle2, Circle, ListChecks, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { demoSheet } from '../../data/landingData.js';

export default function CustomSheetsSection() {
  const { isAuthenticated } = useAuth();
  const solvedCount = demoSheet.problems.filter((p) => p.solved).length;
  const totalCount = demoSheet.problems.length;
  const pct = Math.round((solvedCount / totalCount) * 100);

  return (
    <section className="py-24 bg-bg-secondary/30" aria-labelledby="sheets-heading">
      <div className="container-xl">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          {/* Left — Text */}
          <div className="lg:w-1/2">
            <span className="section-badge mb-5">
              <ListChecks className="w-3 h-3" aria-hidden="true" />
              Coming Soon
            </span>
            <h2 id="sheets-heading" className="section-heading mb-5">
              Custom problem{' '}
              <span className="text-gradient-accent">sheets.</span>
            </h2>
            <p className="section-subheading mb-8">
              Create personalized collections of coding problems. Build topic-specific sheets,
              interview preparation lists, and track your completion — all in one place.
            </p>

            <ul className="flex flex-col gap-3 mb-8">
              {[
                'Create custom problem collections',
                'Organize problems by topic or interview focus',
                'Track completion with progress indicators',
                'Build personalized practice paths',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" aria-hidden="true" />
                  <span className="text-text-secondary text-sm">{item}</span>
                </li>
              ))}
            </ul>

            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="btn-primary text-sm"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Right — Sheet Preview */}
          <motion.div
            className="lg:w-1/2 w-full"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
              {/* Sheet Header */}
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <ListChecks className="w-4 h-4 text-accent" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{demoSheet.title}</p>
                    <p className="text-text-muted text-xs">{solvedCount} of {totalCount} completed</p>
                  </div>
                </div>
                <span className="text-accent text-sm font-semibold tabular-nums">{pct}%</span>
              </div>

              {/* Progress bar */}
              <div className="px-5 py-3 border-b border-border">
                <div className="w-full bg-bg-elevated rounded-full h-1.5" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-accent to-amber-400 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Problem List */}
              <div className="divide-y divide-border">
                {demoSheet.problems.map((p, i) => (
                  <motion.div
                    key={p.title}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className={`flex items-center gap-3 px-5 py-3 ${
                      p.solved ? 'opacity-70' : ''
                    } hover:bg-bg-elevated/50 transition-colors`}
                  >
                    {p.solved ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-label="Completed" />
                    ) : (
                      <Circle className="w-4 h-4 text-text-dim shrink-0" aria-label="Not completed" />
                    )}
                    <span className={`text-sm font-medium ${
                      p.solved ? 'text-text-secondary line-through' : 'text-white'
                    }`}>
                      {i + 1}. {p.title}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Footer note */}
              <div className="px-5 py-3 border-t border-border">
                <p className="text-text-dim text-xs italic">
                  Custom Sheets is a planned feature — illustrative preview.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
