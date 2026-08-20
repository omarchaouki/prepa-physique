"use client";

import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Loader2 } from "lucide-react";

import { signUpAction } from "@/app/actions/signup";
import type { ActionState } from "@/app/actions/auth";
import type { JobTitle } from "@/lib/constants";
import { COUNTRIES, countryName, searchCountries } from "@/lib/countries";
import { FormProgress } from "@/components/shell/form-progress";
import { Combobox } from "@/components/marketing/combobox";
import { Stepper } from "@/components/marketing/stepper";
import { tagSession, trackCustom } from "@/components/tracking/events";
import type { SignupCopy } from "./copy";

/**
 * Inscription en trois etapes.
 *
 * ---------------------------------------------------------------------------
 * Pourquoi decouper
 * ---------------------------------------------------------------------------
 *
 * Neuf champs sur un seul ecran se lisent comme un formulaire administratif, et
 * la moitie des visiteurs venus d'une publicite referme avant d'avoir commence.
 * Decoupe en trois, chaque ecran pose une question simple : quel club, qui etes
 * vous, quel mot de passe. L'indicateur en haut dit combien il en reste, ce qui
 * evite l'impression de tunnel sans fin.
 *
 * Aucune etape ne depasse quatre champs. C'est le seuil au dela duquel le taux
 * de completion d'un formulaire commence a chuter nettement, et il n'y a aucune
 * raison de le franchir ici : rien de ce qui est demande n'est facultatif au
 * fonctionnement du compte, hors le telephone qui l'est explicitement.
 *
 * ---------------------------------------------------------------------------
 * Pourquoi la saisie ne disparait plus
 * ---------------------------------------------------------------------------
 *
 * La version d'origine utilisait des champs non controles : leur valeur ne
 * vivait que dans le DOM. Un rafraichissement, un retour depuis les conditions
 * generales, une erreur reseau, et tout etait perdu. Sur un formulaire d'une
 * page c'est agacant, sur trois etapes c'est redhibitoire.
 *
 * L'etat vit maintenant dans React et se recopie dans `sessionStorage` a chaque
 * frappe. Il est relu au montage, l'etape en cours comprise.
 *
 * Les mots de passe sont la seule exception : ils ne sont jamais ecrits, nulle
 * part. Le stockage de session est lisible par tout script de la page, et un
 * mot de passe qui traine ailleurs que dans la memoire du formulaire est un mot
 * de passe qui finira par fuir.
 *
 * `sessionStorage` et non `localStorage` : le brouillon disparait avec l'onglet.
 * Sur un ordinateur partage, un club a moitie renseigne ne doit pas attendre le
 * visiteur suivant.
 *
 * ---------------------------------------------------------------------------
 * Ce que le formulaire remonte a la mesure d'audience
 * ---------------------------------------------------------------------------
 *
 * Un seul evenement, au passage de la premiere etape : `SignupStarted`. Il
 * repond a la question qui decide d'une campagne, celle que le nombre
 * d'inscriptions ne repond pas : les visiteurs abandonnent ils avant d'avoir
 * commence, ou en cours de route. Aucune valeur saisie n'est envoyee.
 */

const DRAFT_KEY = "lamsaa.signup.draft";

interface Draft {
  club: string;
  country: string;
  name: string;
  jobTitle: JobTitle | "";
  jobTitleOther: string;
  email: string;
  phone: string;
  step: number;
}

const EMPTY: Draft = {
  club: "",
  country: "",
  name: "",
  jobTitle: "",
  jobTitleOther: "",
  email: "",
  phone: "",
  step: 0,
};

function SubmitButton({ copy }: { copy: SignupCopy }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary btn-lg w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          {copy.pending}
        </>
      ) : (
        <>
          <Check size={17} aria-hidden="true" />
          {copy.submit}
        </>
      )}
    </button>
  );
}

