import { PipelineLead, PipelineStage, PIPELINE_STAGES } from '@/types/pipeline';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Phone, Mail, Globe, Star, AlertTriangle } from 'lucide-react';
import { useLeadFollowups } from '@/hooks/usePipeline';

interface PipelineCardProps {
  pipelineLead: PipelineLead;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, pipelineLead: PipelineLead) => void;
}

const PipelineCard = ({ pipelineLead, onClick, onDragStart }: PipelineCardProps) => {
  const lead = pipelineLead.lead;
  const { overdueFollowups } = useLeadFollowups(pipelineLead.lead_id);
  const hasOverdue = overdueFollowups.length > 0;

  if (!lead) return null;

  return (
    <Card
      className={cn(
        "p-3 cursor-pointer hover:shadow-md transition-all border-l-4",
        hasOverdue ? "border-l-destructive bg-destructive/5" : "border-l-primary/50"
      )}
      draggable
      onDragStart={(e) => onDragStart(e, pipelineLead)}
      onClick={onClick}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm line-clamp-1">{lead.name}</h4>
          {hasOverdue && (
            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
          )}
        </div>
        
        {lead.city && (
          <p className="text-xs text-muted-foreground">{lead.city}</p>
        )}
        
        <div className="flex flex-wrap gap-1">
          {lead.phone && (
            <Badge variant="outline" className="text-xs py-0">
              <Phone className="w-3 h-3 mr-1" />
              {lead.phone.slice(-4)}
            </Badge>
          )}
          {lead.email && (
            <Badge variant="outline" className="text-xs py-0">
              <Mail className="w-3 h-3" />
            </Badge>
          )}
          {lead.website && (
            <Badge variant="outline" className="text-xs py-0">
              <Globe className="w-3 h-3" />
            </Badge>
          )}
        </div>

        {lead.rating && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{lead.rating.toFixed(1)}</span>
            {lead.reviews_count && (
              <span>({lead.reviews_count})</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

interface PipelineColumnProps {
  stage: typeof PIPELINE_STAGES[number];
  leads: PipelineLead[];
  onCardClick: (pipelineLead: PipelineLead) => void;
  onDragStart: (e: React.DragEvent, pipelineLead: PipelineLead) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, stage: PipelineStage) => void;
}

export const PipelineColumn = ({
  stage,
  leads,
  onCardClick,
  onDragStart,
  onDragOver,
  onDrop,
}: PipelineColumnProps) => {
  return (
    <div
      className="flex-shrink-0 w-72 bg-muted/30 rounded-lg p-3"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, stage.id)}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("w-3 h-3 rounded-full", stage.color)} />
        <h3 className="font-semibold text-sm">{stage.label}</h3>
        <Badge variant="secondary" className="ml-auto text-xs">
          {leads.length}
        </Badge>
      </div>

      <div className="space-y-2 min-h-[200px]">
        {leads.map((pipelineLead) => (
          <PipelineCard
            key={pipelineLead.id}
            pipelineLead={pipelineLead}
            onClick={() => onCardClick(pipelineLead)}
            onDragStart={onDragStart}
          />
        ))}
      </div>
    </div>
  );
};
