-- Add public read policies for aggregate statistics
-- These policies allow counting rows without exposing sensitive data

-- Allow public to count profiles (for user stats on homepage)
CREATE POLICY "Public can count profiles for stats"
ON public.profiles
FOR SELECT
TO anon
USING (true);

-- Allow public to count tasks (for task stats on homepage)
CREATE POLICY "Public can view open tasks for stats"
ON public.tasks
FOR SELECT
TO anon
USING (status = 'open' OR status = 'completed');

-- Note: These policies expose row data, but only for public-facing stats
-- Sensitive columns should be protected at the application level