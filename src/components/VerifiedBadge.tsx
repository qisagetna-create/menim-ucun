import React, { useId } from 'react';

interface VerifiedBadgeProps {
  size?: number;
  className?: string;
}

/**
 * 10-pointed 3D beveled red starburst verification seal with a sharp white checkmark.
 */
export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 23,
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');
  const bevelGradId = `vb-bevel-${uid}`;
  const faceGradId = `vb-face-${uid}`;
  const rimGradId = `vb-rim-${uid}`;
  const checkGradId = `vb-check-${uid}`;
  const shadowGradId = `vb-shadow-${uid}`;

  // Exact 10-pointed starburst (outer R=46, inner r=35, centered at 50,50)
  const outerStarPoints =
    '50,4 60.82,16.71 77.04,12.79 78.32,29.43 93.75,35.79 85,50 93.75,64.21 78.32,70.57 77.04,87.21 60.82,83.29 50,96 39.18,83.29 22.96,87.21 21.68,70.57 6.25,64.21 15,50 6.25,35.79 21.68,29.43 22.96,12.79 39.18,16.71';

  // Raised inner plateau starburst (0.865 scale around 50,50 -> R=39.8, r=30.3)
  const innerStarPoints =
    '50,10.21 59.36,21.20 73.39,17.81 74.50,32.21 87.84,37.71 80.28,50 87.84,62.29 74.50,67.79 73.39,82.19 59.36,78.80 50,89.79 40.64,78.80 26.61,82.19 25.50,67.79 12.16,62.29 19.73,50 12.16,37.71 25.50,32.21 26.61,17.81 40.64,21.20';

  // Crisp 45-degree geometric sharp-corner checkmark
  const checkPath = 'M 27.5 50.5 L 44.5 67.5 L 72.5 39.5 L 65 32 L 44.5 52.5 L 35 43 Z';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={`shrink-0 inline-block select-none drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.22)] ${className}`}
      role="img"
      aria-label="Təsdiqlənmiş Hesab"
    >
      <title>Təsdiqlənmiş Hesab</title>
      <defs>
        {/* Outer 3D beveled edge gradient */}
        <linearGradient id={bevelGradId} x1="12%" y1="8%" x2="88%" y2="92%">
          <stop offset="0%" stopColor="#ff2e24" />
          <stop offset="45%" stopColor="#eb0000" />
          <stop offset="100%" stopColor="#a80000" />
        </linearGradient>

        {/* Inner raised seal face gradient */}
        <linearGradient id={faceGradId} x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#ff473d" />
          <stop offset="48%" stopColor="#f50505" />
          <stop offset="100%" stopColor="#cc0000" />
        </linearGradient>

        {/* Subtle bevel rim highlight */}
        <linearGradient id={rimGradId} x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#ff8a84" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#ff1f1f" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#8c0000" stopOpacity="0.65" />
        </linearGradient>

        {/* Soft directional shadow under the checkmark */}
        <linearGradient id={shadowGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7a0000" stopOpacity="0.52" />
          <stop offset="100%" stopColor="#610000" stopOpacity="0.28" />
        </linearGradient>

        {/* Crisp white checkmark face */}
        <linearGradient id={checkGradId} x1="20%" y1="15%" x2="80%" y2="85%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="80%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>

      {/* Outer beveled starburst body */}
      <polygon
        points={outerStarPoints}
        fill={`url(#${bevelGradId})`}
        stroke="#990000"
        strokeWidth="1.2"
        strokeLinejoin="miter"
      />

      {/* Inner raised starburst plateau */}
      <polygon
        points={innerStarPoints}
        fill={`url(#${faceGradId})`}
        stroke={`url(#${rimGradId})`}
        strokeWidth="1.6"
        strokeLinejoin="miter"
      />

      {/* Checkmark cast shadow on the red seal */}
      <path
        d={checkPath}
        transform="translate(2.2, 3.6)"
        fill={`url(#${shadowGradId})`}
      />

      {/* Crisp 3D white checkmark */}
      <path
        d={checkPath}
        fill={`url(#${checkGradId})`}
        stroke="#ffffff"
        strokeWidth="0.6"
        strokeLinejoin="miter"
      />
    </svg>
  );
};
