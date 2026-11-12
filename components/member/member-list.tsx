import { SearchX, Users } from "lucide-react";

import { SearchableList } from "@/components/shared/searchable-list";
import type { MemberOwnershipSummary } from "@/lib/flower-owner";
import type { Member } from "@/lib/member";

import { MemberRow } from "./member-row";

const EMPTY_SUMMARY: MemberOwnershipSummary = {
  ownedCount: 0,
  totalCount: 0,
  completionPercentage: 0,
};

export function MemberList({
  members,
  summaries,
}: {
  members: Member[];
  summaries: Map<string, MemberOwnershipSummary>;
}) {
  if (members.length === 0) {
    return (
      <div className="mx-auto flex min-h-56 max-w-md flex-col items-center justify-center gap-2 px-5 py-12 text-center">
        <Users aria-hidden="true" className="size-8 text-rose-400" />
        <h2 className="text-base font-semibold text-rose-950">
          Chưa có thành viên nào
        </h2>
        <p className="text-sm text-rose-900/65">
          Thêm thành viên đầu tiên để bắt đầu quản lý bộ sưu tập.
        </p>
      </div>
    );
  }

  return (
    <SearchableList
      listClassName="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      emptyState={
        <div className="mx-auto flex min-h-56 max-w-md flex-col items-center justify-center gap-2 px-5 py-12 text-center">
          <SearchX aria-hidden="true" className="size-8 text-rose-400" />
          <h2 className="text-base font-semibold text-rose-950">
            Không tìm thấy thành viên phù hợp
          </h2>
          <p className="text-sm text-rose-900/65">
            Thử từ khoá khác hoặc xoá ô tìm kiếm để xem toàn bộ danh sách.
          </p>
        </div>
      }
      items={members.map((member) => ({
        id: member.id,
        searchText: [member.displayName, member.gameHandle],
        content: (
          <MemberRow
            member={member}
            summary={summaries.get(member.id) ?? EMPTY_SUMMARY}
          />
        ),
      }))}
    />
  );
}
