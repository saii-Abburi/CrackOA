import UserProgress from '../models/UserProgress.js';
import Problem from '../models/Problem.js';
import Company from '../models/Company.js';
import User from '../models/User.js';

/**
 * Upsert (create or update) a progress record for a user+problem.
 */
export const upsertProgress = async (userId, problemId, { status, notes }) => {
  // Verify problem exists
  const problem = await Problem.findById(problemId).lean();
  if (!problem) {
    const error = new Error('Problem not found.');
    error.statusCode = 404;
    error.code = 'PROBLEM_NOT_FOUND';
    throw error;
  }

  const updateData = {};
  if (status !== undefined) updateData.status = status;
  if (notes !== undefined) updateData.notes = notes;

  // findOneAndUpdate with upsert so we handle both create & update in one call
  const progress = await UserProgress.findOneAndUpdate(
    { user: userId, problem: problemId },
    { $set: updateData },
    { new: true, upsert: true, runValidators: true }
  ).populate('problem', 'title difficulty leetcodeId slug');

  // Handle solvedAt manually since pre-save doesn't fire on findOneAndUpdate
  if (status === 'solved' && !progress.solvedAt) {
    progress.solvedAt = new Date();
    await progress.save();
  } else if (status && status !== 'solved' && progress.solvedAt) {
    progress.solvedAt = null;
    await progress.save();
  }

  return progress;
};

/**
 * Get all progress records for a user.
 */
export const getUserProgress = async (userId) => {
  return UserProgress.find({ user: userId })
    .populate('problem', 'title difficulty leetcodeId slug acceptanceRate frequency topics companies')
    .sort({ updatedAt: -1 })
    .lean();
};

/**
 * Get progress for a single problem for the authenticated user.
 */
export const getProgressByProblem = async (userId, problemId) => {
  const progress = await UserProgress.findOne({ user: userId, problem: problemId })
    .populate('problem', 'title difficulty leetcodeId slug')
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
 * Delete a progress record.
 */
export const deleteProgress = async (userId, problemId) => {
  const progress = await UserProgress.findOneAndDelete({ user: userId, problem: problemId });
  if (!progress) {
    const error = new Error('Progress record not found.');
    error.statusCode = 404;
    error.code = 'PROGRESS_NOT_FOUND';
    throw error;
  }
  return progress;
};

/**
 * Get dashboard statistics for the authenticated user.
 */
export const getDashboardStats = async (userId) => {
  const totalProblems = await Problem.countDocuments();

  // Aggregate progress stats
  const progressStats = await UserProgress.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const statsMap = { not_started: 0, attempted: 0, solved: 0 };
  progressStats.forEach(({ _id, count }) => {
    statsMap[_id] = count;
  });

  const solvedProblems = statsMap.solved;
  const attemptedProblems = statsMap.attempted;
  const remainingProblems = totalProblems - solvedProblems - attemptedProblems;

  // Difficulty breakdown of solved problems
  const solvedByDifficulty = await UserProgress.aggregate([
    { $match: { user: userId, status: 'solved' } },
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
        _id: '$problemData.difficulty',
        count: { $sum: 1 },
      },
    },
  ]);

  const difficultyMap = { Easy: 0, Medium: 0, Hard: 0 };
  solvedByDifficulty.forEach(({ _id, count }) => {
    difficultyMap[_id] = count;
  });

  const completionPercentage =
    totalProblems > 0
      ? parseFloat(((solvedProblems / totalProblems) * 100).toFixed(1))
      : 0;

  // ── Streak computation ──────────────────────────────────────────────────────
  // Get all unique dates (in user's calendar, UTC-based) where user solved a problem
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

  const activeDays = solvedDates.map((d) => d._id); // ['2026-08-18', '2026-08-17', ...]
  const totalActiveDays = activeDays.length;

  let currentStreak = 0;
  let longestStreak = 0;

  if (activeDays.length > 0) {
    // Sort ascending for longest streak calculation
    const sortedAsc = [...activeDays].sort();

    // Calculate longest streak
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

    // Calculate current streak (consecutive days ending today or yesterday)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    // activeDays is sorted desc (newest first)
    const latestDay = activeDays[0];

    if (latestDay === todayStr || latestDay === yesterdayStr) {
      currentStreak = 1;
      // Walk backwards from the latest day
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

  // Company-wise progress
  const companies = await Company.find().lean();

  const companyProgress = await Promise.all(
    companies.map(async (c) => {
      const companyProblems = await Problem.find({ companies: c._id }).select('_id').lean();
      const problemIds = companyProblems.map((p) => p._id);

      const solvedCount = await UserProgress.countDocuments({
        user: userId,
        problem: { $in: problemIds },
        status: 'solved',
      });

      return {
        company: c.name,
        slug: c.slug,
        total: c.totalProblems,
        solved: solvedCount,
        percentage:
          c.totalProblems > 0
            ? parseFloat(((solvedCount / c.totalProblems) * 100).toFixed(1))
            : 0,
      };
    })
  );

  const userDoc = await User.findById(userId).select('createdAt').lean();

  return {
    totalProblems,
    solvedProblems,
    attemptedProblems,
    remainingProblems: Math.max(0, remainingProblems),
    easySolved: difficultyMap.Easy,
    mediumSolved: difficultyMap.Medium,
    hardSolved: difficultyMap.Hard,
    completionPercentage,
    currentStreak,
    longestStreak,
    totalActiveDays,
    accountCreatedAt: userDoc?.createdAt || null,
    activeDaysList: activeDays, // ['2026-08-18', '2026-08-17', ...]
    companyProgress,
  };
};
