-- Deprecated: use supabase_repair.sql instead (includes notes + updated_at + policies)
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
NOTIFY pgrst, 'reload schema';
