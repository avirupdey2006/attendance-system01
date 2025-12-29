-- Drop the existing insert policy that requires authentication
DROP POLICY IF EXISTS "Authenticated users can insert students" ON public.students;

-- Create a new policy allowing anyone to insert (for public registration)
CREATE POLICY "Anyone can register as a student"
ON public.students
FOR INSERT
WITH CHECK (true);