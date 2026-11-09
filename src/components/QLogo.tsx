import React from 'react';

interface QLogoProps {
  className?: string;
  size?: number | string;
  strokeWidth?: number;
}

export const QLogo: React.FC<QLogoProps> = ({
  className = '',
  size = 28,
  strokeWidth = 9,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Qisaget Loqosu"
    >
      <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="butt">
        {/* Orthogonal cross lines */}
        <path d="M50 3V36M50 64V97M3 50H36M64 50H97" />
        {/* Diagonal corner lines */}
        <path d="M34 34L14 14M66 34L86 14M34 66L14 86M66 66L86 86" />
        {/* Center square box */}
        <rect x="37" y="37" width="26" height="26" strokeWidth={Math.max(6, strokeWidth - 1)} />
      </g>
    </svg>
  );
};
