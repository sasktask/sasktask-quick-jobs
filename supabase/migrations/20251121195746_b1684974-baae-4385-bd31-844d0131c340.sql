-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Add replica identity for notifications table
ALTER TABLE public.notifications REPLICA IDENTITY FULL;