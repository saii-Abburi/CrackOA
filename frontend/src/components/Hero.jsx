import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
};

export default function Hero() {
  const { isAuthenticated } = useAuth();

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 overflow-hidden"
      aria-label="Hero section"
    >
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 bg-hero-gradient pointer-events-none"
        aria-hidden="true"
      />

      {/* Grid overlay — very subtle */}
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
          <span className="section-badge mb-8">
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            Built for serious interview preparation
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.05] tracking-tight mb-6"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
        >
          Master{' '}
          <span className="text-gradient-accent">DSA.</span>
          <br />
          Crack{' '}
          <span className="relative inline-block">
            Company
            <span
              className="absolute -bottom-1 left-0 right-0 h-[3px] bg-accent rounded-full"
              aria-hidden="true"
            />
          </span>
          {' '}Interviews.
        </motion.h1>

        {/* Supporting paragraph */}
        <motion.p
          className="text-text-secondary text-lg sm:text-xl max-w-xl leading-relaxed mb-10"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
        >
          Stop solving random problems. Practice a curated, company-wise DSA sheet designed to help you focus on{' '}
          <strong className="text-white font-medium">what actually matters.</strong>
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center gap-4 mb-6"
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
            Explore Problems
          </Link>
        </motion.div>

        {/* Trust line */}
        <motion.p
          className="text-text-muted text-sm"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={4}
        >
          No distractions. No guesswork. Just focused preparation.
        </motion.p>
      </div>
    </section>
  );
}
