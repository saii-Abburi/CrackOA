import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { registerApi, loginApi, verifyLoginOtpApi, logoutApi, getMeApi } from '../api/auth.api.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/**
 * AuthProvider — wraps the app and exposes:
 *   user          — current user object or null
 *   token         — JWT string or null
 *   isLoading     — true while validating the stored token on mount
 *   isAuthenticated — boolean shorthand
 *   register()    — create account
 *   login()       — sign in with password
 *   loginWithOtp()— sign in with OTP verification
 *   updateUser()  — update local user state (e.g. after profile edit)
 *   logout()      — sign out
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  // ── Persist helpers ────────────────────────────────────────────────────────
  const persistAuth = (userData, jwt) => {
    localStorage.setItem(TOKEN_KEY, jwt);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);
  };

  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  // ── On mount: validate any stored token with GET /api/auth/me ─────────────
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    getMeApi()
      .then((fetchedUser) => {
        setUser(fetchedUser);
        setToken(storedToken);
      })
      .catch(() => {
        clearAuth();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // ── register ───────────────────────────────────────────────────────────────
  const register = useCallback(async ({ name, email, password }) => {
    const { user: newUser, token: jwt } = await registerApi({ name, email, password });
    persistAuth(newUser, jwt);
    return newUser;
  }, []);

  // ── login with password ────────────────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    const { user: loggedInUser, token: jwt } = await loginApi({ email, password });
    persistAuth(loggedInUser, jwt);
    return loggedInUser;
  }, []);

  // ── login with OTP ─────────────────────────────────────────────────────────
  const loginWithOtp = useCallback(async ({ email, otp }) => {
    const { user: loggedInUser, token: jwt } = await verifyLoginOtpApi({ email, otp });
    persistAuth(loggedInUser, jwt);
    return loggedInUser;
  }, []);

  // ── updateUser (for profile updates) ──────────────────────────────────────
  const updateUser = useCallback((updatedUserData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUserData };
      localStorage.setItem(USER_KEY, JSON.stringify(merged));
      return merged;
    });
  }, []);

  // ── logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // ignore
    } finally {
      clearAuth();
    }
  }, []);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(user && token),
    register,
    login,
    loginWithOtp,
    updateUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
