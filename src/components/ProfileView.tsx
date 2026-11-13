import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ProfileData } from '../types';
import {
  THEME_OPTIONS,
  FEATURED_LINKERS,
  NEWS_CARDS,
  QISAGET_ABOUT_SECTIONS,
  QISAGET_PRIVACY_SECTIONS,
  QISAGET_TERMS_SECTIONS,
} from '../data/defaults';
import { QLogo } from './QLogo';
import { VerifiedBadge } from './VerifiedBadge';
import { MixtapePlayer } from './MixtapePlayer';
import { ShareModal } from './ShareModal';
import { CardDetailModal, CardModalInfo } from './CardDetailModal';
import { EmailCollectorModal } from './EmailCollectorModal';
import { CartModal, CartItem } from './CartModal';
import { buildWhatsappOrderUrl, sanitizeUrl, sanitizeWhatsappNumber } from '../lib/sanitize';
import {
  getSavedSectionScroll,
  goBackOrReplace,
  pushAppUrl,
  replaceAppUrl,
  restoreScrollY,
  saveSectionScroll,
  subscribeToNavigation,
} from '../lib/navigation';
import { isBodyScrollLocked } from '../lib/useBodyScrollLock';

interface ProfileViewProps {
  profileData: ProfileData;
  onNavigate?: (path: string) => void;
  isPreview?: boolean;
}

type ProfileTab = 'home' | 'shop';

type ProfileOverlayState =
  | { kind: 'product'; id: string }
  | { kind: 'link'; id: string }
  | { kind: 'card'; id: string }
  | { kind: 'music'; id: string }
  | { kind: 'privacy' }
  | { kind: 'terms' }
  | { kind: 'about' }
  | { kind: 'share'; subTab: 'share' | 'qr' }
  | { kind: 'cart' }
  | { kind: 'email' };

interface ProfileRouteViewState {
  tab: ProfileTab;
  overlay: ProfileOverlayState | null;
}

function parseProfileSearch(search: string): ProfileRouteViewState {
  const params = new URLSearchParams(search);
  const bolme = params.get('bolme');
  const tab: ProfileTab = bolme === 'magaza' ? 'shop' : 'home';
  const alt = params.get('alt');

  const mehsulId = params.get('mehsul');
  if (mehsulId) {
    return { tab, overlay: { kind: 'product', id: mehsulId } };
  }

  const linkId = params.get('link');
  if (linkId) {
    return { tab, overlay: { kind: 'link', id: linkId } };
  }

  const kartId = params.get('kart');
  if (kartId) {
    return { tab, overlay: { kind: 'card', id: kartId } };
  }

  const musiqiId = params.get('musiqi');
  if (musiqiId) {
    return { tab, overlay: { kind: 'music', id: musiqiId } };
  }

  const pencere = params.get('pencere');
  switch (pencere) {
    case 'mexfilik':
      return { tab, overlay: { kind: 'privacy' } };
    case 'sertler':
      return { tab, overlay: { kind: 'terms' } };
    case 'qisaget-haqqinda':
      return { tab, overlay: { kind: 'about' } };
    case 'paylas':
      return { tab, overlay: { kind: 'share', subTab: alt === 'qr' ? 'qr' : 'share' } };
    case 'sebet':
      return { tab, overlay: { kind: 'cart' } };
    case 'abune':
      return { tab, overlay: { kind: 'email' } };
    default:
      return { tab, overlay: null };
  }
}

