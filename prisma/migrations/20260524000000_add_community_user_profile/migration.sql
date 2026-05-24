-- Add communityName field to users table
ALTER TABLE "users" ADD COLUMN "community_name" TEXT UNIQUE;

-- Add userId field to library_scripts table
ALTER TABLE "library_scripts" ADD COLUMN "user_id" TEXT;

-- Add foreign key constraint
ALTER TABLE "library_scripts" ADD CONSTRAINT "LibraryScript_userId_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create index for userId
CREATE INDEX "library_scripts_user_id_idx" ON "library_scripts"("user_id");
