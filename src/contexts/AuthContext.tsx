import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
} from 'firebase/auth';
import {
  auth,
  googleProvider,
  initAppCheck,
  testFirestoreConnection,
  getFirebaseErrorMessageAz,
} from '../lib/firebase';

import { replaceAppUrl } from '../lib/navigation';

const EMAIL_STORAGE_KEY = 'qisaget_email_for_signin';

interface AuthContextValue {
  user: User | null;
  authReady: boolean;
  isOffline: boolean;
  needsEmailConfirmationForLink: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<User>;
  sendEmailLoginLink: (email: string) => Promise<void>;
  confirmEmailForPendingLink: (email: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [needsEmailConfirmationForLink, setNeedsEmailConfirmationForLink] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    initAppCheck();

    testFirestoreConnection().then((connected) => {
      if (!connected) setIsOffline(true);
    });

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Complete passwordless email-link sign-in if returning from email link
    if (typeof window !== 'undefined' && isSignInWithEmailLink(auth, window.location.href)) {
      const savedEmail = window.localStorage.getItem(EMAIL_STORAGE_KEY);
      if (savedEmail) {
        signInWithEmailLink(auth, savedEmail, window.location.href)
          .then(() => {
            window.localStorage.removeItem(EMAIL_STORAGE_KEY);
            replaceAppUrl('/admin');
          })
          .catch((err) => {
            setAuthError(getFirebaseErrorMessageAz(err));
          });
      } else {
        setNeedsEmailConfirmationForLink(true);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
    });

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const clearAuthError = () => setAuthError(null);

  const signInWithGoogle = async (): Promise<User> => {
    setAuthError(null);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      return res.user;
    } catch (err) {
      const msg = getFirebaseErrorMessageAz(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const sendEmailLoginLink = async (email: string): Promise<void> => {
    setAuthError(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      const msg = 'Zəhmət olmasa düzgün e-poçt ünvanı daxil edin.';
      setAuthError(msg);
      throw new Error(msg);
    }

    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/admin`,
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, trimmed, actionCodeSettings);
      window.localStorage.setItem(EMAIL_STORAGE_KEY, trimmed);
    } catch (err) {
      const msg = getFirebaseErrorMessageAz(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const confirmEmailForPendingLink = async (email: string): Promise<User> => {
    setAuthError(null);
    const trimmed = email.trim().toLowerCase();
    try {
      const res = await signInWithEmailLink(auth, trimmed, window.location.href);
      window.localStorage.removeItem(EMAIL_STORAGE_KEY);
      setNeedsEmailConfirmationForLink(false);
      replaceAppUrl('/admin');
      return res.user;
    } catch (err) {
      const msg = getFirebaseErrorMessageAz(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const logout = async (): Promise<void> => {
    setAuthError(null);
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        isOffline,
        needsEmailConfirmationForLink,
        authError,
        clearAuthError,
        signInWithGoogle,
        sendEmailLoginLink,
        confirmEmailForPendingLink,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth yalnız AuthProvider daxilində istifadə edilə bilər.');
  }
  return ctx;
}
