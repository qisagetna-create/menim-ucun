import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import firebaseConfig from '../../firebase-applet-config.json';

export const app = initializeApp(firebaseConfig);

// CRITICAL: Use the provisioned named Firestore database ID from firebase-applet-config.json
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
auth.languageCode = 'az';

export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Initialize Firebase App Check if a reCAPTCHA v3 site key is provided via env or config
let appCheckInitialized = false;
export function initAppCheck(): void {
  if (appCheckInitialized || typeof window === 'undefined') return;
  const envKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;
  const configKey = (firebaseConfig as { recaptchaSiteKey?: string }).recaptchaSiteKey;
  const siteKey = (envKey || configKey || '').trim();
  if (!siteKey) return;

  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
    appCheckInitialized = true;
  } catch (err) {
    console.warn('App Check aktivləşdirilmədi:', err);
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Firebase bağlantısı oflayndır. Konfiqurasiyanı və interneti yoxlayın.');
      return false;
    }
    // Permission-denied or not-found still confirms server reachability
    return true;
  }
}

export function getFirebaseErrorMessageAz(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const code = (error as { code?: string })?.code || '';

  if (raw.includes('the client is offline') || code === 'unavailable' || raw.includes('network-request-failed')) {
    return 'İnternet bağlantısı yoxdur və ya serverə qoşulmaq mümkün olmadı. Şəbəkəni yoxlayıb yenidən cəhd edin.';
  }
  if (raw.includes('Quota exceeded')) {
    return 'Gündəlik verilənlər bazası limiti dolub. Xahiş edirik bir qədər sonra və ya sabah yenidən cəhd edin.';
  }
  if (code === 'permission-denied' || raw.includes('Missing or insufficient permissions')) {
    return 'Bu əməliyyat üçün icazəniz yoxdur və ya hesabınız təsdiqlənməyib.';
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Giriş pəncərəsi bağlandı. Yenidən cəhd edin.';
  }
  if (code === 'auth/popup-blocked') {
    return 'Brauzer giriş pəncərəsini blokladı. Pop-up icazəsini aktiv edin.';
  }
  if (code === 'auth/invalid-email') {
    return 'E-poçt ünvanı düzgün formatda deyil.';
  }
  if (code === 'auth/invalid-action-code' || code === 'auth/expired-action-code') {
    return 'Giriş linkinin vaxtı bitib və ya artıq istifadə olunub. Yeni link göndərin.';
  }
  if (code === 'auth/requires-recent-login') {
    return 'Təhlükəsizlik üçün hesabınızı silməzdən əvvəl yenidən daxil olmalısınız.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Bu giriş üsulu Firebase Console-da hələ aktiv edilməyib.';
  }
  if (code === 'storage/unauthorized') {
    return 'Şəkil yükləmək üçün icazəniz yoxdur və ya fayl ölçüsü 1 MB-dan böyükdür.';
  }
  if (code === 'storage/canceled') {
    return 'Şəkil yükləməsi ləğv edildi.';
  }
  return 'Gözlənilməz xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.';
}
