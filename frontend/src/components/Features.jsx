import { motion } from 'framer-motion';
import {
  Building2, TrendingUp, SlidersHorizontal,
  CheckCircle2, FileText, BookOpen,
} from 'lucide-react';
import { features } from '../data/landingData.js';

const iconMap = { Building2, TrendingUp, SlidersHorizontal, CheckCircle2, FileText, BookOpen };

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function Features() {
  return (
    <section className="py-24" aria-labelledby="features-heading">
      <div className="container-xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="section-badge mb-5">Features</span>
          <h2 id="features-heading" className="section-heading mb-5">
            Everything you need to{' '}
            <span className="text-gradient-accent">prepare smarter.</span>
          </h2>
          <p className="section-subheading mx-auto">
            A focused set of tools designed specifically for coding interview preparation — nothing more, nothing less.
          </p>
        </div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {features.map((f) => {
            const Icon = iconMap[f.icon];
            return (
              <motion.article
                key={f.title}
                variants={item}
                className="group card-hover"
                aria-label={f.title}
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4
                                group-hover:bg-accent/15 transition-colors duration-300">
                  {Icon && <Icon className="w-5 h-5 text-accent" aria-hidden="true" />}
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{f.description}</p>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
