import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  KeyRound, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle,
  Loader2, ArrowLeft, RefreshCw, Sparkles, ShieldCheck
} from 'lucide-react';
import { sendForgotPasswordOtpApi, resetPasswordOtpApi } from '../api/auth.api.js';
import SEO from '../components/SEO.jsx';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Step 1 = Enter Email, Step 2 = Enter OTP + New Password, Step 3 = Success
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Resend Countdown
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendForgotPasswordOtpApi(email.trim().toLowerCase());
      setSuccessMsg(res.message || 'OTP code sent to your email.');
      setStep(2);
      setResendTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter a valid 6-digit OTP verification code.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordOtpApi({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
      });
      setSuccessMsg(res.message || 'Password reset successfully!');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-bg-primary px-4">
      <SEO title="Forgot Password - CodeRank" description="Reset your password" noindex={true} />
      <div className="w-full max-w-md">
        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-bg-card border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header Icon */}
          <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-5 text-accent">
            {step === 3 ? <ShieldCheck className="w-6 h-6 text-emerald-400" /> : <KeyRound className="w-6 h-6" />}
          </div>

          <h1 className="text-2xl font-extrabold text-white mb-1">
            {step === 1 && 'Forgot Password'}
            {step === 2 && 'Verify & Reset Password'}
            {step === 3 && 'Password Reset Complete!'}
          </h1>
          <p className="text-text-muted text-xs mb-6">
            {step === 1 && 'Enter your account email to receive a 6-digit verification code.'}
            {step === 2 && `Enter the 6-digit code sent to ${email} along with your new password.`}
            {step === 3 && 'Your password has been securely updated. You can now log in.'}
          </p>

          {/* Alerts */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && step !== 3 && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-bg-elevated border border-border rounded-xl text-white text-sm focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 justify-center text-sm font-semibold mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending Code...
                  </>
                ) : (
                  'Send Reset Code'
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Enter OTP + New Password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-text-secondary">
                    6-Digit Verification Code
                  </label>
                  {resendTimer > 0 ? (
                    <span className="text-[11px] text-text-muted">Resend in {resendTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
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
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  className="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-white text-center font-mono text-xl tracking-widest focus:outline-none focus:border-accent font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-10 py-3 bg-bg-elevated border border-border rounded-xl text-white text-sm focus:outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-4 py-3 bg-bg-elevated border border-border rounded-xl text-white text-sm focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 justify-center text-sm font-semibold mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Resetting Password...
                  </>
                ) : (
                  'Set New Password'
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-xs text-text-muted hover:text-white py-1 transition-colors text-center block"
              >
                ← Change Email Address
              </button>
            </form>
          )}

          {/* STEP 3: Success */}
          {step === 3 && (
            <div className="space-y-4 pt-2 text-center">
              <Link
                to="/login"
                className="btn-primary w-full py-3 justify-center text-sm font-semibold"
              >
                Sign In with New Password
              </Link>
            </div>
          )}

          {/* Back to login link */}
          {step !== 3 && (
            <div className="mt-6 pt-5 border-t border-border text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
