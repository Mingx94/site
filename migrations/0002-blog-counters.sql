CREATE TABLE IF NOT EXISTS site_counters (
  slug TEXT NOT NULL,
  metric TEXT NOT NULL,
  value INTEGER NOT NULL DEFAULT 0 CHECK (value >= 0),
  PRIMARY KEY (slug, metric)
);
