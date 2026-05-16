CREATE TABLE "account_tokens" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "account_tokens_tokenHash_key" ON "account_tokens"("tokenHash");
CREATE INDEX "account_tokens_userId_idx" ON "account_tokens"("userId");
CREATE INDEX "account_tokens_type_idx" ON "account_tokens"("type");
CREATE INDEX "account_tokens_expiresAt_idx" ON "account_tokens"("expiresAt");

ALTER TABLE "account_tokens" ADD CONSTRAINT "account_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
