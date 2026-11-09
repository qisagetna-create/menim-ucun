import React from 'react';
import { X, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export interface CardModalInfo {
  title: string;
  subtitle?: string;
  description: string;
  gradient?: string;
  colorClass?: string;
  points?: string[];
  actionLabel?: string;
  onAction?: () => void;
}

interface CardDetailModalProps {
  info: CardModalInfo | null;
  onClose: () => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({ info, onClose }) => {
  if (!info) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white border-2 border-black rounded-[28px] brutal-shadow overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header banner */}
        <div
          className={`h-28 w-full p-6 relative flex items-end ${
            info.colorClass || 'bg-gradient-to-r from-blue-600 to-indigo-600'
          }`}
          style={info.gradient ? { background: info.gradient } : undefined}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center border border-black/30 transition-colors"
            aria-label="Bağla"
          >
            <X className="w-5 h-5 text-black" />
          </button>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 text-white text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            Qisaget Bələdçi
          </span>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-black leading-snug">{info.title}</h3>
            {info.subtitle && <p className="text-xs text-neutral-500 mt-1">{info.subtitle}</p>}
          </div>

          <p className="text-sm text-neutral-700 leading-relaxed">{info.description}</p>

          {info.points && info.points.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Üstünlüklər</p>
              {info.points.map((pt, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-neutral-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3">
            <button
              onClick={() => {
                if (info.onAction) info.onAction();
                onClose();
              }}
              className="w-full py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
            >
              <span>{info.actionLabel || 'Anladım'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
