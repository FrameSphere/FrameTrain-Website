-- Zeitlich begrenzter Promo-Zugang ohne Abo (Gratismonate-Code "ohne Karte" eingelöst)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "promo_access_until" TIMESTAMP(3);
