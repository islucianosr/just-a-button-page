-- Pipeline stages for leads
CREATE TABLE public.pipeline_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  stage TEXT NOT NULL DEFAULT 'lead_novo',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lead_id, user_id)
);

-- Lead notes for CRM
CREATE TABLE public.lead_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Follow-ups for leads
CREATE TABLE public.lead_followups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  followup_type TEXT NOT NULL CHECK (followup_type IN ('ligar', 'whatsapp', 'email', 'reuniao')),
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  note TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- WhatsApp daily counter
CREATE TABLE public.whatsapp_daily_count (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  count_date DATE NOT NULL DEFAULT CURRENT_DATE,
  message_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, count_date)
);

-- Enable RLS on all tables
ALTER TABLE public.pipeline_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_daily_count ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pipeline_leads
CREATE POLICY "Users can view their own pipeline leads" ON public.pipeline_leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pipeline leads" ON public.pipeline_leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pipeline leads" ON public.pipeline_leads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pipeline leads" ON public.pipeline_leads
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for lead_notes
CREATE POLICY "Users can view their own lead notes" ON public.lead_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lead notes" ON public.lead_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lead notes" ON public.lead_notes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for lead_followups
CREATE POLICY "Users can view their own followups" ON public.lead_followups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own followups" ON public.lead_followups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own followups" ON public.lead_followups
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own followups" ON public.lead_followups
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for whatsapp_daily_count
CREATE POLICY "Users can view their own whatsapp count" ON public.whatsapp_daily_count
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own whatsapp count" ON public.whatsapp_daily_count
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own whatsapp count" ON public.whatsapp_daily_count
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger for updated_at on pipeline_leads
CREATE TRIGGER update_pipeline_leads_updated_at
  BEFORE UPDATE ON public.pipeline_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on whatsapp_daily_count
CREATE TRIGGER update_whatsapp_daily_count_updated_at
  BEFORE UPDATE ON public.whatsapp_daily_count
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();