import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { 
  Shield, LogOut, Users, Search, TrendingUp, 
  UserCheck, UserX, Trash2, Calendar, Activity
} from 'lucide-react';
import logo from '@/assets/logo.svg';
import { AdminUsersTable } from '@/components/admin/AdminUsersTable';
import { AdminPlansManager } from '@/components/admin/AdminPlansManager';
import { AdminLogsTable } from '@/components/admin/AdminLogsTable';
import { AdminCreateUser } from '@/components/admin/AdminCreateUser';

interface DashboardStats {
  totalAccounts: number;
  activeAccounts: number;
  pausedAccounts: number;
  deletedAccounts: number;
  totalLeads: number;
  leadsToday: number;
  leads7Days: number;
  leads30Days: number;
  activeUsersToday: number;
  avgDaysActive: number;
}

const AdminDashboard = () => {
  const { isAdmin, loading, user } = useAdmin();
  const [stats, setStats] = useState<DashboardStats>({
    totalAccounts: 0,
    activeAccounts: 0,
    pausedAccounts: 0,
    deletedAccounts: 0,
    totalLeads: 0,
    leadsToday: 0,
    leads7Days: 0,
    leads30Days: 0,
    activeUsersToday: 0,
    avgDaysActive: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAdmin) {
      fetchStats();
    }
  }, [loading, isAdmin]);

  const fetchStats = async () => {
    try {
      // Fetch profiles stats
      const { data: profiles } = await supabase.from('profiles').select('*');
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Fetch leads stats
      const { data: allLeads } = await supabase.from('leads').select('created_at');
      const { data: leadsToday } = await supabase
        .from('leads')
        .select('id')
        .gte('created_at', today.toISOString());
      const { data: leads7Days } = await supabase
        .from('leads')
        .select('id')
        .gte('created_at', sevenDaysAgo.toISOString());
      const { data: leads30Days } = await supabase
        .from('leads')
        .select('id')
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Calculate active users today (last_login_at today)
      const activeToday = profiles?.filter(p => {
        if (!p.last_login_at) return false;
        const loginDate = new Date(p.last_login_at);
        return loginDate >= today;
      }).length || 0;

      // Calculate average days active
      const totalDays = profiles?.reduce((sum, p) => sum + (p.days_active || 0), 0) || 0;
      const avgDays = profiles?.length ? Math.round(totalDays / profiles.length) : 0;

      setStats({
        totalAccounts: profiles?.length || 0,
        activeAccounts: profiles?.filter(p => p.account_status === 'active').length || 0,
        pausedAccounts: profiles?.filter(p => p.account_status === 'paused').length || 0,
        deletedAccounts: profiles?.filter(p => p.account_status === 'deleted').length || 0,
        totalLeads: allLeads?.length || 0,
        leadsToday: leadsToday?.length || 0,
        leads7Days: leads7Days?.length || 0,
        leads30Days: leads30Days?.length || 0,
        activeUsersToday: activeToday,
        avgDaysActive: avgDays,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">A carregar...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div className="flex items-center gap-2">
                <img src={logo} alt="Leadsx1B" className="w-8 h-8" />
                <div>
                  <h1 className="text-xl font-bold">Painel Admin</h1>
                  <p className="text-xs text-muted-foreground">Leadsx1B</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Contas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalAccounts}</p>
            </CardContent>
          </Card>

          <Card className="border-green-500/20">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-green-500" />
                Activas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500">{stats.activeAccounts}</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/20">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <UserX className="w-4 h-4 text-yellow-500" />
                Pausadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-500">{stats.pausedAccounts}</p>
            </CardContent>
          </Card>

          <Card className="border-red-500/20">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-500" />
                Eliminadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-500">{stats.deletedAccounts}</p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Search className="w-4 h-4 text-accent" />
                Total Leads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-accent">{stats.totalLeads}</p>
            </CardContent>
          </Card>
        </div>

        {/* Leads Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Leads Hoje
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.leadsToday}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Últimos 7 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.leads7Days}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Últimos 30 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.leads30Days}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Média Dias Activos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.avgDaysActive}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Management */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="users">Utilizadores</TabsTrigger>
            <TabsTrigger value="create">Criar Conta</TabsTrigger>
            <TabsTrigger value="plans">Planos</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <AdminUsersTable onUpdate={fetchStats} />
          </TabsContent>

          <TabsContent value="create">
            <AdminCreateUser onCreated={fetchStats} />
          </TabsContent>

          <TabsContent value="plans">
            <AdminPlansManager />
          </TabsContent>

          <TabsContent value="logs">
            <AdminLogsTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
