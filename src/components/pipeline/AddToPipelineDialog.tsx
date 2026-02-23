import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, CheckCircle2, Phone, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Lead {
  id: string;
  name: string;
  phone: string | null;
  city: string | null;
  categories: string[] | null;
}

interface AddToPipelineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingLeadIds: string[];
  onAdd: (leadId: string) => Promise<boolean>;
}

export const AddToPipelineDialog = ({
  open,
  onOpenChange,
  existingLeadIds,
  onAdd,
}: AddToPipelineDialogProps) => {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchLeads();
    }
  }, [open]);

  const fetchLeads = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('leads')
        .select('id, name, phone, city, categories')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (leadId: string) => {
    setAdding(leadId);
    const success = await onAdd(leadId);
    if (success) {
      toast({ title: 'Lead adicionado ao pipeline!' });
    } else {
      toast({ title: 'Erro ao adicionar lead', variant: 'destructive' });
    }
    setAdding(null);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.phone && lead.phone.includes(searchTerm)) ||
      (lead.city && lead.city.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const availableLeads = filteredLeads.filter(lead => !existingLeadIds.includes(lead.id));
  const alreadyInPipeline = filteredLeads.filter(lead => existingLeadIds.includes(lead.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Adicionar Lead ao Pipeline</DialogTitle>
          <DialogDescription>
            Selecione um lead já existente para adicionar ao pipeline de vendas
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, telefone, cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : (
            <div className="space-y-2">
              {availableLeads.length === 0 && alreadyInPipeline.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum lead encontrado
                </div>
              ) : (
                <>
                  {availableLeads.map((lead) => (
                    <Card
                      key={lead.id}
                      className="p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleAdd(lead.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{lead.name}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {lead.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {lead.phone}
                              </span>
                            )}
                            {lead.city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {lead.city}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={adding === lead.id}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}

                  {alreadyInPipeline.length > 0 && (
                    <>
                      <div className="text-xs text-muted-foreground mt-4 mb-2">
                        Já no pipeline ({alreadyInPipeline.length})
                      </div>
                      {alreadyInPipeline.map((lead) => (
                        <Card
                          key={lead.id}
                          className={cn("p-3 opacity-60")}
                        >
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="font-medium text-sm">{lead.name}</p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                {lead.city && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {lead.city}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              No pipeline
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
