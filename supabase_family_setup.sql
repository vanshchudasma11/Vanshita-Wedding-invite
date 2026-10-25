-- ============================================================================
-- Supabase SQL Migration: RSVP Row-Level Security & Family Authorization
-- Wedding Website: Vanshita & Ankit
-- ============================================================================
-- Execute this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rrtxcahrcxrzjgolebrj/sql
-- ============================================================================

-- 1. Ensure Table Permissions are Granted to Standard API Roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.rsvp_responses TO authenticated;
GRANT INSERT ON public.rsvp_responses TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 2. Create the family_members table for managing authorized family accounts
CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON public.family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_email ON public.family_members(email);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "family_members_select_own" ON public.family_members;
CREATE POLICY "family_members_select_own"
ON public.family_members FOR SELECT TO authenticated
USING (
    user_id = auth.uid()
    OR (email IS NOT NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
);

-- Authorize the primary family account
INSERT INTO public.family_members (email)
VALUES ('vanshchudasma11@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- 3. Ensure Row-Level Security (RLS) is Active on rsvp_responses
ALTER TABLE public.rsvp_responses ENABLE ROW LEVEL SECURITY;

-- 4. Clean up any existing, duplicate, or conflicting policies on rsvp_responses
DROP POLICY IF EXISTS "Allow family members to select rsvp_responses" ON public.rsvp_responses;
DROP POLICY IF EXISTS "Allow authenticated to select rsvp_responses" ON public.rsvp_responses;
DROP POLICY IF EXISTS "family_read_rsvp" ON public.rsvp_responses;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.rsvp_responses;
DROP POLICY IF EXISTS "Allow public read" ON public.rsvp_responses;
DROP POLICY IF EXISTS "Allow public insert to rsvp_responses" ON public.rsvp_responses;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.rsvp_responses;

-- 5. INSERT Policy: Preserve wedding guest submissions (Public & Anon can INSERT only)
CREATE POLICY "Allow public insert to rsvp_responses"
ON public.rsvp_responses
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 6. SELECT Policy: Exclusively authorize authenticated family account
-- Checks the cryptographically verified JWT email of the signed-in user
-- and any account listed in public.family_members.
CREATE POLICY "Allow family members to select rsvp_responses"
ON public.rsvp_responses
FOR SELECT
TO authenticated
USING (
    -- Direct check against authenticated user's verified JWT email
    LOWER(auth.jwt() ->> 'email') = 'vanshchudasma11@gmail.com'
    -- OR check if user exists in family_members table
    OR EXISTS (
        SELECT 1
        FROM public.family_members fm
        WHERE fm.user_id = auth.uid()
           OR (fm.email IS NOT NULL AND LOWER(fm.email) = LOWER(auth.jwt() ->> 'email'))
    )
);
