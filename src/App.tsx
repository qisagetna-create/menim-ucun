/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import {
  createNaMexmanTemplateProfile,
  saveProfileChanges,
  subscribeToProfile,
} from './lib/firestoreProfiles';
import { getFirebaseErrorMessageAz } from './lib/firebase';
import { updateMetaTags, updateProfileMetaTags, validateUsername } from './lib/sanitize';
import { ProfileData } from './types';
import { ProfileView } from './components/ProfileView';
import { LandingView } from './components/LandingView';
import { LegalPages } from './components/LegalPages';
import { NotFoundView } from './components/NotFoundView';

type RouteState =
  | { kind: 'root' }
  | { kind: 'privacy' }
  | { kind: 'terms' }
  | { kind: 'landing' }
  | { kind: 'profile'; username: string }
  | { kind: 'notfound'; slug?: string };

function parseRoute(pathname: string): RouteState {
  const clean = pathname.replace(/\/+$/, '').toLowerCase() || '/';
  if (clean === '/' || clean === '/admin' || clean === '/login' || clean === '/giris') {
    return { kind: 'root' };
  }
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

export default function App() {
  const { user, isOffline } = useAuth();
  const [route, setRoute] = useState<RouteState>(() => parseRoute(window.location.pathname));

  const [profileState, setProfileState] = useState<{
    status: 'idle' | 'loading' | 'loaded' | 'notfound' | 'error';
    data: ProfileData | null;
    errorMessage?: string;
  }>({ status: 'idle', data: null });

  const navigate = (path: string) => {
    const target = path.startsWith('/') ? path : `/${path}`;
    if (window.location.pathname !== target) {
      window.history.pushState({}, '', target);
    }
    setRoute(parseRoute(target));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const onPopState = () => {
      setRoute(parseRoute(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Subscribe to Firestore in real time when viewing / (loads na.mexman if present, else Landing) or /{username}
  useEffect(() => {
    if (route.kind !== 'root' && route.kind !== 'profile') {
      setProfileState({ status: 'idle', data: null });
      if (route.kind === 'privacy') {
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

  const handleQuickOwnerUpdate = async (updated: ProfileData) => {
    if (!updated.username || !user) return;
    setProfileState((prev) => ({ ...prev, data: updated }));
    try {
      await saveProfileChanges(updated.username, updated.ownerUid || user.uid, updated);
    } catch (err) {
      console.error('Profil yenilənə bilmədi:', getFirebaseErrorMessageAz(err));
    }
  };

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
      const initialViewProfile: ProfileData = {
        ...createNaMexmanTemplateProfile(''),
        isVerified: true,
      };
      return (
        <div className="w-full min-h-screen">
          <ProfileView
            profileData={initialViewProfile}
            isOwner={false}
            onNavigate={navigate}
          />
        </div>
      );
    }
    return <NotFoundView requestedSlug={route.username} onNavigate={navigate} />;
  }

  const profileData = profileState.data!;
  const isOwner = Boolean(user && profileData.ownerUid && user.uid === profileData.ownerUid);

  return (
    <div className="w-full min-h-screen">
      {isOffline && (
        <div className="bg-amber-400 text-black text-center text-xs font-bold py-1.5 px-4 border-b-2 border-black">
          Oflayn rejim — dəyişikliklər internet bərpa olduqda sinxronlaşacaq.
        </div>
      )}
      <ProfileView
        profileData={profileData}
        isOwner={isOwner}
        onUpdateProfile={isOwner ? handleQuickOwnerUpdate : undefined}
        onNavigate={navigate}
      />
    </div>
  );
}
