import React, { useEffect, useRef, useState } from 'react';

export const InteractiveEyes: React.FC = () => {
  const eye1Ref = useRef<HTMLDivElement>(null);
  const eye2Ref = useRef<HTMLDivElement>(null);
  const [pupil1Offset, setPupil1Offset] = useState({ x: 0, y: 0 });
  const [pupil2Offset, setPupil2Offset] = useState({ x: 0, y: 0 });
  const [isWinking, setIsWinking] = useState(false);

  useEffect(() => {
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const calcOffset = (el: HTMLDivElement | null, maxRadius: number) => {
        if (!el) return { x: 0, y: 0 };
        const rect = el.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;

        const dx = clientX - eyeCenterX;
        const dy = clientY - eyeCenterY;
        const dist = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);

        const clampedDist = Math.min(dist * 0.08, maxRadius);
        return {
          x: Math.cos(angle) * clampedDist,
          y: Math.sin(angle) * clampedDist,
        };
      };

      setPupil1Offset(calcOffset(eye1Ref.current, 7));
      setPupil2Offset(calcOffset(eye2Ref.current, 10));
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove);
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
    };
  }, []);

  const triggerWink = () => {
    setIsWinking(true);
    setTimeout(() => setIsWinking(false), 300);
  };

  return (
    <>
      {/* Eye 1 (Left Upper) */}
      <div
        ref={eye1Ref}
        onClick={triggerWink}
        title="Salam! Gözləri hərəkət etdirin"
        className={`absolute w-[38px] h-[56px] bg-[#fbeee6] border-2 border-[#3a2a12] rounded-[50%] left-[19%] top-[150px] cursor-pointer transition-transform duration-100 ${
          isWinking ? 'scale-y-[0.1]' : 'eye-blink'
        }`}
        style={{ zIndex: 10 }}
      >
        <div
          className="w-[20px] h-[28px] bg-[#4a2b08] rounded-[50%] absolute top-[14px] left-[9px] transition-transform duration-75"
          style={{
            transform: `translate(${pupil1Offset.x}px, ${pupil1Offset.y}px)`,
          }}
        />
      </div>

      {/* Eye 2 (Right Lower - larger) */}
      <div
        ref={eye2Ref}
        onClick={triggerWink}
        title="Salam! Gözləri hərəkət etdirin"
        className={`absolute w-[52px] h-[74px] bg-[#fbeee6] border-2 border-[#3a2a12] rounded-[50%] right-[20%] top-[310px] cursor-pointer transition-transform duration-100 ${
          isWinking ? 'scale-y-[0.1]' : 'eye-blink'
        }`}
        style={{ zIndex: 10 }}
      >
        <div
          className="w-[28px] h-[38px] bg-[#4a2b08] rounded-[50%] absolute top-[18px] left-[12px] transition-transform duration-75"
          style={{
            transform: `translate(${pupil2Offset.x}px, ${pupil2Offset.y}px)`,
          }}
        />
      </div>
    </>
  );
};
