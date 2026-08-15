import { Panel } from "@/components/ui/primitives";
import { SkeletonPageHeader, SkeletonStats, SkeletonTable } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <>
      <SkeletonPageHeader />
      <div className="mb-4">
        <SkeletonStats />
      </div>
      <Panel className="p-4">
        <SkeletonTable rows={6} columns={7} firstColumnWide={false} />
      </Panel>
    </>
  );
}
