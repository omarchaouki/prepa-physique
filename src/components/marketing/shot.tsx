/**
 * Photographie ou capture, servie en plusieurs largeurs.
 *
 * `next/image` n'est pas utilise volontairement : il exige `sharp` sur le
 * serveur, alors que le recadrage et la compression sont deja faits en amont
 * par scripts/generate-marketing-images.py. Le cadre porte le rapport d'aspect,
 * ce qui reserve la place avant l'arrivee de l'image et evite tout decalage de
 * mise en page au chargement.
 *
 * ---------------------------------------------------------------------------
 * La variante telephone
 * ---------------------------------------------------------------------------
 *
 * `narrow` ne sert pas a economiser des octets, `srcset` le fait deja. Il sert
 * a changer d'image.
 *
 * Une capture d'un tableau de bord large ramenee a trois cent trente pixels
 * devient une tache grise : le visiteur n'y lit rien, et une preuve illisible
 * se lit comme du remplissage. La page sert donc au telephone la capture prise
 * sur un telephone, et a l'ordinateur celle prise sur un ordinateur. Les deux
 * montrent le meme ecran du produit, cadre pour l'appareil qui le regarde.
 *
 * C'est le motif dit de direction artistique, et `<picture>` est fait pour
 * cela : le navigateur ne telecharge qu'une seule des deux sources, alors que
 * deux images dont une masquee en CSS seraient toutes les deux chargees.
 *
 * ---------------------------------------------------------------------------
 * Le cadre et son mouvement
 * ---------------------------------------------------------------------------
 *
 * La mise en forme vit dans `.shot`, cote feuille de style, et non dans des
 * styles en ligne comme auparavant. C'est ce qui permet a l'image de se
 * dezoomer doucement pendant qu'elle entre dans l'ecran : une animation ne peut
 * pas etre declaree en ligne, et une classe la rend en plus reglable au meme
 * endroit que le reste des animations de la page.
 *
 * L'image est visible et a sa taille normale par defaut. Le mouvement n'est
 * ajoute que si le navigateur sait le faire et si le visiteur ne demande pas
 * de mouvement reduit. Une animation qui echoue ne fait donc jamais disparaitre
 * une photographie.
 */

interface Variant {
  /** Prefixe des fichiers, sans la largeur ni l'extension. */
  base: string;
  widths: number[];
  sizes: string;
}

export function Shot({
  base,
  widths,
  sizes,
  alt,
  frame,
  priority = false,
  objectPosition,
  narrow,
  narrowUpTo = 639,
}: {
  base: string;
  widths: number[];
  sizes: string;
  alt: string;
  frame: string;
  priority?: boolean;
  objectPosition?: string;
  /** Variante servie aux petits ecrans, quand l'image large n'y a pas de sens. */
  narrow?: Variant;
  /**
   * Largeur maximale, en pixels, a laquelle la variante etroite s'applique.
   *
   * Le cadre doit suivre : les deux variantes n'ont pas le meme rapport
   * d'aspect, donc `frame` porte les deux, par exemple
   * `aspect-[390/800] sm:aspect-[1440/884]`. Sans cela l'image serait rognee.
   */
  narrowUpTo?: number;
}) {
  const srcSet = (prefix: string, list: number[]): string =>
    list.map((width) => `/marketing/${prefix}-${width}.webp ${width}w`).join(", ");

  const image = (
    // eslint-disable-next-line @next/next/no-img-element -- images deja optimisees, voir en tete de fichier
    <img
      src={`/marketing/${base}-${widths[widths.length - 1]}.webp`}
      srcSet={narrow ? undefined : srcSet(base, widths)}
      sizes={narrow ? undefined : sizes}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      className="shot__image absolute inset-0 size-full object-cover"
      style={{ objectPosition: objectPosition ?? "center" }}
    />
  );

  return (
    <div className={`shot ${frame}`}>
      {narrow ? (
        <picture>
          <source
            media={`(max-width: ${narrowUpTo}px)`}
            srcSet={srcSet(narrow.base, narrow.widths)}
            sizes={narrow.sizes}
          />
          <source srcSet={srcSet(base, widths)} sizes={sizes} />
          {image}
        </picture>
      ) : (
        image
      )}
    </div>
  );
}
