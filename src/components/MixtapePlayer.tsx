import React from 'react';
import { MixtapeTrack } from '../types';
import { sanitizeUrl } from '../lib/sanitize';

interface MixtapePlayerProps {
  tracks: MixtapeTrack[];
  onOpenInfo?: (track: MixtapeTrack) => void;
}

const LEGACY_TITLE_MAP: Record<string, string> = {
  'Qisaget Mixtape (feat. Petie)': 'Mühazirə 1 · PDF',
  'Qisaget Mixtape (feat. Wyatt Ellis)': 'Mühazirə 2 · PDF',
  'Qisaget Mixtape (feat. Owen M)': 'Mühazirə 3 · PDF',
};

export function resolveLectureTitle(title: string): string {
  return LEGACY_TITLE_MAP[title] || title;
}

export const MixtapePlayer: React.FC<MixtapePlayerProps> = ({ tracks, onOpenInfo }) => {
  return (
    <div className="space-y-3">
      {/* Scrollable Lecture PDF Cards with symmetrical left & right wall margin + scroll snap padding */}
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pl-5 sm:pl-7 scroll-px-5 sm:scroll-px-7 pb-2.5 hide-scrollbar snap-x snap-mandatory">
        {tracks.map((track) => {
          const safeCover = track.coverUrl ? sanitizeUrl(track.coverUrl, true) : '';
          const safePdfUrl = track.pdfUrl ? sanitizeUrl(track.pdfUrl, true) : '';
          const displayTitle = resolveLectureTitle(track.title);

          return (
            <div
              key={track.id}
              onClick={() => {
                if (safePdfUrl) {
                  window.open(safePdfUrl, '_blank', 'noopener,noreferrer');
                } else if (onOpenInfo) {
                  onOpenInfo(track);
                }
              }}
              className="flex-none w-[130px] sm:w-[220px] bg-white border-2 border-black rounded-[16px] sm:rounded-[24px] brutal-shadow-xs sm:brutal-shadow overflow-hidden snap-start cursor-pointer transition-transform hover:-translate-y-0.5 sm:hover:-translate-y-1 active:translate-y-0 text-left select-none group"
            >
              <div
                className="h-[95px] sm:h-[180px] w-full relative overflow-hidden"
                style={{ background: track.gradient }}
              >
                {safeCover && (
                  <img
                    src={safeCover}
                    alt={displayTitle}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>

              <div className="flex items-center justify-between p-2 sm:p-3.5 text-[12px] sm:text-[14px] font-medium leading-tight">
                <span className="truncate pr-1 text-black font-semibold">{displayTitle}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenInfo) onOpenInfo(track);
                  }}
                  className="text-neutral-500 hover:text-black font-bold text-sm sm:text-base px-0.5 sm:px-1 cursor-pointer"
                  aria-label="Ətraflı"
                >
                  ⋮
                </button>
              </div>
            </div>
          );
        })}
        <div className="flex-none w-2 sm:w-3 shrink-0" aria-hidden="true" />
      </div>
    </div>
  );
};
