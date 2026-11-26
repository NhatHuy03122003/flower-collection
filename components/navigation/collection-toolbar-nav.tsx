"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Check,
  Flower,
  Flower2,
  Shield,
  Users,
} from "lucide-react";

import { SupportContactDialog } from "@/components/support/support-contact-dialog";
import type { Role } from "@/lib/user";

type ToolbarItem = {
  label: string;
  icon: typeof Flower2;
  href: string;
};

const GUIDE_ITEM: ToolbarItem = {
  label: "Hướng dẫn",
  icon: BookOpen,
  href: "/guide",
};

const GUEST_ITEMS: ToolbarItem[] = [
  { label: "Danh sách hoa", icon: Flower2, href: "/" },
  { label: "Thành viên", icon: Users, href: "/members" },
  GUIDE_ITEM,
];

const USER_ITEMS: ToolbarItem[] = [
  { label: "Danh sách hoa", icon: Flower2, href: "/" },
  { label: "Tick hoa của tôi", icon: Check, href: "/my-flowers" },
  { label: "Thành viên", icon: Users, href: "/members" },
  GUIDE_ITEM,
];

const ADMIN_ITEMS: ToolbarItem[] = [
  { label: "Danh sách hoa", icon: Flower2, href: "/" },
  { label: "Tick hoa của tôi", icon: Check, href: "/my-flowers" },
  { label: "Quản lý hoa", icon: Flower, href: "/flowers" },
  { label: "Thành viên", icon: Users, href: "/members" },
  { label: "Quản lý tài khoản", icon: Shield, href: "/admin/users" },
  { label: "Thống kê", icon: BarChart3, href: "/admin/stats" },
  GUIDE_ITEM,
];

const activeClassName =
  "inline-flex h-8 items-center gap-1.5 rounded-full border border-rose-600 bg-rose-600 px-3 text-xs font-semibold text-white shadow-sm";
const inactiveClassName =
  "inline-flex h-8 items-center gap-1.5 rounded-full border border-rose-200 bg-white px-3 text-xs font-semibold text-slate-700";

function getItemsForRole(role: Role | null): ToolbarItem[] {
  if (role === "ADMIN") {
    return ADMIN_ITEMS;
  }
  if (role === "USER") {
    return USER_ITEMS;
  }
  return GUEST_ITEMS;
}

export function CollectionToolbarNav({ role }: { role: Role | null }) {
  const pathname = usePathname();
  const items = getItemsForRole(role);

  return (
    <nav
      aria-label="Chức năng bộ sưu tập"
      className="sticky top-14 z-30 border-b border-rose-200/80 bg-[#fffafd]"
    >
      <div className="mx-auto w-full max-w-screen-2xl overflow-x-auto px-3 py-2.5 sm:px-5">
        <ul className="flex w-max items-center gap-2">
          {items.map(({ label, icon: Icon, href }) => {
            const active = pathname === href;
            const className = active ? activeClassName : inactiveClassName;

            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={className}
                >
                  <Icon aria-hidden="true" className="size-3.5" />
                  {label}
                </Link>
              </li>
            );
          })}
          <li>
            <SupportContactDialog triggerClassName={inactiveClassName} />
          </li>
        </ul>
      </div>
    </nav>
  );
}
