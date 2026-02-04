-- Images table
-- Stores individual image data for each product

CREATE TABLE IF NOT EXISTS public.images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'main' or 'secondary'
  original_url TEXT NOT NULL, -- URL to original uploaded image
  processed_url TEXT, -- URL to processed image
  template_id VARCHAR(100), -- Template used (for secondary images)
  template_data JSONB, -- Template configuration data
  marketplace_variants JSONB, -- {Amazon: url, Flipkart: url, etc.}
  quality_score DECIMAL(3,2) DEFAULT 0.00, -- 0.00 to 1.00
  width INT,
  height INT,
  file_size INT, -- in bytes
  processing_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  processing_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Policies (inherit from products)
CREATE POLICY "Users can view own images"
  ON public.images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = images.product_id
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own images"
  ON public.images
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = images.product_id
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own images"
  ON public.images
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = images.product_id
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own images"
  ON public.images
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = images.product_id
      AND products.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_images_product_id ON public.images(product_id);
CREATE INDEX idx_images_type ON public.images(type);
CREATE INDEX idx_images_processing_status ON public.images(processing_status);

-- Trigger to update updated_at
CREATE TRIGGER update_images_updated_at
  BEFORE UPDATE ON public.images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();