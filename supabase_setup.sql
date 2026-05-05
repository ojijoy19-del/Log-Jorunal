-- Life Log Journal Supabase Schema (Public Access / No RLS)
-- Run this in your Supabase SQL Editor

-- 1. Create the Entries Table
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, 
    date DATE NOT NULL,
    content TEXT DEFAULT '',
    mood TEXT CHECK (mood IN ('peaceful', 'happy', 'neutral', 'sad', 'anxious')) DEFAULT 'peaceful',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- This specific constraint is required for the 'upsert' logic in the app to work
    UNIQUE(user_id, date)
);

-- 2. Disable Row Level Security (RLS) as requested
ALTER TABLE public.journal_entries DISABLE ROW LEVEL SECURITY;

-- 3. Grant full access to everyone (public/anon)
GRANT ALL ON TABLE public.journal_entries TO anon;
GRANT ALL ON TABLE public.journal_entries TO authenticated;
GRANT ALL ON TABLE public.journal_entries TO service_role;

-- 4. Helper Function for Updated At
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.journal_entries;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.journal_entries
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- 5. Indices for performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON public.journal_entries(date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);
