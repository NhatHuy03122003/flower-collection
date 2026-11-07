import Link from "next/link";

import type { FlowerOwnerListItem } from "@/lib/flower-owner";

export function FlowerOwnerList({
  ownerCount,
  owners,
}: {
  ownerCount: number;
  owners: FlowerOwnerListItem[];
}) {
  const firstOwner = owners[0];

  if (ownerCount === 0 || !firstOwner) {
    return (
      <p className="truncate text-xs text-muted-foreground">
        👤 Chưa có ai sở hữu
      </p>
    );
  }

  return (
    <p className="truncate text-xs text-muted-foreground">
      👤{" "}
      <Link
        href={`/members/${firstOwner.id}`}
        className="underline-offset-2 hover:underline"
      >
        {firstOwner.displayName}
      </Link>
      {ownerCount > 1 ? ` +${ownerCount - 1}` : null}
    </p>
  );
}
