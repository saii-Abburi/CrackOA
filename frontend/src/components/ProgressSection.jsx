import { motion } from 'framer-motion';
import { Flame, Target, Calendar } from 'lucide-react';

// Generate a simple mock heatmap grid (7 weeks × 7 days)
function generateHeatmap() {
  const cells = [];
  for (let i = 0; i < 49; i++) {
    const rand = Math.random();
    const level = rand < 0.3 ? 0 : rand < 0.55 ? 1 : rand < 0.75 ? 2 : rand < 0.9 ? 3 : 4;
    cells.push(level);
  }
  // Ensure last 12 days are mostly active (current streak)
  for (let i = 37; i < 49; i++) {
    cells[i] = Math.random() < 0.85 ? (Math.floor(Math.random() * 3) + 2) : 1;
  }
  return cells;
}

const heatmapData = generateHeatmap();

const levelColors = [
  'bg-bg-elevated border border-border',     // 0 — no activity
  'bg-accent/20',                             // 1
  'bg-accent/40',                             // 2
  'bg-accent/70',                             // 3
  'bg-accent',                               // 4
];

export default function ProgressSection() {
  return (
    <section className="py-24 bg-bg-secondary/30" aria-labelledby="progress-heading">
      <div className="container-xl">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left — text */}
          <div className="lg:w-1/2">
            <span className="section-badge mb-5">Progress</span>
            <h2 id="progress-heading" className="section-heading mb-5">
              Consistency beats
              <br />
              <span className="text-gradient-accent">random grinding.</span>
            </h2>
            <p className="section-subheading mb-8">
              Small daily habits compound into interview readiness. Your activity heatmap keeps you accountable and motivated.
            </p>

            {/* Streak stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Flame, label: 'Current Streak', value: '12 days', color: 'text-orange-400' },
                { icon: Target, label: 'Problems Solved', value: '87', color: 'text-emerald-400' },
                { icon: Calendar, label: 'Weekly Goal', value: '15 / 20', color: 'text-sky-400' },
              ].map((s) => (
                <div key={s.label} className="bg-bg-card border border-border rounded-xl p-4 text-center">
                  <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} aria-hidden="true" />
                  <p className={`text-lg font-bold ${s.color} mb-0.5 tabular-nums`}>{s.value}</p>
                  <p className="text-text-muted text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — heatmap */}
          <motion.div
            className="lg:w-1/2 w-full"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-white font-semibold text-sm">Activity — Last 7 Weeks</p>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <span>Less</span>
                  {levelColors.map((c, i) => (
                    <span
                      key={i}
                      className={`w-2.5 h-2.5 rounded-sm ${c}`}
                      aria-hidden="true"
                    />
                  ))}
                  <span>More</span>
                </div>
              </div>

              {/* Grid */}
              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}
                aria-label="Activity heatmap"
                role="img"
              >
                {heatmapData.map((level, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.2, delay: i * 0.008 }}
                    className={`aspect-square rounded-sm ${levelColors[level]}`}
                    title={`${level > 0 ? level : 'No'} problem${level !== 1 ? 's' : ''} solved`}
                  />
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-border flex items-center gap-4">
                <div className="flex-1 bg-bg-elevated rounded-full h-1.5" role="progressbar" aria-valuenow={75} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-1.5 rounded-full bg-gradient-to-r from-accent to-amber-400" style={{ width: '75%' }} />
                </div>
                <span className="text-text-muted text-xs shrink-0">Weekly goal: 75%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
