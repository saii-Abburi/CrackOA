import { motion } from 'framer-motion';
import { Shuffle, Compass, BarChart2 } from 'lucide-react';

const problems = [
  {
    icon: Shuffle,
    title: 'Random Practice',
    description:
      'Solving problems without knowing what companies actually ask wastes your limited preparation time.',
  },
  {
    icon: Compass,
    title: 'No Direction',
    description:
      'Jumping between topics without a structured preparation path leaves you underprepared in key areas.',
  },
  {
    icon: BarChart2,
    title: 'No Progress Visibility',
    description:
      'Solving hundreds of questions without knowing whether you\'re actually improving leads to burnout.',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

export default function ProblemSection() {
  return (
    <section className="py-24" aria-labelledby="problem-heading">
      <div className="container-xl">
        <div className="max-w-2xl mb-16">
          <span className="section-badge mb-5">The Problem</span>
          <h2 id="problem-heading" className="section-heading mb-5">
            Stop solving problems <span className="text-gradient-accent">blindly.</span>
          </h2>
          <p className="section-subheading">
            There are thousands of DSA problems. Your interview preparation doesn't need all of them.
          </p>
        </div>

        <motion.div
          className="grid sm:grid-cols-3 gap-5"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {problems.map((p) => (
            <motion.div
              key={p.title}
              variants={item}
              className="card-hover group"
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4
                              group-hover:bg-red-500/15 transition-colors duration-300">
                <p.icon className="w-5 h-5 text-red-400" aria-hidden="true" />
              </div>
              <h3 className="text-white font-semibold text-base mb-2">{p.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{p.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
