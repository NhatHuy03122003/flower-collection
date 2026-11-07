"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, Flower, Flower2, UserMinus, Users } from "lucide-react";

const toolbarItems = [
  { label: "Danh sách hoa", icon: Flower2, href: "/" },
  { label: "Tick hoa của tôi", icon: Check, href: "/my-flowers" },
  { label: "Quản lý hoa", icon: Flower, href: "/flowers" },
  { label: "Thành viên", icon: Users, href: "/members" },
  { label: "Xóa thành viên", icon: UserMinus, href: null },
] as const;

const activeClassName =
  "inline-flex h-8 items-center gap-1.5 rounded-full border border-rose-600 bg-rose-600 px-3 text-xs font-semibold text-white shadow-sm";
const inactiveClassName =
  "inline-flex h-8 items-center gap-1.5 rounded-full border border-rose-200 bg-white px-3 text-xs font-semibold text-slate-700";

export function CollectionToolbar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Chức năng bộ sưu tập"
      className="border-b border-rose-200/80 bg-[#fffafd]"
    >
      <div className="mx-auto w-full max-w-screen-2xl overflow-x-auto px-3 py-2.5 sm:px-5">
        <ul className="flex w-max items-center gap-2">
          {toolbarItems.map(({ label, icon: Icon, href }) => {
            const active = href !== null && pathname === href;
            const className = active ? activeClassName : inactiveClassName;

            return (
              <li key={label}>
                {href ? (
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={className}
                  >
                    <Icon aria-hidden="true" className="size-3.5" />
                    {label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    aria-disabled={true}
                    className={className}
                  >
                    <Icon aria-hidden="true" className="size-3.5" />
                    {label}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
