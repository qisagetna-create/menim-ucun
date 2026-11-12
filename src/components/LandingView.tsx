import React, { useState } from 'react';
import {
  X,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  BarChart3,
  Globe2,
  ChevronDown,
  Layers,
  Palette,
  ExternalLink,
} from 'lucide-react';
import { QLogo } from './QLogo';

interface LandingViewProps {
  onNavigate: (path: string) => void;
  defaultProfileSlug?: string;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onNavigate,
  defaultProfileSlug,
}) => {
  const [showBanner, setShowBanner] = useState(true);
  const [usernameInput, setUsernameInput] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, '');
    setUsernameInput(val);
    if (val.length >= 3) {
      setUsernameStatus('✓ Qeydiyyat üçün /admin bölməsinə davam edin');
    } else if (val.length > 0) {
      setUsernameStatus('Ən azı 3 simvol olmalıdır');
    } else {
      setUsernameStatus(null);
    }
  };

  const handleStartFree = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('/admin');
  };

  const faqs = [
    {
      q: 'Qisaget nədir və mənə necə kömək edir?',
      a: 'Qisaget bütün sosial şəbəkələrinizi, videolarınızı, musiqilərinizi və rəqəmsal mağazanızı bir ünvanda toplayan sadə və güclü bio link platformasıdır. Instagram və ya TikTok biodakı yeganə link yerinə Qisaget qoyaraq izləyicilərinizi istənilən resursa yönləndirə bilərsiniz.',
    },
    {
      q: 'Qisaget-dən istifadə etmək pulsuzdurmu?',
      a: 'Bəli! Qisaget-in əsas funksiyaları, limitsiz linklər, musiqi miksteypləri və standart rəng temaları tamamilə pulsuzdur. Əlavə qabaqcıl analitika və fərdi domenlər üçün xüsusi seçimlər də mövcuddur.',
    },
    {
      q: 'Rəqəmsal məhsullarımı necə sata bilərəm?',
      a: 'İdarə Panelindən (/admin) "Mağaza" bölməsinə daxil olub məhsulunuzun adını, qiymətini və fotosunu əlavə edin. İzləyiciləriniz birbaşa yaşıl "Sifariş" düyməsi ilə WhatsApp üzərindən sifariş verə bilərlər.',
    },
    {
      q: 'Öz unikal ünvanımı və rənglərimi seçə bilərəm?',
      a: 'Əlbəttə! İdarə Panelində Klassik Mavi, Günəş Şəfəqi, Nanə, Lavanda və Obsidian kimi xüsusi mövzular arasında seçim edə və öz unikal qisaget.az/adiniz linkinizi yarada bilərsiniz.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#a5d1f8] text-black">
      {/* Top Notification Announcement Banner */}
      {showBanner && (
        <div className="bg-[#7a0022] text-white text-center text-xs sm:text-sm py-3 px-10 relative font-medium">
          <span>Öz QısaGet profilinizi saniyələr içində yaradın. </span>
          <button
            type="button"
            onClick={() => onNavigate('/admin')}
            className="underline font-bold hover:text-amber-200 ml-1 transition-colors cursor-pointer"
          >
            İdarə Panelinə Keçin →
          </button>
          <button
            type="button"
            onClick={() => setShowBanner(false)}
            className="absolute right-4 top-2 text-lg opacity-80 hover:opacity-100 cursor-pointer"
            aria-label="Bağla"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Bar Contract: Zone 1 Wordmark, Zone 2 Nav Links, Zone 3 Primary Action */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-8">
        {/* Zone 1: Single Wordmark Element */}
        <div
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 group"
        >
          <span className="text-2xl font-black tracking-tighter text-[#12365c]">Qisaget</span>
          <div className="w-8 h-8 rounded-lg bg-white border-2 border-black flex items-center justify-center brutal-shadow-sm group-hover:rotate-6 transition-transform">
            <QLogo size={20} strokeWidth={9} />
          </div>
        </div>

        {/* Zone 2: Concise Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-bold text-[#10243d]">
          <a href="#features" className="hover:text-black transition-colors whitespace-nowrap shrink-0">
            Xüsusiyyətlər
          </a>
          <a href="#faq" className="hover:text-black transition-colors whitespace-nowrap shrink-0">
            Sual-Cavab
          </a>
          <button
            type="button"
            onClick={() => onNavigate('/mexfilik')}
            className="hover:text-black transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Məxfilik
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/sertler')}
            className="hover:text-black transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Şərtlər
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {defaultProfileSlug && (
            <button
              type="button"
              onClick={() => onNavigate(`/${defaultProfileSlug}`)}
              className="px-4 py-2 bg-white text-black font-bold text-xs sm:text-sm rounded-full border-2 border-black brutal-shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer hidden sm:flex"
            >
              Nümunə Profil
            </button>
          )}
          <button
            type="button"
            onClick={() => onNavigate('/admin')}
            className="px-5 py-2.5 bg-white text-black font-extrabold text-xs sm:text-sm rounded-full border-2 border-black brutal-shadow hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>İdarə Paneli</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 border-2 border-black brutal-shadow-sm text-xs font-black tracking-wider uppercase text-[#12365c]">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              BİR LİNK. BÜTÜN DÜNYA.
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-[#12365c] leading-[0.98] tracking-tight text-balance">
              Bioda sizin üçün hazırlanmış bir keçid.
            </h1>

            <p className="text-base sm:text-lg text-[#10243d] leading-relaxed max-w-xl">
              Biodakı link üçün Qisaget istifadə edən milyonlarla insana qoşulun. Instagram,
              TikTok, YouTube və digər sosial media profillərinizdən yaratdığınız, seçdiyiniz və
              satdığınız hər şeyi paylaşmağınıza kömək edəcək sadə bir link.
            </p>

            {/* Username Claim Input Box */}
            <form onSubmit={handleStartFree} className="space-y-2 max-w-md">
              <div className="flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-2xl border-2 border-black brutal-shadow">
                <div className="flex items-center px-3 text-neutral-500 font-bold text-sm select-none">
                  qisaget.az/
                </div>
                <input
                  type="text"
                  placeholder="adiniz"
                  value={usernameInput}
                  onChange={handleInputChange}
                  className="flex-1 px-2 py-2 text-sm font-bold text-black focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#12365c] hover:bg-[#0c243f] text-white font-bold text-sm rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center justify-center gap-2"
                >
                  <span>Pulsuz başlayın</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {usernameStatus && (
                <p
                  className={`text-xs font-semibold px-2 ${
                    usernameStatus.startsWith('✓') ? 'text-emerald-800' : 'text-neutral-700'
                  }`}
                >
                  {usernameStatus}
                </p>
              )}
            </form>

            <div className="pt-2 flex items-center gap-6 text-xs font-bold text-[#10243d]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Quraşdırma 1 dəqiqə</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Bank kartı tələb olunmur</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Device Frame */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[340px] bg-white border-4 border-black rounded-[42px] brutal-shadow-lg p-3.5 relative overflow-hidden">
              {/* Speaker notch */}
              <div className="w-24 h-4 bg-black rounded-full mx-auto mb-3" />

              {/* Miniature Profile Preview */}
              <div className="bg-[#a5d1f8] rounded-[28px] border-2 border-black p-4 text-center space-y-3 relative overflow-hidden">
                <div className="w-14 h-14 mx-auto rounded-full bg-white border-2 border-black flex items-center justify-center brutal-shadow-sm">
                  <QLogo size={32} strokeWidth={8} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-black">
                    {usernameInput ? `@${usernameInput}` : '@qisaget'}
                  </h4>
                  <p className="text-[11px] text-neutral-700 font-medium">
                    Hər şeyin varlığı. Sadə bir linkdə.
                  </p>
                </div>

                {/* Mock preview links */}
                <div className="space-y-1.5 pt-1">
                  <div className="p-2 bg-white rounded-full border border-black text-[11px] font-bold text-black brutal-shadow-sm flex items-center justify-center">
                    🎵 Qisaget Mixtape Pleylist
                  </div>
                  <div className="p-2 bg-white rounded-full border border-black text-[11px] font-bold text-black brutal-shadow-sm flex items-center justify-center">
                    🛍️ Rəqəmsal Məhsul Mağazası
                  </div>
                  <div className="p-2 bg-white rounded-full border border-black text-[11px] font-bold text-black brutal-shadow-sm flex items-center justify-center">
                    📸 Instagram & TikTok Kanalları
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('/admin')}
                  className="w-full py-2 bg-black text-white text-xs font-bold rounded-xl mt-3 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>İndi Başla</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* NUMERICAL RIGOR / CLAIM-TO-PROOF STRIP */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-black rounded-2xl p-5 brutal-shadow">
            <div className="text-3xl font-black text-[#12365c] tabular-nums">140,000+</div>
            <p className="text-xs font-bold text-neutral-600 mt-1">Aktiv Yaradıcı & Bloqer</p>
          </div>
          <div className="bg-white border-2 border-black rounded-2xl p-5 brutal-shadow">
            <div className="text-3xl font-black text-[#12365c] tabular-nums">3.4 Milyon</div>
            <p className="text-xs font-bold text-neutral-600 mt-1">Aylıq Link Klikləri</p>
          </div>
          <div className="bg-white border-2 border-black rounded-2xl p-5 brutal-shadow">
            <div className="text-3xl font-black text-[#12365c] tabular-nums">0.3 Saniyə</div>
            <p className="text-xs font-bold text-neutral-600 mt-1">Sürətli Yüklənmə Vaxtı</p>
          </div>
          <div className="bg-white border-2 border-black rounded-2xl p-5 brutal-shadow">
            <div className="text-3xl font-black text-[#12365c] tabular-nums">0% Komissiya</div>
            <p className="text-xs font-bold text-neutral-600 mt-1">Başlanğıc Mağaza Planı</p>
          </div>
        </div>

        {/* CORE CAPABILITIES (Bento Grid) */}
        <section id="features" className="mt-24 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl font-black text-[#12365c]">
              Yaradıcılar Niyə Qisaget-i Seçir?
            </h2>
            <p className="text-sm text-[#10243d] font-medium">
              Bütün rəqəmsal aktivlərinizi idarə etmək üçün lazım olan hər şey bir platformada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 (col-span-2) */}
            <div className="md:col-span-2 bg-white border-2 border-black rounded-[28px] p-7 brutal-shadow flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#a5d1f8] border-2 border-black flex items-center justify-center brutal-shadow-sm">
                  <ShoppingBag className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-black">
                  Birbaşa Bio-da Rəqəmsal Mağaza
                </h3>
                <p className="text-sm text-neutral-700 leading-relaxed max-w-lg">
                  İzləyicilərinizi mürəkkəb saytlara göndərməyə ehtiyac yoxdur. E-kitablarınızı,
                  foto presetlərinizi, məsləhət xidmətlərinizi və brend məhsullarınızı tək toxunuşla
                  satın.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-neutral-600">
                <span>Avtomatlaşdırılmış çatdırılma</span>
                <span className="text-black font-extrabold">Instant Checkout ✦</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white border-2 border-black rounded-[28px] p-7 brutal-shadow flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#ffd4b2] border-2 border-black flex items-center justify-center brutal-shadow-sm">
                  <BarChart3 className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-bold text-black">Dəqiq Analitika</h3>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  Hansı sosial şəbəkənin daha çox ziyarətçi gətirdiyini, ən çox kliklənən linkləri və
                  real zamanlı statistikaları izləyin.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-100 text-xs font-bold text-neutral-600">
                <span>Real vaxt metrikləri</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white border-2 border-black rounded-[28px] p-7 brutal-shadow flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#bcf2d6] border-2 border-black flex items-center justify-center brutal-shadow-sm">
                  <Palette className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-bold text-black">Fərdi Brend Dizaynı</h3>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  Neon-brutalizm, yumşaq pastel və ya tünd obsidian: profilinizi brendinizin
                  xarakterinə uyğun formalaşdırın.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-100 text-xs font-bold text-neutral-600">
                <span>5+ Hazır Rəng Sxemi</span>
              </div>
            </div>

            {/* Card 4 (col-span-2) */}
            <div className="md:col-span-2 bg-white border-2 border-black rounded-[28px] p-7 brutal-shadow flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#ded3ff] border-2 border-black flex items-center justify-center brutal-shadow-sm">
                  <Layers className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-black">
                  İnteraktiv Musiqi & Media İnteqrasiyası
                </h3>
                <p className="text-sm text-neutral-700 leading-relaxed max-w-lg">
                  Profilinizə daxil olan izləyicilər üçün xüsusi miksteyplər, audio treklər və
                  YouTube videolarını birbaşa səhifə daxilində oynadın.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-neutral-600">
                <span>Daxili Web Audio Pleyer</span>
                <span className="text-black font-extrabold">Canlı Səs Sintezi ✦</span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION SECTION */}
        <section id="faq" className="mt-24 max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-[#12365c]">Tez-tez Verilən Suallar</h2>
            <p className="text-sm text-[#10243d] font-medium">
              Qisaget haqqında bilmək istədiyiniz bütün məlumatlar
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white border-2 border-black rounded-2xl brutal-shadow overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-5 text-left font-bold text-base text-black flex items-center justify-between gap-4"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-neutral-700 leading-relaxed border-t border-neutral-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <section className="mt-24 bg-white border-4 border-black rounded-[36px] p-8 sm:p-12 brutal-shadow-lg text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#a5d1f8] border-2 border-black flex items-center justify-center brutal-shadow-sm">
            <QLogo size={36} strokeWidth={8} />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-[#12365c] tracking-tight">
            Öz Qisaget linkinizi bu gün başladın
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 max-w-lg mx-auto">
            1 dəqiqə ərzində qeydiyyatdan keçin, linklərinizi əlavə edin və sosial şəbəkələrinizin
            gücünü artırın.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigate('/admin')}
              className="px-8 py-4 bg-[#12365c] text-white font-black text-base rounded-full border-2 border-black brutal-shadow hover:-translate-y-1 active:translate-y-0 transition-transform cursor-pointer"
            >
              Pulsuz Profil Yarat
            </button>
          </div>
        </section>
      </main>

      {/* QUIET FOOTER */}
      <footer id="contact" className="border-t-2 border-black bg-white/70 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-neutral-700">
          <div className="flex items-center gap-2">
            <QLogo size={20} strokeWidth={9} />
            <span className="font-extrabold text-sm text-black">Qisaget</span>
            <span>— Sadə bir linkdə bütün dünya</span>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button type="button" onClick={() => onNavigate('/admin')} className="hover:text-black cursor-pointer">
              İdarə Paneli
            </button>
            <button type="button" onClick={() => onNavigate('/mexfilik')} className="hover:text-black cursor-pointer">
              Məxfilik
            </button>
            <button type="button" onClick={() => onNavigate('/sertler')} className="hover:text-black cursor-pointer">
              Şərtlər
            </button>
            <a href="mailto:qisaget.na@gmail.com" className="hover:text-black">
              Dəstək: qisaget.na@gmail.com
            </a>
            <span>© 2026 Qisaget</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
