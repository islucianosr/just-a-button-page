import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Settings, LogOut, Search, MessageCircle, LayoutGrid } from 'lucide-react';
import logo from '@/assets/logo.svg';
import { DashboardStats } from '@/components/DashboardStats';

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);

      // Se a sessão cair (logout/expiração), redireciona imediatamente.
      if (!nextSession) {
        navigate('/auth', { replace: true });
      }
    });

    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        setSession(initialSession);
        if (!initialSession) {
          navigate('/auth', { replace: true });
        }
      })
      .finally(() => {
        setCheckingSession(false);
      });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth', { replace: true });
  };

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg border bg-card/50 p-6">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>

          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg border bg-card/50 p-6">
                <Skeleton className="h-5 w-40 mb-3" />
                <Skeleton className="h-4 w-56 mb-6" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-background">
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Redirecionando…</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Leadsx1B" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold">Leadsx1B</h1>
                <p className="text-xs text-muted-foreground">
                  Gerador de Leads Automatizado
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/settings')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <DashboardStats />

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Search className="w-5 h-5 text-primary" />
                Nova Busca
              </CardTitle>
              <CardDescription>
                Extraia leads do Google Maps automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/new-search')}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                Iniciar Busca
              </Button>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-purple-500/20 hover:border-purple-500/40 transition-all hover:shadow-lg group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <LayoutGrid className="w-5 h-5 text-purple-500" />
                Pipeline CRM
              </CardTitle>
              <CardDescription>
                Gerencie leads com Kanban e follow-ups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/pipeline')}
                variant="outline"
                className="w-full border-purple-500/20 hover:border-purple-500 hover:bg-purple-500/5"
              >
                Abrir Pipeline
              </Button>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-accent/20 hover:border-accent/40 transition-all hover:shadow-lg group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/10 to-transparent rounded-bl-full" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="w-5 h-5 text-accent" />
                Mensagens WhatsApp
              </CardTitle>
              <CardDescription>
                Envie mensagens personalizadas aos leads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/results')}
                variant="outline"
                className="w-full border-accent/20 hover:border-accent hover:bg-accent/5"
              >
                Ver Leads
              </Button>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-muted hover:border-muted-foreground/20 transition-all hover:shadow-lg group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-muted/10 to-transparent rounded-bl-full" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Upload className="w-5 h-5 text-muted-foreground" />
                Upload XML
              </CardTitle>
              <CardDescription>
                Importe dados manualmente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/upload-xml')}
                variant="outline"
                className="w-full"
              >
                Importar XML
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer with Admin Link */}
        <footer className="mt-16 pt-8 border-t border-border/40 text-center">
          <button
            onClick={() => navigate('/admin/login')}
            className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            Admin
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Index;
