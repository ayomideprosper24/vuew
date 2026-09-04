import React from 'react';

interface AvatarProps {
  id?: string;
  name: string;
  avatar?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showOnlineStatus?: boolean;
  isOnline?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  id,
  name,
  avatar,
  size = 'md',
  showOnlineStatus = false,
  isOnline = true,
  className = '',
}) => {
  const sizeMap = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-14 h-14 text-lg font-semibold',
  };

  const getInitials = (n: string) => {
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  return (
    <div id={id} className={`relative inline-flex flex-shrink-0 ${className}`}>
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className={`${sizeMap[size]} rounded-full object-cover ring-1 ring-slate-700/60 bg-slate-800`}
          referrerPolicy="no-referrer"
          onError={(e) => {
            // fallback if image fails to load
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : (
        <div
          className={`${sizeMap[size]} rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 text-slate-200 ring-1 ring-slate-700/60 flex items-center justify-center font-medium`}
        >
          {getInitials(name)}
        </div>
      )}
      {showOnlineStatus && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-slate-900 ${
            size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'
          } ${isOnline ? 'bg-emerald-500' : 'bg-slate-500'}`}
          title={isOnline ? 'Online now' : 'Offline'}
        />
      )}
    </div>
  );
};
