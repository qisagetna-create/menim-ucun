import React, { useEffect, useRef } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { QLogo } from './QLogo';
import { useBodyScrollLock } from '../lib/useBodyScrollLock';

export interface CardModalSection {
  title: string;
  content: string;
}

export interface CardModalInfo {
  title: string;
  subtitle?: string;
  description?: string;
  sections?: CardModalSection[];
  gradient?: string;
  colorClass?: string;
  points?: string[];
  actionLabel?: string;
  onAction?: () => void;
}

interface CardDetailModalProps {
  info: CardModalInfo | null;
  onClose: () => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({ info, onClose }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isOpen = Boolean(info);

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!info) return;
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [info, onClose]);

  if (!info) return null;

  const isFullSection = Boolean(info.sections && info.sections.length > 0);

  if (isFullSection) {
    // Tam bölmə kimi açılan Haqqında / Məxfilik / Şərtlər görünüşü
    return (
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center overscroll-none animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className="w-full max-w-[580px] h-full sm:h-[94vh] bg-white sm:border-2 sm:border-black sm:rounded-[32px] sm:brutal-shadow flex flex-col overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header banner - Göy rəngdə (#12365c), mərkəzində Qısaget loqosu */}
          <div className="h-16 w-full px-5 relative flex items-center justify-center bg-[#12365c] text-white select-none shrink-0 border-b-2 border-black/20">
            <div className="flex items-center justify-center gap-2.5 text-white">
              <span className="font-extrabold text-[23px] sm:text-[25px] tracking-tight">Qısaget</span>
              <QLogo size={25} strokeWidth={9} className="text-white shrink-0" />
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3.5 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/35 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer border border-white/25 shadow-xs"
              aria-label="Bağla"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Sürüşdürülə bilən əsas mətn sahəsi (arxadakı səhifə sürüşmür) */}
          <div
            ref={scrollRef}
            data-scroll-container="true"
            className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-7 py-5 space-y-4 modal-scrollable-content"
            style={{ overscrollBehavior: 'contain' }}
          >
            {/* Başlıq */}
            <div className="pb-1 border-b border-neutral-100">
              <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight leading-tight">
                {info.title}
              </h3>
              {info.subtitle && (
                <p className="text-xs sm:text-sm font-semibold text-neutral-500 mt-1">
                  {info.subtitle}
                </p>
              )}
            </div>

            {/* 4 Mətn Kartı */}
            <div className="space-y-4 pt-1 pb-4">
              {info.sections?.map((section, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-[22px] bg-neutral-50/90 border-2 border-black/10 space-y-2 hover:border-black/20 transition-colors"
                >
                  <h4 className="text-[15px] sm:text-[16px] font-extrabold text-black tracking-tight leading-snug">
                    {section.title}
                  </h4>
                  <p className="text-[13px] sm:text-[13.5px] text-neutral-700 leading-relaxed font-normal">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Alt Hissə: Pinned CTA Düyməsi */}
          <div className="p-4 sm:p-5 bg-white border-t-2 border-black/15 shrink-0 shadow-lg">
            <button
              onClick={() => {
                if (info.onAction) info.onAction();
                onClose();
              }}
              className="w-full py-3.5 sm:py-4 bg-black hover:bg-neutral-800 text-white rounded-full font-bold text-[15px] sm:text-[16px] flex items-center justify-center gap-2.5 brutal-shadow-xs transition-all cursor-pointer shadow-md active:translate-y-0.5"
            >
              {(!info.actionLabel || info.actionLabel.toLowerCase().includes('instagram')) && (
                <svg className="w-5 h-5 fill-none stroke-current stroke-2 shrink-0" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"></circle>
                </svg>
              )}
              <span>{info.actionLabel || 'Instagram-da İzləyin'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Standart yığcam modal
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overscroll-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white border-2 border-black rounded-[28px] brutal-shadow overflow-hidden relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header banner */}
        <div className="h-14 sm:h-16 w-full px-4 relative flex items-center justify-center bg-[#12365c] text-white select-none shrink-0 border-b border-black/20">
          <div className="flex items-center justify-center gap-2 text-white">
            <span className="font-extrabold text-[22px] sm:text-[24px] tracking-tight">Qısaget</span>
            <QLogo size={24} strokeWidth={9} className="text-white shrink-0" />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20"
            aria-label="Bağla"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content body */}
        <div
          ref={scrollRef}
          data-scroll-container="true"
          className="p-5 sm:p-6 space-y-4 overflow-y-auto overscroll-contain modal-scrollable-content"
          style={{ overscrollBehavior: 'contain' }}
        >
          <div>
            <h3 className="text-base sm:text-lg font-black text-black leading-snug" title={info.title}>
              {info.title}
            </h3>
            {info.subtitle && <p className="text-xs text-neutral-500 mt-0.5">{info.subtitle}</p>}
          </div>

          {info.description && (
            <p className="text-sm text-neutral-700 leading-relaxed">{info.description}</p>
          )}

          <div className="pt-2">
            <button
              onClick={() => {
                if (info.onAction) info.onAction();
                onClose();
              }}
              className="w-full py-3.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>{info.actionLabel || 'Videonu Açın və İzləyin'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
