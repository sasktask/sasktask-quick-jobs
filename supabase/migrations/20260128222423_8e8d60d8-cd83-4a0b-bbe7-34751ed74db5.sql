-- Fix handle_new_user to handle OAuth signups without role metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_role TEXT;
  wants_both BOOLEAN;
  generated_id TEXT;
  effective_role public.app_role;
BEGIN
  user_role := new.raw_user_meta_data->>'role';
  wants_both := COALESCE((new.raw_user_meta_data->>'wants_both_roles')::boolean, false);
  
  -- Default to 'task_giver' if no role is provided (e.g., OAuth signups)
  IF user_role IS NULL OR user_role = '' THEN
    effective_role := 'task_giver'::public.app_role;
  ELSE
    effective_role := user_role::public.app_role;
  END IF;
  
  -- Generate user ID number
  generated_id := generate_user_id_number(user_role, wants_both);
  
  -- Insert profile with generated ID
  INSERT INTO public.profiles (id, email, full_name, phone, user_id_number)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'phone',
    generated_id
  );
  
  -- Insert primary role (now guaranteed non-null)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    new.id,
    effective_role
  );
  
  -- If user wants both roles, insert the second role as well
  IF wants_both THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
      new.id,
      'task_doer'::public.app_role
    )
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN new;
END;
$function$;