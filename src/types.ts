export interface ThemeOption {
  id: string;
  name: string;
  bg: string;
  side: string;
  toggle: string;
  accent: string;
}

export interface CustomLink {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  iconType: 'website' | 'github' | 'discord' | 'design' | 'app' | 'tiktok' | 'help' | 'custom' | 'link';
  iconText?: string;
  clicks: number;
}

export interface ProductItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  category: 'Rəqəmsal' | 'Merç' | 'Xidmət';
  description: string;
  gradient: string;
  rating: number;
  badge?: string;
}

export interface MixtapeTrack {
  id: string;
  title: string;
  artist: string;
  gradient: string;
  duration: string;
  baseFrequency: number;
}

export interface NewsCard {
  id: string;
  title: string;
  content: string;
  gradient: string;
  isWide: boolean;
  tag: string;
}

export interface CreatorProfile {
  id: string;
  username: string;
  displayName: string;
  handle: string;
  bio: string;
  avatarColor: string;
  tagline: string;
}

export interface InstagramPost {
  id: string;
  gradient: string;
  caption: string;
  likes: number;
  comments: number;
  timeAgo: string;
}

export interface ProfileData {
  username: string;
  displayName: string;
  bio: string;
  isVerified: boolean;
  themeId: string;
  socials: {
    instagram: string;
    whatsapp: string;
    tiktok: string;
    facebook: string;
    linkedin: string;
    youtube?: string;
    discord?: string;
    email?: string;
  };
  links: CustomLink[];
  products: ProductItem[];
  heroImageUrl?: string;
  heroImageOffsetY?: number;
  heroImageScale?: number;
}
