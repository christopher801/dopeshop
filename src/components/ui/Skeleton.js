export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4" aria-busy="true" aria-label="Cargando productos">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card overflow-hidden p-3">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="mt-3 h-3 w-1/3" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-3 h-5 w-1/2" />
        </div>
      ))}
    </div>
  );
}
