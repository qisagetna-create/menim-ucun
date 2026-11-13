import React, { useEffect, useRef, useState } from 'react';
import { X, Palette, Check, Plus, Trash2, Sparkles, RefreshCw } from 'lucide-react';
import { ProfileData, CustomLink } from '../types';
import { THEME_OPTIONS, INITIAL_PROFILE } from '../data/defaults';
import { useBodyScrollLock } from '../lib/useBodyScrollLock';

interface DesignStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: ProfileData;
  onUpdateProfile: (data: ProfileData) => void;
  activeTab?: 'theme' | 'bio' | 'links';
  onTabChange?: (tab: 'theme' | 'bio' | 'links') => void;
}

export const DesignStudioModal: React.FC<DesignStudioModalProps> = ({
  isOpen,
  onClose,
  profileData,
  onUpdateProfile,
  activeTab: controlledTab,
  onTabChange,
}) => {
  const [internalTab, setInternalTab] = useState<'theme' | 'bio' | 'links'>('theme');
  const activeTab = controlledTab ?? internalTab;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tabScrollMapRef = useRef<Record<string, number>>({});

  const setActiveTab = (next: 'theme' | 'bio' | 'links') => {
    if (scrollContainerRef.current) {
      tabScrollMapRef.current[activeTab] = scrollContainerRef.current.scrollTop;
    }
    if (onTabChange) {
      onTabChange(next);
    } else {
      setInternalTab(next);
    }
  };

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTop = tabScrollMapRef.current[activeTab] ?? 0;
  }, [activeTab, isOpen]);

  const [currentThemeId, setCurrentThemeId] = useState(profileData.themeId);
  const [displayName, setDisplayName] = useState(profileData.displayName);
  const [bio, setBio] = useState(profileData.bio);
  const [isVerified, setIsVerified] = useState(profileData.isVerified);
  const [links, setLinks] = useState<CustomLink[]>(profileData.links);

  // New link form
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateProfile({
      ...profileData,
      displayName,
      bio,
      isVerified,
      themeId: currentThemeId,
      links,
    });
    onClose();
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newLinkItem: CustomLink = {
      id: `link-${Date.now()}`,
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || undefined,
      url: newUrl.trim() || '#',
      iconType: 'custom',
      iconText: '★',
      clicks: 0,
    };
    setLinks([...links, newLinkItem]);
    setNewTitle('');
    setNewSubtitle('');
    setNewUrl('');
  };

  const handleDeleteLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id));
  };

  const handleResetDefaults = () => {
    setCurrentThemeId(INITIAL_PROFILE.themeId);
    setDisplayName(INITIAL_PROFILE.displayName);
    setBio(INITIAL_PROFILE.bio);
    setIsVerified(INITIAL_PROFILE.isVerified);
    setLinks(INITIAL_PROFILE.links);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overscroll-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white border-2 border-black rounded-[28px] brutal-shadow p-6 max-h-[90vh] flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center border border-black/20 transition-colors cursor-pointer"
          aria-label="Bağla"
        >
          <X className="w-5 h-5 text-black" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#a5d1f8] border-2 border-black flex items-center justify-center brutal-shadow-sm">
            <Palette className="w-5 h-5 text-black" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-black">Qisaget Dizayn Redaktoru</h3>
            <p className="text-xs text-neutral-500">Profilinizi, rəngləri və linklərinizi fərdiləşdirin</p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex bg-neutral-100 p-1 rounded-xl border border-black/10 mb-4 shrink-0">
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'theme' ? 'bg-white text-black shadow-xs border border-black/10' : 'text-neutral-500'
            }`}
          >
            Rənglər & Tema
          </button>
          <button
            onClick={() => setActiveTab('bio')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'bio' ? 'bg-white text-black shadow-xs border border-black/10' : 'text-neutral-500'
            }`}
          >
            Profil Məlumatı
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'links' ? 'bg-white text-black shadow-xs border border-black/10' : 'text-neutral-500'
            }`}
          >
            Linklər ({links.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div
          ref={scrollContainerRef}
          data-scroll-container="true"
          onScroll={(e) => {
            tabScrollMapRef.current[activeTab] = e.currentTarget.scrollTop;
          }}
          className="flex-1 overflow-y-auto overscroll-contain space-y-4 pr-1 modal-scrollable-content"
          style={{ overscrollBehavior: 'contain' }}
        >
          {activeTab === 'theme' && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-neutral-700">Bir stil və rəng palitrası seçin:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {THEME_OPTIONS.map((theme) => {
                  const isSelected = currentThemeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setCurrentThemeId(theme.id)}
                      className={`p-3 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                        isSelected
                          ? 'border-black bg-neutral-50 brutal-shadow-sm ring-2 ring-black'
                          : 'border-neutral-200 hover:border-black'
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-xl border border-black/30 shrink-0 relative overflow-hidden"
                        style={{ background: theme.bg }}
                      >
                        <div
                          className="absolute bottom-0 right-0 w-5 h-5 rounded-tl-lg border-t border-l border-black/20"
                          style={{ background: theme.toggle }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-black truncate">{theme.name}</p>
                        <p className="text-[10px] text-neutral-500">Əsas: {theme.bg}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-black shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'bio' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Profil Adı</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-black text-xs font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Haqqında (Bio)</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-black text-xs font-medium focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border-2 border-black bg-neutral-50">
                <div>
                  <p className="text-xs font-bold text-black">Qırmızı Təsdiq Nişanı (Verified Tick)</p>
                  <p className="text-[11px] text-neutral-500">Adınızın yanında qırmızı təsdiq nişanını göstərin</p>
                </div>
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="w-5 h-5 accent-black cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'links' && (
            <div className="space-y-4">
              {/* Existing links */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-neutral-700">Mövcud Linklər:</p>
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-2.5 bg-neutral-50 border border-black/20 rounded-xl"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-black truncate">{link.title}</p>
                      {link.subtitle && <p className="text-[10px] text-neutral-500 truncate">{link.subtitle}</p>}
                    </div>
                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add link form */}
              <div className="p-3 bg-neutral-100 rounded-2xl border-2 border-black space-y-2">
                <p className="text-xs font-bold text-black flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  Yeni Link Əlavə Et
                </p>
                <input
                  type="text"
                  placeholder="Başlıq (məs: Mənim Portfolio Saytım)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-black/40 text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="Alt yazı (məs: Yeni layihələr və dizaynlar)"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-black/40 text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="URL (məs: https://misal.az)"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-black/40 text-xs bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="w-full py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Siyahıya Əlavə Et
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="pt-4 mt-2 border-t border-neutral-100 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={handleResetDefaults}
            className="px-3 py-2 text-xs font-semibold text-neutral-600 hover:text-black flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sıfırla
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border-2 border-black rounded-xl text-xs font-bold hover:bg-neutral-100 transition-colors"
            >
              Ləğv et
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-neutral-800 brutal-shadow-sm transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Yadda Saxla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
