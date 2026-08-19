import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Code2, ArrowRight, AlertCircle, CheckCircle2, Loader2, Mail, Lock, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { sendLoginOtpApi } from '../api/auth.api.js';
import { useState, useEffect } from 'react';
import SEO from '../components/SEO.jsx';

export default function LoginPage() {
  const { login, loginWithOtp, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  if (isAuthenticated && !isLoading) {
    return <Navigate to={from} replace />;
  }

  // Tabs: 'password' | 'otp'
  const [loginMethod, setLoginMethod] = useState('password');

  // Password Login State
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP Login State
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState(1); // 1 = enter email, 2 = enter otp
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Resend Countdown
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  // Password Submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim() || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // OTP Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setOtpError('');
    setOtpSuccess('');

    if (!otpEmail.trim() || !otpEmail.includes('@')) {
      setOtpError('Please enter a valid email address.');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await sendLoginOtpApi(otpEmail.trim().toLowerCase());
      setOtpSuccess(res.message || '6-digit verification code sent to your email.');
      setOtpStep(2);
      setResendTimer(60);
    } catch (err) {
      setOtpError(err.response?.data?.message || err.message || 'Failed to send OTP code.');
    } finally {
      setOtpLoading(false);
    }
  };

  // OTP Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError('');

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP code.');
      return;
    }

    setOtpLoading(true);
    try {
      await loginWithOtp({ email: otpEmail.trim().toLowerCase(), otp: otpCode.trim() });
      navigate(from, { replace: true });
    } catch (err) {
      setOtpError(err.response?.data?.message || err.message || 'Invalid or expired OTP code.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 relative overflow-hidden bg-bg-primary">
      <SEO title="Login - CodeRank" description="Sign in to your account" noindex={true} />
      {/* Background Glow */}
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
        <div className="flex justify-center mb-6">
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1.5">Welcome back</h1>
            <p className="text-text-secondary text-sm">
              Sign in to continue your DSA preparation.
            </p>
          </div>

          {/* Login Method Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-bg-elevated rounded-xl border border-border mb-6">
            <button
              type="button"
              onClick={() => { setLoginMethod('password'); setError(''); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                loginMethod === 'password'
                  ? 'bg-accent text-white shadow-md'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Password Login
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod('otp'); setOtpError(''); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                loginMethod === 'otp'
                  ? 'bg-accent text-white shadow-md'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              Email OTP Login
            </button>
          </div>

          {/* METHOD 1: PASSWORD LOGIN */}
          {loginMethod === 'password' && (
            <div>
              {/* Error banner */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-5"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-400 text-xs">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handlePasswordSubmit} noValidate>
                {/* Email */}
                <div className="mb-4">
                  <label htmlFor="login-email" className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border rounded-xl text-white text-sm
                                 placeholder:text-text-muted focus:outline-none focus:border-accent
                                 transition-colors disabled:opacity-50"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="login-password" className="text-xs font-semibold text-text-secondary">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-accent hover:text-accent-hover transition-colors focus:outline-none focus:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-11 py-2.5 bg-bg-elevated border border-border rounded-xl text-white text-sm
                                 placeholder:text-text-muted focus:outline-none focus:border-accent
                                 transition-colors disabled:opacity-50"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors p-1"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="btn-primary w-full justify-center py-2.5 text-sm font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                    </>
                  ) : (
                    <>
                      Sign in with Password <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* METHOD 2: EMAIL OTP LOGIN */}
          {loginMethod === 'otp' && (
            <div>
              {/* Error banner */}
              {otpError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-5"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-400 text-xs">{otpError}</p>
                </motion.div>
              )}

              {/* Success message */}
              {otpSuccess && (
                <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{otpSuccess}</span>
                </div>
              )}

              {otpStep === 1 ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                      Account Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="email"
                        required
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border rounded-xl text-white text-sm focus:outline-none focus:border-accent"
                        disabled={otpLoading}
                      />
                    </div>
                    <p className="text-[11px] text-text-muted mt-1">
                      We'll send a 6-digit one-time code to this address.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="btn-primary w-full justify-center py-2.5 text-sm font-semibold"
                  >
                    {otpLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Sending Code...
                      </>
                    ) : (
                      <>
                        Send Verification Code <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-text-secondary">
                        6-Digit OTP Code
                      </label>
                      {resendTimer > 0 ? (
                        <span className="text-[11px] text-text-muted">Resend in {resendTimer}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={otpLoading}
                          className="text-[11px] text-accent hover:text-accent-hover font-semibold transition-colors"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="123456"
                      className="w-full px-4 py-2.5 bg-bg-elevated border border-border rounded-xl text-white text-center font-mono text-xl tracking-widest focus:outline-none focus:border-accent font-bold"
                      disabled={otpLoading}
                    />
                    <p className="text-[11px] text-text-muted mt-1 text-center">
                      Sent to <span className="text-white font-medium">{otpEmail}</span>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="btn-primary w-full justify-center py-2.5 text-sm font-semibold"
                  >
                    {otpLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                      </>
                    ) : (
                      'Verify & Sign In'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setOtpStep(1); setOtpCode(''); }}
                    className="w-full text-xs text-text-muted hover:text-white py-1 transition-colors text-center block"
                  >
                    ← Change Email Address
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Footer link */}
          <p className="text-center text-text-secondary text-sm mt-6">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-accent hover:text-accent-hover font-medium transition-colors focus:outline-none focus:underline"
            >
              Create one free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
