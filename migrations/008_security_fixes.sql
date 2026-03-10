-- ==============================================================================
-- Migration: Fix Function Search Path Mutable Warning
-- Description: Locks the search_path for the `is_admin` function to prevent 
--              potential search path injection attacks.
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ==============================================================================

ALTER FUNCTION public.is_admin() SET search_path = public;

SELECT 'Successfully secured the is_admin function search path!' as status;
