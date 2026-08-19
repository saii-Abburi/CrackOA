import { motion } from 'framer-motion';
import { ArrowDown, Check, X } from 'lucide-react';

const traditional = [
  { text: 'Random Problems', bad: true },
  { text: 'No Priority', bad: true },
  { text: 'No Tracking', bad: true },
  { text: 'Uncertain Outcome', bad: true },
];

const companyWise = [
  { text: 'Company-specific Problems', good: true },
  { text: 'High-Frequency First', good: true },
  { text: 'Full Progress Tracking', good: true },
  { text: 'Interview Ready', good: true },
];

function PathCard({ title, items, accent, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`flex-1 rounded-2xl border p-6 ${
        accent
          ? 'border-border-accent bg-accent/5'
          : 'border-border bg-bg-card'
      }`}
    >
      <p className={`text-sm font-semibold uppercase tracking-wider mb-5 ${accent ? 'text-accent' : 'text-text-muted'}`}>
        {title}
      </p>
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <div key={item.text}>
            <div className={`flex items-center gap-3 py-2.5 px-3 rounded-lg ${accent ? 'bg-accent/5' : 'bg-bg-elevated'}`}>
              {accent ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              ) : (
                <X className="w-4 h-4 text-red-400/70 shrink-0" aria-hidden="true" />
              )}
              <span className={`text-sm font-medium ${accent ? 'text-white' : 'text-text-secondary'}`}>
                {item.text}
              </span>
            </div>
            {i < items.length - 1 && (
              <div className="flex justify-center my-1">
                <ArrowDown className={`w-3 h-3 ${accent ? 'text-accent' : 'text-text-dim'}`} aria-hidden="true" />
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function SolutionSection() {
  return (
    <section className="py-24 bg-bg-secondary/30" aria-labelledby="solution-heading">
      <div className="container-xl">
        <div className="max-w-2xl mb-16">
          <span className="section-badge mb-5">The Solution</span>
          <h2 id="solution-heading" className="section-heading mb-5">
            Know <span className="text-gradient-accent">what</span> to solve.
            <br />
            Know <span className="text-gradient-accent">why</span> you're solving it.
          </h2>
          <p className="section-subheading">
            Company-wise problem frequency helps you prioritize the questions that matter most to your target companies.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-5 items-stretch max-w-2xl">
          <PathCard title="Traditional Preparation" items={traditional} accent={false} delay={0} />

          {/* VS divider */}
          <motion.div
            className="flex sm:flex-col items-center justify-center gap-2 shrink-0"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="hidden sm:block w-px flex-1 bg-border" aria-hidden="true" />
            <span className="text-xs font-bold text-text-muted border border-border rounded-full px-3 py-1 bg-bg-card">
              VS
            </span>
            <div className="hidden sm:block w-px flex-1 bg-border" aria-hidden="true" />
          </motion.div>

          <PathCard title="Company-wise Preparation" items={companyWise} accent delay={0.15} />
        </div>
      </div>
    </section>
  );
}
