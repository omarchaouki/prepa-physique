import type { Metadata } from "next";

import { COMPANY, CONTACT, orBlank } from "@/lib/marketing";
import { getLocale } from "@/lib/i18n/server";
import { LegalPage, type LegalSection } from "@/components/marketing/legal-page";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title:
      locale === "en" ? `Privacy . ${CONTACT.brand}` : `Confidentialite . ${CONTACT.brand}`,
  };
}

/**
 * Politique de confidentialite.
 *
 * Le point sensible de ce produit n'est pas le compte du preparateur, c'est le
 * joueur : une plateforme de preparation physique enregistre des donnees de
 * sante sur des personnes qui ne sont pas ses clients, souvent mineures. Cette
 * page le dit clairement plutot que de le noyer, parce que c'est exactement ce
 * qu'un club regardera avant de signer.
 */
export default async function PrivacyPage() {
  const locale = await getLocale();

  const company = orBlank(COMPANY.legalName, { fr: "raison sociale", en: "legal name" }, locale);
  const address = orBlank(COMPANY.address, { fr: "adresse", en: "address" }, locale);

  const sections: LegalSection[] = [
    {
      heading: { fr: "Qui traite vos donnees", en: "Who handles your data" },
      paragraphs: [
        {
          fr: `${company}, ${address}. Toute question sur cette page ou sur vos droits se traite a l'adresse ${CONTACT.support}, avec une reponse sous trente jours au plus tard.`,
          en: `${company}, ${address}. Any question about this page or your rights goes to ${CONTACT.support}, answered within thirty days at the latest.`,
        },
      ],
    },
    {
      heading: { fr: "Deux roles distincts", en: "Two distinct roles" },
      paragraphs: [
        {
          fr: "Pour les comptes des utilisateurs de la plateforme, nous sommes responsables du traitement : nous decidons de ce qui est collecte et pourquoi.",
          en: "For the accounts of platform users, we are the controller: we decide what is collected and why.",
        },
        {
          fr: "Pour les donnees des joueurs, nous sommes sous traitant. C'est le club qui decide, et nous traitons ces donnees uniquement sur ses instructions, pour lui fournir le service.",
          en: "For player data, we are a processor. The club decides, and we handle that data only on its instructions, in order to deliver the service.",
        },
      ],
    },
    {
      heading: { fr: "Ce qui est collecte", en: "What is collected" },
      bullets: [
        {
          fr: "Compte utilisateur : nom, adresse de courriel, mot de passe chiffre, langue, role et club de rattachement.",
          en: "User account: name, email address, hashed password, language, role and club.",
        },
        {
          fr: "Joueurs : identite, date de naissance, sexe, poste, taille, poids, resultats de tests, mesures anthropometriques, ressenti quotidien et historique de blessures.",
          en: "Players: identity, date of birth, sex, position, height, weight, test results, anthropometric measurements, daily wellness and injury history.",
        },
        {
          fr: "Usage : journal des actions de modification, conserve pour la tracabilite et la securite.",
          en: "Usage: a log of modifying actions, kept for traceability and security.",
        },
        {
          fr: "Facturation : raison sociale, adresse, historique des paiements. Aucun numero de carte n'est conserve par nos soins.",
          en: "Billing: company name, address, payment history. No card number is stored by us.",
        },
      ],
    },
    {
      heading: { fr: "Donnees de sante et joueurs mineurs", en: "Health data and underage players" },
      paragraphs: [
        {
          fr: "Les resultats de tests, les mesures corporelles et l'historique de blessures sont des donnees de sante. Elles beneficient d'une protection renforcee et ne sont accessibles qu'aux membres du staff explicitement rattaches a l'equipe concernee.",
          en: "Test results, body measurements and injury history are health data. They benefit from reinforced protection and are only accessible to staff explicitly attached to the team concerned.",
        },
        {
          fr: "Une part importante des joueurs suivis est mineure. Il appartient au club de recueillir l'autorisation des representants legaux avant d'enregistrer quoi que ce soit, et de pouvoir la produire sur demande. La plateforme ne collecte aucune donnee directement aupres d'un joueur.",
          en: "A large share of tracked players are minors. It is for the club to obtain the authorisation of legal guardians before recording anything, and to be able to produce it on request. The platform collects no data directly from a player.",
        },
      ],
    },
    {
      heading: { fr: "Pourquoi, et sur quelle base", en: "Why, and on what basis" },
      bullets: [
        {
          fr: "Fournir le service et executer le contrat : gestion des comptes, calculs, affichage des resultats.",
          en: "Deliver the service and perform the contract: account management, calculations, display of results.",
        },
        {
          fr: "Securite et preuve : journal des modifications, detection des acces anormaux, interet legitime.",
          en: "Security and evidence: change log, detection of abnormal access, legitimate interest.",
        },
        {
          fr: "Obligations comptables : conservation des factures, obligation legale.",
          en: "Accounting obligations: retention of invoices, legal obligation.",
        },
      ],
    },
    {
      heading: { fr: "Ce que nous ne faisons pas", en: "What we do not do" },
      bullets: [
        {
          fr: "Aucune revente, aucune location, aucun echange de donnees avec un tiers a des fins commerciales.",
          en: "No resale, no rental, no exchange of data with a third party for commercial purposes.",
        },
        {
          fr: "Aucun entrainement de modele, statistique ou automatique, sur les donnees d'un client sans son accord ecrit.",
          en: "No model training, statistical or automated, on a customer's data without their written agreement.",
        },
        {
          fr: "Aucune publicite, aucun traceur publicitaire, aucun profilage.",
          en: "No advertising, no advertising tracker, no profiling.",
        },
      ],
    },
    {
      heading: { fr: "Qui d'autre intervient", en: "Who else is involved" },
      paragraphs: [
        {
          fr: "Trois prestataires techniques interviennent, chacun sous contrat et pour une fonction precise : l'hebergement de la base de donnees, l'hebergement du serveur applicatif, et le traitement des paiements.",
          en: "Three technical providers are involved, each under contract and for a precise function: database hosting, application server hosting, and payment processing.",
        },
        {
          fr: `La liste nominative et les pays d'hebergement sont communiques sur demande a ${CONTACT.support}, ainsi qu'a tout client qui en fait la demande dans le cadre de son propre registre de traitements.`,
          en: `The named list and hosting countries are provided on request at ${CONTACT.support}, and to any customer who asks for their own processing register.`,
        },
      ],
    },
    {
      heading: { fr: "Combien de temps", en: "How long" },
      bullets: [
        {
          fr: "Donnees de compte et de joueurs : pendant toute la duree de l'abonnement, puis trente jours apres sa fin pour permettre l'export, puis suppression definitive.",
          en: "Account and player data: for the whole subscription, then thirty days after it ends to allow export, then permanent deletion.",
        },
        {
          fr: "Journal des modifications : douze mois.",
          en: "Change log: twelve months.",
        },
        {
          fr: "Factures : la duree imposee par la loi comptable applicable.",
          en: "Invoices: the period imposed by the applicable accounting law.",
        },
      ],
    },
    {
      heading: { fr: "Comment c'est protege", en: "How it is protected" },
      bullets: [
        {
          fr: "Connexion chiffree de bout en bout, certificat renouvele automatiquement.",
          en: "End to end encrypted connection, certificate renewed automatically.",
        },
        {
          fr: "Mots de passe stockes sous forme d'empreinte, jamais en clair, et impossibles a retrouver meme depuis la base.",
          en: "Passwords stored as hashes, never in plain text, and impossible to recover even from the database.",
        },
        {
          fr: "Cloisonnement par club et par equipe : un preparateur ne voit que les equipes auxquelles il est rattache, et cette verification est refaite a chaque requete cote serveur.",
          en: "Isolation by club and by team: a coach only sees the teams they are attached to, and this check is redone on the server for every request.",
        },
        {
          fr: "Sauvegardes quotidiennes de la base de donnees.",
          en: "Daily database backups.",
        },
      ],
    },
    {
      heading: { fr: "Vos droits", en: "Your rights" },
      paragraphs: [
        {
          fr: "Vous pouvez demander l'acces a vos donnees, leur rectification, leur effacement, leur portabilite dans un format lisible, ainsi que la limitation ou l'opposition a un traitement.",
          en: "You may request access to your data, its correction, its erasure, its portability in a readable format, as well as restriction of or objection to a processing.",
        },
        {
          fr: `Une demande a ${CONTACT.support} suffit, sans formalisme. Un joueur ou son representant legal adresse sa demande a son club, qui decide, et nous l'executons.`,
          en: `A request to ${CONTACT.support} is enough, with no formality. A player or their legal guardian addresses their request to their club, which decides, and we carry it out.`,
        },
        {
          fr: "L'export complet de vos donnees est par ailleurs disponible a tout moment depuis votre compte, sans avoir a le demander.",
          en: "Full export of your data is also available at any time from your account, without asking.",
        },
      ],
    },
    {
      heading: { fr: "Cookies", en: "Cookies" },
      paragraphs: [
        {
          fr: "Deux cookies seulement, tous deux necessaires au fonctionnement : celui qui maintient votre session ouverte, et celui qui retient votre choix de langue. Aucun cookie de mesure d'audience, aucun cookie publicitaire, donc aucune banniere de consentement.",
          en: "Two cookies only, both necessary to operation: the one keeping your session open, and the one remembering your language choice. No analytics cookie, no advertising cookie, therefore no consent banner.",
        },
      ],
    },
    {
      heading: { fr: "En cas d'incident", en: "In case of a breach" },
      paragraphs: [
        {
          fr: "Toute violation de donnees susceptible d'engendrer un risque est notifiee aux clients concernes et a l'autorite competente dans les soixante douze heures suivant sa decouverte.",
          en: "Any data breach likely to create a risk is notified to the customers concerned and to the competent authority within seventy two hours of its discovery.",
        },
      ],
    },
  ];

  return (
    <LegalPage
      locale={locale}
      title={{ fr: "Confidentialite", en: "Privacy" }}
      updatedOn="2026-08-18"
      intro={{
        fr: "Cette plateforme enregistre des donnees de sante sur des sportifs, souvent mineurs. Voici precisement lesquelles, pourquoi, combien de temps, et ce que nous ne faisons pas avec.",
        en: "This platform records health data about athletes, often minors. Here is exactly which data, why, for how long, and what we do not do with it.",
      }}
      sections={sections}
    />
  );
}
