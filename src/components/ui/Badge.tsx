import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'blue' | 'gold' | 'gray' | 'red';
  size?: 'sm' | 'md';
}

const variantClasses = {
  green: 'bg-fgcu-green/10 text-fgcu-green',
  blue: 'bg-fgcu-blue/10 text-fgcu-blue',
  gold: 'bg-fgcu-gold/15 text-fgcu-gold',
  gray: 'bg-gray-100 text-gray-600',
  red: 'bg-red-50 text-red-600',
};

const sizeClasses = {
  sm: 'tag-badge',
  md: 'px-3 py-1.5 rounded-lg text-xs font-semibold',
};

export function Badge({ children, variant = 'gray', size = 'sm' }: BadgeProps) {
  return (
    <span className={cn(sizeClasses[size], variantClasses[variant])}>
      {children}
    </span>
  );
}