export function SignUpForm({
  copy,
  surface = "var(--surface-page)",
}: {
  copy: SignupCopy;
  /**
   * Fond sur lequel le formulaire est pose. Transmis a l'indicateur d'etapes,
   * qui doit peindre la meme couleur pour interrompre son rail proprement.
   * Voir le commentaire de `Stepper`.
   */
  surface?: string;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(signUpAction, {});

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [restored, setRestored] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [invalid, setInvalid] = useState<string | null>(null);

  const firstField = useRef<HTMLInputElement>(null);
  const loaded = useRef(false);
  const announced = useRef(false);

  // Relecture du brouillon. Une seule fois, avant tout enregistrement, sinon
  // l'etat vide initial ecraserait ce qui etait conserve.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = { ...EMPTY, ...(JSON.parse(raw) as Partial<Draft>) };
        setDraft(parsed);
        // On ne signale la reprise que s'il y a vraiment quelque chose a
        // reprendre : un simple passage a l'etape deux ne merite pas un message.
        if (parsed.club || parsed.name || parsed.email) setRestored(true);
      }
    } catch {
      // Stockage indisponible, navigation privee sur certains navigateurs :
      // le formulaire fonctionne, il ne se souvient simplement de rien.
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Sans stockage, on continue sans brouillon.
    }
  }, [draft]);

  // Le brouillon n'a plus de raison d'exister une fois le compte cree. La
  // redirection quitte cette page, donc le nettoyage se fait au demontage.
  useEffect(() => () => {
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      /* rien a faire */
    }
  }, []);

  const set = useCallback(
    <K extends keyof Draft>(key: K, value: Draft[K]) =>
      setDraft((current) => ({ ...current, [key]: value })),
    [],
  );

  const steps = [copy.step1, copy.step2, copy.step3];
  const step = Math.min(draft.step, steps.length - 1);
  const rtl = copy.dir === "rtl";

  // La fleche suit le sens de lecture : en arabe, avancer va vers la gauche.
  const NextIcon = rtl ? ArrowLeft : ArrowRight;
  const BackIcon = rtl ? ArrowRight : ArrowLeft;

  /**
   * Verifie l'etape avant de laisser avancer.
   *
   * Le premier champ fautif recoit le focus : sans cela, sur un ecran de
   * telephone, le message d'erreur peut se trouver hors du champ de vision et
   * l'utilisateur croit que le bouton ne marche pas.
   */
  const validate = (index: number): string | null => {
    if (index === 0) {
      if (draft.club.trim().length < 2) return "club";
      if (!draft.country) return "country";
      return null;
    }
    if (index === 1) {
      if (draft.name.trim().length < 2) return "name";
      if (!draft.jobTitle) return "jobTitle";
      if (draft.jobTitle === "OTHER" && draft.jobTitleOther.trim().length < 2) return "jobTitleOther";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(draft.email.trim())) return "email";
      return null;
    }
    return null;
  };

  const goNext = () => {
    const bad = validate(step);
    setInvalid(bad);
    if (bad) {
      document.getElementById(bad)?.focus();
      return;
    }

    // Une seule fois par visite, et seulement au franchissement de la premiere
    // etape : c'est la que se joue l'essentiel de l'abandon.
    if (step === 0 && !announced.current) {
      announced.current = true;
      trackCustom("SignupStarted");
      tagSession("inscription", "commencee");
    }

    set("step", step + 1);
    // Le focus repart en tete de la nouvelle etape, sinon il reste sur le
    // bouton et le lecteur d'ecran ne signale aucun changement.
    requestAnimationFrame(() => firstField.current?.focus());
  };

  const goBack = () => {
    setInvalid(null);
    set("step", Math.max(0, step - 1));
  };

  // Memorise : sans cela la liste se recree a chaque frappe, et l'effet qui
  // synchronise l'etiquette du combobox se relancerait a chaque rendu.
  const countryOptions = useMemo(
    () =>
      COUNTRIES.map((country) => ({ value: country.code, label: country[copy.countryLocale] })),
    [copy.countryLocale],
  );

  const fieldError = (name: string) =>
    invalid === name ? (
      <p className="text-[0.75rem] mt-1.5" style={{ color: "var(--danger)" }} role="alert">
        {copy.required}
      </p>
    ) : null;

  return (
    <form action={formAction} className="space-y-1" noValidate>
      <FormProgress />

      <Stepper
        steps={steps}
        current={step}
        onGoTo={(index) => set("step", index)}
        positionLabel={copy.stepPosition}
        surface={surface}
      />

      {state.error ? (
        <div
          className="rounded-lg px-3 py-2.5 text-sm mb-4"
          style={{ background: "var(--danger-soft)", color: "var(--danger)" }}
          role="alert"
          aria-live="polite"
        >
          {copy.errors[state.error] ?? state.error}
        </div>
      ) : null}

      {restored ? (
        <p
          className="rounded-lg px-3 py-2 text-[0.8125rem] mb-4"
          style={{ background: "var(--info-soft)", color: "var(--text-secondary)" }}
          aria-live="polite"
        >
          {copy.draftRestored}
        </p>
      ) : null}

      {/* --------------------------------------------------------------- */}
      {/* Etape 1 : le club                                                */}
      {/* --------------------------------------------------------------- */}
      <div hidden={step !== 0}>
        <div className="mb-4">
          <label className="label" htmlFor="club">
            {copy.club} *
          </label>
          <input
            ref={step === 0 ? firstField : undefined}
            id="club"
            type="text"
            required
            autoComplete="organization"
            className="field"
            value={draft.club}
            onChange={(event) => set("club", event.target.value)}
            aria-invalid={invalid === "club"}
          />
          {fieldError("club") ?? (
            <p className="text-[0.75rem] mt-1.5" style={{ color: "var(--text-muted)" }}>
              {copy.clubHint}
            </p>
          )}
        </div>

        <Combobox
          id="country"
          name="country"
          label={copy.country}
          hint={copy.countryHint}
          placeholder={copy.countryPlaceholder}
          options={countryOptions}
          search={(query) =>
            searchCountries(query, copy.countryLocale).map((country) => ({
              value: country.code,
              label: country[copy.countryLocale],
            }))
          }
          required
          value={draft.country}
          emptyLabel={copy.countryEmpty}
          countLabel={copy.countryCount}
          onChange={(value) => set("country", value)}
        />
        {fieldError("country")}
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Etape 2 : la personne                                            */}
      {/* --------------------------------------------------------------- */}
      <div hidden={step !== 1}>
        <div className="mb-4">
          <label className="label" htmlFor="name">
            {copy.name} *
          </label>
          <input
            ref={step === 1 ? firstField : undefined}
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="field"
            value={draft.name}
            onChange={(event) => set("name", event.target.value)}
            aria-invalid={invalid === "name"}
          />
          {fieldError("name")}
        </div>

        <div className="mb-4">
          <label className="label" htmlFor="jobTitle">
            {copy.jobTitle} *
          </label>
          <select
            id="jobTitle"
            className="field cursor-pointer"
            value={draft.jobTitle}
            onChange={(event) => set("jobTitle", event.target.value as JobTitle | "")}
            aria-invalid={invalid === "jobTitle"}
          >
            <option value="">{copy.choose}</option>
            {copy.jobTitles.map((title) => (
              <option key={title.value} value={title.value}>
                {title.label}
              </option>
            ))}
          </select>
          {fieldError("jobTitle")}
        </div>

        {/* Le champ libre n'apparait que si « Autre » est choisi : montrer un
            champ inutile a tout le monde pour servir une minorite est le
            contraire de la revelation progressive. */}
        {draft.jobTitle === "OTHER" ? (
          <div className="mb-4">
            <label className="label" htmlFor="jobTitleOther">
              {copy.jobTitleOther} *
            </label>
            <input
              id="jobTitleOther"
              type="text"
              className="field"
              value={draft.jobTitleOther}
              onChange={(event) => set("jobTitleOther", event.target.value)}
              aria-invalid={invalid === "jobTitleOther"}
            />
            {fieldError("jobTitleOther")}
          </div>
        ) : null}

        <div className="mb-4">
          <label className="label" htmlFor="email">
            {copy.email} *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="email"
            dir="ltr"
            className="field"
            value={draft.email}
            onChange={(event) => set("email", event.target.value)}
            aria-invalid={invalid === "email"}
          />
          {fieldError("email") ?? (
            <p className="text-[0.75rem] mt-1.5" style={{ color: "var(--text-muted)" }}>
              {copy.emailHint}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="label" htmlFor="phone">
            {copy.phone}{" "}
            <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({copy.optional})</span>
          </label>
          {/* Une adresse et un numero se lisent de gauche a droite meme dans une
              page en arabe : sans `dir`, le signe plus d'un indicatif saute a la
              fin du numero. */}
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            className="field"
            placeholder="+212 6 00 00 00 00"
            value={draft.phone}
            onChange={(event) => set("phone", event.target.value)}
          />
          <p className="text-[0.75rem] mt-1.5" style={{ color: "var(--text-muted)" }}>
            {copy.phoneHint}
          </p>
        </div>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Etape 3 : l'acces                                                */}
      {/* --------------------------------------------------------------- */}
      <div hidden={step !== 2}>
        {/* Un rappel de ce qui va etre cree, avant le geste irreversible. */}
        <div className="panel-sunken p-3.5 mb-5">
          <p
            className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            {copy.recap}
          </p>
          <p className="text-[0.9375rem] font-semibold">{draft.club || "."}</p>
          <p className="text-[0.8125rem] mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {draft.name}
            {draft.jobTitle
              ? ` . ${
                  draft.jobTitle === "OTHER"
                    ? draft.jobTitleOther
                    : (copy.jobTitles.find((title) => title.value === draft.jobTitle)?.label ?? "")
                }`
              : ""}
          </p>
          <p className="text-[0.8125rem]" style={{ color: "var(--text-secondary)" }}>
            {draft.email}
            {draft.country ? ` . ${countryName(draft.country, copy.countryLocale)}` : ""}
          </p>
        </div>

        <div className="mb-4">
          <label className="label" htmlFor="password">
            {copy.password} *
          </label>
          <div className="relative">
            <input
              ref={step === 2 ? firstField : undefined}
              id="password"
              name="password"
              type={visible ? "text" : "password"}
              required
              minLength={10}
              autoComplete="new-password"
              dir="ltr"
              className="field pe-11"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              onClick={() => setVisible((current) => !current)}
              className="absolute end-1 top-1/2 -translate-y-1/2 grid place-items-center size-9 rounded-md cursor-pointer"
              style={{ color: "var(--text-muted)" }}
              aria-label={visible ? copy.hidePassword : copy.showPassword}
            >
              {visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
            </button>
          </div>
          <p className="text-[0.75rem] mt-1.5" style={{ color: "var(--text-muted)" }}>
            {copy.passwordHint}
          </p>
        </div>

        <div className="mb-5">
          <label className="label" htmlFor="confirm">
            {copy.confirm} *
          </label>
          <input
            id="confirm"
            name="confirm"
            type={visible ? "text" : "password"}
            required
            autoComplete="new-password"
            dir="ltr"
            className="field"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
          {confirm && password !== confirm ? (
            <p className="text-[0.75rem] mt-1.5" style={{ color: "var(--danger)" }} role="alert">
              {copy.mismatch}
            </p>
          ) : null}
        </div>
      </div>

      {/* Les champs des etapes precedentes voyagent en cache : le formulaire
          n'est soumis qu'une fois, avec l'ensemble des valeurs. */}
      <input type="hidden" name="club" value={draft.club} />
      <input type="hidden" name="jobTitle" value={draft.jobTitle} />
      <input type="hidden" name="jobTitleOther" value={draft.jobTitleOther} />
      {step !== 1 ? (
        <>
          <input type="hidden" name="name" value={draft.name} />
          <input type="hidden" name="email" value={draft.email} />
          <input type="hidden" name="phone" value={draft.phone} />
        </>
      ) : null}

      {/* Leurre. Retire du flux, de la tabulation et de la voix.

          Il est masque par decoupage et non par un decalage de dix mille
          pixels : dans une page en arabe, ce decalage part vers la droite,
          c'est a dire du cote ou la page defile, et il ajoutait dix mille
          pixels de defilement horizontal. Le decoupage n'occupe aucune place
          dans aucun sens de lecture.

          Il reste dans le flux et garde ses dimensions, contrairement a
          `display: none` : un robot qui remplit les champs caches doit
          continuer de le voir, c'est toute la raison d'etre du leurre. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          margin: -1,
          padding: 0,
          border: 0,
          overflow: "hidden",
          clipPath: "inset(50%)",
          whiteSpace: "nowrap",
        }}
      >
        <label htmlFor="website">Ne pas remplir</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex items-center gap-3 pt-1">
        {step > 0 ? (
          <button type="button" onClick={goBack} className="btn btn-secondary btn-lg">
            <BackIcon size={16} aria-hidden="true" />
            {copy.back}
          </button>
        ) : null}

        {step < steps.length - 1 ? (
          <button type="button" onClick={goNext} className="btn btn-primary btn-lg flex-1">
            {copy.next}
            <NextIcon size={16} aria-hidden="true" />
          </button>
        ) : (
          <div className="flex-1">
            <SubmitButton copy={copy} />
          </div>
        )}
      </div>

      {step === steps.length - 1 ? (
        <>
          <ul className="space-y-1.5 pt-4">
            {copy.included.map((line) => (
              <li key={line} className="flex items-start gap-2 text-[0.8125rem]">
                <span
                  className="grid place-items-center size-4 rounded-full shrink-0 mt-0.5"
                  style={{ background: "var(--success-soft)", color: "var(--success)" }}
                  aria-hidden="true"
                >
                  <Check size={10} strokeWidth={3} />
                </span>
                <span style={{ color: "var(--text-secondary)" }}>{line}</span>
              </li>
            ))}
          </ul>

          <p className="text-[0.75rem] leading-relaxed pt-3" style={{ color: "var(--text-muted)" }}>
            {copy.terms}
          </p>
        </>
      ) : null}
    </form>
  );
}
