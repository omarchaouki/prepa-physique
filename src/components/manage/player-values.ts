/**
 * Valeurs du formulaire de joueur.
 *
 * Ce module ne porte volontairement aucune directive : il est importe aussi bien
 * par la page serveur, qui construit les valeurs initiales, que par le
 * formulaire client qui les affiche.
 */

export interface PlayerFormValues {
  id?: string;
  teamId: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  sex: string;
  position: string;
  secondaryPosition: string;
  dominantFoot: string;
  jerseyNumber: string;
  heightCm: string;
  weightKg: string;
  status: string;
  email: string;
  externalId: string;
  notes: string;
}

export const emptyPlayer = (teamId: string): PlayerFormValues => ({
  teamId,
  firstName: "",
  lastName: "",
  birthDate: "",
  sex: "M",
  position: "CM",
  secondaryPosition: "",
  dominantFoot: "R",
  jerseyNumber: "",
  heightCm: "",
  weightKg: "",
  status: "ACTIVE",
  email: "",
  externalId: "",
  notes: "",
});
