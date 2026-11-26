"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";

import { assignUserMemberAction } from "@/app/actions/admin-users";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type AssignableMember = {
  id: string;
  displayName: string;
};

export function AssignMemberDialog({
  userId,
  userDisplayName,
  availableMembers,
  onSuccess,
}: {
  userId: string;
  userDisplayName: string;
  availableMembers: AssignableMember[];
  onSuccess?: (message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setSelectedMemberId(availableMembers[0]?.id ?? "");
      setError(null);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedMemberId) {
      setError("Vui lòng chọn thành viên.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await assignUserMemberAction(userId, selectedMemberId);
      if (result.status === "error") {
        setError(result.message);
        return;
      }

      const assignedName =
        availableMembers.find((m) => m.id === selectedMemberId)?.displayName ??
        "thành viên";
      setOpen(false);
      onSuccess?.(`Đã gán ${assignedName} cho ${userDisplayName}.`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            size="sm"
            variant="outline"
            disabled={availableMembers.length === 0}
          >
            <UserPlus aria-hidden="true" />
            Gán thành viên
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gán thành viên cho {userDisplayName}</DialogTitle>
          <DialogDescription>
            Chọn một thành viên đang hoạt động để cấp quyền truy cập cho tài
            khoản này.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor={`assign-member-${userId}`}
              className="text-xs font-medium text-slate-700"
            >
              Thành viên <span className="text-rose-600">*</span>
            </label>
            <select
              id={`assign-member-${userId}`}
              value={selectedMemberId}
              disabled={pending}
              onChange={(event) => setSelectedMemberId(event.target.value)}
              className="h-9 w-full rounded-lg border border-rose-200 bg-white px-3 text-sm text-slate-800 outline-none transition-colors focus-visible:border-rose-400 disabled:opacity-60"
            >
              {availableMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.displayName}
                </option>
              ))}
            </select>
          </div>

          {error ? <p className="text-xs text-rose-700">{error}</p> : null}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Hủy
            </DialogClose>
            <Button type="submit" disabled={pending || !selectedMemberId}>
              {pending ? "Đang gán..." : "Xác nhận gán"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
