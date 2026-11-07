import { Suspense } from "react";

import { AddMemberDialog } from "@/components/member/add-member-dialog";
import { MemberList } from "@/components/member/member-list";
import { CollectionHeader } from "@/components/navigation/collection-header";
import { CollectionToolbar } from "@/components/navigation/collection-toolbar";
import { getMemberOwnershipSummaries } from "@/lib/flower-owner";
import { getMembers } from "@/lib/member";

export const metadata = {
  title: "Thành viên — Hội ROSE Flower Collection",
};

export default function MembersPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6d8e1] font-sans text-slate-800">
      <CollectionHeader />
      <Suspense fallback={null}>
        <CollectionToolbar />
      </Suspense>

      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-3 py-4 sm:px-5 sm:py-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold tracking-tight text-rose-950 sm:text-lg">
            Thành viên
          </h2>
          <AddMemberDialog />
        </div>

        <Suspense fallback={<MembersLoading />}>
          <MembersContent />
        </Suspense>
      </main>
    </div>
  );
}

async function MembersContent() {
  const members = await getMembers();
  const summaries = await getMemberOwnershipSummaries(
    members.map((member) => member.id),
  );

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-rose-800/65">
        {members.length} thành viên
      </p>
      <MemberList members={members} summaries={summaries} />
    </div>
  );
}

function MembersLoading() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="flex flex-col items-center gap-3 rounded-xl border border-rose-200/70 bg-card p-4 shadow-sm"
        >
          <div className="size-20 animate-pulse rounded-full bg-rose-100" />
          <div className="h-5 w-32 animate-pulse rounded bg-rose-100" />
          <div className="h-3 w-20 animate-pulse rounded bg-rose-50" />
          <div className="h-14 w-full animate-pulse rounded-lg bg-rose-50" />
          <div className="flex w-full gap-2">
            <div className="h-7 flex-1 animate-pulse rounded-lg bg-rose-100" />
            <div className="h-7 flex-1 animate-pulse rounded-lg bg-rose-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
