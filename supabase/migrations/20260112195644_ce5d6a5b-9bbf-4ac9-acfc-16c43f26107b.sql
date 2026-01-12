-- Allow task givers to create bookings for their own tasks when accepting bids
CREATE POLICY "Task givers can create bookings when accepting bids"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (
    SELECT task_giver_id FROM public.tasks WHERE id = bookings.task_id
  )
);