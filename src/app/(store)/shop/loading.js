import { ProductGridSkeleton, Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="container-page py-6 md:py-10">
      <Skeleton className="mb-6 h-8 w-40" />
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <Skeleton className="hidden h-96 lg:block" />
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
