import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';
import { MixtapeTrack } from '../types';

interface MixtapePlayerProps {
  tracks: MixtapeTrack[];
  onOpenInfo?: (track: MixtapeTrack) => void;
}

export const MixtapePlayer: React.FC<MixtapePlayerProps> = ({ tracks, onOpenInfo }) => {
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  const activeTrack = tracks.find((t) => t.id === activeTrackId);

  // Synthesize chord arpeggio
  const playSoundNote = (freq: number) => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.95);
    } catch {
      // AudioContext blocked or not supported
    }
  };

  useEffect(() => {
    if (isPlaying && activeTrack) {
      const base = activeTrack.baseFrequency;
      const scale = [1, 1.25, 1.5, 1.875, 2]; // Major pentatonic intervals
      let step = 0;

      timerRef.current = window.setInterval(() => {
        const note = base * scale[step % scale.length];
        playSoundNote(note);
        step++;
        setProgress((prev) => (prev >= 100 ? 0 : prev + 4));
      }, 350);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, activeTrackId, isMuted]);

  const toggleTrack = (track: MixtapeTrack) => {
    if (activeTrackId === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveTrackId(track.id);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-3">
      {/* Scrollable Track Cards - Kompüter üçün əvvəlki eninə ölçülər, telefon üçün kompakt */}
      <div className="flex gap-3 sm:gap-4 overflow-x-auto px-5 sm:px-7 pb-2.5 hide-scrollbar snap-x snap-mandatory">
        {tracks.map((track) => {
          const isThisActive = activeTrackId === track.id;
          return (
            <div
              key={track.id}
              onClick={() => toggleTrack(track)}
              className="flex-none w-[130px] sm:w-[220px] bg-white border-2 border-black rounded-[16px] sm:rounded-[24px] brutal-shadow-xs sm:brutal-shadow overflow-hidden snap-start cursor-pointer transition-transform hover:-translate-y-0.5 sm:hover:-translate-y-1 active:translate-y-0 text-left select-none group"
            >
              <div
                className="h-[95px] sm:h-[180px] w-full relative flex items-center justify-center"
                style={{ background: track.gradient }}
              >
                <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-full bg-white/95 border-2 border-black brutal-shadow-xs sm:brutal-shadow-sm flex items-center justify-center transition-transform group-hover:scale-110">
                  {isThisActive && isPlaying ? (
                    <Pause className="w-4 h-4 sm:w-6 sm:h-6 text-black fill-black" />
                  ) : (
                    <Play className="w-4 h-4 sm:w-6 sm:h-6 text-black fill-black ml-0.5" />
                  )}
                </div>

                {isThisActive && isPlaying && (
                  <div className="absolute bottom-1.5 sm:bottom-3 left-2 sm:left-4 right-2 sm:right-4 flex items-center justify-center gap-0.5 sm:gap-1">
                    {[40, 75, 95, 60, 85, 50, 90, 65].map((h, i) => (
                      <span
                        key={i}
                        className="w-0.5 sm:w-1 bg-white rounded-full animate-pulse"
                        style={{
                          height: `${(h * 0.22).toFixed(0)}px`,
                          animationDelay: `${i * 120}ms`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-2 sm:p-3.5 text-[12px] sm:text-[14px] font-medium leading-tight">
                <span className="truncate pr-1 text-black font-semibold">{track.title}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenInfo) onOpenInfo(track);
                  }}
                  className="text-neutral-500 hover:text-black font-bold text-sm sm:text-base px-0.5 sm:px-1"
                  aria-label="Ətraflı"
                >
                  ⋮
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mini Player Floating Bar when a track is active */}
      {activeTrack && (
        <div className="mx-7 bg-white border-2 border-black rounded-2xl brutal-shadow p-3 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl border border-black flex items-center justify-center shrink-0"
              style={{ background: activeTrack.gradient }}
            >
              <Music className="w-5 h-5 text-white drop-shadow" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-black truncate">{activeTrack.title}</p>
              <p className="text-[11px] text-neutral-500">
                {isPlaying ? 'Oynadılır · Web Audio Lofi' : 'Dayandırıldı'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 text-neutral-600 hover:text-black rounded-lg transition-colors"
              title={isMuted ? 'Səsi aç' : 'Səsi bağla'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-neutral-800 transition-colors"
              aria-label={isPlaying ? 'Dayandır' : 'Oynat'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
