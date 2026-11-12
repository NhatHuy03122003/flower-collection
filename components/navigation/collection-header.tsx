import { Suspense } from "react";

import { AuthLinks, UserMenu } from "@/components/auth/user-menu";
import { MemberSelector } from "@/components/member/member-selector";
import { getCurrentMember } from "@/lib/current-member";
import { getCurrentUser } from "@/lib/current-user";
import { getMembers } from "@/lib/member";

export function CollectionHeader() {
  return (
    <header className="border-b border-rose-200/80 bg-[#fff8fa]">
      <div className="mx-auto flex min-h-14 w-full max-w-screen-2xl items-center justify-between gap-3 px-3 py-2 sm:px-5">
        <h1 className="flex items-center gap-2 text-base font-bold tracking-tight text-rose-950 sm:text-lg">
          <span aria-hidden="true" className="text-lg">
            🌹
          </span>
          Hội ROSE Flower Collection
        </h1>

        <div className="flex items-center gap-2">
          <Suspense fallback={<MemberSelectorSkeleton />}>
            <HeaderMemberSelector />
          </Suspense>
          <Suspense fallback={null}>
            <HeaderUserArea />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

async function HeaderUserArea() {
  const user = await getCurrentUser();

  return user ? <UserMenu user={user} /> : <AuthLinks />;
}

async function HeaderMemberSelector() {
  const [members, currentMember] = await Promise.all([
    getMembers(),
    getCurrentMember(),
  ]);

  return (
    <MemberSelector
      members={members}
      currentMemberId={currentMember?.id ?? null}
    />
  );
}

function MemberSelectorSkeleton() {
  return (
    <span
      aria-hidden="true"
      className="h-8 w-40 shrink-0 animate-pulse rounded-full bg-rose-100"
    />
  );
}
