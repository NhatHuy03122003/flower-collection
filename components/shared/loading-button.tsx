"use client";

import type { ComponentProps, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type LoadingButtonProps = ComponentProps<typeof Button> & {
  /** Nội dung hiển thị khi form đang xử lý. Mặc định giữ nguyên children. */
  pendingLabel?: ReactNode;
};

/**
 * Nút submit dùng chung cho mọi form có loading state.
 * Tự đọc trạng thái pending của form cha qua useFormStatus nên không cần
 * truyền pending thủ công, đồng thời tự chặn double-submit.
 */
export function LoadingButton({
  children,
  pendingLabel,
  disabled,
  ...props
}: LoadingButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      {...props}
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending || undefined}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin" aria-hidden="true" />
          {pendingLabel ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
