import { motion } from 'framer-motion';
import { Target, TrendingUp, Code2 } from 'lucide-react';

const capabilities = [
  {
    icon: Target,
    title: 'Focused Preparation',
    description: 'No random problems. Every question is organized by company and frequency so you know exactly what to solve and why.',
  },
  {
    icon: TrendingUp,
    title: 'Measurable Progress',
    description: 'Track solved problems, monitor company-wise completion, and see your preparation progress grow over time.',
  },
  {
    icon: Code2,
    title: 'Developer-first Experience',
    description: 'Built by developers, for developers. Clean interface, keyboard-friendly, and designed to stay out of your way.',
  },
];

export default function BuiltForDevelopers() {
  return (
    <section className="py-24 bg-bg-secondary/30" aria-labelledby="built-heading">
      <div className="container-xl">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="section-badge mb-5">Why CodeRank</span>
          <h2 id="built-heading" className="section-heading mb-5">
            Built for developers who are{' '}
            <span className="text-gradient-accent">serious</span> about getting better.
          </h2>
          <p className="section-subheading mx-auto">
            CodeRank is not another problem aggregator. It's a focused preparation tool designed to help you
            practice what matters, track what counts, and build real interview readiness.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {capabilities.map((cap, i) => (
            <motion.article
              key={cap.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="card-hover group text-center"
              aria-label={cap.title}
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-5
                              group-hover:bg-accent/15 transition-colors duration-300">
                <cap.icon className="w-6 h-6 text-accent" aria-hidden="true" />
              </div>
              <h3 className="text-white font-semibold text-base mb-3">{cap.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{cap.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
