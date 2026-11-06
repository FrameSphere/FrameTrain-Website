-- Support-Tickets einem Konto zuordnen. Rein additiv.
CREATE TABLE IF NOT EXISTS "support_ticket_links" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "user_token" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'web',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "support_ticket_links_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "support_ticket_links_user_id_ticket_id_key" ON "support_ticket_links"("user_id", "ticket_id");
CREATE INDEX IF NOT EXISTS "support_ticket_links_user_id_idx" ON "support_ticket_links"("user_id");

DO $$ BEGIN
  ALTER TABLE "support_ticket_links" ADD CONSTRAINT "support_ticket_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Row Level Security wie bei den uebrigen Tabellen (deny-all fuer anon/authenticated).
ALTER TABLE public."support_ticket_links" ENABLE ROW LEVEL SECURITY;
