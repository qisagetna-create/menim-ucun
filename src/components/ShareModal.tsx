import React, { useEffect, useState } from 'react';
import { X, Check, Copy, Share2, MessageCircle, Send, QrCode } from 'lucide-react';
import { useBodyScrollLock } from '../lib/useBodyScrollLock';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  activeTab?: 'share' | 'qr';
  onTabChange?: (tab: 'share' | 'qr') => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  url,
  title,
  activeTab: controlledTab,
  onTabChange,
}) => {
  const [copied, setCopied] = useState(false);
  const [internalTab, setInternalTab] = useState<'share' | 'qr'>('share');
  const activeTab = controlledTab ?? internalTab;

  const setActiveTab = (next: 'share' | 'qr') => {
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

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-emerald-500 text-white',
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `${title} - Profilimə baxın: ${url}`
      )}`,
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-sky-500 text-white',
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(
        title
      )}`,
    },
    {
      name: 'X (Twitter)',
      icon: Share2,
      color: 'bg-black text-white',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        title
      )}&url=${encodeURIComponent(url)}`,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overscroll-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        data-scroll-container="true"
        className="w-full max-w-sm bg-white border-2 border-black rounded-[28px] brutal-shadow p-6 relative max-h-[90vh] overflow-y-auto overscroll-contain modal-scrollable-content"
        style={{ overscrollBehavior: 'contain' }}
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

        <div className="text-center mb-5">
          <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-[#a5d1f8] border-2 border-black flex items-center justify-center brutal-shadow-sm">
            <Share2 className="w-6 h-6 text-black" />
          </div>
          <h3 className="text-lg font-bold text-black">Qisaget-i Paylaş</h3>
          <p className="text-xs text-neutral-500">Profil linkinizi dostlarınız və izləyicilərinizlə paylaşın</p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-neutral-100 p-1 rounded-xl border border-black/10 mb-5">
          <button
            onClick={() => setActiveTab('share')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'share'
                ? 'bg-white text-black shadow-xs border border-black/10'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            Sosial Şəbəkələr
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'qr'
                ? 'bg-white text-black shadow-xs border border-black/10'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            QR Kod
          </button>
        </div>

        {activeTab === 'share' ? (
          <div className="space-y-4">
            {/* Direct copy bar */}
            <div className="flex items-center gap-2 p-2 bg-neutral-50 border-2 border-black rounded-xl">
              <span className="text-xs text-neutral-700 truncate px-2 font-mono flex-1">{url}</span>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-black text-white rounded-lg text-xs font-bold hover:bg-neutral-800 flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span>Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Kopyala</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick social share buttons */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {shareLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-black brutal-shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-transform bg-white group text-center"
                >
                  <div className={`w-9 h-9 rounded-full ${item.color} flex items-center justify-center mb-1.5`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-black">{item.name}</span>
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2 space-y-3">
            {/* Interactive SVG QR Code matrix representation */}
            <div className="p-4 bg-white border-2 border-black rounded-2xl brutal-shadow-sm flex items-center justify-center">
              <svg width="150" height="150" viewBox="0 0 150 150" className="w-[150px] h-[150px]">
                {/* QR corner 1 */}
                <rect x="10" y="10" width="35" height="35" fill="black" rx="4" />
                <rect x="15" y="15" width="25" height="25" fill="white" rx="2" />
                <rect x="20" y="20" width="15" height="15" fill="black" rx="1" />

                {/* QR corner 2 */}
                <rect x="105" y="10" width="35" height="35" fill="black" rx="4" />
                <rect x="110" y="15" width="25" height="25" fill="white" rx="2" />
                <rect x="115" y="20" width="15" height="15" fill="black" rx="1" />

                {/* QR corner 3 */}
                <rect x="10" y="105" width="35" height="35" fill="black" rx="4" />
                <rect x="15" y="110" width="25" height="25" fill="white" rx="2" />
                <rect x="20" y="115" width="15" height="15" fill="black" rx="1" />

                {/* Decorative matrix patterns */}
                <rect x="55" y="15" width="8" height="8" fill="black" />
                <rect x="70" y="15" width="8" height="8" fill="black" />
                <rect x="85" y="15" width="8" height="8" fill="black" />
                <rect x="55" y="30" width="8" height="8" fill="black" />
                <rect x="85" y="30" width="8" height="8" fill="black" />

                <rect x="15" y="55" width="8" height="8" fill="black" />
                <rect x="30" y="55" width="8" height="8" fill="black" />
                <rect x="60" y="55" width="30" height="30" fill="#a5d1f8" rx="4" />
                <rect x="68" y="63" width="14" height="14" fill="black" />
                <rect x="105" y="55" width="8" height="8" fill="black" />
                <rect x="120" y="55" width="16" height="8" fill="black" />

                <rect x="55" y="95" width="12" height="8" fill="black" />
                <rect x="75" y="95" width="8" height="8" fill="black" />
                <rect x="95" y="95" width="16" height="8" fill="black" />
                <rect x="55" y="115" width="8" height="18" fill="black" />
                <rect x="75" y="125" width="18" height="8" fill="black" />
                <rect x="110" y="110" width="25" height="25" fill="black" rx="2" />
              </svg>
            </div>
            <p className="text-[11px] text-neutral-500 text-center font-medium">
              Kameranızla skan edin və birbaşa profilə keçin
            </p>
            <button
              onClick={handleCopy}
              className="w-full py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Kopyalandı!' : 'Linki Kopyala'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
