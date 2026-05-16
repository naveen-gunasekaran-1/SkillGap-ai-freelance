-- Enterprise trust, explainability, compliance, and audit foundation.
-- This migration is intentionally additive to preserve existing MVP data and APIs.

ALTER TABLE "Company"
ADD COLUMN "verificationStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN "verificationSubmittedAt" TIMESTAMP(3),
ADD COLUMN "verificationReviewedAt" TIMESTAMP(3);

CREATE TABLE "company_verifications" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "region" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "submittedById" TEXT,
    "reviewedById" TEXT,
    "rejectionReason" TEXT,
    "fraudScore" INTEGER NOT NULL DEFAULT 0,
    "metadataJson" JSONB,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_verifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "verification_documents" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "verificationId" TEXT,
    "type" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "checksumSha256" TEXT,
    "encryptionKeyId" TEXT,
    "malwareScanStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "status" TEXT NOT NULL DEFAULT 'UPLOADED',
    "uploadedById" TEXT,
    "reviewedById" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "verification_documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_explanations" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "missingSkillsJson" JSONB NOT NULL,
    "weakEvidenceJson" JSONB NOT NULL,
    "strengthsJson" JSONB NOT NULL,
    "recommendationsJson" JSONB NOT NULL,
    "rawOutputJson" JSONB,
    "generatedBy" TEXT NOT NULL DEFAULT 'system',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_explanations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "actorRole" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "recruiter_activity_logs" (
    "id" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,
    "companyId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "metadataJson" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recruiter_activity_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cookie_consents" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "anonymousId" TEXT,
    "essential" BOOLEAN NOT NULL DEFAULT true,
    "analytics" BOOLEAN NOT NULL DEFAULT false,
    "marketing" BOOLEAN NOT NULL DEFAULT false,
    "preferences" BOOLEAN NOT NULL DEFAULT false,
    "policyVersion" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cookie_consents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "fraud_flags" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "verificationId" TEXT,
    "severity" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "evidenceJson" JSONB,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fraud_flags_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "admin_reviews" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "companyId" TEXT,
    "applicationId" TEXT,
    "verificationId" TEXT,
    "createdById" TEXT,
    "reviewedById" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "decision" TEXT,
    "notes" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "admin_reviews_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "legal_acceptances" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "documentType" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "legal_acceptances_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "skill_embeddings" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "dimensions" INTEGER NOT NULL,
    "embeddingJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_embeddings_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "company_verifications_companyId_idx" ON "company_verifications"("companyId");
CREATE INDEX "company_verifications_status_idx" ON "company_verifications"("status");
CREATE INDEX "company_verifications_countryCode_idx" ON "company_verifications"("countryCode");

CREATE INDEX "verification_documents_companyId_idx" ON "verification_documents"("companyId");
CREATE INDEX "verification_documents_verificationId_idx" ON "verification_documents"("verificationId");
CREATE INDEX "verification_documents_type_idx" ON "verification_documents"("type");
CREATE INDEX "verification_documents_status_idx" ON "verification_documents"("status");

CREATE INDEX "ai_explanations_applicationId_idx" ON "ai_explanations"("applicationId");
CREATE INDEX "ai_explanations_type_idx" ON "ai_explanations"("type");
CREATE INDEX "ai_explanations_createdAt_idx" ON "ai_explanations"("createdAt");

CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

CREATE INDEX "recruiter_activity_logs_recruiterId_idx" ON "recruiter_activity_logs"("recruiterId");
CREATE INDEX "recruiter_activity_logs_companyId_idx" ON "recruiter_activity_logs"("companyId");
CREATE INDEX "recruiter_activity_logs_action_idx" ON "recruiter_activity_logs"("action");
CREATE INDEX "recruiter_activity_logs_riskScore_idx" ON "recruiter_activity_logs"("riskScore");
CREATE INDEX "recruiter_activity_logs_createdAt_idx" ON "recruiter_activity_logs"("createdAt");

CREATE INDEX "cookie_consents_userId_idx" ON "cookie_consents"("userId");
CREATE INDEX "cookie_consents_anonymousId_idx" ON "cookie_consents"("anonymousId");
CREATE INDEX "cookie_consents_createdAt_idx" ON "cookie_consents"("createdAt");

CREATE INDEX "fraud_flags_companyId_idx" ON "fraud_flags"("companyId");
CREATE INDEX "fraud_flags_verificationId_idx" ON "fraud_flags"("verificationId");
CREATE INDEX "fraud_flags_severity_idx" ON "fraud_flags"("severity");
CREATE INDEX "fraud_flags_status_idx" ON "fraud_flags"("status");

CREATE INDEX "admin_reviews_entityType_entityId_idx" ON "admin_reviews"("entityType", "entityId");
CREATE INDEX "admin_reviews_companyId_idx" ON "admin_reviews"("companyId");
CREATE INDEX "admin_reviews_applicationId_idx" ON "admin_reviews"("applicationId");
CREATE INDEX "admin_reviews_verificationId_idx" ON "admin_reviews"("verificationId");
CREATE INDEX "admin_reviews_status_idx" ON "admin_reviews"("status");

CREATE INDEX "legal_acceptances_userId_idx" ON "legal_acceptances"("userId");
CREATE INDEX "legal_acceptances_documentType_version_idx" ON "legal_acceptances"("documentType", "version");

CREATE UNIQUE INDEX "skill_embeddings_skillId_provider_model_key" ON "skill_embeddings"("skillId", "provider", "model");
CREATE INDEX "skill_embeddings_skillId_idx" ON "skill_embeddings"("skillId");

ALTER TABLE "company_verifications" ADD CONSTRAINT "company_verifications_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "verification_documents" ADD CONSTRAINT "verification_documents_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "verification_documents" ADD CONSTRAINT "verification_documents_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "company_verifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ai_explanations" ADD CONSTRAINT "ai_explanations_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "recruiter_activity_logs" ADD CONSTRAINT "recruiter_activity_logs_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recruiter_activity_logs" ADD CONSTRAINT "recruiter_activity_logs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "cookie_consents" ADD CONSTRAINT "cookie_consents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "fraud_flags" ADD CONSTRAINT "fraud_flags_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "fraud_flags" ADD CONSTRAINT "fraud_flags_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "company_verifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "admin_reviews" ADD CONSTRAINT "admin_reviews_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "admin_reviews" ADD CONSTRAINT "admin_reviews_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "admin_reviews" ADD CONSTRAINT "admin_reviews_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "company_verifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "admin_reviews" ADD CONSTRAINT "admin_reviews_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "admin_reviews" ADD CONSTRAINT "admin_reviews_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "legal_acceptances" ADD CONSTRAINT "legal_acceptances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "skill_embeddings" ADD CONSTRAINT "skill_embeddings_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
