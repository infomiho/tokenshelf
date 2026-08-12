-- AlterTable
ALTER TABLE "DesignSystem" ADD COLUMN     "cardImageFormat" TEXT,
ADD COLUMN     "cardImageGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "cardImageHeight" INTEGER,
ADD COLUMN     "cardImageKey" TEXT,
ADD COLUMN     "cardImageRenderVersion" TEXT,
ADD COLUMN     "cardImageRevision" INTEGER,
ADD COLUMN     "cardImageWidth" INTEGER;
