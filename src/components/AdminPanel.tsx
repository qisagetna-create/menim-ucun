import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Camera,
  Check,
  Copy,
  ExternalLink,
  Film,
  Globe,
  Image as ImageIcon,
  Link2,
  Loader2,
  LogOut,
  Mail,
  Menu,
  Music,
  Palette,
  Plus,
  Save,
  Share2,
  ShoppingBag,
  Smartphone,
  Trash2,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getFirebaseErrorMessageAz } from '../lib/firebase';
import {
  claimUsernameAndCreateProfile,
  createNaMexmanTemplateProfile,
  isPlatformAdminEmail,
  saveProfileChanges,
  subscribeToProfile,
  subscribeToUserAccount,
} from '../lib/firestoreProfiles';
import { buildWhatsappOrderUrl } from '../lib/sanitize';
import {
  getSavedSectionScroll,
  goBackOrReplace,
  pushAppUrl,
  replaceAppUrl,
  restoreScrollY,
  saveSectionScroll,
  subscribeToNavigation,
} from '../lib/navigation';
import { isBodyScrollLocked, useBodyScrollLock } from '../lib/useBodyScrollLock';
import { THEME_OPTIONS } from '../data/defaults';
import {
  CustomLink,
  MixtapeTrack,
  NewsCard,
  ProductItem,
  ProfileData,
  UserAccountDoc,
} from '../types';
import { QLogo } from './QLogo';
import { ImageUploadControl } from './ImageUploadControl';
import { ProfileView } from './ProfileView';

type AdminSection =
  | 'profil'
  | 'foto'
  | 'linkler'
  | 'kartlar'
  | 'magaza'
  | 'musiqi'
  | 'onizleme';

interface AdminRouteState {
  section: AdminSection;
  menuOpen: boolean;
}

const VALID_SECTIONS = new Set<AdminSection>([
  'profil',
  'foto',
  'linkler',
  'kartlar',
  'magaza',
  'musiqi',
  'onizleme',
]);

const SECTION_META: Array<{
  id: AdminSection;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'profil',
    label: 'Profil, Tema və Sosial',
    desc: 'Ad, bio, rəng teması, WhatsApp sifariş nömrəsi və sosial hesablar',
    icon: UserIcon,
  },
  {
    id: 'foto',
    label: 'Profil Fotosu',
    desc: 'Əsas foto yükləmə (cihaz, kamera, link) və ölçü tənzimləməsi',
    icon: ImageIcon,
  },
  {
    id: 'linkler',
    label: 'Ana Səhifə Linkləri',
    desc: 'DRIVED, RestoWeb, Caliper, Github və digər əsas link kartları',
    icon: Link2,
  },
  {
    id: 'kartlar',
    label: 'Video və Məlumat Kartları',
    desc: 'Ana səhifədəki yan-yana video linkləri və məlumat kartları',
    icon: Film,
  },
  {
    id: 'magaza',
    label: 'Mağaza Məhsulları',
    desc: 'Saat və məhsul kataloqu, qiymət, endirim faizi və məhsul şəkilləri',
    icon: ShoppingBag,
  },
  {
    id: 'musiqi',
    label: 'Musiqi (Miksteyp)',
    desc: 'Miksteyp siyahısı, treklər və audio parametrləri',
    icon: Music,
  },
  {
    id: 'onizleme',
    label: 'Canlı Önizləmə və Paylaş',
    desc: 'Səhifənin mobil görünüşü və qisaget.az link paylaşımı',
    icon: Smartphone,
  },
];

function parseAdminSearch(search: string): AdminRouteState {
  const params = new URLSearchParams(search);
  const rawSection = params.get('bolme') as AdminSection | null;
  const section: AdminSection =
    rawSection && VALID_SECTIONS.has(rawSection) ? rawSection : 'profil';
  const menuOpen = params.get('menu') === '1';
  return { section, menuOpen };
}

function buildAdminUrl(section: AdminSection, menuOpen: boolean): string {
  const params = new URLSearchParams();
  if (section !== 'profil') {
    params.set('bolme', section);
  }
  if (menuOpen) {
    params.set('menu', '1');
  }
  const q = params.toString();
  return q ? `/admin?${q}` : '/admin';
}

