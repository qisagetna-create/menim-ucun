import React, { useState } from 'react';
import { X, Mail, CheckCircle2, ArrowRight } from 'lucide-react';

interface EmailCollectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailCollectorModal: React.FC<EmailCollectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Zəhmət olmasa düzgün e-poçt ünvanı daxil edin.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  const handleReset = () => {
    setEmail('');
    setName('');
    setSubmitted(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white border-2 border-black rounded-[28px] brutal-shadow p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center border border-black/20 transition-colors"
          aria-label="Bağla"
        >
          <X className="w-5 h-5 text-black" />
        </button>

        {submitted ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 border-2 border-emerald-600 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black">Təşəkkür edirik!</h3>
              <p className="text-xs text-neutral-600 mt-1">
                {email} ünvanı Qisaget bülleteninə uğurla əlavə olundu. Ən son yenilikləri ilk siz alacaqsınız.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="w-full py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors"
            >
              Bağla
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-[#ff8a10] border-2 border-black flex items-center justify-center brutal-shadow-sm">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-black">E-poçtları toplayın</h3>
              <p className="text-xs text-neutral-500">
                İzləyicilərinizin birbaşa e-poçt bazasını qurun və onlarla daim əlaqədə qalın.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Adınız
                </label>
                <input
                  type="text"
                  placeholder="Məsələn: Orxan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#ff8a10]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  E-poçt ünvanı *
                </label>
                <input
                  type="email"
                  required
                  placeholder="adiniz@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#ff8a10]"
                />
                {error && <p className="text-[11px] text-red-600 mt-1 font-semibold">{error}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-black text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 mt-2"
              >
                <span>Abunə ol</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
