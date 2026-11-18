-- FrameTrain Business: Teams und Plaetze. Rein additiv.
CREATE TABLE IF NOT EXISTS "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "seat_limit" INTEGER NOT NULL DEFAULT 5,
    "access_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "teams_owner_id_key" ON "teams"("owner_id");

CREATE TABLE IF NOT EXISTS "team_seats" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "api_key_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT NOT NULL DEFAULT 'member',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "desktop_password_hash" TEXT,
    "device_id" TEXT,
    "device_name" TEXT,
    "last_seen_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "team_seats_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "team_seats_api_key_id_key" ON "team_seats"("api_key_id");
CREATE INDEX IF NOT EXISTS "team_seats_team_id_idx" ON "team_seats"("team_id");

DO $$ BEGIN
  ALTER TABLE "teams" ADD CONSTRAINT "teams_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "team_seats" ADD CONSTRAINT "team_seats_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "team_seats" ADD CONSTRAINT "team_seats_api_key_id_fkey" FOREIGN KEY ("api_key_id") REFERENCES "api_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Row Level Security wie bei den uebrigen Tabellen (deny-all fuer anon/authenticated).
ALTER TABLE public."teams" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."team_seats" ENABLE ROW LEVEL SECURITY;

-- Stufe 2: Team-Katalog, Aktivitaeten, Hinweis zum Team-Speicher
ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "storage_hint" TEXT;

CREATE TABLE IF NOT EXISTS "team_entries" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "local_ref" TEXT NOT NULL,
    "author_key" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "storage_path" TEXT,
    "size_bytes" BIGINT,
    "auto" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "team_entries_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "team_entries_team_id_kind_local_ref_author_key_key" ON "team_entries"("team_id", "kind", "local_ref", "author_key");
CREATE INDEX IF NOT EXISTS "team_entries_team_id_updated_at_idx" ON "team_entries"("team_id", "updated_at");

CREATE TABLE IF NOT EXISTS "team_activities" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "actor_name" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entry_id" TEXT,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "team_activities_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "team_activities_team_id_created_at_idx" ON "team_activities"("team_id", "created_at");

DO $$ BEGIN
  ALTER TABLE "team_entries" ADD CONSTRAINT "team_entries_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "team_activities" ADD CONSTRAINT "team_activities_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public."team_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."team_activities" ENABLE ROW LEVEL SECURITY;
