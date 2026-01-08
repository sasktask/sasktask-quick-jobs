-- Add user_id_number column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_id_number TEXT UNIQUE;

-- Create a sequence for generating unique numbers
CREATE SEQUENCE IF NOT EXISTS public.user_id_seq START 1000;

-- Create function to generate user ID based on role
CREATE OR REPLACE FUNCTION public.generate_user_id_number(p_role TEXT, p_wants_both BOOLEAN DEFAULT FALSE)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prefix TEXT;
  seq_num BIGINT;
BEGIN
  -- Determine prefix based on role
  IF p_wants_both THEN
    prefix := 'TB'; -- Task Both
  ELSIF p_role = 'task_giver' THEN
    prefix := 'TG'; -- Task Giver
  ELSIF p_role = 'task_doer' THEN
    prefix := 'TD'; -- Task Doer
  ELSE
    prefix := 'TU'; -- Task User (fallback)
  END IF;
  
  -- Get next sequence number
  seq_num := nextval('public.user_id_seq');
  
  -- Return formatted ID (e.g., TG-1000, TD-1001, TB-1002)
  RETURN prefix || '-' || seq_num::TEXT;
END;
$$;

-- Update handle_new_user function to include user_id_number
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  wants_both BOOLEAN;
  generated_id TEXT;
BEGIN
  user_role := new.raw_user_meta_data->>'role';
  wants_both := COALESCE((new.raw_user_meta_data->>'wants_both_roles')::boolean, false);
  
  -- Generate user ID number
  generated_id := generate_user_id_number(user_role, wants_both);
  
  -- Insert profile with generated ID
  INSERT INTO public.profiles (id, email, full_name, phone, user_id_number)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    generated_id
  );
  
  -- Insert primary role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    new.id,
    (new.raw_user_meta_data->>'role')::app_role
  );
  
  -- If user wants both roles, insert the second role as well
  IF wants_both THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
      new.id,
      'task_doer'::app_role
    )
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN new;
END;
$$;

-- Generate IDs for existing users who don't have one
DO $$
DECLARE
  profile_record RECORD;
  user_roles_arr TEXT[];
  is_both BOOLEAN;
  primary_role TEXT;
  new_id TEXT;
BEGIN
  FOR profile_record IN 
    SELECT p.id, p.user_id_number 
    FROM profiles p 
    WHERE p.user_id_number IS NULL
  LOOP
    -- Get user roles
    SELECT ARRAY_AGG(role::TEXT) INTO user_roles_arr
    FROM user_roles
    WHERE user_id = profile_record.id;
    
    -- Determine if both roles
    is_both := 'task_giver' = ANY(user_roles_arr) AND 'task_doer' = ANY(user_roles_arr);
    
    -- Get primary role
    IF is_both THEN
      primary_role := 'task_giver';
    ELSIF 'task_doer' = ANY(user_roles_arr) THEN
      primary_role := 'task_doer';
    ELSE
      primary_role := 'task_giver';
    END IF;
    
    -- Generate and update ID
    new_id := generate_user_id_number(primary_role, is_both);
    
    UPDATE profiles SET user_id_number = new_id WHERE id = profile_record.id;
  END LOOP;
END $$;