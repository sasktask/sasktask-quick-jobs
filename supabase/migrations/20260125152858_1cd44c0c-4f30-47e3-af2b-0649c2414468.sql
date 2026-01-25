-- Create tax configuration table for Saskatchewan rates
CREATE TABLE public.tax_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  province TEXT NOT NULL DEFAULT 'SK',
  tax_type TEXT NOT NULL, -- 'GST', 'PST', 'contractor_withholding'
  rate NUMERIC NOT NULL, -- Percentage (e.g., 5 for 5%)
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  applies_to TEXT DEFAULT 'all', -- 'all', 'platform_fee', 'contractor_payout'
  threshold_amount NUMERIC DEFAULT 0, -- Min amount before this tax applies
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tax_configurations ENABLE ROW LEVEL SECURITY;

-- Anyone can view active tax configurations
CREATE POLICY "Anyone can view active tax configs"
ON public.tax_configurations
FOR SELECT
USING (is_active = true);

-- Admins can manage tax configurations
CREATE POLICY "Admins can manage tax configs"
ON public.tax_configurations
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create tax calculation history table
CREATE TABLE public.tax_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  gross_amount NUMERIC NOT NULL,
  gst_amount NUMERIC DEFAULT 0,
  pst_amount NUMERIC DEFAULT 0,
  contractor_withholding NUMERIC DEFAULT 0,
  total_tax NUMERIC NOT NULL,
  net_amount NUMERIC NOT NULL,
  tax_breakdown JSONB, -- Detailed breakdown
  province TEXT DEFAULT 'SK',
  tax_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tax_calculations ENABLE ROW LEVEL SECURITY;

-- Users can view their own tax calculations
CREATE POLICY "Users can view own tax calculations"
ON public.tax_calculations
FOR SELECT
USING (auth.uid() = user_id);

-- System can insert tax calculations
CREATE POLICY "System can insert tax calculations"
ON public.tax_calculations
FOR INSERT
WITH CHECK (true);

-- Admins can view all tax calculations
CREATE POLICY "Admins can view all tax calculations"
ON public.tax_calculations
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Create function to calculate taxes for Saskatchewan
CREATE OR REPLACE FUNCTION public.calculate_saskatchewan_tax(
  p_gross_amount NUMERIC,
  p_is_contractor_payout BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  gst_rate NUMERIC := 5.0; -- Federal GST (always 5%)
  pst_rate NUMERIC := 6.0; -- Saskatchewan PST (6%)
  contractor_withholding_rate NUMERIC := 0; -- Only if required
  gst_amount NUMERIC;
  pst_amount NUMERIC;
  withholding_amount NUMERIC := 0;
  total_tax NUMERIC;
  net_amount NUMERIC;
  result JSONB;
BEGIN
  -- Get current active rates from config (if exists, otherwise use defaults)
  SELECT COALESCE(
    (SELECT rate FROM tax_configurations 
     WHERE tax_type = 'GST' AND is_active = true 
     AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
     ORDER BY effective_from DESC LIMIT 1),
    5.0
  ) INTO gst_rate;
  
  SELECT COALESCE(
    (SELECT rate FROM tax_configurations 
     WHERE tax_type = 'PST' AND province = 'SK' AND is_active = true
     AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
     ORDER BY effective_from DESC LIMIT 1),
    6.0
  ) INTO pst_rate;
  
  -- Contractor withholding (if applicable for payouts over threshold)
  IF p_is_contractor_payout THEN
    SELECT COALESCE(
      (SELECT rate FROM tax_configurations 
       WHERE tax_type = 'contractor_withholding' AND is_active = true
       AND p_gross_amount >= threshold_amount
       AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
       ORDER BY effective_from DESC LIMIT 1),
      0
    ) INTO contractor_withholding_rate;
  END IF;
  
  -- Calculate amounts
  gst_amount := ROUND(p_gross_amount * (gst_rate / 100), 2);
  pst_amount := ROUND(p_gross_amount * (pst_rate / 100), 2);
  withholding_amount := ROUND(p_gross_amount * (contractor_withholding_rate / 100), 2);
  
  -- For contractor payouts, tax is deducted FROM the payout
  -- For customer payments, tax is ADDED to the payment
  IF p_is_contractor_payout THEN
    total_tax := withholding_amount;
    net_amount := p_gross_amount - total_tax;
  ELSE
    total_tax := gst_amount + pst_amount;
    net_amount := p_gross_amount; -- Customer pays gross + tax
  END IF;
  
  result := jsonb_build_object(
    'gross_amount', p_gross_amount,
    'gst_rate', gst_rate,
    'gst_amount', gst_amount,
    'pst_rate', pst_rate,
    'pst_amount', pst_amount,
    'contractor_withholding_rate', contractor_withholding_rate,
    'contractor_withholding_amount', withholding_amount,
    'total_tax', total_tax,
    'net_amount', net_amount,
    'is_contractor_payout', p_is_contractor_payout,
    'province', 'SK',
    'currency', 'CAD'
  );
  
  RETURN result;
END;
$$;

-- Insert default Saskatchewan tax rates
INSERT INTO public.tax_configurations (tax_type, rate, description, province, applies_to) VALUES
  ('GST', 5.0, 'Federal Goods and Services Tax (Canada-wide)', 'SK', 'platform_fee'),
  ('PST', 6.0, 'Saskatchewan Provincial Sales Tax', 'SK', 'platform_fee'),
  ('contractor_withholding', 0, 'Contractor tax withholding (CPP/EI if applicable)', 'SK', 'contractor_payout');

-- Add trigger for updated_at
CREATE TRIGGER update_tax_configurations_updated_at
  BEFORE UPDATE ON public.tax_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for admin dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.tax_configurations;