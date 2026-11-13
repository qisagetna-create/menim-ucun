/**
 * Centralized History API navigation and per-section scroll memory.
 * Keeps browser Back/Forward, Android hardware back, iOS swipe-back,
 * F5 reloads, and in-app "Geri"/"X" buttons 100% synchronized.
 */

export interface AppHistoryState {
  qisagetNav: true;
  depth: number;
}

const NAV_EVENT = 'qisaget:navigate';
const scrollPositions = new Map<string, number>();

let initialized = false;
let backingInFlight = false;
let backingResetTimer: number | null = null;
let bodyLockCheckFn: () => boolean = () => false;

export function registerBodyLockChecker(fn: () => boolean): void {
  bodyLockCheckFn = fn;
}

export function getCurrentUrlKey(): string {
  if (typeof window === 'undefined') return '/';
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function initNavigation(): void {
  if (typeof window === 'undefined' || initialized) return;
  initialized = true;

  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }

  const state = window.history.state as Partial<AppHistoryState> | null;
  if (!state || state.qisagetNav !== true || typeof state.depth !== 'number') {
    window.history.replaceState(
      { ...(state || {}), qisagetNav: true, depth: 0 } satisfies AppHistoryState,
      '',
      getCurrentUrlKey()
    );
  }

  window.addEventListener('popstate', () => {
    backingInFlight = false;
    if (backingResetTimer !== null) {
      window.clearTimeout(backingResetTimer);
      backingResetTimer = null;
    }
    window.dispatchEvent(new CustomEvent(NAV_EVENT));
  });
}

export function getHistoryDepth(): number {
  if (typeof window === 'undefined') return 0;
  const state = window.history.state as Partial<AppHistoryState> | null;
  if (state?.qisagetNav && typeof state.depth === 'number') {
    return state.depth;
  }
  return 0;
}

export function canGoBackInternally(): boolean {
  return getHistoryDepth() > 0;
}

export function saveSectionScroll(sectionKey: string, y?: number): void {
  if (typeof window === 'undefined') return;
  if (bodyLockCheckFn()) return;
  const targetY = typeof y === 'number' ? y : window.scrollY || window.pageYOffset || 0;
  scrollPositions.set(sectionKey, Math.max(0, targetY));
}

export function getSavedSectionScroll(sectionKey: string): number | undefined {
  return scrollPositions.get(sectionKey);
}

export function clearSavedSectionScroll(sectionKey: string): void {
  scrollPositions.delete(sectionKey);
}

export function restoreScrollY(y: number): void {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  const prevScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  window.scrollTo({ top: Math.max(0, y), left: 0, behavior: 'instant' as ScrollBehavior });
  root.style.scrollBehavior = prevScrollBehavior;
}

export function pushAppUrl(nextUrl: string, currentSectionKey?: string): void {
  if (typeof window === 'undefined') return;
  initNavigation();

  const normalized = nextUrl.startsWith('/') ? nextUrl : `/${nextUrl}`;
  const current = getCurrentUrlKey();
  if (normalized === current) return;

  if (currentSectionKey && !bodyLockCheckFn()) {
    saveSectionScroll(currentSectionKey);
  }

  const nextDepth = getHistoryDepth() + 1;
  window.history.pushState(
    { qisagetNav: true, depth: nextDepth } satisfies AppHistoryState,
    '',
    normalized
  );
  window.dispatchEvent(new CustomEvent(NAV_EVENT));
}

export function replaceAppUrl(nextUrl: string): void {
  if (typeof window === 'undefined') return;
  initNavigation();

  const normalized = nextUrl.startsWith('/') ? nextUrl : `/${nextUrl}`;
  const current = getCurrentUrlKey();
  if (normalized === current) return;

  const depth = getHistoryDepth();
  window.history.replaceState(
    { qisagetNav: true, depth } satisfies AppHistoryState,
    '',
    normalized
  );
  window.dispatchEvent(new CustomEvent(NAV_EVENT));
}

/**
 * Used by in-app "Geri" and "X" (close) buttons so they share the exact
 * same History API path as the browser / phone back button.
 */
export function goBackOrReplace(fallbackUrl: string): void {
  if (typeof window === 'undefined') return;
  initNavigation();

  if (canGoBackInternally()) {
    if (backingInFlight) return;
    backingInFlight = true;
    if (backingResetTimer !== null) {
      window.clearTimeout(backingResetTimer);
    }
    backingResetTimer = window.setTimeout(() => {
      backingInFlight = false;
      backingResetTimer = null;
    }, 400);
    window.history.back();
  } else {
    replaceAppUrl(fallbackUrl);
  }
}

export function subscribeToNavigation(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback();
  window.addEventListener(NAV_EVENT, handler);
  return () => {
    window.removeEventListener(NAV_EVENT, handler);
  };
}
