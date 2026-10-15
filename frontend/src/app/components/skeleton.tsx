const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
);

export function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className={`h-23 rounded-xl bg-white shadow-sm p-4 flex flex-col items-center justify-center gap-2 ${
            i < 3 ? "" : i < 4 ? "hidden md:flex" : i < 6 ? "hidden lg:flex" : "hidden xl:flex"
          }`}
        >
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="max-w-xs overflow-hidden rounded-lg bg-white shadow-sm">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  );
}