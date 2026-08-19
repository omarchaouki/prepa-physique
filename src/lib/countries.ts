/**
 * Liste des pays, produite par Intl et non recopiee a la main.
 *
 * Les noms viennent de la base CLDR du systeme, ce qui evite les fautes
 * d'orthographe, les oublis et les traductions approximatives. Le fichier est
 * fige ici plutot que calcule a l'execution : une liste de pays n'a pas a
 * dependre de la version du moteur qui sert la page.
 *
 * Regenerer avec : node scripts/generate-countries.mjs
 */

export interface Country {
  /** Code ISO 3166 a deux lettres. C'est lui qui est enregistre. */
  code: string;
  fr: string;
  en: string;
}

export const COUNTRIES: Country[] = [
  { code: "AF", fr: "Afghanistan", en: "Afghanistan" },
  { code: "ZA", fr: "Afrique du Sud", en: "South Africa" },
  { code: "AL", fr: "Albanie", en: "Albania" },
  { code: "DZ", fr: "Algérie", en: "Algeria" },
  { code: "DE", fr: "Allemagne", en: "Germany" },
  { code: "AD", fr: "Andorre", en: "Andorra" },
  { code: "AO", fr: "Angola", en: "Angola" },
  { code: "AG", fr: "Antigua-et-Barbuda", en: "Antigua & Barbuda" },
  { code: "SA", fr: "Arabie saoudite", en: "Saudi Arabia" },
  { code: "AR", fr: "Argentine", en: "Argentina" },
  { code: "AM", fr: "Arménie", en: "Armenia" },
  { code: "AU", fr: "Australie", en: "Australia" },
  { code: "AT", fr: "Autriche", en: "Austria" },
  { code: "AZ", fr: "Azerbaïdjan", en: "Azerbaijan" },
  { code: "BS", fr: "Bahamas", en: "Bahamas" },
  { code: "BH", fr: "Bahreïn", en: "Bahrain" },
  { code: "BD", fr: "Bangladesh", en: "Bangladesh" },
  { code: "BB", fr: "Barbade", en: "Barbados" },
  { code: "BE", fr: "Belgique", en: "Belgium" },
  { code: "BZ", fr: "Belize", en: "Belize" },
  { code: "BJ", fr: "Bénin", en: "Benin" },
  { code: "BT", fr: "Bhoutan", en: "Bhutan" },
  { code: "BY", fr: "Biélorussie", en: "Belarus" },
  { code: "BO", fr: "Bolivie", en: "Bolivia" },
  { code: "BA", fr: "Bosnie-Herzégovine", en: "Bosnia & Herzegovina" },
  { code: "BW", fr: "Botswana", en: "Botswana" },
  { code: "BR", fr: "Brésil", en: "Brazil" },
  { code: "BN", fr: "Brunei", en: "Brunei" },
  { code: "BG", fr: "Bulgarie", en: "Bulgaria" },
  { code: "BF", fr: "Burkina Faso", en: "Burkina Faso" },
  { code: "BI", fr: "Burundi", en: "Burundi" },
  { code: "KH", fr: "Cambodge", en: "Cambodia" },
  { code: "CM", fr: "Cameroun", en: "Cameroon" },
  { code: "CA", fr: "Canada", en: "Canada" },
  { code: "CV", fr: "Cap-Vert", en: "Cape Verde" },
  { code: "CL", fr: "Chili", en: "Chile" },
  { code: "CN", fr: "Chine", en: "China" },
  { code: "CY", fr: "Chypre", en: "Cyprus" },
  { code: "CO", fr: "Colombie", en: "Colombia" },
  { code: "KM", fr: "Comores", en: "Comoros" },
  { code: "CG", fr: "Congo-Brazzaville", en: "Congo - Brazzaville" },
  { code: "CD", fr: "Congo-Kinshasa", en: "Congo - Kinshasa" },
  { code: "KP", fr: "Corée du Nord", en: "North Korea" },
  { code: "KR", fr: "Corée du Sud", en: "South Korea" },
  { code: "CR", fr: "Costa Rica", en: "Costa Rica" },
  { code: "CI", fr: "Côte d’Ivoire", en: "Côte d’Ivoire" },
  { code: "HR", fr: "Croatie", en: "Croatia" },
  { code: "CU", fr: "Cuba", en: "Cuba" },
  { code: "DK", fr: "Danemark", en: "Denmark" },
  { code: "DJ", fr: "Djibouti", en: "Djibouti" },
  { code: "DM", fr: "Dominique", en: "Dominica" },
  { code: "EG", fr: "Égypte", en: "Egypt" },
  { code: "AE", fr: "Émirats arabes unis", en: "United Arab Emirates" },
  { code: "EC", fr: "Équateur", en: "Ecuador" },
  { code: "ER", fr: "Érythrée", en: "Eritrea" },
  { code: "ES", fr: "Espagne", en: "Spain" },
  { code: "EE", fr: "Estonie", en: "Estonia" },
  { code: "SZ", fr: "Eswatini", en: "Eswatini" },
  { code: "VA", fr: "État de la Cité du Vatican", en: "Vatican City" },
  { code: "US", fr: "États-Unis", en: "United States" },
  { code: "ET", fr: "Éthiopie", en: "Ethiopia" },
  { code: "FJ", fr: "Fidji", en: "Fiji" },
  { code: "FI", fr: "Finlande", en: "Finland" },
  { code: "FR", fr: "France", en: "France" },
  { code: "GA", fr: "Gabon", en: "Gabon" },
  { code: "GM", fr: "Gambie", en: "Gambia" },
  { code: "GE", fr: "Géorgie", en: "Georgia" },
  { code: "GH", fr: "Ghana", en: "Ghana" },
  { code: "GR", fr: "Grèce", en: "Greece" },
  { code: "GD", fr: "Grenade", en: "Grenada" },
  { code: "GT", fr: "Guatemala", en: "Guatemala" },
  { code: "GN", fr: "Guinée", en: "Guinea" },
  { code: "GQ", fr: "Guinée équatoriale", en: "Equatorial Guinea" },
  { code: "GW", fr: "Guinée-Bissau", en: "Guinea-Bissau" },
  { code: "GY", fr: "Guyana", en: "Guyana" },
  { code: "HT", fr: "Haïti", en: "Haiti" },
  { code: "HN", fr: "Honduras", en: "Honduras" },
  { code: "HU", fr: "Hongrie", en: "Hungary" },
  { code: "SB", fr: "Îles Salomon", en: "Solomon Islands" },
  { code: "IN", fr: "Inde", en: "India" },
  { code: "ID", fr: "Indonésie", en: "Indonesia" },
  { code: "IQ", fr: "Irak", en: "Iraq" },
  { code: "IR", fr: "Iran", en: "Iran" },
  { code: "IE", fr: "Irlande", en: "Ireland" },
  { code: "IS", fr: "Islande", en: "Iceland" },
  { code: "IL", fr: "Israël", en: "Israel" },
  { code: "IT", fr: "Italie", en: "Italy" },
  { code: "JM", fr: "Jamaïque", en: "Jamaica" },
  { code: "JP", fr: "Japon", en: "Japan" },
  { code: "JO", fr: "Jordanie", en: "Jordan" },
  { code: "KZ", fr: "Kazakhstan", en: "Kazakhstan" },
  { code: "KE", fr: "Kenya", en: "Kenya" },
  { code: "KG", fr: "Kirghizstan", en: "Kyrgyzstan" },
  { code: "KI", fr: "Kiribati", en: "Kiribati" },
  { code: "KW", fr: "Koweït", en: "Kuwait" },
  { code: "LA", fr: "Laos", en: "Laos" },
  { code: "LS", fr: "Lesotho", en: "Lesotho" },
  { code: "LV", fr: "Lettonie", en: "Latvia" },
  { code: "LB", fr: "Liban", en: "Lebanon" },
  { code: "LR", fr: "Liberia", en: "Liberia" },
  { code: "LY", fr: "Libye", en: "Libya" },
  { code: "LI", fr: "Liechtenstein", en: "Liechtenstein" },
  { code: "LT", fr: "Lituanie", en: "Lithuania" },
  { code: "LU", fr: "Luxembourg", en: "Luxembourg" },
  { code: "MK", fr: "Macédoine du Nord", en: "North Macedonia" },
  { code: "MG", fr: "Madagascar", en: "Madagascar" },
  { code: "MY", fr: "Malaisie", en: "Malaysia" },
  { code: "MW", fr: "Malawi", en: "Malawi" },
  { code: "MV", fr: "Maldives", en: "Maldives" },
  { code: "ML", fr: "Mali", en: "Mali" },
  { code: "MT", fr: "Malte", en: "Malta" },
  { code: "MA", fr: "Maroc", en: "Morocco" },
  { code: "MU", fr: "Maurice", en: "Mauritius" },
  { code: "MR", fr: "Mauritanie", en: "Mauritania" },
  { code: "MX", fr: "Mexique", en: "Mexico" },
  { code: "FM", fr: "Micronésie", en: "Micronesia" },
  { code: "MD", fr: "Moldavie", en: "Moldova" },
  { code: "MC", fr: "Monaco", en: "Monaco" },
  { code: "MN", fr: "Mongolie", en: "Mongolia" },
  { code: "ME", fr: "Monténégro", en: "Montenegro" },
  { code: "MZ", fr: "Mozambique", en: "Mozambique" },
  { code: "MM", fr: "Myanmar (Birmanie)", en: "Myanmar (Burma)" },
  { code: "NA", fr: "Namibie", en: "Namibia" },
  { code: "NR", fr: "Nauru", en: "Nauru" },
  { code: "NP", fr: "Népal", en: "Nepal" },
  { code: "NI", fr: "Nicaragua", en: "Nicaragua" },
  { code: "NE", fr: "Niger", en: "Niger" },
  { code: "NG", fr: "Nigeria", en: "Nigeria" },
  { code: "NO", fr: "Norvège", en: "Norway" },
  { code: "NZ", fr: "Nouvelle-Zélande", en: "New Zealand" },
  { code: "OM", fr: "Oman", en: "Oman" },
  { code: "UG", fr: "Ouganda", en: "Uganda" },
  { code: "UZ", fr: "Ouzbékistan", en: "Uzbekistan" },
  { code: "PK", fr: "Pakistan", en: "Pakistan" },
  { code: "PW", fr: "Palaos", en: "Palau" },
  { code: "PA", fr: "Panama", en: "Panama" },
  { code: "PG", fr: "Papouasie-Nouvelle-Guinée", en: "Papua New Guinea" },
  { code: "PY", fr: "Paraguay", en: "Paraguay" },
  { code: "NL", fr: "Pays-Bas", en: "Netherlands" },
  { code: "PE", fr: "Pérou", en: "Peru" },
  { code: "PH", fr: "Philippines", en: "Philippines" },
  { code: "PL", fr: "Pologne", en: "Poland" },
  { code: "PT", fr: "Portugal", en: "Portugal" },
  { code: "QA", fr: "Qatar", en: "Qatar" },
  { code: "RO", fr: "Roumanie", en: "Romania" },
  { code: "GB", fr: "Royaume-Uni", en: "United Kingdom" },
  { code: "RU", fr: "Russie", en: "Russia" },
  { code: "RW", fr: "Rwanda", en: "Rwanda" },
  { code: "KN", fr: "Saint-Christophe-et-Niévès", en: "St. Kitts & Nevis" },
  { code: "SM", fr: "Saint-Marin", en: "San Marino" },
  { code: "VC", fr: "Saint-Vincent-et-les Grenadines", en: "St. Vincent & Grenadines" },
  { code: "LC", fr: "Sainte-Lucie", en: "St. Lucia" },
  { code: "SV", fr: "Salvador", en: "El Salvador" },
  { code: "WS", fr: "Samoa", en: "Samoa" },
  { code: "ST", fr: "Sao Tomé-et-Principe", en: "São Tomé & Príncipe" },
  { code: "SN", fr: "Sénégal", en: "Senegal" },
  { code: "RS", fr: "Serbie", en: "Serbia" },
  { code: "SC", fr: "Seychelles", en: "Seychelles" },
  { code: "SL", fr: "Sierra Leone", en: "Sierra Leone" },
  { code: "SG", fr: "Singapour", en: "Singapore" },
  { code: "SK", fr: "Slovaquie", en: "Slovakia" },
  { code: "SI", fr: "Slovénie", en: "Slovenia" },
  { code: "SO", fr: "Somalie", en: "Somalia" },
  { code: "SD", fr: "Soudan", en: "Sudan" },
  { code: "SS", fr: "Soudan du Sud", en: "South Sudan" },
  { code: "LK", fr: "Sri Lanka", en: "Sri Lanka" },
  { code: "SE", fr: "Suède", en: "Sweden" },
  { code: "CH", fr: "Suisse", en: "Switzerland" },
  { code: "SR", fr: "Suriname", en: "Suriname" },
  { code: "SY", fr: "Syrie", en: "Syria" },
  { code: "TJ", fr: "Tadjikistan", en: "Tajikistan" },
  { code: "TZ", fr: "Tanzanie", en: "Tanzania" },
  { code: "TD", fr: "Tchad", en: "Chad" },
  { code: "CZ", fr: "Tchéquie", en: "Czechia" },
  { code: "PS", fr: "Territoires palestiniens", en: "Palestinian Territories" },
  { code: "TH", fr: "Thaïlande", en: "Thailand" },
  { code: "TL", fr: "Timor oriental", en: "Timor-Leste" },
  { code: "TG", fr: "Togo", en: "Togo" },
  { code: "TO", fr: "Tonga", en: "Tonga" },
  { code: "TT", fr: "Trinité-et-Tobago", en: "Trinidad & Tobago" },
  { code: "TN", fr: "Tunisie", en: "Tunisia" },
  { code: "TM", fr: "Turkménistan", en: "Turkmenistan" },
  { code: "TR", fr: "Turquie", en: "Türkiye" },
  { code: "TV", fr: "Tuvalu", en: "Tuvalu" },
  { code: "UA", fr: "Ukraine", en: "Ukraine" },
  { code: "UY", fr: "Uruguay", en: "Uruguay" },
  { code: "VU", fr: "Vanuatu", en: "Vanuatu" },
  { code: "VE", fr: "Venezuela", en: "Venezuela" },
  { code: "VN", fr: "Viêt Nam", en: "Vietnam" },
  { code: "YE", fr: "Yémen", en: "Yemen" },
  { code: "ZM", fr: "Zambie", en: "Zambia" },
  { code: "ZW", fr: "Zimbabwe", en: "Zimbabwe" },
];

