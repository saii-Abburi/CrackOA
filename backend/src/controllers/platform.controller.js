import * as platformService from '../services/platform.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * GET /api/platforms
 * List all connected platform accounts for the current user.
 */
export const getPlatformAccounts = async (req, res, next) => {
  try {
    const accounts = await platformService.getPlatformAccounts(req.user._id);

    // Attach profile URLs (computed, not stored)
    const enriched = accounts.map((acc) => ({
      ...acc,
      profileUrl: platformService.getProfileUrl(acc.platform, acc.username),
    }));

    return sendSuccess(res, 200, 'Platform accounts fetched.', { accounts: enriched });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/platforms
 * Add a new platform account. Body: { platform, username }
 */
export const addPlatformAccount = async (req, res, next) => {
  try {
    const { platform, username } = req.body;
    const account = await platformService.addPlatformAccount(req.user._id, { platform, username });

    const enriched = {
      ...account,
      profileUrl: platformService.getProfileUrl(account.platform, account.username),
    };

    return sendSuccess(res, 201, 'Platform account connected successfully.', { account: enriched });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/platforms/:platform
 * Update the username for an existing platform connection.
 */
export const updatePlatformAccount = async (req, res, next) => {
  try {
    const { platform } = req.params;
    const { username } = req.body;
    const account = await platformService.updatePlatformAccount(req.user._id, platform, { username });

    const enriched = {
      ...account,
      profileUrl: platformService.getProfileUrl(account.platform, account.username),
    };

    return sendSuccess(res, 200, 'Platform account updated successfully.', { account: enriched });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/platforms/:platform
 * Disconnect a platform account.
 */
export const removePlatformAccount = async (req, res, next) => {
  try {
    const { platform } = req.params;
    await platformService.removePlatformAccount(req.user._id, platform);
    return sendSuccess(res, 200, 'Platform account disconnected.', null);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/platforms/:platform/sync
 * Manually trigger a stats re-sync.
 */
export const syncPlatformAccount = async (req, res, next) => {
  try {
    const { platform } = req.params;
    const account = await platformService.triggerSync(req.user._id, platform);

    const enriched = {
      ...account,
      profileUrl: platformService.getProfileUrl(account.platform, account.username),
    };

    return sendSuccess(res, 200, 'Sync completed.', { account: enriched });
  } catch (error) {
    // Attach retryAfterSeconds to response if present
    if (error.code === 'SYNC_COOLDOWN' && error.retryAfterSeconds) {
      res.set('Retry-After', String(error.retryAfterSeconds));
    }
    next(error);
  }
};
