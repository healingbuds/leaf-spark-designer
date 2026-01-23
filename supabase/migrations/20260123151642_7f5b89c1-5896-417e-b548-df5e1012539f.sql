-- Add phone and shipping address columns to drgreen_clients for profile management
ALTER TABLE public.drgreen_clients 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS shipping_address JSONB DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.drgreen_clients.phone IS 'E.164 formatted phone number';
COMMENT ON COLUMN public.drgreen_clients.shipping_address IS 'Shipping address JSON: {address1, address2, city, state, postalCode, country}';