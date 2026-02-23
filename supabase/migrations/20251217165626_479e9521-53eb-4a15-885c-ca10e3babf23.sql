-- Create table for quiz submissions
CREATE TABLE public.quiz_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  profile_type TEXT NOT NULL,
  country TEXT NOT NULL,
  lead_objective TEXT NOT NULL,
  monthly_investment TEXT NOT NULL,
  willing_to_invest TEXT NOT NULL,
  has_sales_process TEXT NOT NULL,
  decision_maker TEXT NOT NULL,
  accepts_rules BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'em_analise',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;

-- Only admins can view submissions
CREATE POLICY "Only admins can view submissions" 
ON public.quiz_submissions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can insert (public form)
CREATE POLICY "Anyone can submit quiz" 
ON public.quiz_submissions 
FOR INSERT 
WITH CHECK (true);

-- Only admins can update status
CREATE POLICY "Only admins can update submissions" 
ON public.quiz_submissions 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete
CREATE POLICY "Only admins can delete submissions" 
ON public.quiz_submissions 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_quiz_submissions_updated_at
BEFORE UPDATE ON public.quiz_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();