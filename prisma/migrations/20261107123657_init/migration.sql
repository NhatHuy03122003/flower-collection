-- CreateTable
CREATE TABLE "Flower" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "description" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Flower_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Flower_name_idx" ON "Flower"("name");

-- CreateIndex
CREATE INDEX "Flower_category_idx" ON "Flower"("category");

-- CreateIndex
CREATE INDEX "Flower_createdAt_idx" ON "Flower"("createdAt");
