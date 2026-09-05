import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquarePlus, X, Send, Loader2, CheckCircle2,
  AlertTriangle, Star, Bug, Lightbulb, FileText, MessageCircle,
} from 'lucide-react';
import { submitFeedbackApi } from '../api/feedback.api.js';
import { useAuth } from '../context/AuthContext.jsx';

// ── Types config ────────────────────────────────────────────────
const FEEDBACK_TYPES = [
  { id: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-400 bg-red-400/10 border-red-400/30' },
  { id: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
  { id: 'content', label: 'Content Issue', icon: FileText, color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  { id: 'general', label: 'General', icon: MessageCircle, color: 'text-accent bg-accent/10 border-accent/30' },
];

const SUBJECTS = {
  bug: ['Page crash / error', 'Problem not loading', 'Wrong answer on submission', 'UI layout broken', 'Other bug'],
  feature: ['New problem type', 'Better filtering', 'Dark mode', 'Performance improvement', 'Other feature'],
  content: ['Wrong problem description', 'Incorrect solution', 'Missing test case', 'Broken link', 'Other content issue'],
  general: ['Praise / compliment', 'Question', 'Partnership', 'Other'],
};

export default function FeedbackWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Form state
  const [type, setType] = useState('general');
  const [subject, setSubject] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);

  // UI state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const subjectOptions = SUBJECTS[type] || [];
  const effectiveSubject = subject === 'Other' || subject === 'Other bug' || subject === 'Other feature' || subject === 'Other content issue' || subject === 'Other feature' ? customSubject : subject;

  const isOtherSelected = subject.toLowerCase().startsWith('other');

  const resetForm = () => {
    setType('general');
    setSubject('');
    setCustomSubject('');
    setMessage('');
    setRating(0);
    setHoveredStar(0);
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(resetForm, 300);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setSubject('');
    setCustomSubject('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const finalSubject = isOtherSelected ? customSubject.trim() : subject;
    if (!finalSubject) { setError('Please select or enter a subject.'); return; }
    if (!message.trim() || message.trim().length < 10) {
      setError('Please write at least 10 characters in your message.');
      return;
    }

    setLoading(true);
    try {
      await submitFeedbackApi({
        type,
        subject: finalSubject,
        message: message.trim(),
        rating: rating > 0 ? rating : null,
        page: window.location.pathname,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Don't show if not logged in (could be changed to optional)
  if (!user) return null;

  return (
    <>
      {/* Floating Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            id="feedback-widget-trigger"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={handleOpen}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 pl-3 pr-4 py-3 rounded-2xl shadow-2xl text-sm font-bold text-white group transition-all hover:shadow-accent/30"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
            }}
            title="Send Feedback"
          >
            <MessageSquarePlus className="w-4 h-4 shrink-0 group-hover:rotate-12 transition-transform" />
            <span>Feedback</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="feedback-modal"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-[min(460px,calc(100vw-2rem))] max-h-[90vh] overflow-y-auto rounded-2xl border border-border shadow-2xl"
            style={{ background: 'var(--color-bg-card, #141418)' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b border-border rounded-t-2xl"
              style={{ background: 'linear-gradient(135deg, #6366f1/10 0%, transparent 100%)' }}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-accent/15">
                  <MessageSquarePlus className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white leading-tight">Share Feedback</h2>
                  <p className="text-[10px] text-text-muted">Help us make CodeRank better</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 text-text-muted hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Success State */}
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-6 py-10 flex flex-col items-center text-center gap-4"
              >
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Thank you! 🎉</h3>
                  <p className="text-text-secondary text-sm">
                    Your feedback has been submitted. We review every submission and use it to improve CodeRank.
                  </p>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => { resetForm(); }}
                    className="px-4 py-2 rounded-xl bg-bg-elevated border border-border text-sm font-semibold text-text-secondary hover:text-white transition-all"
                  >
                    Submit Another
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 rounded-xl btn-primary text-sm"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-5">
                {/* Type Selector */}
                <div>
                  <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-2">
                    Feedback Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {FEEDBACK_TYPES.map(({ id, label, icon: Icon, color }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleTypeChange(id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          type === id
                            ? color
                            : 'bg-bg-elevated border-border text-text-muted hover:text-white hover:border-border'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-2">
                    Subject
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 mb-2">
                    {subjectOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSubject(opt)}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all text-left ${
                          subject === opt
                            ? 'bg-accent/15 border-accent/50 text-white'
                            : 'bg-bg-elevated border-border text-text-muted hover:text-white hover:border-border'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {isOtherSelected && (
                    <input
                      type="text"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="Describe the subject..."
                      maxLength={150}
                      className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-white text-sm focus:outline-none focus:border-accent placeholder:text-text-muted"
                    />
                  )}
                </div>

                {/* Message */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wide">
                      Message
                    </label>
                    <span className="text-[10px] text-text-muted">{message.length}/2000</span>
                  </div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      type === 'bug'
                        ? 'Describe what happened, what you expected, and steps to reproduce...'
                        : type === 'feature'
                        ? 'Describe the feature you\'d like and how it would help you...'
                        : 'Tell us more...'
                    }
                    rows={4}
                    maxLength={2000}
                    required
                    className="w-full px-3 py-2.5 bg-bg-elevated border border-border rounded-xl text-white text-sm focus:outline-none focus:border-accent placeholder:text-text-muted resize-none leading-relaxed"
                  />
                </div>

                {/* Star Rating */}
                <div>
                  <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-2">
                    Overall Experience <span className="text-text-muted font-normal normal-case">(optional)</span>
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star === rating ? 0 : star)}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            star <= (hoveredStar || rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-text-muted'
                          }`}
                        />
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="text-xs text-text-muted ml-1">
                        {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    ) : (
                      <><Send className="w-4 h-4" /> Submit Feedback</>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2.5 rounded-xl bg-bg-elevated border border-border text-sm font-semibold text-text-secondary hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                </div>

                <p className="text-[10px] text-text-muted text-center">
                  Submitted as <span className="text-text-secondary font-medium">{user?.name}</span> · We read every submission
                </p>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
