-- Fix booking update policy to allow task givers to accept/reject applications
CREATE POLICY "Task givers can update bookings for their tasks"
ON bookings FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT task_giver_id FROM tasks WHERE id = bookings.task_id
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT task_giver_id FROM tasks WHERE id = bookings.task_id
  )
);

-- Update tasks INSERT policy to verify role
DROP POLICY IF EXISTS "Task givers can create tasks" ON tasks;
CREATE POLICY "Only task givers can create tasks"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = task_giver_id AND
  public.has_role(auth.uid(), 'task_giver')
);

-- Update bookings INSERT policy to verify role
DROP POLICY IF EXISTS "Task doers can create bookings" ON bookings;
CREATE POLICY "Only task doers can create bookings"
ON bookings FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = task_doer_id AND
  public.has_role(auth.uid(), 'task_doer')
);

-- Create a public view for profiles that excludes PII
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id, 
  full_name, 
  avatar_url, 
  bio, 
  rating, 
  total_reviews,
  created_at,
  updated_at
FROM profiles;

-- Grant access to authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;