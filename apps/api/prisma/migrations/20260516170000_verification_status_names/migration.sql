-- Align company verification status names with production UX language.
-- Keep this additive/safe for existing data created with the earlier enterprise migration.

ALTER TABLE "company_verifications" ALTER COLUMN "status" SET DEFAULT 'IN_PROGRESS';

UPDATE "company_verifications" SET "status" = 'IN_PROGRESS' WHERE "status" = 'DRAFT';
UPDATE "company_verifications" SET "status" = 'UNDER_REVIEW' WHERE "status" = 'IN_REVIEW';
UPDATE "company_verifications" SET "status" = 'VERIFIED' WHERE "status" = 'APPROVED';

UPDATE "Company" SET "verificationStatus" = 'IN_PROGRESS' WHERE "verificationStatus" = 'DRAFT';
UPDATE "Company" SET "verificationStatus" = 'UNDER_REVIEW' WHERE "verificationStatus" = 'IN_REVIEW';
UPDATE "Company" SET "verificationStatus" = 'VERIFIED' WHERE "verificationStatus" = 'APPROVED';
