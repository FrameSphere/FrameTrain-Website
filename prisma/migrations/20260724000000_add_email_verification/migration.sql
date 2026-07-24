-- E-Mail-Verifikation: neue Accounts (Registrierung per Passwort) müssen ihre
-- Adresse per Resend-Mail bestätigen. OAuth/SSO-User werden bei der Erstellung
-- direkt als verifiziert markiert, da der Provider bereits für die E-Mail bürgt.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_token_hash" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_expires" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_verification_token_hash_key" ON "users"("email_verification_token_hash");

-- Bestehende Accounts (bereits zahlende/aktive Nutzer) rückwirkend als
-- verifiziert markieren, damit sie nicht plötzlich als "unverifiziert" gelten
-- und von der Banner-/Blockierungslogik betroffen sind.
UPDATE "users" SET "email_verified" = true WHERE "email_verified" = false AND ("has_paid" = true OR "provider" IS DISTINCT FROM 'email' AND "provider" IS NOT NULL);
