import React, { useState } from 'react';
import {
  Share2,
  Sparkles,
  ExternalLink,
  ShoppingBag,
  Star,
  Check,
  ChevronRight,
  SlidersHorizontal,
  Camera,
} from 'lucide-react';
import { ProfileData, ProductItem, InstagramPost } from '../types';
import { THEME_OPTIONS, NEWS_CARDS, FEATURED_LINKERS, MIXTAPES, MONETIZATION_CARDS, GROWTH_CARDS, INSPIRATION_CARDS, INSTAGRAM_POSTS } from '../data/defaults';
import { QLogo } from './QLogo';
import { InteractiveEyes } from './InteractiveEyes';
import { MixtapePlayer } from './MixtapePlayer';
import { ShareModal } from './ShareModal';
import { CardDetailModal, CardModalInfo } from './CardDetailModal';
import { EmailCollectorModal } from './EmailCollectorModal';
import { DesignStudioModal } from './DesignStudioModal';
import { CartModal, CartItem } from './CartModal';
import { PhotoUploaderModal } from './PhotoUploaderModal';

interface ProfileViewProps {
  profileData: ProfileData;
  onUpdateProfile: (data: ProfileData) => void;
  onNavigateToLanding: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profileData,
  onUpdateProfile,
  onNavigateToLanding,
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'shop'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('Hamısı');

