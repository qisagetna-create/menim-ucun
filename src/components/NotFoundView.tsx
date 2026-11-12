import React from 'react';
import { ArrowLeft, SearchX } from 'lucide-react';
import { QLogo } from './QLogo';

interface NotFoundViewProps {
  requestedSlug?: string;
  onNavigate: (path: string) => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ requestedSlug, onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#6ea6d8] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border-2 border-black rounded-[32px] brutal-shadow p-7 sm:p-8 text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#a5d1f8] border-2 border-black flex items-center justify-center brutal-shadow-sm">
          <SearchX className="w-8 h-8 text-[#12365c]" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-black/15 text-[11px] font-bold text-neutral-700">
            <QLogo size={13} strokeWidth={9} />
            <span>404</span>
          </div>
          <h1 className="text-2xl font-black text-black tracking-tight">Səhifə tapılmadı</h1>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {requestedSlug ? (
              <>
                <span className="font-bold text-black">qisaget.az/{requestedSlug}</span> ünvanında hələ
                profil yaradılmayıb və ya silinib.
              </>
            ) : (
              'Axtardığınız səhifə mövcud deyil.'
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="flex-1 min-h-[44px] px-4 py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-neutral-800 brutal-shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ana Səhifə</span>
          </button>
        </div>
      </div>
    </div>
  );
};
