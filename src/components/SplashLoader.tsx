import React from 'react';

export const SplashLoader: React.FC = () => {
  return (
    <div
      className="min-h-screen w-full bg-[#6ea6d8] flex items-center justify-center p-6 select-none"
      role="status"
      aria-label="Yüklənir"
    >
      <div className="flex items-center justify-center gap-3.5 sm:gap-4">
        <svg
          viewBox="0 0 100 100"
          className="w-12 h-12 sm:w-16 sm:h-16 text-[#4ade80] shrink-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <g stroke="currentColor" strokeWidth={10} strokeLinecap="butt">
            {/* Clockwise rays starting from bottom (6 o'clock) */}
            <line x1="50" y1="63.5" x2="50" y2="96.5" pathLength={100} className="qlogo-ray-0" />
            <line x1="40.5" y1="59.5" x2="17.1" y2="82.9" pathLength={100} className="qlogo-ray-1" />
            <line x1="36.5" y1="50" x2="3.5" y2="50" pathLength={100} className="qlogo-ray-2" />
            <line x1="40.5" y1="40.5" x2="17.1" y2="17.1" pathLength={100} className="qlogo-ray-3" />
            <line x1="50" y1="36.5" x2="50" y2="3.5" pathLength={100} className="qlogo-ray-4" />
            <line x1="59.5" y1="40.5" x2="82.9" y2="17.1" pathLength={100} className="qlogo-ray-5" />
            <line x1="63.5" y1="50" x2="96.5" y2="50" pathLength={100} className="qlogo-ray-6" />
            <line x1="59.5" y1="59.5" x2="82.9" y2="82.9" pathLength={100} className="qlogo-ray-7" />

            {/* Crisp octagonal core ring */}
            <path
              d="M44 37 H56 L63 44 V56 L56 63 H44 L37 56 V44 Z"
              strokeWidth={8.5}
              strokeLinejoin="miter"
            />
          </g>
        </svg>

        <span className="text-3xl sm:text-5xl font-black tracking-tight text-black leading-none">
          Qısaget
        </span>
      </div>
    </div>
  );
};
