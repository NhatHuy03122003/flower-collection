"use client";

import { SearchX } from "lucide-react";
import { Fragment, type ReactNode } from "react";

import { SectionTitle } from "@/components/shared/section-title";
import { useSearchQuery } from "@/components/shared/search";
import { matchesSearchText } from "@/lib/search";

export type FlowerCollectionSection = {
  color: string;
  items: {
    id: string;
    /** Giá trị dùng để so khớp từ khoá (tên, màu, mô tả). */
    searchText: (string | null | undefined)[];
    /** Card đã render sẵn ở server để không kéo code server vào client. */
    content: ReactNode;
  }[];
};

/**
 * Hiển thị danh sách hoa nhóm theo màu và lọc phía client theo từ khoá
 * trong SearchProvider. Section không còn kết quả sẽ được ẩn.
 */
export function FlowerCollectionList({
  sections,
}: {
  sections: FlowerCollectionSection[];
}) {
  const { query } = useSearchQuery();

  const filteredSections = sections
    .map((section) => ({
      color: section.color,
      items: section.items.filter((item) =>
        matchesSearchText(query, item.searchText),
      ),
    }))
    .filter((section) => section.items.length > 0);

  if (filteredSections.length === 0) {
    return (
      <div className="mx-auto flex min-h-56 max-w-md flex-col items-center justify-center gap-2 px-5 py-12 text-center">
        <SearchX aria-hidden="true" className="size-8 text-rose-400" />
        <h2 className="text-base font-semibold text-rose-950">
          Không tìm thấy hoa phù hợp
        </h2>
        <p className="text-sm text-rose-900/65">
          Thử từ khoá khác hoặc xoá ô tìm kiếm để xem toàn bộ danh sách.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {filteredSections.map((section) => (
        <section
          key={section.color}
          aria-labelledby={`flower-section-${section.color}`}
        >
          <div id={`flower-section-${section.color}`}>
            <SectionTitle title={section.color} count={section.items.length} />
          </div>
          <div className="grid grid-cols-2 gap-3 min-[520px]:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
            {section.items.map((item) => (
              <Fragment key={item.id}>{item.content}</Fragment>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
