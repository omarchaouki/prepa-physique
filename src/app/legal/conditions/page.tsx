import type { Metadata } from "next";

import { COMPANY, CONTACT, PRICING, TRIAL_DAYS, formatPrice, orBlank } from "@/lib/marketing";
import { PLAN_LIMITS } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/server";
import { LegalPage, type LegalSection } from "@/components/marketing/legal-page";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title:
      locale === "en"
        ? `Terms of service . ${CONTACT.brand}`
        : `Conditions generales . ${CONTACT.brand}`,
  };
}

/**
 * Conditions generales de vente et d'utilisation.
 *
 * Redigees a partir de ce que le service fait reellement : les plafonds, les
 * tarifs et la duree d'essai sont lus dans le code, pas recopies. Modifier
 * src/lib/marketing.ts met donc a jour la page de vente et ce contrat en meme
 * temps, ce qui evite le cas classique du contrat qui annonce un prix que le
 * site n'affiche plus.
 *
 * Ce texte couvre ce que Stripe verifie et ce que la pratique commerciale
 * courante impose. Il ne remplace pas la relecture d'un juriste avant la
 * premiere vente, notamment sur le droit applicable et la TVA.
 */
export default async function TermsPage() {
  const locale = await getLocale();

  const company = orBlank(
    COMPANY.legalName,
    { fr: "raison sociale", en: "legal name" },
    locale,
  );
  const address = orBlank(COMPANY.address, { fr: "adresse", en: "address" }, locale);
  const registration = orBlank(
    COMPANY.registration,
    { fr: "numero d'immatriculation", en: "registration number" },
    locale,
  );

  const starter = PRICING.STARTER.monthlyEur;
  const elite = PRICING.ELITE.monthlyEur;
  const range =
    starter !== null && elite !== null
      ? `${formatPrice(starter, locale)} ${locale === "en" ? "to" : "a"} ${formatPrice(elite, locale)}`
      : "";

  const sections: LegalSection[] = [
    {
      heading: { fr: "Qui edite le service", en: "Who provides the service" },
      paragraphs: [
        {
          fr: `Le service ${CONTACT.brand} est edite par ${company}, dont le siege est situe ${address}, immatriculee sous le numero ${registration}.`,
          en: `The ${CONTACT.brand} service is provided by ${company}, registered office at ${address}, registration number ${registration}.`,
        },
        {
          fr: `Le service client repond a l'adresse ${CONTACT.support}. Les demandes commerciales sont traitees a l'adresse ${CONTACT.sales}.`,
          en: `Customer support answers at ${CONTACT.support}. Sales enquiries are handled at ${CONTACT.sales}.`,
        },
      ],
    },
    {
      heading: { fr: "Ce que couvre ce contrat", en: "What this contract covers" },
      paragraphs: [
        {
          fr: "Ces conditions regissent l'acces a la plateforme et son utilisation. Elles sont acceptees a la creation du compte et remplacent tout echange anterieur portant sur le meme objet.",
          en: "These terms govern access to the platform and its use. They are accepted when the account is created and supersede any earlier exchange on the same subject.",
        },
        {
          fr: "Le client est un professionnel : club, academie, federation ou preparateur physique independant. Le service n'est pas destine aux consommateurs.",
          en: "The customer is a professional: club, academy, federation or independent strength and conditioning coach. The service is not aimed at consumers.",
        },
      ],
    },
    {
      heading: { fr: "Ce que fournit la plateforme", en: "What the platform provides" },
      paragraphs: [
        {
          fr: "Une application accessible par navigateur et par application Android, permettant de saisir des tests physiques, de calculer des indicateurs a partir de protocoles publies, de comparer les resultats a des normes, et de produire des recommandations ecrites.",
          en: "An application reachable through a browser and an Android app, letting you record physical tests, compute indicators from published protocols, compare results against norms, and produce written recommendations.",
        },
        {
          fr: "Les recommandations sont une aide a la decision destinee a un professionnel qualifie. Elles ne constituent ni un diagnostic, ni un avis medical, ni une autorisation de reprise. La decision et sa responsabilite restent au staff.",
          en: "Recommendations are decision support intended for a qualified professional. They are neither a diagnosis, nor medical advice, nor a return to play clearance. The decision and its responsibility remain with the staff.",
        },
      ],
    },
    {
      heading: { fr: "Compte et acces", en: "Account and access" },
      paragraphs: [
        {
          fr: "Chaque utilisateur dispose d'identifiants personnels qu'il lui appartient de garder secrets. Le client informe sans delai le service client de tout acces non autorise.",
          en: "Each user has personal credentials which they must keep secret. The customer informs support without delay of any unauthorised access.",
        },
      ],
      bullets: [
        {
          fr: `Essai : ${PLAN_LIMITS.TRIAL.maxTeams} equipe et ${PLAN_LIMITS.TRIAL.maxPlayers} joueurs.`,
          en: `Trial: ${PLAN_LIMITS.TRIAL.maxTeams} team and ${PLAN_LIMITS.TRIAL.maxPlayers} players.`,
        },
        {
          fr: `Starter : ${PLAN_LIMITS.STARTER.maxTeams} equipes et ${PLAN_LIMITS.STARTER.maxPlayers} joueurs.`,
          en: `Starter: ${PLAN_LIMITS.STARTER.maxTeams} teams and ${PLAN_LIMITS.STARTER.maxPlayers} players.`,
        },
        {
          fr: `Pro : ${PLAN_LIMITS.PRO.maxTeams} equipes et ${PLAN_LIMITS.PRO.maxPlayers} joueurs.`,
          en: `Pro: ${PLAN_LIMITS.PRO.maxTeams} teams and ${PLAN_LIMITS.PRO.maxPlayers} players.`,
        },
        {
          fr: `Elite : ${PLAN_LIMITS.ELITE.maxTeams} equipes et ${PLAN_LIMITS.ELITE.maxPlayers} joueurs.`,
          en: `Elite: ${PLAN_LIMITS.ELITE.maxTeams} teams and ${PLAN_LIMITS.ELITE.maxPlayers} players.`,
        },
      ],
    },
    {
      heading: { fr: "Prix et paiement", en: "Price and payment" },
      paragraphs: [
        {
          fr: `Les tarifs sont exprimes en euro et hors taxes, de ${range} par mois selon la formule. Les montants applicables sont ceux affiches sur la page des tarifs le jour de la souscription.`,
          en: `Prices are stated in euro excluding VAT, from ${range} per month depending on the plan. The applicable amounts are those shown on the pricing page on the day of subscription.`,
        },
        {
          fr: "L'abonnement est preleve par carte bancaire, chaque mois, a la date anniversaire de la souscription. La facture est envoyee par courriel le jour du prelevement.",
          en: "The subscription is charged by card, monthly, on the anniversary date of the subscription. The invoice is emailed on the day of the charge.",
        },
        {
          fr: "Les paiements sont traites par un prestataire de paiement agree. Aucun numero de carte ne transite par nos serveurs ni n'y est conserve.",
          en: "Payments are handled by a licensed payment provider. No card number passes through our servers or is stored there.",
        },
        {
          fr: "En cas d'echec de prelevement, l'acces est maintenu sept jours pendant lesquels le client peut mettre a jour son moyen de paiement. Passe ce delai, le compte passe en lecture seule.",
          en: "If a charge fails, access is maintained for seven days during which the customer can update their payment method. After that, the account becomes read only.",
        },
      ],
    },
    {
      heading: { fr: "Essai gratuit", en: "Free trial" },
      paragraphs: [
        {
          fr: `L'essai dure ${TRIAL_DAYS} jours et ne demande aucune carte bancaire. A son terme, aucun prelevement n'a lieu : le compte reste consultable jusqu'au choix d'une formule payante.`,
          en: `The trial lasts ${TRIAL_DAYS} days and requires no card. At its end nothing is charged: the account stays readable until a paid plan is chosen.`,
        },
      ],
    },
    {
      heading: { fr: "Duree, resiliation et remboursement", en: "Term, cancellation and refunds" },
      paragraphs: [
        {
          fr: "L'abonnement est mensuel, sans duree minimale ni engagement. Il se renouvelle par tacite reconduction jusqu'a resiliation.",
          en: "The subscription is monthly, with no minimum term and no commitment. It renews automatically until cancelled.",
        },
        {
          fr: "La resiliation se fait depuis le compte, a tout moment, sans justification et sans avoir a nous ecrire. Elle prend effet a la fin de la periode deja payee, qui reste utilisable en entier.",
          en: "Cancellation is done from the account, at any time, without a reason and without writing to us. It takes effect at the end of the period already paid, which stays fully usable.",
        },
        {
          fr: "Les conditions de remboursement sont detaillees sur la page dediee, accessible depuis le pied de page.",
          en: "Refund conditions are set out on the dedicated page, reachable from the footer.",
        },
      ],
    },
    {
      heading: { fr: "Donnees des joueurs", en: "Player data" },
      paragraphs: [
        {
          fr: "Le client reste responsable des donnees qu'il enregistre. Il garantit disposer du fondement necessaire pour traiter les donnees de ses joueurs, et de l'autorisation des representants legaux lorsqu'il s'agit de mineurs.",
          en: "The customer remains responsible for the data they record. They warrant that they have the necessary basis to process their players' data, and the authorisation of legal guardians where minors are concerned.",
        },
        {
          fr: "Nous agissons comme sous traitant : nous traitons ces donnees pour fournir le service, sur instruction du client, et pour rien d'autre. Elles ne sont ni revendues, ni cedees, ni utilisees pour entrainer un modele.",
          en: "We act as a processor: we handle this data to deliver the service, on the customer's instructions, and for nothing else. It is never resold, transferred, or used to train a model.",
        },
        {
          fr: "L'export complet est disponible a tout moment depuis le compte, sans demande prealable et sans frais.",
          en: "Full export is available at any time from the account, without prior request and free of charge.",
        },
      ],
    },
    {
      heading: { fr: "Disponibilite et maintenance", en: "Availability and maintenance" },
      paragraphs: [
        {
          fr: "Le service est fourni sans interruption programmee aux heures ouvrees. Les operations de maintenance sont annoncees a l'avance lorsqu'elles necessitent une coupure.",
          en: "The service runs without scheduled interruption during working hours. Maintenance requiring downtime is announced in advance.",
        },
        {
          fr: "Une interruption due a un hebergeur, a un operateur reseau ou a un cas de force majeure ne peut nous etre imputee.",
          en: "An interruption caused by a hosting provider, a network operator or an event of force majeure cannot be attributed to us.",
        },
      ],
    },
    {
      heading: { fr: "Responsabilite", en: "Liability" },
      paragraphs: [
        {
          fr: "Notre responsabilite, toutes causes confondues, est limitee au montant paye par le client au cours des douze mois precedant le fait generateur.",
          en: "Our liability, all causes combined, is limited to the amount paid by the customer during the twelve months preceding the triggering event.",
        },
        {
          fr: "Nous ne repondons pas des decisions sportives ou medicales prises a partir des indicateurs affiches, ni d'une blessure survenue malgre ou a cause d'une recommandation.",
          en: "We are not liable for sporting or medical decisions taken from the indicators shown, nor for an injury occurring despite or because of a recommendation.",
        },
      ],
    },
    {
      heading: { fr: "Propriete", en: "Ownership" },
      paragraphs: [
        {
          fr: "La plateforme, son code, ses calculs et son catalogue de tests restent notre propriete. Le client dispose d'un droit d'usage pendant la duree de son abonnement.",
          en: "The platform, its code, its calculations and its test catalogue remain our property. The customer holds a right of use for the duration of their subscription.",
        },
        {
          fr: "Les donnees enregistrees par le client restent la propriete du client.",
          en: "Data recorded by the customer remains the property of the customer.",
        },
      ],
    },
    {
      heading: { fr: "Modification des conditions", en: "Changes to these terms" },
      paragraphs: [
        {
          fr: "Toute modification est annoncee par courriel trente jours avant son entree en vigueur. Le client qui la refuse peut resilier sans frais avant cette date.",
          en: "Any change is announced by email thirty days before it takes effect. A customer who refuses it may cancel free of charge before that date.",
        },
      ],
    },
    {
      heading: { fr: "Droit applicable", en: "Governing law" },
      paragraphs: [
        {
          fr: `Le present contrat est soumis au droit ${orBlank(null, { fr: "pays du siege, a preciser", en: "country of the registered office, to be specified" }, locale)}. A defaut d'accord amiable, le litige releve des tribunaux competents de ce ressort.`,
          en: `This contract is governed by the law of ${orBlank(null, { fr: "pays du siege, a preciser", en: "country of the registered office, to be specified" }, locale)}. Failing an amicable settlement, disputes fall to the competent courts of that jurisdiction.`,
        },
      ],
    },
  ];

  return (
    <LegalPage
      locale={locale}
      title={{ fr: "Conditions generales", en: "Terms of service" }}
      updatedOn="2026-08-18"
      intro={{
        fr: `Ces conditions s'appliquent a tout usage de ${CONTACT.brand}. Elles sont ecrites pour etre lues, pas pour decourager la lecture.`,
        en: `These terms apply to any use of ${CONTACT.brand}. They are written to be read, not to discourage reading.`,
      }}
      sections={sections}
    />
  );
}
