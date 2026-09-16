-- ============================================================================
-- DIGITAL SUCCESS NETWORK (DSN) - SUPABASE SCHEMA & SECURITY POLICIES
-- Project ID: siqjwulwewfqgbelvxrn
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. BUSINESS SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.business_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  activation_fee_pkr NUMERIC(12,2) NOT NULL DEFAULT 1000.00,
  commission_rate_l1 NUMERIC(5,4) NOT NULL DEFAULT 0.20,
  commission_rate_l2 NUMERIC(5,4) NOT NULL DEFAULT 0.10,
  commission_rate_l3 NUMERIC(5,4) NOT NULL DEFAULT 0.05,
  commission_rate_l4 NUMERIC(5,4) NOT NULL DEFAULT 0.03,
  direct_joining_points INTEGER NOT NULL DEFAULT 50,
  indirect_joining_points INTEGER NOT NULL DEFAULT 25,
  rank_threshold_starter INTEGER NOT NULL DEFAULT 500,
  rank_threshold_silver INTEGER NOT NULL DEFAULT 1500,
  rank_threshold_gold INTEGER NOT NULL DEFAULT 3000,
  rank_threshold_platinum INTEGER NOT NULL DEFAULT 5000,
  rank_threshold_diamond INTEGER NOT NULL DEFAULT 8000,
  rank_threshold_crown INTEGER NOT NULL DEFAULT 10000,
  withdrawal_min_pkr NUMERIC(12,2) NOT NULL DEFAULT 500.00,
  withdrawal_fee_rate NUMERIC(5,4) NOT NULL DEFAULT 0.02,
  support_email TEXT NOT NULL DEFAULT 'support@digitalsuccessnetwork.pk',
  support_whatsapp TEXT NOT NULL DEFAULT 'Official DSN Helpdesk',
  company_address TEXT NOT NULL DEFAULT 'Blue Area, Islamabad, Pakistan',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default settings row if empty
INSERT INTO public.business_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. PROFILES TABLE (Linked to auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  referral_code TEXT UNIQUE NOT NULL,
  sponsor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sponsor_code TEXT,
  account_status TEXT NOT NULL DEFAULT 'pending_activation' CHECK (account_status IN ('pending_activation', 'active', 'suspended', 'inactive')),
  current_rank TEXT NOT NULL DEFAULT 'Starter' CHECK (current_rank IN ('Starter', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Crown')),
  current_points INTEGER NOT NULL DEFAULT 0,
  available_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  total_earnings NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  pending_withdrawals NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  spin_credits INTEGER NOT NULL DEFAULT 0,
  direct_team_count INTEGER NOT NULL DEFAULT 0,
  total_team_count INTEGER NOT NULL DEFAULT 0,
  kyc_status TEXT NOT NULL DEFAULT 'not_submitted' CHECK (kyc_status IN ('not_submitted', 'pending', 'approved', 'rejected')),
  payment_proof_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_proof_status IN ('pending', 'approved', 'rejected')),
  notification_preferences JSONB NOT NULL DEFAULT '{"email": true, "sms": false, "inApp": true}'::jsonb,
  language_preference TEXT NOT NULL DEFAULT 'roman_urdu',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_sponsor_id ON public.profiles(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================================================
-- 3. REFERRALS & REFERRAL CLICKS TABLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 4),
  status TEXT NOT NULL DEFAULT 'pending_activation',
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  CONSTRAINT unique_referral_pair UNIQUE (referrer_id, referred_user_id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON public.referrals(referred_user_id);

CREATE TABLE IF NOT EXISTS public.referral_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code TEXT NOT NULL,
  referrer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  device TEXT,
  converted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_clicks_code ON public.referral_clicks(referral_code);

-- ============================================================================
-- 4. COMMISSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_user_name TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 4),
  eligible_amount NUMERIC(12,2) NOT NULL DEFAULT 1000.00,
  rate NUMERIC(5,4) NOT NULL,
  commission NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'credited' CHECK (status IN ('credited', 'pending', 'reversed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commissions_user_id ON public.commissions(user_id);

-- ============================================================================
-- 5. POINTS LEDGER TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  source_user_name TEXT,
  level INTEGER CHECK (level BETWEEN 1 AND 4),
  activity TEXT NOT NULL,
  points INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_points_ledger_user_id ON public.points_ledger(user_id);

-- ============================================================================
-- 6. RANK HISTORY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rank_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rank_name TEXT NOT NULL,
  points_at_achievement INTEGER NOT NULL,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rank_history_user_id ON public.rank_history(user_id);

-- ============================================================================
-- 7. SPIN PRIZES & SPINS TABLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.spin_prizes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('points', 'cash', 'spins', 'none')),
  value INTEGER NOT NULL DEFAULT 0,
  label TEXT NOT NULL,
  weight INTEGER NOT NULL DEFAULT 10,
  color TEXT NOT NULL DEFAULT '#2563eb',
  active BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO public.spin_prizes (id, name, type, value, label, weight, color, active)
VALUES
  ('prize-1', '50 Points', 'points', 50, '+50 Pts', 35, '#2563eb', true),
  ('prize-2', '100 PKR Bonus', 'cash', 100, '100 PKR', 15, '#16a34a', true),
  ('prize-3', '25 Points', 'points', 25, '+25 Pts', 30, '#d97706', true),
  ('prize-4', 'Try Again Next Time', 'none', 0, 'Try Again', 10, '#64748b', true),
  ('prize-5', '200 PKR Bonus', 'cash', 200, '200 PKR', 5, '#9333ea', true),
  ('prize-6', '100 Points', 'points', 100, '+100 Pts', 5, '#ea580c', true)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prize_id TEXT NOT NULL REFERENCES public.spin_prizes(id),
  prize_name TEXT NOT NULL,
  prize_type TEXT NOT NULL,
  prize_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_spins_user_id ON public.spins(user_id);

-- ============================================================================
-- 8. WITHDRAWALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_full_name TEXT NOT NULL,
  gross_amount NUMERIC(12,2) NOT NULL,
  fee_percentage NUMERIC(5,2) NOT NULL DEFAULT 2.00,
  fee_amount NUMERIC(12,2) NOT NULL,
  net_amount NUMERIC(12,2) NOT NULL,
  payment_method TEXT NOT NULL,
  account_title TEXT NOT NULL,
  account_number TEXT NOT NULL,
  user_note TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'rejected')),
  remarks TEXT,
  processed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);

