import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Code2, ChevronRight, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard,
  Building2,
  Tag,
  TrendingUp,
  CheckCircle2,
  Circle,
  Clock,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
};

// ── Dashboard Preview Data (illustrative) ────────────────────────────────────

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Building2, label: 'Companies' },
  { icon: Code2, label: 'Problems' },
  { icon: Tag, label: 'Topics' },
  { icon: TrendingUp, label: 'Progress' },
];

const topCompanies = [
  { name: 'Google', problems: 120, solved: 34 },
  { name: 'Amazon', problems: 145, solved: 41 },
  { name: 'Microsoft', problems: 110, solved: 29 },
  { name: 'Meta', problems: 95, solved: 18 },
];

const recentProblems = [
  { title: 'Two Sum', diff: 'Easy', status: 'solved' },
  { title: 'LRU Cache', diff: 'Medium', status: 'progress' },
  { title: 'Word Ladder', diff: 'Hard', status: 'not_started' },
];

function StatusIcon({ status }) {
  if (status === 'solved') return <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-label="Solved" />;
  if (status === 'progress') return <Clock className="w-4 h-4 text-amber-400" aria-label="In progress" />;
  return <Circle className="w-4 h-4 text-zinc-600" aria-label="Not started" />;
}

function DiffBadge({ diff }) {
  const cls =
    diff === 'Easy' ? 'difficulty-easy' :
    diff === 'Medium' ? 'difficulty-medium' :
    'difficulty-hard';
  return <span className={cls}>{diff}</span>;
}

// ── Hero Component ───────────────────────────────────────────────────────────

export default function Hero() {
  const { isAuthenticated } = useAuth();

  return (
    <section
      className="relative flex flex-col items-center pt-28 sm:pt-32 pb-8 overflow-hidden"
      aria-label="Hero section"
    >
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 bg-hero-gradient pointer-events-none"
        aria-hidden="true"
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
        aria-hidden="true"
      />

      <div className="container-xl relative z-10 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
        >
          <span className="section-badge mb-6">
            <Code2 className="w-3 h-3" aria-hidden="true" />
            DSA &amp; SQL Practice Platform
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.08] tracking-tight mb-5"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
        >
          Practice smarter.{' '}
          <span className="text-gradient-accent">Track progress.</span>
          <br className="hidden sm:block" />
          {' '}Crack interviews.
        </motion.h1>

        {/* Supporting paragraph */}
        <motion.p
          className="text-text-secondary text-base sm:text-lg max-w-xl leading-relaxed mb-8"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
        >
          Stop solving random problems. Practice company-wise{' '}
          <strong className="text-white font-medium">DSA</strong> and{' '}
          <strong className="text-white font-medium">SQL</strong> problems ranked by frequency,
          track your preparation progress, and focus on{' '}
          <strong className="text-white font-medium">what actually gets asked.</strong>
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center gap-3 mb-5"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={3}
        >
          <Link
            to={isAuthenticated ? '/dashboard' : '/register'}
            className="btn-primary text-base px-8 py-3.5 shadow-accent-sm"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Start Practicing'}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link
            to="/problems"
            className="btn-secondary text-base px-8 py-3.5"
          >
            DSA Problems
          </Link>
          <Link
            to="/sql"
            className="flex items-center gap-2 btn-secondary text-base px-8 py-3.5 border-indigo-500/30 text-indigo-300 hover:text-white hover:border-indigo-400"
          >
            <Database className="w-4 h-4" aria-hidden="true" />
            SQL Problems
          </Link>
        </motion.div>

        {/* Trust line */}
        <motion.p
          className="text-text-muted text-sm mb-12"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={4}
        >
          Free to use. No credit card required.
        </motion.p>

        {/* ── Product Visual: Dashboard Preview ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
          className="w-full max-w-4xl"
        >
          <div className="bg-bg-secondary border border-border rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-bg-card">
              <span className="w-3 h-3 rounded-full bg-red-500/60" aria-hidden="true" />
              <span className="w-3 h-3 rounded-full bg-amber-500/60" aria-hidden="true" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/60" aria-hidden="true" />
              <div className="flex-1 mx-3">
                <div className="bg-bg-elevated rounded-md px-3 py-1 text-xs text-text-muted font-mono max-w-xs mx-auto text-center">
                  coderank.io/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="flex min-h-[380px]">
              {/* Sidebar */}
              <aside className="hidden sm:flex flex-col w-44 border-r border-border py-4 gap-1 shrink-0 bg-bg-card/50">
                <div className="px-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-accent rounded flex items-center justify-center">
                      <Code2 className="w-3 h-3 text-white" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-bold text-white">CodeRank</span>
                  </div>
                </div>
                {sidebarItems.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-3 px-4 py-2 text-sm ${
                      item.active
                        ? 'text-white bg-accent/10 border-r-2 border-accent font-medium'
                        : 'text-text-secondary'
                    }`}
                  >
                    <item.icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    {item.label}
                  </div>
                ))}
              </aside>

              {/* Main panel */}
              <div className="flex-1 p-5 overflow-hidden">
                {/* Greeting */}
                <div className="mb-4">
                  <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-1">Overview</p>
                  <p className="text-white font-semibold text-base">Good morning, Developer 👋</p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Solved', value: '87', color: 'text-emerald-400' },
                    { label: 'Attempted', value: '23', color: 'text-amber-400' },
                    { label: 'Easy', value: '35', color: 'text-sky-400' },
                    { label: 'Hard', value: '10', color: 'text-red-400' },
                  ].map((s) => (
                    <div key={s.label} className="bg-bg-elevated border border-border rounded-xl p-3">
                      <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-text-muted text-xs mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Progress card */}
                <div className="bg-bg-elevated border border-border rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white text-sm font-medium">Your Progress</p>
                    <span className="text-accent text-sm font-semibold">17.4%</span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-white">87</span>
                    <span className="text-text-muted text-sm">/ 500 Problems Solved</span>
                  </div>
                  <div className="w-full bg-bg-card rounded-full h-1.5" role="progressbar" aria-valuenow={17} aria-valuemin={0} aria-valuemax={100}>
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-accent to-amber-400"
                      style={{ width: '17.4%' }}
                    />
                  </div>
                </div>

                {/* Top Companies */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white text-sm font-medium">Top Companies</p>
                    <span className="text-accent text-xs font-medium flex items-center gap-1">
                      View all <ChevronRight className="w-3 h-3" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {topCompanies.map((c) => {
                      const pct = Math.round((c.solved / c.problems) * 100);
                      return (
                        <div
                          key={c.name}
                          className="bg-bg-card border border-border rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-white text-xs font-semibold">{c.name}</span>
                            <span className="text-accent text-xs font-medium">{pct}%</span>
                          </div>
                          <p className="text-text-muted text-xs mb-1.5">
                            {c.solved} / {c.problems}
                          </p>
                          <div className="w-full bg-bg-elevated rounded-full h-1" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                            <div
                              className="h-1 rounded-full bg-accent"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom fade */}
          <div
            className="h-16 -mt-16 relative z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, #0A0A0A)' }}
            aria-hidden="true"
          />
        </motion.div>
      </div>
    </section>
  );
}
