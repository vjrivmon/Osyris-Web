-- Migration: Add 'comite' role for kitchen/committee dashboard
-- Date: 2026-01-28

ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check
  CHECK (rol IN ('admin', 'scouter', 'familia', 'educando', 'comite'));
