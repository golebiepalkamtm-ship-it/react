import { Skeleton } from '@/components/ui/skeleton';

export const CardSkeleton = () => (
  <div className="bg-card border border-border rounded-xl p-6 space-y-4">
    <Skeleton className="h-[200px] w-full" />
    <div className="space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-8 flex-1" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
);

export const ChampionCardSkeleton = () => (
  <div className="bg-card border border-border rounded-xl overflow-hidden">
    <Skeleton className="h-[300px] w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-7 w-4/5" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  </div>
);

export const AuctionCardSkeleton = () => (
  <div
    className="rounded-3xl overflow-hidden border border-[#A68E4E]/30 bg-black/40 backdrop-blur-md p-4 space-y-4 flex flex-col justify-between"
    style={{
      minHeight: "560px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    }}
  >
    {/* Image area skeleton */}
    <div className="relative aspect-square w-full rounded-2xl bg-white/5 border border-white/5 overflow-hidden animate-pulse">
      <div className="absolute top-3 left-3 w-24 h-6 rounded-full bg-white/10" />
      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10" />
      <div className="absolute bottom-3 left-3 right-3 h-8 rounded-xl bg-white/10" />
    </div>

    {/* Content details */}
    <div className="space-y-3 flex-1 pt-1 animate-pulse">
      <div className="h-6 w-3/4 rounded-lg bg-white/10" />
      <div className="flex gap-2">
        <div className="h-5 w-24 rounded-md bg-[#A68E4E]/20" />
        <div className="h-5 w-16 rounded-md bg-white/10" />
      </div>
      <div className="space-y-1.5 pt-2">
        <div className="h-3 w-full rounded bg-white/5" />
        <div className="h-3 w-4/5 rounded bg-white/5" />
      </div>
    </div>

    {/* Price & Action button */}
    <div className="pt-3 border-t border-white/10 space-y-2.5 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <div className="h-3 w-16 rounded bg-white/10" />
          <div className="h-6 w-24 rounded bg-emerald-400/20" />
        </div>
        <div className="h-6 w-20 rounded bg-white/10" />
      </div>
      <div className="h-11 w-full rounded-xl bg-gradient-to-r from-[#A68E4E]/30 to-[#C5A95D]/20 border border-[#A68E4E]/40" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 p-4 border border-border rounded-lg">
        <Skeleton className="h-5 flex-1" />
        <Skeleton className="h-5 flex-1" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-24" />
      </div>
    ))}
  </div>
);

export const HeroSkeleton = () => (
  <div className="relative h-[120vh] flex items-end justify-center overflow-hidden bg-muted">
    <Skeleton className="absolute left-1/2 -translate-x-1/2 h-[80vh] w-auto" />
    <div className="absolute left-1/2 -translate-x-1/2 text-center bottom-[calc(80vh+2rem)] w-full space-y-4">
      <Skeleton className="h-20 w-1/2 mx-auto" />
      <Skeleton className="h-10 w-3/4 mx-auto" />
    </div>
  </div>
);
