import { Flower2 } from "lucide-react";

export function EmptyState() {
  return (
    <div className="mx-auto flex min-h-56 max-w-md flex-col items-center justify-center gap-2 px-5 py-12 text-center">
      <Flower2 aria-hidden="true" className="size-8 text-rose-400" />
      <h2 className="text-base font-semibold text-rose-950">
        Chưa có hoa trong bộ sưu tập
      </h2>
      <p className="text-sm text-rose-900/65">
        Danh sách hoa sẽ xuất hiện tại đây khi có dữ liệu.
      </p>
    </div>
  );
}
