import {
  CollectionPageSkeleton,
  FlowerCardSkeletonGrid,
} from "@/components/shared/skeleton";

export default function Loading() {
  return (
    <CollectionPageSkeleton>
      <FlowerCardSkeletonGrid count={6} />
    </CollectionPageSkeleton>
  );
}
