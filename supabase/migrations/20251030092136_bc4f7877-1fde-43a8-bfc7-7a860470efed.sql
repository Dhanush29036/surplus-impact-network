-- Create storage bucket for donation images
INSERT INTO storage.buckets (id, name, public)
VALUES ('donations', 'donations', true);

-- Create storage policies
CREATE POLICY "Anyone can view donation images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'donations');

CREATE POLICY "Authenticated users can upload donation images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'donations' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own donation images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'donations' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own donation images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'donations' 
    AND auth.role() = 'authenticated'
  );