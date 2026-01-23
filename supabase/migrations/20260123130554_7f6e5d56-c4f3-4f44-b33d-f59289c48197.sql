-- Add case_id column to drgreen_clients for First AML case tracking
ALTER TABLE public.drgreen_clients 
ADD COLUMN IF NOT EXISTS case_id TEXT;

-- Add comment explaining the field
COMMENT ON COLUMN public.drgreen_clients.case_id IS 'First AML case ID returned by Dr Green API on client creation';