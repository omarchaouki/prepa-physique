import type { Metadata } from "next";

import { CONTACT } from "@/lib/marketing";
import { PLAN_LIMITS } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/server";
import { LegalPage, type LegalSection } from "@/components/marketing/legal-page";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title:
      locale === "en"
        ? `Refund policy . ${CONTACT.brand}`
        : `Politique de remboursement . ${CONTACT.brand}`,
  };
}

/**
 * Politique de remboursement et de resiliation.
 *
 * C'est la page que Stripe cherche en premier, et celle qui fait la difference
 * entre un compte accepte et un compte refuse. Elle doit repondre a trois
 * questions sans detour : dans quels cas, en combien de temps, et par quel
 * moyen. Une politique vague est traitee comme une absence de politique.
 */
export default async function RefundPage() {
  const locale = await getLocale();

  const sections: LegalSection[] = [
    {
      heading: { fr: "Essayer sans payer, sans limite", en: "Try without paying, with no limit" },
      paragraphs: [
        {
          fr: `Le forfait gratuit couvre ${PLAN_LIMITS.FREE.maxPlayers} joueurs et n'a pas de date de fin. Aucune carte bancaire n'est demandee a l'inscription, et rien ne se declenche tout seul : tant que vous restez sous ce plafond, vous ne payez jamais.`,
          en: `The free plan covers ${PLAN_LIMITS.FREE.maxPlayers} players and has no end date. No card is required to sign up, and nothing starts on its own: as long as you stay under that limit, you never pay.`,
        },
        {
          fr: "C'est le moyen le plus sur de verifier que la plateforme vous convient, avec votre propre effectif et sur une saison entiere si vous le souhaitez. Il rend la plupart des demandes de remboursement inutiles.",
          en: "This is the safest way to check the platform suits you, with your own squad and over a whole season if you wish. It makes most refund requests unnecessary.",
        },
      ],
    },
    {
      heading: { fr: "Remboursement d'un mois preleve", en: "Refund of a charged month" },
      paragraphs: [
        {
          fr: "Tout mois preleve est rembourse integralement si la demande nous parvient dans les quatorze jours suivant le prelevement. Aucune justification n'est demandee.",
          en: "Any charged month is refunded in full if the request reaches us within fourteen days of the charge. No justification is required.",
        },
        {
          fr: "Le remboursement porte sur le mois en cours. Les mois anterieurs, deja utilises, ne sont pas concernes.",
          en: "The refund covers the current month. Earlier months, already used, are not covered.",
        },
      ],
    },
    {
      heading: { fr: "Comment demander", en: "How to ask" },
      paragraphs: [
        {
          fr: `Un courriel a ${CONTACT.support} depuis l'adresse du compte suffit. Precisez seulement le nom du club, rien d'autre n'est necessaire.`,
          en: `An email to ${CONTACT.support} from the account address is enough. Just give the club name, nothing else is needed.`,
        },
      ],
    },
    {
      heading: { fr: "Delais", en: "Timescales" },
      bullets: [
        {
          fr: "Accuse de reception sous un jour ouvre.",
          en: "Acknowledgement within one working day.",
        },
        {
          fr: "Remboursement declenche sous cinq jours ouvres apres accord.",
          en: "Refund issued within five working days of agreement.",
        },
        {
          fr: "Apparition sur le releve bancaire sous cinq a dix jours supplementaires, delai qui depend de votre banque et non de nous.",
          en: "Appearance on your bank statement within a further five to ten days, a delay that depends on your bank and not on us.",
        },
        {
          fr: "Le remboursement est effectue sur le moyen de paiement d'origine. Nous ne remboursons ni sur un autre compte, ni en avoir.",
          en: "The refund is made to the original payment method. We refund neither to another account nor as credit.",
        },
      ],
    },
    {
      heading: { fr: "Resiliation, qui est autre chose", en: "Cancellation, which is different" },
      paragraphs: [
        {
          fr: "Resilier arrete les prelevements a venir. Cela ne rembourse pas le mois en cours, qui reste utilisable jusqu'a son dernier jour.",
          en: "Cancelling stops future charges. It does not refund the current month, which stays usable until its last day.",
        },
        {
          fr: "La resiliation se fait depuis votre compte, a tout moment, sans nous ecrire et sans justification.",
          en: "Cancellation is done from your account, at any time, without writing to us and without a reason.",
        },
        {
          fr: "Apres la fin de la periode payee, le compte reste consultable trente jours pour vous laisser exporter vos donnees. Il est ensuite supprime definitivement.",
          en: "After the paid period ends, the account stays readable for thirty days so you can export your data. It is then permanently deleted.",
        },
      ],
    },
    {
      heading: { fr: "Interruption de service", en: "Service interruption" },
      paragraphs: [
        {
          fr: "Si la plateforme est indisponible plus de quarante huit heures consecutives de notre fait, le mois concerne est rembourse au prorata, sans que vous ayez a le demander.",
          en: "If the platform is unavailable for more than forty eight consecutive hours through our fault, the month concerned is refunded pro rata, without you having to ask.",
        },
      ],
    },
    {
      heading: { fr: "Ce qui n'est pas rembourse", en: "What is not refunded" },
      bullets: [
        {
          fr: "Les mois anterieurs au dernier prelevement.",
          en: "Months preceding the latest charge.",
        },
        {
          fr: "Les prestations sur mesure deja realisees, comme une mise en place en marque blanche ou une reprise de donnees.",
          en: "Bespoke work already delivered, such as a white label setup or a data migration.",
        },
        {
          fr: "Un compte ferme pour manquement grave aux conditions generales.",
          en: "An account closed for a serious breach of the terms of service.",
        },
      ],
    },
    {
      heading: { fr: "En cas de desaccord", en: "If we disagree" },
      paragraphs: [
        {
          fr: `Ecrivez a ${CONTACT.support} en expliquant le point de blocage. Nous repondons a chaque message, y compris pour dire non, et nous expliquons pourquoi. Contester le prelevement aupres de votre banque avant de nous avoir ecrit vous coutera plus de temps que de nous ecrire.`,
          en: `Write to ${CONTACT.support} explaining the sticking point. We answer every message, including to say no, and we explain why. Disputing the charge with your bank before writing to us will cost you more time than writing to us.`,
        },
      ],
    },
  ];

  return (
    <LegalPage
      locale={locale}
      title={{ fr: "Remboursement et resiliation", en: "Refunds and cancellation" }}
      updatedOn="2026-08-18"
      intro={{
        fr: "Trois reponses, sans detour : dans quels cas nous remboursons, en combien de temps, et comment demander.",
        en: "Three answers, without detours: when we refund, how long it takes, and how to ask.",
      }}
      sections={sections}
    />
  );
}
