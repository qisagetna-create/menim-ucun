import React, { useState, useEffect, useRef } from 'react';
import { X, Image as ImageIcon, Link as LinkIcon, Upload, Check, MoveVertical, ZoomIn, RotateCcw, ArrowUp, ArrowDown } from 'lucide-react';

interface PhotoUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImageUrl?: string;
  currentOffsetY?: number;
  currentScale?: number;
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
  onSavePhotoSettings,
}) => {
  const [urlInput, setUrlInput] = useState(currentImageUrl);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
  const [offsetY, setOffsetY] = useState(currentOffsetY);
  const [scale, setScale] = useState(currentScale);
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url');
  
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startOffsetRef = useRef(offsetY);

  useEffect(() => {
    if (isOpen) {
      setUrlInput(currentImageUrl);
      setPreviewUrl(currentImageUrl);
      setOffsetY(currentOffsetY ?? 20);
      setScale(currentScale ?? 1.08);
    }
  }, [isOpen, currentImageUrl, currentOffsetY, currentScale]);

  if (!isOpen) return null;

  const handleUrlChange = (val: string) => {
    setUrlInput(val);
    setPreviewUrl(val);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setUrlInput(result);
        setPreviewUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSavePhotoSettings({
      imageUrl: urlInput.trim(),
      offsetY,
      scale,
    });
    onClose();
  };

  // Interactive mouse/touch drag on preview
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startOffsetRef.current = offsetY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaY = e.clientY - startYRef.current;
    // Dragging down moves object-position down (or shows lower part of image)
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white border-2 border-black rounded-[28px] brutal-shadow p-5 sm:p-6 relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center border border-black/20 transition-colors"
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
            <p className="text-xs text-neutral-500">Fotonu dəyişin, qıraqlarını doldurun və yuxarı/aşağı sürüşdürün</p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex bg-neutral-100 p-1 rounded-xl border border-black/10 mb-3">
          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'url' ? 'bg-white text-black shadow-xs border border-black/10' : 'text-neutral-500'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            Bulud Linki (URL)
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'upload' ? 'bg-white text-black shadow-xs border border-black/10' : 'text-neutral-500'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Cihazdan Yüklə
          </button>
        </div>

        {activeTab === 'url' ? (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="https://example.com/menim-fotom.jpg"
              value={urlInput}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#12365c]"
            />
            <p className="text-[10px] text-neutral-500">
              Firebase, Cloudinary, Imgur və ya istənilən veb foto linki.
            </p>
          </div>
        ) : (
          <div>
            <label className="block p-4 border-2 border-dashed border-black/40 rounded-2xl text-center cursor-pointer hover:bg-neutral-50 transition-colors">
              <Upload className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
              <span className="text-xs font-bold text-black block">Fotonu seçmək üçün toxunun</span>
              <span className="text-[10px] text-neutral-500 block">PNG, JPG və ya WebP formatı</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Live Interactive Preview Box */}
        {previewUrl ? (
          <div className="mt-4 pt-3 border-t border-neutral-200">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[11px] font-bold text-neutral-800 uppercase tracking-tight">
                Canlı Baxış (Mövqeyi əllə də sürüşdürə bilərsiniz):
              </p>
              <span className="text-[10px] text-neutral-500 font-medium">
                Mövqe: {offsetY}% · Miqyas: {Math.round(scale * 100)}%
              </span>
            </div>

            <div
              className="w-full h-44 rounded-2xl bg-[#a5d1f8] relative overflow-hidden border-2 border-black cursor-grab active:cursor-grabbing select-none"
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
                onError={() => {}}
              />

              {/* Exact Bottom Gradient Fade overlay */}
              <div
                className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
                style={{
                  background: 'linear-gradient(to bottom, rgba(165,209,248,0) 0%, rgba(165,209,248,0.2) 30%, rgba(165,209,248,0.7) 65%, rgba(165,209,248,1) 100%)',
                }}
              />

              <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full pointer-events-none flex items-center gap-1">
                <MoveVertical className="w-3 h-3 text-emerald-300" />
                <span>Yuxarı / Aşağı çəkin</span>
              </div>

              <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
                <span className="text-xs font-bold text-black bg-white/80 px-2.5 py-0.5 rounded-md shadow-xs">
                  Na.Mexman
                </span>
              </div>
            </div>

            {/* Position & Scale Sliders */}
            <div className="mt-3 bg-neutral-50 p-3 rounded-2xl border border-black/10 space-y-3">
              {/* Slider 1: Yuxarı / Aşağı Mövqe */}
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
                      className="px-1.5 py-0.5 bg-white border border-black/20 rounded hover:bg-neutral-100 text-[11px]"
                      title="Bir az yuxarı"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setOffsetY((prev) => Math.min(100, prev + 5))}
                      className="px-1.5 py-0.5 bg-white border border-black/20 rounded hover:bg-neutral-100 text-[11px]"
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

                <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                  <button
                    type="button"
                    onClick={() => setOffsetY(5)}
                    className="hover:text-black hover:underline cursor-pointer"
                  >
                    Ən Yuxarı (5%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOffsetY(25)}
                    className="hover:text-black hover:underline cursor-pointer font-bold text-blue-700"
                  >
                    Baş/Üz (25%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOffsetY(50)}
                    className="hover:text-black hover:underline cursor-pointer"
                  >
                    Mərkəz (50%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOffsetY(85)}
                    className="hover:text-black hover:underline cursor-pointer"
                  >
                    Aşağı (85%)
                  </button>
                </div>
              </div>

              {/* Slider 2: Miqyas / Qıraqları Doldur */}
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

                <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                  <button
                    type="button"
                    onClick={() => setScale(1.0)}
                    className="hover:text-black hover:underline cursor-pointer"
                  >
                    Standart (100%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScale(1.08)}
                    className="hover:text-black hover:underline cursor-pointer font-bold text-emerald-700"
                  >
                    Qıraqları Doldur (108%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScale(1.25)}
                    className="hover:text-black hover:underline cursor-pointer"
                  >
                    Böyüt (125%)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOffsetY(20);
                      setScale(1.08);
                    }}
                    className="flex items-center gap-0.5 text-neutral-700 hover:text-black cursor-pointer"
                    title="İlkin vəziyyətə qaytar"
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
            onClick={onClose}
            className="flex-1 py-2.5 border-2 border-black rounded-xl text-xs font-bold hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            Ləğv et
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-neutral-800 brutal-shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Fotonu Tətbiq Et</span>
          </button>
        </div>
      </div>
    </div>
  );
};
