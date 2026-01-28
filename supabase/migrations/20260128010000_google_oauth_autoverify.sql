-- Auto-confirm OAuth emails and keep OAuth profile fields null
-- Ensures Google OAuth signups are verified and minimal profile data is stored
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
  is_oauth_user BOOLEAN;
  has_role_metadata BOOLEAN;
BEGIN
  -- Check if this is an OAuth user (Google, Apple, etc.)
  is_oauth_user := COALESCE(
    (new.raw_app_meta_data->>'provider') IS NOT NULL AND 
    (new.raw_app_meta_data->>'provider') != 'email',
    false
  );
  
  -- Extract metadata with NULL handling
  -- For OAuth users, keep profile fields empty so onboarding can collect them
  IF is_oauth_user THEN
    user_full_name := NULL;
    user_phone := NULL;
  ELSE
    user_full_name := COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'first_name' || ' ' || COALESCE(new.raw_user_meta_data->>'last_name', ''),
      NULL
    );
    user_phone := new.raw_user_meta_data->>'phone';
  END IF;
  
  -- Only extract role if it exists (OAuth users won't have this)
  user_role := new.raw_user_meta_data->>'role';
  has_role_metadata := user_role IS NOT NULL AND user_role IN ('task_giver', 'task_doer');
  
  -- For OAuth users without role, don't assign a default - they'll complete onboarding
  IF NOT has_role_metadata THEN
    user_role := NULL;
    wants_both := false;
  ELSE
    wants_both := COALESCE((new.raw_user_meta_data->>'wants_both_roles')::boolean, false);
  END IF;
  
  -- Generate user ID number only if we have a role
  -- OAuth users without role keep this NULL until onboarding
  IF has_role_metadata THEN
    generated_id := generate_user_id_number(user_role, wants_both);
  ELSE
    generated_id := NULL;
  END IF;
  
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
          IF has_role_metadata THEN
            generated_id := user_role || '-' || EXTRACT(EPOCH FROM now())::BIGINT::TEXT || '-' || substring(new.id::text, 1, 8);
          ELSE
            generated_id := NULL;
          END IF;
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
          -- Regenerate ID and retry (only if we have a role)
          IF has_role_metadata THEN
            generated_id := generate_user_id_number(user_role, wants_both);
          ELSE
            generated_id := NULL;
          END IF;
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
  
  -- Insert primary role ONLY if role metadata exists (not for OAuth users)
  -- OAuth users will complete role selection during onboarding
  IF has_role_metadata AND user_role IN ('task_giver', 'task_doer') THEN
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
  ELSE
    -- For OAuth users, log that they need to complete onboarding
    RAISE WARNING 'OAuth user % created without role - will complete onboarding', new.id;
  END IF;
  
  -- Auto-confirm email for OAuth users so they can sign in immediately
  IF is_oauth_user THEN
    BEGIN
      UPDATE auth.users
      SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
          confirmed_at = COALESCE(confirmed_at, now())
      WHERE id = new.id;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to auto-confirm OAuth email for user %: %', new.id, SQLERRM;
    END;
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
