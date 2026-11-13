import {
  ThemeOption,
  ProfileData,
  NewsCard,
  CreatorProfile,
  MixtapeTrack,
  InstagramPost,
  ProductItem,
} from '../types';

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'classic-blue',
    name: 'Klassik Mavi',
    bg: '#a5d1f8',
    side: '#6ea6d8',
    toggle: '#3b76ac',
    accent: '#12365c',
  },
  {
    id: 'sunset-peach',
    name: 'Günəş Şəfəqi',
    bg: '#ffd4b2',
    side: '#f3a871',
    toggle: '#d96820',
    accent: '#8c3503',
  },
  {
    id: 'mint-fresh',
    name: 'Təravətli Nanə',
    bg: '#bcf2d6',
    side: '#79d1a3',
    toggle: '#2e9460',
    accent: '#0d5431',
  },
  {
    id: 'lavender-dream',
    name: 'Lavanda',
    bg: '#ded3ff',
    side: '#ad95f5',
    toggle: '#6e4ec9',
    accent: '#39217a',
  },
  {
    id: 'dark-obsidian',
    name: 'Qara Obsidian',
    bg: '#252e3e',
    side: '#181e28',
    toggle: '#3c485e',
    accent: '#60a5fa',
  },
];

export const CALIPER_WATCHES: ProductItem[] = [
  {
    id: 'caliper-watch-white',
    title: 'GLACIER WHITE',
    price: 27,
    originalPrice: 45,
    discountPercent: 40,
    currency: 'AZN',
    category: 'Saat',
    description: '360° fırlanan çarx mexanizmi, ağ idman silikon kəməri, mat qara korpus və dəqiq kvars mexanizm.',
    rating: 5.0,
    reviewCount: 134,
    badge: 'ENDİRİM 40%',
    imageUrl: '/assets/aistudio/image_cdc8001f.png',
    colorName: 'Ağ',
    colorHex: '#ffffff',
  },
  {
    id: 'caliper-watch-blue',
    title: 'CHRONO-WHEEL',
    price: 27,
    originalPrice: 40,
    discountPercent: 33,
    currency: 'AZN',
    category: 'Saat',
    description: '360° fırlanan çarx mexanizmi, göy idman silikon kəməri, dərin mavi kaliper detalları və möhkəm korpus.',
    rating: 5.0,
    reviewCount: 172,
    badge: 'ENDİRİM 33%',
    imageUrl: '/assets/aistudio/image_bfc14340.png',
    colorName: 'Göy',
    colorHex: '#2563eb',
  },
  {
    id: 'caliper-watch-red',
    title: 'AEROVANTE-HÖRÜMÇƏK',
    price: 25,
    originalPrice: 42,
    discountPercent: 40,
    currency: 'AZN',
    category: 'Saat',
    description: '360° fırlanan hörümçək diski, alovlu qırmızı idman kəməri, qara korpus və dinamik kaliper vurğusu.',
    rating: 5.0,
    reviewCount: 182,
    badge: 'ENDİRİM 40%',
    imageUrl: '/assets/aistudio/image_dd17a3d1.png',
    colorName: 'Qırmızı',
    colorHex: '#ef4444',
  },
  {
    id: 'caliper-watch-orange',
    title: 'AEROVANTE-IGNIVANTE',
    price: 25,
    originalPrice: 39,
    discountPercent: 36,
    currency: 'AZN',
    category: 'Saat',
    description: '360° fırlanan idman diski, parlaq narıncı kəmər, cəsur avto-stil və eksklüziv kvars hərəkət mexanizmi.',
    rating: 5.0,
    reviewCount: 168,
    badge: 'ENDİRİM 36%',
    imageUrl: '/assets/aistudio/image_86ffd326.png',
    colorName: 'Narıncı',
    colorHex: '#f97316',
  },
];

