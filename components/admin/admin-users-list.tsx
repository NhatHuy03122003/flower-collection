"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, SearchX, Shield, User as UserIcon, Users } from "lucide-react";

import { SearchableList } from "@/components/shared/searchable-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { AdminUserListItem } from "@/lib/admin-users";
import type { Member } from "@/lib/member";

import { AssignMemberDialog } from "./assign-member-dialog";
import { DeleteUserAccountButton } from "./delete-user-account-button";
import { RevokeMemberButton } from "./revoke-member-button";

function formatCreatedAt(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function AdminUsersList({
  users,
  activeMembers,
}: {
  users: AdminUserListItem[];
  activeMembers: Member[];
}) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleSuccess(message: string) {
    setFeedback(message);
    router.refresh();
  }

  if (users.length === 0) {
    return (
      <div className="mx-auto flex min-h-56 max-w-md flex-col items-center justify-center gap-2 px-5 py-12 text-center">
        <Users aria-hidden="true" className="size-8 text-rose-400" />
        <h2 className="text-base font-semibold text-rose-950">
          Chưa có tài khoản nào
        </h2>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedback ? (
        <div
          role="status"
          className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-800"
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 aria-hidden="true" className="size-4 shrink-0" />
            {feedback}
          </span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-emerald-700 underline-offset-2 hover:underline"
          >
            Đóng
          </button>
        </div>
      ) : null}

      <SearchableList
        listClassName="grid grid-cols-1 gap-4 lg:grid-cols-2"
        emptyState={
          <div className="mx-auto flex min-h-56 max-w-md flex-col items-center justify-center gap-2 px-5 py-12 text-center">
            <SearchX aria-hidden="true" className="size-8 text-rose-400" />
            <h2 className="text-base font-semibold text-rose-950">
              Không tìm thấy tài khoản phù hợp
            </h2>
            <p className="text-sm text-rose-900/65">
              Thử từ khóa khác hoặc xóa ô tìm kiếm để xem toàn bộ danh sách.
            </p>
          </div>
        }
        items={users.map((user) => {
          const assignedIds = new Set(user.members.map((member) => member.id));
          const availableMembers = activeMembers
            .filter((member) => !assignedIds.has(member.id))
            .map((member) => ({
              id: member.id,
              displayName: member.displayName,
            }));

          return {
            id: user.id,
            searchText: [
              user.username,
              user.displayName,
              user.role,
              ...user.members.map((member) => member.displayName),
            ],
            content: (
              <li className="h-full">
                <Card className="h-full gap-0 rounded-xl border border-rose-200/80 bg-white p-0 shadow-sm ring-0">
                  <CardContent className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-base font-semibold text-slate-900">
                            {user.displayName}
                          </h3>
                          {user.role === "ADMIN" ? (
                            <Badge className="rounded-md bg-rose-600 px-2 text-xs font-semibold text-white">
                              <Shield aria-hidden="true" />
                              ADMIN
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="rounded-md bg-rose-100 px-2 text-xs font-medium text-rose-900"
                            >
                              <UserIcon aria-hidden="true" />
                              USER
                            </Badge>
                          )}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          @{user.username} · Tạo ngày{" "}
                          {formatCreatedAt(user.createdAt)}
                        </p>
                      </div>

                      {user.role === "USER" ? (
                        <div className="flex items-center gap-2">
                          <DeleteUserAccountButton
                            userId={user.id}
                            displayName={user.displayName}
                            username={user.username}
                            role={user.role}
                            onSuccess={handleSuccess}
                          />
                          <AssignMemberDialog
                            userId={user.id}
                            userDisplayName={user.displayName}
                            availableMembers={availableMembers}
                            onSuccess={handleSuccess}
                          />
                        </div>
                      ) : null}
                    </div>

                    {user.role === "ADMIN" ? (
                      <div className="mt-auto rounded-lg border border-rose-100 bg-rose-50/50 px-3 py-2.5 text-xs text-rose-900/75">
                        Quản trị viên có toàn quyền truy cập tất cả thành viên
                        trong hệ thống (không cần gán thủ công).
                      </div>
                    ) : (
                      <div className="space-y-2 border-t border-rose-100 pt-3">
                        <p className="text-xs font-medium text-slate-700">
                          Thành viên được gán ({user.members.length})
                        </p>

                        {user.members.length === 0 ? (
                          <p className="rounded-lg border border-dashed border-rose-200 px-3 py-2.5 text-xs text-muted-foreground">
                            Chưa được gán thành viên nào.
                          </p>
                        ) : (
                          <ul className="space-y-1.5">
                            {user.members.map((member) => (
                              <li
                                key={member.id}
                                className="flex items-center justify-between gap-2 rounded-lg border border-rose-100 bg-rose-50/40 px-3 py-1.5 text-xs"
                              >
                                <div className="flex min-w-0 items-center gap-2">
                                  <span className="truncate font-medium text-slate-800">
                                    {member.displayName}
                                  </span>
                                  {member.isActive ? (
                                    <Badge
                                      variant="secondary"
                                      className="rounded bg-emerald-100 px-1.5 text-[11px] font-medium text-emerald-800"
                                    >
                                      Hoạt động
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="secondary"
                                      className="rounded bg-slate-200 px-1.5 text-[11px] font-medium text-slate-700"
                                    >
                                      Đã ẩn
                                    </Badge>
                                  )}
                                </div>

                                <RevokeMemberButton
                                  userId={user.id}
                                  userDisplayName={user.displayName}
                                  member={member}
                                  onSuccess={handleSuccess}
                                />
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </li>
            ),
          };
        })}
      />
    </div>
  );
}
