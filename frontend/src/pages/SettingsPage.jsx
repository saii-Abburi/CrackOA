import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { updateProfileApi, updatePasswordApi } from '../api/auth.api.js';
import {
  User, Lock, Shield, CheckCircle2, AlertCircle, Loader2,
  Eye, EyeOff, KeyRound, Mail, Calendar, Sparkles
} from 'lucide-react';
import SEO from '../components/SEO.jsx';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security'

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [securityError, setSecurityError] = useState('');

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    if (!name.trim()) {
      setProfileError('Name cannot be empty.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setProfileError('Please enter a valid email address.');
      return;
    }

    setProfileLoading(true);
    try {
      const updatedUser = await updateProfileApi({ name: name.trim(), email: email.trim().toLowerCase() });
      updateUser(updatedUser);
      setProfileSuccess('Profile details updated successfully!');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      setProfileError(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Password Update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSecuritySuccess('');
    setSecurityError('');

    if (!currentPassword) {
      setSecurityError('Current password is required.');
      return;
    }
    if (newPassword.length < 6) {
      setSecurityError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityError('New passwords do not match.');
      return;
    }

    setSecurityLoading(true);
    try {
      const res = await updatePasswordApi({ currentPassword, newPassword });
      setSecuritySuccess(res.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSecuritySuccess(''), 4000);
    } catch (err) {
      setSecurityError(err.response?.data?.message || err.message || 'Failed to change password.');
    } finally {
      setSecurityLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <SEO title="Settings - CodeRank" description="Manage your account settings" noindex={true} />
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="section-badge">User Preferences</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Account Settings</h1>
        <p className="text-text-secondary text-sm mt-1">
          Manage your personal details, email address, and account security.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border mb-8 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2.5 px-5 py-3 text-sm font-semibold border-b-2 transition-all shrink-0 ${
            activeTab === 'profile'
              ? 'border-accent text-white bg-accent/5'
              : 'border-transparent text-text-secondary hover:text-white hover:bg-white/5'
          }`}
        >
          <User className="w-4 h-4" />
          Profile Details
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2.5 px-5 py-3 text-sm font-semibold border-b-2 transition-all shrink-0 ${
            activeTab === 'security'
              ? 'border-accent text-white bg-accent/5'
              : 'border-transparent text-text-secondary hover:text-white hover:bg-white/5'
          }`}
        >
          <Lock className="w-4 h-4" />
          Password & Security
        </button>
      </div>

      {/* TAB 1: PROFILE DETAILS */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-bg-card border border-border rounded-2xl p-6 sm:p-8">
            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <User className="w-5 h-5 text-accent" />
              General Information
            </h2>
            <p className="text-text-muted text-xs mb-6">
              Update your username and contact email associated with your CodeRank account.
            </p>

            {/* Success Alert */}
            {profileSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {/* Error Alert */}
            {profileError && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-5 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Full Name / Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border rounded-xl text-white text-sm focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

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
                    placeholder="e.g. john@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border rounded-xl text-white text-sm focus:outline-none focus:border-accent"
                  />
                </div>
                <p className="text-[11px] text-text-muted mt-1">
                  Used for password resets, login OTPs, and progress tracking.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="btn-primary text-sm py-2.5 px-6"
                >
                  {profileLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    'Save Profile Changes'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Account Overview Metadata Card */}
          <div className="bg-bg-card border border-border rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent" />
              Account Metadata
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-bg-elevated rounded-xl border border-border">
                <p className="text-text-muted font-medium mb-1">Account Role</p>
                <p className="text-white font-bold capitalize flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent"></span>
                  {user?.role || 'User'}
                </p>
              </div>
              <div className="p-4 bg-bg-elevated rounded-xl border border-border">
                <p className="text-text-muted font-medium mb-1">Account ID</p>
                <p className="text-text-secondary font-mono text-[11px] truncate">
                  {user?._id || user?.id || '—'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: PASSWORD & SECURITY */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-bg-card border border-border rounded-2xl p-6 sm:p-8">
            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-accent" />
              Change Account Password
            </h2>
            <p className="text-text-muted text-xs mb-6">
              Ensure your account is using a long, random password to stay secure.
            </p>

            {/* Success Alert */}
            {securitySuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{securitySuccess}</span>
              </div>
            )}

            {/* Error Alert */}
            {securityError && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{securityError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-bg-elevated border border-border rounded-xl text-white text-sm focus:outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 bg-bg-elevated border border-border rounded-xl text-white text-sm focus:outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border rounded-xl text-white text-sm focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={securityLoading}
                  className="btn-primary text-sm py-2.5 px-6"
                >
                  {securityLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Updating Password...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
}
