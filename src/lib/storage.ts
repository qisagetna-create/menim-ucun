import {
  deleteObject,
  getDownloadURL,
  listAll,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { getFirebaseErrorMessageAz, storage } from './firebase';
import { sanitizeUrl } from './sanitize';

const MAX_DIMENSION = 1200;
const TARGET_MAX_BYTES = 500 * 1024; // ~500 KB target
const HARD_MAX_BYTES = 1024 * 1024; // 1 MB strict Firebase Storage rule ceiling

export interface ImageUploadOptions {
  uid: string;
  folder?: 'avatar' | 'products' | 'news' | 'uploads';
  onProgress?: (percent: number) => void;
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Şəkil yüklənə bilmədi.'));
    img.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Şəkil sıxışdırıla bilmədi.'));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

/**
 * Compresses any image File/Blob in the browser to <= 1200px and ~500KB (strictly < 1MB)
 */
export async function compressImageBlob(input: Blob): Promise<{ blob: Blob; ext: string; mimeType: string }> {
  if (!input.type.startsWith('image/') && input.type !== '') {
    throw new Error('Yalnız şəkil faylları (JPG, PNG, WebP) dəstəklənir.');
  }

  const objectUrl = URL.createObjectURL(input);
  try {
    const img = await loadImageElement(objectUrl);
    let { width, height } = img;

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      if (width >= height) {
        height = Math.round((height * MAX_DIMENSION) / width);
        width = MAX_DIMENSION;
      } else {
        width = Math.round((width * MAX_DIMENSION) / height);
        height = MAX_DIMENSION;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, width);
    canvas.height = Math.max(1, height);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Brauzer şəkil emalını dəstəkləmir.');
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Prefer WebP for best quality/size ratio, fallback to JPEG
    const mimeType = 'image/webp';
    let quality = 0.88;
    let blob = await canvasToBlob(canvas, mimeType, quality);

    if (blob.type !== 'image/webp') {
      // Safari/older fallback to jpeg
      quality = 0.86;
      blob = await canvasToBlob(canvas, 'image/jpeg', quality);
    }

    const activeMime = blob.type || 'image/jpeg';

    while (blob.size > TARGET_MAX_BYTES && quality > 0.45) {
      quality -= 0.08;
      blob = await canvasToBlob(canvas, activeMime, quality);
    }

    // If still larger than HARD_MAX_BYTES, downscale dimensions further
    if (blob.size > HARD_MAX_BYTES) {
      const ratio = Math.sqrt(TARGET_MAX_BYTES / blob.size);
      canvas.width = Math.max(300, Math.round(canvas.width * ratio));
      canvas.height = Math.max(300, Math.round(canvas.height * ratio));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      blob = await canvasToBlob(canvas, activeMime, 0.78);
    }

    if (blob.size > HARD_MAX_BYTES) {
      throw new Error('Şəkil həddindən artıq böyükdür (1 MB limitini keçir). Daha kiçik şəkil seçin.');
    }

    const ext = activeMime === 'image/webp' ? 'webp' : 'jpg';
    return { blob, ext, mimeType: activeMime };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Compresses and uploads an image File/Blob to Firebase Storage under users/{uid}/
 */
export async function uploadImageFileToStorage(
  file: Blob,
  options: ImageUploadOptions
): Promise<string> {
  if (!options.uid) {
    throw new Error('Şəkil yükləmək üçün əvvəlcə hesaba daxil olmalısınız.');
  }

  options.onProgress?.(5);
  const { blob, ext, mimeType } = await compressImageBlob(file);
  options.onProgress?.(20);

  const folder = options.folder || 'uploads';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const storagePath = `users/${options.uid}/${folder}/${fileName}`;
  const storageRef = ref(storage, storagePath);

  return new Promise<string>((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, blob, {
      contentType: mimeType,
      cacheControl: 'public,max-age=31536000',
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (snapshot.totalBytes > 0) {
          const pct = 20 + Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 80);
          options.onProgress?.(Math.min(99, pct));
        }
      },
      (error) => {
        reject(new Error(getFirebaseErrorMessageAz(error)));
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          options.onProgress?.(100);
          resolve(downloadUrl);
        } catch (err) {
          reject(new Error(getFirebaseErrorMessageAz(err)));
        }
      }
    );
  });
}

/**
 * Downloads an image from an external (or local /assets/...) URL, compresses it,
 * and uploads it into the user's own Firebase Storage folder users/{uid}/.
 */
export async function copyImageUrlToStorage(
  rawUrl: string,
  options: ImageUploadOptions
): Promise<string> {
  const safeUrl = sanitizeUrl(rawUrl, true);
  if (!safeUrl) {
    throw new Error('Keçərli bir şəkil linki (https://...) daxil edin.');
  }

  // If it's already stored in this user's Firebase Storage bucket, keep it as-is
  if (safeUrl.includes('firebasestorage.googleapis.com') && safeUrl.includes(encodeURIComponent(`users/${options.uid}/`))) {
    return safeUrl;
  }

  options.onProgress?.(5);

  let response: Response;
  try {
    response = await fetch(safeUrl, { mode: 'cors' });
  } catch {
    throw new Error(
      'Bu sayt şəklin birbaşa köçürülməsinə (CORS) icazə vermir. Zəhmət olmasa şəkli cihazınıza endirib "Cihazdan Seç" ilə yükləyin.'
    );
  }

  if (!response.ok) {
    throw new Error('Verilən linkdən şəkil endirilə bilmədi. Linkin işlək olduğundan əmin olun.');
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType && !contentType.startsWith('image/')) {
    throw new Error('Daxil edilən link birbaşa şəkil faylı deyil.');
  }

  const blob = await response.blob();
  return uploadImageFileToStorage(blob, options);
}

/**
 * Deletes all uploaded files in users/{uid}/ during full account deletion
 */
export async function deleteAllUserStorageFiles(uid: string): Promise<void> {
  if (!uid) return;
  const rootRef = ref(storage, `users/${uid}`);
  try {
    const folders = await listAll(rootRef);
    for (const itemRef of folders.items) {
      await deleteObject(itemRef).catch(() => {});
    }
    for (const prefixRef of folders.prefixes) {
      const sub = await listAll(prefixRef);
      for (const itemRef of sub.items) {
        await deleteObject(itemRef).catch(() => {});
      }
    }
  } catch {
    // Storage may not be enabled or empty; don't block account deletion
  }
}