-- ============================================================================
-- 9. PAYMENT PROOFS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payment_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_full_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 1000.00,
  payment_method TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  screenshot_url TEXT NOT NULL,
  sender_name TEXT,
  sender_account TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  date_submitted TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_proofs_user_id ON public.payment_proofs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_status ON public.payment_proofs(status);

-- ============================================================================
-- 10. KYC RECORDS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.kyc_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cnic_number TEXT NOT NULL,
  full_name TEXT,
  date_of_birth DATE,
  cnic_front_url TEXT NOT NULL,
  cnic_back_url TEXT NOT NULL,
  selfie_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kyc_records_user_id ON public.kyc_records(user_id);

-- ============================================================================
-- 11. NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- ============================================================================
-- 12. BADGES & USER BADGES TABLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  criteria TEXT NOT NULL
);

INSERT INTO public.badges (id, name, description, icon_name, criteria)
VALUES
  ('badge-1', 'Fast Starter', 'Activated your account and completed initial setup', 'Zap', 'Account Active'),
  ('badge-2', 'Top Recruiter', 'Enrolled 5 or more direct team members', 'Users', '5 Direct Members'),
  ('badge-3', 'Team Builder', 'Built an active network reaching Level 3', 'Network', 'Reach Level 3'),
  ('badge-4', 'Rising Star', 'Earned 1,500 points and reached Silver Rank', 'Star', 'Silver Rank'),
  ('badge-5', 'Consistent Performer', 'Active withdrawals and team engagement', 'Award', 'Consistent Activity')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.user_badges (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id TEXT REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- ============================================================================
-- 13. PRODUCTS & SERVICES TABLE (Empty/Coming Soon catalog)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'coming_soon',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 14. AUDIT LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  previous_value TEXT,
  new_value TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- ============================================================================
-- 15. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rank_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Business Settings: everyone can read; only admin can update
CREATE POLICY "Public can view business settings"
  ON public.business_settings FOR SELECT
  USING (true);

CREATE POLICY "Admin can update business settings"
  ON public.business_settings FOR ALL
  USING (public.is_admin());

-- Profiles:
-- 1. Users can view their own profile, or upline/downline, or admins can view all
CREATE POLICY "Users can view own profile or admin can view all"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- 2. Users can only update their own non-critical profile fields
CREATE POLICY "Users can update own safe fields"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Role cannot be changed by user
    role = (SELECT role FROM public.profiles WHERE id = auth.uid()) AND
    -- Referral code and sponsor cannot be modified directly
    referral_code = (SELECT referral_code FROM public.profiles WHERE id = auth.uid()) AND
    sponsor_id IS NOT DISTINCT FROM (SELECT sponsor_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admin can update any profile"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- Referrals: Users can view referrals where they are referrer or referred
CREATE POLICY "Users can view their referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id OR public.is_admin());

-- Referral Clicks: Insert allowed publicly; Select allowed for owner or admin
CREATE POLICY "Anyone can insert referral clicks"
  ON public.referral_clicks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their referral clicks"
  ON public.referral_clicks FOR SELECT
  USING (auth.uid() = referrer_id OR public.is_admin());

-- Commissions: Users can view their own commissions; only admin/system creates
CREATE POLICY "Users can view own commissions"
  ON public.commissions FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Points Ledger: Users can view own ledger
CREATE POLICY "Users can view own points ledger"
  ON public.points_ledger FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Rank History: Users can view own rank history
CREATE POLICY "Users can view own rank history"
  ON public.rank_history FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Spin Prizes: Everyone can view active prizes
CREATE POLICY "Anyone can view active spin prizes"
  ON public.spin_prizes FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage spin prizes"
  ON public.spin_prizes FOR ALL
  USING (public.is_admin());

-- Spins: Users can view their own spins
CREATE POLICY "Users can view own spins"
  ON public.spins FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Withdrawals: Users can view own and insert own pending withdrawal
CREATE POLICY "Users can view own withdrawals"
  ON public.withdrawals FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own withdrawal request"
  ON public.withdrawals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can update withdrawals"
  ON public.withdrawals FOR UPDATE
  USING (public.is_admin());

-- Payment Proofs: Users can view own and submit own
CREATE POLICY "Users can view own payment proofs"
  ON public.payment_proofs FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can submit own payment proof"
  ON public.payment_proofs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can update payment proofs"
  ON public.payment_proofs FOR UPDATE
  USING (public.is_admin());

-- KYC Records: Users can view own and submit own
CREATE POLICY "Users can view own KYC records"
  ON public.kyc_records FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can submit own KYC record"
  ON public.kyc_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can update KYC records"
  ON public.kyc_records FOR UPDATE
  USING (public.is_admin());

-- Notifications: Users can view and update own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Badges: Everyone can view badges
CREATE POLICY "Anyone can view badges"
  ON public.badges FOR SELECT
  USING (true);

CREATE POLICY "Users can view own user_badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Products: Everyone can view products
CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage products"
  ON public.products FOR ALL
  USING (public.is_admin());

-- Audit Logs: Admin only
CREATE POLICY "Admin can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

-- ============================================================================
-- 16. DATABASE FUNCTIONS & TRIGGERS (CORE BUSINESS LOGIC)
-- ============================================================================

-- Function: Automatically handle user creation on Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name TEXT;
  v_phone TEXT;
  v_sponsor_code TEXT;
  v_sponsor_id UUID := NULL;
  v_referral_code TEXT;
  v_initials TEXT;
  v_rand INT;
  v_exists BOOLEAN;
BEGIN
  v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  v_phone := COALESCE(new.raw_user_meta_data->>'phone', '');
  v_sponsor_code := new.raw_user_meta_data->>'referral_code';

  -- Find sponsor if code provided
  IF v_sponsor_code IS NOT NULL AND TRIM(v_sponsor_code) <> '' THEN
    SELECT id, referral_code INTO v_sponsor_id, v_sponsor_code
    FROM public.profiles
    WHERE UPPER(referral_code) = UPPER(TRIM(v_sponsor_code))
    LIMIT 1;
  END IF;

  -- Generate unique DSN referral code
  v_initials := UPPER(REGEXP_REPLACE(v_full_name, '[^a-zA-Z]', '', 'g'));
  IF LENGTH(v_initials) > 3 THEN
    v_initials := SUBSTRING(v_initials FROM 1 FOR 3);
  ELSIF LENGTH(v_initials) = 0 THEN
    v_initials := 'DSN';
  END IF;

  LOOP
    v_rand := FLOOR(100 + RANDOM() * 900)::INT;
    v_referral_code := 'DSN-' || v_initials || v_rand::TEXT;
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = v_referral_code) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;

  -- Insert profile (ALWAYS normal member; public registration cannot become admin)
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone,
    role,
    referral_code,
    sponsor_id,
    sponsor_code,
    account_status,
    current_rank,
    current_points,
    available_balance,
    total_earnings,
    pending_withdrawals,
    spin_credits,
    direct_team_count,
    total_team_count,
    kyc_status,
    payment_proof_status,
    notification_preferences,
    language_preference
  ) VALUES (
    new.id,
    v_full_name,
    new.email,
    v_phone,
    'member',
    v_referral_code,
    v_sponsor_id,
    v_sponsor_code,
    'pending_activation',
    'Starter',
    0,
    0.00,
    0.00,
    0.00,
    0,
    0,
    0,
    'not_submitted',
    'pending',
    '{"email": true, "sms": false, "inApp": true}'::jsonb,
    'roman_urdu'
  );

  -- Record referral entry for direct sponsor (Level 1) if present
  IF v_sponsor_id IS NOT NULL THEN
    INSERT INTO public.referrals (
      referrer_id,
      referred_user_id,
      level,
      status
    ) VALUES (
      v_sponsor_id,
      new.id,
      1,
      'pending_activation'
    ) ON CONFLICT DO NOTHING;

    -- Notify sponsor of registration
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type
    ) VALUES (
      v_sponsor_id,
      'New Member Registered',
      v_full_name || ' has registered using your referral link. Earnings unlock after activation approval.',
      'new_team_member'
    );
  END IF;

  -- Welcome notification
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type
  ) VALUES (
    new.id,
    'Welcome to Digital Success Network!',
    'Your registration is complete. Please submit your activation proof in the dashboard to unlock commissions and benefits.',
    'account_activated'
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to hook auth.users signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Role Tampering Prevention: Users can never escalate their own role to 'admin'
CREATE OR REPLACE FUNCTION public.prevent_role_tampering()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role <> OLD.role THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Unauthorized: Only an existing administrator can modify roles.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_tampering ON public.profiles;
CREATE TRIGGER trg_prevent_role_tampering
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.prevent_role_tampering();

-- ============================================================================
-- 17. RPC: ATOMIC ADMIN APPROVE PAYMENT (ACTIVATION & DISTRIBUTIONS)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.admin_approve_payment(
  p_proof_id UUID,
  p_actor_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_proof public.payment_proofs%ROWTYPE;
  v_user public.profiles%ROWTYPE;
  v_sponsor_l1 UUID;
  v_sponsor_l2 UUID;
  v_sponsor_l3 UUID;
  v_sponsor_l4 UUID;
  v_actor_name TEXT := 'DSN Admin';
  v_settings public.business_settings%ROWTYPE;
BEGIN
  -- 1. Security Check: Actor must be admin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_actor_id AND role = 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Admin privileges required.');
  END IF;

  SELECT full_name INTO v_actor_name FROM public.profiles WHERE id = p_actor_id;

  -- 2. Fetch payment proof
  SELECT * INTO v_proof FROM public.payment_proofs WHERE id = p_proof_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment proof not found.');
  END IF;

  IF v_proof.status = 'approved' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment proof is already approved.');
  END IF;

  -- Fetch user profile
  SELECT * INTO v_user FROM public.profiles WHERE id = v_proof.user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Associated user profile not found.');
  END IF;

  -- Fetch settings
  SELECT * INTO v_settings FROM public.business_settings WHERE id = 1;

  -- 3. Mark payment proof approved
  UPDATE public.payment_proofs
  SET status = 'approved',
      reviewed_by = p_actor_id,
      reviewed_at = NOW()
  WHERE id = p_proof_id;

  -- 4. Activate user
  UPDATE public.profiles
  SET account_status = 'active',
      payment_proof_status = 'approved',
      updated_at = NOW()
  WHERE id = v_user.id;

  -- Update referral status to active
  UPDATE public.referrals
  SET status = 'active', activated_at = NOW()
  WHERE referred_user_id = v_user.id;

  -- 5. Multi-tier Distribution (Level 1 to Level 4)
  v_sponsor_l1 := v_user.sponsor_id;

  -- LEVEL 1 (Direct Sponsor)
  IF v_sponsor_l1 IS NOT NULL THEN
    -- 20% Commission (200 PKR on 1000)
    INSERT INTO public.commissions (user_id, source_user_id, source_user_name, level, eligible_amount, rate, commission, status)
    VALUES (v_sponsor_l1, v_user.id, v_user.full_name, 1, 1000.00, v_settings.commission_rate_l1, 1000.00 * v_settings.commission_rate_l1, 'credited');

    -- Direct joining points (50 pts)
    INSERT INTO public.points_ledger (user_id, source_user_id, source_user_name, level, activity, points)
    VALUES (v_sponsor_l1, v_user.id, v_user.full_name, 1, 'Direct Member Activation (L1)', v_settings.direct_joining_points);

    -- Update sponsor balances, points, spin credits, team counts
    UPDATE public.profiles
    SET available_balance = available_balance + (1000.00 * v_settings.commission_rate_l1),
        total_earnings = total_earnings + (1000.00 * v_settings.commission_rate_l1),
        current_points = current_points + v_settings.direct_joining_points,
        spin_credits = spin_credits + 1,
        direct_team_count = direct_team_count + 1,
        total_team_count = total_team_count + 1,
        updated_at = NOW()
    WHERE id = v_sponsor_l1;

    -- Notification to L1
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (v_sponsor_l1, 'Commission & Rewards Credited!', 'You earned 200 PKR, 50 Points, and 1 Lucky Spin from ' || v_user.full_name || '''s activation.', 'commission_received');

    -- Get LEVEL 2 sponsor
    SELECT sponsor_id INTO v_sponsor_l2 FROM public.profiles WHERE id = v_sponsor_l1;
    IF v_sponsor_l2 IS NOT NULL THEN
      -- 10% Commission (100 PKR)
      INSERT INTO public.commissions (user_id, source_user_id, source_user_name, level, eligible_amount, rate, commission, status)
      VALUES (v_sponsor_l2, v_user.id, v_user.full_name, 2, 1000.00, v_settings.commission_rate_l2, 1000.00 * v_settings.commission_rate_l2, 'credited');

      -- Indirect joining points (25 pts)
      INSERT INTO public.points_ledger (user_id, source_user_id, source_user_name, level, activity, points)
      VALUES (v_sponsor_l2, v_user.id, v_user.full_name, 2, 'Indirect Team Activation (L2)', v_settings.indirect_joining_points);

      UPDATE public.profiles
      SET available_balance = available_balance + (1000.00 * v_settings.commission_rate_l2),
          total_earnings = total_earnings + (1000.00 * v_settings.commission_rate_l2),
          current_points = current_points + v_settings.indirect_joining_points,
          total_team_count = total_team_count + 1,
          updated_at = NOW()
      WHERE id = v_sponsor_l2;

      -- LEVEL 3
      SELECT sponsor_id INTO v_sponsor_l3 FROM public.profiles WHERE id = v_sponsor_l2;
      IF v_sponsor_l3 IS NOT NULL THEN
        -- 5% Commission (50 PKR)
        INSERT INTO public.commissions (user_id, source_user_id, source_user_name, level, eligible_amount, rate, commission, status)
        VALUES (v_sponsor_l3, v_user.id, v_user.full_name, 3, 1000.00, v_settings.commission_rate_l3, 1000.00 * v_settings.commission_rate_l3, 'credited');

        INSERT INTO public.points_ledger (user_id, source_user_id, source_user_name, level, activity, points)
        VALUES (v_sponsor_l3, v_user.id, v_user.full_name, 3, 'Indirect Team Activation (L3)', v_settings.indirect_joining_points);

        UPDATE public.profiles
        SET available_balance = available_balance + (1000.00 * v_settings.commission_rate_l3),
            total_earnings = total_earnings + (1000.00 * v_settings.commission_rate_l3),
            current_points = current_points + v_settings.indirect_joining_points,
            total_team_count = total_team_count + 1,
            updated_at = NOW()
        WHERE id = v_sponsor_l3;

        -- LEVEL 4
        SELECT sponsor_id INTO v_sponsor_l4 FROM public.profiles WHERE id = v_sponsor_l3;
        IF v_sponsor_l4 IS NOT NULL THEN
          -- 3% Commission (30 PKR)
          INSERT INTO public.commissions (user_id, source_user_id, source_user_name, level, eligible_amount, rate, commission, status)
          VALUES (v_sponsor_l4, v_user.id, v_user.full_name, 4, 1000.00, v_settings.commission_rate_l4, 1000.00 * v_settings.commission_rate_l4, 'credited');

          INSERT INTO public.points_ledger (user_id, source_user_id, source_user_name, level, activity, points)
          VALUES (v_sponsor_l4, v_user.id, v_user.full_name, 4, 'Indirect Team Activation (L4)', v_settings.indirect_joining_points);

          UPDATE public.profiles
          SET available_balance = available_balance + (1000.00 * v_settings.commission_rate_l4),
              total_earnings = total_earnings + (1000.00 * v_settings.commission_rate_l4),
              current_points = current_points + v_settings.indirect_joining_points,
              total_team_count = total_team_count + 1,
              updated_at = NOW()
          WHERE id = v_sponsor_l4;
        END IF;
      END IF;
    END IF;
  END IF;

  -- 6. Recalculate rank for user and all sponsors
  UPDATE public.profiles
  SET current_rank = CASE
    WHEN current_points >= v_settings.rank_threshold_crown THEN 'Crown'
    WHEN current_points >= v_settings.rank_threshold_diamond THEN 'Diamond'
    WHEN current_points >= v_settings.rank_threshold_platinum THEN 'Platinum'
    WHEN current_points >= v_settings.rank_threshold_gold THEN 'Gold'
    WHEN current_points >= v_settings.rank_threshold_silver THEN 'Silver'
    ELSE 'Starter'
  END
  WHERE id IN (v_user.id, v_sponsor_l1, v_sponsor_l2, v_sponsor_l3, v_sponsor_l4) AND id IS NOT NULL;

  -- 7. Audit log
  INSERT INTO public.audit_logs (actor_id, actor_name, action, entity, entity_id, previous_value, new_value)
  VALUES (
    p_actor_id,
    v_actor_name,
    'APPROVE_PAYMENT',
    'PaymentProof',
    p_proof_id::TEXT,
    'status: pending',
    'status: approved, activated user: ' || v_user.id::TEXT
  );

  RETURN jsonb_build_object('success', true, 'message', 'Payment approved and membership activated successfully.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 18. RPC: REQUEST WITHDRAWAL
-- ============================================================================
CREATE OR REPLACE FUNCTION public.request_withdrawal(
  p_gross_amount NUMERIC,
  p_method TEXT,
  p_account_title TEXT,
  p_account_number TEXT,
  p_user_note TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_user public.profiles%ROWTYPE;
  v_settings public.business_settings%ROWTYPE;
  v_fee_pct NUMERIC(5,2);
  v_fee_amount NUMERIC(12,2);
  v_net_amount NUMERIC(12,2);
  v_withdrawal_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated.');
  END IF;

  SELECT * INTO v_user FROM public.profiles WHERE id = v_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Profile not found.');
  END IF;

  SELECT * INTO v_settings FROM public.business_settings WHERE id = 1;

  -- Validate minimum withdrawal (500 PKR)
  IF p_gross_amount < v_settings.withdrawal_min_pkr THEN
    RETURN jsonb_build_object('success', false, 'error', 'Minimum withdrawal amount is ' || v_settings.withdrawal_min_pkr || ' PKR.');
  END IF;

  -- Check available balance
  IF v_user.available_balance < p_gross_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient available balance. You have ' || v_user.available_balance || ' PKR.');
  END IF;

  -- Calculate 2% fee
  v_fee_pct := v_settings.withdrawal_fee_rate * 100;
  v_fee_amount := ROUND((p_gross_amount * v_settings.withdrawal_fee_rate)::NUMERIC, 2);
  v_net_amount := p_gross_amount - v_fee_amount;

  -- Deduct from available balance, add to pending withdrawals
  UPDATE public.profiles
  SET available_balance = available_balance - p_gross_amount,
      pending_withdrawals = pending_withdrawals + p_gross_amount,
      updated_at = NOW()
  WHERE id = v_user_id;

  -- Insert withdrawal record
  INSERT INTO public.withdrawals (
    user_id,
    user_full_name,
    gross_amount,
    fee_percentage,
    fee_amount,
    net_amount,
    payment_method,
    account_title,
    account_number,
    user_note,
    status
  ) VALUES (
    v_user_id,
    v_user.full_name,
    p_gross_amount,
    v_fee_pct,
    v_fee_amount,
    v_net_amount,
    p_method,
    p_account_title,
    p_account_number,
    p_user_note,
    'pending'
  ) RETURNING id INTO v_withdrawal_id;

  RETURN jsonb_build_object(
    'success', true,
    'withdrawal_id', v_withdrawal_id,
    'gross_amount', p_gross_amount,
    'fee_amount', v_fee_amount,
    'net_amount', v_net_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 19. RPC: SERVER-SIDE LUCKY SPIN EXECUTION
-- ============================================================================
CREATE OR REPLACE FUNCTION public.perform_spin()
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_user public.profiles%ROWTYPE;
  v_total_weight INT := 0;
  v_random_weight INT;
  v_current_weight INT := 0;
  v_prize public.spin_prizes%ROWTYPE;
  v_spin_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated.');
  END IF;

  SELECT * INTO v_user FROM public.profiles WHERE id = v_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Profile not found.');
  END IF;

  IF v_user.spin_credits <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'You have 0 Lucky Spin credits available.');
  END IF;

  -- Deduct 1 spin credit
  UPDATE public.profiles
  SET spin_credits = spin_credits - 1,
      updated_at = NOW()
  WHERE id = v_user_id;

  -- Calculate weighted random prize
  SELECT SUM(weight) INTO v_total_weight FROM public.spin_prizes WHERE active = true;
  IF v_total_weight IS NULL OR v_total_weight <= 0 THEN
    v_total_weight := 100;
  END IF;

  v_random_weight := FLOOR(RANDOM() * v_total_weight)::INT;

  FOR v_prize IN SELECT * FROM public.spin_prizes WHERE active = true ORDER BY id LOOP
    v_current_weight := v_current_weight + v_prize.weight;
    IF v_current_weight > v_random_weight THEN
      EXIT;
    END IF;
  END LOOP;

  -- Apply prize reward
  IF v_prize.type = 'points' AND v_prize.value > 0 THEN
    UPDATE public.profiles
    SET current_points = current_points + v_prize.value,
        updated_at = NOW()
    WHERE id = v_user_id;

    INSERT INTO public.points_ledger (user_id, activity, points)
    VALUES (v_user_id, 'Lucky Spin Reward (' || v_prize.name || ')', v_prize.value);
  ELSIF v_prize.type = 'cash' AND v_prize.value > 0 THEN
    UPDATE public.profiles
    SET available_balance = available_balance + v_prize.value,
        total_earnings = total_earnings + v_prize.value,
        updated_at = NOW()
    WHERE id = v_user_id;
  ELSIF v_prize.type = 'spins' AND v_prize.value > 0 THEN
    UPDATE public.profiles
    SET spin_credits = spin_credits + v_prize.value,
        updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  -- Record spin
  INSERT INTO public.spins (
    user_id,
    prize_id,
    prize_name,
    prize_type,
    prize_value
  ) VALUES (
    v_user_id,
    v_prize.id,
    v_prize.name,
    v_prize.type,
    v_prize.value
  ) RETURNING id INTO v_spin_id;

  RETURN jsonb_build_object(
    'success', true,
    'spin_id', v_spin_id,
    'prize', jsonb_build_object(
      'id', v_prize.id,
      'name', v_prize.name,
      'type', v_prize.type,
      'value', v_prize.value,
      'label', v_prize.label,
      'color', v_prize.color
    ),
    'remaining_credits', v_user.spin_credits - 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 20. STORAGE BUCKETS (Private payment-proofs and kyc-documents)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload their own payment proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-proofs' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin()));

CREATE POLICY "Users can view their own payment proofs or admin"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-proofs' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin()));

CREATE POLICY "Users can upload their own KYC docs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'kyc-documents' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin()));

CREATE POLICY "Users can view their own KYC docs or admin"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'kyc-documents' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin()));
