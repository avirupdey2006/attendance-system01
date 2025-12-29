-- Grant insert permission to anon role for public registration
GRANT INSERT ON public.students TO anon;

-- Ensure the policy works for anon users
DROP POLICY IF EXISTS "Anyone can register as a student" ON public.students;
CREATE POLICY "Anyone can register as a student"
ON public.students
FOR INSERT
TO anon, authenticated
WITH CHECK (true);