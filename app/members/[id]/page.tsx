import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Flower2 } from "lucide-react";

import { FlowerSection } from "@/components/flower/flower-section";
import { CollectionSummary } from "@/components/member/collection-summary";
import { MemberOverview } from "@/components/member/member-overview";
import { CollectionHeader } from "@/components/navigation/collection-header";
import { CollectionToolbar } from "@/components/navigation/collection-toolbar";
import { getCurrentUser } from "@/lib/current-user";
import {
  getMemberOwnershipSummary,
  getOwnedFlowerCollection,
  groupCollectionByColor,
} from "@/lib/flower-owner";
import { getMemberById } from "@/lib/member";

export default async function MemberDetailPage(
  props: PageProps<"/members/[id]">,
) {
  const { id } = await props.params;
  const user = await getCurrentUser();

  // Guest không xem được chi tiết thành viên; kiểm tra trước khi stream nội dung.
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f6d8e1] font-sans text-slate-800">
      <CollectionHeader />
      <Suspense fallback={null}>
        <CollectionToolbar />
      </Suspense>

      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-3 py-4 sm:px-5 sm:py-5">
        <Suspense fallback={<MemberDetailLoading />}>
          <MemberDashboard id={id} isAdmin={user.role === "ADMIN"} />
        </Suspense>
      </main>
    </div>
  );
}

async function MemberDashboard({
  id,
  isAdmin,
}: {
  id: string;
  isAdmin: boolean;
}) {
  const member = await getMemberById(id);

  // Member đã ẩn chỉ ADMIN được xem; kiểm tra trước khi truy vấn dữ liệu riêng tư.
  if (!member || (!member.isActive && !isAdmin)) {
    notFound();
  }

  const [summary, ownedItems] = await Promise.all([
    getMemberOwnershipSummary(member.id),
    getOwnedFlowerCollection(member.id),
  ]);

  const sections = groupCollectionByColor(ownedItems);

  return (
    <div className="space-y-5 sm:space-y-6">
      <Link
        href="/members"
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-rose-200 bg-white px-3 text-xs font-semibold text-slate-700"
      >
        <ArrowLeft aria-hidden="true" className="size-3.5" />
        Thành viên
      </Link>

      <MemberOverview member={member} summary={summary} />

      <CollectionSummary summary={summary} />

      {ownedItems.length === 0 ? (
        <div className="mx-auto flex min-h-56 max-w-md flex-col items-center justify-center gap-2 px-5 py-12 text-center">
          <Flower2 aria-hidden="true" className="size-8 text-rose-400" />
          <h2 className="text-base font-semibold text-rose-950">
            Chưa sở hữu hoa nào
          </h2>
          <p className="text-sm text-rose-900/65">
            {member.displayName} chưa tick hoa nào trong bộ sưu tập.
          </p>
        </div>
      ) : (
        <div className="space-y-5 sm:space-y-6">
          {sections.map(([color, colorItems]) => (
            <FlowerSection
              key={color}
              color={color}
              items={colorItems}
              hasCurrentMember={false}
              readOnly
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MemberDetailLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-28 animate-pulse rounded-full bg-rose-100" />
      <div className="h-24 animate-pulse rounded-2xl bg-white" />
      <div className="grid grid-cols-2 gap-3 min-[520px]:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-lg border border-border bg-white shadow-sm"
          >
            <div className="aspect-[4/3] animate-pulse bg-rose-100" />
            <div className="space-y-3 p-4">
              <div className="h-3.5 w-3/4 animate-pulse rounded bg-rose-100" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-rose-50" />
              <div className="h-5 w-24 animate-pulse rounded-md bg-rose-50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
