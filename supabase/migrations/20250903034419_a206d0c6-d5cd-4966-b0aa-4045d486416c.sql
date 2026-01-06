-- Create storage bucket for order proof of payments
INSERT INTO storage.buckets (id, name, public) VALUES ('order-proofs', 'order-proofs', true);

-- Create storage policies for order proof uploads
CREATE POLICY "Anyone can upload order proofs"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'order-proofs');

CREATE POLICY "Anyone can view order proofs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'order-proofs');