export const INITIAL_PROFILE: ProfileData = {
  username: 'na.mexman',
  displayName: 'Na.Mexman',
  bio: 'Bütün işlədiyim layihələr və Mağazalarım burada, sosial media linklərim hamısı bir linkdə yığılmışdır qisaget tərəfindən',
  isVerified: true,
  themeId: 'classic-blue',
  wa: '994500000000',
  socials: {
    instagram: 'https://www.instagram.com/qisaget.az/?utm_source=ig_web_button_share_sheet',
    whatsapp: 'https://wa.me/994500000000',
    tiktok: 'https://tiktok.com/@na.mexman',
    telegram: '',
    youtube: 'https://youtube.com/@qisaget',
    facebook: 'https://facebook.com/na.mexman',
    linkedin: 'https://linkedin.com/in/na-mexman',
    discord: 'https://discord.gg/qisaget',
  },
  links: [
    {
      id: 'link-restoweb',
      title: 'RestoWeb',
      subtitle: 'Restoranlar üçün rezervasiya sistemi',
      url: 'https://ais-dev-mwf5gth5honsybz35zye6k-196080740499.europe-west3.run.app/',
      iconType: 'website',
      clicks: 2854,
    },
    {
      id: 'link-caliper',
      title: 'Caliper',
      subtitle: 'Saat brendim',
      url: 'https://caliper-store.vercel.app/?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAcGRvZgJzcnRjBmFwcF9pZA85MzY2MTk3NDMzOTI0NTkAAaflDtuQUvMbPKIKGgoC5f-jl8xHVYxtUWUHp5ZnCiH2WCnKRBuT-4MZx2czJw_aem_-IHXUdTiIurG6yYjeSrBHA',
      iconType: 'website',
      clicks: 1980,
    },
    {
      id: 'link-github',
      title: 'Github Profili',
      subtitle: 'Layihələr və kod repozitoriyaları',
      url: 'https://github.com/qisagetna-create',
      iconType: 'github',
      clicks: 3410,
    },
  ],
  products: CALIPER_WATCHES,
  music: [],
  news: [],
  heroImageUrl: 'https://res.cloudinary.com/trayqxob/image/upload/v1794514660/173888277_2903577833303116_1167198897043818110_n.jpg',
  heroImageOffsetY: 20,
  heroImageScale: 1.02,
};

export const QISAGET_ABOUT_SECTIONS = [
  {
    title: '1. Mövcud Problem və Rəqəmsal Çətinliklər',
    content:
      'Azərbaycan reallığında günümüzdə hər kəs öz işini, fəaliyyətini, xidmətini və ya yaratdığı məhsulu internetdə göstərmək üçün müxtəlif yollara əl atır. Amma ortada böyük bir problem var: hər dəfə yeni bir şeyə başlamaq, hər hansı bir xidməti təqdim etmək və ya insanlara özünü tanıtmaq üçün sıfırdan ayrıca sayt açmaq, yeni səhifələr düzəltmək, o qədər də dərin texniki detallarla baş sındırmaq məcburiyyətində qalırlar. Bu həm vaxt aparır, həm də insanı yorur. Məhz bu nöqtədə QısaGet ortaya çıxır və hər şeyi kökündən dəyişən rahat bir həll təqdim edir.',
  },
  {
    title: '2. QısaGet-in Təməl Məqsədi və Hədəf Auditoriyası',
    content:
      'Layihənin təməl məqsədi ondan ibarətdir ki, Azərbaycan ərazisində yaşayan həm fərdi şəxslər, həm öz işini görən ustalar, frilanserlər, influenserlər, həm də müxtəlif obyekt və mağaza sahibləri heç bir çətinlik çəkmədən özlərinə tək bir rəqəmsal ünvan yaratsınlar. İnsanlar artıq hər dəfə ayrı-ayrı səhifələr açmağa ehtiyac duymadan, öz müştərilərini, dostlarını və ya izləyicilərini birbaşa vahid bir platformaya – məhz öz şəxsi QısaGet linkinə yönəldə biləcəklər.',
  },
  {
    title: '3. Platformanın İmkanları və İstifadəçi Təcrübəsi',
    content:
      'Bu platforma üzərindən hər kəs öz şəxsi fəaliyyətini, gördüyü işləri, sosial media hesablarını, əlaqə vasitələrini və təklif etdiyi xidmətləri son dərəcə səliqəli şəkildə paylaşa bilir. Ən əsası isə, istəyən hər kəs bu sistem daxilində öz onlayn mağazasını rahatlıqla aça və idarə edə bilər. Qarşı tərəfə baxdıqda isə, yəni səhifəyə daxil olan müştəri və ya izləyici üçün hər şey o qədər sadə və aydın olur ki, həmin şəxsin və ya obyektin tam olaraq nə iş gördüyünü, hansı məhsulları satdığını və ya hansı xidmətləri təklif etdiyini heç bir əlavə çətinlik çəkmədən dərhal başa düşür və anlayır. Heç bir qarışıqlıq, uzun-uzadı axtarışlar olmur; hər şey bir toxunuşla qarşısındadır.',
  },
  {
    title: '4. Hazırkı Sınaq Mərhələsi və Gələcək Baxış',
    content:
      'Hazırda layihə tam gücü ilə işə düşməzdən əvvəl aktiv sınaq mərhələsindədir. Bu mərhələnin əsas məqsədi sistemin işlək mexanizmini yoxlamaq, istifadəçilərin platformanı necə qarşıladığını görmək, yarana biləcək çatışmazlıqları aradan qaldırmaq və onu ən rahat, ən tətbiq edilə bilən formaya gətirməkdir. Sınaq dövrü bitdikdən və hər şey ideal vəziyyətə gətirildikdən sonra platforma daha geniş kütlələrə açılacaq və yerli bazarda hər kəsin gündəlik istifadə edəcəyi əsas rəqəmsal alətlərdən birinə çevriləcək.',
  },
];

