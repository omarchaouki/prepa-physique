import { CONTACT } from "@/lib/marketing";

/**
 * Bouton WhatsApp flottant.
 *
 * ---------------------------------------------------------------------------
 * Pourquoi un lien et rien d'autre
 * ---------------------------------------------------------------------------
 *
 * Ce composant n'a pas de directive client, pas d'etat, pas d'ecouteur. C'est
 * une ancre, rendue sur le serveur. Un visiteur dont le script de la page a
 * echoue, ou qui coupe JavaScript, garde donc un moyen de vous joindre : c'est
 * precisement le genre d'element qui ne doit jamais dependre du reste.
 *
 * `wa.me` est l'adresse officielle. Elle ouvre l'application installee sur un
 * telephone, et WhatsApp Web sur un ordinateur, sans que la page ait a
 * distinguer les deux cas. Le numero est transmis en chiffres seuls, indicatif
 * compris, sans le plus : voir `CONTACT.whatsapp`.
 *
 * ---------------------------------------------------------------------------
 * La position, qui est le seul point delicat
 * ---------------------------------------------------------------------------
 *
 * Sur telephone, la page d'atterrissage fait deja monter une barre
 * d'inscription collee en bas, sur toute la largeur. Un bouton rond pose au
 * meme endroit se retrouverait dessous ou dessus, selon l'ordre du document,
 * et masquerait l'action principale de la page. `raised` le remonte donc au
 * dessus de la hauteur de cette barre.
 *
 * Le decalage tient compte de `env(safe-area-inset-bottom)` : sur un telephone
 * a geste de navigation, un bouton colle a zero pixel du bas tombe sous la
 * barre systeme et devient intouchable.
 */
export function WhatsAppButton({
  label,
  message,
  raised = false,
}: {
  /** Enonce lu par la voix, le bouton n'ayant pas de texte visible. */
  label: string;
  /** Message pre rempli dans la conversation. */
  message: string;
  /**
   * Remonte le bouton au dessus d'une barre d'action collee en bas d'ecran.
   * A poser sur toute page qui utilise `StickyCta`.
   */
  raised?: boolean;
}) {
  // Sans numero configure, pas de bouton : mieux vaut rien qu'une conversation
  // vide qui ne mene nulle part.
  if (!CONTACT.whatsapp) return null;

  const href = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="whatsapp-fab"
      data-raised={raised ? "" : undefined}
    >
      {/* Le glyphe officiel, en trace unique.

          Il n'est pas dans lucide, qui ne porte aucune marque commerciale, et
          il est dessine ici plutot que charge en image : une icone de marque
          doit rester nette a toutes les densites, et un fichier de plus sur le
          premier ecran se paie sur une connexion de telephone.

          `currentColor` laisse la feuille de style decider, ce qui evite un
          hexadecimal dans un composant. */}
      <svg
        viewBox="0 0 24 24"
        width="26"
        height="26"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.41a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43-.14 0-.31-.01-.47-.01a.9.9 0 0 0-.66.31c-.22.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.29Z" />
      </svg>
    </a>
  );
}
