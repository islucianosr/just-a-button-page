import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LeadsTable } from '@/components/LeadsTable';
import { StatsCards } from '@/components/StatsCards';
import { supabase } from '@/integrations/supabase/client';
import { supabaseHelper } from '@/lib/supabase-helper';
import { Lead } from '@/types/lead';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const Results = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [mostRecentSearchId, setMostRecentSearchId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Get the most recent search ID
      const { data: searches } = await (supabaseHelper as any)
        .from('apify_searches')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (searches && searches.length > 0) {
        setMostRecentSearchId(searches[0].id);
      }

      // Get ALL leads for the user (not just from the most recent search)
      const { data, error } = await (supabaseHelper as any)
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('priority_score', { ascending: false });

      if (error) throw error;

      // Transform database leads to frontend format
      const transformedLeads: Lead[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        phone: item.phone || '',
        email: item.email || '',
        address: item.address || '',
        city: item.city || '',
        category: item.categories?.[0] || '',
        website: item.website || '',
        reviewsCount: item.reviews_count || 0,
        rating: item.rating || 0,
        googleMapsUrl: item.google_url || '',
        priority: item.priority_score >= 70 ? 'ALTA' : 'BAIXA',
        hasWebsite: !!item.website,
        observations: item.observations || '',
        whatsappSent: item.whatsapp_sent || false,
        whatsappSentAt: item.whatsapp_sent_at,
        searchId: item.search_id,
        instagramUrl: item.instagram_url || '',
        facebookUrl: item.facebook_url || '',
      }));

      setLeads(transformedLeads);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeads = useMemo(() => {
    if (activeTab === 'all') return leads;
    if (activeTab === 'recent') {
      return leads.filter(lead => lead.searchId === mostRecentSearchId);
    }
    if (activeTab === 'sent') {
      return leads.filter(lead => lead.whatsappSent);
    }
    if (activeTab === 'pending') {
      return leads.filter(lead => !lead.whatsappSent);
    }
    return leads;
  }, [leads, activeTab, mostRecentSearchId]);

  const recentLeadsCount = useMemo(() => {
    return leads.filter(lead => lead.searchId === mostRecentSearchId).length;
  }, [leads, mostRecentSearchId]);

  const clearRecentLeads = async () => {
    setIsDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (!mostRecentSearchId) return;

      // Delete leads from the most recent search
      const { error } = await (supabaseHelper as any)
        .from('leads')
        .delete()
        .eq('user_id', user.id)
        .eq('search_id', mostRecentSearchId);

      if (error) throw error;

      toast({
        title: "Leads removidos!",
        description: "Os leads da busca mais recente foram removidos com sucesso.",
      });

      // Reload leads
      loadLeads();
    } catch (error) {
      console.error('Error deleting recent leads:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover os leads.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="default"
                disabled={isDeleting || recentLeadsCount === 0}
                className="relative"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Última Busca
                {recentLeadsCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-destructive-foreground text-destructive"
                  >
                    {recentLeadsCount}
                  </Badge>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação irá remover {recentLeadsCount} {recentLeadsCount === 1 ? 'lead' : 'leads'} da busca mais recente.
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={clearRecentLeads}>
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="all">
                  Todos
                  <Badge variant="secondary" className="ml-2">
                    {leads.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="recent">
                  Última Busca
                  <Badge variant="secondary" className="ml-2">
                    {recentLeadsCount}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="sent">
                  Enviados
                  <Badge variant="secondary" className="ml-2">
                    {leads.filter(l => l.whatsappSent).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pendentes
                  <Badge variant="secondary" className="ml-2">
                    {leads.filter(l => !l.whatsappSent).length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                <StatsCards leads={filteredLeads} />
                <div className="mt-8">
                  <LeadsTable leads={filteredLeads} onLeadUpdate={loadLeads} />
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default Results;