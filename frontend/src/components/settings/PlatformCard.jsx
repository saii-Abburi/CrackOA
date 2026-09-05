import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink, RefreshCw, Trash2, Plus, Loader2,
  CheckCircle2, AlertTriangle, Clock, Edit3, X, Check,
} from 'lucide-react';
import {
  addPlatformAccountApi,
  updatePlatformAccountApi,
  removePlatformAccountApi,
  syncPlatformAccountApi,
} from '../../api/platform.api.js';

// ─────────────────────────────────────────────────────────────────
// Platform metadata (logos, colors, display names)
// ─────────────────────────────────────────────────────────────────

const PLATFORM_META = {
  leetcode: {
    label: 'LeetCode',
    color: '#FFA116',
    bgClass: 'bg-[#FFA116]/10 border-[#FFA116]/30',
    badgeClass: 'bg-[#FFA116]/20 text-[#FFA116]',
    logo: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" style={{ color: '#FFA116' }}>
        <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.7a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
      </svg>
    ),
  },
  codeforces: {
    label: 'Codeforces',
    color: '#1F8ACB',
    bgClass: 'bg-blue-500/10 border-blue-500/30',
    badgeClass: 'bg-blue-500/20 text-blue-400',
    logo: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" style={{ color: '#1F8ACB' }}>
        <path d="M4.5 7.5C5.328 7.5 6 8.172 6 9v10.5c0 .828-.672 1.5-1.5 1.5h-3C.673 21 0 20.328 0 19.5V9c0-.828.673-1.5 1.5-1.5h3zm9-4.5c.828 0 1.5.672 1.5 1.5v15c0 .828-.672 1.5-1.5 1.5h-3c-.827 0-1.5-.672-1.5-1.5v-15c0-.828.673-1.5 1.5-1.5h3zm9 7.5c.828 0 1.5.672 1.5 1.5v7.5c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V12c0-.828.672-1.5 1.5-1.5h3z" />
      </svg>
    ),
  },
  geeksforgeeks: {
    label: 'GeeksforGeeks',
    color: '#2F8D46',
    bgClass: 'bg-green-600/10 border-green-600/30',
    badgeClass: 'bg-green-600/20 text-green-400',
    logo: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" style={{ color: '#2F8D46' }}>
        <path d="M21.45 14.315c-.143.28-.334.532-.565.745a3.691 3.691 0 0 1-1.104.695 4.51 4.51 0 0 1-3.116.015 4.682 4.682 0 0 1-1.461-.96l-.004-.005a.06.06 0 0 0-.004-.005l-.008-.008a.06.06 0 0 1-.008-.008 4.836 4.836 0 0 1-.097-.088h-.005c.005.005.007.007 0 0a5.854 5.854 0 0 1-1.152-1.845.638.638 0 0 0-.08-.208h3.762v1.166c0 .137.111.249.249.249h.498a.249.249 0 0 0 .249-.249V12.1h-4.51v-.5h4.76v-.499H17.1c.028-.048.053-.096.076-.145a5.67 5.67 0 0 1 .836-1.335c.305-.36.65-.675 1.034-.936a3.886 3.886 0 0 1 1.348-.57 4.523 4.523 0 0 1 3.007.346c.394.195.751.454 1.056.766l-1.005 1.003a2.327 2.327 0 0 0-.614-.455 2.695 2.695 0 0 0-1.805-.206c-.258.05-.506.146-.731.283a2.596 2.596 0 0 0-.894.878 3.372 3.372 0 0 0-.426 1.079H24v.498h-3.954c.005.065.009.13.009.196 0 .065-.004.13-.009.195H24v.5h-3.928a3.49 3.49 0 0 0 .476 1.072c.142.202.305.387.487.549.357.32.781.552 1.236.68a2.695 2.695 0 0 0 1.805-.206c.228-.114.435-.267.614-.455l1.005 1.003a3.886 3.886 0 0 1-1.056.766 4.495 4.495 0 0 1-.248.116zM0 11.1h3.915c.139-.482.354-.94.64-1.354a4.836 4.836 0 0 1 1.152-1.196 4.682 4.682 0 0 1 1.46-.96 4.51 4.51 0 0 1 3.117.015c.408.158.784.38 1.104.695.23.213.422.465.565.745a3.886 3.886 0 0 1 .056.116l1.005-1.003a3.886 3.886 0 0 0-1.056-.766 4.523 4.523 0 0 0-3.007-.346 3.886 3.886 0 0 0-1.348.57 5.67 5.67 0 0 0-1.034.936 5.854 5.854 0 0 0-.836 1.335c-.023.049-.048.097-.076.145H3.5v.499h3.076v.5H3.5v.499h3.028a3.372 3.372 0 0 0 .426 1.079c.232.352.53.654.894.878.225.137.473.233.731.283a2.695 2.695 0 0 0 1.805-.206 2.327 2.327 0 0 0 .614-.455l1.005 1.003a3.886 3.886 0 0 1-1.056.766 4.523 4.523 0 0 1-3.007.346 3.886 3.886 0 0 1-1.348-.57 4.836 4.836 0 0 1-.097-.088.06.06 0 0 0-.008-.008l-.008-.008a.06.06 0 0 0-.004-.005l-.004-.005a4.682 4.682 0 0 1-1.461-.96 4.51 4.51 0 0 1-3.116.015 3.691 3.691 0 0 1-1.104-.695 3.072 3.072 0 0 1-.565-.745A3.886 3.886 0 0 1 0 14.315v-.003A3.886 3.886 0 0 1 0 11.1z" />
      </svg>
    ),
  },
};

