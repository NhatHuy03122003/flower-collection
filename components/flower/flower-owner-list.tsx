import Link from "next/link";

import type { FlowerOwnerListItem } from "@/lib/flower-owner";

export function FlowerOwnerList({
  ownerCount,
  owners,
}: {
  ownerCount: number;
  owners: FlowerOwnerListItem[];
}) {
  if (ownerCount === 0 || owners.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">👤 Chưa có ai sở hữu</p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
      <span>👤</span>

      {owners.map((owner, index) => (
        <span key={owner.id} className="inline-flex items-center">
          <Link
            href={`/members/${owner.id}`}
            className="underline-offset-2 hover:underline"
          >
            {owner.displayName}
          </Link>

          {index < owners.length - 1 && ","}
        </span>
      ))}
    </div>
  );
}
