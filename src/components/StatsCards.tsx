import { useMemo } from 'react';
import { Lead } from '@/types/lead';
import { Card } from '@/components/ui/card';
import { TrendingUp, Users, Globe, Target } from 'lucide-react';

interface StatsCardsProps {
  leads: Lead[];
}

interface CardConfig {
  title: string;
  value: number | string;
  icon: any;
  description: string;
  color: string;
  bgColor: string;
  highlight?: boolean;
}

export const StatsCards = ({ leads }: StatsCardsProps) => {
  const stats = useMemo(() => {
    const total = leads.length;
    const high = leads.filter(l => l.priority === 'ALTA').length;
    const low = leads.filter(l => l.priority === 'BAIXA').length;
    const withoutWebsite = leads.filter(l => !l.hasWebsite).length;
    const withWebsite = leads.filter(l => l.hasWebsite).length;

    return { total, high, low, withoutWebsite, withWebsite };
  }, [leads]);

  const cards: CardConfig[] = [
    {
      title: 'Total de Leads',
      value: stats.total,
      icon: Users,
      description: 'Empresas encontradas',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: '⭐ Alta Prioridade',
      value: stats.high,
      icon: Target,
      description: 'Empresas SEM website',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      highlight: true,
    },
    {
      title: 'Baixa Prioridade',
      value: stats.low,
      icon: Globe,
      description: 'Empresas COM website',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/10',
    },
    {
      title: 'Taxa de Conversão',
      value: stats.total > 0 ? `${Math.round((stats.withoutWebsite / stats.total) * 100)}%` : '0%',
      icon: TrendingUp,
      description: 'Leads sem presença digital',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card 
          key={index} 
          className={`p-6 hover:shadow-lg transition-all ${
            card.highlight ? 'border-destructive/50 shadow-md ring-2 ring-destructive/20' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className={`text-sm font-medium ${
                card.highlight ? 'text-destructive font-semibold' : 'text-muted-foreground'
              }`}>
                {card.title}
              </p>
              <p className="text-3xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${card.bgColor} ${
              card.highlight ? 'animate-pulse' : ''
            }`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
