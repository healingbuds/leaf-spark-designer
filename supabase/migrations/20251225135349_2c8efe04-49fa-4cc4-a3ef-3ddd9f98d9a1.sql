-- Create strain_knowledge table for caching scraped dispensary data
CREATE TABLE public.strain_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  strain_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_name TEXT NOT NULL,
  country_code TEXT NOT NULL DEFAULT 'PT',
  category TEXT NOT NULL DEFAULT 'dispensary',
  scraped_content TEXT,
  medical_conditions TEXT[],
  effects TEXT[],
  patient_reviews TEXT,
  product_info JSONB DEFAULT '{}',
  last_scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(strain_name, source_url)
);

-- Create index for faster lookups
CREATE INDEX idx_strain_knowledge_strain_name ON public.strain_knowledge(strain_name);
CREATE INDEX idx_strain_knowledge_country ON public.strain_knowledge(country_code);

-- Enable RLS
ALTER TABLE public.strain_knowledge ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read strain knowledge (it's reference data)
CREATE POLICY "Anyone can view strain knowledge"
ON public.strain_knowledge
FOR SELECT
USING (true);

-- Only admins can manage strain knowledge
CREATE POLICY "Admins can manage strain knowledge"
ON public.strain_knowledge
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_strain_knowledge_updated_at
BEFORE UPDATE ON public.strain_knowledge
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();