import { Panel } from "@/components/ui/primitives";
import {
  Skeleton,
  SkeletonChart,
  SkeletonPageHeader,
  SkeletonRadar,
  SkeletonStats,
  SkeletonText,
} from "@/components/ui/skeleton";

export default function PlayerLoading() {
  return (
    <>
      <SkeletonPageHeader />
      <div className="flex flex-wrap gap-1.5 mb-4">
        {[0, 1, 2, 3, 4].map((index) => (
          <Skeleton key={index} className="h-5 w-20 rounded-full" />
        ))}
      </div>

      <div className="mb-4">
        <SkeletonStats />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Panel>
          <Skeleton className="h-4 w-32 mb-1.5" />
          <Skeleton className="h-3 w-48 mb-4" />
          <SkeletonRadar height={280} />
        </Panel>
        <Panel className="lg:col-span-2">
          <Skeleton className="h-4 w-40 mb-1.5" />
          <Skeleton className="h-3 w-56 mb-4" />
          <div className="space-y-2.5">
            {[0, 1, 2].map((index) => (
              <div key={index} className="panel-sunken p-3">
                <div className="flex gap-1.5 mb-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <Skeleton className="h-4 w-64 mb-2" />
                <SkeletonText lines={3} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel className="mb-4">
        <Skeleton className="h-4 w-48 mb-4" />
        <SkeletonChart height={240} />
      </Panel>
    </>
  );
}
