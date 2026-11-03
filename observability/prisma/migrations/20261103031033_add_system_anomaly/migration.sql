-- CreateTable
CREATE TABLE "SystemAnomaly" (
    "id" BIGSERIAL NOT NULL,
    "systemMetricId" INTEGER NOT NULL,
    "isAnomaly" BOOLEAN NOT NULL,
    "anomalyScore" DOUBLE PRECISION NOT NULL,
    "modelVersion" VARCHAR(32) NOT NULL,
    "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemAnomaly_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemAnomaly_systemMetricId_key" ON "SystemAnomaly"("systemMetricId");

-- CreateIndex
CREATE INDEX "SystemAnomaly_evaluatedAt_idx" ON "SystemAnomaly"("evaluatedAt" DESC);

-- AddForeignKey
ALTER TABLE "SystemAnomaly" ADD CONSTRAINT "SystemAnomaly_systemMetricId_fkey" FOREIGN KEY ("systemMetricId") REFERENCES "SystemMetric"("id") ON DELETE CASCADE ON UPDATE CASCADE;
