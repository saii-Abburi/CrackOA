import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ArrowRight, Check, Zap } from 'lucide-react';

const freeFeatures = [
  'Company-wise problem sets',
  'Frequency-based ranking',
  'Progress tracking',
  'Personal notes per problem',
  'Topic-based filtering',
  'Blog & editorials access',
];

export default function PremiumSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section id="pricing" className="py-24" aria-labelledby="premium-heading">
      <div className="container-xl">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="section-badge mb-5">
            <Zap className="w-3 h-3" aria-hidden="true" />
            Get Started
          </span>
          <h2 id="premium-heading" className="section-heading mb-5">
            Everything you need.{' '}
            <span className="text-gradient-accent">Free to start.</span>
          </h2>
          <p className="section-subheading mx-auto">
            CodeRank's core features are completely free. Start preparing with company-wise problems,
            progress tracking, and personal notes — no credit card required.
          </p>
        </div>

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <div className="bg-bg-card border border-border-accent rounded-2xl p-8 relative overflow-hidden">
            {/* Accent glow */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(255,107,0,0.08) 0%, transparent 70%)' }}
              aria-hidden="true"
            />

            <div className="relative">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-black text-white">Free</span>
              </div>
              <p className="text-text-secondary text-sm mb-8">
                Full access to company-wise DSA preparation.
              </p>

              <ul className="flex flex-col gap-3 mb-8">
                {freeFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                    <span className="text-text-secondary text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="btn-primary w-full justify-center text-base py-3.5"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Start Practicing'}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>

              <p className="text-text-dim text-xs text-center mt-4">
                No credit card. No trial period. Just start.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
