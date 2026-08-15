import { cn } from "@/lib/utils";

/**
 * Blocs de remplacement affiches pendant que les donnees arrivent.
 *
 * Regle de conception : chaque squelette occupe exactement la place du contenu
 * qu'il remplace. C'est ce qui evite le saut de mise en page a l'arrivee des
 * donnees, defaut le plus visible des interfaces qui chargent en plusieurs temps.
 */

export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div className={cn("skeleton", className)} style={style} aria-hidden="true" />;
}

/** Enveloppe accessible : annonce le chargement une seule fois aux lecteurs d'ecran. */
export function LoadingRegion({
  children,
  label = "Chargement des donnees",
}: {
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-3.5"
          style={{ width: index === lines - 1 ? "62%" : "100%" }}
        />
      ))}
    </div>
  );
}

/** Rangee d'indicateurs chiffres, meme gabarit que StatCard. */
export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <LoadingRegion label="Chargement des indicateurs">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="panel p-3.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-16 mt-2" />
            <Skeleton className="h-3 w-24 mt-2" />
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}

export function SkeletonPanel({
  title = true,
  children,
  className,
}: {
  title?: boolean;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("panel p-4", className)}>
      {title ? (
        <div className="flex items-start gap-2.5 mb-4">
          <Skeleton className="size-8 rounded-lg shrink-0" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56 mt-1.5" />
          </div>
        </div>
      ) : null}
      {children}
    </div>
  );
}

/** Tableau de donnees : entete puis lignes, largeurs de colonnes variees. */
export function SkeletonTable({
  rows = 8,
  columns = 6,
  firstColumnWide = true,
}: {
  rows?: number;
  columns?: number;
  firstColumnWide?: boolean;
}) {
  const widths = ["70%", "55%", "80%", "45%", "65%", "50%", "75%", "60%"];

  return (
    <LoadingRegion label="Chargement du tableau">
      <div className="panel-sunken overflow-hidden">
        {/* Entete */}
        <div
          className="flex gap-4 px-3 py-2.5"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-2.5"
              style={{ flex: index === 0 && firstColumnWide ? 2.2 : 1 }}
            />
          ))}
        </div>
        {/* Lignes */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex items-center gap-4 px-3 py-3"
            style={{
              borderBottom: rowIndex === rows - 1 ? "none" : "1px solid var(--border-subtle)",
            }}
          >
            {Array.from({ length: columns }).map((_, columnIndex) => (
              <div
                key={columnIndex}
                style={{ flex: columnIndex === 0 && firstColumnWide ? 2.2 : 1 }}
                className="flex items-center gap-2"
              >
                {columnIndex === 0 && firstColumnWide ? (
                  <Skeleton className="size-7 rounded-full shrink-0" />
                ) : null}
                <Skeleton
                  className="h-3.5 flex-1"
                  style={{ maxWidth: widths[(rowIndex + columnIndex) % widths.length] }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}

/**
 * Zone de graphique. On dessine des barres de hauteurs variables plutot qu'un
 * rectangle plein : la forme annonce ce qui va apparaitre.
 */
export function SkeletonChart({ height = 240 }: { height?: number }) {
  const heights = [45, 70, 55, 85, 62, 95, 74, 58, 88, 66, 78, 50];

  return (
    <LoadingRegion label="Chargement du graphique">
      <div className="flex items-end gap-2 px-2" style={{ height }}>
        {heights.map((value, index) => (
          <Skeleton key={index} className="flex-1 rounded-t-sm" style={{ height: `${value}%` }} />
        ))}
      </div>
      <div className="flex gap-2 px-2 mt-2">
        {heights.map((_, index) => (
          <Skeleton key={index} className="h-2 flex-1" />
        ))}
      </div>
    </LoadingRegion>
  );
}

/** Radar : un disque et sa legende. */
export function SkeletonRadar({ height = 280 }: { height?: number }) {
  return (
    <LoadingRegion label="Chargement du profil">
      <div className="grid place-items-center" style={{ height }}>
        <Skeleton className="rounded-full" style={{ width: height * 0.72, height: height * 0.72 }} />
      </div>
      <div className="space-y-2 mt-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-1.5 flex-1 max-w-[7rem] rounded-full" />
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}

/** Liste d'elements avec pastille, pour les alertes et les passations recentes. */
export function SkeletonList({ items = 5, avatar = true }: { items?: number; avatar?: boolean }) {
  return (
    <LoadingRegion label="Chargement de la liste">
      <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
        {Array.from({ length: items }).map((_, index) => (
          <li key={index} className="flex items-center gap-3 py-2.5">
            {avatar ? <Skeleton className="size-8 rounded-full shrink-0" /> : null}
            <div className="flex-1 min-w-0">
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-3 w-48 mt-1.5" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full shrink-0" />
          </li>
        ))}
      </ul>
    </LoadingRegion>
  );
}

/** Grille de cartes, pour les equipes et les clubs. */
export function SkeletonCards({ count = 3, columns = 3 }: { count?: number; columns?: number }) {
  return (
    <LoadingRegion label="Chargement des cartes">
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${100 / columns}%, 1fr))` }}
      >
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="panel p-4">
            <div className="flex items-start gap-2.5">
              <Skeleton className="size-3 rounded-full mt-1 shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24 mt-1.5" />
              </div>
            </div>
            <div className="flex gap-1.5 mt-3">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div
              className="grid grid-cols-2 gap-2 mt-3 pt-3"
              style={{ borderTop: "1px solid var(--border-subtle)" }}
            >
              <div>
                <Skeleton className="h-5 w-10" />
                <Skeleton className="h-3 w-14 mt-1.5" />
              </div>
              <div>
                <Skeleton className="h-5 w-10" />
                <Skeleton className="h-3 w-16 mt-1.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}

/** En tete de page, quand meme le titre depend d'une requete. */
export function SkeletonPageHeader({ withAction = false }: { withAction?: boolean }) {
  return (
    <header className="mb-5">
      <Skeleton className="h-3 w-24 mb-2" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-3.5 w-96 max-w-full mt-2" />
        </div>
        {withAction ? <Skeleton className="h-10 w-40 rounded-lg shrink-0" /> : null}
      </div>
    </header>
  );
}
