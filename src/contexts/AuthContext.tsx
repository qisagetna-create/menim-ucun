import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import {
  auth,
  initAppCheck,
  testFirestoreConnection,
} from '../lib/firebase';

const ADMIN_SESSION_STORAGE_KEY = 'qisaget_admin_session_active';
const ADMIN_LOGIN_EMAIL = 'qisaget.na@gmail.com';
const ADMIN_LOGIN_SECRET = 'qisaget1999';

interface AuthContextValue {
  user: User | null;
  authReady: boolean;
  isOffline: boolean;
  isAdminAuthenticated: boolean;
  authError: string | null;
  clearAuthError: () => void;
  loginAdminWithCredentials: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY) === '1';
  });
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

  const loginAdminWithCredentials = async (email: string, password: string): Promise<void> => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      const msg = 'Zəhmət olmasa e-mail və şifrənizi daxil edin.';
      setAuthError(msg);
      throw new Error(msg);
    }

    if (cleanEmail !== ADMIN_LOGIN_EMAIL || password !== ADMIN_LOGIN_SECRET) {
      const msg = 'E-mail və ya şifrə yanlışdır.';
      setAuthError(msg);
      throw new Error(msg);
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, '1');
    }
    setIsAdminAuthenticated(true);
  };

  const logout = async (): Promise<void> => {
    setAuthError(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    }
    setIsAdminAuthenticated(false);
    try {
      await signOut(auth);
    } catch {
      // Ignore Firebase signOut error if not signed into Firebase Auth
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        isOffline,
        isAdminAuthenticated,
        authError,
        clearAuthError,
        loginAdminWithCredentials,
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