function buildProfileUrl(
  pathname: string,
  tab: ProfileTab,
  overlay: ProfileOverlayState | null
): string {
  const cleanPath = pathname || '/';
  const params = new URLSearchParams();
  if (tab === 'shop') {
    params.set('bolme', 'magaza');
  }

  if (overlay) {
    switch (overlay.kind) {
      case 'product':
        params.set('mehsul', overlay.id);
        break;
      case 'link':
        params.set('link', overlay.id);
        break;
      case 'card':
        params.set('kart', overlay.id);
        break;
      case 'music':
        params.set('musiqi', overlay.id);
        break;
      case 'privacy':
        params.set('pencere', 'mexfilik');
        break;
      case 'terms':
        params.set('pencere', 'sertler');
        break;
      case 'about':
        params.set('pencere', 'qisaget-haqqinda');
        break;
      case 'share':
        params.set('pencere', 'paylas');
        if (overlay.subTab === 'qr') params.set('alt', 'qr');
        break;
      case 'cart':
        params.set('pencere', 'sebet');
        break;
      case 'email':
        params.set('pencere', 'abune');
        break;
    }
  }

  const query = params.toString();
  return query ? `${cleanPath}?${query}` : cleanPath;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return `rgba(165, 209, 248, ${alpha})`;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profileData,
  onNavigate,
  isPreview = false,
}) => {
  // Preview mode keeps isolated local state; live mode syncs 1:1 with Browser History API
  const [previewState, setPreviewState] = useState<ProfileRouteViewState>({
    tab: 'home',
    overlay: null,
  });
  const [liveState, setLiveState] = useState<ProfileRouteViewState>(() =>
    typeof window !== 'undefined' && !isPreview
      ? parseProfileSearch(window.location.search)
      : { tab: 'home', overlay: null }
  );

  useEffect(() => {
    if (isPreview) return;
    const syncFromUrl = () => {
      setLiveState(parseProfileSearch(window.location.search));
    };
    syncFromUrl();
    return subscribeToNavigation(syncFromUrl);
  }, [isPreview]);

  const viewState = isPreview ? previewState : liveState;
  const activeTab = viewState.tab;
  const activeOverlay = viewState.overlay;

  // Per-tab vertical scroll tracking & restoration
  const currentPathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const tabSectionKey = `profile:${currentPathname}:${activeTab}`;
  const prevTabSectionKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (isPreview) return;

    const prevKey = prevTabSectionKeyRef.current;
    if (prevKey === null) {
      prevTabSectionKeyRef.current = tabSectionKey;
      const saved = getSavedSectionScroll(tabSectionKey);
      requestAnimationFrame(() => {
        if (!isBodyScrollLocked()) {
          restoreScrollY(saved ?? 0);
        }
      });
    } else if (prevKey !== tabSectionKey) {
      prevTabSectionKeyRef.current = tabSectionKey;
      const saved = getSavedSectionScroll(tabSectionKey);
      if (saved !== undefined) {
        requestAnimationFrame(() => {
          if (!isBodyScrollLocked()) {
            restoreScrollY(saved);
          }
        });
      }
    }

    const onScroll = () => {
      if (!isBodyScrollLocked()) {
        saveSectionScroll(tabSectionKey);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isPreview, tabSectionKey]);

  const switchTab = (nextTab: ProfileTab) => {
    if (nextTab === activeTab) return;
    if (isPreview) {
      setPreviewState((prev) => ({ ...prev, tab: nextTab }));
      return;
    }
    const nextUrl = buildProfileUrl(window.location.pathname, nextTab, null);
    pushAppUrl(nextUrl, tabSectionKey);
  };

  const openOverlay = (nextOverlay: ProfileOverlayState) => {
    if (isPreview) {
      setPreviewState((prev) => ({ ...prev, overlay: nextOverlay }));
      return;
    }
    const nextUrl = buildProfileUrl(window.location.pathname, activeTab, nextOverlay);
    pushAppUrl(nextUrl, tabSectionKey);
  };

  const updateOverlaySubTab = (nextOverlay: ProfileOverlayState) => {
    if (isPreview) {
      setPreviewState((prev) => ({ ...prev, overlay: nextOverlay }));
      return;
    }
    const nextUrl = buildProfileUrl(window.location.pathname, activeTab, nextOverlay);
    replaceAppUrl(nextUrl);
  };

  const closeOverlay = () => {
    if (isPreview) {
      setPreviewState((prev) => ({ ...prev, overlay: null }));
      return;
    }
    const fallbackUrl = buildProfileUrl(window.location.pathname, activeTab, null);
    goBackOrReplace(fallbackUrl);
  };

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);

  // Current theme
  const activeTheme =
    THEME_OPTIONS.find((t) => t.id === profileData.themeId) || THEME_OPTIONS[0];
  const isDarkTheme = activeTheme.id === 'dark-obsidian';
  const primaryTextClass = isDarkTheme ? 'text-white' : 'text-black';
  const secondaryTextClass = isDarkTheme ? 'text-neutral-300' : 'text-neutral-800';
  const mutedTextClass = isDarkTheme ? 'text-neutral-300' : 'text-neutral-700';

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const displayedProducts = profileData.products || [];
  const displayedMixtapes = profileData.music || [];
  const displayedNews = profileData.news || [];

  const whatsappDirectHref =
    sanitizeUrl(profileData.socials?.whatsapp || '') ||
    (sanitizeWhatsappNumber(profileData.wa) ? `https://wa.me/${sanitizeWhatsappNumber(profileData.wa)}` : '');

  const instagramHref = sanitizeUrl(profileData.socials?.instagram || '');
  const tiktokHref = sanitizeUrl(profileData.socials?.tiktok || '');
  const telegramHref = sanitizeUrl(profileData.socials?.telegram || '');
  const youtubeHref = sanitizeUrl(profileData.socials?.youtube || '');
  const facebookHref = sanitizeUrl(profileData.socials?.facebook || '');
  const linkedinHref = sanitizeUrl(profileData.socials?.linkedin || '');

  const openPrivacyFullSection = () => openOverlay({ kind: 'privacy' });
  const openTermsFullSection = () => openOverlay({ kind: 'terms' });
  const openAboutFullSection = () => openOverlay({ kind: 'about' });

  const resolvedCardDetail: CardModalInfo | null = useMemo(() => {
    if (!activeOverlay) return null;

    if (activeOverlay.kind === 'privacy') {
      return {
        title: 'Məxfilik Siyasəti',
        subtitle: 'QısaGet Platforması · Son yenilənmə: 2026',
        sections: QISAGET_PRIVACY_SECTIONS,
        actionLabel: 'Bağla',
      };
    }

    if (activeOverlay.kind === 'terms') {
      return {
        title: 'İstifadə Şərtləri',
        subtitle: 'QısaGet Platforması · Son yenilənmə: 2026',
        sections: QISAGET_TERMS_SECTIONS,
        actionLabel: 'Bağla',
      };
    }

    if (activeOverlay.kind === 'about') {
      return {
        title: 'Qısaget Haqqında',
        subtitle: 'Qisaget © 2026 · Rəsmi Platforma Bələdçisi',
        sections: QISAGET_ABOUT_SECTIONS,
        actionLabel: 'Instagram-da İzləyin',
        onAction: () =>
          window.open(
            'https://www.instagram.com/qisaget.az/?utm_source=ig_web_button_share_sheet',
            '_blank',
            'noopener,noreferrer'
          ),
      };
    }

    if (activeOverlay.kind === 'product') {
      const product = displayedProducts.find((p) => p.id === activeOverlay.id);
      if (!product) return null;
      const whatsappUrl = buildWhatsappOrderUrl(
        profileData.wa,
        product.title,
        product.colorName,
        product.price,
        product.currency
      );
      return {
        title: product.title,
        subtitle: `${product.colorName ? `${product.colorName} rəng • ` : ''}${product.price} ${product.currency}${product.badge ? ` (${product.badge})` : ''}`,
        description: `${product.description} Qiymət: ${product.price} ${product.currency}${
          product.originalPrice ? ` (Əvvəlki: ${product.originalPrice} ${product.currency})` : ''
        }.`,
        actionLabel: 'WhatsApp ilə Sifariş Et',
        onAction: () => window.open(whatsappUrl, '_blank', 'noopener,noreferrer'),
      };
    }

    if (activeOverlay.kind === 'link') {
      const link = (profileData.links || []).find((l) => l.id === activeOverlay.id);
      if (!link) return null;
      const safeLinkUrl = sanitizeUrl(link.url || '');
      return {
        title: link.title,
        subtitle: link.subtitle,
        description: `${link.title} haqqında ətraflı məlumat və layihə təfərrüatları.`,
        colorClass: safeLinkUrl ? 'bg-neutral-900 text-white' : 'bg-black text-white',
        points: safeLinkUrl
          ? ['Rəsmi layihə', 'Mobil və masaüstü üçün optimizasiya edilib']
          : ['Fərdi layihə', `${profileData.displayName} tərəfindən idarə olunur`],
        actionLabel: safeLinkUrl ? 'Layihəni Aç' : 'Bağla',
        onAction: safeLinkUrl
          ? () => window.open(safeLinkUrl, '_blank', 'noopener,noreferrer')
          : undefined,
      };
    }

    if (activeOverlay.kind === 'card') {
      const card =
        displayedNews.find((c) => c.id === activeOverlay.id) ||
        NEWS_CARDS.find((c) => c.id === activeOverlay.id);
      if (!card) return null;
      const safeVideo = sanitizeUrl(card.videoUrl || '');
      if (
        card.id === 'news-1' ||
        card.title.toLowerCase().includes('haqqında') ||
        card.title.toLowerCase().includes('hakinda')
      ) {
        return {
          title: 'Qısaget Haqqında',
          subtitle: 'Rəsmi Platforma Bələdçisi',
          sections: QISAGET_ABOUT_SECTIONS,
          actionLabel: 'Instagram-da İzləyin',
          onAction: () =>
            window.open(
              'https://www.instagram.com/qisaget.az/?utm_source=ig_web_button_share_sheet',
              '_blank',
              'noopener,noreferrer'
            ),
        };
      }
      if (safeVideo) {
        return {
          title: card.title,
          subtitle: card.tag,
          description: card.content,
          actionLabel: 'Videonu Açın və İzləyin',
          onAction: () => window.open(safeVideo, '_blank', 'noopener,noreferrer'),
        };
      }
      return {
        title: card.title,
        subtitle: card.tag || 'Bələdçi',
        description: card.content,
        actionLabel: 'Instagram-da İzləyin',
        onAction: () =>
          window.open(
            instagramHref ||
              'https://www.instagram.com/qisaget.az/?utm_source=ig_web_button_share_sheet',
            '_blank',
            'noopener,noreferrer'
          ),
      };
    }

    if (activeOverlay.kind === 'music') {
      const track = displayedMixtapes.find((t) => t.id === activeOverlay.id);
      if (!track) return null;
      return {
        title: track.title,
        subtitle: `İfaçı: ${track.artist} · Müddət: ${track.duration}`,
        description:
          'Qisaget Yaradıcı Miksteyp seriyası: işləyərkən, dizayn edərkən və məzmun yaradarkən dinləmək üçün xüsusi lofi aranjeman.',
        gradient: track.gradient,
        points: ['Web Audio API ilə canlı sintez', 'Offline rejimdə işləyir', 'Fokus və yaradıcılıq üçün'],
        actionLabel: 'Pleylisti dinlə',
      };
    }

    return null;
  }, [activeOverlay, displayedMixtapes, displayedNews, displayedProducts, instagramHref, profileData.displayName, profileData.links, profileData.wa]);

  const isShareOpen = activeOverlay?.kind === 'share';
  const isEmailCollectorOpen = activeOverlay?.kind === 'email';
  const isCartOpen = activeOverlay?.kind === 'cart';

  return (
    <div
      className={`${isPreview ? 'min-h-full' : 'min-h-screen py-0 sm:py-8'} transition-colors duration-300`}
      style={{ backgroundColor: activeTheme.side }}
    >
      {/* Phone container */}
      <div
        className={`max-w-[580px] mx-auto ${isPreview ? 'min-h-full rounded-[28px] overflow-hidden' : 'min-h-screen'} relative pb-14 shadow-2xl transition-colors duration-300`}
        style={{ backgroundColor: activeTheme.bg }}
      >
        {/* HERO PHOTO AREA WITH BOTTOM GRADIENT FADE */}
        <div className="h-[390px] sm:h-[430px] w-full relative overflow-hidden select-none group">
          {profileData.heroImageUrl ? (
            <img
              src={profileData.heroImageUrl}
              alt={profileData.displayName}
              className="relative z-0 w-full h-full object-cover transition-all duration-300"
              style={{
                objectPosition: `center ${profileData.heroImageOffsetY ?? 20}%`,
                transform: `scale(${profileData.heroImageScale ?? 1.02})`,
              }}
            />
          ) : (
            <div
              className="relative z-0 w-full h-full"
              style={{
                background: `linear-gradient(to bottom, ${hexToRgba(activeTheme.bg, 0.72)}, ${activeTheme.bg})`,
              }}
            />
          )}

          {/* Bottom gradient fade effect layered ON TOP of the photo */}
          <div
            className="absolute inset-x-0 bottom-0 h-40 pointer-events-none z-10"
            style={{
              background: `linear-gradient(to bottom, ${hexToRgba(activeTheme.bg, 0)} 0%, ${hexToRgba(activeTheme.bg, 0.25)} 30%, ${hexToRgba(activeTheme.bg, 0.75)} 65%, ${hexToRgba(activeTheme.bg, 1)} 100%)`,
            }}
          />

          {/* Top Left Q Logo */}
          {!isPreview && (
            <button
              type="button"
              onClick={() => onNavigate?.('/')}
              className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/85 hover:bg-white backdrop-blur-md transition-all grid place-items-center text-black border border-black/20 shadow-md z-30 cursor-pointer"
              title="QısaGet"
              aria-label="QısaGet Ana Səhifə"
            >
              <QLogo size={22} strokeWidth={9} />
            </button>
          )}
        </div>

        {/* PROFILE HEADER & BIO */}
        <div className="text-center px-4 -mt-2 relative z-20">
          <div className="flex items-center justify-center gap-1.5">
            <h1 className={`text-[22px] font-bold tracking-tight ${primaryTextClass}`}>
              {profileData.displayName}
            </h1>
            {profileData.isVerified && <VerifiedBadge size={23} />}
          </div>
          {profileData.bio && (
            <p className={`text-[15px] font-medium mt-1.5 ${secondaryTextClass}`}>
              {profileData.bio}
            </p>
          )}

          {/* Social Icons Row */}
          <div className={`flex flex-wrap justify-center items-center gap-5 sm:gap-6 my-4 ${primaryTextClass}`}>
            {instagramHref && (
              <a
                href={instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-115 transition-all p-1.5"
                aria-label="Instagram"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <title>Instagram</title>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            )}

            {whatsappDirectHref && (
              <a
                href={whatsappDirectHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-115 transition-all p-1.5"
                aria-label="WhatsApp"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <title>WhatsApp</title>
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </a>
            )}

            {tiktokHref && (
              <a
                href={tiktokHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-115 transition-all p-1.5"
                aria-label="TikTok"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <title>TikTok</title>
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.53a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3 15.67 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.34-6.33V9.08a8.28 8.28 0 0 0 4.91 1.6v-3.45a4.85 4.85 0 0 1-1-.54z" />
                </svg>
              </a>
            )}

            {telegramHref && (
              <a
                href={telegramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-115 transition-all p-1.5"
                aria-label="Telegram"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <title>Telegram</title>
                  <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
                </svg>
              </a>
            )}

            {youtubeHref && (
              <a
                href={youtubeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-115 transition-all p-1.5"
                aria-label="YouTube"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <title>YouTube</title>
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            )}

            {facebookHref && (
              <a
                href={facebookHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-115 transition-all p-1.5"
                aria-label="Facebook"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <title>Facebook</title>
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            )}

            {linkedinHref && (
              <a
                href={linkedinHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-115 transition-all p-1.5"
                aria-label="LinkedIn"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <title>LinkedIn</title>
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* HOME / SHOP SWITCH TOGGLE */}
        <div
          className="flex w-[196px] h-[52px] mx-auto my-6 rounded-[30px] p-1 border-2 border-[#2c5a86] transition-colors"
          style={{ backgroundColor: activeTheme.toggle }}
        >
          <button
            type="button"
            onClick={() => switchTab('home')}
            className={`flex-1 rounded-[26px] font-bold text-[15px] transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-white text-black brutal-shadow-sm'
                : 'text-white hover:text-white/80'
            }`}
          >
            Ev
          </button>
          <button
            type="button"
            onClick={() => switchTab('shop')}
            className={`flex-1 rounded-[26px] font-bold text-[15px] transition-all cursor-pointer flex items-center justify-center ${
              activeTab === 'shop'
                ? 'bg-white text-black brutal-shadow-sm'
                : 'text-white hover:text-white/80'
            }`}
          >
            <span>Mağaza</span>
          </button>
        </div>

        {/* TAB CONTENT: HOME */}
        {activeTab === 'home' ? (
          <div className="space-y-6">
            {/* Links Section */}
            <section className="pt-0 pb-1">
              <h2 className={`text-center text-[16px] sm:text-[17px] font-extrabold tracking-tight mb-3 ${primaryTextClass}`}>
                Gördüyüm İşlər və Maraq Sahəm
              </h2>

              <div className="flex flex-col gap-2.5 sm:gap-3.5 px-4 sm:px-7 w-full mx-auto">
                {(profileData.links || []).map((link) => {
                  const safeLinkUrl = sanitizeUrl(link.url || '');
                  return (
                    <div
                      key={link.id}
                      onClick={() => {
                        if (safeLinkUrl) {
                          window.open(safeLinkUrl, '_blank', 'noopener,noreferrer');
                        } else {
                          openOverlay({ kind: 'link', id: link.id });
                        }
                      }}
                      className="bg-white border-2 border-black rounded-full brutal-shadow-xs sm:brutal-shadow px-3.5 sm:px-5 py-2 sm:py-3 flex items-center justify-between text-black min-h-[54px] sm:min-h-[62px] hover:-translate-y-0.5 sm:hover:-translate-y-1 active:translate-y-0 transition-transform cursor-pointer group"
                    >
                      <div
                        className="w-8.5 h-8.5 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 border border-black/20 sm:-my-1"
                        style={{ backgroundColor: activeTheme.bg }}
                      >
                        {link.iconType === 'github' ? (
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-black" viewBox="0 0 24 24">
                            <title>Github</title>
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                            />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <title>Website</title>
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                          </svg>
                        )}
                      </div>

                      <div className="flex-1 text-center px-2 min-w-0">
                        <b className="block text-[15px] sm:text-[16px] font-bold text-black tracking-tight leading-tight truncate">
                          {link.title}
                        </b>
                        {link.subtitle && (
                          <span className="block text-[11px] sm:text-[12px] text-neutral-600 font-medium truncate leading-tight mt-0.5">
                            {link.subtitle}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openOverlay({ kind: 'link', id: link.id });
                        }}
                        className="text-neutral-400 group-hover:text-black font-bold text-sm sm:text-base px-1 py-1 cursor-pointer"
                        aria-label="Seçimlər"
                      >
                        ⋮
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* News Row (Wide Cards) */}
            {displayedNews.length > 0 && (
              <div className="flex gap-3 sm:gap-4 overflow-x-auto px-5 sm:px-7 pb-2.5 hide-scrollbar snap-x snap-mandatory">
                {displayedNews.map((card) => {
                  const safeVideo = sanitizeUrl(card.videoUrl || '');
                  return (
                    <div
                      key={card.id}
                      onClick={() => openOverlay({ kind: 'card', id: card.id })}
                      className="flex-none basis-[210px] sm:basis-[370px] bg-white border-2 border-black rounded-[18px] sm:rounded-[24px] p-2.5 sm:p-3.5 pb-0 brutal-shadow-xs sm:brutal-shadow overflow-hidden snap-start cursor-pointer transition-transform hover:-translate-y-0.5 sm:hover:-translate-y-1 active:translate-y-0 group"
                    >
                      <div
                        className={`h-[105px] sm:h-[210px] rounded-[10px] sm:rounded-[14px] w-full ${card.gradient || 'bg-[#a5d1f8]'} relative overflow-hidden flex items-center justify-center select-none`}
                      >
                        {card.thumbnailUrl ? (
                          <img
                            src={card.thumbnailUrl}
                            alt={card.title}
                            loading="lazy"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (target.src.includes('maxresdefault.jpg')) {
                                target.src = target.src.replace('maxresdefault.jpg', 'hqdefault.jpg');
                              }
                            }}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <span className="bg-black/30 backdrop-blur-xs px-2.5 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl border border-white/20 text-xs sm:text-sm font-bold text-white">
                            {card.tag}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center gap-1 sm:gap-1.5 py-2 sm:py-3.5 px-1 sm:px-3 text-[13px] sm:text-[15px] font-medium leading-tight sm:leading-[1.25]">
                        <span className="flex-1 text-center font-semibold text-black truncate">
                          {card.title}
                        </span>
                        <span className="text-neutral-500 font-bold text-xs sm:text-base px-1">⋮</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Preserved Hidden Featured Linkers Section */}
            {/* @ts-ignore - Qorunub saxlanılıb */}
            {false && (
              <section className="mt-6">
                <div className="flex gap-4 overflow-x-auto px-7 pb-2.5">
                  {FEATURED_LINKERS.map((creator) => (
                    <div key={creator.id}>{creator.displayName}</div>
                  ))}
                </div>
              </section>
            )}

            {/* SECTION: Qisaget-in Miksteypi 🎵 */}
            {displayedMixtapes.length > 0 && (
              <section className="mt-6">
                <h2 className={`text-center text-[15px] font-bold mb-3.5 ${primaryTextClass}`}>
                  Qisaget-in Miksteypi 🎵
                </h2>
                <MixtapePlayer
                  tracks={displayedMixtapes}
                  onOpenInfo={(track) => openOverlay({ kind: 'music', id: track.id })}
                />
              </section>
            )}

            {/* SECTION: Qisaget Rəsmi Instagram Profili */}
            <section className="mt-7">
              <a
                href="https://www.instagram.com/qisaget.az/?utm_source=ig_web_button_share_sheet"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white border-2 border-black rounded-[28px] brutal-shadow p-6 mx-3.5 sm:mx-6 text-center hover:-translate-y-1 active:translate-y-0 transition-transform cursor-pointer group"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-[#8ac2ff] border-2 border-black flex items-center justify-center brutal-shadow-xs group-hover:scale-105 transition-transform relative">
                  <QLogo size={42} strokeWidth={9} className="text-black" />
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white border border-white shadow-xs">
                    <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"></circle>
                    </svg>
                  </span>
                </div>

                <div className="mt-3.5">
                  <div className="flex items-center justify-center gap-1.5">
                    <h3 className="text-[19px] sm:text-[20px] font-black text-black tracking-tight">
                      qisaget.az
                    </h3>
                  </div>
                  <p className="text-[13px] font-semibold text-neutral-700 mt-0.5">
                    QısaGet • Bütün Linklər Bir Arada
                  </p>
                  <p className="text-[12px] text-neutral-500 mt-1 font-medium">
                    🔥 Bütün hesabların bir toxunuşda · 🤫 Partlayış olacaq
                  </p>
                </div>

                <div className="mt-4.5">
                  <div className="w-full py-3.5 px-6 bg-black group-hover:bg-neutral-800 text-white rounded-full font-bold text-[15px] sm:text-[16px] flex items-center justify-center gap-2 brutal-shadow-xs transition-colors shadow-sm">
                    <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"></circle>
                    </svg>
                    <span>Qisageti İzlə</span>
                  </div>
                </div>
              </a>
            </section>

            <div className="pt-6" />

            {/* Quiet Footer */}
            <div className={`text-center text-[12px] px-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 ${mutedTextClass}`}>
              <button
                type="button"
                onClick={() => !isPreview && openPrivacyFullSection()}
                className="hover:underline cursor-pointer"
              >
                Məxfilik
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => !isPreview && openTermsFullSection()}
                className="hover:underline cursor-pointer"
              >
                Şərtlər
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => !isPreview && openAboutFullSection()}
                className="hover:underline cursor-pointer"
              >
                Qisaget © 2026
              </button>
            </div>
            {!isPreview && (
              <div className="!mt-2.5 flex justify-center">
                <button
                  type="button"
                  onClick={() => onNavigate?.('/admin')}
                  className={`text-[12px] font-medium opacity-75 hover:opacity-100 hover:underline transition-opacity cursor-pointer px-3 py-1 ${mutedTextClass}`}
                >
                  na.mexman
                </button>
              </div>
            )}
          </div>
        ) : (
          /* TAB CONTENT: SHOP / MAĞAZA */
          <div className="px-4 sm:px-6 space-y-4 sm:space-y-5 animate-in fade-in duration-200">
            <div className="text-center pt-1 pb-1">
              <h2 className={`text-[17px] sm:text-[19px] font-extrabold tracking-tight ${primaryTextClass}`}>
                Caliper Saat Kolleksiyası
              </h2>
            </div>

            {displayedProducts && displayedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {displayedProducts.map((product) => {
                  const whatsappUrl = buildWhatsappOrderUrl(
                    profileData.wa,
                    product.title,
                    product.colorName,
                    product.price,
                    product.currency
                  );
                  return (
                    <div
                      key={product.id}
                      className="bg-white border-2 border-black rounded-[24px] brutal-shadow overflow-hidden flex flex-col group transition-all duration-200 hover:-translate-y-1"
                    >
                      {/* Product Image Container */}
                      <div
                        onClick={() => openOverlay({ kind: 'product', id: product.id })}
                        className="relative bg-white cursor-pointer overflow-hidden p-2 flex items-center justify-center border-b border-neutral-100"
                      >
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            loading="lazy"
                            className="w-full h-auto object-contain block select-none transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div
                            className="h-48 w-full rounded-xl flex items-center justify-center text-white font-bold px-3 text-center"
                            style={{ background: product.gradient || 'linear-gradient(135deg,#12365c,#3b76ac)' }}
                          >
                            {product.title}
                          </div>
                        )}
                      </div>

                      {/* Action button: Sifariş */}
                      <div className="p-3 sm:p-3.5 bg-neutral-50/80">
                        <button
                          type="button"
                          onClick={() => window.open(whatsappUrl, '_blank', 'noopener,noreferrer')}
                          className="w-full min-h-[44px] py-2.5 sm:py-3 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-black border-2 border-black rounded-xl text-xs sm:text-[14px] font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                          title="WhatsApp ilə Sifariş"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current shrink-0" viewBox="0 0 24 24">
                            <title>WhatsApp</title>
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                          </svg>
                          <span>Sifariş</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border-2 border-black rounded-[28px] brutal-shadow p-8 text-center my-6">
                <p className="text-sm text-neutral-600">Hazırda aktiv məhsul yoxdur.</p>
              </div>
            )}

            {/* Quiet Footer in Shop */}
            <div className={`text-center text-[12px] px-4 pt-4 pb-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 ${mutedTextClass}`}>
              <span>Rəsmi Zəmanət</span>
              <span>•</span>
              <span>Sürətli Çatdırılma</span>
              <span>•</span>
              <button
                type="button"
                onClick={() => !isPreview && openPrivacyFullSection()}
                className="hover:underline cursor-pointer"
              >
                Məxfilik
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => !isPreview && openTermsFullSection()}
                className="hover:underline cursor-pointer"
              >
                Şərtlər
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => !isPreview && openAboutFullSection()}
                className="hover:underline cursor-pointer"
              >
                Qisaget © 2026
              </button>
            </div>
            {!isPreview && (
              <div className="!mt-1.5 flex justify-center">
                <button
                  type="button"
                  onClick={() => onNavigate?.('/admin')}
                  className={`text-[12px] font-medium opacity-75 hover:opacity-100 hover:underline transition-opacity cursor-pointer px-3 py-1 ${mutedTextClass}`}
                >
                  na.mexman
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALS (disabled during Admin live preview frame) */}
      {!isPreview && (
        <>
          <ShareModal
            isOpen={isShareOpen}
            onClose={closeOverlay}
            url={`https://qisaget.az/${profileData.username}`}
            title={`${profileData.displayName} - Qisaget Bio`}
            activeTab={activeOverlay?.kind === 'share' ? activeOverlay.subTab : 'share'}
            onTabChange={(subTab) => updateOverlaySubTab({ kind: 'share', subTab })}
          />

          <EmailCollectorModal
            isOpen={isEmailCollectorOpen}
            onClose={closeOverlay}
          />

          <CardDetailModal
            info={resolvedCardDetail}
            onClose={closeOverlay}
          />

          <CartModal
            isOpen={isCartOpen}
            onClose={closeOverlay}
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveFromCart}
            onClearCart={() => setCart([])}
          />
        </>
      )}
    </div>
  );
};
