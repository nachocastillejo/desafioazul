/*
  # Fix RLS policies for user_profiles table

  1. Changes
    - Add policy to allow inserting user profiles during registration
    - Create function for incrementing values
  2. Security
    - Maintain existing RLS policies
    - Add missing insert policy
*/

-- Add policy to allow inserting user profiles during registration
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create function for incrementing values (needed for stats updates)
CREATE OR REPLACE FUNCTION increment(row_id uuid, column_name text, increment_by int)
RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE user_profiles SET %I = %I + $1 WHERE id = $2', column_name, column_name)
  USING increment_by, row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a simpler increment function for the RPC call
CREATE OR REPLACE FUNCTION increment(x int)
RETURNS int AS $$
BEGIN
  RETURN x + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;