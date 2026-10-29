-- AGB-Version, der ein Nutzer zugestimmt hat. Bestandszeilen bleiben NULL und
-- müssen der Fassung 2026-10 neu zustimmen. Rein additiv.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "terms_version" TEXT;
