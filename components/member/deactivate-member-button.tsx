"use client";

import { useActionState, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import { deactivateMemberAction } from "@/app/actions/member";
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
import type { MemberActionState } from "@/lib/member";

const INITIAL_STATE: MemberActionState = { status: "idle" };

export function DeactivateMemberButton({
  memberId,
  displayName,
  className,
}: {
  memberId: string;
  displayName: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    deactivateMemberAction,
    INITIAL_STATE,
  );

  useEffect(() => {
    if (state.status === "success") {
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="destructive"
            size="sm"
            className={className}
            aria-label={`Xóa ${displayName}`}
          />
        }
      >
        <Trash2 />
        Xóa
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa thành viên?</DialogTitle>
          <DialogDescription>
            {displayName} sẽ bị ẩn khỏi danh sách thành viên. Dữ liệu vẫn được
            giữ lại trong hệ thống.
          </DialogDescription>
        </DialogHeader>

        {state.status === "error" && state.errors?.form ? (
          <p className="text-xs text-rose-700">{state.errors.form}</p>
        ) : null}

        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            disabled={pending}
            onClick={() => setOpen(false)}
          >
            Hủy
          </Button>
          <form action={formAction}>
            <input type="hidden" name="id" value={memberId} />
            <Button variant="destructive" type="submit" disabled={pending}>
              {pending ? "Đang xóa..." : "Xóa"}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
