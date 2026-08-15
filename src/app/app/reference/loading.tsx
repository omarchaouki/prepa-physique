import { Panel } from "@/components/ui/primitives";
import { Skeleton, SkeletonPageHeader, SkeletonText } from "@/components/ui/skeleton";

export default function ReferenceLoading() {
  return (
    <>
      <SkeletonPageHeader />
      <Panel className="mb-4">
        <Skeleton className="h-4 w-56 mb-1.5" />
        <Skeleton className="h-3 w-72 mb-4" />
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="panel-sunken p-3">
              <Skeleton className="h-3.5 w-40 mb-2" />
              <SkeletonText lines={2} />
              <div className="flex gap-1 mt-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </Panel>
      {[0, 1, 2].map((index) => (
        <Panel key={index} className="mb-4">
          <Skeleton className="h-4 w-40 mb-4" />
          <div className="space-y-2">
            {[0, 1, 2].map((row) => (
              <Skeleton key={row} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </Panel>
      ))}
    </>
  );
}
