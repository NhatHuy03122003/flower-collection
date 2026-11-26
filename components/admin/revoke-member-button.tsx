"use client";

import { useState, useTransition } from "react";
import { UserMinus } from "lucide-react";

import { revokeUserMemberAction } from "@/app/actions/admin-users";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { AdminUserMemberItem } from "@/lib/admin-users";

export function RevokeMemberButton({
  userId,
  userDisplayName,
  member,
  onSuccess,
}: {
  userId: string;
  userDisplayName: string;
  member: AdminUserMemberItem;
  onSuccess?: (message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setError(null);
    }
  }

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await revokeUserMemberAction(userId, member.id);
      if (result.status === "error") {
        setError(result.message);
        return;
      }

      setOpen(false);
      onSuccess?.(`Đã thu hồi ${member.displayName} khỏi ${userDisplayName}.`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="xs"
            className="text-rose-700 hover:bg-rose-50 hover:text-rose-800"
            aria-label={`Thu hồi ${member.displayName} khỏi ${userDisplayName}`}
          >
            <UserMinus aria-hidden="true" />
            Thu hồi
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thu hồi quyền thành viên?</DialogTitle>
          <DialogDescription>
            Tài khoản <span className="font-semibold">{userDisplayName}</span>{" "}
            sẽ không còn quyền truy cập thành viên{" "}
            <span className="font-semibold">{member.displayName}</span>. Dữ liệu
            hoa và thành viên vẫn được giữ nguyên.
          </DialogDescription>
        </DialogHeader>

        {error ? <p className="text-xs text-rose-700">{error}</p> : null}

        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            disabled={pending}
            onClick={() => setOpen(false)}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            type="button"
            disabled={pending}
            onClick={handleConfirm}
          >
            {pending ? "Đang thu hồi..." : "Thu hồi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