/**
 * Retire les accents et met en minuscules, pour comparer une saisie a un nom.
 *
 * Sans cela, taper « algerie » ne trouve pas « Algerie » ecrit avec son accent,
 * et l'utilisateur conclut que son pays n'est pas dans la liste.
 */
const fold = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

/**
 * Cherche un pays a partir de ce qui a ete tape.
 *
 * Les correspondances en debut de nom passent avant celles au milieu :
 * quelqu'un qui tape « mar » cherche le Maroc, pas le Danemark. A egalite,
 * l'ordre alphabetique tranche, puisque la liste est deja triee.
 */
export const searchCountries = (query: string, locale: "fr" | "en", limit = 8): Country[] => {
  const needle = fold(query);
  if (!needle) return [];

  const debut: Country[] = [];
  const milieu: Country[] = [];

  for (const country of COUNTRIES) {
    const name = fold(country[locale]);
    if (name.startsWith(needle)) debut.push(country);
    else if (name.includes(needle)) milieu.push(country);
  }

  return [...debut, ...milieu].slice(0, limit);
};

export const countryByCode = (code: string): Country | undefined =>
  COUNTRIES.find((country) => country.code === code);

export const countryName = (code: string, locale: "fr" | "en"): string =>
  countryByCode(code)?.[locale] ?? code;
