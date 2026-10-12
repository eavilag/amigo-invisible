-- Migración inicial (ARQ §4). Aplicar con: npm run db:migrate:remote
CREATE TABLE groups (
  id              TEXT PRIMARY KEY,                 -- 128 bits aleatorios, base64url
  admin_key_hash  TEXT NOT NULL UNIQUE,             -- SHA-256 hex de la clave de organizador (ADR-0008)
  name            TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 60),
  delivery_date   TEXT CHECK (delivery_date IS NULL OR delivery_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  budget          TEXT CHECK (budget IS NULL OR length(budget) <= 30),
  draw_version    INTEGER NOT NULL DEFAULT 0,       -- control optimista de concurrencia del sorteo
  drawn_at        TEXT,                             -- NULL = sin sorteo
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
) STRICT;

CREATE TABLE participants (
  id           TEXT PRIMARY KEY,                    -- 128 bits aleatorios, base64url
  group_id     TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name         TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 30),
  name_key     TEXT NOT NULL,                       -- nombre normalizado para detectar duplicados
  position     INTEGER NOT NULL,
  token_hash   TEXT UNIQUE,                         -- SHA-256 hex del token del móvil; NULL = libre
  claimed_at   TEXT,
  receiver_id  TEXT REFERENCES participants(id),    -- a quién regala; NULL sin sorteo
  viewed_at    TEXT,                                -- cuándo vio su resultado
  wishlist     TEXT NOT NULL DEFAULT '' CHECK (length(wishlist) <= 500),
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL,
  UNIQUE (group_id, name_key)
) STRICT;

CREATE INDEX idx_participants_group ON participants(group_id, position);
