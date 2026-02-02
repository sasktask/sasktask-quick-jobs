-- Enable realtime for profiles table to allow live online status updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;