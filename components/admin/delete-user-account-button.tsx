"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

import { deleteUserAccountAction } from "@/app/actions/admin-users";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteUserAccountButton({
  userId,
  displayName,
  username,
  role,
  onSuccess,
}: {
  userId: string;
  displayName: string;
  username: string;
  role: string;
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
      const result = await deleteUserAccountAction(userId);
      if (result.status === "error") {
        setError(result.message);
        return;
      }

      setOpen(false);
      onSuccess?.(`Đã xóa tài khoản ${displayName} (@${username}).`);
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
            aria-label={`Xóa tài khoản ${displayName}`}
          >
            <Trash2 aria-hidden="true" />
            Xóa account
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa tài khoản?</DialogTitle>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Tài khoản <span className="font-semibold">{displayName}</span>{" "}
              sẽ bị xóa vĩnh viễn.
            </p>
            <ul className="list-disc space-y-0.5 pl-5 text-xs">
              <li>Display name: {displayName}</li>
              <li>Username: @{username}</li>
              <li>Role: {role}</li>
            </ul>
            <p className="font-medium text-rose-700">
              Tài khoản sẽ không thể đăng nhập sau khi xóa.
            </p>
            <p>
              Thành viên, bộ sưu tập hoa và quyền của các tài khoản khác vẫn
              được giữ nguyên.
            </p>
          </div>
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
            {pending ? "Đang xóa..." : "Xóa tài khoản"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
