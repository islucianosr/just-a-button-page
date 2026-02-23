import { PriorityLevel } from '@/types/lead';
import { Badge } from '@/components/ui/badge';

interface PriorityBadgeProps {
  priority: PriorityLevel;
}

export const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
  const variants = {
    'ALTA': 'destructive',
    'BAIXA': 'outline',
  } as const;

  const icons = {
    'ALTA': '⭐',
    'BAIXA': '⚪',
  };

  const labels = {
    'ALTA': 'ALTA PRIORIDADE',
    'BAIXA': 'BAIXA PRIORIDADE',
  };

  return (
    <Badge variant={variants[priority]} className="font-medium gap-1">
      <span className="text-base">{icons[priority]}</span>
      {labels[priority]}
    </Badge>
  );
};
