import { Badge } from '@/components/ui/Badge';

const statusConfig: Record<string, { variant: 'green' | 'blue' | 'gold' | 'gray' | 'red'; label: string }> = {
  scheduled: { variant: 'gray', label: 'Scheduled' },
  attended: { variant: 'green', label: 'Attended' },
  absent: { variant: 'red', label: 'Absent' },
  excused: { variant: 'gold', label: 'Excused' },
};

interface AttendanceBadgeProps {
  status: string;
}

export function AttendanceBadge({ status }: AttendanceBadgeProps) {
  const config = statusConfig[status] || statusConfig.scheduled;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