// ─────────────────────────────────────────────────────────────────
// Stats display helpers
// ─────────────────────────────────────────────────────────────────

function CodeforcesStats({ stats }) {
  if (!stats || !stats.rating) return null;
  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      <StatCell label="Rating" value={stats.rating} />
      <StatCell label="Max Rating" value={stats.maxRating} />
      <StatCell label="Rank" value={capitalize(stats.rank)} />
      <StatCell label="Max Rank" value={capitalize(stats.maxRank)} />
    </div>
  );
}

function LeetCodeStats({ stats }) {
  if (!stats || stats.totalSolved === undefined) return null;
  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      <StatCell label="Total Solved" value={stats.totalSolved} />
      <StatCell label="Ranking" value={stats.ranking ? `#${stats.ranking.toLocaleString()}` : '—'} />
      <StatCell label="Easy" value={stats.easySolved} color="text-emerald-400" />
      <StatCell label="Medium" value={stats.mediumSolved} color="text-yellow-400" />
      <StatCell label="Hard" value={stats.hardSolved} color="text-red-400" />
    </div>
  );
}

function StatCell({ label, value, color = 'text-white' }) {
  return (
    <div className="bg-bg-elevated rounded-xl px-4 py-3 border border-border">
      <p className="text-[10px] text-text-muted font-medium uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-sm font-bold ${color}`}>{value ?? '—'}</p>
    </div>
  );
}

