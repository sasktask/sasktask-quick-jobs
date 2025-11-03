-- Create security definer function to check if user is part of booking
CREATE OR REPLACE FUNCTION public.is_booking_participant(_user_id uuid, _booking_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.bookings b
    JOIN public.tasks t ON t.id = b.task_id
    WHERE b.id = _booking_id
      AND (_user_id = b.task_doer_id OR _user_id = t.task_giver_id)
  )
$$;

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can send messages for their bookings" ON public.messages;

-- Create new policy using the security definer function
CREATE POLICY "Users can send messages for their bookings" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id 
  AND public.is_booking_participant(auth.uid(), booking_id)
);