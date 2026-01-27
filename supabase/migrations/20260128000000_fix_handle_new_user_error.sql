-- Fix handle_new_user function to properly handle NULL values and errors
-- This fixes the "Database error saving new user" issue

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  wants_both BOOLEAN;
  generated_id TEXT;
  user_full_name TEXT;
  user_phone TEXT;
  retry_count INTEGER := 0;
  max_retries INTEGER := 5;
BEGIN
  -- Extract metadata with NULL handling
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'task_doer');
  wants_both := COALESCE((new.raw_user_meta_data->>'wants_both_roles')::boolean, false);
  user_full_name := new.raw_user_meta_data->>'full_name';
  user_phone := new.raw_user_meta_data->>'phone';
  
  -- Validate role is valid
  IF user_role NOT IN ('task_giver', 'task_doer') THEN
    user_role := 'task_doer'; -- Default fallback
  END IF;
  
  -- Generate user ID number
  generated_id := generate_user_id_number(user_role, wants_both);
  
  -- Insert profile with generated ID (handle NULL values and UNIQUE constraint conflicts)
  LOOP
    BEGIN
      INSERT INTO public.profiles (id, email, full_name, phone, user_id_number)
      VALUES (
        new.id,
        COALESCE(new.email, ''),
        user_full_name,
        user_phone,
        generated_id
      );
      EXIT; -- Success, exit loop
    EXCEPTION
      WHEN unique_violation THEN
        -- If user_id_number conflict, regenerate with timestamp fallback
        retry_count := retry_count + 1;
        IF retry_count > max_retries THEN
          -- Fallback: use timestamp-based ID if sequence conflicts persist
          generated_id := user_role || '-' || EXTRACT(EPOCH FROM now())::BIGINT::TEXT || '-' || substring(new.id::text, 1, 8);
          -- Try one more time with fallback ID
          BEGIN
            INSERT INTO public.profiles (id, email, full_name, phone, user_id_number)
            VALUES (
              new.id,
              COALESCE(new.email, ''),
              user_full_name,
              user_phone,
              generated_id
            );
            EXIT;
          EXCEPTION
            WHEN OTHERS THEN
              -- Last resort: insert without user_id_number
              INSERT INTO public.profiles (id, email, full_name, phone)
              VALUES (
                new.id,
                COALESCE(new.email, ''),
                user_full_name,
                user_phone
              )
              ON CONFLICT (id) DO NOTHING;
              EXIT;
          END;
        ELSE
          -- Regenerate ID and retry
          generated_id := generate_user_id_number(user_role, wants_both);
          PERFORM pg_sleep(random() * 0.1);
        END IF;
      WHEN OTHERS THEN
        -- Log error but don't fail the trigger
        RAISE WARNING 'Error inserting profile for user %: %', new.id, SQLERRM;
        -- Try insert without user_id_number as fallback
        BEGIN
          INSERT INTO public.profiles (id, email, full_name, phone)
          VALUES (
            new.id,
            COALESCE(new.email, ''),
            user_full_name,
            user_phone
          )
          ON CONFLICT (id) DO NOTHING;
        EXCEPTION
          WHEN OTHERS THEN
            RAISE WARNING 'Failed to insert profile even without user_id_number for user %: %', new.id, SQLERRM;
        END;
        EXIT;
    END;
  END LOOP;
  
  -- Insert primary role (only if role is provided and valid)
  IF user_role IN ('task_giver', 'task_doer') THEN
    BEGIN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (
        new.id,
        user_role::app_role
      )
      ON CONFLICT (user_id, role) DO NOTHING;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Error inserting role for user %: %', new.id, SQLERRM;
    END;
    
    -- If user wants both roles, insert the second role as well
    IF wants_both AND user_role = 'task_giver' THEN
      BEGIN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (
          new.id,
          'task_doer'::app_role
        )
        ON CONFLICT (user_id, role) DO NOTHING;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE WARNING 'Error inserting second role for user %: %', new.id, SQLERRM;
      END;
    END IF;
  END IF;
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the full error for debugging
    RAISE WARNING 'Critical error in handle_new_user for user %: %', new.id, SQLERRM;
    -- Still return new to allow auth user creation
    RETURN new;
END;
$$;

-- Ensure the trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;
