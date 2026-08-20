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

/**
 * Langues dans lesquelles un nom de pays existe ici.
 *
 * L'arabe s'ajoute au francais et a l'anglais parce que la page publique est
 * publiee en trois langues : un visiteur arabophone qui cherche son pays dans
 * un formulaire d'inscription doit pouvoir le taper dans sa langue. La liste
 * reste produite par Intl, jamais traduite a la main.
 */
export type CountryLocale = "fr" | "en" | "ar";

export interface Country {
  /** Code ISO 3166 a deux lettres. C'est lui qui est enregistre. */
  code: string;
  fr: string;
  en: string;
  ar: string;
}

export const COUNTRIES: Country[] = [
  { code: "AF", fr: "Afghanistan", en: "Afghanistan", ar: "أفغانستان" },
  { code: "ZA", fr: "Afrique du Sud", en: "South Africa", ar: "جنوب أفريقيا" },
  { code: "AL", fr: "Albanie", en: "Albania", ar: "ألبانيا" },
  { code: "DZ", fr: "Algérie", en: "Algeria", ar: "الجزائر" },
  { code: "DE", fr: "Allemagne", en: "Germany", ar: "ألمانيا" },
  { code: "AD", fr: "Andorre", en: "Andorra", ar: "أندورا" },
  { code: "AO", fr: "Angola", en: "Angola", ar: "أنغولا" },
  { code: "AG", fr: "Antigua-et-Barbuda", en: "Antigua & Barbuda", ar: "أنتيغوا وبربودا" },
  { code: "SA", fr: "Arabie saoudite", en: "Saudi Arabia", ar: "المملكة العربية السعودية" },
  { code: "AR", fr: "Argentine", en: "Argentina", ar: "الأرجنتين" },
  { code: "AM", fr: "Arménie", en: "Armenia", ar: "أرمينيا" },
  { code: "AU", fr: "Australie", en: "Australia", ar: "أستراليا" },
  { code: "AT", fr: "Autriche", en: "Austria", ar: "النمسا" },
  { code: "AZ", fr: "Azerbaïdjan", en: "Azerbaijan", ar: "أذربيجان" },
  { code: "BS", fr: "Bahamas", en: "Bahamas", ar: "جزر البهاما" },
  { code: "BH", fr: "Bahreïn", en: "Bahrain", ar: "البحرين" },
  { code: "BD", fr: "Bangladesh", en: "Bangladesh", ar: "بنغلاديش" },
  { code: "BB", fr: "Barbade", en: "Barbados", ar: "بربادوس" },
  { code: "BE", fr: "Belgique", en: "Belgium", ar: "بلجيكا" },
  { code: "BZ", fr: "Belize", en: "Belize", ar: "بليز" },
  { code: "BJ", fr: "Bénin", en: "Benin", ar: "بنين" },
  { code: "BT", fr: "Bhoutan", en: "Bhutan", ar: "بوتان" },
  { code: "BY", fr: "Biélorussie", en: "Belarus", ar: "بيلاروس" },
  { code: "BO", fr: "Bolivie", en: "Bolivia", ar: "بوليفيا" },
  { code: "BA", fr: "Bosnie-Herzégovine", en: "Bosnia & Herzegovina", ar: "البوسنة والهرسك" },
  { code: "BW", fr: "Botswana", en: "Botswana", ar: "بوتسوانا" },
  { code: "BR", fr: "Brésil", en: "Brazil", ar: "البرازيل" },
  { code: "BN", fr: "Brunei", en: "Brunei", ar: "بروناي" },
  { code: "BG", fr: "Bulgarie", en: "Bulgaria", ar: "بلغاريا" },
  { code: "BF", fr: "Burkina Faso", en: "Burkina Faso", ar: "بوركينا فاسو" },
  { code: "BI", fr: "Burundi", en: "Burundi", ar: "بوروندي" },
  { code: "KH", fr: "Cambodge", en: "Cambodia", ar: "كمبوديا" },
  { code: "CM", fr: "Cameroun", en: "Cameroon", ar: "الكاميرون" },
  { code: "CA", fr: "Canada", en: "Canada", ar: "كندا" },
  { code: "CV", fr: "Cap-Vert", en: "Cape Verde", ar: "الرأس الأخضر" },
  { code: "CL", fr: "Chili", en: "Chile", ar: "تشيلي" },
  { code: "CN", fr: "Chine", en: "China", ar: "الصين" },
  { code: "CY", fr: "Chypre", en: "Cyprus", ar: "قبرص" },
  { code: "CO", fr: "Colombie", en: "Colombia", ar: "كولومبيا" },
  { code: "KM", fr: "Comores", en: "Comoros", ar: "جزر القمر" },
  { code: "CG", fr: "Congo-Brazzaville", en: "Congo - Brazzaville", ar: "الكونغو - برازافيل" },
  { code: "CD", fr: "Congo-Kinshasa", en: "Congo - Kinshasa", ar: "الكونغو - كينشاسا" },
  { code: "KP", fr: "Corée du Nord", en: "North Korea", ar: "كوريا الشمالية" },
  { code: "KR", fr: "Corée du Sud", en: "South Korea", ar: "كوريا الجنوبية" },
  { code: "CR", fr: "Costa Rica", en: "Costa Rica", ar: "كوستاريكا" },
  { code: "CI", fr: "Côte d’Ivoire", en: "Côte d’Ivoire", ar: "ساحل العاج" },
  { code: "HR", fr: "Croatie", en: "Croatia", ar: "كرواتيا" },
  { code: "CU", fr: "Cuba", en: "Cuba", ar: "كوبا" },
  { code: "DK", fr: "Danemark", en: "Denmark", ar: "الدانمرك" },
  { code: "DJ", fr: "Djibouti", en: "Djibouti", ar: "جيبوتي" },
  { code: "DM", fr: "Dominique", en: "Dominica", ar: "دومينيكا" },
  { code: "EG", fr: "Égypte", en: "Egypt", ar: "مصر" },
  { code: "AE", fr: "Émirats arabes unis", en: "United Arab Emirates", ar: "الإمارات العربية المتحدة" },
  { code: "EC", fr: "Équateur", en: "Ecuador", ar: "الإكوادور" },
  { code: "ER", fr: "Érythrée", en: "Eritrea", ar: "إريتريا" },
  { code: "ES", fr: "Espagne", en: "Spain", ar: "إسبانيا" },
  { code: "EE", fr: "Estonie", en: "Estonia", ar: "إستونيا" },
  { code: "SZ", fr: "Eswatini", en: "Eswatini", ar: "إسواتيني" },
  { code: "VA", fr: "État de la Cité du Vatican", en: "Vatican City", ar: "الفاتيكان" },
  { code: "US", fr: "États-Unis", en: "United States", ar: "الولايات المتحدة" },
  { code: "ET", fr: "Éthiopie", en: "Ethiopia", ar: "إثيوبيا" },
  { code: "FJ", fr: "Fidji", en: "Fiji", ar: "فيجي" },
  { code: "FI", fr: "Finlande", en: "Finland", ar: "فنلندا" },
  { code: "FR", fr: "France", en: "France", ar: "فرنسا" },
  { code: "GA", fr: "Gabon", en: "Gabon", ar: "الغابون" },
  { code: "GM", fr: "Gambie", en: "Gambia", ar: "غامبيا" },
  { code: "GE", fr: "Géorgie", en: "Georgia", ar: "جورجيا" },
  { code: "GH", fr: "Ghana", en: "Ghana", ar: "غانا" },
  { code: "GR", fr: "Grèce", en: "Greece", ar: "اليونان" },
  { code: "GD", fr: "Grenade", en: "Grenada", ar: "غرينادا" },
  { code: "GT", fr: "Guatemala", en: "Guatemala", ar: "غواتيمالا" },
  { code: "GN", fr: "Guinée", en: "Guinea", ar: "غينيا" },
  { code: "GQ", fr: "Guinée équatoriale", en: "Equatorial Guinea", ar: "غينيا الاستوائية" },
  { code: "GW", fr: "Guinée-Bissau", en: "Guinea-Bissau", ar: "غينيا بيساو" },
  { code: "GY", fr: "Guyana", en: "Guyana", ar: "غيانا" },
  { code: "HT", fr: "Haïti", en: "Haiti", ar: "هايتي" },
  { code: "HN", fr: "Honduras", en: "Honduras", ar: "هندوراس" },
  { code: "HU", fr: "Hongrie", en: "Hungary", ar: "هنغاريا" },
  { code: "SB", fr: "Îles Salomon", en: "Solomon Islands", ar: "جزر سليمان" },
  { code: "IN", fr: "Inde", en: "India", ar: "الهند" },
  { code: "ID", fr: "Indonésie", en: "Indonesia", ar: "إندونيسيا" },
  { code: "IQ", fr: "Irak", en: "Iraq", ar: "العراق" },
  { code: "IR", fr: "Iran", en: "Iran", ar: "إيران" },
  { code: "IE", fr: "Irlande", en: "Ireland", ar: "أيرلندا" },
  { code: "IS", fr: "Islande", en: "Iceland", ar: "آيسلندا" },
  { code: "IL", fr: "Israël", en: "Israel", ar: "إسرائيل" },
  { code: "IT", fr: "Italie", en: "Italy", ar: "إيطاليا" },
  { code: "JM", fr: "Jamaïque", en: "Jamaica", ar: "جامايكا" },
  { code: "JP", fr: "Japon", en: "Japan", ar: "اليابان" },
  { code: "JO", fr: "Jordanie", en: "Jordan", ar: "الأردن" },
  { code: "KZ", fr: "Kazakhstan", en: "Kazakhstan", ar: "كازاخستان" },
  { code: "KE", fr: "Kenya", en: "Kenya", ar: "كينيا" },
  { code: "KG", fr: "Kirghizstan", en: "Kyrgyzstan", ar: "قيرغيزستان" },
  { code: "KI", fr: "Kiribati", en: "Kiribati", ar: "كيريباتي" },
  { code: "KW", fr: "Koweït", en: "Kuwait", ar: "الكويت" },
  { code: "LA", fr: "Laos", en: "Laos", ar: "لاوس" },
  { code: "LS", fr: "Lesotho", en: "Lesotho", ar: "ليسوتو" },
  { code: "LV", fr: "Lettonie", en: "Latvia", ar: "لاتفيا" },
  { code: "LB", fr: "Liban", en: "Lebanon", ar: "لبنان" },
  { code: "LR", fr: "Liberia", en: "Liberia", ar: "ليبيريا" },
  { code: "LY", fr: "Libye", en: "Libya", ar: "ليبيا" },
  { code: "LI", fr: "Liechtenstein", en: "Liechtenstein", ar: "ليختنشتاين" },
  { code: "LT", fr: "Lituanie", en: "Lithuania", ar: "ليتوانيا" },
  { code: "LU", fr: "Luxembourg", en: "Luxembourg", ar: "لوكسمبورغ" },
  { code: "MK", fr: "Macédoine du Nord", en: "North Macedonia", ar: "مقدونيا الشمالية" },
  { code: "MG", fr: "Madagascar", en: "Madagascar", ar: "مدغشقر" },
  { code: "MY", fr: "Malaisie", en: "Malaysia", ar: "ماليزيا" },
  { code: "MW", fr: "Malawi", en: "Malawi", ar: "ملاوي" },
  { code: "MV", fr: "Maldives", en: "Maldives", ar: "جزر المالديف" },
  { code: "ML", fr: "Mali", en: "Mali", ar: "مالي" },
  { code: "MT", fr: "Malte", en: "Malta", ar: "مالطا" },
  { code: "MA", fr: "Maroc", en: "Morocco", ar: "المغرب" },
  { code: "MU", fr: "Maurice", en: "Mauritius", ar: "موريشيوس" },
  { code: "MR", fr: "Mauritanie", en: "Mauritania", ar: "موريتانيا" },
  { code: "MX", fr: "Mexique", en: "Mexico", ar: "المكسيك" },
  { code: "FM", fr: "Micronésie", en: "Micronesia", ar: "ميكرونيزيا" },
  { code: "MD", fr: "Moldavie", en: "Moldova", ar: "مولدوفا" },
  { code: "MC", fr: "Monaco", en: "Monaco", ar: "موناكو" },
  { code: "MN", fr: "Mongolie", en: "Mongolia", ar: "منغوليا" },
  { code: "ME", fr: "Monténégro", en: "Montenegro", ar: "الجبل الأسود" },
  { code: "MZ", fr: "Mozambique", en: "Mozambique", ar: "موزمبيق" },
  { code: "MM", fr: "Myanmar (Birmanie)", en: "Myanmar (Burma)", ar: "ميانمار (بورما)" },
  { code: "NA", fr: "Namibie", en: "Namibia", ar: "ناميبيا" },
  { code: "NR", fr: "Nauru", en: "Nauru", ar: "ناورو" },
  { code: "NP", fr: "Népal", en: "Nepal", ar: "نيبال" },
  { code: "NI", fr: "Nicaragua", en: "Nicaragua", ar: "نيكاراغوا" },
  { code: "NE", fr: "Niger", en: "Niger", ar: "النيجر" },
  { code: "NG", fr: "Nigeria", en: "Nigeria", ar: "نيجيريا" },
  { code: "NO", fr: "Norvège", en: "Norway", ar: "النرويج" },
  { code: "NZ", fr: "Nouvelle-Zélande", en: "New Zealand", ar: "نيوزيلندا" },
  { code: "OM", fr: "Oman", en: "Oman", ar: "عُمان" },
  { code: "UG", fr: "Ouganda", en: "Uganda", ar: "أوغندا" },
  { code: "UZ", fr: "Ouzbékistan", en: "Uzbekistan", ar: "أوزبكستان" },
  { code: "PK", fr: "Pakistan", en: "Pakistan", ar: "باكستان" },
  { code: "PW", fr: "Palaos", en: "Palau", ar: "بالاو" },
  { code: "PA", fr: "Panama", en: "Panama", ar: "بنما" },
  { code: "PG", fr: "Papouasie-Nouvelle-Guinée", en: "Papua New Guinea", ar: "بابوا غينيا الجديدة" },
  { code: "PY", fr: "Paraguay", en: "Paraguay", ar: "باراغواي" },
  { code: "NL", fr: "Pays-Bas", en: "Netherlands", ar: "هولندا" },
  { code: "PE", fr: "Pérou", en: "Peru", ar: "بيرو" },
  { code: "PH", fr: "Philippines", en: "Philippines", ar: "الفلبين" },
  { code: "PL", fr: "Pologne", en: "Poland", ar: "بولندا" },
  { code: "PT", fr: "Portugal", en: "Portugal", ar: "البرتغال" },
  { code: "QA", fr: "Qatar", en: "Qatar", ar: "قطر" },
  { code: "RO", fr: "Roumanie", en: "Romania", ar: "رومانيا" },
  { code: "GB", fr: "Royaume-Uni", en: "United Kingdom", ar: "المملكة المتحدة" },
  { code: "RU", fr: "Russie", en: "Russia", ar: "روسيا" },
  { code: "RW", fr: "Rwanda", en: "Rwanda", ar: "رواندا" },
  { code: "KN", fr: "Saint-Christophe-et-Niévès", en: "St. Kitts & Nevis", ar: "سانت كيتس ونيفيس" },
  { code: "SM", fr: "Saint-Marin", en: "San Marino", ar: "سان مارينو" },
  { code: "VC", fr: "Saint-Vincent-et-les Grenadines", en: "St. Vincent & Grenadines", ar: "سانت فنسنت وجزر غرينادين" },
  { code: "LC", fr: "Sainte-Lucie", en: "St. Lucia", ar: "سانت لوسيا" },
  { code: "SV", fr: "Salvador", en: "El Salvador", ar: "السلفادور" },
  { code: "WS", fr: "Samoa", en: "Samoa", ar: "ساموا" },
  { code: "ST", fr: "Sao Tomé-et-Principe", en: "São Tomé & Príncipe", ar: "ساو تومي وبرينسيبي" },
  { code: "SN", fr: "Sénégal", en: "Senegal", ar: "السنغال" },
  { code: "RS", fr: "Serbie", en: "Serbia", ar: "صربيا" },
  { code: "SC", fr: "Seychelles", en: "Seychelles", ar: "سيشل" },
  { code: "SL", fr: "Sierra Leone", en: "Sierra Leone", ar: "سيراليون" },
  { code: "SG", fr: "Singapour", en: "Singapore", ar: "سنغافورة" },
  { code: "SK", fr: "Slovaquie", en: "Slovakia", ar: "سلوفاكيا" },
  { code: "SI", fr: "Slovénie", en: "Slovenia", ar: "سلوفينيا" },
  { code: "SO", fr: "Somalie", en: "Somalia", ar: "الصومال" },
  { code: "SD", fr: "Soudan", en: "Sudan", ar: "السودان" },
  { code: "SS", fr: "Soudan du Sud", en: "South Sudan", ar: "جنوب السودان" },
  { code: "LK", fr: "Sri Lanka", en: "Sri Lanka", ar: "سريلانكا" },
  { code: "SE", fr: "Suède", en: "Sweden", ar: "السويد" },
  { code: "CH", fr: "Suisse", en: "Switzerland", ar: "سويسرا" },
  { code: "SR", fr: "Suriname", en: "Suriname", ar: "سورينام" },
  { code: "SY", fr: "Syrie", en: "Syria", ar: "سوريا" },
  { code: "TJ", fr: "Tadjikistan", en: "Tajikistan", ar: "طاجيكستان" },
  { code: "TZ", fr: "Tanzanie", en: "Tanzania", ar: "تنزانيا" },
  { code: "TD", fr: "Tchad", en: "Chad", ar: "تشاد" },
  { code: "CZ", fr: "Tchéquie", en: "Czechia", ar: "التشيك" },
  { code: "PS", fr: "Territoires palestiniens", en: "Palestinian Territories", ar: "الأراضي الفلسطينية" },
  { code: "TH", fr: "Thaïlande", en: "Thailand", ar: "تايلاند" },
  { code: "TL", fr: "Timor oriental", en: "Timor-Leste", ar: "تيمور - ليشتي" },
  { code: "TG", fr: "Togo", en: "Togo", ar: "توغو" },
  { code: "TO", fr: "Tonga", en: "Tonga", ar: "تونغا" },
  { code: "TT", fr: "Trinité-et-Tobago", en: "Trinidad & Tobago", ar: "ترينيداد وتوباغو" },
  { code: "TN", fr: "Tunisie", en: "Tunisia", ar: "تونس" },
  { code: "TM", fr: "Turkménistan", en: "Turkmenistan", ar: "تركمانستان" },
  { code: "TR", fr: "Turquie", en: "Türkiye", ar: "تركيا" },
  { code: "TV", fr: "Tuvalu", en: "Tuvalu", ar: "توفالو" },
  { code: "UA", fr: "Ukraine", en: "Ukraine", ar: "أوكرانيا" },
  { code: "UY", fr: "Uruguay", en: "Uruguay", ar: "أورغواي" },
  { code: "VU", fr: "Vanuatu", en: "Vanuatu", ar: "فانواتو" },
  { code: "VE", fr: "Venezuela", en: "Venezuela", ar: "فنزويلا" },
  { code: "VN", fr: "Viêt Nam", en: "Vietnam", ar: "فيتنام" },
  { code: "YE", fr: "Yémen", en: "Yemen", ar: "اليمن" },
  { code: "ZM", fr: "Zambie", en: "Zambia", ar: "زامبيا" },
  { code: "ZW", fr: "Zimbabwe", en: "Zimbabwe", ar: "زيمبابوي" },
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
export const searchCountries = (query: string, locale: CountryLocale, limit = 8): Country[] => {
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

export const countryName = (code: string, locale: CountryLocale): string =>
  countryByCode(code)?.[locale] ?? code;
