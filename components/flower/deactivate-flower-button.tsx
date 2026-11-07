"use client";

import { useActionState, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import { deactivateFlowerAction } from "@/app/actions/flower";
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
import type { FlowerActionState } from "@/lib/flower";

const INITIAL_STATE: FlowerActionState = { status: "idle" };

export function DeactivateFlowerButton({
  flowerId,
  name,
}: {
  flowerId: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    deactivateFlowerAction,
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
          <Button variant="ghost" size="icon-sm" aria-label={`Xóa ${name}`} />
        }
      >
        <Trash2 />
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa hoa?</DialogTitle>
          <DialogDescription>
            {name} sẽ bị ẩn khỏi bộ sưu tập. Dữ liệu vẫn được giữ lại trong hệ
            thống.
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
            <input type="hidden" name="id" value={flowerId} />
            <Button variant="destructive" type="submit" disabled={pending}>
              {pending ? "Đang xóa..." : "Xóa"}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
