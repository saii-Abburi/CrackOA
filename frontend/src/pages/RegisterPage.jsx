import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Code2, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import SEO from '../components/SEO.jsx';

const passwordRules = [
  { test: (p) => p.length >= 6, label: 'At least 6 characters' },
  { test: (p) => /[A-Za-z]/.test(p), label: 'Contains a letter' },
  { test: (p) => /[0-9]/.test(p), label: 'Contains a number' },
];

export default function RegisterPage() {
  const { register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 relative overflow-hidden bg-bg-primary">
      <SEO title="Register - CodeRank" description="Create your account" noindex={true} />
      {/* Subtle bg glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(255,107,0,0.07) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2 group" aria-label="CodeRank home">
            <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center group-hover:bg-accent-hover transition-colors">
              <Code2 className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-white font-bold text-xl">
              Code<span className="text-accent">Rank</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-bg-card border border-border rounded-2xl p-8 shadow-2xl">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-white mb-1.5">Create your account</h1>
            <p className="text-text-secondary text-sm">
              Free to get started. No credit card required.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-5"
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="mb-4">
              <label htmlFor="register-name" className="block text-sm font-medium text-text-secondary mb-1.5">
                Full name
              </label>
              <input
                id="register-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Sai Teja"
                className="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-white text-sm
                           placeholder:text-text-muted focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30
                           transition-colors duration-200 disabled:opacity-50"
                disabled={isSubmitting}
                aria-required="true"
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="register-email" className="block text-sm font-medium text-text-secondary mb-1.5">
                Email address
              </label>
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-white text-sm
                           placeholder:text-text-muted focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30
                           transition-colors duration-200 disabled:opacity-50"
                disabled={isSubmitting}
                aria-required="true"
              />
            </div>

            {/* Password */}
            <div className="mb-2">
              <label htmlFor="register-password" className="block text-sm font-medium text-text-secondary mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 pr-11 bg-bg-elevated border border-border rounded-xl text-white text-sm
                             placeholder:text-text-muted focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30
                             transition-colors duration-200 disabled:opacity-50"
                  disabled={isSubmitting}
                  aria-required="true"
                  aria-describedby="password-requirements"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors p-1
                             focus:outline-none focus:text-white"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" aria-hidden="true" />
                    : <Eye className="w-4 h-4" aria-hidden="true" />
                  }
                </button>
              </div>
            </div>

            {/* Password strength hints */}
            {form.password && (
              <motion.ul
                id="password-requirements"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex flex-col gap-1 mb-5 pl-1"
                aria-label="Password requirements"
              >
                {passwordRules.map((rule) => {
                  const passed = rule.test(form.password);
                  return (
                    <li key={rule.label} className={`flex items-center gap-2 text-xs ${passed ? 'text-emerald-400' : 'text-text-muted'}`}>
                      <CheckCircle2 className={`w-3 h-3 shrink-0 ${passed ? 'text-emerald-400' : 'text-border-subtle'}`} aria-hidden="true" />
                      {rule.label}
                    </li>
                  );
                })}
              </motion.ul>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary w-full justify-center py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-2"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-text-muted text-xs mt-5 leading-relaxed">
            By creating an account you agree to our{' '}
            <a href="#" className="text-text-secondary hover:text-white transition-colors">Terms</a>{' '}
            and{' '}
            <a href="#" className="text-text-secondary hover:text-white transition-colors">Privacy Policy</a>.
          </p>

          <p className="text-center text-text-secondary text-sm mt-4">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-accent hover:text-accent-hover font-medium transition-colors focus:outline-none focus:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
