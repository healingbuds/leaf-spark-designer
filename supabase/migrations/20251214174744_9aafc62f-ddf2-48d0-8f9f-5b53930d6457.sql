-- Create storage bucket for medical prescriptions
INSERT INTO storage.buckets (id, name, public) VALUES ('prescriptions', 'prescriptions', false);

-- Create RLS policies for prescriptions bucket
CREATE POLICY "Users can view their own prescriptions"
ON storage.objects FOR SELECT
USING (bucket_id = 'prescriptions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own prescriptions"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'prescriptions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own prescriptions"
ON storage.objects FOR DELETE
USING (bucket_id = 'prescriptions' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create table to track prescription documents metadata
CREATE TABLE public.prescription_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expiry_date DATE,
  document_type TEXT NOT NULL DEFAULT 'prescription',
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prescription_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own prescription documents"
ON public.prescription_documents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prescription documents"
ON public.prescription_documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prescription documents"
ON public.prescription_documents FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prescription documents"
ON public.prescription_documents FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_prescription_documents_updated_at
BEFORE UPDATE ON public.prescription_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();