/*
  # Add trip_pins table and coordinate columns

  ## Summary
  Adds support for the new Map tab feature.

  ## New Tables
  - `trip_pins`
    - `id` (uuid, primary key)
    - `trip_id` (text) — identifies which trip these pins belong to (uses a fixed key like 'nw_trip')
    - `type` (text) — one of 'hotel', 'coach_dropoff', 'coach_pickup'
    - `name` (text) — optional display name
    - `address` (text) — optional address string
    - `lat` (double precision) — latitude
    - `lng` (double precision) — longitude
    - `created_at` (timestamptz)
  - Unique constraint: one pin per trip per type

  ## Security
  - RLS enabled
  - Anon role granted full read/write (same pattern as trip_state — shared no-auth app)
*/

CREATE TABLE IF NOT EXISTS trip_pins (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id    text NOT NULL DEFAULT 'nw_trip',
  type       text NOT NULL CHECK (type IN ('hotel', 'coach_dropoff', 'coach_pickup')),
  name       text,
  address    text,
  lat        double precision NOT NULL,
  lng        double precision NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_trip_pin_type ON trip_pins (trip_id, type);

ALTER TABLE trip_pins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon select trip_pins"
  ON trip_pins FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon insert trip_pins"
  ON trip_pins FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon update trip_pins"
  ON trip_pins FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon delete trip_pins"
  ON trip_pins FOR DELETE
  TO anon
  USING (true);
