-- Drop the existing policy
DROP POLICY IF EXISTS "Anyone can view working hours" ON public.working_hours;

-- Create a new policy that explicitly allows both authenticated and anonymous users
CREATE POLICY "Anyone can view working hours"
ON public.working_hours
FOR SELECT
TO authenticated, anon
USING (true);