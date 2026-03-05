import { Badge } from '@/components/ui/Badge';
import { VEP_ROLE_LABELS, VEP_ROLE_COLORS } from '@/lib/constants';

interface VepRoleBadgeProps {
  role: string;
}

export function VepRoleBadge({ role }: VepRoleBadgeProps) {
  const label = VEP_ROLE_LABELS[role] || role;
  const variant = (VEP_ROLE_COLORS[role] || 'gray') as 'blue' | 'gold' | 'green' | 'gray';

  return <Badge variant={variant}>{label}</Badge>;
}
