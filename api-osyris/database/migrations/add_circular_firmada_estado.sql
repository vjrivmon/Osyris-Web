-- Migration: add circular_firmada_estado column to inscripciones_campamento
-- Idempotent: uses IF NOT EXISTS pattern via DO block

DO $$
BEGIN
  -- Add circular_firmada_url if it doesn't exist (safety check)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inscripciones_campamento' AND column_name = 'circular_firmada_url'
  ) THEN
    ALTER TABLE inscripciones_campamento ADD COLUMN circular_firmada_url TEXT;
  END IF;

  -- Add circular_firmada_estado for tracking validation status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inscripciones_campamento' AND column_name = 'circular_firmada_estado'
  ) THEN
    ALTER TABLE inscripciones_campamento ADD COLUMN circular_firmada_estado TEXT DEFAULT 'pendiente';
  END IF;
END $$;
