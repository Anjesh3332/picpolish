-- Payment orders table
CREATE TABLE IF NOT EXISTS public.payment_orders (
  id VARCHAR(255) PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  amount INT NOT NULL,
  credits INT NOT NULL,
  status VARCHAR(50) DEFAULT 'created', -- 'created', 'completed', 'failed'
  razorpay_order_id VARCHAR(255) NOT NULL,
  razorpay_payment_id VARCHAR(255),
  razorpay_signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Payment history table
CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id VARCHAR(255) REFERENCES public.payment_orders(id),
  amount INT NOT NULL,
  credits INT NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  payment_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payment_orders_user_id ON public.payment_orders(user_id);
CREATE INDEX idx_payment_orders_status ON public.payment_orders(status);
CREATE INDEX idx_payment_history_user_id ON public.payment_history(user_id);

-- Enable RLS
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Policies for payment_orders
CREATE POLICY "Users can view own payment orders"
  ON public.payment_orders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment orders"
  ON public.payment_orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies for payment_history
CREATE POLICY "Users can view own payment history"
  ON public.payment_history
  FOR SELECT
  USING (auth.uid() = user_id);