import PlatformAccount from '../models/PlatformAccount.js';

// ─────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────

const SYNC_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

/** Profile URL templates per platform */
const PROFILE_URLS = {
  leetcode: (u) => `https://leetcode.com/${u}/`,
  codeforces: (u) => `https://codeforces.com/profile/${u}`,
  geeksforgeeks: (u) => `https://www.geeksforgeeks.org/user/${u}/`,
};

/** Username format validation per platform (format only, not existence) */
const USERNAME_PATTERNS = {
  leetcode: /^[a-zA-Z0-9_-]{3,25}$/,
  codeforces: /^[a-zA-Z0-9_-]{3,24}$/,
  geeksforgeeks: /^[a-zA-Z0-9_-]{3,50}$/,
};

// ─────────────────────────────────────────────────────────────────
// External API helpers
// ─────────────────────────────────────────────────────────────────

/**
 * Fetch Codeforces user stats via the official public API.
 * Returns the stats object on success, throws on failure.
 */
async function fetchCodeforcesStats(handle) {
  const url = `https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`;

  let res;
  try {
    res = await fetch(url, {
      headers: { 'User-Agent': 'CodeRank-App/1.0' },
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    throw new Error(`Network error reaching Codeforces: ${err.message}`);
  }

  if (!res.ok) {
    throw new Error(`Codeforces API returned HTTP ${res.status}`);
  }

  const data = await res.json();

  if (data.status !== 'OK') {
    // e.g. "handles: User with handle tourist not found."
    const msg = data.comment || 'Handle not found on Codeforces.';
    const err = new Error(msg);
    err.code = 'HANDLE_NOT_FOUND';
    throw err;
  }

  const user = data.result[0];
  return {
    rating: user.rating ?? null,
    maxRating: user.maxRating ?? null,
    rank: user.rank ?? null,
    maxRank: user.maxRank ?? null,
    contribution: user.contribution ?? 0,
    avatar: user.titlePhoto || user.avatar || null,
  };
}

/**
 * Fetch LeetCode user stats via the unofficial internal GraphQL API.
 * Returns the stats object or null if the user doesn't exist.
 * Throws on network errors (caller sets syncStatus = 'sync_failed').
 */
async function fetchLeetCodeStats(username) {
  const query = `
    query userPublicProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          ranking
          userAvatar
        }
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;

  let res;
  try {
    res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; CodeRank/1.0)',
        Referer: 'https://leetcode.com',
      },
      body: JSON.stringify({ query, variables: { username } }),
      signal: AbortSignal.timeout(12_000),
    });
  } catch (err) {
    throw new Error(`Network error reaching LeetCode: ${err.message}`);
  }

  if (!res.ok) {
    throw new Error(`LeetCode returned HTTP ${res.status}. This may be a Cloudflare block.`);
  }

  const data = await res.json();
  const matched = data?.data?.matchedUser;

  if (!matched) {
    // User simply doesn't exist
    const err = new Error('Handle not found on LeetCode.');
    err.code = 'HANDLE_NOT_FOUND';
    throw err;
  }

  const submissions = matched.submitStats?.acSubmissionNum ?? [];
  const get = (diff) => submissions.find((s) => s.difficulty === diff)?.count ?? 0;

  return {
    ranking: matched.profile?.ranking ?? null,
    totalSolved: get('All'),
    easySolved: get('Easy'),
    mediumSolved: get('Medium'),
    hardSolved: get('Hard'),
  };
}

// ─────────────────────────────────────────────────────────────────
// Sync logic
// ─────────────────────────────────────────────────────────────────

/**
 * Perform a full sync of the platform account — hits external APIs.
 * Updates the PlatformAccount document in place.
 * Returns the updated document.
 */
async function syncPlatformAccount(account) {
  const { platform, username } = account;

  account.lastAttemptedAt = new Date();

  try {
    if (platform === 'codeforces') {
      const stats = await fetchCodeforcesStats(username);
      account.stats = stats;
      account.syncStatus = 'synced';
      account.lastSyncedAt = new Date();
      account.errorMessage = null;
    } else if (platform === 'leetcode') {
      const stats = await fetchLeetCodeStats(username);
      account.stats = stats;
      account.syncStatus = 'synced';
      account.lastSyncedAt = new Date();
      account.errorMessage = null;
    } else if (platform === 'geeksforgeeks') {
      // GFG: no API, no scraping — mark unavailable
      account.syncStatus = 'unavailable';
      account.stats = {};
      account.errorMessage = null;
    }
  } catch (err) {
    account.syncStatus = 'sync_failed';
    account.errorMessage = err.message || 'Sync failed.';
    // Re-throw only if it's a handle-not-found error (caller needs to surface this)
    if (err.code === 'HANDLE_NOT_FOUND') throw err;
  }

  await account.save();
  return account;
}

// ─────────────────────────────────────────────────────────────────
// Public service functions
// ─────────────────────────────────────────────────────────────────

/**
 * Get all platform accounts for a user.
 */
export const getPlatformAccounts = async (userId) => {
  return PlatformAccount.find({ user: userId }).lean();
};

/**
 * Add a new platform account, validate the handle format,
 * then trigger an initial sync (which also validates existence for CF/LC).
 */
export const addPlatformAccount = async (userId, { platform, username }) => {
  const trimmed = username.trim();

  // 1. Format validation
  const pattern = USERNAME_PATTERNS[platform];
  if (!pattern.test(trimmed)) {
    const err = new Error(
      `Invalid username format for ${platform}. Must be 3-${platform === 'geeksforgeeks' ? 50 : platform === 'codeforces' ? 24 : 25} characters, letters/numbers/underscores/hyphens only.`
    );
    err.statusCode = 400;
    err.code = 'INVALID_USERNAME_FORMAT';
    throw err;
  }

  // 2. Duplicate check (DB index will catch it too, but a pre-check gives a nicer error)
  const existing = await PlatformAccount.findOne({ user: userId, platform });
  if (existing) {
    const err = new Error(
      `You already have a ${platform} account connected. Update it instead.`
    );
    err.statusCode = 409;
    err.code = 'PLATFORM_ALREADY_CONNECTED';
    throw err;
  }

  // 3. Create with pending status
  const account = await PlatformAccount.create({
    user: userId,
    platform,
    username: trimmed,
    syncStatus: 'pending',
  });

  // 4. Sync (validates existence for CF/LC, skips for GFG)
  // If HANDLE_NOT_FOUND, we delete the just-created account and surface the error
  try {
    await syncPlatformAccount(account);
  } catch (err) {
    if (err.code === 'HANDLE_NOT_FOUND') {
      await PlatformAccount.deleteOne({ _id: account._id });
      err.statusCode = 404;
      throw err;
    }
    // Network errors: account is saved with sync_failed — don't delete
  }

  return PlatformAccount.findById(account._id).lean();
};

/**
 * Update the username for an existing platform account.
 * Re-syncs after update.
 */
export const updatePlatformAccount = async (userId, platform, { username }) => {
  const trimmed = username.trim();

  const pattern = USERNAME_PATTERNS[platform];
  if (!pattern.test(trimmed)) {
    const err = new Error(`Invalid username format for ${platform}.`);
    err.statusCode = 400;
    err.code = 'INVALID_USERNAME_FORMAT';
    throw err;
  }

  const account = await PlatformAccount.findOne({ user: userId, platform });
  if (!account) {
    const err = new Error(`No ${platform} account connected. Add it first.`);
    err.statusCode = 404;
    err.code = 'PLATFORM_NOT_CONNECTED';
    throw err;
  }

  account.username = trimmed;
  account.syncStatus = 'pending';
  account.stats = {};
  account.lastAttemptedAt = null;
  account.lastSyncedAt = null;
  account.errorMessage = null;
  await account.save();

  try {
    await syncPlatformAccount(account);
  } catch (err) {
    if (err.code === 'HANDLE_NOT_FOUND') {
      err.statusCode = 404;
      throw err;
    }
  }

  return PlatformAccount.findById(account._id).lean();
};

/**
 * Remove a platform account.
 */
export const removePlatformAccount = async (userId, platform) => {
  const result = await PlatformAccount.deleteOne({ user: userId, platform });
  if (result.deletedCount === 0) {
    const err = new Error(`No ${platform} account connected.`);
    err.statusCode = 404;
    err.code = 'PLATFORM_NOT_CONNECTED';
    throw err;
  }
};

/**
 * Manually trigger a stats re-sync.
 * Enforces a 10-minute cooldown per (user, platform).
 */
export const triggerSync = async (userId, platform) => {
  const account = await PlatformAccount.findOne({ user: userId, platform });
  if (!account) {
    const err = new Error(`No ${platform} account connected.`);
    err.statusCode = 404;
    err.code = 'PLATFORM_NOT_CONNECTED';
    throw err;
  }

  // Cooldown check
  if (account.lastAttemptedAt) {
    const msSinceLast = Date.now() - account.lastAttemptedAt.getTime();
    if (msSinceLast < SYNC_COOLDOWN_MS) {
      const secondsRemaining = Math.ceil((SYNC_COOLDOWN_MS - msSinceLast) / 1000);
      const err = new Error(
        `Please wait ${secondsRemaining} seconds before syncing again.`
      );
      err.statusCode = 429;
      err.code = 'SYNC_COOLDOWN';
      err.retryAfterSeconds = secondsRemaining;
      throw err;
    }
  }

  try {
    await syncPlatformAccount(account);
  } catch (err) {
    if (err.code === 'HANDLE_NOT_FOUND') {
      err.statusCode = 404;
      throw err;
    }
    // Network errors: account saved with sync_failed, return it
  }

  return PlatformAccount.findById(account._id).lean();
};

/**
 * Get profile URL for a platform + username.
 */
export const getProfileUrl = (platform, username) =>
  PROFILE_URLS[platform]?.(username) ?? null;
