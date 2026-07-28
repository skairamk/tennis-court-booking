CREATE TABLE IF NOT EXISTS courts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  surface TEXT NOT NULL,
  setting TEXT NOT NULL,
  price_per_hour NUMERIC(6, 2) NOT NULL,
  open_hour SMALLINT NOT NULL,
  close_hour SMALLINT NOT NULL,
  description TEXT NOT NULL
);

-- Assumes Better Auth's migration (`npm run auth:migrate`) has already
-- created the "user" table this references.
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id TEXT NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  date_key DATE NOT NULL,
  slot TEXT NOT NULL,
  player_name TEXT NOT NULL,
  price_per_hour NUMERIC(6, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (court_id, date_key, slot)
);

-- Upgrade path for a bookings table that predates the user_id column.
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE;
ALTER TABLE bookings ALTER COLUMN user_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS bookings_court_date_idx ON bookings (court_id, date_key);
CREATE INDEX IF NOT EXISTS bookings_user_idx ON bookings (user_id);
