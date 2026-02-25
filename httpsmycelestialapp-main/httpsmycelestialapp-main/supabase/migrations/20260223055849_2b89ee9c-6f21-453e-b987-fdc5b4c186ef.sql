
-- Create referrals table to track invitation relationships
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL,
  rewarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique constraint: one referral per referred user
ALTER TABLE public.referrals ADD CONSTRAINT referrals_referred_id_unique UNIQUE (referred_id);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can view their own referrals (as referrer)
CREATE POLICY "Users can view own referrals"
ON public.referrals
FOR SELECT
USING (auth.uid() = referrer_id);

-- System inserts referrals (via edge function with service role)
-- Users should not insert directly
CREATE POLICY "Users can view referrals they received"
ON public.referrals
FOR SELECT
USING (auth.uid() = referred_id);

-- Add ref_code column to profiles for shareable referral codes
ALTER TABLE public.profiles ADD COLUMN ref_code TEXT UNIQUE DEFAULT substr(md5((random())::text), 1, 8);
