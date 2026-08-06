-- CreateEnum
CREATE TYPE "SubmissionLifecycle" AS ENUM ('OPEN', 'PUBLISHED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "DesignSystemLifecycle" AS ENUM ('PUBLISHED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "displayName" TEXT,
    "githubHandle" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestSession" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimedAt" TIMESTAMP(3),
    "claimedById" TEXT,

    CONSTRAINT "GuestSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT,
    "guestSessionId" TEXT,
    "lifecycle" "SubmissionLifecycle" NOT NULL DEFAULT 'OPEN',
    "sessionGeneration" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionDraft" (
    "submissionId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "document" JSONB NOT NULL,
    "assessment" JSONB NOT NULL,
    "designMd" TEXT,
    "renderer" JSONB,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubmissionDraft_pkey" PRIMARY KEY ("submissionId")
);

-- CreateTable
CREATE TABLE "SubmissionAgentSession" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "capabilityHash" TEXT NOT NULL,
    "generation" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionAgentSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignSystem" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "tags" TEXT[],
    "inspiration" JSONB,
    "document" JSONB NOT NULL,
    "designMd" TEXT NOT NULL,
    "renderer" JSONB NOT NULL,
    "assessment" JSONB NOT NULL,
    "validatorVersion" TEXT NOT NULL,
    "sourceSubmissionId" TEXT NOT NULL,
    "sourceRevision" INTEGER NOT NULL,
    "rightsAttestation" BOOLEAN NOT NULL,
    "rightsStatementVersion" TEXT NOT NULL,
    "rightsAcceptedAt" TIMESTAMP(3) NOT NULL,
    "lifecycle" "DesignSystemLifecycle" NOT NULL DEFAULT 'PUBLISHED',
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawnAt" TIMESTAMP(3),

    CONSTRAINT "DesignSystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "userId" TEXT NOT NULL,
    "designSystemId" TEXT NOT NULL,
    "voteDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("userId","designSystemId","voteDate")
);

-- CreateTable
CREATE TABLE "DailyCopyMetric" (
    "designSystemId" TEXT NOT NULL,
    "metricDate" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyCopyMetric_pkey" PRIMARY KEY ("designSystemId","metricDate")
);

-- CreateTable
CREATE TABLE "CopyReceipt" (
    "designSystemId" TEXT NOT NULL,
    "receiptDate" DATE NOT NULL,
    "actorHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CopyReceipt_pkey" PRIMARY KEY ("designSystemId","receiptDate","actorHash")
);

-- CreateTable
CREATE TABLE "DailyPick" (
    "featuredDate" DATE NOT NULL,
    "competitionDate" DATE NOT NULL,
    "winnerId" TEXT NOT NULL,
    "voteSnapshot" INTEGER NOT NULL,
    "ruleVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyPick_pkey" PRIMARY KEY ("featuredDate")
);

-- CreateTable
CREATE TABLE "Auth" (
    "id" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Auth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthIdentity" (
    "providerName" TEXT NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "providerData" TEXT NOT NULL DEFAULT '{}',
    "authId" TEXT NOT NULL,

    CONSTRAINT "AuthIdentity_pkey" PRIMARY KEY ("providerName","providerUserId")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_githubHandle_key" ON "User"("githubHandle");

-- CreateIndex
CREATE UNIQUE INDEX "GuestSession_tokenHash_key" ON "GuestSession"("tokenHash");

-- CreateIndex
CREATE INDEX "GuestSession_lastUsedAt_idx" ON "GuestSession"("lastUsedAt");

-- CreateIndex
CREATE INDEX "Submission_ownerId_updatedAt_idx" ON "Submission"("ownerId", "updatedAt");

-- CreateIndex
CREATE INDEX "Submission_guestSessionId_updatedAt_idx" ON "Submission"("guestSessionId", "updatedAt");

-- CreateIndex
CREATE INDEX "Submission_lifecycle_updatedAt_idx" ON "Submission"("lifecycle", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionAgentSession_capabilityHash_key" ON "SubmissionAgentSession"("capabilityHash");

-- CreateIndex
CREATE INDEX "SubmissionAgentSession_submissionId_expiresAt_idx" ON "SubmissionAgentSession"("submissionId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "DesignSystem_slug_key" ON "DesignSystem"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "DesignSystem_sourceSubmissionId_key" ON "DesignSystem"("sourceSubmissionId");

-- CreateIndex
CREATE INDEX "DesignSystem_lifecycle_publishedAt_idx" ON "DesignSystem"("lifecycle", "publishedAt");

-- CreateIndex
CREATE INDEX "Vote_designSystemId_voteDate_idx" ON "Vote"("designSystemId", "voteDate");

-- CreateIndex
CREATE INDEX "CopyReceipt_receiptDate_idx" ON "CopyReceipt"("receiptDate");

-- CreateIndex
CREATE UNIQUE INDEX "DailyPick_competitionDate_key" ON "DailyPick"("competitionDate");

-- CreateIndex
CREATE INDEX "DailyPick_winnerId_idx" ON "DailyPick"("winnerId");

-- CreateIndex
CREATE UNIQUE INDEX "Auth_userId_key" ON "Auth"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_id_key" ON "Session"("id");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- AddForeignKey
ALTER TABLE "GuestSession" ADD CONSTRAINT "GuestSession_claimedById_fkey" FOREIGN KEY ("claimedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_guestSessionId_fkey" FOREIGN KEY ("guestSessionId") REFERENCES "GuestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionDraft" ADD CONSTRAINT "SubmissionDraft_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionAgentSession" ADD CONSTRAINT "SubmissionAgentSession_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignSystem" ADD CONSTRAINT "DesignSystem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignSystem" ADD CONSTRAINT "DesignSystem_sourceSubmissionId_fkey" FOREIGN KEY ("sourceSubmissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_designSystemId_fkey" FOREIGN KEY ("designSystemId") REFERENCES "DesignSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyCopyMetric" ADD CONSTRAINT "DailyCopyMetric_designSystemId_fkey" FOREIGN KEY ("designSystemId") REFERENCES "DesignSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopyReceipt" ADD CONSTRAINT "CopyReceipt_designSystemId_fkey" FOREIGN KEY ("designSystemId") REFERENCES "DesignSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPick" ADD CONSTRAINT "DailyPick_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "DesignSystem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auth" ADD CONSTRAINT "Auth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthIdentity" ADD CONSTRAINT "AuthIdentity_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Auth"("id") ON DELETE CASCADE ON UPDATE CASCADE;
