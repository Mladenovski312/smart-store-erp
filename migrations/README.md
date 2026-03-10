# Database Migrations

Run these SQL files in numeric order in the Supabase SQL Editor to initialize
the database from scratch.

1. Open your Supabase project → SQL Editor
2. Run each file in order: 001 → 002 → 003 ...
3. All migrations are idempotent where possible (safe to re-run)

## New environment setup
Start with 001_initial_schema.sql, then run all subsequent files in order.
Total: ~12 files, takes ~5 minutes.
