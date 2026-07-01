type Props = {
  count?: number;
  className?: string;
};

function SkeletonCard() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="rounded-2xl aspect-[4/3] bg-[rgba(31,41,51,0.06)] mb-2" />
      <div className="h-4 w-3/4 rounded-md bg-[rgba(31,41,51,0.08)] mb-2" />
      <div className="h-3 w-1/2 rounded-md bg-[rgba(31,41,51,0.05)]" />
    </div>
  );
}

export default function ListingSkeletonGrid({
  count = 8,
  className = "",
}: Props) {
  return (
    <div
      className={`grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-x-3 gap-y-6 md:gap-x-6 md:gap-y-8 ${className}`}
      aria-hidden
    >
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
