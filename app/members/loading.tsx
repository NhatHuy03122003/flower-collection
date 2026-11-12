import {
  CollectionPageSkeleton,
  MemberCardSkeletonGrid,
  ToolbarRowSkeleton,
} from "@/components/shared/skeleton";

export default function Loading() {
  return (
    <CollectionPageSkeleton>
      <ToolbarRowSkeleton />
      <MemberCardSkeletonGrid count={6} />
    </CollectionPageSkeleton>
  );
}
