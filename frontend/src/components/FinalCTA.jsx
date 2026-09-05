import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function FinalCTA() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-28 relative overflow-hidden" aria-labelledby="final-cta-heading">
      {/* Orange radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(255,107,0,0.10) 0%, transparent 65%)',
        }}
        aria-hidden="true"
      />

      <div className="container-xl relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-badge mb-8 mx-auto">
            <Zap className="w-3 h-3" aria-hidden="true" />
            Get Started
          </span>

          <h2
            id="final-cta-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.1] tracking-tight mb-5"
          >
            Your next problem{' '}
            <span className="text-gradient-accent">is waiting.</span>
          </h2>

          <p className="text-text-secondary text-lg max-w-md mx-auto mb-10 leading-relaxed">
            Start solving the problems that actually matter for your target companies.
            Build consistency. Measure progress.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="btn-primary text-base px-10 py-4 shadow-accent-md"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start Practicing'}
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
            <Link
              to="/problems"
              className="btn-secondary text-base px-8 py-4"
            >
              Explore Problems
            </Link>
          </div>

          <p className="text-text-muted text-sm">
            Free to use. No credit card required.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
