import { SkeletonPageHeader, SkeletonStats, SkeletonTable } from "@/components/ui/skeleton";
import { Panel } from "@/components/ui/primitives";

/**
 * Reponse immediate a la navigation, affichee pendant que la page resout ses
 * premieres verifications (session, droits sur l'equipe). Les segments qui ont
 * besoin d'un squelette plus proche de leur contenu definissent le leur.
 */
export default function AppLoading() {
  return (
    <>
      <SkeletonPageHeader withAction />
      <div className="mb-5">
        <SkeletonStats />
      </div>
      <Panel className="p-4">
        <SkeletonTable rows={8} columns={6} />
      </Panel>
    </>
  );
}
