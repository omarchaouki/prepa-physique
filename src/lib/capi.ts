import "server-only";

import { randomUUID } from "node:crypto";

import { prisma } from "@/lib/db";
import { hash, hashEmail, hashPhone } from "@/lib/capi-normalize";

/**
 * API Conversions de Meta, evenement Lead.
 *
 * ---------------------------------------------------------------------------
 * Pourquoi doubler le pixel
 * ---------------------------------------------------------------------------
 *
 * Le pixel du navigateur rate une part croissante des inscriptions : bloqueurs
 * de publicite, prevention du pistage de Safari, refus de cookies, onglet ferme
 * avant le chargement du script. Ce qu'il rate n'est pas seulement une ligne de
 * statistique en moins, c'est un exemple en moins pour l'algorithme de Meta,
 * qui optimise donc sur un echantillon tronque et fait monter le cout par
 * prospect.
 *
 * L'envoi depuis le serveur ne depend d'aucun de ces aleas : l'inscription a
 * reussi, donc l'evenement part.
 *
 * ---------------------------------------------------------------------------
 * La deduplication, qui est le seul vrai piege
 * ---------------------------------------------------------------------------
 *
 * Les deux chemins decrivent le meme fait. Sans precaution, Meta compte deux
 * prospects pour une inscription, et toute la campagne optimise sur des
 * chiffres doubles.
 *
 * La regle de Meta : deux evenements portant le meme `event_name` et le meme
 * `event_id` sont fusionnes. Le serveur engendre donc l'identifiant, l'envoie
 * a Meta, et le transmet au navigateur dans l'adresse de redirection ; le pixel
 * le repasse dans `eventID`. C'est la raison d'etre de `newEventId` et du
 * parametre `eid`.
 *
 * ---------------------------------------------------------------------------
 * Le jeton
 * ---------------------------------------------------------------------------
 *
 * C'est un secret, contrairement a l'identifiant du pixel qui est lisible dans
 * le code source de chaque page. Il n'est donc jamais lu par `getTracking`,
 * dont le resultat traverse la frontiere serveur vers client pour alimenter les
 * balises : il vit dans sa propre fonction, et ce fichier porte `server-only`
 * pour qu'un import depuis un composant client casse la compilation au lieu de
 * fuiter en production.
 */

/** Version de l'API Graph. A relever volontairement, jamais automatiquement. */
const GRAPH_VERSION = "v21.0";

/** Cle du jeton dans la table Setting. */
export const CAPI_TOKEN_KEY = "tracking.capiAccessToken";

/**
 * Jeton d'acces, lu en base puis dans l'environnement.
 *
 * Jamais mis en cache par `cache()` de React : il n'est demande qu'une fois par
 * inscription, et un jeton revoque doit cesser d'etre utilise immediatement.
 */
export const getCapiToken = async (): Promise<string | null> => {
  try {
    const row = await prisma.setting.findUnique({ where: { key: CAPI_TOKEN_KEY } });
    const stored = row?.value.trim();
    return stored || process.env.FACEBOOK_CAPI_TOKEN?.trim() || null;
  } catch {
    // Base injoignable : on ne mesure pas, on ne casse pas l'inscription.
    return null;
  }
};

/** Vrai si un jeton est configure, sans jamais le divulguer. */
export const hasCapiToken = async (): Promise<boolean> => (await getCapiToken()) !== null;

/** Identifiant partage par les deux chemins, pour la deduplication. */
export const newEventId = (): string => randomUUID();

export interface LeadInput {
  eventId: string;
  pixelId: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  /** Adresse de la page ou la conversion a eu lieu. */
  sourceUrl: string;
  clientIp?: string | null;
  userAgent?: string | null;
  /** Cookies poses par le pixel. Ils portent l'essentiel de l'appariement. */
  fbp?: string | null;
  fbc?: string | null;
}

/**
 * Envoie l'evenement Lead.
 *
 * Ne leve jamais et ne renvoie rien d'exploitable par l'appelant : une mesure
 * ratee ne doit sous aucun pretexte empecher une inscription d'aboutir. Les
 * echecs sont journalises cote serveur, sans le jeton.
 */
export const sendLead = async (input: LeadInput): Promise<void> => {
  const token = await getCapiToken();
  if (!token) return;

  const userData: Record<string, unknown> = {};

  const em = hashEmail(input.email);
  if (em) userData.em = [em];

  const ph = input.phone ? hashPhone(input.phone, input.country ?? null) : null;
  if (ph) userData.ph = [ph];

  if (input.country) userData.country = [hash(input.country.trim().toLowerCase())];
  if (input.clientIp) userData.client_ip_address = input.clientIp;
  if (input.userAgent) userData.client_user_agent = input.userAgent;
  if (input.fbp) userData.fbp = input.fbp;
  if (input.fbc) userData.fbc = input.fbc;

  const body = {
    data: [
      {
        event_name: "Lead",
        // En secondes, et non en millisecondes : Meta refuse l'evenement sinon,
        // avec un message qui ne dit pas lequel des deux formats il attendait.
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        action_source: "website",
        event_source_url: input.sourceUrl,
        user_data: userData,
        custom_data: { content_name: "inscription" },
      },
    ],
    // Dans le corps et non dans l'adresse : une adresse se retrouve dans les
    // journaux du serveur, du mandataire et du reseau de diffusion.
    access_token: token,
  };

  const controller = new AbortController();
  // L'inscription attend cet appel. Trois secondes est un plafond volontairement
  // bas : au dela, mieux vaut perdre la mesure que faire patienter quelqu'un
  // devant un ecran de creation de compte.
  const timer = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${input.pixelId}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      // Le jeton n'apparait pas ici : la reponse de Meta ne le contient pas, et
      // le corps envoye n'est jamais journalise.
      console.error("[capi] Lead refuse", response.status, detail.slice(0, 300));
    }
  } catch (error) {
    console.error("[capi] Lead injoignable", error instanceof Error ? error.message : error);
  } finally {
    clearTimeout(timer);
  }
};
