-- Create enum for verification status
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected', 'expired');

-- Create enum for message status
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');

-- Create enum for payment status
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');

-- Verifications table for task doers
CREATE TABLE public.verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Legal compliance
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  terms_accepted_at TIMESTAMP WITH TIME ZONE,
  privacy_accepted BOOLEAN NOT NULL DEFAULT false,
  privacy_accepted_at TIMESTAMP WITH TIME ZONE,
  age_verified BOOLEAN NOT NULL DEFAULT false,
  legal_name TEXT,
  date_of_birth DATE,
  
  -- Identity verification
  id_type TEXT, -- driver_license, passport, health_card
  id_number_hash TEXT, -- Hashed for security
  id_verified BOOLEAN NOT NULL DEFAULT false,
  id_verified_at TIMESTAMP WITH TIME ZONE,
  id_document_url TEXT,
  
  -- Background check
  background_check_consent BOOLEAN NOT NULL DEFAULT false,
  background_check_status verification_status DEFAULT 'pending',
  background_check_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Insurance
  has_insurance BOOLEAN NOT NULL DEFAULT false,
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  insurance_expiry_date DATE,
  insurance_document_url TEXT,
  
  -- Skills and certifications
  skills TEXT[],
  certifications TEXT[],
  certification_documents TEXT[],
  
  -- Tax information
  sin_provided BOOLEAN NOT NULL DEFAULT false,
  tax_info_complete BOOLEAN NOT NULL DEFAULT false,
  
  -- Overall status
  verification_status verification_status DEFAULT 'pending',
  verification_completed_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  rejection_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Messages table for communication between task givers and doers
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  message TEXT NOT NULL,
  status message_status DEFAULT 'sent',
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Payments table for tracking transactions
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL,
  task_id UUID NOT NULL,
  payer_id UUID NOT NULL,
  payee_id UUID NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  platform_fee NUMERIC(10, 2) NOT NULL,
  payout_amount NUMERIC(10, 2) NOT NULL,
  status payment_status DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  payout_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for verifications
CREATE POLICY "Users can view own verification"
  ON public.verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own verification"
  ON public.verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id AND has_role(auth.uid(), 'task_doer'::app_role));

CREATE POLICY "Users can update own verification"
  ON public.verifications FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages they sent or received"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages for their bookings"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND (
      -- Sender is the task doer of the booking
      auth.uid() IN (SELECT task_doer_id FROM bookings WHERE id = booking_id)
      OR
      -- Sender is the task giver of the task
      auth.uid() IN (
        SELECT tasks.task_giver_id 
        FROM tasks 
        JOIN bookings ON bookings.task_id = tasks.id 
        WHERE bookings.id = booking_id
      )
    )
  );

CREATE POLICY "Users can update own messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- RLS Policies for payments
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = payer_id OR auth.uid() = payee_id);

CREATE POLICY "Task givers can create payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = payer_id);

-- Indexes for performance
CREATE INDEX idx_verifications_user_id ON public.verifications(user_id);
CREATE INDEX idx_verifications_status ON public.verifications(verification_status);
CREATE INDEX idx_messages_booking_id ON public.messages(booking_id);
CREATE INDEX idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);
CREATE INDEX idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- Triggers for updated_at
CREATE TRIGGER update_verifications_updated_at
  BEFORE UPDATE ON public.verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;