import { useEffect } from 'react';
import { registerBodyLockChecker, restoreScrollY } from './navigation';

/**
 * Reference-counted iOS-safe body scroll lock (using position: fixed)
 * with touchmove boundary guards to eliminate background rubber-banding
 * on iPhone Safari, Android Chrome, and Desktop browsers.
 */

let lockCount = 0;
let savedScrollY = 0;
let prevBodyStyles: {
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
  overflow: string;
  paddingRight: string;
  overscrollBehavior: string;
} | null = null;
let prevHtmlStyles: {
  overflow: string;
  overscrollBehavior: string;
} | null = null;

let touchStartY = 0;
let touchStartX = 0;
let touchListenersAttached = false;

registerBodyLockChecker(() => lockCount > 0);

function handleTouchStart(e: TouchEvent): void {
  if (e.touches.length !== 1) return;
  touchStartY = e.touches[0].clientY;
  touchStartX = e.touches[0].clientX;
}

function handleTouchMove(e: TouchEvent): void {
  if (lockCount === 0 || e.touches.length !== 1) return;

  const target = e.target as HTMLElement | null;
  if (!target) return;

  // Allow native range sliders and explicit drag-reposition surfaces (e.g. photo crop)
  if (target.closest('input[type="range"], [data-touch-drag="true"]')) {
    return;
  }

  const scroller = target.closest('[data-scroll-container="true"]') as HTMLElement | null;
  if (!scroller) {
    if (e.cancelable) e.preventDefault();
    return;
  }

  const currentY = e.touches[0].clientY;
  const currentX = e.touches[0].clientX;
  const deltaY = currentY - touchStartY;
  const deltaX = currentX - touchStartX;
  touchStartY = currentY;
  touchStartX = currentX;

  const canScrollY = scroller.scrollHeight > scroller.clientHeight + 1;
  if (!canScrollY) {
    // Allow horizontal scroll inside sub-scrollers if any, otherwise prevent vertical rubber-band
    if (Math.abs(deltaY) >= Math.abs(deltaX) && e.cancelable) {
      e.preventDefault();
    }
    return;
  }

  if (Math.abs(deltaY) < Math.abs(deltaX)) {
    return;
  }

  const atTop = scroller.scrollTop <= 0;
  const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;

  if ((atTop && deltaY > 0) || (atBottom && deltaY < 0)) {
    if (e.cancelable) e.preventDefault();
  }
}

function attachTouchGuards(): void {
  if (touchListenersAttached || typeof document === 'undefined') return;
  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  touchListenersAttached = true;
}

function detachTouchGuards(): void {
  if (!touchListenersAttached || typeof document === 'undefined') return;
  document.removeEventListener('touchstart', handleTouchStart);
  document.removeEventListener('touchmove', handleTouchMove);
  touchListenersAttached = false;
}

export function acquireBodyScrollLock(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  if (lockCount === 0) {
    const docEl = document.documentElement;
    const body = document.body;

    savedScrollY = window.scrollY || window.pageYOffset || docEl.scrollTop || 0;
    const scrollbarWidth = Math.max(0, window.innerWidth - docEl.clientWidth);

    prevHtmlStyles = {
      overflow: docEl.style.overflow,
      overscrollBehavior: docEl.style.overscrollBehavior,
    };
    prevBodyStyles = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
      overscrollBehavior: body.style.overscrollBehavior,
    };

    docEl.style.overflow = 'hidden';
    docEl.style.overscrollBehavior = 'none';

    body.style.position = 'fixed';
    body.style.top = `-${savedScrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    attachTouchGuards();
  }

  lockCount += 1;
}

export function releaseBodyScrollLock(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (lockCount <= 0) return;

  lockCount -= 1;

  if (lockCount === 0) {
    detachTouchGuards();

    const docEl = document.documentElement;
    const body = document.body;

    if (prevHtmlStyles) {
      docEl.style.overflow = prevHtmlStyles.overflow;
      docEl.style.overscrollBehavior = prevHtmlStyles.overscrollBehavior;
      prevHtmlStyles = null;
    }

    if (prevBodyStyles) {
      body.style.position = prevBodyStyles.position;
      body.style.top = prevBodyStyles.top;
      body.style.left = prevBodyStyles.left;
      body.style.right = prevBodyStyles.right;
      body.style.width = prevBodyStyles.width;
      body.style.overflow = prevBodyStyles.overflow;
      body.style.paddingRight = prevBodyStyles.paddingRight;
      body.style.overscrollBehavior = prevBodyStyles.overscrollBehavior;
      prevBodyStyles = null;
    }

    restoreScrollY(savedScrollY);
  }
}

export function isBodyScrollLocked(): boolean {
  return lockCount > 0;
}

export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    acquireBodyScrollLock();
    return () => {
      releaseBodyScrollLock();
    };
  }, [locked]);
}