interface AdminPanelProps {
  onNavigate: (path: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigate }) => {
  const {
    user,
    authReady,
    needsEmailConfirmationForLink,
    authError,
    clearAuthError,
    signInWithGoogle,
    sendEmailLoginLink,
    confirmEmailForPendingLink,
    logout,
  } = useAuth();

  // Sync admin section & hamburger drawer cleanly with History API
  const [adminNav, setAdminNav] = useState<AdminRouteState>(() =>
    typeof window !== 'undefined'
      ? parseAdminSearch(window.location.search)
      : { section: 'profil', menuOpen: false }
  );

  useEffect(() => {
    const sync = () => {
      setAdminNav(parseAdminSearch(window.location.search));
    };
    sync();
    return subscribeToNavigation(sync);
  }, []);

  const activeSection = adminNav.section;
  const isMenuOpen = adminNav.menuOpen;

  // Body scroll lock for the slide-over hamburger drawer
  useBodyScrollLock(isMenuOpen);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        goBackOrReplace(buildAdminUrl(activeSection, false));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen, activeSection]);

  // Per-section vertical scroll tracking & restoration inside /admin
  const sectionScrollKey = `admin:${activeSection}`;
  const prevSectionScrollKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const prev = prevSectionScrollKeyRef.current;
    if (prev !== sectionScrollKey) {
      prevSectionScrollKeyRef.current = sectionScrollKey;
      const saved = getSavedSectionScroll(sectionScrollKey);
      requestAnimationFrame(() => {
        if (!isBodyScrollLocked()) {
          restoreScrollY(saved ?? 0);
        }
      });
    }

    const onScroll = () => {
      if (!isBodyScrollLocked()) {
        saveSectionScroll(sectionScrollKey);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [sectionScrollKey]);

  const openMenuDrawer = () => {
    if (isMenuOpen) return;
    pushAppUrl(buildAdminUrl(activeSection, true), sectionScrollKey);
  };

  const closeMenuDrawer = () => {
    if (!isMenuOpen) return;
    goBackOrReplace(buildAdminUrl(activeSection, false));
  };

  const selectSectionFromMenu = (nextSection: AdminSection) => {
    if (nextSection === activeSection) {
      closeMenuDrawer();
      return;
    }
    // Replace drawer URL with target section so Back steps cleanly to previous section
    if (isMenuOpen) {
      replaceAppUrl(buildAdminUrl(nextSection, false));
    } else {
      pushAppUrl(buildAdminUrl(nextSection, false), sectionScrollKey);
    }
  };

  // Auth form states
  const [loginEmail, setLoginEmail] = useState('');
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const [confirmEmailInput, setConfirmEmailInput] = useState('');
  const [authBusy, setAuthBusy] = useState(false);

  // Firestore user -> profile state
  const [userDoc, setUserDoc] = useState<UserAccountDoc | null | undefined>(undefined);
  const [targetUsername, setTargetUsername] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProfileData | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Shared copy link state
  const [copiedShare, setCopiedShare] = useState(false);

  const isDirtyRef = useRef(false);
  isDirtyRef.current = isDirty;
  const autoProvisionUidRef = useRef<string | null>(null);

  const isAdminAccount = Boolean(
    user &&
      (isPlatformAdminEmail(user.email, user.emailVerified) ||
        user.email?.trim().toLowerCase() === 'qisaget.na@gmail.com')
  );

  // Subscribe to users/{uid} (or immediately select na.mexman for the admin Gmail)
  useEffect(() => {
    if (!authReady || !user) {
      setUserDoc(undefined);
      setTargetUsername(null);
      setDraft(null);
      autoProvisionUidRef.current = null;
      return;
    }

    if (isAdminAccount) {
      setUserDoc(null);
      setTargetUsername('na.mexman');
      return;
    }

    const unsub = subscribeToUserAccount(
      user.uid,
      (docData) => {
        setUserDoc(docData);
        if (docData?.username) {
          setTargetUsername(docData.username);
        } else {
          setTargetUsername(null);
        }
      },
      (err) => {
        setUserDoc(null);
        setStatusBanner({
          type: 'error',
          text: getFirebaseErrorMessageAz(err),
        });
      }
    );

    return () => unsub();
  }, [authReady, user, isAdminAccount]);

  // Subscribe to profiles/{targetUsername} and auto-open Admin Panel for the admin Gmail
  useEffect(() => {
    if (!targetUsername || !user) {
      setLoadingProfile(false);
      return;
    }

    setLoadingProfile(true);
    const unsub = subscribeToProfile(
      targetUsername,
      (remoteProfile) => {
        setLoadingProfile(false);
        setDraft((prev) => {
          if (prev && isDirtyRef.current) return prev;
          return remoteProfile;
        });
      },
      () => {
        setLoadingProfile(false);
        if (isAdminAccount && targetUsername === 'na.mexman') {
          const starter = createNaMexmanTemplateProfile(user.uid);
          setDraft((prev) => prev ?? starter);

          if (autoProvisionUidRef.current !== user.uid) {
            autoProvisionUidRef.current = user.uid;
            claimUsernameAndCreateProfile({
              uid: user.uid,
              email: user.email || 'qisaget.na@gmail.com',
              username: 'na.mexman',
              profile: starter,
            }).catch((err) => {
              console.warn('Profil avtomatik bazaya yazılarkən xəta:', err);
            });
          }
        } else {
          setDraft(null);
        }
      },
      (err) => {
        setLoadingProfile(false);
        if (isAdminAccount && targetUsername === 'na.mexman') {
          const starter = createNaMexmanTemplateProfile(user.uid);
          setDraft((prev) => prev ?? starter);
        }
        setStatusBanner({
          type: 'error',
          text: getFirebaseErrorMessageAz(err),
        });
      }
    );

    return () => unsub();
  }, [targetUsername, user, isAdminAccount]);

  const updateDraft = (updater: (prev: ProfileData) => ProfileData) => {
    setDraft((prev) => {
      if (!prev) return prev;
      setIsDirty(true);
      return updater(prev);
    });
  };

  const handleSave = async () => {
    if (!draft || !user) return;
    setSaving(true);
    setStatusBanner(null);
    try {
      await saveProfileChanges(
        draft.username,
        draft.ownerUid || user.uid,
        draft
      );
      setIsDirty(false);
      setStatusBanner({
        type: 'success',
        text: 'Bütün dəyişikliklər Firebase-də yadda saxlanıldı.',
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: getFirebaseErrorMessageAz(err),
      });
    } finally {
      setSaving(false);
    }
  };


  const handleShareProfile = async () => {
    if (!draft) return;
    const shareUrl = `https://qisaget.az/${draft.username}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${draft.displayName} - QısaGet`,
          text: draft.bio || `${draft.displayName} profili`,
          url: shareUrl,
        });
        return;
      }
    } catch {
      // User cancelled native share or unavailable; fall through to clipboard copy
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      setStatusBanner({
        type: 'info',
        text: `Paylaşım linki: ${shareUrl}`,
      });
    }
  };

  const activeSectionMeta = useMemo(
    () => SECTION_META.find((s) => s.id === activeSection) || SECTION_META[0],
    [activeSection]
  );

  // Move helper for ordered arrays
  function moveArrayItem<T>(arr: T[], index: number, dir: -1 | 1): T[] {
    const nextIdx = index + dir;
    if (nextIdx < 0 || nextIdx >= arr.length) return arr;
    const copy = [...arr];
    const [item] = copy.splice(index, 1);
    copy.splice(nextIdx, 0, item);
    return copy;
  }

  // Loading auth state
  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#a5d1f8] flex items-center justify-center p-6">
        <div className="bg-white border-2 border-black rounded-[28px] brutal-shadow p-8 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#12365c]" />
          <p className="text-sm font-bold text-black">Yoxlanılır...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated view -> Login required
  if (!user) {
    return (
      <div className="min-h-screen bg-[#a5d1f8] text-black flex flex-col">
        {/* Clean top bar: Qisaget */}
        <header className="w-full bg-white border-b-2 border-black px-5 sm:px-8 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <QLogo size={24} strokeWidth={9} />
            <span className="text-xl font-black tracking-tight text-black">Qisaget</span>
          </button>

          <button
            type="button"
            onClick={() => goBackOrReplace('/')}
            className="min-h-[44px] px-4 py-2 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Sayta Qayıt</span>
          </button>
        </header>

        <main className="flex-1 flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-md bg-white border-2 border-black rounded-[28px] brutal-shadow p-7 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#a5d1f8] border-2 border-black flex items-center justify-center brutal-shadow-sm">
                <QLogo size={30} strokeWidth={9} />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-black">Admin Girişi</h1>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Profil, linklər, videolar və mağaza məhsullarını idarə etmək üçün daxil olun.
              </p>
            </div>

            {authError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border-2 border-red-300 text-xs font-semibold text-red-800">
                {authError}
              </div>
            )}

            {needsEmailConfirmationForLink ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setAuthBusy(true);
                  try {
                    await confirmEmailForPendingLink(confirmEmailInput);
                  } finally {
                    setAuthBusy(false);
                  }
                }}
                className="space-y-4"
              >
                <p className="text-xs font-semibold text-neutral-700">
                  Giriş linkini tamamlamaq üçün e-poçt ünvanınızı təsdiqləyin:
                </p>
                <input
                  type="email"
                  required
                  value={confirmEmailInput}
                  onChange={(e) => setConfirmEmailInput(e.target.value)}
                  placeholder="qisaget.na@gmail.com"
                  className="w-full min-h-[46px] px-4 py-2.5 border-2 border-black rounded-xl text-sm font-medium focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={authBusy}
                  className="w-full min-h-[48px] bg-black text-white rounded-xl font-bold text-sm hover:bg-neutral-800 cursor-pointer"
                >
                  {authBusy ? 'Yoxlanılır...' : 'Girişi Təsdiqlə'}
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                <button
                  type="button"
                  disabled={authBusy}
                  onClick={async () => {
                    clearAuthError();
                    setAuthBusy(true);
                    try {
                      await signInWithGoogle();
                    } finally {
                      setAuthBusy(false);
                    }
                  }}
                  className="w-full min-h-[50px] px-5 py-3 bg-white hover:bg-neutral-50 border-2 border-black rounded-2xl brutal-shadow-sm font-bold text-sm flex items-center justify-center gap-3 transition-transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                    />
                  </svg>
                  <span>Google ilə Daxil Ol</span>
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-black/15 w-full" />
                  <span className="bg-white px-3 text-xs font-semibold text-neutral-500">və ya</span>
                  <div className="border-t border-black/15 w-full" />
                </div>

                {emailLinkSent ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-xs font-semibold text-emerald-900 space-y-2">
                    <p>Giriş linki <b>{loginEmail}</b> ünvanına göndərildi.</p>
                    <p className="text-emerald-700">E-poçtunuzu açıb linkə klikləyin.</p>
                  </div>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      clearAuthError();
                      setAuthBusy(true);
                      try {
                        await sendEmailLoginLink(loginEmail);
                        setEmailLinkSent(true);
                      } catch {
                        // Error handled in AuthContext
                      } finally {
                        setAuthBusy(false);
                      }
                    }}
                    className="space-y-3"
                  >
                    <label className="block text-xs font-bold text-neutral-700">
                      E-poçt linki ilə daxil ol
                    </label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="adiniz@gmail.com"
                      className="w-full min-h-[46px] px-4 py-2.5 bg-neutral-50 border-2 border-black rounded-xl text-sm font-medium focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={authBusy}
                      className="w-full min-h-[48px] px-5 py-3 bg-[#12365c] hover:bg-[#0e2a48] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Mail className="w-4 h-4" />
                      <span>E-poçta Giriş Linki Göndər</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Waiting for initial profile lookup
  if ((userDoc === undefined && !isAdminAccount) || loadingProfile) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-6">
        <div className="bg-white border-2 border-black rounded-[28px] brutal-shadow p-8 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#12365c]" />
          <p className="text-sm font-bold text-black">Admin paneli açılır...</p>
        </div>
      </div>
    );
  }

  // Only reached if signed in with a non-admin Gmail that has no profile
  if (!draft) {
    return (
      <div className="min-h-screen bg-[#a5d1f8] text-black flex flex-col">
        <header className="w-full bg-white border-b-2 border-black px-5 sm:px-8 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <QLogo size={24} strokeWidth={9} />
            <span className="text-xl font-black tracking-tight text-black">Qisaget</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="min-h-[44px] px-4 py-2 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-full text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Sayta Qayıt</span>
          </button>
        </header>

        <main className="flex-1 flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-md bg-white border-2 border-black rounded-[28px] brutal-shadow p-7 sm:p-8 text-center space-y-5">
            <h1 className="text-xl font-black text-black">Admin Hesabı Tələb Olunur</h1>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Hazırda <span className="font-bold text-black">{user.email}</span> hesabı ilə daxil
              olmusunuz. Admin panelini açmaq üçün əsas admin Gmail hesabı ilə daxil olun.
            </p>
            <button
              type="button"
              onClick={() => logout()}
              className="w-full min-h-[48px] px-5 py-3 bg-[#12365c] hover:bg-[#0d2a48] text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Başqa Hesabla Daxil Ol</span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f6fa] text-black flex flex-col">
      {/* TOP BAR: Qisaget (left) + Yadda Saxla & 3 Parallel Lines Hamburger (far right) */}
      <header className="sticky top-0 z-30 w-full bg-white border-b-2 border-black px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0"
          title="Profilə qayıt"
        >
          <QLogo size={24} strokeWidth={9} />
          <span className="text-xl sm:text-[22px] font-black tracking-tight text-black">
            Qisaget
          </span>
        </button>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`min-h-[42px] px-4 sm:px-5 py-2 rounded-full border-2 border-black text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              isDirty
                ? 'bg-[#12365c] text-white hover:bg-[#0e2b4b] brutal-shadow-xs'
                : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saxlanır...' : isDirty ? 'Yadda Saxla*' : 'Yadda Saxla'}</span>
          </button>

          {/* 3 Parallel Horizontal Lines Menu Button (≡) */}
          <button
            type="button"
            onClick={openMenuDrawer}
            aria-label="Bölmələr menyusu"
            aria-expanded={isMenuOpen}
            className="w-11 h-11 rounded-xl bg-neutral-100 hover:bg-neutral-200 border-2 border-black flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <Menu className="w-6 h-6 text-black" strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* SLIDE-OVER MENU DRAWER (opened by the 3 parallel lines ≡ button) */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex justify-end overscroll-none animate-in fade-in duration-150"
          onClick={closeMenuDrawer}
        >
          <aside
            data-scroll-container="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm h-full bg-white border-l-2 border-black flex flex-col overflow-y-auto overscroll-contain modal-scrollable-content"
            style={{ overscrollBehavior: 'contain' }}
          >
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b-2 border-black/10 flex items-center justify-between gap-4 shrink-0 bg-[#f8fafc]">
              <div className="flex items-center gap-2.5 min-w-0">
                <QLogo size={22} strokeWidth={9} />
                <div className="min-w-0">
                  <p className="text-base font-black text-black leading-tight truncate">
                    Qisaget İdarəetmə
                  </p>
                  <p className="text-xs font-medium text-neutral-500 truncate mt-0.5">
                    @{draft.username}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeMenuDrawer}
                aria-label="Menyunu bağla"
                className="w-10 h-10 rounded-full bg-white hover:bg-neutral-100 border-2 border-black flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>

            {/* Spaced Navigation Sections */}
            <nav className="flex-1 px-5 py-6 space-y-3.5">
              {SECTION_META.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => selectSectionFromMenu(sec.id)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 cursor-pointer ${
                      isActive
                        ? 'bg-[#12365c] text-white border-black brutal-shadow-xs'
                        : 'bg-white text-black border-black/15 hover:border-black hover:bg-neutral-50'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isActive
                          ? 'bg-white/15 border-white/25 text-white'
                          : 'bg-[#eff6ff] border-black/15 text-[#12365c]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-extrabold leading-snug">{sec.label}</p>
                      <p
                        className={`text-xs mt-1 leading-relaxed ${
                          isActive ? 'text-white/80' : 'text-neutral-500'
                        }`}
                      >
                        {sec.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Drawer Bottom Actions */}
            <div className="px-5 py-5 border-t-2 border-black/10 bg-[#f8fafc] space-y-3 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate('/')}
                className="w-full min-h-[46px] px-4 py-2.5 bg-white hover:bg-neutral-100 border-2 border-black rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Profil Səhifəsinə Bax</span>
              </button>

              <button
                type="button"
                onClick={() => logout()}
                className="w-full min-h-[46px] px-4 py-2.5 bg-red-50 hover:bg-red-100 border-2 border-red-300 text-red-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Hesabdan Çıxış</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* MAIN WORKSPACE */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-7 sm:py-10">
        {/* Section Title Bar + Feedback Banner */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#12365c]">
                İdarəetmə Bölməsi · @{draft.username}
              </p>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black">
                {activeSectionMeta.label}
              </h1>
              <p className="text-sm text-neutral-600">{activeSectionMeta.desc}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleShareProfile}
                className="min-h-[44px] px-4 py-2 bg-white hover:bg-neutral-100 border-2 border-black rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                {copiedShare ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Link Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Linki Paylaş</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/')}
                className="min-h-[44px] px-4 py-2 bg-white hover:bg-neutral-100 border-2 border-black rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Sayta Qayıt</span>
              </button>
            </div>
          </div>

          {statusBanner && (
            <div
              className={`p-4 rounded-2xl border-2 text-xs sm:text-sm font-semibold flex items-center justify-between gap-4 ${
                statusBanner.type === 'error'
                  ? 'bg-red-50 border-red-400 text-red-900'
                  : 'bg-emerald-50 border-emerald-500 text-emerald-900'
              }`}
            >
              <span>{statusBanner.text}</span>
              <button
                type="button"
                onClick={() => setStatusBanner(null)}
                className="p-1 hover:bg-black/5 rounded-lg cursor-pointer"
                aria-label="Bağla"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Content Grid: Generous Editor Area + Live Preview on xl screens */}
        <div
          className={
            activeSection === 'onizleme'
              ? 'max-w-3xl mx-auto'
              : 'grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-8 xl:gap-10 items-start'
          }
        >
          {/* LEFT: ACTIVE SECTION CONTENT (ONLY ONE CLEAN SECTION SHOWN AT A TIME) */}
          <div className="space-y-8 min-w-0">
            {/* 1. PROFIL, TEMA & SOSIAL */}
            {activeSection === 'profil' && (
              <div className="space-y-8">
                {/* Basic Info Card */}
                <section className="bg-white border-2 border-black rounded-[24px] p-6 sm:p-8 space-y-6">
                  <div className="pb-4 border-b border-black/10">
                    <h2 className="text-lg font-black text-black">Əsas Profil Məlumatları</h2>
                    <p className="text-xs text-neutral-500 mt-1">
                      Adınız, təqdimat mətniniz və WhatsApp sifariş nömrəniz
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="block text-xs font-extrabold text-black">
                        Görünən Ad
                      </label>
                      <input
                        type="text"
                        maxLength={80}
                        value={draft.displayName}
                        onChange={(e) =>
                          updateDraft((prev) => ({ ...prev, displayName: e.target.value }))
                        }
                        className="w-full min-h-[46px] px-4 py-2.5 bg-neutral-50 border-2 border-black/20 focus:border-black rounded-xl text-sm font-medium focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-extrabold text-black">
                        WhatsApp Sifariş Nömrəsi
                      </label>
                      <input
                        type="text"
                        maxLength={20}
                        placeholder="994500000000"
                        value={draft.wa}
                        onChange={(e) =>
                          updateDraft((prev) => ({ ...prev, wa: e.target.value }))
                        }
                        className="w-full min-h-[46px] px-4 py-2.5 bg-neutral-50 border-2 border-black/20 focus:border-black rounded-xl text-sm font-mono tabular-nums focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold text-black">
                      Bio / Qısa Məlumat
                    </label>
                    <textarea
                      rows={4}
                      maxLength={400}
                      value={draft.bio}
                      onChange={(e) =>
                        updateDraft((prev) => ({ ...prev, bio: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-neutral-50 border-2 border-black/20 focus:border-black rounded-xl text-sm font-medium leading-relaxed focus:outline-none"
                    />
                  </div>

                  {isPlatformAdminEmail(user.email, user.emailVerified) && (
                    <label className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-50 border border-black/15 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draft.isVerified}
                        onChange={(e) =>
                          updateDraft((prev) => ({ ...prev, isVerified: e.target.checked }))
                        }
                        className="w-5 h-5 accent-[#12365c]"
                      />
                      <div>
                        <span className="block text-sm font-bold text-black">
                          Qırmızı Təsdiq Nişanı (Verified)
                        </span>
                        <span className="block text-xs text-neutral-500">
                          Adın yanında rəsmi QısaGet təsdiq nişanını göstər
                        </span>
                      </div>
                    </label>
                  )}
                </section>

                {/* Theme Selector Card */}
                <section className="bg-white border-2 border-black rounded-[24px] p-6 sm:p-8 space-y-6">
                  <div className="pb-4 border-b border-black/10 flex items-center gap-2.5">
                    <Palette className="w-5 h-5 text-[#12365c]" />
                    <div>
                      <h2 className="text-lg font-black text-black">Tema və Rəng Seçimi</h2>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Səhifənizin əsas fon və düymə rənglərini seçin
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {THEME_OPTIONS.map((t) => {
                      const selected = draft.themeId === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => updateDraft((prev) => ({ ...prev, themeId: t.id }))}
                          className={`p-4 rounded-2xl border-2 text-left flex items-center gap-3.5 transition-all cursor-pointer ${
                            selected
                              ? 'border-black bg-[#eff6ff] brutal-shadow-xs'
                              : 'border-black/15 bg-white hover:border-black/40'
                          }`}
                        >
                          <div
                            className="w-10 h-10 rounded-full border-2 border-black shrink-0"
                            style={{ backgroundColor: t.bg }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-extrabold text-black truncate">{t.name}</p>
                            <p className="text-[11px] font-mono text-neutral-500">{t.bg}</p>
                          </div>
                          {selected && <Check className="w-4 h-4 text-[#12365c] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Social Accounts Card */}
                <section className="bg-white border-2 border-black rounded-[24px] p-6 sm:p-8 space-y-6">
                  <div className="pb-4 border-b border-black/10 flex items-center gap-2.5">
                    <Globe className="w-5 h-5 text-[#12365c]" />
                    <div>
                      <h2 className="text-lg font-black text-black">Sosial Şəbəkə Hesabları</h2>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Boş qoyulan hesablar profil səhifəsində gizlədilir
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {(
                      [
                        ['instagram', 'Instagram URL'],
                        ['whatsapp', 'WhatsApp Birbaşa Link'],
                        ['tiktok', 'TikTok URL'],
                        ['telegram', 'Telegram URL'],
                        ['youtube', 'YouTube URL'],
                        ['facebook', 'Facebook URL'],
                        ['linkedin', 'LinkedIn URL'],
                      ] as const
                    ).map(([key, label]) => (
                      <div key={key} className="space-y-2">
                        <label className="block text-xs font-extrabold text-black">{label}</label>
                        <input
                          type="url"
                          placeholder="https://..."
                          value={draft.socials?.[key] || ''}
                          onChange={(e) =>
                            updateDraft((prev) => ({
                              ...prev,
                              socials: { ...prev.socials, [key]: e.target.value },
                            }))
                          }
                          className="w-full min-h-[46px] px-4 py-2.5 bg-neutral-50 border-2 border-black/20 focus:border-black rounded-xl text-sm font-medium focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* 2. PROFIL FOTOSU */}
            {activeSection === 'foto' && (
              <section className="bg-white border-2 border-black rounded-[24px] p-6 sm:p-8 space-y-7">
                <div className="pb-4 border-b border-black/10 flex items-center gap-2.5">
                  <Camera className="w-5 h-5 text-[#12365c]" />
                  <div>
                    <h2 className="text-lg font-black text-black">Əsas Profil Fotosu</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Cihazdan, kameradan və ya linkdən foto seçin — şəkil avtomatik Storage-a yazılır
                    </p>
                  </div>
                </div>

                {/* Live Hero Framing Box */}
                <div className="max-w-md mx-auto w-full border-2 border-black rounded-2xl overflow-hidden bg-[#a5d1f8] shadow-sm">
                  <div className="h-[260px] w-full relative overflow-hidden">
                    {draft.heroImageUrl ? (
                      <img
                        src={draft.heroImageUrl}
                        alt={draft.displayName}
                        className="w-full h-full object-cover"
                        style={{
                          objectPosition: `center ${draft.heroImageOffsetY ?? 20}%`,
                          transform: `scale(${draft.heroImageScale ?? 1.02})`,
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[#12365c]">
                        Foto seçilməyib
                      </div>
                    )}
                    <div
                      className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(to bottom, rgba(165,209,248,0), rgba(165,209,248,0.95))',
                      }}
                    />
                  </div>
                </div>

                <ImageUploadControl
                  uid={user.uid}
                  folder="avatar"
                  value={draft.heroImageUrl || ''}
                  label="Profil Fotosu Yüklə / Dəyiş"
                  previewAspect="wide"
                  onChange={(url) =>
                    updateDraft((prev) => ({ ...prev, heroImageUrl: url }))
                  }
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2 p-4 rounded-2xl bg-neutral-50 border border-black/15">
                    <div className="flex items-center justify-between text-xs font-extrabold">
                      <span>Şaquli Mövqe (Yuxarı / Aşağı)</span>
                      <span className="font-mono tabular-nums">{draft.heroImageOffsetY ?? 20}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={draft.heroImageOffsetY ?? 20}
                      onChange={(e) =>
                        updateDraft((prev) => ({
                          ...prev,
                          heroImageOffsetY: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-[#12365c]"
                    />
                  </div>

                  <div className="space-y-2 p-4 rounded-2xl bg-neutral-50 border border-black/15">
                    <div className="flex items-center justify-between text-xs font-extrabold">
                      <span>Yaxınlaşdırma (Zoom)</span>
                      <span className="font-mono tabular-nums">
                        {(draft.heroImageScale ?? 1.02).toFixed(2)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={2}
                      step={0.02}
                      value={draft.heroImageScale ?? 1.02}
                      onChange={(e) =>
                        updateDraft((prev) => ({
                          ...prev,
                          heroImageScale: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-[#12365c]"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* 3. ANA SEHIFE LINKLERI */}
            {activeSection === 'linkler' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border-2 border-black rounded-[24px] p-5 sm:p-6">
                  <div>
                    <h2 className="text-lg font-black text-black">
                      Link Kartları ({draft.links.length})
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1">
                      Ana səhifədə görünən kapsul linkləri əlavə edin, sıralayın və ya yeniləyin
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newLink: CustomLink = {
                        id: `link-${Date.now()}`,
                        title: 'Yeni Link',
                        subtitle: 'Qısa açıqlama',
                        url: 'https://qisaget.az',
                        iconType: 'website',
                        clicks: 0,
                      };
                      updateDraft((prev) => ({
                        ...prev,
                        links: [...prev.links, newLink],
                      }));
                    }}
                    className="min-h-[44px] px-5 py-2.5 bg-[#12365c] hover:bg-[#0d2a48] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yeni Link Əlavə Et</span>
                  </button>
                </div>

                {draft.links.length === 0 ? (
                  <div className="bg-white border-2 border-black/20 rounded-[24px] p-10 text-center text-sm text-neutral-500">
                    Hələ link əlavə olunmayıb. Yuxarıdakı düymə ilə ilk linki yaradın.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {draft.links.map((link, idx) => (
                      <div
                        key={link.id}
                        className="bg-white border-2 border-black rounded-[24px] p-6 space-y-5"
                      >
                        <div className="flex items-center justify-between gap-3 pb-4 border-b border-black/10">
                          <span className="text-sm font-black text-[#12365c]">
                            {idx + 1}. {link.title || 'Adsız Link'}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  links: moveArrayItem(prev.links, idx, -1),
                                }))
                              }
                              className="w-9 h-9 rounded-lg border border-black/20 hover:bg-neutral-100 disabled:opacity-35 flex items-center justify-center cursor-pointer"
                              aria-label="Yuxarı qaldır"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === draft.links.length - 1}
                              onClick={() =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  links: moveArrayItem(prev.links, idx, 1),
                                }))
                              }
                              className="w-9 h-9 rounded-lg border border-black/20 hover:bg-neutral-100 disabled:opacity-35 flex items-center justify-center cursor-pointer"
                              aria-label="Aşağı endir"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  links: prev.links.filter((l) => l.id !== link.id),
                                }))
                              }
                              className="w-9 h-9 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center cursor-pointer"
                              aria-label="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="block text-xs font-extrabold text-black">
                              Başlıq
                            </label>
                            <input
                              type="text"
                              maxLength={80}
                              value={link.title}
                              onChange={(e) =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  links: prev.links.map((l) =>
                                    l.id === link.id ? { ...l, title: e.target.value } : l
                                  ),
                                }))
                              }
                              className="w-full min-h-[44px] px-4 py-2 bg-neutral-50 border-2 border-black/20 focus:border-black rounded-xl text-sm font-medium focus:outline-none"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-xs font-extrabold text-black">
                              Alt Başlıq (Açıqlama)
                            </label>
                            <input
                              type="text"
                              maxLength={120}
                              value={link.subtitle || ''}
                              onChange={(e) =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  links: prev.links.map((l) =>
                                    l.id === link.id ? { ...l, subtitle: e.target.value } : l
                                  ),
                                }))
                              }
                              className="w-full min-h-[44px] px-4 py-2 bg-neutral-50 border-2 border-black/20 focus:border-black rounded-xl text-sm font-medium focus:outline-none"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-xs font-extrabold text-black">
                              Keçid Linki (URL)
                            </label>
                            <input
                              type="url"
                              placeholder="https://..."
                              value={link.url}
                              onChange={(e) =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  links: prev.links.map((l) =>
                                    l.id === link.id ? { ...l, url: e.target.value } : l
                                  ),
                                }))
                              }
                              className="w-full min-h-[44px] px-4 py-2 bg-neutral-50 border-2 border-black/20 focus:border-black rounded-xl text-sm font-medium focus:outline-none"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-xs font-extrabold text-black">
                              İkon Növü
                            </label>
                            <select
                              value={link.iconType}
                              onChange={(e) =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  links: prev.links.map((l) =>
                                    l.id === link.id
                                      ? {
                                          ...l,
                                          iconType: e.target.value as CustomLink['iconType'],
                                        }
                                      : l
                                  ),
                                }))
                              }
                              className="w-full min-h-[44px] px-4 py-2 bg-neutral-50 border-2 border-black/20 focus:border-black rounded-xl text-sm font-bold focus:outline-none"
                            >
                              <option value="website">Vebsayt (Qlobus)</option>
                              <option value="github">GitHub</option>
                              <option value="app">Tətbiq</option>
                              <option value="design">Dizayn</option>
                              <option value="custom">Digər</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. VIDEO VE MELUMAT KARTLARI */}
            {activeSection === 'kartlar' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border-2 border-black rounded-[24px] p-5 sm:p-6">
                  <div>
                    <h2 className="text-lg font-black text-black">
                      Video və Məlumat Kartları ({draft.news.length})
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1">
                      Ana səhifədəki yan-yana geniş kartları, YouTube video linklərini və fotolarını idarə edin
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newCard: NewsCard = {
                        id: `news-${Date.now()}`,
                        title: 'Yeni Video / Kart',
                        content: 'Kart haqqında qısa məlumat.',
                        gradient: 'bg-[#12365c]',
                        isWide: true,
                        tag: 'Video',
                        thumbnailUrl: '',
                        videoUrl: '',
                      };
                      updateDraft((prev) => ({
                        ...prev,
                        news: [...prev.news, newCard],
                      }));
                    }}
                    className="min-h-[44px] px-5 py-2.5 bg-[#12365c] hover:bg-[#0d2a48] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yeni Video / Kart Əlavə Et</span>
                  </button>
                </div>

                {draft.news.length === 0 ? (
                  <div className="bg-white border-2 border-black/20 rounded-[24px] p-10 text-center text-sm text-neutral-500">
                    Hazırda video və ya məlumat kartı yoxdur.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {draft.news.map((card, idx) => (
                      <div
                        key={card.id}
                        className="bg-white border-2 border-black rounded-[24px] p-6 space-y-6"
                      >
                        <div className="flex items-center justify-between gap-3 pb-4 border-b border-black/10">
                          <span className="text-sm font-black text-[#12365c]">
                            {idx + 1}. {card.title || 'Adsız Kart'}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  news: moveArrayItem(prev.news, idx, -1),
                                }))
                              }
                              className="w-9 h-9 rounded-lg border border-black/20 hover:bg-neutral-100 disabled:opacity-35 flex items-center justify-center cursor-pointer"
                              aria-label="Yuxarı qaldır"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === draft.news.length - 1}
                              onClick={() =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  news: moveArrayItem(prev.news, idx, 1),
                                }))
                              }
                              className="w-9 h-9 rounded-lg border border-black/20 hover:bg-neutral-100 disabled:opacity-35 flex items-center justify-center cursor-pointer"
                              aria-label="Aşağı endir"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  news: prev.news.filter((c) => c.id !== card.id),
                                }))
                              }
                              className="w-9 h-9 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center cursor-pointer"
                              aria-label="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="block text-xs font-extrabold text-black">
                              Kart Başlığı
                            </label>
                            <input
                              type="text"
                              maxLength={100}
                              value={card.title}
                              onChange={(e) =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  news: prev.news.map((c) =>
                                    c.id === card.id ? { ...c, title: e.target.value } : c
                                  ),
                                }))
                              }
                              className="w-full min-h-[44px] px-4 py-2 bg-neutral-50 border-2 border-black/20 focus:border-black rounded-xl text-sm font-medium focus:outline-none"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-xs font-extrabold text-black">
                              Etiket (Tag)
                            </label>
                            <input
                              type="text"
                              maxLength={40}
                              value={card.tag}
                              onChange={(e) =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  news: prev.news.map((c) =>
                                    c.id === card.id ? { ...c, tag: e.target.value } : c
                                  ),
                                }))
                              }
                              className="w-full min-h-[44px] px-4 py-2 bg-neutral-50 border-2 border-black/20 focus:border-black rounded-xl text-sm font-medium focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-extrabold text-black">
                            Video Linki (YouTube və ya xarici video URL)
                          </label>
                          <input
                            type="url"
                            placeholder="https://youtu.be/..."
                            value={card.videoUrl || ''}
                            onChange={(e) =>
                              updateDraft((prev) => ({
                                ...prev,
                                news: prev.news.map((c) =>
                                  c.id === card.id ? { ...c, videoUrl: e.target.value } : c
                                ),
                              }))
                            }
                            className="w-full min-h-[44px] px-4 py-2 bg-neutral-50 border-2 border-black/20 focus:border-black rounded-xl text-sm font-medium focus:outline-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-extrabold text-black">
                            Açıqlama Mətni
                          </label>
                          <textarea
                            rows={3}
                            maxLength={600}
                            value={card.content}
                            onChange={(e) =>
                              updateDraft((prev) => ({
                                ...prev,
                                news: prev.news.map((c) =>
                                  c.id === card.id ? { ...c, content: e.target.value } : c
                                ),
                              }))
                            }
                            className="w-full px-4 py-2.5 bg-neutral-50 border-2 border-black/20 focus:border-black rounded-xl text-sm font-medium focus:outline-none"
                          />
                        </div>

                        <ImageUploadControl
                          uid={user.uid}
                          folder="news"
                          value={card.thumbnailUrl || ''}
                          label="Kart / Video Önizləmə Fotosu"
                          previewAspect="wide"
                          onChange={(url) =>
                            updateDraft((prev) => ({
                              ...prev,
                              news: prev.news.map((c) =>
                                c.id === card.id ? { ...c, thumbnailUrl: url } : c
                              ),
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. MAGAZA MEHSULLARI */}
            {activeSection === 'magaza' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border-2 border-black rounded-[24px] p-5 sm:p-6">
                  <div>
                    <h2 className="text-lg font-black text-black">
                      Mağaza Məhsulları ({draft.products.length})
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1">
                      Məhsul fotoları, qiymətlər, endirimlər və yaşıl WhatsApp sifariş düyməsi məlumatları
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newProduct: ProductItem = {
                        id: `prod-${Date.now()}`,
                        title: 'YENİ SAAT MODELİ',
                        price: 29,
                        originalPrice: 45,
                        discountPercent: 36,
                        currency: 'AZN',
                        category: 'Saat',
                        description: '360° fırlanan çarx mexanizmi və idman kəməri.',
                        rating: 5.0,
                        badge: 'ENDİRİM 36%',
                        imageUrl: '',
                        colorName: 'Qara',
                      };
                      updateDraft((prev) => ({
                        ...prev,
                        products: [...prev.products, newProduct],
                      }));
                    }}
                    className="min-h-[44px] px-5 py-2.5 bg-[#12365c] hover:bg-[#0d2a48] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yeni Məhsul Əlavə Et</span>
                  </button>
                </div>

                {draft.products.length === 0 ? (
                  <div className="bg-white border-2 border-black/20 rounded-[24px] p-10 text-center text-sm text-neutral-500">
                    Mağazada hələ məhsul yoxdur.
                  </div>
                ) : (
                  <div className="space-y-7">
                    {draft.products.map((prod, idx) => (
                      <div
                        key={prod.id}
                        className="bg-white border-2 border-black rounded-[24px] p-6 space-y-6"
                      >
                        <div className="flex items-center justify-between gap-3 pb-4 border-b border-black/10">
                          <span className="text-sm font-black text-[#12365c]">
                            {idx + 1}. {prod.title || 'Adsız Məhsul'}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  products: moveArrayItem(prev.products, idx, -1),
                                }))
                              }
                              className="w-9 h-9 rounded-lg border border-black/20 hover:bg-neutral-100 disabled:opacity-35 flex items-center justify-center cursor-pointer"
                              aria-label="Yuxarı qaldır"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === draft.products.length - 1}
                              onClick={() =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  products: moveArrayItem(prev.products, idx, 1),
                                }))
                              }
                              className="w-9 h-9 rounded-lg border border-black/20 hover:bg-neutral-100 disabled:opacity-35 flex items-center justify-center cursor-pointer"
                              aria-label="Aşağı endir"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  products: prev.products.filter((p) => p.id !== prod.id),
                                }))
                              }
                              className="w-9 h-9 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center cursor-pointer"
                              aria-label="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <ImageUploadControl
                          uid={user.uid}
                          folder="products"
                          value={prod.imageUrl || ''}
                          label="Məhsul Fotosu"
                          previewAspect="square"
                          onChange={(url) =>
                            updateDraft((prev) => ({
                              ...prev,
                              products: prev.products.map((p) =>
                                p.id === prod.id ? { ...p, imageUrl: url } : p
                              ),
                            }))
                          }
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="block text-xs font-extrabold text-black">
                              Məhsulun Adı
                            </label>
                            <input
                              type="text"
                              maxLength={90}
                              value={prod.title}
                              onChange={(e) =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  products: prev.products.map((p) =>
                                    p.id === prod.id ? { ...p, title: e.target.value } : p
                                  ),
                                }))
                              }
                              className="w-full min-h-[44px] px-4 py-2 bg-neutral-50 border-2 border-black/20 focus:border-black rounded-xl text-sm font-medium focus:outline-none"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-xs font-extrabold text-black">
                              Rəng Adı
                            </label>
                            <input
                              type="text"
                              maxLength={30}
                              placeholder="Məs: Ağ, Göy, Qırmızı"
                              value={prod.colorName || ''}
                              onChange={(e) =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  products: prev.products.map((p) =>
                                    p.id === prod.id ? { ...p, colorName: e.target.value } : p
                                  ),
                                }))
                              }
                              className="w-full min-h-[44px] px-4 py-2 bg-neutral-50 border-2 border-black/20 focus:border-black rounded-xl text-sm font-medium focus:outline-none"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-xs font-extrabold text-black">
                              Satış Qiyməti (AZN)
                            </label>
                            <input
                              type="number"
                              min={0}
                              step="0.5"
                              value={prod.price}
                              onChange={(e) => {
                                const price = Number(e.target.value) || 0;
                                updateDraft((prev) => ({
                                  ...prev,
                                  products: prev.products.map((p) => {
                                    if (p.id !== prod.id) return p;
                                    const orig = p.originalPrice || 0;
                                    const disc =
                                      orig > price
                                        ? Math.round(((orig - price) / orig) * 100)
                                        : 0;
                                    return {
                                      ...p,
                                      price,
                                      discountPercent: disc,
                                      badge: disc > 0 ? `ENDİRİM ${disc}%` : p.badge,
                                    };
                                  }),
                                }));
                              }}
                              className="w-full min-h-[44px] px-4 py-2 bg-neutral-50 border-2 border-black/20 focus:border-black rounded-xl text-sm font-mono tabular-nums focus:outline-none"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-xs font-extrabold text-black">
                              Köhnə Qiymət (AZN)
                            </label>
                            <input
                              type="number"
                              min={0}
                              step="0.5"
                              value={prod.originalPrice ?? ''}
                              onChange={(e) => {
                                const orig = Number(e.target.value) || 0;
                                updateDraft((prev) => ({
                                  ...prev,
                                  products: prev.products.map((p) => {
                                    if (p.id !== prod.id) return p;
                                    const disc =
                                      orig > p.price
                                        ? Math.round(((orig - p.price) / orig) * 100)
                                        : 0;
                                    return {
                                      ...p,
                                      originalPrice: orig > 0 ? orig : undefined,
                                      discountPercent: disc,
                                      badge: disc > 0 ? `ENDİRİM ${disc}%` : undefined,
                                    };
                                  }),
                                }));
                              }}
                              className="w-full min-h-[44px] px-4 py-2 bg-neutral-50 border-2 border-black/20 focus:border-black rounded-xl text-sm font-mono tabular-nums focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-extrabold text-black">
                            Məhsul Təsviri
                          </label>
                          <textarea
                            rows={2}
                            maxLength={400}
                            value={prod.description}
                            onChange={(e) =>
                              updateDraft((prev) => ({
                                ...prev,
                                products: prev.products.map((p) =>
                                  p.id === prod.id ? { ...p, description: e.target.value } : p
                                ),
                              }))
                            }
                            className="w-full px-4 py-2.5 bg-neutral-50 border-2 border-black/20 focus:border-black rounded-xl text-sm font-medium focus:outline-none"
                          />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-neutral-600">
                          <span>
                            Endirim: <b>{prod.discountPercent || 0}%</b>
                          </span>
                          <a
                            href={buildWhatsappOrderUrl(
                              draft.wa,
                              prod.title,
                              prod.colorName,
                              prod.price,
                              prod.currency
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-emerald-700 hover:underline"
                          >
                            WhatsApp Sifariş Linkini Yoxla →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 6. MUSIQI (MIKSTEYP) */}
            {activeSection === 'musiqi' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border-2 border-black rounded-[24px] p-5 sm:p-6">
                  <div>
                    <h2 className="text-lg font-black text-black">
                      Musiqi və Miksteyplər ({draft.music.length})
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1">
                      Ana səhifədəki &quot;Qisaget-in Miksteypi&quot; bölməsini redaktə edin
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const track: MixtapeTrack = {
                        id: `mix-${Date.now()}`,
                        title: 'Yeni Miksteyp',
                        artist: 'Na.Mexman',
                        gradient: 'linear-gradient(135deg,#12365c,#6ea6d8)',
                        duration: '2:40',
                        baseFrequency: 310,
                      };
                      updateDraft((prev) => ({
                        ...prev,
                        music: [...prev.music, track],
                      }));
                    }}
                    className="min-h-[44px] px-5 py-2.5 bg-[#12365c] hover:bg-[#0d2a48] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yeni Trek Əlavə Et</span>
                  </button>
                </div>

                {draft.music.length === 0 ? (
                  <div className="bg-white border-2 border-black/20 rounded-[24px] p-10 text-center text-sm text-neutral-500">
                    Hazırda miksteyp siyahısı boşdur. Trek əlavə edə bilərsiniz.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {draft.music.map((track, idx) => (
                      <div
                        key={track.id}
                        className="bg-white border-2 border-black rounded-[24px] p-6 space-y-5"
                      >
                        <div className="flex items-center justify-between gap-3 pb-4 border-b border-black/10">
                          <span className="text-sm font-black text-[#12365c]">
                            {idx + 1}. {track.title}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateDraft((prev) => ({
                                ...prev,
                                music: prev.music.filter((m) => m.id !== track.id),
                              }))
                            }
                            className="w-9 h-9 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center cursor-pointer"
                            aria-label="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                          <div className="space-y-2">
                            <label className="block text-xs font-extrabold text-black">
                              Trek Adı
                            </label>
                            <input
                              type="text"
                              maxLength={90}
                              value={track.title}
                              onChange={(e) =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  music: prev.music.map((m) =>
                                    m.id === track.id ? { ...m, title: e.target.value } : m
                                  ),
                                }))
                              }
                              className="w-full min-h-[44px] px-4 py-2 bg-neutral-50 border-2 border-black/20 focus:border-black rounded-xl text-sm font-medium focus:outline-none"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-xs font-extrabold text-black">
                              İfaçı
                            </label>
                            <input
                              type="text"
                              maxLength={60}
                              value={track.artist}
                              onChange={(e) =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  music: prev.music.map((m) =>
                                    m.id === track.id ? { ...m, artist: e.target.value } : m
                                  ),
                                }))
                              }
                              className="w-full min-h-[44px] px-4 py-2 bg-neutral-50 border-2 border-black/20 focus:border-black rounded-xl text-sm font-medium focus:outline-none"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-xs font-extrabold text-black">
                              Müddət
                            </label>
                            <input
                              type="text"
                              maxLength={15}
                              value={track.duration}
                              onChange={(e) =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  music: prev.music.map((m) =>
                                    m.id === track.id ? { ...m, duration: e.target.value } : m
                                  ),
                                }))
                              }
                              className="w-full min-h-[44px] px-4 py-2 bg-neutral-50 border-2 border-black/20 focus:border-black rounded-xl text-sm font-mono tabular-nums focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 7. CANLI ONIZLEME VE PAYLAS */}
            {activeSection === 'onizleme' && (
              <div className="space-y-6">
                <div className="bg-white border-2 border-black rounded-[24px] p-6 space-y-4">
                  <h2 className="text-lg font-black text-black">Profil Linkiniz</h2>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 min-h-[46px] px-4 py-2.5 bg-neutral-50 border-2 border-black/20 rounded-xl font-mono text-sm flex items-center truncate">
                      https://qisaget.az/{draft.username}
                    </div>
                    <button
                      type="button"
                      onClick={handleShareProfile}
                      className="min-h-[46px] px-5 py-2.5 bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                      {copiedShare ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Kopyalandı</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Linki Paylaş</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="border-4 border-black rounded-[36px] overflow-hidden shadow-xl bg-white max-w-[440px] mx-auto">
                  <ProfileView profileData={draft} isPreview />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: SIDE LIVE PREVIEW ON DESKTOP (>=1280px) */}
          {activeSection !== 'onizleme' && (
            <aside className="hidden xl:block sticky top-24 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-extrabold text-neutral-700">Canlı Önizləmə</span>
                <span className="text-xs font-mono text-neutral-500">
                  qisaget.az/{draft.username}
                </span>
              </div>
              <div className="border-4 border-black rounded-[32px] overflow-hidden shadow-xl max-h-[760px] overflow-y-auto bg-white">
                <ProfileView profileData={draft} isPreview />
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
};
