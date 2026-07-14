-- Ende der Stripe-Gratiszeit (Trial) am User
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_trial_end" TIMESTAMP(3);

-- Lückenlose Zahlungshistorie: Verlängerungen & Fehlversuche pro Stripe-Rechnung
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "stripe_invoice_id" TEXT;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "billing_reason" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "payments_stripe_invoice_id_key" ON "payments"("stripe_invoice_id");
