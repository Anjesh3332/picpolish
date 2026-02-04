-- Processing history table
-- Tracks cumulative stats for money/time saved

CREATE TABLE IF NOT EXISTS public.processing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  images_processed INT NOT NULL,
  time_saved_seconds INT NOT NULL, -- Calculated: images * 420 (7 minutes)
  money_saved_inr INT NOT NULL, -- Calculated: images * 250
  credits_used INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.processing_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own history"
  ON public.processing_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
  ON public.processing_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_processing_history_user_id ON public.processing_history(user_id);
CREATE INDEX idx_processing_history_created_at ON public.processing_history(created_at DESC);

-- Function to get user total stats
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE(
  total_products BIGINT,
  total_images BIGINT,
  total_time_saved_seconds BIGINT,
  total_money_saved_inr BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT product_id)::BIGINT as total_products,
    SUM(images_processed)::BIGINT as total_images,
    SUM(time_saved_seconds)::BIGINT as total_time_saved_seconds,
    SUM(money_saved_inr)::BIGINT as total_money_saved_inr
  FROM public.processing_history
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;