import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Target, Calendar, BarChart3 } from 'lucide-react';

// ── Illustrative demo data ──────────────────────────────────────────────────

const difficultyData = [
  { label: 'Easy', solved: 35, total: 120, color: 'bg-emerald-400' },
  { label: 'Medium', solved: 42, total: 200, color: 'bg-amber-400' },
  { label: 'Hard', solved: 10, total: 80, color: 'bg-red-400' },
];

// Generate a stable activity heatmap (7 rows × 12 columns = 84 cells)
const heatmapData = [
  0,1,2,0,3,1,0,2,4,1,0,0,
  1,0,0,2,1,3,0,0,1,2,0,1,
  0,2,1,0,0,1,3,2,0,1,2,0,
  1,0,3,1,2,0,0,1,0,2,1,3,
  0,1,0,2,1,0,3,0,2,1,0,2,
  2,0,1,0,0,2,1,3,2,4,3,2,
  1,3,2,0,1,2,3,4,3,2,4,3,
];

const levelColors = [
  'bg-bg-elevated border border-border',
  'bg-accent/20',
  'bg-accent/40',
  'bg-accent/70',
  'bg-accent',
];

const statCards = [
  { icon: Flame, label: 'Current Streak', value: '12', unit: 'days', color: 'text-orange-400' },
  { icon: Target, label: 'Problems Solved', value: '87', unit: 'total', color: 'text-emerald-400' },
  { icon: Calendar, label: 'Weekly Goal', value: '15/20', unit: 'done', color: 'text-sky-400' },
  { icon: BarChart3, label: 'Completion', value: '17%', unit: 'overall', color: 'text-violet-400' },
];

// ── Counter hook ─────────────────────────────────────────────────────────────

function useCountUp(target, duration = 1200, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const numTarget = parseInt(target, 10);
    if (isNaN(numTarget)) { setCount(target); return; }
    const step = numTarget / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= numTarget) {
        setCount(numTarget);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, start]);
  return count;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ProgressAnalytics() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-24"
      aria-labelledby="progress-heading"
    >
      <div className="container-xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
          <div className="max-w-xl">
            <span className="section-badge mb-5">Progress & Analytics</span>
            <h2 id="progress-heading" className="section-heading mb-5">
              Consistency beats{' '}
              <span className="text-gradient-accent">random grinding.</span>
            </h2>
            <p className="section-subheading">
              Track your daily activity, streak, difficulty distribution, and overall completion. Small daily habits compound into interview readiness.
            </p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Left Column — Stat Cards */}
          <div className="lg:col-span-1 grid grid-cols-2 gap-4 content-start">
            {statCards.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="bg-bg-card border border-border rounded-xl p-4"
              >
                <s.icon className={`w-5 h-5 ${s.color} mb-3`} aria-hidden="true" />
                <p className={`text-2xl font-bold ${s.color} tabular-nums`}>
                  {s.value}
                </p>
                <p className="text-text-muted text-xs mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Middle Column — Difficulty Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-bg-card border border-border rounded-xl p-5"
          >
            <p className="text-white font-semibold text-sm mb-5">Difficulty Distribution</p>
            <div className="flex flex-col gap-5">
              {difficultyData.map((d) => {
                const pct = Math.round((d.solved / d.total) * 100);
                return (
                  <div key={d.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-text-secondary text-sm font-medium">{d.label}</span>
                      <span className="text-white text-sm font-semibold tabular-nums">
                        {d.solved}<span className="text-text-muted font-normal">/{d.total}</span>
                      </span>
                    </div>
                    <div className="w-full bg-bg-elevated rounded-full h-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                      <motion.div
                        className={`h-2 rounded-full ${d.color}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total progress */}
            <div className="mt-6 pt-5 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-text-secondary text-sm">Overall Progress</span>
                <span className="text-accent text-sm font-semibold">87 / 400</span>
              </div>
              <div className="w-full bg-bg-elevated rounded-full h-2" role="progressbar" aria-valuenow={22} aria-valuemin={0} aria-valuemax={100}>
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-accent to-amber-400"
                  initial={{ width: 0 }}
                  whileInView={{ width: '22%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.div>

          {/* Right Column — Activity Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-bg-card border border-border rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-5">
              <p className="text-white font-semibold text-sm">Activity — Last 12 Weeks</p>
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <span>Less</span>
                {levelColors.map((c, i) => (
                  <span key={i} className={`w-2.5 h-2.5 rounded-sm ${c}`} aria-hidden="true" />
                ))}
                <span>More</span>
              </div>
            </div>

            {/* Heatmap grid — 12 columns × 7 rows */}
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}
              aria-label="Activity heatmap (illustrative)"
              role="img"
            >
              {heatmapData.map((level, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-sm ${levelColors[level]}`}
                  title={`${level > 0 ? level : 'No'} problem${level !== 1 ? 's' : ''} solved`}
                />
              ))}
            </div>

            {/* Week progress */}
            <div className="mt-5 pt-4 border-t border-border flex items-center gap-4">
              <div className="flex-1 bg-bg-elevated rounded-full h-1.5" role="progressbar" aria-valuenow={75} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-1.5 rounded-full bg-gradient-to-r from-accent to-amber-400" style={{ width: '75%' }} />
              </div>
              <span className="text-text-muted text-xs shrink-0">Weekly goal: 75%</span>
            </div>

            <p className="text-text-dim text-xs mt-4 italic">
              * Illustrative data — your actual activity appears on your dashboard.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
