-- CreateTable
CREATE TABLE "SuspiciousAttempt" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuspiciousAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SuspiciousAttempt_userId_idx" ON "SuspiciousAttempt"("userId");

-- CreateIndex
CREATE INDEX "SuspiciousAttempt_createdAt_idx" ON "SuspiciousAttempt"("createdAt");

-- AddForeignKey
ALTER TABLE "SuspiciousAttempt" ADD CONSTRAINT "SuspiciousAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
