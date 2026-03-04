import { getInitials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  photoUrl?: string | null;
}

const sizeClasses = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-14 h-14 text-lg',
  lg: 'w-20 h-20 text-2xl',
  xl: 'w-24 h-24 text-3xl',
};

export function Avatar({ name, size = 'md', photoUrl }: AvatarProps) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${sizeClasses[size]} rounded-xl object-cover shadow-sm`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-fgcu-blue to-fgcu-blue-light flex items-center justify-center shadow-sm flex-shrink-0`}
    >
      <span className="text-white font-bold">{getInitials(name)}</span>
    </div>
  );
}
