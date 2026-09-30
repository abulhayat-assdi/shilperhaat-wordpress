export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#f0e8d8]">
      <div className="aspect-square skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-16 skeleton rounded" />
        <div className="h-4 skeleton rounded" />
        <div className="h-4 w-3/4 skeleton rounded" />
        <div className="h-5 w-24 skeleton rounded" />
        <div className="h-9 skeleton rounded-lg" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
