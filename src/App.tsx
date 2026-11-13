/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import {
  createNaMexmanTemplateProfile,
  getLocalProfileOverride,
  subscribeToProfile,
} from './lib/firestoreProfiles';
import { getFirebaseErrorMessageAz } from './lib/firebase';
import { updateMetaTags, updateProfileMetaTags, validateUsername } from './lib/sanitize';
import {
  getSavedSectionScroll,
  initNavigation,
  pushAppUrl,
  restoreScrollY,
  saveSectionScroll,
  subscribeToNavigation,
} from './lib/navigation';
import { isBodyScrollLocked } from './lib/useBodyScrollLock';
import { ProfileData } from './types';
import { ProfileView } from './components/ProfileView';
import { LandingView } from './components/LandingView';
import { LegalPages } from './components/LegalPages';
import { NotFoundView } from './components/NotFoundView';
import { AdminPanel } from './components/AdminPanel';

type RouteState =
  | { kind: 'root' }
  | { kind: 'admin' }
  | { kind: 'privacy' }
  | { kind: 'terms' }
  | { kind: 'landing' }
  | { kind: 'profile'; username: string }
  | { kind: 'notfound'; slug?: string };

function parseRoute(pathname: string): RouteState {
  const clean = pathname.replace(/\/+$/, '').toLowerCase() || '/';
  if (clean === '/') return { kind: 'root' };
  if (clean === '/admin' || clean === '/login' || clean === '/giris') return { kind: 'admin' };
  if (clean === '/mexfilik' || clean === '/privacy') return { kind: 'privacy' };
  if (clean === '/sertler' || clean === '/terms') return { kind: 'terms' };
  if (clean === '/ana-sehife' || clean === '/explore') return { kind: 'landing' };

  const slug = clean.slice(1);
  // Allow valid username slugs (blocked reserved slugs fall into 404 or reserved handlers)
  const check = validateUsername(slug);
  if (!check.valid) {
    return { kind: 'notfound', slug };
  }
  return { kind: 'profile', username: check.normalized };
}

function getRouteKey(r: RouteState): string {
  if (r.kind === 'profile') return `profile:${r.username}`;
  if (r.kind === 'notfound') return `notfound:${r.slug || ''}`;
  return r.kind;
}

