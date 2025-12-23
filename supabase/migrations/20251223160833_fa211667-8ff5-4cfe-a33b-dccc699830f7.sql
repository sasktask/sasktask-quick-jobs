-- Create tiffin_providers table for home cooks offering tiffin services
CREATE TABLE public.tiffin_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  cuisine_type TEXT[] NOT NULL DEFAULT '{}',
  dietary_options TEXT[] DEFAULT '{}',
  description TEXT,
  kitchen_certified BOOLEAN DEFAULT false,
  food_safety_certificate_url TEXT,
  hygiene_rating INTEGER CHECK (hygiene_rating >= 1 AND hygiene_rating <= 5),
  delivery_radius_km NUMERIC DEFAULT 10,
  delivery_areas TEXT[] DEFAULT '{}',
  latitude NUMERIC,
  longitude NUMERIC,
  min_order_amount NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  accepts_subscriptions BOOLEAN DEFAULT true,
  avg_rating NUMERIC DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  cover_image_url TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create tiffin_menus table for daily/weekly menus
CREATE TABLE public.tiffin_menus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.tiffin_providers(id) ON DELETE CASCADE,
  menu_name TEXT NOT NULL,
  description TEXT,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'all_day')),
  cuisine_origin TEXT,
  is_vegetarian BOOLEAN DEFAULT false,
  is_vegan BOOLEAN DEFAULT false,
  is_halal BOOLEAN DEFAULT false,
  is_gluten_free BOOLEAN DEFAULT false,
  spice_level INTEGER DEFAULT 2 CHECK (spice_level >= 0 AND spice_level <= 5),
  calories_approx INTEGER,
  items TEXT[] NOT NULL DEFAULT '{}',
  price_per_meal NUMERIC NOT NULL,
  available_days INTEGER[] DEFAULT '{1,2,3,4,5,6,7}',
  max_orders_per_day INTEGER DEFAULT 50,
  preparation_time_minutes INTEGER DEFAULT 60,
  cover_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tiffin_orders table
CREATE TABLE public.tiffin_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  provider_id UUID NOT NULL REFERENCES public.tiffin_providers(id) ON DELETE CASCADE,
  menu_id UUID NOT NULL REFERENCES public.tiffin_menus(id) ON DELETE CASCADE,
  order_type TEXT NOT NULL CHECK (order_type IN ('one_time', 'weekly', 'monthly')),
  quantity INTEGER NOT NULL DEFAULT 1,
  total_amount NUMERIC NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_latitude NUMERIC,
  delivery_longitude NUMERIC,
  delivery_instructions TEXT,
  scheduled_date DATE,
  scheduled_time TIME,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_intent_id TEXT,
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tiffin_subscriptions table for recurring orders
CREATE TABLE public.tiffin_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  provider_id UUID NOT NULL REFERENCES public.tiffin_providers(id) ON DELETE CASCADE,
  menu_id UUID NOT NULL REFERENCES public.tiffin_menus(id) ON DELETE CASCADE,
  subscription_type TEXT NOT NULL CHECK (subscription_type IN ('daily', 'weekdays', 'weekends', 'custom')),
  custom_days INTEGER[] DEFAULT '{}',
  meals_per_day INTEGER DEFAULT 1,
  quantity_per_meal INTEGER DEFAULT 1,
  delivery_address TEXT NOT NULL,
  delivery_time TIME,
  price_per_meal NUMERIC NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  pause_from DATE,
  pause_until DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tiffin_reviews table
CREATE TABLE public.tiffin_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.tiffin_orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  provider_id UUID NOT NULL REFERENCES public.tiffin_providers(id) ON DELETE CASCADE,
  taste_rating INTEGER NOT NULL CHECK (taste_rating >= 1 AND taste_rating <= 5),
  hygiene_rating INTEGER NOT NULL CHECK (hygiene_rating >= 1 AND hygiene_rating <= 5),
  packaging_rating INTEGER NOT NULL CHECK (packaging_rating >= 1 AND packaging_rating <= 5),
  delivery_rating INTEGER NOT NULL CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  overall_rating NUMERIC GENERATED ALWAYS AS ((taste_rating + hygiene_rating + packaging_rating + delivery_rating)::NUMERIC / 4) STORED,
  comment TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(order_id, customer_id)
);

-- Enable RLS
ALTER TABLE public.tiffin_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiffin_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiffin_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiffin_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiffin_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tiffin_providers
CREATE POLICY "Anyone can view active tiffin providers"
  ON public.tiffin_providers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can create their own tiffin profile"
  ON public.tiffin_providers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tiffin profile"
  ON public.tiffin_providers FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for tiffin_menus
CREATE POLICY "Anyone can view active menus"
  ON public.tiffin_menus FOR SELECT
  USING (is_active = true);

CREATE POLICY "Providers can manage their menus"
  ON public.tiffin_menus FOR ALL
  USING (provider_id IN (SELECT id FROM public.tiffin_providers WHERE user_id = auth.uid()));

-- RLS Policies for tiffin_orders
CREATE POLICY "Customers can view their orders"
  ON public.tiffin_orders FOR SELECT
  USING (auth.uid() = customer_id OR provider_id IN (SELECT id FROM public.tiffin_providers WHERE user_id = auth.uid()));

CREATE POLICY "Customers can create orders"
  ON public.tiffin_orders FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Providers can update order status"
  ON public.tiffin_orders FOR UPDATE
  USING (provider_id IN (SELECT id FROM public.tiffin_providers WHERE user_id = auth.uid()));

CREATE POLICY "Customers can update their pending orders"
  ON public.tiffin_orders FOR UPDATE
  USING (auth.uid() = customer_id AND status = 'pending');

-- RLS Policies for tiffin_subscriptions
CREATE POLICY "Customers can view their subscriptions"
  ON public.tiffin_subscriptions FOR SELECT
  USING (auth.uid() = customer_id OR provider_id IN (SELECT id FROM public.tiffin_providers WHERE user_id = auth.uid()));

CREATE POLICY "Customers can create subscriptions"
  ON public.tiffin_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update their subscriptions"
  ON public.tiffin_subscriptions FOR UPDATE
  USING (auth.uid() = customer_id);

-- RLS Policies for tiffin_reviews
CREATE POLICY "Anyone can view reviews"
  ON public.tiffin_reviews FOR SELECT
  USING (true);

CREATE POLICY "Customers can create reviews for their orders"
  ON public.tiffin_reviews FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Function to update provider rating
CREATE OR REPLACE FUNCTION public.update_tiffin_provider_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.tiffin_providers
  SET 
    avg_rating = (
      SELECT COALESCE(AVG(overall_rating), 0)
      FROM public.tiffin_reviews
      WHERE provider_id = NEW.provider_id
    ),
    total_orders = (
      SELECT COUNT(*)
      FROM public.tiffin_orders
      WHERE provider_id = NEW.provider_id AND status = 'delivered'
    )
  WHERE id = NEW.provider_id;
  RETURN NEW;
END;
$$;

-- Trigger for updating provider rating
CREATE TRIGGER update_provider_rating_on_review
  AFTER INSERT ON public.tiffin_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tiffin_provider_rating();

-- Add Tiffin category to tasks if needed
-- This allows tiffin providers to also be found through task search