export const QISAGET_PRIVACY_SECTIONS = [
  {
    title: '1. Topladığımız Məlumatlar',
    content:
      'QısaGet səhifəsində yalnız açıq profil məlumatları (ad, bio, sosial linklər, məhsullar və WhatsApp sifariş əlaqəsi) göstərilir. Ziyarətçilərdən əlavə şəxsi məlumat toplanmır və profilə baxış tam anonim şəkildə həyata keçirilir.',
  },
  {
    title: '2. Məlumatların Saxlanması və Təhlükəsizlik',
    content:
      'Platforma məlumatları Google Firebase infrastrukturu üzərində təhlükəsiz şəkildə saxlanılır. Şəxsi e-poçt ünvanları və sistem qeydləri ictimai profil səhifəsində heç vaxt nümayiş etdirilmir.',
  },
  {
    title: '3. Üçüncü Tərəf Keçidləri',
    content:
      'Səhifədə yerləşdirilən WhatsApp, Instagram, YouTube, GitHub və mağaza keçidləri müvafiq rəsmi platformalara yönləndirir. Həmin platformaların öz məxfilik qaydaları tətbiq olunur.',
  },
  {
    title: '4. Əlaqə və Məlumat Hüquqları',
    content:
      'Məxfilik siyasəti, məlumatların yenilənməsi və ya silinməsi ilə bağlı istənilən sual üçün qisaget.na@gmail.com elektron poçt ünvanı vasitəsilə əlaqə saxlaya bilərsiniz.',
  },
];

export const QISAGET_TERMS_SECTIONS = [
  {
    title: '1. Platformadan İstifadə Qaydaları',
    content:
      'QısaGet istifadəçilərə öz rəqəmsal vizitkartını, layihələrini, sosial hesablarını və mağazasını tək bir ünvanda təqdim etmək imkanı yaradır. Saytdan istifadə tamamilə ödənişsiz və sərbəstdir.',
  },
  {
    title: '2. Məzmun və Müəllif Hüquqları',
    content:
      'Səhifədə yerləşdirilən bütün mətnlər, loqolar, layihə keçidləri və məhsul məlumatları müvafiq sahibinə məxsusdur. Qanunsuz məzmun, fişinq və ya zərərli keçidlərin yayılması qəti qadağandır.',
  },
  {
    title: '3. Mağaza və WhatsApp Sifarişləri',
    content:
      'Mağaza bölməsində təqdim olunan məhsullar və "Sifariş" düymələri müştərini birbaşa rəsmi WhatsApp xəttinə yönləndirir. Qiymət, çatdırılma və zəmanət şərtləri birbaşa satıcı ilə dəqiqləşdirilir.',
  },
  {
    title: '4. Platforma İnkişafı və Yenilənmələr',
    content:
      'QısaGet hazırda aktiv inkişaf mərhələsindədir. İstifadə şərtləri və xüsusiyyətlər vaxtaşırı təkmilləşdirilə bilər; yenilənmiş şərtlər yayımlandığı andan qüvvəyə minir.',
  },
];

