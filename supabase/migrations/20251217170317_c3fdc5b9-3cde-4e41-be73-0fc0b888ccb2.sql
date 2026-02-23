-- Update the check_admin_email function to include leadsx1b@gmail.com
CREATE OR REPLACE FUNCTION public.check_admin_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if this email should be admin
  IF NEW.email IN ('ganga@leadsx1b.com', 'isaaclucianosr@gmail.com', 'leadsx1b@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

-- Also set admin role for existing user with this email (if already registered)
SELECT public.set_admin_by_email('leadsx1b@gmail.com');