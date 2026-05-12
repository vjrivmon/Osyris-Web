CREATE TABLE IF NOT EXISTS aniversario_accesos (
  id          SERIAL PRIMARY KEY,
  email       TEXT NOT NULL,
  ip          TEXT,
  evento      TEXT NOT NULL,  -- 'login', 'view', 'download'
  detalle     TEXT,           -- nombre de archivo si aplica
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aniversario_accesos_email ON aniversario_accesos(email);
CREATE INDEX IF NOT EXISTS idx_aniversario_accesos_created_at ON aniversario_accesos(created_at DESC);