  // Modals state
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDesignStudioOpen, setIsDesignStudioOpen] = useState(false);
  const [isEmailCollectorOpen, setIsEmailCollectorOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cardDetailInfo, setCardDetailInfo] = useState<CardModalInfo | null>(null);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);

  // Current theme
  const activeTheme =
    THEME_OPTIONS.find((t) => t.id === profileData.themeId) || THEME_OPTIONS[0];

  const handleAddToCart = (product: ProductItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setAddedAnimationId(product.id);
    setTimeout(() => setAddedAnimationId(null), 1200);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const categories = ['Hamısı', 'Rəqəmsal', 'Merç', 'Xidmət'];
  const filteredProducts =
    selectedCategory === 'Hamısı'
      ? profileData.products
      : profileData.products.filter((p) => p.category === selectedCategory);

  return (
    <div
      className="min-h-screen py-0 sm:py-8 transition-colors duration-300"
      style={{ backgroundColor: '#6ea6d8' }}
    >
      {/* Phone container */}
      <div
        className="max-w-[580px] mx-auto min-h-screen relative pb-14 shadow-2xl transition-colors duration-300"
        style={{ backgroundColor: '#a5d1f8' }}
      >
        {/* HERO PHOTO AREA WITH BOTTOM GRADIENT FADE (Reference: Kelsey Rose layout) */}
        <div className="h-[390px] sm:h-[430px] w-full relative overflow-hidden rounded-t-[32px] select-none group">
          {profileData.heroImageUrl ? (
            <img
              src={profileData.heroImageUrl}
              alt={profileData.displayName}
              className="w-full h-full object-cover transition-all duration-300"
              style={{
                objectPosition: `center ${profileData.heroImageOffsetY ?? 20}%`,
                transform: `scale(${profileData.heroImageScale ?? 1.08})`,
              }}
            />
          ) : (
            /* Zərif və estetik portret konturu - istifadəçi öz fotonun linkini yerləşdirənədək */
            <div className="w-full h-full bg-gradient-to-b from-[#b8daf8] to-[#a5d1f8] flex items-center justify-center relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-85">
                <svg width="260" height="340" viewBox="0 0 260 340" fill="none" className="translate-y-4">
                  <circle cx="130" cy="110" r="95" fill="white" fillOpacity="0.45" filter="blur(30px)" />
                  <ellipse cx="130" cy="100" rx="42" ry="52" fill="#d49b78" />
                  <path d="M78 100 C75 40, 185 40, 182 100 C175 145, 172 170, 168 185 C160 140, 150 90, 130 90 C110 90, 100 140, 92 185 C88 170, 85 145, 78 100 Z" fill="#2c1d11" />
                  <path d="M112 145 L112 180 C90 195, 60 215, 30 245 L30 340 L230 340 L230 245 C200 215, 170 195, 148 180 L148 145 Z" fill="#e5aa85" />
                  <path d="M70 245 C95 235, 165 235, 190 245 L200 340 L60 340 Z" fill="#1b2434" />
                </svg>
              </div>

              {/* Fotonu daxil et düyməsi */}
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                className="absolute z-20 px-4 py-2.5 bg-white hover:bg-neutral-50 text-black text-xs font-bold rounded-full border-2 border-black brutal-shadow flex items-center gap-2 transition-transform hover:scale-105"
              >
                <Camera className="w-4 h-4 text-[#12365c]" />
                <span>Foto Yerləşdir (Bulud Linki)</span>
              </button>
            </div>
          )}

          {/* Fotonun alt hissəsində arxa fona rəvan keçən gradient fade maskası */}
          <div
            className="absolute inset-x-0 bottom-0 h-36 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, rgba(165,209,248,0) 0%, rgba(165,209,248,0.2) 30%, rgba(165,209,248,0.7) 65%, rgba(165,209,248,1) 100%)',
            }}
          />

          {/* Top Floating Action Button (Sol loqo - gələcək link üçün) */}
          <button
            type="button"
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/80 hover:bg-white backdrop-blur-md transition-all grid place-items-center text-black border border-black/20 shadow-md z-30"
            title="Qisaget"
            aria-label="Loqo"
          >
            <QLogo size={22} strokeWidth={9} />
          </button>

          {/* Fotonu dəyiş / Bulud linki daxil et düyməsi */}
          <button
            type="button"
            onClick={() => setIsPhotoModalOpen(true)}
            className="absolute top-4 right-4 px-3 py-1.5 bg-white/80 hover:bg-white backdrop-blur-md rounded-full text-black text-[11px] font-bold border border-black/20 shadow-md z-30 flex items-center gap-1.5 transition-all opacity-80 hover:opacity-100"
            title="Fotonu dəyiş"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Fotonu Dəyiş</span>
          </button>
        </div>

        {/* PROFILE HEADER & BIO */}
        <div className="text-center px-4 -mt-2">
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-[22px] font-bold text-black tracking-tight">
              {profileData.displayName}
            </h1>
            {profileData.isVerified && (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="shrink-0 drop-shadow-xs"
                role="img"
                aria-label="Təsdiqlənmiş Hesab"
              >
                <title>Təsdiqlənmiş Hesab</title>
                <path
                  d="M10.29 2.29a1.5 1.5 0 0 1 2.12 0l1.08 1.08a1.5 1.5 0 0 0 1.5.39l1.49-.45a1.5 1.5 0 0 1 1.84 1.06l.45 1.49a1.5 1.5 0 0 0 1.06 1.06l1.49.45a1.5 1.5 0 0 1 1.06 1.84l-.45 1.49a1.5 1.5 0 0 0 .39 1.5l1.08 1.08a1.5 1.5 0 0 1 0 2.12l-1.08 1.08a1.5 1.5 0 0 0-.39 1.5l.45 1.49a1.5 1.5 0 0 1-1.06 1.84l-1.49.45a1.5 1.5 0 0 0-1.06 1.06l-.45 1.49a1.5 1.5 0 0 1-1.84 1.06l-1.49-.45a1.5 1.5 0 0 0-1.5.39l-1.08 1.08a1.5 1.5 0 0 1-2.12 0l-1.08-1.08a1.5 1.5 0 0 0-1.5-.39l-1.49.45a1.5 1.5 0 0 1-1.84-1.06l-.45-1.49a1.5 1.5 0 0 0-1.06-1.06l-1.49-.45a1.5 1.5 0 0 1-1.06-1.84l.45-1.49a1.5 1.5 0 0 0-.39-1.5l-1.08-1.08a1.5 1.5 0 0 1 0-2.12l1.08-1.08a1.5 1.5 0 0 0 .39-1.5l-.45-1.49a1.5 1.5 0 0 1 1.06-1.84l1.49-.45a1.5 1.5 0 0 0 1.06-1.06l.45-1.49a1.5 1.5 0 0 1 1.84-1.06l1.49.45a1.5 1.5 0 0 0 1.5-.39l1.08-1.08z"
                  fill="#ef4444"
                />
                <path
                  d="M8.5 12.3l2.5 2.5 4.8-5"
                  stroke="white"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <p className="text-[15px] text-neutral-800 font-medium mt-1.5">{profileData.bio}</p>

          {/* Social Icons (Instagram, WhatsApp, TikTok, Facebook, LinkedIn) */}
          <div className="flex justify-center items-center gap-6 my-4 text-black">
            {/* 1. Instagram */}
            <a
              href={profileData.socials.instagram || 'https://instagram.com/na.mexman'}
              target="_blank"
              rel="noreferrer"
              className="text-neutral-900 hover:text-black hover:scale-115 transition-all p-1"
              aria-label="Instagram"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <title>Instagram</title>
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>

            {/* 2. WhatsApp */}
            <a
              href={profileData.socials.whatsapp || 'https://wa.me/994500000000'}
              target="_blank"
              rel="noreferrer"
              className="text-neutral-900 hover:text-black hover:scale-115 transition-all p-1"
              aria-label="WhatsApp"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <title>WhatsApp</title>
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
            </a>

            {/* 3. TikTok */}
            <a
              href={profileData.socials.tiktok || 'https://tiktok.com/@na.mexman'}
              target="_blank"
              rel="noreferrer"
              className="text-neutral-900 hover:text-black hover:scale-115 transition-all p-1"
              aria-label="TikTok"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <title>TikTok</title>
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.53a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3 15.67 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.34-6.33V9.08a8.28 8.28 0 0 0 4.91 1.6v-3.45a4.85 4.85 0 0 1-1-.54z" />
              </svg>
            </a>

            {/* 4. Facebook */}
            <a
              href={profileData.socials.facebook || 'https://facebook.com/na.mexman'}
              target="_blank"
              rel="noreferrer"
              className="text-neutral-900 hover:text-black hover:scale-115 transition-all p-1"
              aria-label="Facebook"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <title>Facebook</title>
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            {/* 5. LinkedIn */}
            <a
              href={profileData.socials.linkedin || 'https://linkedin.com/in/na-mexman'}
              target="_blank"
              rel="noreferrer"
              className="text-neutral-900 hover:text-black hover:scale-115 transition-all p-1"
              aria-label="LinkedIn"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <title>LinkedIn</title>
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* HOME / SHOP SWITCH TOGGLE */}
        <div
          className="flex w-[196px] h-[52px] mx-auto my-6 rounded-[30px] p-1 border-2 border-[#2c5a86] transition-colors"
          style={{ backgroundColor: activeTheme.toggle }}
        >
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 rounded-[26px] font-bold text-[15px] transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-white text-black brutal-shadow-sm'
                : 'text-white hover:text-white/80'
            }`}
          >
            Ev
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex-1 rounded-[26px] font-bold text-[15px] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'shop'
                ? 'bg-white text-black brutal-shadow-sm'
                : 'text-white hover:text-white/80'
            }`}
          >
            <span>Mağaza</span>
            {totalCartCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>

        {/* TAB CONTENT: HOME */}
        {activeTab === 'home' ? (
          <div className="space-y-6">
            {/* Əsas Linklər (4 Kompakt Eyni Ölçülü Çərçivə) - "Ev" seçiminin düz altına yerləşdirildi */}
            <section className="pt-0 pb-1">
              <h2 className="text-center text-[16px] sm:text-[17px] font-extrabold text-black tracking-tight mb-3">
                Gördüyüm İşlər və Maraq Sahəm
              </h2>

              <div className="flex flex-col gap-2.5 sm:gap-3.5 px-4 sm:px-7 w-full mx-auto">
                {profileData.links.map((link) => (
                  <div
                    key={link.id}
                    onClick={() => {
                      if (link.url.startsWith('http')) {
                        window.open(link.url, '_blank');
                      } else {
                        setCardDetailInfo({
                          title: link.title,
                          subtitle: link.subtitle,
                          description: `${link.title} - ${link.subtitle || ''}`,
                          colorClass: 'bg-black text-white',
                          points: ['Fərdi layihə', 'Na.Mexman tərəfindən idarə olunur', 'Aktiv fəaliyyət'],
                          actionLabel: 'Sayta Keçid Et',
                          onAction: () => window.open(link.url, '_blank'),
                        });
                      }
                    }}
                    className="bg-white border-2 border-black rounded-full brutal-shadow-xs sm:brutal-shadow px-3.5 sm:px-5 py-2 sm:py-3 flex items-center justify-between text-black min-h-[54px] sm:min-h-[62px] hover:-translate-y-0.5 sm:hover:-translate-y-1 active:translate-y-0 transition-transform cursor-pointer group"
                  >
                    {/* Sol Loqo İkonu (Website və ya Github) */}
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

                    {/* Mətnlər - eyni səviyyədə, tək sətir, alt yazı ilə */}
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

                    {/* Sağ tərəf 3 nöqtə */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCardDetailInfo({
                          title: link.title,
                          subtitle: link.subtitle,
                          description: `${link.title} haqqında ətraflı məlumat və layihə təfərrüatları.`,
                          colorClass: 'bg-neutral-900 text-white',
                          points: [
                            'Rəsmi layihə',
                            'Mobil və masaüstü üçün optimizasiya edilib',
                            'Na.Mexman portfeli',
                          ],
                          actionLabel: 'Layihəni Aç',
                          onAction: () => window.open(link.url, '_blank'),
                        });
                      }}
                      className="text-neutral-400 group-hover:text-black font-bold text-sm sm:text-base px-1 py-1"
                      aria-label="Seçimlər"
                    >
                      ⋮
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* News Row (Wide Cards) - Kompüter üçün əvvəlki enli ölçü, mobil üçün kompakt */}
            <div className="flex gap-3 sm:gap-4 overflow-x-auto px-5 sm:px-7 pb-2.5 hide-scrollbar snap-x snap-mandatory">
              {NEWS_CARDS.map((card) => (
                <div
                  key={card.id}
                  onClick={() =>
                    setCardDetailInfo({
                      title: card.title,
                      description: card.content,
                      colorClass: card.gradient,
                      points: [
                        'Saniyələr içində inteqrasiya',
                        'Mobil və masaüstü üçün tam uyğunlaşdırılmış',
                        'Real vaxtda baxış statistikası',
                      ],
                      actionLabel: 'Funksiyanı aktivləşdir',
                      onAction: () => setIsDesignStudioOpen(true),
                    })
                  }
                  className="flex-none basis-[210px] sm:basis-[370px] bg-white border-2 border-black rounded-[18px] sm:rounded-[24px] p-2.5 sm:p-3.5 pb-0 brutal-shadow-xs sm:brutal-shadow overflow-hidden snap-start cursor-pointer transition-transform hover:-translate-y-0.5 sm:hover:-translate-y-1 active:translate-y-0"
                >
                  <div
                    className={`h-[105px] sm:h-[210px] rounded-[10px] sm:rounded-[14px] w-full ${card.gradient} flex items-center justify-center p-3 sm:p-6 text-white text-center font-bold text-sm sm:text-lg select-none`}
                  >
                    <span className="bg-black/30 backdrop-blur-xs px-2.5 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl border border-white/20 text-xs sm:text-sm">
                      {card.tag}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-1 sm:gap-1.5 py-2 sm:py-3.5 px-1 sm:px-3 text-[13px] sm:text-[15px] font-medium leading-tight sm:leading-[1.25]">
                    <span className="flex-1 text-center font-semibold text-black truncate">{card.title}</span>
                    <span className="text-neutral-500 font-bold text-xs sm:text-base px-1">⋮</span>
                  </div>
                </div>
              ))}
            </div>

            {/* SECTION: Seçilmiş Linkerlər (Müvəqqəti gizlədilib) */}
            {/* @ts-ignore - Qorunub saxlanılıb */}
            {false && (
              <section className="mt-6">
                <h2 className="text-center text-[15px] font-bold mb-3.5 text-black">
                  Seçilmiş Linkerlər
                </h2>
                <div className="flex gap-4 overflow-x-auto px-7 pb-2.5 hide-scrollbar snap-x snap-mandatory">
                  {FEATURED_LINKERS.map((creator) => (
                    <div
                      key={creator.id}
                      onClick={() =>
                        setCardDetailInfo({
                          title: creator.displayName,
                          subtitle: creator.handle,
                          description: `${creator.bio}. ${creator.tagline} kimi Qisaget üzərində 100,000+ aktiv izləyiciyə xitab edir.`,
                          colorClass: creator.avatarColor,
                          points: [
                            'Aylıq 45k+ profil ziyarəti',
                            'Təsdiqlənmiş Qisaget Yaradıcısı',
                            'Rəqəmsal mağaza aktivdir',
                          ],
                          actionLabel: 'Profilinə Bax',
                        })
                      }
                      className="flex-none w-[220px] bg-white border-2 border-black rounded-[24px] brutal-shadow overflow-hidden snap-start cursor-pointer transition-transform hover:-translate-y-1 active:translate-y-0"
                    >
                      <div
                        className={`h-[220px] flex flex-col items-center justify-center text-white gap-1.5 text-center p-3 select-none ${creator.avatarColor}`}
                      >
                        <div className="w-[100px] h-[100px] rounded-full bg-neutral-200 border-2 border-white/50 flex items-center justify-center text-3xl font-bold text-black shadow-inner">
                          {creator.displayName.charAt(1) || creator.displayName.charAt(0)}
                        </div>
                        <b className="text-[19px] tracking-tight">{creator.displayName}</b>
                        <small className="text-[13px] opacity-85 font-mono">{creator.handle}</small>
                      </div>
                      <div className="flex justify-between items-center gap-1.5 p-3.5 text-[15px] font-medium leading-[1.25]">
                        <span className="truncate text-black font-semibold">{creator.bio}</span>
                        <span className="text-neutral-500 font-bold text-base px-1">⋮</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SECTION: Qisaget-in Miksteypi 🎵 */}
            <section className="mt-6">
              <h2 className="text-center text-[15px] font-bold mb-3.5 text-black">
                Qisaget-in Miksteypi 🎵
              </h2>
              <MixtapePlayer
                tracks={MIXTAPES}
                onOpenInfo={(track) =>
                  setCardDetailInfo({
                    title: track.title,
                    subtitle: `İfaçı: ${track.artist} · Müddət: ${track.duration}`,
                    description: `Qisaget Yaradıcı Miksteyp seriyası: işləyərkən, dizayn edərkən və məzmun yaradarkən dinləmək üçün xüsusi lofi aranjeman.`,
                    gradient: track.gradient,
                    points: ['Web Audio API ilə canlı sintez', 'Offline rejimdə işləyir', 'Fokus və yaradıcılıq üçün'],
                    actionLabel: 'Pleylisti dinlə',
                  })
                }
              />
            </section>



            {/* SECTION: Instagram feed block - Ölçüsü və rahatlığı artırılmış böyük çərçivə */}
            <section className="mt-7">
              <div className="bg-white border-2 border-black rounded-[28px] brutal-shadow p-5 sm:p-6 mx-3.5 sm:mx-6">
                <div className="flex items-center justify-between mb-3.5 px-1">
                  <div className="text-left">
                    <h3 className="text-[17px] sm:text-[18px] font-bold text-black flex items-center gap-2">
                      <span>Qisaget Instagram-da</span>
                    </h3>
                    <small className="block text-neutral-600 text-[13px] font-medium mt-0.5">
                      ◎ Instagram · 6 yazı
                    </small>
                  </div>
                  <a
                    href={profileData.socials.instagram || 'https://instagram.com/na.mexman'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs sm:text-[13px] font-bold bg-black text-white px-3.5 py-1.5 rounded-full hover:bg-neutral-800 transition-colors shadow-xs"
                  >
                    İzlə
                  </a>
                </div>

                <div className="grid grid-cols-3 rounded-[20px] overflow-hidden gap-2 bg-neutral-100 p-2 border border-neutral-200">
                  {INSTAGRAM_POSTS.slice(0, 6).map((post) => (
                    <div
                      key={post.id}
                      onClick={() =>
                        setCardDetailInfo({
                          title: 'Instagram Yazısı',
                          subtitle: post.timeAgo,
                          description: post.caption,
                          gradient: post.gradient,
                          points: [
                            `❤️ ${post.likes} bəyənmə`,
                            `💬 ${post.comments} rəy`,
                            'Qisaget rəsmi kanalından',
                          ],
                          actionLabel: 'Instagram-da aç',
                          onAction: () => window.open(profileData.socials.instagram, '_blank'),
                        })
                      }
                      className="aspect-square rounded-[14px] cursor-pointer hover:opacity-90 transition-all flex items-end p-2 select-none group shadow-inner relative overflow-hidden"
                      style={{ background: post.gradient }}
                    >
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors" />
                      <span className="relative z-10 text-[11px] text-white font-semibold bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded">
                        ♥ {post.likes}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 text-center">
                  <a
                    href={profileData.socials.instagram || 'https://instagram.com/na.mexman'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-neutral-700 hover:text-black hover:underline"
                  >
                    <span>Instagram profilinə keçin</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            </section>

            {/* Bottom CTA Button */}
            <div className="pt-10 pb-4 text-center">
              <button
                onClick={onNavigateToLanding}
                className="inline-block bg-white text-black border-2 border-black rounded-full py-4 px-8 text-[16px] font-bold brutal-shadow hover:-translate-y-1 active:translate-y-0 transition-transform cursor-pointer"
              >
                Öz Qisaget-ni yarat
              </button>
            </div>

            {/* Quiet Footer */}
            <div className="text-center text-[12px] text-neutral-700 px-4 space-x-2">
              <span>Kuki Seçimləri</span>
              <span>•</span>
              <span>Hesabat</span>
              <span>•</span>
              <span>Məxfilik</span>
              <span>•</span>
              <span>Araşdırın</span>
              <span>•</span>
              <span>Qisaget © 2026</span>
            </div>
          </div>
        ) : (
          /* TAB CONTENT: SHOP / MAĞAZA */
          <div className="px-6 space-y-6 animate-in fade-in duration-200">
            {/* Header info */}
            <div className="bg-white border-2 border-black rounded-[24px] brutal-shadow p-5 text-center">
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                <ShoppingBag className="w-3.5 h-3.5" />
                Rəsmi Mağaza
              </span>
              <h2 className="text-xl font-bold text-black">Qisaget Rəqəmsal Məhsulları</h2>
              <p className="text-xs text-neutral-600 mt-1 max-w-xs mx-auto">
                Böyümənizi sürətləndirən resurslar, dərsliklər və eksklüziv brend aksesuarları.
              </p>

              {/* Category Pills (functional filter controls) */}
              <div className="flex items-center justify-center gap-1.5 mt-4 pt-3 border-t border-neutral-100 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border-2 transition-all ${
                      selectedCategory === cat
                        ? 'border-black bg-black text-white brutal-shadow-sm'
                        : 'border-black/20 bg-neutral-100 text-neutral-700 hover:border-black'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map((product) => {
                const isAdded = addedAnimationId === product.id;
                return (
                  <div
                    key={product.id}
                    className="bg-white border-2 border-black rounded-[24px] brutal-shadow overflow-hidden flex flex-col transition-transform hover:-translate-y-1"
                  >
                    <div
                      className="h-36 w-full p-4 flex flex-col justify-between text-white relative"
                      style={{ background: product.gradient }}
                    >
                      {product.badge && (
                        <span className="self-start px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-bold">
                          {product.badge}
                        </span>
                      )}
                      <div className="flex items-center gap-1 self-end bg-black/40 px-2 py-0.5 rounded-lg text-xs font-semibold">
                        <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                        <span>{product.rating}</span>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                          {product.category}
                        </span>
                        <h4 className="text-sm font-bold text-black mt-0.5 leading-snug">
                          {product.title}
                        </h4>
                        <p className="text-xs text-neutral-600 mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                        <span className="text-base font-extrabold text-black tabular-nums">
                          {product.price} {product.currency}
                        </span>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 border-black transition-all flex items-center gap-1.5 ${
                            isAdded
                              ? 'bg-emerald-500 text-white border-emerald-600'
                              : 'bg-black text-white hover:bg-neutral-800'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Əlavə olundu</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Səbətə at</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Trigger Floating Bar if items exist */}
            {totalCartCount > 0 && (
              <div className="sticky bottom-6 z-20">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="w-full py-4 px-6 bg-black text-white border-2 border-white/20 rounded-full brutal-shadow flex items-center justify-between font-bold text-sm hover:bg-neutral-800 transition-transform active:scale-98"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">
                      {totalCartCount}
                    </span>
                    <span>Səbətə Bax</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>
                      {cart.reduce((acc, i) => acc + i.product.price * i.quantity, 0)} AZN
                    </span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALS */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        url={`https://qisaget.az/${profileData.username}`}
        title={`${profileData.displayName} - Qisaget Bio`}
      />

      <DesignStudioModal
        isOpen={isDesignStudioOpen}
        onClose={() => setIsDesignStudioOpen(false)}
        profileData={profileData}
        onUpdateProfile={onUpdateProfile}
      />

      <EmailCollectorModal
        isOpen={isEmailCollectorOpen}
        onClose={() => setIsEmailCollectorOpen(false)}
      />

      <CardDetailModal
        info={cardDetailInfo}
        onClose={() => setCardDetailInfo(null)}
      />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={() => setCart([])}
      />

      <PhotoUploaderModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        currentImageUrl={profileData.heroImageUrl}
        currentOffsetY={profileData.heroImageOffsetY ?? 20}
        currentScale={profileData.heroImageScale ?? 1.08}
        onSavePhotoSettings={({ imageUrl, offsetY, scale }) => {
          onUpdateProfile({
            ...profileData,
            heroImageUrl: imageUrl,
            heroImageOffsetY: offsetY,
            heroImageScale: scale,
          });
        }}
      />
    </div>
  );
};
