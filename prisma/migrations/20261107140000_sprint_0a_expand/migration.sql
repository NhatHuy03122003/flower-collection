-- Sprint 0A: Database Expand (EXPAND ONLY)
-- Nguyên tắc: chỉ THÊM (bảng/cột/index/FK/unique). KHÔNG drop cột, KHÔNG xoá dữ liệu,
-- KHÔNG xoá index/constraint cũ. price / stock / category được giữ nguyên
-- (sẽ drop ở Sprint 1.5 sau khi code đã migrate).

-- 1. Thêm cột mới vào Flower (đều nullable hoặc có default -> không cần backfill,
--    không lock lâu, không ảnh hưởng dữ liệu hiện có)
ALTER TABLE "Flower" ADD COLUMN "color"      TEXT;
ALTER TABLE "Flower" ADD COLUMN "gameItemId" TEXT;
ALTER TABLE "Flower" ADD COLUMN "rarity"     TEXT;
ALTER TABLE "Flower" ADD COLUMN "sortOrder"  INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Flower" ADD COLUMN "isActive"   BOOLEAN NOT NULL DEFAULT true;

-- 2. Index mới trên Flower
CREATE INDEX "Flower_isActive_sortOrder_idx" ON "Flower"("isActive", "sortOrder");

-- 3. Bảng mới: Member
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "gameHandle" TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Member_displayName_idx" ON "Member"("displayName");

-- 4. Bảng mới: FlowerOwner (bảng nối Flower <-> Member)
CREATE TABLE "FlowerOwner" (
    "id" TEXT NOT NULL,
    "flowerId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "ownedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlowerOwner_pkey" PRIMARY KEY ("id")
);

-- 5. Index + unique constraint mới trên FlowerOwner
CREATE INDEX "FlowerOwner_memberId_idx" ON "FlowerOwner"("memberId");
CREATE UNIQUE INDEX "FlowerOwner_flowerId_memberId_key" ON "FlowerOwner"("flowerId", "memberId");

-- 6. Foreign keys (ON DELETE CASCADE theo xác nhận)
ALTER TABLE "FlowerOwner"
    ADD CONSTRAINT "FlowerOwner_flowerId_fkey"
    FOREIGN KEY ("flowerId") REFERENCES "Flower"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FlowerOwner"
    ADD CONSTRAINT "FlowerOwner_memberId_fkey"
    FOREIGN KEY ("memberId") REFERENCES "Member"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
