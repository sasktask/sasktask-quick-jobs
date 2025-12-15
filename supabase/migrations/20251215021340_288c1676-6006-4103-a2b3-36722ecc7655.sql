-- Update the handle_new_user function to handle "both" roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public 
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  );
  
  -- Insert primary role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    new.id,
    (new.raw_user_meta_data->>'role')::app_role
  );
  
  -- If user wants both roles, insert the second role as well
  IF (new.raw_user_meta_data->>'wants_both_roles')::boolean = true THEN
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