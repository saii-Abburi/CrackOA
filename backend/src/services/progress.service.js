import mongoose from 'mongoose';
import UserProgress from '../models/UserProgress.js';
import Problem from '../models/Problem.js';
import Company from '../models/Company.js';
import User from '../models/User.js';

/**
 * Upsert (create or update) a progress record for a user+problem.
 * Works for both DSA and SQL problems — accepts ObjectId, leetcodeId, or slug.
 */
export const upsertProgress = async (userId, problemId, { status, notes }) => {
  // Flexible problem lookup
  let problem = null;
  if (mongoose.Types.ObjectId.isValid(problemId)) {
    problem = await Problem.findById(problemId).lean();
  }
  if (!problem && !isNaN(Number(problemId))) {
    problem = await Problem.findOne({ leetcodeId: Number(problemId) }).lean();
  }
  if (!problem && typeof problemId === 'string') {
    problem = await Problem.findOne({ slug: problemId }).lean();
  }

  if (!problem) {
    const error = new Error('Problem not found.');
    error.statusCode = 404;
    error.code = 'PROBLEM_NOT_FOUND';
    throw error;
  }

  const updateData = {};
  if (status !== undefined) {
    updateData.status = status;
    if (status === 'solved') {
      updateData.solvedAt = new Date();
    } else {
      updateData.solvedAt = null;
    }
  }
  if (notes !== undefined) updateData.notes = notes;

  // findOneAndUpdate with upsert so we handle both create & update atomically
  const progress = await UserProgress.findOneAndUpdate(
    { user: userId, problem: problem._id },
    { $set: updateData },
    { new: true, upsert: true, runValidators: true }
  ).populate('problem', 'title difficulty leetcodeId slug domain');

  return progress;
};

/**
 * Get all progress records for a user.
 */
export const getUserProgress = async (userId) => {
  return UserProgress.find({ user: userId })
    .populate('problem', 'title difficulty leetcodeId slug acceptanceRate frequency topics companies domain')
    .sort({ updatedAt: -1 })
    .lean();
};

/**
 * Get progress for a single problem for the authenticated user.
 */
export const getProgressByProblem = async (userId, problemId) => {
  let pId = problemId;
  if (!mongoose.Types.ObjectId.isValid(pId)) {
    const prob = await Problem.findOne({
      $or: [{ slug: pId }, ...(isNaN(Number(pId)) ? [] : [{ leetcodeId: Number(pId) }])]
    }).select('_id').lean();
    if (prob) pId = prob._id;
  }

  const progress = await UserProgress.findOne({ user: userId, problem: pId })
    .populate('problem', 'title difficulty leetcodeId slug domain')
    .lean();

  if (!progress) {
    const error = new Error('Progress record not found.');
    error.statusCode = 404;
    error.code = 'PROGRESS_NOT_FOUND';
    throw error;
  }

  return progress;
};

/**
 * Delete a progress record (idempotent — returns cleanly even if not previously found).
 */
export const deleteProgress = async (userId, problemId) => {
  let pId = problemId;
  if (!mongoose.Types.ObjectId.isValid(pId)) {
    const prob = await Problem.findOne({
      $or: [{ slug: pId }, ...(isNaN(Number(pId)) ? [] : [{ leetcodeId: Number(pId) }])]
    }).select('_id').lean();
    if (prob) pId = prob._id;
  }

  const progress = await UserProgress.findOneAndDelete({ user: userId, problem: pId });
  return progress || { deleted: true };
};

/**
 * Build difficulty breakdown of solved problems for a given domain filter.
 * @param {mongoose.Types.ObjectId} userId
 * @param {string|null} domain - 'dsa' | 'sql' | null (all)
 */
