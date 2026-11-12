"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { Pencil } from "lucide-react";

import { updateMemberAction } from "@/app/actions/member";
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
import { Input } from "@/components/ui/input";
import type { Member, MemberActionState } from "@/lib/member";

const INITIAL_STATE: MemberActionState = { status: "idle" };

export function EditMemberDialog({
  member,
  className,
}: {
  member: Member;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const handleSuccess = useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={className}
            aria-label={`Sửa ${member.displayName}`}
          >
            <Pencil aria-hidden="true" />
            Sửa
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sửa thành viên</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin của {member.displayName}.
          </DialogDescription>
        </DialogHeader>

        <EditMemberForm member={member} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}

function EditMemberForm({
  member,
  onSuccess,
}: {
  member: Member;
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    updateMemberAction,
    INITIAL_STATE,
  );

  useEffect(() => {
    if (state.status === "success") {
      onSuccess();
    }
  }, [state, onSuccess]);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={member.id} />

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label
            htmlFor="displayName"
            className="text-xs font-medium text-slate-700"
          >
            Tên hiển thị <span className="text-rose-600">*</span>
          </label>
          <Input
            id="displayName"
            name="displayName"
            required
            autoComplete="off"
            defaultValue={member.displayName}
            aria-invalid={state.errors?.displayName ? true : undefined}
          />
          {state.errors?.displayName ? (
            <p className="text-xs text-rose-700">
              {state.errors.displayName}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="gameHandle"
            className="text-xs font-medium text-slate-700"
          >
            Tên trong game
          </label>
          <Input
            id="gameHandle"
            name="gameHandle"
            autoComplete="off"
            defaultValue={member.gameHandle ?? ""}
            aria-invalid={state.errors?.gameHandle ? true : undefined}
          />
          {state.errors?.gameHandle ? (
            <p className="text-xs text-rose-700">{state.errors.gameHandle}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="avatarUrl"
            className="text-xs font-medium text-slate-700"
          >
            Đường dẫn ảnh đại diện
          </label>
          <Input
            id="avatarUrl"
            name="avatarUrl"
            type="url"
            placeholder="https://..."
            autoComplete="off"
            defaultValue={member.avatarUrl ?? ""}
            aria-invalid={state.errors?.avatarUrl ? true : undefined}
          />
          {state.errors?.avatarUrl ? (
            <p className="text-xs text-rose-700">{state.errors.avatarUrl}</p>
          ) : null}
        </div>

        {state.status === "error" && state.errors?.form ? (
          <p className="text-xs text-rose-700">{state.errors.form}</p>
        ) : null}
      </div>

      <DialogFooter className="mt-4">
        <DialogClose render={<Button variant="outline" type="button" />}>
          Hủy
        </DialogClose>
        <Button type="submit" disabled={pending}>
          {pending ? "Đang lưu..." : "Lưu"}
        </Button>
      </DialogFooter>
    </form>
  );
}
