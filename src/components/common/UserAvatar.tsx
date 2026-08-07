import React, { useState } from 'react';
import { User } from 'lucide-react';
import { AvatarFrameType } from '@/types/avatar';
import { getFrameInfo, getGradientForName, getInitials } from '@/lib/avatarFrames';

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  frame?: AvatarFrameType;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showBadge?: boolean;
  level?: string;
  className?: string;
  onClick?: () => void;
}

const SIZE_MAP = {
  xs: {
    box: 'w-6 h-6',
    text: 'text-[9px]',
    icon: 'w-3.5 h-3.5',
    ringOffset: 'p-[1px]',
    badge: 'text-[8px] px-1 -bottom-0.5 -right-0.5',
  },
  sm: {
    box: 'w-8 h-8',
    text: 'text-xs',
    icon: 'w-4 h-4',
    ringOffset: 'p-[1.5px]',
    badge: 'text-[9px] px-1 -bottom-1 -right-1',
  },
  md: {
    box: 'w-10 h-10',
    text: 'text-sm font-bold',
    icon: 'w-5 h-5',
    ringOffset: 'p-[2px]',
    badge: 'text-[9px] px-1.5 py-0.2 -bottom-1 -right-1',
  },
  lg: {
    box: 'w-14 h-14',
    text: 'text-base font-bold',
    icon: 'w-7 h-7',
    ringOffset: 'p-[2px]',
    badge: 'text-[10px] px-2 py-0.5 -bottom-1 -right-1',
  },
  xl: {
    box: 'w-20 h-20',
    text: 'text-xl font-bold',
    icon: 'w-10 h-10',
    ringOffset: 'p-[3px]',
    badge: 'text-xs px-2.5 py-0.5 -bottom-1.5 -right-1.5',
  },
  '2xl': {
    box: 'w-28 h-28',
    text: 'text-3xl font-bold',
    icon: 'w-14 h-14',
    ringOffset: 'p-[4px]',
    badge: 'text-xs px-3 py-1 -bottom-2 -right-2',
  },
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  frame = 'none',
  size = 'md',
  showBadge = false,
  level,
  className = '',
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;
  const frameInfo = getFrameInfo(frame as AvatarFrameType);
  const initials = getInitials(name);
  const gradient = getGradientForName(name);

  const hasValidImage = src && !imageError;

  return (
    <div
      onClick={onClick}
      className={`relative inline-block shrink-0 ${onClick ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''} ${className}`}
    >
      {/* Frame Ring Wrapper */}
      <div
        className={`rounded-full transition-all duration-300 ${sizeConfig.ringOffset} ${frameInfo.ringClass} ${frameInfo.glowClass}`}
      >
        <div
          className={`${sizeConfig.box} rounded-full overflow-hidden flex items-center justify-center select-none shadow-inner bg-card`}
        >
          {hasValidImage ? (
            <img
              src={src}
              alt={name || 'User avatar'}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center font-mono text-white"
              style={{
                background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
              }}
            >
              {name ? (
                <span className={sizeConfig.text}>{initials}</span>
              ) : (
                <User className={`${sizeConfig.icon} text-white/90`} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Frame Badge / Level Badge */}
      {showBadge && (level || frameInfo.id !== 'none') && (
        <span
          className={`absolute font-mono font-bold bg-primary text-primary-foreground rounded-full border border-background shadow-md ${sizeConfig.badge}`}
        >
          {level || frameInfo.badge}
        </span>
      )}
    </div>
  );
};
