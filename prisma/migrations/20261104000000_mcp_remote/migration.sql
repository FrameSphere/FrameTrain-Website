-- KI-Verbindungen (MCP): Relay-Geraete, Jobs, OAuth-Clients/-Codes/-Tokens und
-- sichtbare Verbindungen je Nutzer + Client. Rein additiv, idempotent
-- (IF NOT EXISTS / DO-Bloecke), bestehende Tabellen bleiben unveraendert.
-- Vertrag: docs/mcp/CONTRACT.md. Tokens und Codes nur als SHA-256-Hash.

-- CreateTable
CREATE TABLE IF NOT EXISTS "mcp_devices" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "device_name" TEXT NOT NULL,
    "app_version" TEXT NOT NULL,
    "manifest_hash" TEXT,
    "manifest" JSONB,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mcp_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "mcp_jobs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "device_id" TEXT,
    "connection_id" TEXT,
    "client_name" TEXT NOT NULL,
    "tool" TEXT NOT NULL,
    "args" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "result" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivered_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "mcp_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "oauth_clients" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "redirect_uris" TEXT[],
    "client_uri" TEXT,
    "logo_uri" TEXT,
    "registration_type" TEXT NOT NULL DEFAULT 'dcr',
    "metadata_fetched_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMP(3),

    CONSTRAINT "oauth_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "oauth_auth_codes" (
    "id" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "redirect_uri" TEXT NOT NULL,
    "code_challenge" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oauth_auth_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "oauth_tokens" (
    "id" TEXT NOT NULL,
    "family_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "access_token_hash" TEXT NOT NULL,
    "refresh_token_hash" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "access_expires_at" TIMESTAMP(3) NOT NULL,
    "refresh_expires_at" TIMESTAMP(3) NOT NULL,
    "rotated_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oauth_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "mcp_connections" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "mcp_connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "mcp_devices_user_id_last_seen_at_idx" ON "mcp_devices"("user_id", "last_seen_at");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "mcp_devices_user_id_device_id_key" ON "mcp_devices"("user_id", "device_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "mcp_jobs_user_id_status_created_at_idx" ON "mcp_jobs"("user_id", "status", "created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "mcp_jobs_created_at_idx" ON "mcp_jobs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "oauth_clients_client_id_key" ON "oauth_clients"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "oauth_auth_codes_code_hash_key" ON "oauth_auth_codes"("code_hash");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "oauth_auth_codes_expires_at_idx" ON "oauth_auth_codes"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "oauth_tokens_access_token_hash_key" ON "oauth_tokens"("access_token_hash");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "oauth_tokens_refresh_token_hash_key" ON "oauth_tokens"("refresh_token_hash");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "oauth_tokens_family_id_idx" ON "oauth_tokens"("family_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "oauth_tokens_connection_id_idx" ON "oauth_tokens"("connection_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "oauth_tokens_refresh_expires_at_idx" ON "oauth_tokens"("refresh_expires_at");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "mcp_connections_user_id_client_id_key" ON "mcp_connections"("user_id", "client_id");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "mcp_devices" ADD CONSTRAINT "mcp_devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "mcp_jobs" ADD CONSTRAINT "mcp_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "mcp_jobs" ADD CONSTRAINT "mcp_jobs_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "mcp_devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "mcp_jobs" ADD CONSTRAINT "mcp_jobs_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "mcp_connections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "oauth_auth_codes" ADD CONSTRAINT "oauth_auth_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "oauth_tokens" ADD CONSTRAINT "oauth_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "oauth_tokens" ADD CONSTRAINT "oauth_tokens_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "mcp_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "mcp_connections" ADD CONSTRAINT "mcp_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- Row Level Security wie in prisma/enable-rls.sql: ohne Policies = deny-all fuer
-- anon/authenticated (PostgREST). Prisma laeuft als postgres mit BYPASSRLS.
ALTER TABLE public."mcp_devices"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."mcp_jobs"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."oauth_clients"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."oauth_auth_codes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."oauth_tokens"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."mcp_connections"  ENABLE ROW LEVEL SECURITY;
