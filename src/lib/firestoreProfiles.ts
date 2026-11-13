import {
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import {
  CustomLink,
  MixtapeTrack,
  NewsCard,
  ProductItem,
  ProfileData,
  SocialLinks,
  UserAccountDoc,
} from '../types';
import {
  CALIPER_WATCHES,
  INITIAL_PROFILE,
  MIXTAPES,
  NEWS_CARDS,
} from '../data/defaults';
import {
  sanitizeText,
  sanitizeUrl,
  sanitizeWhatsappNumber,
  validateUsername,
} from './sanitize';
import { copyImageUrlToStorage, deleteAllUserStorageFiles } from './storage';

const ADMIN_EMAIL = 'qisaget.na@gmail.com';
const VALID_THEMES = new Set([
  'classic-blue',
  'sunset-peach',
  'mint-fresh',
  'lavender-dream',
  'dark-obsidian',
]);

export function isPlatformAdminEmail(email?: string | null, emailVerified?: boolean | null): boolean {
  return Boolean(emailVerified && email && email.toLowerCase() === ADMIN_EMAIL);
}

/**
 * Strips undefined values and enforces strict schema bounds matching firebase-blueprint.json
 */
export function buildFirestoreProfilePayload(
  profile: ProfileData,
  ownerUid: string,
  username: string,
  options: { isCreate: boolean; allowVerifiedEdit?: boolean }
): Record<string, unknown> {
  const cleanSocials: SocialLinks = {
    instagram: sanitizeUrl(profile.socials?.instagram || ''),
    whatsapp: sanitizeUrl(profile.socials?.whatsapp || ''),
    tiktok: sanitizeUrl(profile.socials?.tiktok || ''),
    telegram: sanitizeUrl(profile.socials?.telegram || ''),
    youtube: sanitizeUrl(profile.socials?.youtube || ''),
    facebook: sanitizeUrl(profile.socials?.facebook || ''),
    linkedin: sanitizeUrl(profile.socials?.linkedin || ''),
    discord: sanitizeUrl(profile.socials?.discord || ''),
  };

  const cleanLinks: CustomLink[] = (profile.links || []).slice(0, 50).map((link, idx) => ({
    id: (link.id || `link-${idx}`).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || `link-${idx}`,
    title: sanitizeText(link.title || 'Link', 80),
    ...(link.subtitle ? { subtitle: sanitizeText(link.subtitle, 120) } : {}),
    url: sanitizeUrl(link.url || '', false) || 'https://qisaget.az',
    iconType: link.iconType || 'website',
    ...(link.iconText ? { iconText: sanitizeText(link.iconText, 8) } : {}),
    clicks: typeof link.clicks === 'number' && link.clicks >= 0 ? Math.round(link.clicks) : 0,
  }));

  const cleanProducts: ProductItem[] = (profile.products || []).slice(0, 50).map((p, idx) => ({
    id: (p.id || `prod-${idx}`).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || `prod-${idx}`,
    title: sanitizeText(p.title || 'Məhsul', 90),
    price: Number.isFinite(Number(p.price)) && Number(p.price) >= 0 ? Number(p.price) : 0,
    ...(p.originalPrice !== undefined && Number(p.originalPrice) > 0
      ? { originalPrice: Number(p.originalPrice) }
      : {}),
    ...(p.discountPercent !== undefined && Number(p.discountPercent) >= 0
      ? { discountPercent: Math.min(99, Math.round(Number(p.discountPercent))) }
      : {}),
    currency: sanitizeText(p.currency || 'AZN', 10) || 'AZN',
    category: p.category || 'Saat',
    description: sanitizeText(p.description || '', 400),
    ...(p.gradient ? { gradient: sanitizeText(p.gradient, 120) } : {}),
    rating: typeof p.rating === 'number' ? p.rating : 5.0,
    ...(typeof p.reviewCount === 'number' ? { reviewCount: p.reviewCount } : {}),
    ...(p.badge ? { badge: sanitizeText(p.badge, 40) } : {}),
    ...(p.imageUrl ? { imageUrl: sanitizeUrl(p.imageUrl, true) } : {}),
    ...(p.colorName ? { colorName: sanitizeText(p.colorName, 30) } : {}),
    ...(p.colorHex ? { colorHex: sanitizeText(p.colorHex, 20) } : {}),
  }));

  const cleanMusic: MixtapeTrack[] = (profile.music || []).slice(0, 30).map((m, idx) => ({
    id: (m.id || `mix-${idx}`).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || `mix-${idx}`,
    title: sanitizeText(m.title || 'Musiqi', 90),
    artist: sanitizeText(m.artist || 'İfaçı', 60),
    gradient: sanitizeText(m.gradient || 'linear-gradient(135deg,#a50c24,#f0b0c0)', 120),
    duration: sanitizeText(m.duration || '2:30', 15),
    baseFrequency: Number.isFinite(Number(m.baseFrequency)) ? Number(m.baseFrequency) : 330,
  }));

  const cleanNews: NewsCard[] = (profile.news || []).slice(0, 20).map((n, idx) => ({
    id: (n.id || `news-${idx}`).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || `news-${idx}`,
    title: sanitizeText(n.title || 'Məlumat', 100),
    content: sanitizeText(n.content || '', 600),
    gradient: sanitizeText(n.gradient || 'bg-[#a5d1f8]', 80),
    isWide: Boolean(n.isWide),
    tag: sanitizeText(n.tag || 'Məlumat', 40),
    ...(n.thumbnailUrl ? { thumbnailUrl: sanitizeUrl(n.thumbnailUrl, true) } : {}),
    ...(n.videoUrl ? { videoUrl: sanitizeUrl(n.videoUrl, false) } : {}),
  }));

  const safeTheme = VALID_THEMES.has(profile.themeId) ? profile.themeId : 'classic-blue';
  const offsetY = Math.max(0, Math.min(100, Number(profile.heroImageOffsetY ?? 20)));
  const scale = Math.max(0.5, Math.min(3.0, Number(profile.heroImageScale ?? 1.08)));

  const base: Record<string, unknown> = {
    ownerUid,
    username,
    name: sanitizeText(profile.displayName || username, 80) || username,
    bio: sanitizeText(profile.bio || '', 400),
    avatar: sanitizeUrl(profile.heroImageUrl || '', true),
    avatarOffsetY: offsetY,
    avatarScale: scale,
    theme: safeTheme,
    socials: cleanSocials,
    links: cleanLinks,
    products: cleanProducts,
    music: cleanMusic,
    news: cleanNews,
    wa: sanitizeWhatsappNumber(profile.wa || ''),
    verified: options.allowVerifiedEdit ? Boolean(profile.isVerified) : false,
    updatedAt: serverTimestamp(),
  };

  if (options.isCreate) {
    base.createdAt = serverTimestamp();
  } else {
    base.createdAt = profile.createdAt || serverTimestamp();
  }

  return base;
}

export function mapFirestoreDocToProfile(docData: Record<string, unknown>, docId: string): ProfileData {
  const socialsRaw = (docData.socials || {}) as Partial<SocialLinks>;
  return {
    ownerUid: String(docData.ownerUid || ''),
    username: String(docData.username || docId),
    displayName: String(docData.name || docId),
    bio: String(docData.bio || ''),
    isVerified: Boolean(docData.verified),
    themeId: VALID_THEMES.has(String(docData.theme || '')) ? String(docData.theme) : 'classic-blue',
    wa: String(docData.wa || ''),
    socials: {
      instagram: socialsRaw.instagram || '',
      whatsapp: socialsRaw.whatsapp || '',
      tiktok: socialsRaw.tiktok || '',
      telegram: socialsRaw.telegram || '',
      youtube: socialsRaw.youtube || '',
      facebook: socialsRaw.facebook || '',
      linkedin: socialsRaw.linkedin || '',
      discord: socialsRaw.discord || '',
    },
    links: Array.isArray(docData.links) ? (docData.links as CustomLink[]) : [],
    products: Array.isArray(docData.products) ? (docData.products as ProductItem[]) : [],
    music: Array.isArray(docData.music) ? (docData.music as MixtapeTrack[]) : [],
    news: Array.isArray(docData.news) ? (docData.news as NewsCard[]) : [],
    heroImageUrl: String(docData.avatar || ''),
    heroImageOffsetY: typeof docData.avatarOffsetY === 'number' ? docData.avatarOffsetY : 20,
    heroImageScale: typeof docData.avatarScale === 'number' ? docData.avatarScale : 1.08,
    createdAt: docData.createdAt,
    updatedAt: docData.updatedAt,
  };
}

export function createStarterProfile(username: string, ownerUid: string, displayName?: string): ProfileData {
  return {
    ownerUid,
    username,
    displayName: displayName || username,
    bio: 'Bütün işlərim, sosial media hesablarım və mağazam tək QısaGet linkində.',
    isVerified: false,
    themeId: 'classic-blue',
    wa: '',
    socials: {
      instagram: '',
      whatsapp: '',
      tiktok: '',
      telegram: '',
      youtube: '',
      facebook: '',
      linkedin: '',
      discord: '',
    },
    links: [
      {
        id: `link-${Date.now()}`,
        title: 'Əsas Saytım',
        subtitle: 'Layihələr və əlaqə',
        url: 'https://qisaget.az',
        iconType: 'website',
        clicks: 0,
      },
    ],
    products: [],
    music: MIXTAPES,
    news: [NEWS_CARDS[0]],
    heroImageUrl: '',
    heroImageOffsetY: 20,
    heroImageScale: 1.08,
  };
}

export function createNaMexmanTemplateProfile(ownerUid: string): ProfileData {
  return {
    ...INITIAL_PROFILE,
    ownerUid,
    username: 'na.mexman',
    displayName: 'Na.Mexman',
    isVerified: isPlatformAdminEmail(auth.currentUser?.email, auth.currentUser?.emailVerified),
    wa: '994500000000',
    socials: {
      instagram: INITIAL_PROFILE.socials.instagram,
      whatsapp: INITIAL_PROFILE.socials.whatsapp,
      tiktok: INITIAL_PROFILE.socials.tiktok,
      telegram: '',
      youtube: '',
      facebook: INITIAL_PROFILE.socials.facebook,
      linkedin: INITIAL_PROFILE.socials.linkedin,
      discord: INITIAL_PROFILE.socials.discord || '',
    },
    products: CALIPER_WATCHES,
    music: MIXTAPES,
    news: NEWS_CARDS,
  };
}

/**
 * Copies bundled asset images of the Na.Mexman template into the user's Firebase Storage folder
 */
export async function prepareNaMexmanTemplateWithStorage(
  uid: string,
  onStatus?: (msg: string) => void
): Promise<ProfileData> {
  const tpl = createNaMexmanTemplateProfile(uid);

  let heroUrl = tpl.heroImageUrl || '';
  if (heroUrl) {
    onStatus?.('Profil fotosu Storage-a köçürülür...');
    try {
      heroUrl = await copyImageUrlToStorage(heroUrl, { uid, folder: 'avatar' });
    } catch {
      // Fallback to original Cloudinary URL if Storage or CORS fails
    }
  }

  const migratedProducts: ProductItem[] = [];
  for (let i = 0; i < tpl.products.length; i++) {
    const prod = tpl.products[i];
    let finalUrl = prod.imageUrl || '';
    if (finalUrl.startsWith('/assets/')) {
      onStatus?.(`Məhsul şəkli Storage-a yüklənir (${i + 1}/${tpl.products.length})...`);
      try {
        finalUrl = await copyImageUrlToStorage(finalUrl, { uid, folder: 'products' });
      } catch {
        // Fallback to local path if Storage isn't activated yet in Firebase Console
      }
    }
    migratedProducts.push({ ...prod, imageUrl: finalUrl });
  }

  const migratedNews: NewsCard[] = [];
  for (let i = 0; i < tpl.news.length; i++) {
    const card = tpl.news[i];
    let thumb = card.thumbnailUrl || '';
    if (thumb.startsWith('/assets/')) {
      onStatus?.('Kart şəkli Storage-a yüklənir...');
      try {
        thumb = await copyImageUrlToStorage(thumb, { uid, folder: 'news' });
      } catch {
        // Keep local path fallback
      }
    }
    migratedNews.push({ ...card, thumbnailUrl: thumb });
  }

  return {
    ...tpl,
    heroImageUrl: heroUrl,
    products: migratedProducts,
    news: migratedNews,
  };
}

export function subscribeToProfile(
  username: string,
  onData: (profile: ProfileData) => void,
  onNotFound: () => void,
  onError: (err: Error) => void
): Unsubscribe {
  const path = `profiles/${username}`;
  const refDoc = doc(db, 'profiles', username);
  return onSnapshot(
    refDoc,
    (snap) => {
      if (!snap.exists()) {
        onNotFound();
        return;
      }
      onData(mapFirestoreDocToProfile(snap.data() as Record<string, unknown>, snap.id));
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export function subscribeToUserAccount(
  uid: string,
  onData: (userDoc: UserAccountDoc | null) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const path = `users/${uid}`;
  const refDoc = doc(db, 'users', uid);
  return onSnapshot(
    refDoc,
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      onData(snap.data() as UserAccountDoc);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export async function checkUsernameAvailability(
  rawUsername: string
): Promise<{ available: boolean; normalized: string; error?: string }> {
  const check = validateUsername(rawUsername);
  if (!check.valid) {
    return { available: false, normalized: check.normalized, error: check.error };
  }

  const path = `profiles/${check.normalized}`;
  try {
    const snap = await getDoc(doc(db, 'profiles', check.normalized));
    if (snap.exists()) {
      return {
        available: false,
        normalized: check.normalized,
        error: `"${check.normalized}" istifadəçi adı artıq tutulub.`,
      };
    }
    return { available: true, normalized: check.normalized };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function claimUsernameAndCreateProfile(params: {
  uid: string;
  email: string;
  username: string;
  profile: ProfileData;
}): Promise<void> {
  const check = validateUsername(params.username);
  if (!check.valid) {
    throw new Error(check.error || 'Keçərsiz istifadəçi adı.');
  }

  const normalized = check.normalized;
  const allowVerified = isPlatformAdminEmail(auth.currentUser?.email, auth.currentUser?.emailVerified);
  const profilePayload = buildFirestoreProfilePayload(params.profile, params.uid, normalized, {
    isCreate: true,
    allowVerifiedEdit: allowVerified,
  });

  const batch = writeBatch(db);
  const existingUserSnap = await getDoc(doc(db, 'users', params.uid));
  if (existingUserSnap.exists()) {
    batch.update(doc(db, 'users', params.uid), {
      username: normalized,
      email: sanitizeText(params.email || 'user@qisaget.az', 254),
      updatedAt: serverTimestamp(),
    });
  } else {
    batch.set(doc(db, 'users', params.uid), {
      uid: params.uid,
      username: normalized,
      email: sanitizeText(params.email || 'user@qisaget.az', 254),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  batch.set(doc(db, 'profiles', normalized), profilePayload);

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `profiles/${normalized}`);
  }
}

export async function renameUsernameAtomically(params: {
  uid: string;
  email: string;
  oldUsername: string;
  newUsername: string;
  profile: ProfileData;
}): Promise<void> {
  const check = validateUsername(params.newUsername);
  if (!check.valid) {
    throw new Error(check.error || 'Keçərsiz istifadəçi adı.');
  }

  const nextSlug = check.normalized;
  if (nextSlug === params.oldUsername) return;

  const existingSnap = await getDoc(doc(db, 'profiles', nextSlug));
  if (existingSnap.exists()) {
    throw new Error(`"${nextSlug}" istifadəçi adı artıq başqası tərəfindən tutulub.`);
  }

  const allowVerified = isPlatformAdminEmail(auth.currentUser?.email, auth.currentUser?.emailVerified);
  const nextProfilePayload = buildFirestoreProfilePayload(params.profile, params.uid, nextSlug, {
    isCreate: true,
    allowVerifiedEdit: allowVerified,
  });

  const batch = writeBatch(db);
  batch.delete(doc(db, 'profiles', params.oldUsername));
  batch.set(doc(db, 'profiles', nextSlug), nextProfilePayload);
  batch.update(doc(db, 'users', params.uid), {
    username: nextSlug,
    email: sanitizeText(params.email || 'user@qisaget.az', 254),
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `profiles/${nextSlug}`);
  }
}

export async function saveProfileChanges(
  username: string,
  ownerUid: string,
  profile: ProfileData
): Promise<void> {
  const path = `profiles/${username}`;
  const docRef = doc(db, 'profiles', username);

  try {
    const existingSnap = await getDoc(docRef);
    if (!existingSnap.exists()) {
      const currentUid = auth.currentUser?.uid || ownerUid;
      const currentEmail = auth.currentUser?.email || 'qisaget.na@gmail.com';
      await claimUsernameAndCreateProfile({
        uid: currentUid,
        email: currentEmail,
        username,
        profile,
      });
      return;
    }

    const allowVerified = isPlatformAdminEmail(auth.currentUser?.email, auth.currentUser?.emailVerified);
    const fullPayload = buildFirestoreProfilePayload(profile, ownerUid, username, {
      isCreate: false,
      allowVerifiedEdit: allowVerified,
    });

    const updatePayload: Record<string, unknown> = {
      name: fullPayload.name,
      bio: fullPayload.bio,
      avatar: fullPayload.avatar,
      avatarOffsetY: fullPayload.avatarOffsetY,
      avatarScale: fullPayload.avatarScale,
      theme: fullPayload.theme,
      socials: fullPayload.socials,
      links: fullPayload.links,
      products: fullPayload.products,
      music: fullPayload.music,
      news: fullPayload.news,
      wa: fullPayload.wa,
      updatedAt: serverTimestamp(),
    };

    if (allowVerified) {
      updatePayload.verified = Boolean(profile.isVerified);
    }

    await updateDoc(docRef, updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteAccountAndAllData(params: {
  uid: string;
  username?: string | null;
}): Promise<void> {
  if (params.username) {
    try {
      await deleteDoc(doc(db, 'profiles', params.username));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `profiles/${params.username}`);
    }
  }

  try {
    await deleteDoc(doc(db, 'users', params.uid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${params.uid}`);
  }

  await deleteAllUserStorageFiles(params.uid);

  if (auth.currentUser && auth.currentUser.uid === params.uid) {
    await deleteUser(auth.currentUser);
  }
}
