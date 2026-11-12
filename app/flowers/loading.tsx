import {
  CollectionPageSkeleton,
  FlowerCardSkeletonGrid,
  ToolbarRowSkeleton,
} from "@/components/shared/skeleton";

export default function Loading() {
  return (
    <CollectionPageSkeleton>
      <ToolbarRowSkeleton />
      <FlowerCardSkeletonGrid count={6} />
    </CollectionPageSkeleton>
  );
}
