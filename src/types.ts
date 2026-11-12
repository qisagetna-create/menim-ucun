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
  originalPrice?: number;
  discountPercent?: number;
  currency: string;
  category: 'Saat' | 'Rəqəmsal' | 'Merç' | 'Xidmət';
  description: string;
  gradient?: string;
  rating: number;
  reviewCount?: number;
  badge?: string;
  imageUrl?: string;
  colorName?: string;
  colorHex?: string;
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
  thumbnailUrl?: string;
  videoUrl?: string;
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

export interface SocialLinks {
  instagram: string;
  whatsapp: string;
  tiktok: string;
  telegram?: string;
  youtube?: string;
  facebook: string;
  linkedin: string;
  discord?: string;
}

export interface ProfileData {
  ownerUid?: string;
  username: string;
  displayName: string;
  bio: string;
  isVerified: boolean;
  themeId: string;
  wa: string;
  socials: SocialLinks;
  links: CustomLink[];
  products: ProductItem[];
  music: MixtapeTrack[];
  news: NewsCard[];
  heroImageUrl?: string;
  heroImageOffsetY?: number;
  heroImageScale?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface UserAccountDoc {
  uid: string;
  username: string;
  email: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}
