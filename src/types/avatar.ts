export type AvatarFrameType =
  | 'none'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'elite'
  | 'alpha_founder'
  | 'alpha_vip';

export interface AvatarFrameInfo {
  id: AvatarFrameType;
  name: string;
  description: string;
  badge: string;
  ringClass: string;
  glowClass: string;
  unlockedByDefault: boolean;
}

export interface PresetAvatar {
  id: string;
  name: string;
  category: 'cyberpunk' | 'trader' | 'crypto' | 'minimal';
  dataUrl: string;
}

export interface ExtendedUserProfileFields {
  avatarUrl?: string;
  avatarFrame?: AvatarFrameType;
  country?: string;
  city?: string;
  tradingExperience?: string;
  favouriteMarket?: string;
  favouriteSector?: string;
  avatarVisibility?: 'public' | 'followers' | 'private';
}
