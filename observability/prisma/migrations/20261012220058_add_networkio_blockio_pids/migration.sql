/*
  Warnings:

  - Added the required column `blockIoReadBytes` to the `ContainerMetric` table without a default value. This is not possible if the table is not empty.
  - Added the required column `blockIoWriteBytes` to the `ContainerMetric` table without a default value. This is not possible if the table is not empty.
  - Added the required column `networkRxBytes` to the `ContainerMetric` table without a default value. This is not possible if the table is not empty.
  - Added the required column `networkTxBytes` to the `ContainerMetric` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pidsCurrent` to the `ContainerMetric` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pidsLimit` to the `ContainerMetric` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ContainerMetric" ADD COLUMN     "blockIoReadBytes" DOUBLE PRECISION,
ADD COLUMN     "blockIoWriteBytes" DOUBLE PRECISION,
ADD COLUMN     "networkRxBytes" DOUBLE PRECISION,
ADD COLUMN     "networkTxBytes" DOUBLE PRECISION,
ADD COLUMN     "pidsCurrent" INTEGER,
ADD COLUMN     "pidsLimit" INTEGER;
