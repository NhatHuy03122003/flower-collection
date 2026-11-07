"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { createFlowerAction } from "@/app/actions/flower";
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
import type { FlowerActionState } from "@/lib/flower";

const INITIAL_STATE: FlowerActionState = { status: "idle" };

export function AddFlowerDialog() {
  const [open, setOpen] = useState(false);
  const handleSuccess = useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus aria-hidden="true" />
        Thêm hoa
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm hoa</DialogTitle>
          <DialogDescription>
            Tạo một hoa mới cho bộ sưu tập.
          </DialogDescription>
        </DialogHeader>

        <AddFlowerForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}

function AddFlowerForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction, pending] = useActionState(
    createFlowerAction,
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
          <label htmlFor="name" className="text-xs font-medium text-slate-700">
            Tên hoa <span className="text-rose-600">*</span>
          </label>
          <Input
            id="name"
            name="name"
            required
            autoComplete="off"
            aria-invalid={state.errors?.name ? true : undefined}
          />
          {state.errors?.name ? (
            <p className="text-xs text-rose-700">{state.errors.name}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="imageUrl"
            className="text-xs font-medium text-slate-700"
          >
            Đường dẫn ảnh <span className="text-rose-600">*</span>
          </label>
          <Input
            id="imageUrl"
            name="imageUrl"
            type="url"
            placeholder="https://..."
            autoComplete="off"
            aria-invalid={state.errors?.imageUrl ? true : undefined}
          />
          {state.errors?.imageUrl ? (
            <p className="text-xs text-rose-700">{state.errors.imageUrl}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="color" className="text-xs font-medium text-slate-700">
            Màu
          </label>
          <Input
            id="color"
            name="color"
            autoComplete="off"
            aria-invalid={state.errors?.color ? true : undefined}
          />
          {state.errors?.color ? (
            <p className="text-xs text-rose-700">{state.errors.color}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="description"
            className="text-xs font-medium text-slate-700"
          >
            Mô tả
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            autoComplete="off"
            aria-invalid={state.errors?.description ? true : undefined}
            className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30"
          />
          {state.errors?.description ? (
            <p className="text-xs text-rose-700">{state.errors.description}</p>
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
