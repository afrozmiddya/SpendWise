-- ============================================================
-- SpendWise — Supabase Database Setup
-- Run this entire script in your Supabase SQL Editor
-- ============================================================

-- 1. PROFILES TABLE
-- Extends Supabase auth.users with custom fields
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name   TEXT,
  phone       TEXT,
  avatar_url  TEXT,
  currency    TEXT DEFAULT '₹',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title       TEXT NOT NULL,
  amount      NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  category    TEXT NOT NULL DEFAULT 'other',
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BUDGETS TABLE (optional feature)
CREATE TABLE IF NOT EXISTS public.budgets (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category    TEXT NOT NULL,
  amount      NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Expenses policies
CREATE POLICY "Users can view own expenses"
  ON public.expenses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON public.expenses FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- Budgets policies
CREATE POLICY "Users can view own budgets"
  ON public.budgets FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own budgets"
  ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON public.budgets FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON public.budgets FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGN UP
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- STORAGE BUCKET FOR AVATARS
-- Run this in SQL editor OR create manually in Storage section
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- INDEXES for performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, date DESC);

-- ============================================================
-- EXISTING PROJECTS: if tables were created earlier, run instead:
--   supabase_repair.sql
-- Or verify with:  node scripts/check-supabase.mjs
-- ============================================================
