CREATE OR REPLACE FUNCTION public.increment_free_test_counter(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_profiles
  SET free_tests_taken = free_tests_taken + 1
  WHERE id = p_user_id;
END;
$$; 