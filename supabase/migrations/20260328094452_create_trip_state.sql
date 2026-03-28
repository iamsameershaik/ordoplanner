/*
  # Create trip_state table

  ## Purpose
  Shared key/value store for the North Wales Trip companion app.
  Replaces localStorage so both users stay in real-time sync.

  ## Tables
  - `trip_state`
    - `key` (text, primary key) — identifier for each state slice
      e.g. "nw_itinerary", "nw_checklist", "nw_meals", "nw_places", "nw_notes", "nw_links"
    - `value` (jsonb) — serialised state for that key
    - `updated_at` (timestamptz) — auto-updated timestamp for conflict resolution

  ## Security
  RLS is enabled. This is a no-auth, shared companion app where both
  travellers need full read/write access without signing in, so policies
  grant the anonymous role unrestricted access. This is intentional — there
  is no per-user data to protect.
*/

CREATE TABLE IF NOT EXISTS trip_state (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL DEFAULT 'null'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE trip_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon select"
  ON trip_state FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon insert"
  ON trip_state FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon update"
  ON trip_state FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_trip_state_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_trip_state_timestamp
  BEFORE UPDATE ON trip_state
  FOR EACH ROW EXECUTE FUNCTION update_trip_state_timestamp();
