-- Migration: Fix slugs by adding Cyrillic→Latin transliteration
-- The original migration produced broken slugs for Macedonian product names
-- (e.g. "Баланс велосипед" → "-4de4ff7f" instead of "balans-velosiped-4de4ff7f")
-- Run this in the Supabase SQL Editor AFTER add_slug_column.sql

UPDATE products
SET slug = (
    SELECT
        TRIM(BOTH '-' FROM
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    -- Transliterate Cyrillic to Latin (multi-char digraphs first via REPLACE, then single chars via TRANSLATE)
                    TRANSLATE(
                        REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
                            LOWER(name),
                            'љ', 'lj'), 'њ', 'nj'), 'џ', 'dj'), 'ж', 'zh'),
                            'ш', 'sh'), 'ч', 'ch'), 'ѓ', 'gj'), 'ќ', 'kj'), 'ѕ', 'dz'),
                        'абвгдезијклмнопрстуфхц',
                        'abvgdezijklmnoprstufhc'
                    ),
                    '[^a-z0-9]', '-', 'g'
                ),
                '-{2,}', '-', 'g'
            )
        ) || '-' || LEFT(id::text, 8)
);
