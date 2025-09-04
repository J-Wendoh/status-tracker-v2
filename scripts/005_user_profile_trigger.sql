-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into users table with data from auth metadata
  INSERT INTO public.users (
    id,
    name,
    id_number,
    county,
    role,
    category,
    department_or_saga_id
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'id_number', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'county', ''),
    'officer', -- Default role
    COALESCE(NEW.raw_user_meta_data ->> 'category', 'department'),
    COALESCE((NEW.raw_user_meta_data ->> 'department_or_saga_id')::uuid, NULL)
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger to auto-create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
