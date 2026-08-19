import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchDashboard } from '../api/progress.api.js';
import {
  CheckCircle2, Clock, ChevronRight, ChevronLeft, Loader2,
  Flame, LogOut, User,
} from 'lucide-react';
import SEO from '../components/SEO.jsx';

/**
 * Generates a calendar grid for any target month/year.
 */
function buildMonthCalendar(targetDate = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const today = new Date();
  const todayStr = toDateStr(today);

  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startOffset = firstDay.getDay();
  const days = [];

  for (let i = 0; i < startOffset; i++) {
    const d = new Date(year, month, 1 - startOffset + i);
    const dStr = toDateStr(d);
    days.push({
      date: dStr,
      day: d.getDate(),
      isToday: dStr === todayStr,
      isCurrentMonth: false,
    });
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = toDateStr(dateObj);
    days.push({
      date: dateStr,
      day: d,
      isToday: dateStr === todayStr,
      isCurrentMonth: true,
    });
  }

  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const dStr = toDateStr(d);
      days.push({
        date: dStr,
        day: d.getDate(),
        isToday: dStr === todayStr,
        isCurrentMonth: false,
      });
    }
  }

  return days;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(() => new Date());

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleCurrentMonth = () => {
    setViewDate(new Date());
  };

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const data = await fetchDashboard();
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'Developer';

  const calendarDays = useMemo(() => buildMonthCalendar(viewDate), [viewDate]);
  const activeDaysSet = useMemo(
    () => new Set(stats?.activeDaysList || []),
    [stats?.activeDaysList]
  );

  const monthName = viewDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const isCurrentMonthView =
    viewDate.getFullYear() === new Date().getFullYear() &&
    viewDate.getMonth() === new Date().getMonth();

  return (
    <div className="p-6 lg:p-8">
      <SEO 
        title="Dashboard - CodeRank" 
        description="Your personal dashboard" 
        noindex={true} 
      />
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <p className="text-text-muted text-sm mb-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-text-secondary text-sm mt-1">Here's your preparation progress.</p>
      </motion.div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin mb-3" />
          <p className="text-text-muted text-sm">Loading your dashboard...</p>
        </div>
      ) : stats ? (
        <>
          {/* Top row: Stats cards + Calendar */}
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            {/* Left: Stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="flex-1"
            >
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Solved', value: stats.solvedProblems, sub: `out of ${stats.totalProblems}`, color: 'text-emerald-400', border: 'border-emerald-400/20' },
                  { label: 'Attempted', value: stats.attemptedProblems, sub: 'in progress', color: 'text-amber-400', border: 'border-amber-400/20' },
                  { label: 'Easy Done', value: stats.easySolved, sub: 'problems', color: 'text-sky-400', border: 'border-sky-400/20' },
                  { label: 'Hard Done', value: stats.hardSolved, sub: 'problems', color: 'text-red-400', border: 'border-red-400/20' },
                ].map((s) => (
                  <div key={s.label} className={`bg-bg-card border ${s.border} rounded-2xl p-5`}>
                    <p className={`text-3xl font-black ${s.color} mb-1 tabular-nums`}>{s.value}</p>
                    <p className="text-white text-sm font-semibold">{s.label}</p>
                    <p className="text-text-muted text-xs mt-0.5">{s.sub}</p>
                  </div>
                ))}

              </div>
              {/* Overall progress bar */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-bg-card border border-border rounded-2xl p-6 mb-6 mt-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white font-semibold">Overall Progress</p>
                    <p className="text-text-muted text-xs mt-0.5">
                      {stats.solvedProblems} of {stats.totalProblems} problems solved
                    </p>
                  </div>
                  <span className="text-2xl font-black text-accent">{stats.completionPercentage}%</span>
                </div>
                <div className="w-full bg-bg-elevated rounded-full h-2" role="progressbar" aria-valuenow={stats.completionPercentage} aria-valuemin={0} aria-valuemax={100}>
                  <motion.div
                    className="h-2 rounded-full bg-gradient-to-r from-accent to-amber-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.completionPercentage}%` }}
                    transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* Right: Streak Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.07 }}
              className="lg:w-[320px] shrink-0"
            >
              <div className="bg-bg-card border border-border rounded-2xl p-5 h-full">
                <div className="flex items-center justify-between mb-4 gap-2">
                  <div className="flex items-center gap-2 shrink-0">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <h3 className="text-white text-sm font-semibold">Activity</h3>
                  </div>
                  <div className="flex items-center gap-1 bg-bg-elevated px-2 py-1 rounded-xl border border-border">
                    <button
                      onClick={handlePrevMonth}
                      className="p-1 text-text-muted hover:text-white rounded hover:bg-white/5 transition-colors"
                      title="Previous month"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-white text-xs font-semibold px-1 min-w-[70px] text-center">
                      {monthName}
                    </span>
                    {!isCurrentMonthView && ( <button
                      onClick={handleNextMonth}
                      className="p-1 text-text-muted hover:text-white rounded hover:bg-white/5 transition-colors"
                      title="Next month"
                      aria-label="Next month"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>)}
                    {!isCurrentMonthView && (
                      <button
                        onClick={handleCurrentMonth}
                        className="ml-1 text-[10px] bg-accent/20 hover:bg-accent text-accent hover:text-white font-bold px-1.5 py-0.5 rounded transition-colors"
                        title="Jump to current month"
                      >
                        Today
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4 pb-3 border-b border-border">
                  <div className="text-center flex-1">
                    <p className="text-xl font-black text-orange-400 tabular-nums">{stats.currentStreak}</p>
                    <p className="text-text-muted text-[10px] font-medium">Current</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center flex-1">
                    <p className="text-xl font-black text-amber-400 tabular-nums">{stats.longestStreak}</p>
                    <p className="text-text-muted text-[10px] font-medium">Best</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center flex-1">
                    <p className="text-xl font-black text-sky-400 tabular-nums">{stats.totalActiveDays}</p>
                    <p className="text-text-muted text-[10px] font-medium">Active</p>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} className="text-center text-[10px] text-text-muted font-semibold py-1">
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, i) => {
                    const pad = (n) => String(n).padStart(2, '0');
                    const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

                    const todayStr = toDateStr(new Date());
                    const accountCreatedDateStr = stats?.accountCreatedAt
                      ? toDateStr(new Date(stats.accountCreatedAt))
                      : (user?.createdAt ? toDateStr(new Date(user.createdAt)) : null);

                    const isActive = activeDaysSet.has(day.date);
                    const isToday = day.isToday;
                    const isPast = day.date < todayStr;
                    const isAfterCreation = accountCreatedDateStr ? day.date >= accountCreatedDateStr : true;
                    const isMissed = isPast && isAfterCreation && day.isCurrentMonth && !isActive;

                    return (
                      <div
                        key={i}
                        className={`
                          relative flex items-center justify-center rounded-lg aspect-square text-xs font-medium transition-all
                          ${!day.isCurrentMonth ? 'opacity-20' : ''}
                          ${day.isToday ? 'ring-2 ring-accent/50 ring-offset-1 ring-offset-bg-card' : ''}
                          ${isActive
                            ? 'bg-emerald-500/20 border border-emerald-500/30'
                            : isMissed
                              ? 'bg-red-500/10 border border-red-500/20'
                              : day.isCurrentMonth && isPast
                                ? 'bg-bg-elevated/40 border border-transparent'
                                : 'bg-transparent border border-transparent'
                          }
                        `}
                        title={`${day.date}${
                          isActive
                            ? ' — Solved!'
                            : isToday
                              ? ' — Today'
                              : isMissed
                                ? ' — Missed day since joining'
                                : ''
                        }`}
                      >
                        {isActive ? (
                          <span className="text-sm leading-none">🔥</span>
                        ) : isToday ? (
                          <span className="text-sm leading-none">😢</span>
                        ) : isMissed ? (
                          <span className="text-sm leading-none">😢</span>
                        ) : (
                          <span className={`text-[11px] ${day.isCurrentMonth ? 'text-text-muted' : 'text-text-dim'}`}>
                            {day.day}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">🔥</span>
                    <span className="text-text-muted text-[10px]">Solved</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">😢</span>
                    <span className="text-text-muted text-[10px]">Missed (since joining)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>



          {/* Company progress */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Company Progress</h2>
              <Link to="/companies" className="text-accent text-sm font-medium flex items-center gap-1 hover:text-accent-hover transition-colors">
                View all <ChevronRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {(stats.companyProgress || [])
                .sort((a, b) => b.total - a.total)
                .slice(0, 6)
                .map((c) => (
                  <Link
                    key={c.slug}
                    to={`/companies/${c.slug}/problems`}
                    className="bg-bg-card border border-border rounded-2xl p-5 hover:border-border-subtle transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-bg-elevated border border-border flex items-center justify-center group-hover:border-accent/30 transition-colors">
                          <span className="text-xs font-bold text-white">
                            {c.company.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{c.company}</p>
                          <p className="text-text-muted text-xs">{c.total} problems</p>
                        </div>
                      </div>
                      <span className="text-accent font-bold text-sm">{c.percentage}%</span>
                    </div>
                    <div className="flex justify-between text-xs text-text-muted mb-2">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" aria-hidden="true" />
                        {c.solved} solved
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-text-dim" aria-hidden="true" />
                        {c.total - c.solved} remaining
                      </span>
                    </div>
                    <div className="w-full bg-bg-elevated rounded-full h-1.5" role="progressbar" aria-valuenow={c.percentage} aria-valuemin={0} aria-valuemax={100}>
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-accent to-amber-400 transition-all duration-500"
                        style={{ width: `${c.percentage}%` }}
                      />
                    </div>
                  </Link>
                ))}
            </div>
          </motion.div>
        </>
      ) : (
        <div className="py-16 text-center">
          <p className="text-text-muted text-sm">Unable to load dashboard data. Please try again.</p>
        </div>
      )}

      {/* Mobile logout button */}
      <div className="md:hidden mt-8 pt-6 border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
            <User className="w-4 h-4 text-accent" aria-hidden="true" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">{user?.name}</p>
            <p className="text-text-muted text-xs">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-red-400 bg-red-500/10 border border-red-500/20
                     hover:bg-red-500/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/30"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          Log out
        </button>
      </div>
    </div>
  );
}
