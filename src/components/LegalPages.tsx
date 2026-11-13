import React from 'react';
import { ArrowLeft, FileText, ShieldCheck } from 'lucide-react';
import { QLogo } from './QLogo';
import { goBackOrReplace } from '../lib/navigation';

interface LegalPageProps {
  mode: 'privacy' | 'terms';
  onNavigate: (path: string) => void;
}

export const LegalPages: React.FC<LegalPageProps> = ({ mode, onNavigate }) => {
  const isPrivacy = mode === 'privacy';

  return (
    <div className="min-h-screen bg-[#a5d1f8] text-black py-6 sm:py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => goBackOrReplace('/')}
            className="min-h-[44px] px-4 py-2 bg-white border-2 border-black rounded-full brutal-shadow-sm font-bold text-xs sm:text-sm flex items-center gap-2 hover:-translate-y-0.5 transition-transform cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ana Səhifə</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate(isPrivacy ? '/sertler' : '/mexfilik')}
            className="min-h-[44px] px-4 py-2 bg-white border-2 border-black rounded-full brutal-shadow-sm font-bold text-xs sm:text-sm hover:-translate-y-0.5 transition-transform cursor-pointer"
          >
            {isPrivacy ? 'İstifadə Şərtləri →' : 'Məxfilik Siyasəti →'}
          </button>
        </div>

        <article className="bg-white border-2 border-black rounded-[28px] brutal-shadow p-6 sm:p-8 space-y-6">
          <header className="flex items-center gap-3.5 pb-5 border-b-2 border-black/10">
            <div className="w-12 h-12 rounded-2xl bg-[#a5d1f8] border-2 border-black flex items-center justify-center brutal-shadow-sm shrink-0">
              {isPrivacy ? (
                <ShieldCheck className="w-6 h-6 text-[#12365c]" />
              ) : (
                <FileText className="w-6 h-6 text-[#12365c]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#12365c]">
                  QısaGet Platforması
                </span>
                <QLogo size={14} strokeWidth={9} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight mt-0.5">
                {isPrivacy ? 'Məxfilik Siyasəti' : 'İstifadə Şərtləri'}
              </h1>
              <p className="text-xs text-neutral-500 mt-1">Son yenilənmə: 2026</p>
            </div>
          </header>

          {isPrivacy ? (
            <div className="space-y-5 text-sm text-neutral-800 leading-relaxed">
              <section className="space-y-1.5">
                <h2 className="text-base font-extrabold text-black">1. Topladığımız Məlumatlar</h2>
                <p>
                  QısaGet platformasında hesab yaratdıqda yalnız identifikasiya üçün e-poçt ünvanınız
                  (Google və ya E-poçt linki ilə giriş zamanı) və profilinizdə könüllü paylaşdığınız
                  məlumatlar (istifadəçi adı, ad, bio, linklər, məhsullar, WhatsApp sifariş nömrəsi və
                  yüklədiyiniz şəkillər) saxlanılır.
                </p>
              </section>

              <section className="space-y-1.5">
                <h2 className="text-base font-extrabold text-black">2. Məlumatların Saxlanması və Təhlükəsizlik</h2>
                <p>
                  Bütün məlumatlar Google Firebase (Firestore və Firebase Storage) infrastrukturunda
                  şifrələnmiş şəkildə saxlanılır. E-poçt ünvanınız açıq profil səhifəsində heç vaxt
                  göstərilmir və yalnız hesab sahibinə əlçatandır. Şəkillər yüklənməzdən əvvəl
                  brauzerinizdə sıxışdırılır.
                </p>
              </section>

              <section className="space-y-1.5">
                <h2 className="text-base font-extrabold text-black">3. Üçüncü Tərəf Xidmətləri</h2>
                <p>
                  Saytın autentifikasiyası, məlumat bazası və spam qorunması üçün Firebase Authentication,
                  Cloud Firestore, Firebase Storage və App Check (reCAPTCHA) istifadə edilə bilər.
                  Məlumatlarınız heç bir halda üçüncü tərəf reklam şəbəkələrinə satılmır.
                </p>
              </section>

              <section className="space-y-1.5">
                <h2 className="text-base font-extrabold text-black">4. Hüquqlarınız və Məlumatların Silinməsi</h2>
                <p>
                  İstənilən vaxt şəxsi məlumatlarınızın yenilənməsi və ya birdəfəlik silinməsi ilə bağlı{' '}
                  <a href="mailto:qisaget.na@gmail.com" className="underline font-bold text-[#12365c]">
                    qisaget.na@gmail.com
                  </a>{' '}
                  ünvanı vasitəsilə müraciət edə bilərsiniz.
                </p>
              </section>
            </div>
          ) : (
            <div className="space-y-5 text-sm text-neutral-800 leading-relaxed">
              <section className="space-y-1.5">
                <h2 className="text-base font-extrabold text-black">1. Platformadan İstifadə</h2>
                <p>
                  QısaGet yaradıcılara, bizneslərə və fərdi şəxslərə linklərini və məhsullarını tək
                  ünvanda (`qisaget.az/istifadeci`) təqdim etmək imkanı verir. Hər bir istifadəçi seçdiyi
                  istifadəçi adı və yerləşdirdiyi məzmuna görə şəxsən məsuliyyət daşıyır.
                </p>
              </section>

              <section className="space-y-1.5">
                <h2 className="text-base font-extrabold text-black">2. Qadağan Edilən Məzmun</h2>
                <p>
                  Qanunsuz fəaliyyət, müəllif hüquqlarının pozulması, fişinq linkləri, zərərli proqram
                  keçidləri, saxta şəxsiyyət təqdimatı və spam məqsədli profillərin yaradılması
                  qəti qadağandır. Belə profillər xəbərdarlıq edilmədən silinə bilər.
                </p>
              </section>

              <section className="space-y-1.5">
                <h2 className="text-base font-extrabold text-black">3. Mağaza və Sifarişlər</h2>
                <p>
                  Mağaza bölməsində göstərilən məhsullar, qiymətlər və &quot;Sifariş&quot; (WhatsApp)
                  düymələri birbaşa profil sahibi ilə müştəri arasında əlaqə yaradır. QısaGet alqı-satqı
                  tərəfi deyil və tərəflər arasındakı çatdırılma/ödəniş razılaşmalarına görə məsuliyyət
                  daşımır.
                </p>
              </section>

              <section className="space-y-1.5">
                <h2 className="text-base font-extrabold text-black">4. Qorunan İstifadəçi Adları</h2>
                <p>
                  Sistem marşrutları (`admin`, `login`, `api`, `mexfilik`, `sertler` və s.) platforma
                  tərəfindən qorunur və şəxsi profil adı kimi qeydiyyata alına bilməz.
                </p>
              </section>
            </div>
          )}
        </article>
      </div>
    </div>
  );
};
