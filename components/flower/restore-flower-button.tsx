"use client";

import { useActionState, useEffect, useState } from "react";
import { ArchiveRestore } from "lucide-react";

import { restoreFlowerAction } from "@/app/actions/flower";
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

export function RestoreFlowerButton({
  flowerId,
  name,
}: {
  flowerId: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    restoreFlowerAction,
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
        render={<Button variant="outline" size="sm" className="w-full" />}
      >
        <ArchiveRestore />
        Khôi phục
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Khôi phục hoa?</DialogTitle>
          <DialogDescription>
            {name} sẽ hiển thị lại trong bộ sưu tập.
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
            <Button type="submit" disabled={pending}>
              {pending ? "Đang khôi phục..." : "Khôi phục"}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