export const NEWS_CARDS: NewsCard[] = [
  {
    id: 'news-1',
    title: 'Qisaget Haqqında',
    content: 'Qısaget — bütün linklərinizi, layihələrinizi və mağazalarınızı tək toxunuşda birləşdirən müasir platformadır.',
    gradient: 'bg-[#a5d1f8]',
    isWide: true,
    tag: 'Qısaget',
    thumbnailUrl: '/assets/aistudio/image_4e3c2bd5.png',
  },
  {
    id: 'news-2',
    title: 'Azərbaycan Respublikasının Dövlət himni',
    content: 'YouTube videosunu birbaşa izləyin və ya YouTube-da açın.',
    gradient: 'bg-[#12365c]',
    isWide: true,
    tag: 'Dövlət Himni',
    thumbnailUrl: 'https://img.youtube.com/vi/oSixJAPb4L0/maxresdefault.jpg',
    videoUrl: 'https://youtu.be/oSixJAPb4L0',
  },
];

export const FEATURED_LINKERS: CreatorProfile[] = [
  {
    id: 'linker-1',
    username: 'bella.kay',
    displayName: '@bella.kay',
    handle: '✳/bella.kay',
    bio: 'bella.kay Rəsmi: TikTok, Instagram | Qisaget',
    avatarColor: 'bg-[#6e0007]',
    tagline: 'Lifestyle & Moda bloqeri',
  },
  {
    id: 'linker-2',
    username: 'hadasdoesrealestate',
    displayName: 'Hadas Brown',
    handle: '✳/hadasdoesrealestate',
    bio: 'Hadas Brown Realtor - Daşınmaz əmlak və investisiya bələdçisi',
    avatarColor: 'bg-[#2e2523]',
    tagline: 'Daşınmaz əmlak eksperti',
  },
  {
    id: 'linker-3',
    username: 'milesbowen',
    displayName: 'Miles Bowen',
    handle: '✳/milesbowen',
    bio: 'Miles Bowen Rəsmi Musiqi və Tur Məlumatları',
    avatarColor: 'bg-[#1b2232]',
    tagline: 'İfaçı & Prodüser',
  },
];

export const MIXTAPES: MixtapeTrack[] = [
  {
    id: 'mix-1',
    title: 'Mühazirə 1 · PDF',
    artist: 'Na.Mexman',
    gradient: 'linear-gradient(135deg,#a50c24,#f0b0c0)',
    duration: 'PDF',
  },
  {
    id: 'mix-2',
    title: 'Mühazirə 2 · PDF',
    artist: 'Na.Mexman',
    gradient: 'linear-gradient(135deg,#7a4a2a,#d9b96a)',
    duration: 'PDF',
  },
  {
    id: 'mix-3',
    title: 'Mühazirə 3 · PDF',
    artist: 'Na.Mexman',
    gradient: 'linear-gradient(135deg,#0f5a2a,#7ab2e0)',
    duration: 'PDF',
  },
];

export const MONETIZATION_CARDS = [
  {
    id: 'mon-1',
    title: 'Satışa başlayın',
    desc: 'Rəqəmsal fayllarınızı, şablonlarınızı və məhsullarınızı saniyələr içində satın.',
    colorClass: 'bg-[#00a9c4]',
    tag: 'E-Ticarət',
  },
  {
    id: 'mon-2',
    title: 'Komissiya qazanın',
    desc: 'Tövsiyə etdiyiniz məhsulların tərəfdaşlıq linklərindən davamlı qazanc əldə edin.',
    colorClass: 'bg-[#cd00d8]',
    tag: 'Affiliate',
  },
  {
    id: 'mon-3',
    title: 'Rəqəmsal Məhsullar',
    desc: 'PDF bələdçilər, audio dərslər və dizayn resursları üçün avtomatlaşdırılmış çatdırılma.',
    colorClass: 'bg-[#1b2232]',
    tag: 'Download',
  },
];

