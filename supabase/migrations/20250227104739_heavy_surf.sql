-- Try to drop the policy if it exists (will not error if it doesn't)
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- Create the insert policy
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Temporarily disable and re-enable RLS to ensure policies are applied correctly
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous users (needed for registration)
DROP POLICY IF EXISTS "Public can insert profiles during registration" ON user_profiles;
CREATE POLICY "Public can insert profiles during registration"
  ON user_profiles FOR INSERT
  TO anon
  WITH CHECK (true);

-- Ensure select policy exists
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Ensure update policy exists
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Create helper function for incrementing user stats
DROP FUNCTION IF EXISTS increment_user_stat(uuid, text, int);
CREATE OR REPLACE FUNCTION increment_user_stat(user_id uuid, stat_name text, increment_by int DEFAULT 1)
RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE user_profiles SET %I = COALESCE(%I, 0) + $1 WHERE id = $2', 
                 stat_name, stat_name)
  USING increment_by, user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;