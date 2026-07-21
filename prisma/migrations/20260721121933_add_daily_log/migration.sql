-- AlterTable
ALTER TABLE "CashTransaction" ADD COLUMN     "amountAriary" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "DailyLog" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "flockId" TEXT NOT NULL,
    "weather" TEXT,
    "notes" TEXT,
    "eggLogId" TEXT,
    "mortalityLogId" TEXT,
    "usageId" TEXT,
    "healthRecordId" TEXT,
    "cashTxnId" TEXT,
    "recordedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyLog_eggLogId_key" ON "DailyLog"("eggLogId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyLog_mortalityLogId_key" ON "DailyLog"("mortalityLogId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyLog_usageId_key" ON "DailyLog"("usageId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyLog_healthRecordId_key" ON "DailyLog"("healthRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyLog_cashTxnId_key" ON "DailyLog"("cashTxnId");

-- CreateIndex
CREATE INDEX "DailyLog_date_idx" ON "DailyLog"("date");

-- CreateIndex
CREATE INDEX "DailyLog_flockId_idx" ON "DailyLog"("flockId");

-- AddForeignKey
ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_flockId_fkey" FOREIGN KEY ("flockId") REFERENCES "Flock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_eggLogId_fkey" FOREIGN KEY ("eggLogId") REFERENCES "EggLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_mortalityLogId_fkey" FOREIGN KEY ("mortalityLogId") REFERENCES "MortalityLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_usageId_fkey" FOREIGN KEY ("usageId") REFERENCES "Usage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_healthRecordId_fkey" FOREIGN KEY ("healthRecordId") REFERENCES "HealthRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_cashTxnId_fkey" FOREIGN KEY ("cashTxnId") REFERENCES "CashTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
