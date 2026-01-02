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
  <div className="bg-card border border-border rounded-xl overflow-hidden">
    <Skeleton className="h-[200px] w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-8 w-full" />
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
