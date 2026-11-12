"use client";

import { Fragment, type ReactNode } from "react";

import { useSearchQuery } from "@/components/shared/search";
import { matchesSearchText } from "@/lib/search";

export type SearchableListItem = {
  id: string;
  /** Các giá trị dùng để so khớp với từ khoá (đã bỏ dấu, không phân biệt hoa/thường). */
  searchText: (string | null | undefined)[];
  /** Nội dung đã render sẵn ở server để không kéo code server vào client. */
  content: ReactNode;
};

/**
 * Lọc danh sách phía client theo từ khoá trong SearchProvider.
 * Nội dung từng item được render ở server và truyền vào qua prop.
 */
export function SearchableList({
  items,
  listClassName,
  emptyState,
}: {
  items: SearchableListItem[];
  listClassName?: string;
  emptyState: ReactNode;
}) {
  const { query } = useSearchQuery();

  const filteredItems = items.filter((item) =>
    matchesSearchText(query, item.searchText),
  );

  if (filteredItems.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <ul className={listClassName}>
      {filteredItems.map((item) => (
        <Fragment key={item.id}>{item.content}</Fragment>
      ))}
    </ul>
  );
}
