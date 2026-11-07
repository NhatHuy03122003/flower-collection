"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { UserPlus } from "lucide-react";

import { createMemberAction } from "@/app/actions/member";
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
import type { MemberActionState } from "@/lib/member";

const INITIAL_STATE: MemberActionState = { status: "idle" };

export function AddMemberDialog() {
  const [open, setOpen] = useState(false);
  const handleSuccess = useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <UserPlus aria-hidden="true" />
        Thêm thành viên
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm thành viên</DialogTitle>
          <DialogDescription>
            Tạo một thành viên mới cho bộ sưu tập.
          </DialogDescription>
        </DialogHeader>

        <AddMemberForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}

function AddMemberForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction, pending] = useActionState(
    createMemberAction,
    INITIAL_STATE,
  );

  useEffect(() => {
    if (state.status === "success") {
      onSuccess();
    }
  }, [state, onSuccess]);

  return (
    <form action={formAction}>
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
