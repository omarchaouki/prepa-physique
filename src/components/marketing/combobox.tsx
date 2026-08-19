"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

/**
 * Champ de saisie avec suggestions.
 *
 * On tape le debut d'un nom, la liste se reduit, on choisit au clavier ou a la
 * souris. C'est le motif « combobox » du standard ARIA, implemente ici plutot
 * qu'importe : la seule alternative honnete serait une bibliotheque entiere
 * pour un champ.
 *
 * Ce que ce composant respecte, et qui manque a la plupart des listes maison :
 *
 * . Les fleches haut et bas parcourent les suggestions, Entree valide,
 *   Echap ferme sans rien changer. Un champ qui ne repond qu'a la souris est
 *   inutilisable au clavier, et une inscription se remplit au clavier.
 * . L'element actif est designe par `aria-activedescendant`, ce qui permet a un
 *   lecteur d'ecran d'annoncer la suggestion survolee sans deplacer le focus
 *   hors du champ de saisie.
 * . Le nombre de resultats est annonce a la voix, sinon un utilisateur aveugle
 *   tape sans savoir si quelque chose apparait.
 * . La valeur reellement soumise est un code, pas le texte tape. Un formulaire
 *   qui accepte « maroc », « Maroc » et « MAROC » comme trois pays differents
 *   produit des donnees inexploitables.
 */

export interface ComboOption {
  value: string;
  label: string;
}

export function Combobox({
  id,
  name,
  label,
  hint,
  placeholder,
  options,
  search,
  required = false,
  value,
  emptyLabel,
  countLabel,
  onChange,
}: {
  id: string;
  /** Nom du champ cache qui porte la valeur choisie. */
  name: string;
  label: string;
  hint?: string;
  placeholder?: string;
  /** Liste complete, utilisee pour retrouver l'etiquette d'une valeur. */
  options: ComboOption[];
  /** Recherche, fournie par l'appelant pour rester specifique au domaine. */
  search: (query: string) => ComboOption[];
  required?: boolean;
  /**
   * Valeur selectionnee, pilotee par le parent.
   *
   * Volontairement controlee et non initialisee une seule fois : le formulaire
   * relit son brouillon apres le premier rendu, et un composant qui ne lit sa
   * valeur qu'au montage perdrait silencieusement le pays deja choisi.
   */
  value: string;
  emptyLabel: string;
  /** Gabarit du nombre de resultats, avec {count}. */
  countLabel: string;
  onChange: (value: string) => void;
}) {
  const listId = useId();
  const [query, setQuery] = useState(
    () => options.find((option) => option.value === value)?.label ?? "",
  );
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  // Le texte affiche suit la valeur quand celle ci change depuis l'exterieur,
  // par exemple a la relecture d'un brouillon. On ne touche a rien quand la
  // valeur est vide : l'utilisateur est peut etre en train de taper.
  useEffect(() => {
    if (!value) return;
    const label = options.find((option) => option.value === value)?.label;
    if (label && label !== query) setQuery(label);
    // `query` est volontairement absent des dependances : le reintroduire
    // rendrait la saisie impossible, chaque frappe etant aussitot ecrasee.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, options]);

  const wrap = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const suggestions = open && query.trim() ? search(query) : [];

  // Un clic en dehors ferme la liste. Sans cela elle reste ouverte au dessus du
  // reste du formulaire et masque les champs suivants.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const choose = (option: ComboOption) => {
    setQuery(option.label);
    setOpen(false);
    onChange?.(option.value);
    input.current?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      if (suggestions.length === 0) return;
      setActive((current) => {
        const next = event.key === "ArrowDown" ? current + 1 : current - 1;
        return (next + suggestions.length) % suggestions.length;
      });
      return;
    }

    if (event.key === "Enter" && open && suggestions[active]) {
      // On n'empeche la soumission que si une suggestion est reellement
      // selectionnee : sinon Entree doit valider le formulaire comme partout.
      event.preventDefault();
      choose(suggestions[active]);
      return;
    }

    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div className="mb-4" ref={wrap}>
      <label className="label" htmlFor={id}>
        {label}
        {required ? " *" : ""}
      </label>

      <div className="relative">
        <input
          ref={input}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open && suggestions.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && suggestions[active] ? `${listId}-${active}` : undefined
          }
          autoComplete="off"
          className="field pr-10"
          placeholder={placeholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
            setOpen(true);
            // Ce qui est tape ne vaut rien tant qu'une suggestion n'est pas
            // choisie : on efface la valeur pour ne jamais soumettre un pays
            // approximatif.
            if (value) onChange?.("");
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />

        <ChevronDown
          size={17}
          aria-hidden="true"
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform"
          style={{
            color: "var(--text-muted)",
            transform: `translateY(-50%) rotate(${open && suggestions.length > 0 ? 180 : 0}deg)`,
          }}
        />

        {open && suggestions.length > 0 ? (
          <ul
            id={listId}
            role="listbox"
            className="absolute left-0 right-0 z-30 mt-1 overflow-auto panel"
            style={{ maxHeight: "15rem", padding: "0.25rem" }}
          >
            {suggestions.map((option, index) => {
              const selected = option.value === value;
              const highlighted = index === active;
              return (
                <li
                  key={option.value}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={selected}
                  onPointerDown={(event) => {
                    // `pointerdown` et non `click` : le clic arriverait apres la
                    // perte de focus, qui a deja ferme la liste.
                    event.preventDefault();
                    choose(option);
                  }}
                  onPointerEnter={() => setActive(index)}
                  className="flex items-center justify-between gap-2 px-3 rounded-md cursor-pointer"
                  style={{
                    minHeight: "2.5rem",
                    background: highlighted ? "var(--surface-hover)" : "transparent",
                  }}
                >
                  <span className="text-[0.9375rem]">{option.label}</span>
                  {selected ? (
                    <Check size={15} aria-hidden="true" style={{ color: "var(--accent)" }} />
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      {/* Le nombre de resultats, annonce a la voix et invisible a l'oeil. */}
      <p aria-live="polite" className="sr-only">
        {open && query.trim()
          ? suggestions.length > 0
            ? countLabel.replace("{count}", String(suggestions.length))
            : emptyLabel
          : ""}
      </p>

      {open && query.trim() && suggestions.length === 0 ? (
        <p className="text-[0.75rem] mt-1.5" style={{ color: "var(--text-muted)" }}>
          {emptyLabel}
        </p>
      ) : hint ? (
        <p className="text-[0.75rem] mt-1.5" style={{ color: "var(--text-muted)" }}>
          {hint}
        </p>
      ) : null}

      {/* La valeur soumise est le code, jamais le texte tape. */}
      <input type="hidden" name={name} value={value} />
    </div>
  );
}
