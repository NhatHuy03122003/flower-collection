"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Switch } from "@/components/ui/switch";

export function FlowerStatusSwitch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const showHidden = searchParams.get("status") === "all";

  function handleCheckedChange(checked: boolean) {
    const params = new URLSearchParams(searchParams);

    if (checked) {
      params.set("status", "all");
    } else {
      params.delete("status");
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <label className="flex cursor-pointer items-center gap-2">
      <Switch
        checked={showHidden}
        onCheckedChange={handleCheckedChange}
        aria-label="Hiện hoa đã ẩn"
      />
      <span className="text-xs font-medium text-rose-800/65">Hiện hoa đã ẩn</span>
    </label>
  );
}
