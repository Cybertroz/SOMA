/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  auth,
  db,
  isConfiguredWithRealFirebase,
  mapAuthErrorCodeToMessage,
  DEFAULT_DEMO_USERS,
} from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { UserProfile, AppUserRole, AuditLogDocument } from '../types/auth';

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  error: string | null;
  loginError: string | null;
  lockoutRemainingSec: number;
  inactivityWarning: boolean;
  signIn: (email: string, pass: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  logAuditAction: (action: string, details: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  resetInactivityTimer: () => void;
  clearLoginError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'limuru_cbc_auth_profile';
const LOCAL_STORAGE_KEY = 'limuru_cbc_auth_profile_persisted';
const FAILED_ATTEMPTS_KEY = 'limuru_auth_failed_count';
const LOCKOUT_TIMESTAMP_KEY = 'limuru_auth_lockout_until';

// 15 Minutes Inactivity (in milliseconds)
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;
// 14 Minutes Warning (in milliseconds)
const INACTIVITY_WARNING_MS = 14 * 60 * 1000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [lockoutRemainingSec, setLockoutRemainingSec] = useState<number>(0);
  const [inactivityWarning, setInactivityWarning] = useState<boolean>(false);

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lockoutIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check Lockout on mount or attempts
  const checkLockoutStatus = useCallback((): boolean => {
    const lockoutUntilStr = localStorage.getItem(LOCKOUT_TIMESTAMP_KEY);
    if (lockoutUntilStr) {
      const lockoutUntil = parseInt(lockoutUntilStr, 10);
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
      if (remaining > 0) {
        setLockoutRemainingSec(remaining);
        return true;
      } else {
        localStorage.removeItem(LOCKOUT_TIMESTAMP_KEY);
        localStorage.removeItem(FAILED_ATTEMPTS_KEY);
        setLockoutRemainingSec(0);
        return false;
      }
    }
    return false;
  }, []);

  // Handle countdown for lockout
  useEffect(() => {
    if (lockoutRemainingSec > 0) {
      if (lockoutIntervalRef.current) clearInterval(lockoutIntervalRef.current);
      lockoutIntervalRef.current = setInterval(() => {
        setLockoutRemainingSec((prev) => {
          if (prev <= 1) {
            if (lockoutIntervalRef.current) clearInterval(lockoutIntervalRef.current);
            localStorage.removeItem(LOCKOUT_TIMESTAMP_KEY);
            localStorage.removeItem(FAILED_ATTEMPTS_KEY);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (lockoutIntervalRef.current) clearInterval(lockoutIntervalRef.current);
    };
  }, [lockoutRemainingSec]);

  // Log audit action helper
  const logAuditAction = useCallback(async (action: string, details: string) => {
    try {
      const entry: AuditLogDocument = {
        uid: currentUser?.uid || 'anonymous',
        role: currentUser?.role || 'headteacher',
        action,
        details,
        timestamp: new Date().toISOString(),
      };

      if (db && isConfiguredWithRealFirebase()) {
        await addDoc(collection(db, 'auditLogs'), {
          ...entry,
          serverTimestamp: serverTimestamp(),
        });
      } else {
        // Fallback local memory / storage audit logs
        const existing = JSON.parse(localStorage.getItem('limuru_audit_logs_local') || '[]');
        localStorage.setItem('limuru_audit_logs_local', JSON.stringify([entry, ...existing].slice(0, 50)));
      }
    } catch (e) {
      console.warn('Audit log write notice:', e);
    }
  }, [currentUser]);

  // Logout method
  const logout = useCallback(async () => {
    if (currentUser) {
      await logAuditAction('logout', `User ${currentUser.fullName} signed out.`);
    }

    if (auth && isConfiguredWithRealFirebase()) {
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        console.error('Firebase signOut error:', e);
      }
    }

    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setCurrentUser(null);
    setInactivityWarning(false);
  }, [currentUser, logAuditAction]);

  // Reset Inactivity Timer
  const resetInactivityTimer = useCallback(() => {
    if (!currentUser) return;
    setInactivityWarning(false);

    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

    // Warning at 14 minutes
    warningTimerRef.current = setTimeout(() => {
      setInactivityWarning(true);
    }, INACTIVITY_WARNING_MS);

    // Auto sign out at 15 minutes
    inactivityTimerRef.current = setTimeout(() => {
      logout();
      setLoginError('You were automatically signed out after 15 minutes of inactivity.');
    }, INACTIVITY_TIMEOUT_MS);
  }, [currentUser, logout]);

  // User activity listeners
  useEffect(() => {
    if (!currentUser) return;

    const activityEvents = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    const handleActivity = () => {
      resetInactivityTimer();
    };

    activityEvents.forEach((evt) => window.addEventListener(evt, handleActivity));
    resetInactivityTimer();

    return () => {
      activityEvents.forEach((evt) => window.removeEventListener(evt, handleActivity));
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [currentUser, resetInactivityTimer]);

  // Fetch or sync Firestore user profile
  const fetchFirestoreProfile = async (uid: string, fallbackEmail: string): Promise<UserProfile | null> => {
    if (!db || !isConfiguredWithRealFirebase()) {
      // Check local stored profile
      const local = sessionStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem(LOCAL_STORAGE_KEY);
      if (local) {
        try {
          return JSON.parse(local) as UserProfile;
        } catch {
          // ignore
        }
      }
      // Check default demo users
      const match = Object.values(DEFAULT_DEMO_USERS).find(
        (u) => u.profile.uid === uid || u.profile.email.toLowerCase() === fallbackEmail.toLowerCase()
      );
      return match ? match.profile : null;
    }

    try {
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        // Document does not exist
        return null;
      }

      const data = userSnap.data();
      const profile: UserProfile = {
        uid,
        fullName: data.fullName || 'School Staff Member',
        email: data.email || fallbackEmail,
        role: (data.role as AppUserRole) || 'teacher',
        active: data.active !== false,
        createdAt: data.createdAt || new Date().toISOString(),
        department: data.department || '',
        phone: data.phone || '',
        assignedGrade: data.assignedGrade,
        assignedStream: data.assignedStream,
      };

      return profile;
    } catch (e) {
      console.error('Error fetching Firestore user profile:', e);
      return null;
    }
  };

  // Auth State Listener on Mount
  useEffect(() => {
    checkLockoutStatus();

    // Check offline saved session first for immediate seamless render
    const savedSession = sessionStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.active) {
          setCurrentUser(parsed);
        }
      } catch {
        // ignore
      }
    }

    if (auth && isConfiguredWithRealFirebase()) {
      const activeAuth = auth;
      const unsubscribe = onAuthStateChanged(activeAuth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const profile = await fetchFirestoreProfile(fbUser.uid, fbUser.email || '');
          if (!profile || !profile.active) {
            await firebaseSignOut(activeAuth);
            setCurrentUser(null);
            setLoginError('Your account has not been activated. Contact the school administrator.');
          } else {
            setCurrentUser(profile);
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
          }
        } else {
          // If not in Firebase, and not using demo session
          if (isConfiguredWithRealFirebase()) {
            setCurrentUser(null);
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // In offline/demo fallback mode, stop initial loading promptly
      const t = setTimeout(() => {
        setLoading(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [checkLockoutStatus]);

  // Sign In handler
  const signIn = async (email: string, pass: string, rememberMe = true): Promise<boolean> => {
    setLoginError(null);

    // Check lockout first
    if (checkLockoutStatus()) {
      setLoginError(`System locked due to failed attempts. Try again in ${lockoutRemainingSec}s.`);
      return false;
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Try real Firebase Auth if configured
    if (auth && isConfiguredWithRealFirebase()) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        const fbUser = userCredential.user;

        const profile = await fetchFirestoreProfile(fbUser.uid, fbUser.email || cleanEmail);

        if (!profile || !profile.active) {
          await firebaseSignOut(auth);
          setLoginError('Your account has not been activated. Contact the school administrator.');
          return false;
        }

        // Reset failed attempts on success
        localStorage.removeItem(FAILED_ATTEMPTS_KEY);
        localStorage.removeItem(LOCKOUT_TIMESTAMP_KEY);

        setCurrentUser(profile);
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
        if (rememberMe) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
        }

        await logAuditAction('login', `User ${profile.fullName} (${profile.role}) signed in successfully.`);
        return true;
      } catch (err: any) {
        console.error('Firebase Auth sign in error:', err);
        const code = err.code || '';
        const msg = mapAuthErrorCodeToMessage(code);

        // Record failed attempt
        const failedCount = parseInt(localStorage.getItem(FAILED_ATTEMPTS_KEY) || '0', 10) + 1;
        localStorage.setItem(FAILED_ATTEMPTS_KEY, failedCount.toString());

        if (failedCount >= 5) {
          const lockoutUntil = Date.now() + 30 * 1000;
          localStorage.setItem(LOCKOUT_TIMESTAMP_KEY, lockoutUntil.toString());
          setLockoutRemainingSec(30);
          setLoginError('Too many failed attempts. Account locked out for 30 seconds.');
        } else {
          setLoginError(`${msg} (Attempt ${failedCount} of 5)`);
        }

        return false;
      }
    }

    // 2. Demo Fallback mode (when Firebase credentials are placeholders)
    const demoUser = DEFAULT_DEMO_USERS[cleanEmail];
    if (demoUser && demoUser.password === pass) {
      if (!demoUser.profile.active) {
        setLoginError('Your account has not been activated. Contact the school administrator.');
        return false;
      }

      localStorage.removeItem(FAILED_ATTEMPTS_KEY);
      localStorage.removeItem(LOCKOUT_TIMESTAMP_KEY);

      setCurrentUser(demoUser.profile);
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(demoUser.profile));
      if (rememberMe) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(demoUser.profile));
      }

      await logAuditAction('login', `User ${demoUser.profile.fullName} (${demoUser.profile.role}) signed in via demo gate.`);
      return true;
    } else {
      // Failed demo attempt
      const failedCount = parseInt(localStorage.getItem(FAILED_ATTEMPTS_KEY) || '0', 10) + 1;
      localStorage.setItem(FAILED_ATTEMPTS_KEY, failedCount.toString());

      if (failedCount >= 5) {
        const lockoutUntil = Date.now() + 30 * 1000;
        localStorage.setItem(LOCKOUT_TIMESTAMP_KEY, lockoutUntil.toString());
        setLockoutRemainingSec(30);
        setLoginError('Too many failed attempts. Account locked out for 30 seconds.');
      } else {
        setLoginError(`Invalid email address or password. (Attempt ${failedCount} of 5)`);
      }
      return false;
    }
  };

  // Password reset
  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    if (auth && isConfiguredWithRealFirebase()) {
      try {
        await sendPasswordResetEmail(auth, cleanEmail);
        return {
          success: true,
          message: `Password reset email dispatched to ${cleanEmail}. Check your inbox.`,
        };
      } catch (err: any) {
        return {
          success: false,
          message: mapAuthErrorCodeToMessage(err.code || ''),
        };
      }
    } else {
      // Demo simulated reset
      if (DEFAULT_DEMO_USERS[cleanEmail]) {
        return {
          success: true,
          message: `[Demo Mode] Password reset link sent to ${cleanEmail}. In production, Firebase sends a secure link.`,
        };
      } else {
        return {
          success: true,
          message: `If an account exists for ${cleanEmail}, instructions have been sent.`,
        };
      }
    }
  };

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (!currentUser) return;
    const profile = await fetchFirestoreProfile(currentUser.uid, currentUser.email);
    if (profile) {
      setCurrentUser(profile);
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
    }
  };

  const clearLoginError = () => {
    setLoginError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        error,
        loginError,
        lockoutRemainingSec,
        inactivityWarning,
        signIn,
        logout,
        resetPassword,
        logAuditAction,
        refreshUserProfile,
        resetInactivityTimer,
        clearLoginError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