export default function App() {
  const { isOffline } = useAuth();
  const [route, setRoute] = useState<RouteState>(() => {
    initNavigation();
    return parseRoute(window.location.pathname);
  });

  const [profileState, setProfileState] = useState<{
    status: 'idle' | 'loading' | 'loaded' | 'notfound' | 'error';
    data: ProfileData | null;
    errorMessage?: string;
  }>({ status: 'idle', data: null });

  // AdminPanel manages its own per-section scroll memory internally
  const pageScrollKey =
    route.kind !== 'root' && route.kind !== 'profile' && route.kind !== 'admin'
      ? `page:${getRouteKey(route)}`
      : null;
  const prevPageScrollKeyRef = useRef<string | null>(pageScrollKey);

  const navigate = (path: string) => {
    const target = path.startsWith('/') ? path : `/${path}`;
    pushAppUrl(target, pageScrollKey ?? undefined);
  };

  useEffect(() => {
    initNavigation();
    const unsubNav = subscribeToNavigation(() => {
      const next = parseRoute(window.location.pathname);
      setRoute((prev) => (getRouteKey(prev) === getRouteKey(next) ? prev : next));
    });
    return () => unsubNav();
  }, []);

  // Track and restore scroll position for standalone pages (privacy, terms, landing, notfound)
  useEffect(() => {
    if (!pageScrollKey) {
      prevPageScrollKeyRef.current = null;
      return;
    }

    if (prevPageScrollKeyRef.current !== pageScrollKey) {
      prevPageScrollKeyRef.current = pageScrollKey;
      const saved = getSavedSectionScroll(pageScrollKey);
      requestAnimationFrame(() => {
        if (!isBodyScrollLocked()) {
          restoreScrollY(saved ?? 0);
        }
      });
    }

    const onScroll = () => {
      if (!isBodyScrollLocked()) {
        saveSectionScroll(pageScrollKey);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pageScrollKey]);

  // Subscribe to Firestore in real time when viewing / (loads na.mexman if present) or /{username}
  useEffect(() => {
    if (route.kind !== 'root' && route.kind !== 'profile') {
      setProfileState({ status: 'idle', data: null });
      if (route.kind === 'admin') {
        updateMetaTags({
          title: 'İdarə Paneli | QısaGet',
          description: 'QısaGet profil, linklər və mağaza idarəetmə paneli.',
        });
      } else if (route.kind === 'privacy') {
        updateMetaTags({
          title: 'Məxfilik Siyasəti | QısaGet',
          description: 'QısaGet platformasının məxfilik və məlumat təhlükəsizliyi siyasəti.',
        });
      } else if (route.kind === 'terms') {
        updateMetaTags({
          title: 'İstifadə Şərtləri | QısaGet',
          description: 'QısaGet platformasından istifadə qaydaları və şərtləri.',
        });
      } else {
        updateMetaTags({
          title: 'QısaGet - Hər şey bir linkdə',
          description: 'Sadə və güclü bio linki, yaradıcı profili və rəqəmsal mağaza platforması.',
        });
      }
      return;
    }

    const targetUsername = route.kind === 'root' ? 'na.mexman' : route.username;
    setProfileState({ status: 'loading', data: null });

    const unsub = subscribeToProfile(
      targetUsername,
      (profile) => {
        setProfileState({ status: 'loaded', data: profile });
        updateProfileMetaTags(profile);
      },
      () => {
        setProfileState({ status: 'notfound', data: null });
        updateMetaTags({
          title: route.kind === 'root' ? 'QısaGet - Hər şey bir linkdə' : 'Səhifə tapılmadı | QısaGet',
          description: 'Sadə və güclü bio linki, yaradıcı profili və rəqəmsal mağaza platforması.',
        });
      },
      (err) => {
        setProfileState({
          status: 'error',
          data: null,
          errorMessage: getFirebaseErrorMessageAz(err),
        });
      }
    );

    return () => unsub();
  }, [route]);

  if (route.kind === 'admin') {
    return <AdminPanel onNavigate={navigate} />;
  }

  if (route.kind === 'privacy') {
    return <LegalPages mode="privacy" onNavigate={navigate} />;
  }

  if (route.kind === 'terms') {
    return <LegalPages mode="terms" onNavigate={navigate} />;
  }

  if (route.kind === 'landing') {
    return <LandingView onNavigate={navigate} defaultProfileSlug="na.mexman" />;
  }

  if (route.kind === 'notfound') {
    return <NotFoundView requestedSlug={route.slug} onNavigate={navigate} />;
  }

  // Root (/) or Public Profile (/{username})
  if (profileState.status === 'loading' || profileState.status === 'idle') {
    return (
      <div className="min-h-screen bg-[#6ea6d8] flex items-center justify-center p-4">
        <div className="bg-white border-2 border-black rounded-[28px] brutal-shadow p-8 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#12365c]" />
          <p className="text-sm font-bold text-black">Profil yüklənir...</p>
        </div>
      </div>
    );
  }

  if (profileState.status === 'error') {
    return (
      <div className="min-h-screen bg-[#6ea6d8] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border-2 border-black rounded-[28px] brutal-shadow p-7 text-center space-y-4">
          <h1 className="text-xl font-black text-black">Bağlantı Xətası</h1>
          <p className="text-sm text-neutral-700">
            {profileState.errorMessage || 'Məlumatlar serverdən oxunarkən xəta baş verdi.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="min-h-[44px] px-5 py-2.5 bg-black text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Yenidən Yoxla
          </button>
        </div>
      </div>
    );
  }

  if (profileState.status === 'notfound') {
    // On root /, show the original Na.Mexman interface until profiles/na.mexman is saved in Firestore
    if (route.kind === 'root') {
      const localOverride = getLocalProfileOverride('na.mexman');
      const initialViewProfile: ProfileData = localOverride || {
        ...createNaMexmanTemplateProfile(''),
        isVerified: true,
      };
      return (
        <div className="w-full min-h-screen">
          <ProfileView
            profileData={initialViewProfile}
            onNavigate={navigate}
          />
        </div>
      );
    }
    return <NotFoundView requestedSlug={route.username} onNavigate={navigate} />;
  }

  const localOverride =
    profileState.data?.username === 'na.mexman' ? getLocalProfileOverride('na.mexman') : null;
  const profileData = localOverride || profileState.data!;

  return (
    <div className="w-full min-h-screen">
      {isOffline && (
        <div className="bg-amber-400 text-black text-center text-xs font-bold py-1.5 px-4 border-b-2 border-black">
          Oflayn rejim — dəyişikliklər internet bərpa olduqda sinxronlaşacaq.
        </div>
      )}
      <ProfileView
        profileData={profileData}
        onNavigate={navigate}
      />
    </div>
  );
}
