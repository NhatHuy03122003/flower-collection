import { Flower2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getDisplayImageUrl, type Flower } from "@/lib/flower";

import { RestoreFlowerButton } from "./restore-flower-button";

export function ArchivedFlowerList({ flowers }: { flowers: Flower[] }) {
  if (flowers.length === 0) {
    return (
      <div className="mx-auto flex min-h-56 max-w-md flex-col items-center justify-center gap-2 px-5 py-12 text-center">
        <Flower2 aria-hidden="true" className="size-8 text-rose-400" />
        <h2 className="text-base font-semibold text-rose-950">
          Không có hoa nào đã ẩn
        </h2>
        <p className="text-sm text-rose-900/65">
          Hoa bị xóa sẽ xuất hiện ở đây để có thể khôi phục.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 min-[520px]:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
      {flowers.map((flower) => (
        <li key={flower.id} className="h-full">
          <Card className="h-full gap-0 rounded-lg border border-border bg-white p-0 shadow-sm ring-0 transition-shadow hover:shadow-md">
            <div className="aspect-[4/3] overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getDisplayImageUrl(flower.imageUrl)}
                alt={flower.name}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="size-full object-cover"
              />
            </div>

            <CardContent className="flex flex-1 flex-col gap-3 p-4">
              <div className="space-y-2">
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                  {flower.name}
                </h3>
                <Badge
                  variant="secondary"
                  className="rounded-md px-2 text-xs font-medium"
                >
                  {flower.color?.trim() || "Chưa phân loại"}
                </Badge>
              </div>

              <div className="mt-auto">
                <RestoreFlowerButton flowerId={flower.id} name={flower.name} />
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
