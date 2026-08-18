import type { Metadata } from "next";

import { COMPANY, CONTACT, RESPONSE_HOURS, orBlank } from "@/lib/marketing";
import { getLocale } from "@/lib/i18n/server";
import { LegalPage, type LegalSection } from "@/components/marketing/legal-page";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title:
      locale === "en"
        ? `Company details . ${CONTACT.brand}`
        : `Mentions legales . ${CONTACT.brand}`,
  };
}

/**
 * Mentions legales.
 *
 * Page courte et purement factuelle. Elle repond a une seule question, celle
 * que Stripe pose avant d'ouvrir un compte et qu'un client se pose avant de
 * donner un numero de carte : qui est derriere ce site, et ou le joindre.
 *
 * Les valeurs viennent de l'environnement du serveur. Tant qu'une manque, elle
 * s'affiche en toutes lettres comme une mention a completer, plutot que de
 * laisser un blanc que personne ne remarquerait.
 */
export default async function LegalNoticePage() {
  const locale = await getLocale();

  const missing = (fr: string, en: string) => ({ fr, en });

  const sections: LegalSection[] = [
    {
      heading: { fr: "Editeur du site", en: "Site publisher" },
      bullets: [
        {
          fr: `Raison sociale : ${orBlank(COMPANY.legalName, missing("raison sociale et forme juridique", "legal name and company form"), locale)}`,
          en: `Legal name: ${orBlank(COMPANY.legalName, missing("raison sociale et forme juridique", "legal name and company form"), locale)}`,
        },
        {
          fr: `Siege social : ${orBlank(COMPANY.address, missing("adresse postale complete", "full postal address"), locale)}`,
          en: `Registered office: ${orBlank(COMPANY.address, missing("adresse postale complete", "full postal address"), locale)}`,
        },
        {
          fr: `Immatriculation : ${orBlank(COMPANY.registration, missing("registre du commerce et identifiant fiscal", "trade register and tax identifier"), locale)}`,
          en: `Registration: ${orBlank(COMPANY.registration, missing("registre du commerce et identifiant fiscal", "trade register and tax identifier"), locale)}`,
        },
        {
          fr: `Telephone : ${orBlank(COMPANY.phone, missing("numero de telephone", "phone number"), locale)}`,
          en: `Phone: ${orBlank(COMPANY.phone, missing("numero de telephone", "phone number"), locale)}`,
        },
      ],
    },
    {
      heading: { fr: "Nous joindre", en: "Contact us" },
      bullets: [
        {
          fr: `Assistance et facturation : ${CONTACT.support}`,
          en: `Support and billing: ${CONTACT.support}`,
        },
        {
          fr: `Commercial et demonstrations : ${CONTACT.sales}`,
          en: `Sales and demos: ${CONTACT.sales}`,
        },
        {
          fr: `Nous repondons sous ${RESPONSE_HOURS} heures ouvrees.`,
          en: `We answer within ${RESPONSE_HOURS} working hours.`,
        },
      ],
    },
    {
      heading: { fr: "Directeur de la publication", en: "Publication director" },
      paragraphs: [
        {
          fr: orBlank(null, missing("nom du representant legal", "name of the legal representative"), locale),
          en: orBlank(null, missing("nom du representant legal", "name of the legal representative"), locale),
        },
      ],
    },
    {
      heading: { fr: "Hebergement", en: "Hosting" },
      paragraphs: [
        {
          fr: "Le serveur applicatif est heberge sur une infrastructure cloud situee en Europe. La base de donnees est hebergee par un prestataire distinct, egalement en Europe.",
          en: "The application server runs on cloud infrastructure located in Europe. The database is hosted by a separate provider, also in Europe.",
        },
        {
          fr: `Les noms et adresses des hebergeurs sont communiques sur simple demande a ${CONTACT.support}.`,
          en: `Hosting providers' names and addresses are given on simple request at ${CONTACT.support}.`,
        },
      ],
    },
    {
      heading: { fr: "Paiements", en: "Payments" },
      paragraphs: [
        {
          fr: "Les paiements par carte sont traites par un prestataire de paiement agree. Aucun numero de carte ne transite par nos serveurs ni n'y est conserve.",
          en: "Card payments are handled by a licensed payment provider. No card number passes through our servers or is stored there.",
        },
      ],
    },
    {
      heading: { fr: "Propriete intellectuelle", en: "Intellectual property" },
      paragraphs: [
        {
          fr: "L'ensemble du site, de son code, de ses textes et de ses illustrations est protege. Toute reproduction sans autorisation ecrite est interdite.",
          en: "The whole site, its code, its texts and its images are protected. Any reproduction without written permission is forbidden.",
        },
        {
          fr: "Les protocoles de tests et les normes citees appartiennent a leurs auteurs respectifs, nommes a cote de chaque test.",
          en: "The test protocols and norms cited belong to their respective authors, named next to each test.",
        },
      ],
    },
  ];

  return (
    <LegalPage
      locale={locale}
      title={{ fr: "Mentions legales", en: "Company details" }}
      updatedOn="2026-08-18"
      intro={{
        fr: "Qui edite ce site, ou se trouve l'entreprise, et comment la joindre.",
        en: "Who publishes this site, where the company is, and how to reach it.",
      }}
      sections={sections}
    />
  );
}
