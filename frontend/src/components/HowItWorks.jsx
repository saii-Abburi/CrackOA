import { motion } from 'framer-motion';
import { Building2, Code2, TrendingUp } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Building2,
    title: 'Choose Your Company',
    description:
      'Pick the companies you\'re targeting. Filter your preparation to exactly the problems that company asks.',
  },
  {
    number: '02',
    icon: Code2,
    title: 'Solve What Matters',
    description:
      'Focus on high-frequency problems organized by topic and difficulty. No more guessing what\'s important.',
  },
  {
    number: '03',
    icon: TrendingUp,
    title: 'Track Your Progress',
    description:
      'Mark problems as solved, add personal notes, and watch your interview readiness improve over time.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24" aria-labelledby="how-it-works-heading">
      <div className="container-xl">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="section-badge mb-5">How It Works</span>
          <h2 id="how-it-works-heading" className="section-heading mb-5">
            Three steps.
            <br />
            <span className="text-gradient-accent">One goal.</span>
          </h2>
        </div>

        <div className="relative">
          {/* Connecting line — desktop only */}
          <div
            className="hidden lg:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-transparent via-border to-transparent"
            aria-hidden="true"
          />

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-6 relative">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15, ease: 'easeOut' }}
                className="flex flex-col items-center lg:items-center text-center"
              >
                {/* Step icon + number */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-bg-card border border-border flex items-center justify-center
                                  group-hover:border-border-accent transition-colors">
                    <step.icon className="w-8 h-8 text-accent" aria-hidden="true" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>

                <p className="text-text-muted text-xs font-mono tracking-widest mb-2">{step.number}</p>
                <h3 className="text-white font-bold text-xl mb-3">{step.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed max-w-xs">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
