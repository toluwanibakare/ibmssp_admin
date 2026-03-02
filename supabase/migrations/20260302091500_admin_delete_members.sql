-- Restrict member deletion to admins only
DROP POLICY IF EXISTS "Authenticated users can delete members" ON public.members;

CREATE POLICY "Admin can delete members"
ON public.members
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
