-- Allow task givers to create a booking for their own task when accepting a bid
-- Existing policy only allowed task_doer to insert, which blocks task_giver-driven booking creation.

-- Insert policy for task givers
CREATE POLICY "Task givers can create bookings for their tasks"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = (
    SELECT task_giver_id FROM public.tasks WHERE tasks.id = bookings.task_id
  )
  AND task_doer_id IS NOT NULL
);

-- Update policy so task givers can manage bookings on their tasks (e.g., set status)
CREATE POLICY "Task givers can update bookings for their tasks"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  auth.uid() = (
    SELECT task_giver_id FROM public.tasks WHERE tasks.id = bookings.task_id
  )
)
WITH CHECK (
  auth.uid() = (
    SELECT task_giver_id FROM public.tasks WHERE tasks.id = bookings.task_id
  )
);