function capitalize(str) {
  if (!str) return '—';
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

function timeAgo(date) {
  if (!date) return null;
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

// ─────────────────────────────────────────────────────────────────
// PlatformCard
// ─────────────────────────────────────────────────────────────────

export default function PlatformCard({ platform, account, onAccountChange }) {
  const meta = PLATFORM_META[platform];
  const isConnected = !!account;

  const [mode, setMode] = useState('view'); // 'view' | 'connect' | 'edit'
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  const clearError = () => setError('');

  const handleConnect = async () => {
    if (!inputValue.trim()) return;
    clearError();
    setLoading(true);
    try {
      const newAccount = await addPlatformAccountApi({ platform, username: inputValue.trim() });
      onAccountChange(platform, newAccount);
      setMode('view');
      setInputValue('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to connect account.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!inputValue.trim()) return;
    clearError();
    setLoading(true);
    try {
      const updated = await updatePlatformAccountApi(platform, inputValue.trim());
      onAccountChange(platform, updated);
      setMode('view');
      setInputValue('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update account.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    clearError();
    setLoading(true);
    try {
      await removePlatformAccountApi(platform);
      onAccountChange(platform, null);
      setConfirmDisconnect(false);
      setMode('view');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to disconnect.');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    clearError();
    setSyncing(true);
    try {
      const updated = await syncPlatformAccountApi(platform);
      onAccountChange(platform, updated);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Sync failed.');
    } finally {
      setSyncing(false);
    }
  };

  const openConnect = () => {
    setInputValue('');
    clearError();
    setMode('connect');
  };

  const openEdit = () => {
    setInputValue(account?.username || '');
    clearError();
    setMode('edit');
  };

  const cancelMode = () => {
    setMode('view');
    setInputValue('');
    clearError();
    setConfirmDisconnect(false);
  };

  // ── Status badge
  const StatusBadge = () => {
    if (!account) return null;
    const { syncStatus } = account;
    if (syncStatus === 'synced') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/25 rounded-full px-2 py-0.5">
          <CheckCircle2 className="w-2.5 h-2.5" /> Synced
        </span>
      );
    }
    if (syncStatus === 'sync_failed') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-yellow-400 bg-yellow-400/10 border border-yellow-400/25 rounded-full px-2 py-0.5">
          <AlertTriangle className="w-2.5 h-2.5" /> Sync failed
        </span>
      );
    }
    if (syncStatus === 'unavailable') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-text-muted bg-bg-elevated border border-border rounded-full px-2 py-0.5">
          Stats unavailable
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-400 bg-blue-400/10 border border-blue-400/25 rounded-full px-2 py-0.5">
        <Clock className="w-2.5 h-2.5" /> Pending
      </span>
    );
  };

  // ── Stats panel
  const StatsPanel = () => {
    if (!account) return null;
    const { syncStatus, stats } = account;

    if (syncStatus === 'synced' && stats && Object.keys(stats).length > 0) {
      return (
        <>
          {platform === 'codeforces' && <CodeforcesStats stats={stats} />}
          {platform === 'leetcode' && <LeetCodeStats stats={stats} />}
        </>
      );
    }

    if (syncStatus === 'unavailable') {
      return (
        <div className="mt-4 p-3 rounded-xl bg-bg-elevated border border-border text-xs text-text-muted flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
          <span>Stats are not available for GeeksforGeeks — no public API exists. Visit your profile to view your progress.</span>
        </div>
      );
    }

    if (syncStatus === 'sync_failed') {
      return (
        <div className="mt-4 p-3 rounded-xl bg-yellow-400/5 border border-yellow-400/20 text-xs text-yellow-300 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            Stats could not be fetched.{' '}
            {account.errorMessage && <span className="text-text-muted">{account.errorMessage}</span>}
            {' '}Your profile link still works.
          </span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`rounded-2xl border p-5 transition-all ${meta.bgClass}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-bg-elevated rounded-xl border border-border shrink-0">
            {meta.logo}
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">{meta.label}</p>
            {isConnected ? (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-text-secondary font-mono">@{account.username}</span>
                <StatusBadge />
              </div>
            ) : (
              <p className="text-xs text-text-muted mt-0.5">Not connected</p>
            )}
          </div>
        </div>

        {/* Action buttons (connected state) */}
        {isConnected && mode === 'view' && (
          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={account.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={`View on ${meta.label}`}
              className="p-1.5 text-text-muted hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={handleSync}
              disabled={syncing}
              title="Refresh stats"
              className="p-1.5 text-text-muted hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={openEdit}
              title="Edit username"
              className="p-1.5 text-text-muted hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setConfirmDisconnect(true)}
              title="Disconnect"
              className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      {mode === 'view' && <StatsPanel />}

      {/* Last synced timestamp */}
      {mode === 'view' && account && account.syncStatus === 'synced' && account.lastSyncedAt && (
        <p className="text-[10px] text-text-muted mt-3 flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          Last synced {timeAgo(account.lastSyncedAt)}
        </p>
      )}

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2"
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm disconnect */}
      <AnimatePresence>
        {confirmDisconnect && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-300">
              <p className="font-semibold mb-2">Disconnect @{account?.username} from {meta.label}?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 font-semibold hover:bg-red-500/30 transition-all text-xs flex items-center gap-1.5"
                >
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  Yes, disconnect
                </button>
                <button
                  onClick={() => setConfirmDisconnect(false)}
                  className="px-3 py-1.5 rounded-lg bg-bg-elevated border border-border text-text-secondary font-semibold hover:text-white transition-all text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connect / Edit form */}
      <AnimatePresence>
        {(mode === 'connect' || mode === 'edit') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">
                  {meta.label} Username / Handle
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') mode === 'connect' ? handleConnect() : handleUpdate();
                      if (e.key === 'Escape') cancelMode();
                    }}
                    placeholder={`Your ${meta.label} handle`}
                    autoFocus
                    className="flex-1 px-3 py-2 bg-bg-elevated border border-border rounded-xl text-white text-sm focus:outline-none focus:border-accent placeholder:text-text-muted"
                  />
                  <button
                    onClick={mode === 'connect' ? handleConnect : handleUpdate}
                    disabled={loading || !inputValue.trim()}
                    className="px-3 py-2 rounded-xl text-white font-semibold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40"
                    style={{ background: meta.color }}
                  >
                    {loading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    {mode === 'connect' ? 'Connect' : 'Update'}
                  </button>
                  <button
                    onClick={cancelMode}
                    className="px-3 py-2 rounded-xl bg-bg-elevated border border-border text-text-secondary hover:text-white text-xs transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {platform === 'geeksforgeeks' && (
                <p className="text-[10px] text-text-muted">
                  ℹ️ GFG stats are not available (no public API). Your profile link will still be shown.
                </p>
              )}
              {platform === 'leetcode' && (
                <p className="text-[10px] text-text-muted">
                  ℹ️ LeetCode stats are fetched on a best-effort basis and may occasionally be unavailable.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connect button (not connected, view mode) */}
      {!isConnected && mode === 'view' && (
        <button
          onClick={openConnect}
          className="mt-4 w-full py-2 rounded-xl border border-dashed text-sm font-semibold transition-all flex items-center justify-center gap-2 text-text-secondary hover:text-white"
          style={{ borderColor: `${meta.color}50` }}
        >
          <Plus className="w-4 h-4" style={{ color: meta.color }} />
          Connect {meta.label}
        </button>
      )}
    </div>
  );
}
