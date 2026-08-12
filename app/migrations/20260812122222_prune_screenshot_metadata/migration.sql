/*
  Warnings:

  - You are about to drop the column `cardImageFormat` on the `DesignSystem` table. All the data in the column will be lost.
  - You are about to drop the column `cardImageGeneratedAt` on the `DesignSystem` table. All the data in the column will be lost.
  - You are about to drop the column `cardImageHeight` on the `DesignSystem` table. All the data in the column will be lost.
  - You are about to drop the column `cardImageRevision` on the `DesignSystem` table. All the data in the column will be lost.
  - You are about to drop the column `cardImageWidth` on the `DesignSystem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DesignSystem" DROP COLUMN "cardImageFormat",
DROP COLUMN "cardImageGeneratedAt",
DROP COLUMN "cardImageHeight",
DROP COLUMN "cardImageRevision",
DROP COLUMN "cardImageWidth";
