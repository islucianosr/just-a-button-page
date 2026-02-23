import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Database, MessageCircle, TrendingUp, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Stats {
  totalLeads: number;
  totalSearches: number;
  lastSync: string | null;
  highPriorityLeads: number;
}

export const DashboardStats = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    totalSearches: 0,
    lastSync: null,
    highPriorityLeads: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get total leads
      const { count: leadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get high priority leads
      const { count: highPriorityCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('priority_score', 70);

      // Get total searches
      const { count: searchesCount } = await supabase
        .from('apify_searches')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get last sync
      const { data: lastSearch } = await supabase
        .from('apify_searches')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setStats({
        totalLeads: leadsCount || 0,
        totalSearches: searchesCount || 0,
        lastSync: (lastSearch as any)?.created_at || null,
        highPriorityLeads: highPriorityCount || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastSync = (date: string | null) => {
    if (!date) return 'Nunca';
    const syncDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - syncDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `Há ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Há ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Há ${diffDays} dias`;
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card 
        className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-all cursor-pointer hover:border-primary/40"
        onClick={() => navigate('/results')}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Total de Leads</span>
            <Database className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-bold text-foreground">{stats.totalLeads}</div>
        </CardContent>
      </Card>

      <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent hover:shadow-lg transition-all">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Alta Prioridade</span>
            <TrendingUp className="w-4 h-4 text-accent" />
          </div>
          <div className="text-3xl font-bold text-foreground">{stats.highPriorityLeads}</div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-all">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Pesquisas</span>
            <MessageCircle className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-bold text-foreground">{stats.totalSearches}</div>
        </CardContent>
      </Card>

      <Card className="border-muted bg-gradient-to-br from-muted/20 to-transparent hover:shadow-lg transition-all">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Última Sincronização</span>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-xl font-semibold text-foreground">{formatLastSync(stats.lastSync)}</div>
        </CardContent>
      </Card>
    </div>
  );
};
