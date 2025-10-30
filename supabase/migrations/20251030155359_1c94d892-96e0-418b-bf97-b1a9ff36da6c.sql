-- Create collection_points table for NGOs and drop-off locations
CREATE TABLE public.collection_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ngo', 'community_center', 'drop_off_point')),
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  contact_phone TEXT,
  contact_email TEXT,
  operating_hours TEXT,
  accepted_items TEXT[] DEFAULT '{}',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.collection_points ENABLE ROW LEVEL SECURITY;

-- Everyone can view active collection points
CREATE POLICY "Anyone can view active collection points" 
ON public.collection_points 
FOR SELECT 
USING (is_active = true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_collection_points_updated_at
BEFORE UPDATE ON public.collection_points
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample collection points
INSERT INTO public.collection_points (name, type, address, latitude, longitude, contact_phone, accepted_items, description) VALUES
('Hope Foundation NGO', 'ngo', '123 Charity Lane, Downtown', 28.6139, 77.2090, '+91-9876543210', ARRAY['food', 'clothes', 'books'], 'Main NGO center accepting all types of donations'),
('Community Care Center', 'community_center', '456 Helper Street, Midtown', 28.6300, 77.2200, '+91-9876543211', ARRAY['food', 'hygiene_kits'], 'Community center focused on food and hygiene supplies'),
('Books for All Drop-off', 'drop_off_point', '789 Education Road, Uptown', 28.6000, 77.2300, '+91-9876543212', ARRAY['books', 'devices'], 'Drop-off point for educational materials'),
('Clothing Bank', 'ngo', '321 Warmth Avenue, Southside', 28.5900, 77.2000, '+91-9876543213', ARRAY['clothes'], 'Specialized in clothing donations for all seasons');