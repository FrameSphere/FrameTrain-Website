-- Onboarding-Mails: Sprache, Abmeldung und Fortschritt pro Nutzer.
-- Rein additiv, alle Spalten mit Default – bestehende Zeilen bleiben gültig.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_locale" TEXT NOT NULL DEFAULT 'de';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboarding_emails" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboarding_step" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboarding_last_sent_at" TIMESTAMP(3);