const getSolvedByDifficulty = async (userId, domain = null) => {
  const matchStage = { user: userId, status: 'solved' };

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: 'problems',
        localField: 'problem',
        foreignField: '_id',
        as: 'problemData',
      },
    },
    { $unwind: '$problemData' },
  ];

  // Add domain filter after lookup if specified
  if (domain === 'sql') {
    pipeline.push({ $match: { 'problemData.domain': 'sql' } });
  } else if (domain === 'dsa') {
    pipeline.push({ $match: { 'problemData.domain': { $ne: 'sql' } } });
  }

  pipeline.push({
    $group: {
      _id: '$problemData.difficulty',
      count: { $sum: 1 },
    },
  });

  const results = await UserProgress.aggregate(pipeline);
  const map = { Easy: 0, Medium: 0, Hard: 0 };
  results.forEach(({ _id, count }) => {
    if (_id && map[_id] !== undefined) {
      map[_id] = count;
    }
  });
  return map;
};

/**
 * Get dashboard statistics for the authenticated user.
 * Returns combined (overall), dsa-only, and sql-only breakdowns.
 */
export const getDashboardStats = async (userId) => {
  // ── Problem counts per domain ──────────────────────────────────────────────
  const [totalProblems, totalDsa, totalSql] = await Promise.all([
    Problem.countDocuments(),
    Problem.countDocuments({ domain: { $ne: 'sql' } }),
    Problem.countDocuments({ domain: 'sql' }),
  ]);

  // ── Aggregate progress stats (overall) ────────────────────────────────────
  const progressStats = await UserProgress.aggregate([
    { $match: { user: userId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const statsMap = { not_started: 0, attempted: 0, solved: 0 };
  progressStats.forEach(({ _id, count }) => {
    if (_id && statsMap[_id] !== undefined) {
      statsMap[_id] = count;
    }
  });

  const solvedProblems = statsMap.solved;
  const attemptedProblems = statsMap.attempted;
  const remainingProblems = totalProblems - solvedProblems - attemptedProblems;

  // ── Domain-specific progress counts ───────────────────────────────────────
  const domainProgressStats = await UserProgress.aggregate([
    { $match: { user: userId } },
    {
      $lookup: {
        from: 'problems',
        localField: 'problem',
        foreignField: '_id',
        as: 'problemData',
      },
    },
    { $unwind: '$problemData' },
    {
      $group: {
        _id: {
          domain: {
            $cond: {
              if: { $eq: ['$problemData.domain', 'sql'] },
              then: 'sql',
              else: 'dsa',
            },
          },
          status: '$status',
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const domainMap = {
    dsa: { not_started: 0, attempted: 0, solved: 0 },
    sql: { not_started: 0, attempted: 0, solved: 0 },
  };

  domainProgressStats.forEach(({ _id, count }) => {
    if (_id?.domain && domainMap[_id.domain] && domainMap[_id.domain][_id.status] !== undefined) {
      domainMap[_id.domain][_id.status] = count;
    }
  });

  // ── Difficulty breakdowns ──────────────────────────────────────────────────
  const [overallDiff, dsaDiff, sqlDiff] = await Promise.all([
    getSolvedByDifficulty(userId, null),
    getSolvedByDifficulty(userId, 'dsa'),
    getSolvedByDifficulty(userId, 'sql'),
  ]);

  const completionPercentage =
    totalProblems > 0
      ? parseFloat(((solvedProblems / totalProblems) * 100).toFixed(1))
      : 0;

  const dsaCompletion =
    totalDsa > 0
      ? parseFloat(((domainMap.dsa.solved / totalDsa) * 100).toFixed(1))
      : 0;

  const sqlCompletion =
    totalSql > 0
      ? parseFloat(((domainMap.sql.solved / totalSql) * 100).toFixed(1))
      : 0;

  // ── Streak computation ─────────────────────────────────────────────────────
  const solvedDates = await UserProgress.aggregate([
    { $match: { user: userId, status: 'solved', solvedAt: { $ne: null } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$solvedAt' },
        },
      },
    },
    { $sort: { _id: -1 } }, // newest first
  ]);

  const activeDays = solvedDates.map((d) => d._id);
  const totalActiveDays = activeDays.length;

  let currentStreak = 0;
  let longestStreak = 0;

  if (activeDays.length > 0) {
    const sortedAsc = [...activeDays].sort();

    let streak = 1;
    for (let i = 1; i < sortedAsc.length; i++) {
      const prev = new Date(sortedAsc[i - 1]);
      const curr = new Date(sortedAsc[i]);
      const diffMs = curr.getTime() - prev.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
      } else {
        longestStreak = Math.max(longestStreak, streak);
        streak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, streak);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const latestDay = activeDays[0];

    if (latestDay === todayStr || latestDay === yesterdayStr) {
      currentStreak = 1;
      for (let i = 1; i < activeDays.length; i++) {
        const curr = new Date(activeDays[i - 1]);
        const prev = new Date(activeDays[i]);
        const diffMs = curr.getTime() - prev.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  // ── Company-wise progress (fast, resilient in-memory aggregation) ──────────
  const companies = await Company.find().lean();

  // 1. All problem IDs solved by this user
  const userSolved = await UserProgress.find({ user: userId, status: 'solved' }).select('problem').lean();
  const solvedProblemIdSet = new Set(userSolved.map((p) => String(p.problem)));

  // 2. All company-tagged problems (anything not SQL)
  const allCompanyProblems = await Problem.find({
    companies: { $exists: true, $ne: [] },
    domain: { $ne: 'sql' },
  }).select('_id companies').lean();

  // 3. Aggregate totals and solved counts per company
  const companyStatsMap = new Map();
  for (const c of companies) {
    companyStatsMap.set(String(c._id), { total: 0, solved: 0 });
  }

  for (const p of allCompanyProblems) {
    const isSolved = solvedProblemIdSet.has(String(p._id));
    if (Array.isArray(p.companies)) {
      for (const compId of p.companies) {
        const stats = companyStatsMap.get(String(compId));
        if (stats) {
          stats.total++;
          if (isSolved) {
            stats.solved++;
          }
        }
      }
    }
  }

  const companyProgress = companies.map((c) => {
    const stats = companyStatsMap.get(String(c._id)) || { total: 0, solved: 0 };
    const total = stats.total || c.totalProblems || 0;
    const solved = stats.solved;
    const percentage = total > 0 ? parseFloat(((solved / total) * 100).toFixed(1)) : 0;
    return {
      company: c.name,
      slug: c.slug,
      total,
      solved,
      percentage,
    };
  });

  const userDoc = await User.findById(userId).select('createdAt').lean();

  return {
    // ── Overall (backward-compatible) ──────────────────────────────────────
    totalProblems,
    solvedProblems,
    attemptedProblems,
    remainingProblems: Math.max(0, remainingProblems),
    easySolved: overallDiff.Easy,
    mediumSolved: overallDiff.Medium,
    hardSolved: overallDiff.Hard,
    completionPercentage,
    currentStreak,
    longestStreak,
    totalActiveDays,
    accountCreatedAt: userDoc?.createdAt || null,
    activeDaysList: activeDays,
    companyProgress,

    // ── Per-domain breakdowns ──────────────────────────────────────────────
    dsa: {
      total: totalDsa,
      solved: domainMap.dsa.solved,
      attempted: domainMap.dsa.attempted,
      easySolved: dsaDiff.Easy,
      mediumSolved: dsaDiff.Medium,
      hardSolved: dsaDiff.Hard,
      completionPercentage: dsaCompletion,
    },
    sql: {
      total: totalSql,
      solved: domainMap.sql.solved,
      attempted: domainMap.sql.attempted,
      easySolved: sqlDiff.Easy,
      mediumSolved: sqlDiff.Medium,
      hardSolved: sqlDiff.Hard,
      completionPercentage: sqlCompletion,
    },
  };
};
