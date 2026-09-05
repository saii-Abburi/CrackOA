import mongoose from 'mongoose';

/**
 * PlatformAccount — stores a user's connected external coding platform handle
 * and cached statistics from that platform.
 *
 * Design goals:
 * - One document per (user, platform) pair, enforced by compound unique index.
 * - Stats are cached server-side; the frontend never sends stats.
 * - syncStatus tracks the last sync attempt state.
 * - Adding a new platform in the future = add an enum value, no schema restructure.
 */

const PLATFORMS = ['leetcode', 'codeforces', 'geeksforgeeks'];

const platformAccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    platform: {
      type: String,
      enum: PLATFORMS,
      required: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: [1, 'Username cannot be empty.'],
      maxlength: [100, 'Username cannot exceed 100 characters.'],
    },
    /**
     * sync states:
     *   pending      — just added, sync not yet attempted
     *   synced       — last sync succeeded; stats are fresh
     *   sync_failed  — last sync attempted but external API returned an error
     *   unavailable  — platform does not provide an API (e.g. GFG)
     */
    syncStatus: {
      type: String,
      enum: ['pending', 'synced', 'sync_failed', 'unavailable'],
      default: 'pending',
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
    lastAttemptedAt: {
      type: Date,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    /**
     * Cached statistics — shape depends on platform:
     *
     * Codeforces:
     *   { rating, maxRating, rank, maxRank, contribution, avatar }
     *
     * LeetCode:
     *   { ranking, totalSolved, easySolved, mediumSolved, hardSolved }
     *
     * GeeksforGeeks:
     *   {} — always empty, stats not fetched (no official API)
     */
    stats: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// One account per platform per user
platformAccountSchema.index({ user: 1, platform: 1 }, { unique: true });

// Fast lookup by user
platformAccountSchema.index({ user: 1 });

export const SUPPORTED_PLATFORMS = PLATFORMS;

const PlatformAccount = mongoose.model('PlatformAccount', platformAccountSchema);
export default PlatformAccount;
