import { cn } from "cn";

import type { FlowerOwnerListItem } from "@/lib/flower-owner";
import type { getFlowers } from "@/lib/flower";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { FlowerOwnerList } from "./flower-owner-list";
import { FlowerOwnerToggle } from "./flower-owner-toggle";

export type Flower = Awaited<ReturnType<typeof getFlowers>>[number];

const colorBadgeColors: Record<string, string> = {
  đỏ: "bg-rose-100 text-rose-800",
  cam: "bg-amber-100 text-amber-900",
  vàng: "bg-yellow-100 text-yellow-900",
  tím: "bg-violet-100 text-violet-800",
  xanh: "bg-sky-100 text-sky-800",
};

function getColorBadgeColor(color: string | null) {
  const colorKey = Object.keys(colorBadgeColors).find((key) =>
    color?.toLocaleLowerCase("vi").includes(key),
  );

  return colorKey ? colorBadgeColors[colorKey] : "bg-rose-100 text-rose-800";
}

export function FlowerCard({
  flower,
  ownerCount,
  owners,
  isOwnedByCurrentMember,
  hasCurrentMember,
  readOnly = false,
}: {
  flower: Flower;
  ownerCount: number;
  owners: FlowerOwnerListItem[];
  isOwnedByCurrentMember: boolean;
  hasCurrentMember: boolean;
  readOnly?: boolean;
}) {
  return (
    <Card className="h-full gap-0 rounded-lg border border-border bg-white p-0 shadow-sm ring-0 transition-shadow hover:shadow-md">
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={flower.imageUrl}
          alt={flower.name}
          loading="lazy"
          className="size-full object-cover"
        />
      </div>

      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
            {flower.name}
          </h3>

          <p className="break-words text-xs leading-relaxed text-muted-foreground">
            {flower.description?.trim() || "Chưa có mô tả"}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <Badge
            className={cn(
              "rounded-md px-2 text-xs font-medium",
              getColorBadgeColor(flower.color),
            )}
          >
            {flower.category?.trim() || "Chưa phân loại"}
          </Badge>

          <FlowerOwnerToggle
            flowerId={flower.id}
            isOwned={isOwnedByCurrentMember}
            disabled={readOnly || !hasCurrentMember}
          />
        </div>

        <FlowerOwnerList ownerCount={ownerCount} owners={owners} />
      </CardContent>
    </Card>
  );
}
