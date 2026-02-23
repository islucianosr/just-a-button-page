export type PipelineStage = 
  | 'lead_novo'
  | 'contactado'
  | 'proposta_enviada'
  | 'negociacao'
  | 'fechado_ganho'
  | 'fechado_perdido';

export const PIPELINE_STAGES: { id: PipelineStage; label: string; color: string }[] = [
  { id: 'lead_novo', label: 'Lead Novo', color: 'bg-blue-500' },
  { id: 'contactado', label: 'Contactado', color: 'bg-yellow-500' },
  { id: 'proposta_enviada', label: 'Proposta Enviada', color: 'bg-orange-500' },
  { id: 'negociacao', label: 'Negociação', color: 'bg-purple-500' },
  { id: 'fechado_ganho', label: 'Fechado – Ganho', color: 'bg-green-500' },
  { id: 'fechado_perdido', label: 'Fechado – Perdido', color: 'bg-red-500' },
];

export type FollowupType = 'ligar' | 'whatsapp' | 'email' | 'reuniao';

export const FOLLOWUP_TYPES: { id: FollowupType; label: string; icon: string }[] = [
  { id: 'ligar', label: 'Ligar', icon: 'phone' },
  { id: 'whatsapp', label: 'WhatsApp', icon: 'message-circle' },
  { id: 'email', label: 'Email', icon: 'mail' },
  { id: 'reuniao', label: 'Reunião', icon: 'calendar' },
];

export interface PipelineLead {
  id: string;
  lead_id: string;
  user_id: string;
  stage: PipelineStage;
  position: number;
  created_at: string;
  updated_at: string;
  lead?: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    city: string | null;
    website: string | null;
    categories: string[] | null;
    rating: number | null;
    reviews_count: number | null;
    observations: string | null;
  };
}

export interface LeadNote {
  id: string;
  lead_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface LeadFollowup {
  id: string;
  lead_id: string;
  user_id: string;
  followup_type: FollowupType;
  scheduled_date: string;
  note: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}
