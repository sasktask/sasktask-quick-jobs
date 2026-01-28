-- Guard role trigger to avoid OAuth signup failures
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  raw_role TEXT;
BEGIN
  raw_role := NEW.raw_user_meta_data->>'role';

  -- Only insert if role is valid for app_role enum
  IF raw_role IS NOT NULL AND raw_role IN ('task_giver', 'task_doer') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
      NEW.id,
      raw_role::public.app_role
    )
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Never block auth user creation due to role insert failures
    RAISE WARNING 'Error inserting role for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;
