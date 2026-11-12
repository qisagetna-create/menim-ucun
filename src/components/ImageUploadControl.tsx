import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Link as LinkIcon, Loader2, Trash2, Upload } from 'lucide-react';
import { copyImageUrlToStorage, uploadImageFileToStorage } from '../lib/storage';

interface ImageUploadControlProps {
  uid: string;
  folder: 'avatar' | 'products' | 'news' | 'uploads';
  value: string;
  onChange: (url: string) => void;
  label?: string;
  previewAspect?: 'square' | 'wide';
}

export const ImageUploadControl: React.FC<ImageUploadControlProps> = ({
  uid,
  folder,
  value,
  onChange,
  label = 'Şəkil əlavə et',
  previewAspect = 'square',
}) => {
  const [mode, setMode] = useState<'device' | 'camera' | 'url'>('device');
  const [urlInput, setUrlInput] = useState('');
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError(null);
    setProgress(1);
    try {
      const downloadUrl = await uploadImageFileToStorage(file, {
        uid,
        folder,
        onProgress: (pct) => setProgress(pct),
      });
      onChange(downloadUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Şəkil yüklənərkən xəta baş verdi.');
    } finally {
      setTimeout(() => setProgress(null), 500);
    }
  };

  const handleCopyUrl = async () => {
    if (!urlInput.trim()) {
      setError('Zəhmət olmasa şəkil linkini daxil edin.');
      return;
    }
    setError(null);
    setProgress(5);
    try {
      const downloadUrl = await copyImageUrlToStorage(urlInput.trim(), {
        uid,
        folder,
        onProgress: (pct) => setProgress(pct),
      });
      onChange(downloadUrl);
      setUrlInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Şəkil linkdən köçürülə bilmədi.');
    } finally {
      setTimeout(() => setProgress(null), 500);
    }
  };

  return (
    <div className="space-y-2.5 bg-neutral-50 border-2 border-black/15 rounded-2xl p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-extrabold text-black flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-[#12365c]" />
          {label}
        </span>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            Şəkli sil
          </button>
        )}
      </div>

      {/* Preview thumbnail */}
      {value && (
        <div
          className={`w-full overflow-hidden rounded-xl border border-black/20 bg-white ${
            previewAspect === 'wide' ? 'h-32' : 'h-28'
          }`}
        >
          <img
            src={value}
            alt="Yüklənmiş şəkil"
            className="w-full h-full object-contain"
            loading="lazy"
          />
        </div>
      )}

      {/* 3 upload method pills */}
      <div className="grid grid-cols-3 gap-1.5 bg-white p-1 rounded-xl border border-black/15">
        <button
          type="button"
          onClick={() => {
            setMode('device');
            setError(null);
          }}
          className={`min-h-[38px] px-2 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
            mode === 'device' ? 'bg-black text-white' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Upload className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Cihazdan</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('camera');
            setError(null);
          }}
          className={`min-h-[38px] px-2 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
            mode === 'camera' ? 'bg-black text-white' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Camera className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Kamera</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('url');
            setError(null);
          }}
          className={`min-h-[38px] px-2 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
            mode === 'url' ? 'bg-black text-white' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Link</span>
        </button>
      </div>

      {/* Mode content */}
      {mode === 'device' && (
        <label className="flex items-center justify-center gap-2 min-h-[44px] px-3 py-2.5 bg-white border-2 border-dashed border-black/35 rounded-xl text-xs font-bold text-black hover:bg-neutral-100 transition-colors cursor-pointer">
          <Upload className="w-4 h-4 text-[#12365c]" />
          <span>Cihazın yaddaşından fayl seç</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelected}
            disabled={progress !== null}
            className="hidden"
          />
        </label>
      )}

      {mode === 'camera' && (
        <label className="flex items-center justify-center gap-2 min-h-[44px] px-3 py-2.5 bg-white border-2 border-dashed border-black/35 rounded-xl text-xs font-bold text-black hover:bg-neutral-100 transition-colors cursor-pointer">
          <Camera className="w-4 h-4 text-[#12365c]" />
          <span>Kamera ilə çək və ya Qalereya</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelected}
            disabled={progress !== null}
            className="hidden"
          />
        </label>
      )}

      {mode === 'url' && (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://.../sekil.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            disabled={progress !== null}
            className="flex-1 min-h-[44px] px-3 py-2 bg-white border-2 border-black rounded-xl text-xs font-medium focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCopyUrl}
            disabled={progress !== null}
            className="min-h-[44px] px-3.5 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800 disabled:opacity-60 shrink-0 cursor-pointer"
          >
            Yüklə
          </button>
        </div>
      )}

      {/* Progress Bar */}
      {progress !== null && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#12365c]">
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Şəkil sıxışdırılır və Storage-a yazılır...
            </span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden border border-black/15">
            <div
              className="h-full bg-[#12365c] transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-2.5 py-2">
          {error}
        </p>
      )}

      <p className="text-[10px] text-neutral-500">
        Şəkillər avtomatik olaraq ən çox 1200px (~500 KB) ölçüsünə sıxışdırılır.
      </p>
    </div>
  );
};
