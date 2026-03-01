-- Allow only admins to clear activity logs and sent email history
CREATE POLICY "Admin can delete activity_logs"
ON public.activity_logs
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete sent_emails"
ON public.sent_emails
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
