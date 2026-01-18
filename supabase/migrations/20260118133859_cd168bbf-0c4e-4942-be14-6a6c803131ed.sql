-- Create launch_interest table for coming soon page signups
CREATE TABLE public.launch_interest (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  interested_region TEXT NOT NULL,
  country_code TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now(),
  source TEXT DEFAULT 'coming_soon_page',
  CONSTRAINT launch_interest_email_region_unique UNIQUE (email, interested_region)
);

-- Enable RLS
ALTER TABLE public.launch_interest ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public form)
CREATE POLICY "Anyone can register interest"
  ON public.launch_interest FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins can view all interest signups
CREATE POLICY "Admins can view all interest signups"
  ON public.launch_interest FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage interest signups
CREATE POLICY "Admins can manage interest signups"
  ON public.launch_interest FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));