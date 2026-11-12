import { ProfileData } from '../types';

export const USERNAME_REGEX = /^[a-z0-9.-]{3,24}$/;
export const VALID_ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

export const RESERVED_USERNAMES = new Set([
  'admin',
  'login',
  'giris',
  'api',
  'qeydiyyat',
  'mexfilik',
  'privacy',
  'terms',
  'sertler',
  'about',
  'haqqinda',
  'support',
  'destek',
  'qisaget',
  'root',
  'system',
  'auth',
  'settings',
  'logout',
  'cixis',
  '404',
  'profile',
  'profiles',
  'user',
  'users',
  'test',
]);

export interface UsernameValidationResult {
  valid: boolean;
  normalized: string;
  error?: string;
}

export function normalizeUsername(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^@+/, '')
    .replace(/[^a-z0-9.-]/g, '');
}

export function validateUsername(raw: string): UsernameValidationResult {
  const normalized = normalizeUsername(raw);
  if (!normalized) {
    return { valid: false, normalized, error: 'İstifadəçi adı boş ola bilməz.' };
  }
  if (normalized.length < 3 || normalized.length > 24) {
    return {
      valid: false,
      normalized,
      error: 'İstifadəçi adı 3 ilə 24 simvol arasında olmalıdır.',
    };
  }
  if (!USERNAME_REGEX.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: 'Yalnız kiçik latın hərfləri, rəqəmlər, nöqtə (.) və tire (-) istifadə edilə bilər.',
    };
  }
  if (normalized.startsWith('.') || normalized.endsWith('.') || normalized.includes('..')) {
    return {
      valid: false,
      normalized,
      error: 'İstifadəçi adı nöqtə ilə başlaya/bitə bilməz və ardıcıl nöqtələr ola bilməz.',
    };
  }
  if (RESERVED_USERNAMES.has(normalized)) {
    return {
      valid: false,
      normalized,
      error: `"${normalized}" sistem tərəfindən qorunan sözdür və istifadə edilə bilməz.`,
    };
  }
  return { valid: true, normalized };
}

/**
 * Strips HTML tags and dangerous control characters to prevent XSS
 */
export function sanitizeText(value: string, maxLength = 500): string {
  if (!value) return '';
  return value
    .replace(/<[^>]*>?/gm, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates and normalizes external URLs (http/https only).
 * Blocks javascript:, data:, vbscript:, file:, etc.
 */
export function sanitizeUrl(raw: string, allowRelativeAsset = false): string {
  const trimmed = (raw || '').trim();
  if (!trimmed) return '';

  if (allowRelativeAsset && trimmed.startsWith('/assets/')) {
    return trimmed.slice(0, 1000);
  }

  let candidate = trimmed;
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(candidate)) {
    // Allow shorthand domains like drived.az -> https://drived.az
    if (candidate.includes('.') && !candidate.includes(' ')) {
      candidate = `https://${candidate}`;
    } else {
      return '';
    }
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }
    return parsed.toString().slice(0, 1000);
  } catch {
    return '';
  }
}

export function isValidHttpUrl(raw: string, allowRelativeAsset = false): boolean {
  if (!raw.trim()) return true; // optional empty URLs are checked separately if required
  return sanitizeUrl(raw, allowRelativeAsset) !== '';
}

export function sanitizeWhatsappNumber(raw: string): string {
  const digits = (raw || '').replace(/[^0-9]/g, '');
  if (!digits) return '';
  // Normalize 050... -> 99450...
  if (digits.startsWith('0') && digits.length === 10) {
    return `994${digits.slice(1)}`;
  }
  return digits.slice(0, 15);
}

export function buildWhatsappOrderUrl(
  waNumber: string | undefined,
  productTitle: string,
  colorName: string | undefined,
  price: number,
  currency = 'AZN'
): string {
  const cleanWa = sanitizeWhatsappNumber(waNumber || '');
  const colorPart = colorName ? `${colorName} rəng, ` : '';
  const msg = encodeURIComponent(
    `Salam! "${productTitle}" (${colorPart}${price} ${currency}) məhsulunu sifariş etmək istəyirəm.`
  );
  if (!cleanWa) {
    return `https://wa.me/?text=${msg}`;
  }
  return `https://wa.me/${cleanWa}?text=${msg}`;
}

/**
 * Simple client-side rate limiter to deter spam clicks and automated abuse
 */
const actionTimestamps = new Map<string, number>();

export function checkClientRateLimit(actionKey: string, cooldownMs = 1500): { allowed: boolean; waitSeconds: number } {
  const now = Date.now();
  const last = actionTimestamps.get(actionKey) || 0;
  const diff = now - last;
  if (diff < cooldownMs) {
    return {
      allowed: false,
      waitSeconds: Math.ceil((cooldownMs - diff) / 1000),
    };
  }
  actionTimestamps.set(actionKey, now);
  return { allowed: true, waitSeconds: 0 };
}

/**
 * Dynamically updates <title>, description, and Open Graph tags per page/profile
 */
export function updateMetaTags(params: {
  title: string;
  description: string;
  image?: string;
  url?: string;
}): void {
  if (typeof document === 'undefined') return;

  document.title = params.title;

  const setMeta = (selector: string, attrName: 'name' | 'property', key: string, content: string) => {
    let el = document.querySelector(selector) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMeta('meta[name="description"]', 'name', 'description', params.description);
  setMeta('meta[property="og:title"]', 'property', 'og:title', params.title);
  setMeta('meta[property="og:description"]', 'property', 'og:description', params.description);
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', params.title);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', params.description);

  if (params.url) {
    setMeta('meta[property="og:url"]', 'property', 'og:url', params.url);
  }
  if (params.image) {
    setMeta('meta[property="og:image"]', 'property', 'og:image', params.image);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', params.image);
  }
}

export function updateProfileMetaTags(profile: ProfileData): void {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://qisaget.az';
  updateMetaTags({
    title: `${profile.displayName} (@${profile.username}) | QısaGet`,
    description: profile.bio || `${profile.displayName} — bütün linklər və mağaza bir ünvanda.`,
    image: profile.heroImageUrl || `${origin}/assets/aistudio/image_4e3c2bd5.png`,
    url: `https://qisaget.az/${profile.username}`,
  });
}
