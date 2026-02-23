import { useState } from 'react';
import { PipelineLead, FOLLOWUP_TYPES, FollowupType } from '@/types/pipeline';
import { useLeadNotes, useLeadFollowups } from '@/hooks/usePipeline';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Star,
  MessageSquarePlus,
  Calendar,
  Clock,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeadCRMModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipelineLead: PipelineLead | null;
  onRemove?: () => void;
}

export const LeadCRMModal = ({ open, onOpenChange, pipelineLead, onRemove }: LeadCRMModalProps) => {
  const { toast } = useToast();
  const lead = pipelineLead?.lead;
  const leadId = pipelineLead?.lead_id || '';
  
  const { notes, addNote, deleteNote } = useLeadNotes(leadId);
  const { 
    followups, 
    addFollowup, 
    completeFollowup, 
    deleteFollowup,
    nextFollowup,
    lastCompleted,
    overdueFollowups,
  } = useLeadFollowups(leadId);

  const [newNote, setNewNote] = useState('');
  const [newFollowupType, setNewFollowupType] = useState<FollowupType>('ligar');
  const [newFollowupDate, setNewFollowupDate] = useState('');
  const [newFollowupNote, setNewFollowupNote] = useState('');

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    const success = await addNote(newNote.trim());
    if (success) {
      setNewNote('');
      toast({ title: 'Nota adicionada!' });
    }
  };

  const handleAddFollowup = async () => {
    if (!newFollowupDate) {
      toast({ title: 'Selecione uma data', variant: 'destructive' });
      return;
    }
    
    const success = await addFollowup(
      leadId,
      newFollowupType,
      new Date(newFollowupDate),
      newFollowupNote || undefined
    );
    
    if (success) {
      setNewFollowupDate('');
      setNewFollowupNote('');
      toast({ title: 'Follow-up agendado!' });
    }
  };

  const handleCompleteFollowup = async (id: string) => {
    const success = await completeFollowup(id);
    if (success) {
      toast({ title: 'Follow-up concluído!' });
    }
  };

  if (!lead) return null;

  const getFollowupIcon = (type: FollowupType) => {
    switch (type) {
      case 'ligar': return <Phone className="w-4 h-4" />;
      case 'whatsapp': return <MessageSquarePlus className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'reuniao': return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            {lead.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Dados</TabsTrigger>
            <TabsTrigger value="notes" className="relative">
              Notas
              {notes.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">{notes.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="followups" className="relative">
              Follow-ups
              {overdueFollowups.length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">{overdueFollowups.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-4">
            {/* Lead Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Informações de Contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {lead.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
                        {lead.phone}
                      </a>
                    </div>
                  )}
                  {lead.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                        {lead.email}
                      </a>
                    </div>
                  )}
                  {lead.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                        {lead.website}
                      </a>
                    </div>
                  )}
                  {lead.city && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{lead.city}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Detalhes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {lead.categories && lead.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {lead.categories.slice(0, 3).map((cat, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{cat}</Badge>
                      ))}
                    </div>
                  )}
                  {lead.rating && (
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{lead.rating.toFixed(1)}</span>
                      {lead.reviews_count && (
                        <span className="text-muted-foreground">({lead.reviews_count} avaliações)</span>
                      )}
                    </div>
                  )}
                  {lead.observations && (
                    <p className="text-sm text-muted-foreground">{lead.observations}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Resumo de Atividade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Último contacto:</p>
                    <p className="font-medium">
                      {lastCompleted 
                        ? format(new Date(lastCompleted.completed_at!), "dd/MM/yyyy 'às' HH:mm", { locale: pt })
                        : 'Nenhum'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Próxima ação:</p>
                    <p className={cn("font-medium", overdueFollowups.length > 0 && "text-destructive")}>
                      {nextFollowup
                        ? format(new Date(nextFollowup.scheduled_date), "dd/MM/yyyy 'às' HH:mm", { locale: pt })
                        : 'Nenhuma agendada'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Remove Button */}
            {onRemove && (
              <Button variant="destructive" size="sm" onClick={onRemove} className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Remover do Pipeline
              </Button>
            )}
          </TabsContent>

          <TabsContent value="notes" className="space-y-4 mt-4">
            {/* Add Note */}
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <Textarea
                    placeholder="Adicionar uma nota..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <Button onClick={handleAddNote} disabled={!newNote.trim()} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Nota
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notes History */}
            <div className="space-y-2">
              {notes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhuma nota registada</p>
              ) : (
                notes.map((note) => (
                  <Card key={note.id} className="relative">
                    <CardContent className="pt-4 pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">
                            {format(new Date(note.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: pt })}
                          </p>
                          <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => deleteNote(note.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="followups" className="space-y-4 mt-4">
            {/* Add Follow-up */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Adicionar Follow-up
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Select value={newFollowupType} onValueChange={(v) => setNewFollowupType(v as FollowupType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FOLLOWUP_TYPES.map((type) => (
                        <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="datetime-local"
                    value={newFollowupDate}
                    onChange={(e) => setNewFollowupDate(e.target.value)}
                  />
                </div>
                
                <Textarea
                  placeholder="Nota opcional..."
                  value={newFollowupNote}
                  onChange={(e) => setNewFollowupNote(e.target.value)}
                  className="mt-3 min-h-[60px]"
                />
                
                <Button onClick={handleAddFollowup} className="w-full mt-3">
                  <Plus className="w-4 h-4 mr-2" />
                  Agendar Follow-up
                </Button>
              </CardContent>
            </Card>

            {/* Follow-ups List */}
            <div className="space-y-2">
              {followups.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum follow-up agendado</p>
              ) : (
                followups.map((followup) => {
                  const isOverdue = !followup.completed && new Date(followup.scheduled_date) < new Date();
                  
                  return (
                    <Card 
                      key={followup.id} 
                      className={cn(
                        "relative",
                        followup.completed && "opacity-60",
                        isOverdue && "border-destructive bg-destructive/5"
                      )}
                    >
                      <CardContent className="pt-4 pb-3">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "p-2 rounded-full",
                            followup.completed ? "bg-green-100 text-green-600" : 
                            isOverdue ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"
                          )}>
                            {getFollowupIcon(followup.followup_type as FollowupType)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={isOverdue ? "destructive" : "secondary"}>
                                {FOLLOWUP_TYPES.find(t => t.id === followup.followup_type)?.label}
                              </Badge>
                              {isOverdue && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Atrasado
                                </Badge>
                              )}
                              {followup.completed && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Concluído
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(followup.scheduled_date), "dd/MM/yyyy 'às' HH:mm", { locale: pt })}
                            </p>
                            
                            {followup.note && (
                              <p className="text-sm mt-2">{followup.note}</p>
                            )}
                          </div>
                          
                          <div className="flex gap-1">
                            {!followup.completed && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleCompleteFollowup(followup.id)}
                              >
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => deleteFollowup(followup.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
