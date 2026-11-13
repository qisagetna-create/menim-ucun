import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Image as ImageIcon,
  Link as LinkIcon,
  Upload,
  Camera,
  Check,
  MoveVertical,
  ZoomIn,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Loader2,
} from 'lucide-react';
import { copyImageUrlToStorage, uploadImageFileToStorage } from '../lib/storage';
import { useAuth } from '../contexts/AuthContext';
import { useBodyScrollLock } from '../lib/useBodyScrollLock';

interface PhotoUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImageUrl?: string;
  currentOffsetY?: number;
  currentScale?: number;
  displayName?: string;
  activeTab?: 'upload' | 'camera' | 'url';
  onTabChange?: (tab: 'upload' | 'camera' | 'url') => void;
  onSavePhotoSettings: (data: {
    imageUrl: string;
    offsetY: number;
    scale: number;
  }) => void;
}

export const PhotoUploaderModal: React.FC<PhotoUploaderModalProps> = ({
  isOpen,
  onClose,
  currentImageUrl = '',
  currentOffsetY = 20,
  currentScale = 1.08,
  displayName = 'Profil',
  activeTab: controlledTab,
  onTabChange,
  onSavePhotoSettings,
}) => {
  const { user } = useAuth();
  const [urlInput, setUrlInput] = useState(currentImageUrl);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
  const [offsetY, setOffsetY] = useState(currentOffsetY);
  const [scale, setScale] = useState(currentScale);
  const [internalTab, setInternalTab] = useState<'upload' | 'camera' | 'url'>('upload');
  const activeTab = controlledTab ?? internalTab;

  const setActiveTab = (next: 'upload' | 'camera' | 'url') => {
    if (onTabChange) {
      onTabChange(next);
    } else {
      setInternalTab(next);
    }
  };

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startOffsetRef = useRef(offsetY);

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setUrlInput(currentImageUrl);
      setPreviewUrl(currentImageUrl);
      setOffsetY(currentOffsetY ?? 20);
      setScale(currentScale ?? 1.08);
      setErrorMessage(null);
      setUploadProgress(null);
    }
  }, [isOpen, currentImageUrl, currentOffsetY, currentScale]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!user?.uid) {
      setErrorMessage('Şəkil yükləmək üçün əvvəlcə /admin bölməsindən daxil olun.');
      return;
    }

    setErrorMessage(null);
    setUploadProgress(5);
    try {
      const downloadUrl = await uploadImageFileToStorage(file, {
        uid: user.uid,
        folder: 'avatar',
        onProgress: (pct) => setUploadProgress(pct),
      });
      setUrlInput(downloadUrl);
      setPreviewUrl(downloadUrl);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Şəkil yüklənə bilmədi.');
    } finally {
      setTimeout(() => setUploadProgress(null), 500);
    }
  };

  const handleFetchExternalUrl = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setErrorMessage('Zəhmət olmasa şəkil linki daxil edin.');
      return;
    }
    if (!user?.uid) {
      setErrorMessage('Şəkli yadda saxlamaq üçün əvvəlcə /admin bölməsindən daxil olun.');
      return;
    }

    setErrorMessage(null);
    setUploadProgress(5);
    try {
      const storageUrl = await copyImageUrlToStorage(trimmed, {
        uid: user.uid,
        folder: 'avatar',
        onProgress: (pct) => setUploadProgress(pct),
      });
      setUrlInput(storageUrl);
      setPreviewUrl(storageUrl);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Linkdən şəkil köçürülə bilmədi.');
    } finally {
      setTimeout(() => setUploadProgress(null), 500);
    }
  };

  const handleSave = () => {
    onSavePhotoSettings({
      imageUrl: previewUrl.trim(),
      offsetY,
      scale,
    });
    onClose();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startOffsetRef.current = offsetY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaY = e.clientY - startYRef.current;
    const newOffset = Math.max(0, Math.min(100, startOffsetRef.current - deltaY * 0.4));
    setOffsetY(Math.round(newOffset));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      startYRef.current = e.touches[0].clientY;
      startOffsetRef.current = offsetY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const deltaY = e.touches[0].clientY - startYRef.current;
    const newOffset = Math.max(0, Math.min(100, startOffsetRef.current - deltaY * 0.4));
    setOffsetY(Math.round(newOffset));
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overscroll-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        data-scroll-container="true"
        className="w-full max-w-lg bg-white border-2 border-black rounded-[28px] brutal-shadow p-5 sm:p-6 relative max-h-[92vh] overflow-y-auto overscroll-contain modal-scrollable-content"
        style={{ overscrollBehavior: 'contain' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center border border-black/20 transition-colors cursor-pointer"
          aria-label="Bağla"
        >
          <X className="w-5 h-5 text-black" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-[#a5d1f8] border-2 border-black flex items-center justify-center brutal-shadow-sm">
            <ImageIcon className="w-5 h-5 text-black" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-black">Profil Fotosu və Mövqe</h3>
            <p className="text-xs text-neutral-500">
              Cihaz, kamera və ya link ilə yükləyin (sıxışdırılıb Storage-da saxlanılır)
            </p>
          </div>
        </div>

        {/* 3-Tab switch */}
        <div className="grid grid-cols-3 gap-1 bg-neutral-100 p-1 rounded-xl border border-black/10 mb-3">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`min-h-[40px] py-1.5 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'upload' ? 'bg-white text-black shadow-xs border border-black/10' : 'text-neutral-500'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Cihazdan</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`min-h-[40px] py-1.5 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'camera' ? 'bg-white text-black shadow-xs border border-black/10' : 'text-neutral-500'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Kamera</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`min-h-[40px] py-1.5 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'url' ? 'bg-white text-black shadow-xs border border-black/10' : 'text-neutral-500'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Şəkil Linki</span>
          </button>
        </div>

        {activeTab === 'upload' && (
          <label className="block p-4 border-2 border-dashed border-black/40 rounded-2xl text-center cursor-pointer hover:bg-neutral-50 transition-colors">
            <Upload className="w-6 h-6 text-neutral-500 mx-auto mb-1" />
            <span className="text-xs font-bold text-black block">Cihazın yaddaşından fayl seçin</span>
            <span className="text-[10px] text-neutral-500 block">
              Avtomatik max 1200px (~500 KB) sıxışdırma ilə yüklənir
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploadProgress !== null}
              className="hidden"
            />
          </label>
        )}

        {activeTab === 'camera' && (
          <label className="block p-4 border-2 border-dashed border-black/40 rounded-2xl text-center cursor-pointer hover:bg-neutral-50 transition-colors">
            <Camera className="w-6 h-6 text-neutral-500 mx-auto mb-1" />
            <span className="text-xs font-bold text-black block">Kamera ilə çəkin və ya Qalereyadan seçin</span>
            <span className="text-[10px] text-neutral-500 block">
              Mobil cihazlarda kamera/qalereya açılır
            </span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              disabled={uploadProgress !== null}
              className="hidden"
            />
          </label>
        )}

        {activeTab === 'url' && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/menim-fotom.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl border-2 border-black text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#12365c]"
              />
              <button
                type="button"
                onClick={handleFetchExternalUrl}
                disabled={uploadProgress !== null}
                className="min-h-[44px] px-4 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-neutral-800 disabled:opacity-60 cursor-pointer shrink-0"
              >
                Köçür
              </button>
            </div>
            <p className="text-[10px] text-neutral-500">
              Xarici linkdən şəkil sıxışdırılıb sizin Storage qovluğunuza saxlanacaq.
            </p>
          </div>
        )}

        {uploadProgress !== null && (
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-[#12365c]">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Şəkil sıxışdırılır və yüklənir...
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#12365c] transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {errorMessage && (
          <p className="mt-3 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {errorMessage}
          </p>
        )}

        {/* Live Interactive Preview Box */}
        {previewUrl ? (
          <div className="mt-4 pt-3 border-t border-neutral-200">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[11px] font-bold text-neutral-800 uppercase tracking-tight">
                Canlı Baxış (Mövqeyi sürüşdürə bilərsiniz):
              </p>
              <span className="text-[10px] text-neutral-500 font-medium">
                Mövqe: {offsetY}% · Miqyas: {Math.round(scale * 100)}%
              </span>
            </div>

            <div
              data-touch-drag="true"
              className="w-full h-44 rounded-2xl bg-[#a5d1f8] relative overflow-hidden border-2 border-black cursor-grab active:cursor-grabbing select-none touch-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={previewUrl}
                alt="Canlı Baxış"
                className="w-full h-full object-cover pointer-events-none transition-transform duration-75"
                style={{
                  objectPosition: `center ${offsetY}%`,
                  transform: `scale(${scale})`,
                }}
              />

              <div
                className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to bottom, rgba(165,209,248,0) 0%, rgba(165,209,248,0.2) 30%, rgba(165,209,248,0.7) 65%, rgba(165,209,248,1) 100%)',
                }}
              />

              <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full pointer-events-none flex items-center gap-1">
                <MoveVertical className="w-3 h-3 text-emerald-300" />
                <span>Yuxarı / Aşağı çəkin</span>
              </div>

              <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
                <span className="text-xs font-bold text-black bg-white/80 px-2.5 py-0.5 rounded-md shadow-xs">
                  {displayName}
                </span>
              </div>
            </div>

            {/* Position & Scale Sliders */}
            <div className="mt-3 bg-neutral-50 p-3 rounded-2xl border border-black/10 space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-neutral-800 mb-1">
                  <span className="flex items-center gap-1.5">
                    <MoveVertical className="w-3.5 h-3.5 text-blue-600" />
                    <span>Fotonu Yuxarı / Aşağı Sürüşdür:</span>
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setOffsetY((prev) => Math.max(0, prev - 5))}
                      className="px-2 py-1 bg-white border border-black/20 rounded hover:bg-neutral-100 text-[11px]"
                      title="Bir az yuxarı"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setOffsetY((prev) => Math.min(100, prev + 5))}
                      className="px-2 py-1 bg-white border border-black/20 rounded hover:bg-neutral-100 text-[11px]"
                      title="Bir az aşağı"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={offsetY}
                  onChange={(e) => setOffsetY(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
                />
              </div>

              <div className="pt-2 border-t border-neutral-200/60">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-800 mb-1">
                  <span className="flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Qıraqları Doldur / Miqyas (Zoom):</span>
                  </span>
                  <span className="text-[11px] font-semibold text-neutral-600">
                    {Math.round(scale * 100)}%
                  </span>
                </div>

                <input
                  type="range"
                  min="1.0"
                  max="1.5"
                  step="0.02"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
                />

                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setOffsetY(20);
                      setScale(1.08);
                    }}
                    className="flex items-center gap-1 text-[10px] text-neutral-700 hover:text-black cursor-pointer"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Sıfırla</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[44px] py-2.5 border-2 border-black rounded-xl text-xs font-bold hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            Ləğv et
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={uploadProgress !== null}
            className="flex-1 min-h-[44px] py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-neutral-800 brutal-shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Fotonu Tətbiq Et</span>
          </button>
        </div>
      </div>
    </div>
  );
};
