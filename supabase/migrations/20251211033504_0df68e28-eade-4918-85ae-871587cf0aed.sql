-- Add missing foreign key relationship between payments and tasks
ALTER TABLE public.payments
ADD CONSTRAINT payments_task_id_fkey 
FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE SET NULL;

-- Add foreign key for payer_id to profiles
ALTER TABLE public.payments
ADD CONSTRAINT payments_payer_id_fkey 
FOREIGN KEY (payer_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Add foreign key for payee_id to profiles
ALTER TABLE public.payments
ADD CONSTRAINT payments_payee_id_fkey 
FOREIGN KEY (payee_id) REFERENCES public.profiles(id) ON DELETE SET NULL;