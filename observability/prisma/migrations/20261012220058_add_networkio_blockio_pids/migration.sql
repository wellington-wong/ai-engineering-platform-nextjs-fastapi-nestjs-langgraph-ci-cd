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
ALTER TABLE "ContainerMetric" ADD COLUMN     "blockIoReadBytes" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "blockIoWriteBytes" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "networkRxBytes" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "networkTxBytes" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "pidsCurrent" INTEGER NOT NULL,
ADD COLUMN     "pidsLimit" INTEGER NOT NULL;
