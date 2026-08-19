import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function FinalCTA() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-32 relative overflow-hidden" aria-labelledby="final-cta-heading">
      {/* Orange radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(255,107,0,0.12) 0%, transparent 65%)',
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
          <span className="section-badge mb-8 mx-auto">Get Started</span>

          <h2
            id="final-cta-heading"
            className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-6"
          >
            Stop guessing
            <br />
            what to{' '}
            <span className="text-gradient-accent">prepare.</span>
          </h2>

          <p className="text-text-secondary text-lg max-w-md mx-auto mb-10 leading-relaxed">
            Start solving the problems that actually matter for your target companies.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
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
              Browse Problems
            </Link>
          </div>

          <p className="text-text-muted text-sm">
            No credit card required. Free to get started.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
