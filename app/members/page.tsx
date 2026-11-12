import { Suspense } from "react";

import { AddMemberDialog } from "@/components/member/add-member-dialog";
import { MemberList } from "@/components/member/member-list";
import { CollectionHeader } from "@/components/navigation/collection-header";
import { CollectionToolbar } from "@/components/navigation/collection-toolbar";
import { SearchInput, SearchProvider } from "@/components/shared/search";
import { MemberCardSkeletonGrid } from "@/components/shared/skeleton";
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
        <SearchProvider>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold tracking-tight text-rose-950 sm:text-lg">
              Thành viên
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <SearchInput placeholder="Tìm thành viên..." />
              <AddMemberDialog />
            </div>
          </div>

          <Suspense fallback={<MembersLoading />}>
            <MembersContent />
          </Suspense>
        </SearchProvider>
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
  return <MemberCardSkeletonGrid count={6} />;
}