export const GROWTH_CARDS = [
  {
    id: 'grow-1',
    title: 'E-poçtları toplayın',
    desc: 'İzləyicilərinizin birbaşa e-poçt bazasını qurun və onlara yeni məzmun göndərin.',
    colorClass: 'bg-[#ff8a10]',
    tag: 'Bülleten',
    actionText: 'Toplama formunu aç',
  },
  {
    id: 'grow-2',
    title: 'Məzmununuzu planlaşdırın',
    desc: 'Post və linklərinizi vaxtında avtomatik aktivləşən cədvəllə nizamlayın.',
    colorClass: 'bg-[#0a1a9a]',
    tag: 'Avtomatlaşdırma',
    actionText: 'Planlamanı sına',
  },
  {
    id: 'grow-3',
    title: 'Nişanınızı avtomatlaşdırın',
    desc: 'Yeni izləyicilərə avtomatik salamlama mesajı və eksklüziv hədiyyə təqdim edin.',
    colorClass: 'bg-[#1a73e8]',
    tag: 'Engagement',
    actionText: 'Quraşdırma',
  },
];

export const INSPIRATION_CARDS = [
  {
    id: 'insp-1',
    title: 'Bio linkiniz internetin ən işlək kəsişməsidir',
    desc: 'Bütün sosial media kanallarından gələn trafiki bir nöqtədə toplayıb real nəticəyə çevirin.',
    colorClass: 'bg-[#1f4fd0]',
  },
  {
    id: 'insp-2',
    title: 'Vizual fərdilik brendinizin açarıdır',
    desc: 'Öz rəng palitranız, şriftləriniz və stilinizlə fərqlənin.',
    colorClass: 'bg-gradient-to-br from-[#f1e6dc] to-[#b99a7a]',
  },
  {
    id: 'insp-3',
    title: 'Qisaget-də analitika',
    desc: 'Hansı linklərin ən çox klik aldığını, izləyicilərin haradan gəldiyini canlı görün.',
    colorClass: 'bg-gradient-to-br from-[#dfe7ec] to-[#8a6e5a]',
  },
];

export const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: 'ig-1',
    gradient: 'linear-gradient(160deg, #3566d6, #7fb0ff)',
    caption: 'Qisaget ilə yeni profil dizaynı: sadə, sürətli və zövqlü ✦',
    likes: 842,
    comments: 54,
    timeAgo: '2 gün əvvəl',
  },
  {
    id: 'ig-2',
    gradient: 'linear-gradient(160deg, #ff8a10, #ffb366)',
    caption: 'Yaradıcılar üçün 5 vacib bio link qaydası 📌',
    likes: 1205,
    comments: 89,
    timeAgo: '4 gün əvvəl',
  },
  {
    id: 'ig-3',
    gradient: 'linear-gradient(160deg, #d6ef2a, #8bc34a)',
    caption: 'Mağaza bölməmiz artıq aktivdir! Rəqəmsal məhsullarınızı satın.',
    likes: 673,
    comments: 32,
    timeAgo: '1 həftə əvvəl',
  },
  {
    id: 'ig-4',
    gradient: 'linear-gradient(160deg, #cba8f0, #e6b8f5)',
    caption: 'Hər həftə yeni musiqi miksteypləri ilə tanış olun 🎵',
    likes: 914,
    comments: 41,
    timeAgo: '1 həftə əvvəl',
  },
  {
    id: 'ig-5',
    gradient: 'linear-gradient(160deg, #10203a, #2c3e50)',
    caption: 'Dizayn redaktoru ilə öz stilinizi tapın.',
    likes: 1450,
    comments: 112,
    timeAgo: '2 həftə əvvəl',
  },
  {
    id: 'ig-6',
    gradient: 'linear-gradient(160deg, #f2ecdf, #d7ccc8)',
    caption: 'Qisaget icmasına qoşulan bütün yeni linkerləri salamlayırıq!',
    likes: 588,
    comments: 29,
    timeAgo: '3 həftə əvvəl',
  },
];
