/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ProfileView } from './components/ProfileView';
import { LandingView } from './components/LandingView';
import { INITIAL_PROFILE } from './data/defaults';
import { ProfileData } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'profile' | 'landing'>('profile');
  const [profileData, setProfileData] = useState<ProfileData>(() => {
    try {
      const saved = localStorage.getItem('qisaget_profile_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasOldLinks = !parsed.links || parsed.links.some((l: { id: string }) => l.id === 'link-discord');
        return {
          ...INITIAL_PROFILE,
          ...parsed,
          username: INITIAL_PROFILE.username,
          displayName: INITIAL_PROFILE.displayName,
          bio: INITIAL_PROFILE.bio,
          links: hasOldLinks ? INITIAL_PROFILE.links : parsed.links,
          socials: {
            ...INITIAL_PROFILE.socials,
            ...(parsed.socials || {}),
          },
        };
      }
    } catch {
      // fallback to initial
    }
    return INITIAL_PROFILE;
  });

  useEffect(() => {
    try {
      localStorage.setItem('qisaget_profile_data', JSON.stringify(profileData));
    } catch {
      // ignore
    }
  }, [profileData]);

  const handleNavigateToLanding = () => {
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToProfile = () => {
    setCurrentView('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClaimUsername = (username: string) => {
    setProfileData((prev) => ({
      ...prev,
      username,
      displayName: username.startsWith('@') ? username : `@${username}`,
    }));
  };

  return (
    <div className="w-full min-h-screen">
      {currentView === 'profile' ? (
        <ProfileView
          profileData={profileData}
          onUpdateProfile={setProfileData}
          onNavigateToLanding={handleNavigateToLanding}
        />
      ) : (
        <LandingView
          onNavigateToProfile={handleNavigateToProfile}
          onClaimUsername={handleClaimUsername}
          currentUsername={profileData.username}
        />
      )}
    </div>
  );
}
