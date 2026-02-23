import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { PipelineColumn } from '@/components/pipeline/PipelineColumn';
import { LeadCRMModal } from '@/components/pipeline/LeadCRMModal';
import { AddToPipelineDialog } from '@/components/pipeline/AddToPipelineDialog';
import { usePipeline } from '@/hooks/usePipeline';
import { PipelineLead, PipelineStage, PIPELINE_STAGES } from '@/types/pipeline';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo.svg';
import { ArrowLeft, Plus, Settings, LogOut, LayoutGrid } from 'lucide-react';

const Pipeline = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<any>(null);
  const { pipelineLeads, loading, addLeadToPipeline, moveLeadToStage, removeFromPipeline, refetch } = usePipeline();
  
  const [selectedLead, setSelectedLead] = useState<PipelineLead | null>(null);
  const [showCRMModal, setShowCRMModal] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [draggedLead, setDraggedLead] = useState<PipelineLead | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) {
          navigate('/auth');
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleDragStart = (e: React.DragEvent, pipelineLead: PipelineLead) => {
    setDraggedLead(pipelineLead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    if (!draggedLead || draggedLead.stage === stage) {
      setDraggedLead(null);
      return;
    }

    const success = await moveLeadToStage(draggedLead.id, stage);
    if (success) {
      toast({ 
        title: 'Lead movido!',
        description: `Movido para ${PIPELINE_STAGES.find(s => s.id === stage)?.label}`,
      });
    }
    setDraggedLead(null);
  };

  const handleCardClick = (pipelineLead: PipelineLead) => {
    setSelectedLead(pipelineLead);
    setShowCRMModal(true);
  };

  const handleRemoveFromPipeline = async () => {
    if (!selectedLead) return;
    
    const success = await removeFromPipeline(selectedLead.id);
    if (success) {
      toast({ title: 'Lead removido do pipeline!' });
      setShowCRMModal(false);
      setSelectedLead(null);
    }
  };

  const getLeadsForStage = (stage: PipelineStage) => {
    return pipelineLeads.filter(pl => pl.stage === stage);
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <img src={logo} alt="Leadsx1B" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-primary" />
                  Pipeline de Vendas
                </h1>
                <p className="text-xs text-muted-foreground">
                  Gerencie o fluxo dos seus leads
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowAddDialog(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Lead
              </Button>
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

      {/* Pipeline Board */}
      <div className="p-4 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground">Carregando pipeline...</p>
          </div>
        ) : (
          <div className="flex gap-4 min-w-max pb-4">
            {PIPELINE_STAGES.map((stage) => (
              <PipelineColumn
                key={stage.id}
                stage={stage}
                leads={getLeadsForStage(stage.id)}
                onCardClick={handleCardClick}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ))}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-card/95 backdrop-blur-sm p-3">
        <div className="container mx-auto flex justify-center gap-6 text-sm">
          {PIPELINE_STAGES.map((stage) => (
            <div key={stage.id} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${stage.color}`} />
              <span className="text-muted-foreground">{stage.label}:</span>
              <span className="font-medium">{getLeadsForStage(stage.id).length}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CRM Modal */}
      <LeadCRMModal
        open={showCRMModal}
        onOpenChange={setShowCRMModal}
        pipelineLead={selectedLead}
        onRemove={handleRemoveFromPipeline}
      />

      {/* Add Lead Dialog */}
      <AddToPipelineDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        existingLeadIds={pipelineLeads.map(pl => pl.lead_id)}
        onAdd={addLeadToPipeline}
      />
    </div>
  );
};

export default Pipeline;
