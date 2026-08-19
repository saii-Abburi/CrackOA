import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  Code2,
  Tag,
  TrendingUp,
  CheckCircle2,
  Circle,
  Clock,
  ChevronRight,
} from 'lucide-react';

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
    diff === 'Easy'
      ? 'difficulty-easy'
      : diff === 'Medium'
      ? 'difficulty-medium'
      : 'difficulty-hard';
  return <span className={cls}>{diff}</span>;
}

export default function DashboardPreview() {
  return (
    <section className="pb-24 relative" aria-label="Dashboard preview">
      <div className="container-xl">
        {/* Orange glow behind */}
        <div
          className="absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse, rgba(255,107,0,0.10) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative"
        >
          {/* Browser chrome */}
          <div className="bg-bg-secondary border border-border rounded-2xl overflow-hidden shadow-2xl">
            {/* Browser bar */}
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
            <div className="flex min-h-[440px]">
              {/* Sidebar */}
              <aside className="hidden sm:flex flex-col w-48 border-r border-border py-4 gap-1 shrink-0 bg-bg-card/50">
                <div className="px-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-accent rounded flex items-center justify-center">
                      <Code2 className="w-3 h-3 text-white" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-bold text-white">CodeRank</span>
                  </div>
                </div>
                {sidebarItems.map((item) => (
                  <button
                    key={item.label}
                    className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                      item.active
                        ? 'text-white bg-accent/10 border-r-2 border-accent font-medium'
                        : 'text-text-secondary hover:text-white hover:bg-white/5'
                    }`}
                    aria-current={item.active ? 'page' : undefined}
                  >
                    <item.icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    {item.label}
                  </button>
                ))}
              </aside>

              {/* Main panel */}
              <div className="flex-1 p-5 overflow-hidden">
                {/* Greeting */}
                <div className="mb-5">
                  <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-1">Overview</p>
                  <h2 className="text-white font-semibold text-lg">Good morning, Developer 👋</h2>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
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
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white text-sm font-medium">Your Progress</p>
                    <span className="text-accent text-sm font-semibold">17.4%</span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
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
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white text-sm font-medium">Top Companies</p>
                    <button className="text-accent text-xs font-medium flex items-center gap-1 hover:text-accent-hover transition-colors">
                      View all <ChevronRight className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {topCompanies.map((c) => {
                      const pct = Math.round((c.solved / c.problems) * 100);
                      return (
                        <div
                          key={c.name}
                          className="bg-bg-card border border-border rounded-lg p-3 hover:border-border-subtle transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
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

          {/* Reflection fade */}
          <div
            className="absolute -bottom-10 left-0 right-0 h-20 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, transparent, #0A0A0A)',
            }}
            aria-hidden="true"
          />
        </motion.div>
      </div>
    </section>
  );
}
