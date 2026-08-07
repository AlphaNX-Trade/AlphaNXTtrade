import { AvatarFrameInfo, AvatarFrameType, PresetAvatar } from '@/types/avatar';

export const AVATAR_FRAMES: AvatarFrameInfo[] = [
  {
    id: 'none',
    name: 'Default Classic',
    description: 'Clean minimalist ring for everyday trading.',
    badge: 'Standard',
    ringClass: 'ring-2 ring-border',
    glowClass: '',
    unlockedByDefault: true,
  },
  {
    id: 'silver',
    name: 'Silver Sheen',
    description: 'Metallic silver sheen ring with subtle shine.',
    badge: 'Silver',
    ringClass: 'ring-2 ring-slate-300 dark:ring-slate-400',
    glowClass: 'shadow-[0_0_12px_rgba(203,213,225,0.5)]',
    unlockedByDefault: true,
  },
  {
    id: 'gold',
    name: 'Radiant Gold',
    description: 'Glowing gold aura for high performing traders.',
    badge: 'Gold',
    ringClass: 'ring-2 ring-amber-400 dark:ring-amber-300',
    glowClass: 'shadow-[0_0_16px_rgba(251,191,36,0.6)] animate-pulse',
    unlockedByDefault: true,
  },
  {
    id: 'platinum',
    name: 'Platinum Shimmer',
    description: 'Futuristic cyan platinum glow ring.',
    badge: 'Platinum',
    ringClass: 'ring-2 ring-cyan-400 dark:ring-cyan-300',
    glowClass: 'shadow-[0_0_18px_rgba(34,211,238,0.7)]',
    unlockedByDefault: false,
  },
  {
    id: 'diamond',
    name: 'Diamond Prism',
    description: 'Multicolor prism shimmer frame for top rankers.',
    badge: 'Diamond',
    ringClass: 'ring-2 ring-indigo-400 dark:ring-purple-300',
    glowClass: 'shadow-[0_0_20px_rgba(129,140,248,0.8)]',
    unlockedByDefault: false,
  },
  {
    id: 'elite',
    name: 'Elite Cyber',
    description: 'Neon teal & emerald matrix aura.',
    badge: 'Elite',
    ringClass: 'ring-2 ring-emerald-400 dark:ring-teal-300',
    glowClass: 'shadow-[0_0_20px_rgba(52,211,153,0.7)]',
    unlockedByDefault: false,
  },
  {
    id: 'alpha_founder',
    name: 'Alpha Founder',
    description: 'Fiery gold-orange pulse for early platform pioneers.',
    badge: 'Founder',
    ringClass: 'ring-2 ring-amber-500 dark:ring-orange-400',
    glowClass: 'shadow-[0_0_24px_rgba(245,158,11,0.9)] animate-pulse',
    unlockedByDefault: true,
  },
  {
    id: 'alpha_vip',
    name: 'Alpha VIP Halo',
    description: 'Deep violet & magenta luxury aura.',
    badge: 'VIP',
    ringClass: 'ring-2 ring-purple-500 dark:ring-fuchsia-400',
    glowClass: 'shadow-[0_0_24px_rgba(168,85,247,0.9)] animate-pulse',
    unlockedByDefault: true,
  },
];

export function getFrameInfo(frameType?: AvatarFrameType): AvatarFrameInfo {
  return AVATAR_FRAMES.find((f) => f.id === frameType) || AVATAR_FRAMES[0];
}

/**
 * Generate deterministic gradient pairs based on user name or UID
 */
const GRADIENT_PAIRS = [
  { from: '#3b82f6', to: '#8b5cf6', name: 'Blue Violet' },
  { from: '#10b981', to: '#06b6d4', name: 'Emerald Cyan' },
  { from: '#f59e0b', to: '#ef4444', name: 'Amber Red' },
  { from: '#8b5cf6', to: '#ec4899', name: 'Purple Pink' },
  { from: '#06b6d4', to: '#3b82f6', name: 'Cyan Blue' },
  { from: '#6366f1', to: '#14b8a6', name: 'Indigo Teal' },
  { from: '#f43f5e', to: '#fb923c', name: 'Rose Orange' },
];

export function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'AN';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

export function getGradientForName(name?: string) {
  if (!name) return GRADIENT_PAIRS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENT_PAIRS.length;
  return GRADIENT_PAIRS[index];
}

/**
 * Client-side image crop and compress tool to convert File or Blob into WebP / Data URL
 */
export function compressAndCropImage(
  fileOrBlob: File | Blob,
  maxSize: number = 300,
  quality: number = 0.85,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image element'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Crop to square from center
        const size = Math.min(width, height);
        const startX = (width - size) / 2;
        const startY = (height - size) / 2;

        canvas.width = maxSize;
        canvas.height = maxSize;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(
          img,
          startX,
          startY,
          size,
          size,
          0,
          0,
          maxSize,
          maxSize,
        );

        // Try WebP first, fallback to jpeg
        try {
          const dataUrl = canvas.toDataURL('image/webp', quality);
          resolve(dataUrl);
        } catch {
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(fileOrBlob);
  });
}

/**
 * Preset futuristic avatars catalog
 */
export const PRESET_AVATARS: PresetAvatar[] = [
  {
    id: 'preset_cyber_bull',
    name: 'Quantum Bull',
    category: 'cyberpunk',
    dataUrl:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset_matrix_trader',
    name: 'Matrix Analyst',
    category: 'cyberpunk',
    dataUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset_apex_eagle',
    name: 'Apex Trader',
    category: 'trader',
    dataUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset_neon_trader',
    name: 'Neon Voyager',
    category: 'cyberpunk',
    dataUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset_alpha_whale',
    name: 'Alpha Whale',
    category: 'crypto',
    dataUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset_gold_satoshi',
    name: 'Gold Satoshi',
    category: 'crypto',
    dataUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
];
