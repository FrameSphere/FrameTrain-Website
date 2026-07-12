-- Lifetime-Access-Flag am User (Zugang via Lifetime-Code, unabhängig vom Stripe-Abo)
ALTER TABLE "users" ADD COLUMN "lifetime_access" BOOLEAN NOT NULL DEFAULT false;

-- Promo-Codes
CREATE TABLE "promo_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "percent_off" INTEGER,
    "percent_duration" TEXT,
    "percent_duration_months" INTEGER,
    "free_months" INTEGER,
    "max_redemptions" INTEGER,
    "redemption_count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "stripe_coupon_id" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "promo_codes_code_key" ON "promo_codes"("code");
CREATE INDEX "promo_codes_is_active_idx" ON "promo_codes"("is_active");

-- Einlösungen (jeder User kann jeden Code nur einmal einlösen)
CREATE TABLE "promo_code_redemptions" (
    "id" TEXT NOT NULL,
    "promo_code_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "plan" TEXT,
    "stripe_session_id" TEXT,
    "redeemed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "promo_code_redemptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "promo_code_redemptions_promo_code_id_user_id_key"
    ON "promo_code_redemptions"("promo_code_id", "user_id");
CREATE INDEX "promo_code_redemptions_user_id_idx" ON "promo_code_redemptions"("user_id");

ALTER TABLE "promo_code_redemptions"
    ADD CONSTRAINT "promo_code_redemptions_promo_code_id_fkey"
    FOREIGN KEY ("promo_code_id") REFERENCES "promo_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "promo_code_redemptions"
    ADD CONSTRAINT "promo_code_redemptions_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
