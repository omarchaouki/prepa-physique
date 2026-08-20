/**
 * Dictionnaire de la page publicitaire, en trois langues.
 *
 * ---------------------------------------------------------------------------
 * Pourquoi un dictionnaire separe de celui de l'application
 * ---------------------------------------------------------------------------
 *
 * L'application connectee parle francais et anglais. Ses sept cents cles sont
 * typees en paires, et une troisieme langue y imposerait de traduire des
 * intitules de percentiles et de tableaux de charge avant meme d'avoir vendu
 * une licence. Le rendement serait absurde.
 *
 * La page publicitaire, elle, s'adresse a des preparateurs marocains, algeriens
 * et du Golfe qui lisent l'arabe avant le francais. Un visiteur qui arrive
 * depuis une publicite decide en quelques secondes, et il decide dans sa langue.
 *
 * Les deux surfaces ont donc leur dictionnaire. Celui ci porte trois colonnes
 * et le meme filet de securite : une entree incomplete ne compile pas.
 *
 * ---------------------------------------------------------------------------
 * Ce qui n'est pas ecrit ici
 * ---------------------------------------------------------------------------
 *
 * Aucun chiffre. Le nombre de tests, de normes, de populations et les tarifs
 * sont lus dans le catalogue et dans marketing.ts, puis injectes a la place des
 * marqueurs {tests}, {norms}, {players}, {price}. Une page de vente qui annonce
 * vingt tests alors que le produit en propose vingt deux se decredibilise, et
 * personne ne pense jamais a corriger un chiffre recopie a la main.
 */

export const MARKETING_LOCALES = ["fr", "en", "ar"] as const;
export type MarketingLocale = (typeof MARKETING_LOCALES)[number];

export const MARKETING_LOCALE_LABELS: Record<MarketingLocale, string> = {
  fr: "Francais",
  en: "English",
  ar: "العربية",
};

/**
 * Etiquette courte du selecteur de langue.
 *
 * L'arabe porte « عربي » et non la seule lettre « ع » : isolee, elle se dessine
 * beaucoup plus petite que deux capitales latines et le bouton parait vide a
 * cote de FR et EN.
 */
export const MARKETING_LOCALE_SHORT: Record<MarketingLocale, string> = {
  fr: "FR",
  en: "EN",
  ar: "عربي",
};

type Entry = readonly [fr: string, en: string, ar: string];

/**
 * Sens d'ecriture.
 *
 * Il ne sert pas qu'a inverser le texte : `dir` retourne aussi l'ordre des
 * boites en flex et en grille, la position des puces, et le sens des marges
 * logiques. C'est pour cela que la mise en page de la page publicitaire
 * n'utilise que des proprietes logiques la ou le sens compte, jamais `left` ou
 * `right` en dur.
 */
export const direction = (locale: MarketingLocale): "rtl" | "ltr" =>
  locale === "ar" ? "rtl" : "ltr";

export const MARKETING_MESSAGES = {
  // --- Entete et navigation -------------------------------------------------
  "nav.skip": ["Aller au contenu", "Skip to content", "انتقل إلى المحتوى"],
  "nav.pains": ["Le quotidien", "Daily reality", "الواقع اليومي"],
  "nav.how": ["Comment ça marche", "How it works", "طريقة العمل"],
  "nav.pricing": ["Tarifs", "Pricing", "الأسعار"],
  "nav.faq": ["Questions", "Questions", "أسئلة"],
  "nav.login": ["Se connecter", "Log in", "تسجيل الدخول"],
  "nav.cta": ["Commencer", "Get started", "ابدأ الآن"],
  "nav.language": ["Changer de langue", "Change language", "تغيير اللغة"],

  // --- Hero -----------------------------------------------------------------
  "hero.kicker": [
    "Préparation physique football",
    "Football physical preparation",
    "الإعداد البدني في كرة القدم",
  ],
  "hero.title": [
    "Vos tests physiques deviennent des décisions,",
    "Turn your fitness testing into decisions,",
    "اختباراتك البدنية تتحوّل إلى قرارات،",
  ],
  "hero.titleAccent": ["le jour même", "the same day", "في اليوم نفسه"],
  "hero.body": [
    "Vous saisissez les valeurs brutes. La plateforme calcule, situe chaque joueur face à {norms} lignes de normes publiées, et dit quoi travailler.",
    "You enter the raw values. The platform computes, places every player against {norms} rows of published norms, and says what to work on.",
    "تُدخل القيم الخام. تحتسب المنصة، وتضع كل لاعب أمام {norms} سطراً من المعايير المنشورة، وتحدد ما ينبغي العمل عليه.",
  ],
  "hero.cta": ["Ouvrir mon compte gratuit", "Open my free account", "افتح حسابي المجاني"],
  "hero.reassurance": [
    "Accès immédiat, sans carte bancaire. {players} joueurs gratuits, sans date de fin.",
    "Immediate access, no card required. {players} players free, with no end date.",
    "دخول فوري، دون بطاقة بنكية. {players} لاعباً مجاناً، دون تاريخ انتهاء.",
  ],

  // --- Ce qui se passe apres le formulaire ----------------------------------
  "after.point1": [
    "Compte ouvert immédiatement, sans courriel à confirmer.",
    "Account open immediately, no email to confirm.",
    "حساب مفتوح فوراً، دون رسالة تأكيد.",
  ],
  "after.point2": [
    "Un guide vous mène de l'équipe à la première passation.",
    "A guide takes you from team to first test session.",
    "دليل يرافقك من الفريق إلى أول جلسة.",
  ],
  "after.point3": [
    "Rien à installer, rien à payer, aucun appel commercial.",
    "Nothing to install, nothing to pay, no sales call.",
    "لا تثبيت، ولا دفع، ولا مكالمة مبيعات.",
  ],

  // --- Bandeau de preuve ----------------------------------------------------
  "proof.tests": ["tests références", "referenced tests", "اختباراً موثقاً"],
  "proof.batteries": ["batteries prêtes", "ready made batteries", "بطارية جاهزة"],
  "proof.norms": ["lignes de normes", "rows of norms", "سطر من المعايير"],
  "proof.populations": ["populations de référence", "reference populations", "فئة مرجعية"],
  "proof.note": [
    "Chiffres comptes dans le catalogue de la plateforme, pas arrondis pour l'effet.",
    "Figures counted from the platform catalogue, not rounded up for effect.",
    "أرقام محسوبة من كتالوج المنصة، دون تدوير لأغراض التأثير.",
  ],

  // --- Points de douleur ----------------------------------------------------
  "pains.eyebrow": ["Le quotidien", "Daily reality", "الواقع اليومي"],
  "pains.title": [
    "Ce que vous faites à la main, et qui n'a plus à l'être",
    "The work you still do by hand, and no longer have to",
    "ما تقوم به يدوياً، ولم يعد هناك داع لذلك",
  ],
  "pain1.title": ["Le tableur du dimanche soir", "The Sunday night spreadsheet", "جدول البيانات ليلة الأحد"],
  "pain1.pain": [
    "Vous rentrez du terrain avec une feuille griffonnée, et la soirée passe à recopier.",
    "You come back from the pitch with a scribbled sheet, and the evening goes into retyping.",
    "تعود من الملعب بورقة مليئة بالخربشات، فتذهب الأمسية في إعادة النسخ.",
  ],
  "pain1.fix": [
    "Vous saisissez une fois. Les {tests} tests sont calculés par le serveur.",
    "You enter once. The {tests} tests are computed by the server.",
    "تُدخل مرة واحدة. الخادم يحتسب {tests} اختباراً.",
  ],

  "pain2.title": [
    "« 4,45 s sur 30 m, c'est bien ? »",
    "“4.45 s over 30 m, is that good?”",
    "«٤٫٤٥ ثانية في ٣٠ متراً، هل هذا جيد؟»",
  ],
  "pain2.pain": [
    "Sans population de référence, vous comparez vos joueurs entre eux.",
    "With no reference population, you only compare players to each other.",
    "بدون فئة مرجعية، تقارن لاعبيك ببعضهم فقط.",
  ],
  "pain2.fix": [
    "{norms} lignes de normes publiées. Chaque valeur ressort en percentile.",
    "{norms} rows of published norms. Every value comes back as a percentile.",
    "{norms} سطراً من المعايير المنشورة. كل قيمة تعود كنسبة مئوية.",
  ],

  "pain3.title": [
    "L'asymétrie découverte trop tard",
    "The asymmetry found too late",
    "فارق يُكتشف متأخراً",
  ],
  "pain3.pain": [
    "Vous notez la jambe droite et la gauche, l'écart n'est jamais calculé.",
    "You write down the right leg and the left, the gap is never computed.",
    "تدوّن الساق اليمنى واليسرى، لكن الفارق لا يُحتسب.",
  ],
  "pain3.fix": [
    "Calculé à chaque passation, comparé à un seuil clinique.",
    "Computed at every session, compared to a clinical threshold.",
    "يُحتسب في كل جلسة ويُقارن بعتبة سريرية.",
  ],

  "pain4.title": ["Le terrain n'a pas de réseau", "The pitch has no signal", "الملعب بلا تغطية"],
  "pain4.pain": [
    "Vous notez sur papier, vous retapez le soir, des lignes se perdent.",
    "You write on paper, retype in the evening, and rows go missing.",
    "تكتب على الورق وتعيد الإدخال مساءً، فتضيع أسطر.",
  ],
  "pain4.fix": [
    "Saisie hors ligne sur téléphone, remontée automatique, aucun doublon.",
    "Offline entry on a phone, automatic sync, no duplicates.",
    "إدخال دون اتصال من الهاتف، ورفع تلقائي، دون تكرار.",
  ],

  "pain5.title": ["« Qui est prêt cette semaine ? »", "“Who is ready this week?”", "«من الجاهز هذا الأسبوع؟»"],
  "pain5.pain": [
    "La réponse est quelque part dans vos fichiers, mais pas en un seul écran.",
    "The answer is somewhere in your files, just not on a single screen.",
    "الجواب في مكان ما بين ملفاتك، لكن ليس في شاشة واحدة.",
  ],
  "pain5.fix": [
    "Statut, dernière passation et alertes, équipe par équipe.",
    "Status, last session and alerts, team by team.",
    "الحالة وآخر جلسة والتنبيهات، فريقاً بفريق.",
  ],

  // --- Comment ca marche ----------------------------------------------------
  "how.eyebrow": ["Le parcours", "The path", "المسار"],
  "how.title": [
    "Quatre étapes, de la première séance au plan d'entraînement",
    "Four steps, from the first session to the training plan",
    "أربع خطوات، من الحصة الأولى إلى خطة التدريب",
  ],
  "how.step1Title": ["Votre effectif", "Your squad", "مجموعتك"],
  "how.step1Body": [
    "Une équipe, vos joueurs, leur poste et leur date de naissance. C'est tout ce qu'il faut pour commencer.",
    "One team, your players, their position and date of birth. That is all it takes to start.",
    "فريق واحد، ولاعبوك، ومركز كل منهم وتاريخ ميلاده. هذا كل ما يلزم للبدء.",
  ],
  "how.step2Title": ["Votre batterie", "Your battery", "بطاريتك"],
  "how.step2Body": [
    "Choisissez une batterie prête ou composez la votre. Le protocole de chaque test est affiche sur l'écran de saisie.",
    "Pick a ready made battery or build your own. Each test protocol is shown on the entry screen.",
    "اختر بطارية جاهزة أو ركّب بطاريتك. يظهر بروتوكول كل اختبار على شاشة الإدخال.",
  ],
  "how.step3Title": ["La passation", "The session", "الجلسة"],
  "how.step3Body": [
    "Saisie sur téléphone au bord du terrain, hors ligne si besoin, ou au clavier après coup. Les métriques dérivées sont calculees à l'arrivée.",
    "Enter on a phone pitch side, offline if needed, or on a keyboard afterwards. Derived metrics are computed on arrival.",
    "أدخِل البيانات من الهاتف على حافة الملعب، دون اتصال عند الحاجة، أو لاحقاً من لوحة المفاتيح. وتُحتسب المؤشرات المشتقة عند الوصول.",
  ],
  "how.step4Title": ["Le profil et la suite", "The profile and what follows", "الملف وما يليه"],
  "how.step4Body": [
    "Chaque joueur sort avec ses percentiles, ses asymétries, son évolution, et des recommandations rattachees aux points faibles réellement mesures.",
    "Every player comes out with percentiles, asymmetries, progression, and recommendations tied to the weaknesses actually measured.",
    "يخرج كل لاعب بنسبه المئوية وفروقه وتطوّره، وبتوصيات مرتبطة بنقاط الضعف المقيسة فعلاً.",
  ],

  // --- Le produit -----------------------------------------------------------
  "product.altBrief": [
    "Préparateur physique présentant les résultats à son groupe sur une tablette",
    "Fitness coach presenting results to the squad on a tablet",
    "معدّ بدني يعرض النتائج على مجموعته من خلال لوحي",
  ],
  "product.altTablette": [
    "Trois membres du staff examinant des données au bord du terrain",
    "Three staff members reviewing data pitch side",
    "ثلاثة من الطاقم يراجعون البيانات بجانب الملعب",
  ],
  "product.altPlayers": [
    "Préparateur physique commentant des résultats avec deux joueurs",
    "Fitness coach going through results with two players",
    "معدّ بدني يشرح النتائج للاعبين",
  ],

  // --- Science --------------------------------------------------------------
  "science.eyebrow": ["La méthode", "The method", "المنهج"],
  "science.title": [
    "Chaque calcul porte le nom de qui l'a publié",
    "Every calculation carries the name of who published it",
    "كل حساب يحمل اسم من نشره",
  ],
  "science.body": [
    "Chaque test cité sa référence, et un contrôle automatique compare les résultats aux valeurs publiées avant chaque mise en production.",
    "Every test cites its reference, and an automated check compares results to the published values before every release.",
    "كل اختبار يذكر مرجعه، ويقارن فحص آلي النتائج بالقيم المنشورة قبل كل إصدار.",
  ],
  "science.authors": [
    "Auteurs cités par le catalogue",
    "Authors cited by the catalogue",
    "الباحثون المذكورون في الكتالوج",
  ],

  // --- Tarifs ---------------------------------------------------------------
  "pricing.eyebrow": ["Tarifs", "Pricing", "الأسعار"],
  "pricing.title": [
    "Gratuit tant que votre effectif ne déborde pas",
    "Free until you outgrow it",
    "مجاني إلى أن تكبر مجموعتك",
  ],
  "pricing.body": [
    "Le palier gratuit n'est pas un essai. Il n'a pas de date de fin. Vous ne payez que le jour où votre effectif dépasse {players} joueurs.",
    "The free tier is not a trial. It has no end date. You only pay the day your squad passes {players} players.",
    "المستوى المجاني ليس فترة تجريبية، وليس له تاريخ انتهاء. لا تدفع إلا يوم تتجاوز مجموعتك {players} لاعباً.",
  ],
  "pricing.freeName": ["Gratuit", "Free", "مجاني"],
  "pricing.freeLine": [
    "{players} joueurs, {teams} équipe, tous les tests, toutes les normes.",
    "{players} players, {teams} team, every test, every norm.",
    "{players} لاعباً، و{teams} فريق، وكل الاختبارات وكل المعايير.",
  ],
  "pricing.paidName": ["Au delà", "Beyond that", "بعد ذلك"],
  "pricing.paidLine": [
    "À partir de {price} par mois.",
    "From {price} per month.",
    "ابتداءً من {price} شهرياً.",
  ],
  "pricing.note": [
    "Sans engagement, résiliable à tout moment. La grille complete est sur le site.",
    "No commitment, cancel at any time. The full table is on the main site.",
    "دون التزام، ويمكن الإلغاء في أي وقت. الجدول الكامل على الموقع الرئيسي.",
  ],

  // --- Avis -----------------------------------------------------------------
  "reviews.eyebrow": ["Sur le terrain", "On the pitch", "في الميدان"],
  "reviews.title": [
    "Ce qu'en disent des préparateurs",
    "What coaches say about it",
    "ما يقوله المعدّون البدنيون",
  ],

  // --- Questions ------------------------------------------------------------
  "faq.eyebrow": ["Objections", "Objections", "اعتراضات"],
  "faq.title": [
    "Ce qu'on nous demande avant de s'inscrire",
    "What people ask before signing up",
    "ما يُسأل عنه قبل التسجيل",
  ],

  "faq1.q": [
    "Faut il une carte bancaire pour commencer ?",
    "Do I need a card to start?",
    "هل أحتاج بطاقة بنكية للبدء؟",
  ],
  "faq1.a": [
    "Non. Le formulaire de cette page ouvre un compte au palier gratuit, sans moyen de paiement et sans date de fin.",
    "No. The form on this page opens a free tier account, with no payment method and no end date.",
    "لا. نموذج هذه الصفحة يفتح حساباً في المستوى المجاني، دون وسيلة دفع ودون تاريخ انتهاء.",
  ],

  "faq2.q": [
    "Combien de temps avant de pouvoir tester ?",
    "How long before I can run a test?",
    "كم من الوقت قبل أن أتمكن من إجراء اختبار؟",
  ],
  "faq2.a": [
    "Le compte est ouvert immédiatement, sans confirmation par courriel. Le temps de saisir une équipe et quelques joueurs, vous enregistrez une passation le jour même.",
    "The account opens immediately, with no email confirmation. Once a team and a few players are in, you record a session the same day.",
    "يُفتح الحساب فوراً، دون تأكيد بالبريد. وبمجرد إدخال فريق وبضعة لاعبين، تسجّل جلسة في اليوم نفسه.",
  ],


  "faq3.q": [
    "À qui appartiennent les données de mes joueurs ?",
    "Who owns my players' data?",
    "لمن تعود بيانات لاعبيّ؟",
  ],
  "faq3.a": [
    "Au club. Nous ne sommes que sous traitant : nous traitons ces données sur vos instructions, pour vous rendre le service, et vous pouvez en demander l'export ou la suppression. Le détail est dans la politique de confidentialité.",
    "The club. We are only a processor: we handle that data on your instructions, to deliver the service, and you can request export or deletion. The detail is in the privacy policy.",
    "للنادي. نحن مجرد معالج للبيانات: نتعامل معها بناءً على تعليماتك لتقديم الخدمة، ويمكنك طلب تصديرها أو حذفها. التفاصيل في سياسة الخصوصية.",
  ],

  "faq4.q": [
    "Beaucoup de mes joueurs sont mineurs.",
    "Many of my players are minors.",
    "كثير من لاعبيّ قاصرون.",
  ],
  "faq4.a": [
    "Les résultats de tests et les mesures corporelles sont des données de santé, et elles sont traitées comme telles : accès limite aux membres du staff explicitement rattaches à l'équipe, et journal de chaque modification. Le consentement des représentants légaux reste de la responsabilité du club.",
    "Test results and body measurements are health data, and they are handled as such: access limited to staff explicitly attached to the team, and a log of every change. Obtaining guardian consent remains the club's responsibility.",
    "نتائج الاختبارات والقياسات الجسدية بيانات صحية، وتُعامَل على هذا الأساس: وصول محصور بأعضاء الطاقم المرتبطين صراحةً بالفريق، وسجل لكل تعديل. أما الحصول على موافقة الأولياء فيبقى مسؤولية النادي.",
  ],

  "faq5.q": [
    "En quelle langue fonctionne l'application ?",
    "What language does the app run in?",
    "بأي لغة يعمل التطبيق؟",
  ],
  "faq5.a": [
    "Cette page existe en français, en anglais et en arabe. L'application elle même est en français et en anglais : l'arabe y viendra, il n'y est pas encore. Nous préférons le dire avant que vous ne créiez un compte.",
    "This page exists in French, English and Arabic. The app itself is in French and English: Arabic is planned, it is not there yet. We would rather say so before you create an account.",
    "هذه الصفحة متاحة بالفرنسية والإنجليزية والعربية. أما التطبيق نفسه فبالفرنسية والإنجليزية: العربية مُخطط لها ولم تصل بعد. نفضّل قول ذلك قبل أن تنشئ حساباً.",
  ],


  "faq6.q": [
    "Est ce qu'un commercial va me rappeler ?",
    "Will a salesperson call me?",
    "هل سيتصل بي مندوب مبيعات؟",
  ],
  "faq6.a": [
    "Non. Ce formulaire crée un compte, il ne prend pas de rendez vous. Si vous voulez parler à quelqu'un, l'adresse de contact est en bas de page et la réponse arrive sous {hours} heures ouvrées.",
    "No. This form creates an account, it does not book a meeting. If you do want to talk to someone, the contact address is at the foot of the page and we answer within {hours} working hours.",
    "لا. هذا النموذج ينشئ حساباً ولا يحجز موعداً. وإن أردت التحدث إلى أحد، فعنوان التواصل أسفل الصفحة والرد يصل خلال {hours} ساعة عمل.",
  ],

  // --- Appel final ----------------------------------------------------------
  "final.title": [
    "La prochaine passation peut déjà être dans la plateforme",
    "Your next test session can already live in the platform",
    "يمكن لجلستك القادمة أن تكون في المنصة منذ الآن",
  ],
  "final.body": [
    "Ouvrir le compte prend moins longtemps que de mettre en forme un tableau.",
    "Opening the account takes less time than formatting one spreadsheet.",
    "فتح الحساب يستغرق وقتاً أقل من تنسيق جدول واحد.",
  ],

  // --- Pied de page ---------------------------------------------------------
  "footer.tagline": [
    "Préparation physique football : tests, profils, analyses et recommandations.",
    "Football physical preparation: testing, profiles, analyses and recommendations.",
    "الإعداد البدني في كرة القدم: اختبارات وملفات وتحليلات وتوصيات.",
  ],
  "footer.legal": ["Informations légales", "Legal", "معلومات قانونية"],
  "footer.terms": ["Conditions générales", "Terms of service", "الشروط العامة"],
  "footer.privacy": ["Confidentialité", "Privacy", "الخصوصية"],
  "footer.refund": ["Remboursement", "Refunds", "الاسترجاع"],
  "footer.company": ["Mentions légales", "Company details", "بيانات الشركة"],
  "footer.contact": ["Contact", "Contact", "تواصل"],
  // Enonce du bouton flottant, qui n'a pas de texte visible. Il dit ou l'on
  // arrive et non ce que l'on voit, parce qu'un lecteur d'ecran annonce un lien
  // par sa destination.
  "contact.whatsapp": [
    "Nous écrire sur WhatsApp",
    "Message us on WhatsApp",
    "راسلنا على واتساب",
  ],
  "footer.home": ["Site complet", "Full site", "الموقع الكامل"],
  "footer.rights": ["Tous droits réservés.", "All rights reserved.", "جميع الحقوق محفوظة."],

  // --- Formulaire d'inscription --------------------------------------------
  "signup.title": ["Ouvrez votre compte gratuit", "Open your free account", "افتح حسابك المجاني"],
  "signup.subtitle": [
    "Trois étapes, moins de deux minutes. Aucun moyen de paiement demandé.",
    "Three steps, under two minutes. No payment method asked.",
    "ثلاث خطوات، أقل من دقيقتين. دون أي وسيلة دفع.",
  ],
  "signup.step1": ["Le club", "The club", "النادي"],
  "signup.step2": ["Vous", "You", "أنت"],
  "signup.step3": ["Votre accès", "Your access", "دخولك"],
  "signup.stepPosition": ["Étape {current} sur {total}", "Step {current} of {total}", "الخطوة {current} من {total}"],
  "signup.club": ["Nom du club", "Club name", "اسم النادي"],
  "signup.clubHint": [
    "Le nom que verront vos collègues dans l'application.",
    "The name your colleagues will see inside the app.",
    "الاسم الذي سيراه زملاؤك داخل التطبيق.",
  ],
  "signup.country": ["Pays", "Country", "البلد"],
  "signup.countryHint": [
    "Sert à proposer les bonnes populations de référence.",
    "Used to suggest the right reference populations.",
    "يُستعمل لاقتراح الفئات المرجعية المناسبة.",
  ],
  "signup.countryPlaceholder": ["Tapez les premières lettres", "Type the first letters", "اكتب الأحرف الأولى"],
  "signup.countryEmpty": ["Aucun pays trouve", "No country found", "لم يُعثر على بلد"],
  "signup.countryCount": ["{count} pays proposés", "{count} countries suggested", "{count} بلداً مقترحاً"],
  "signup.name": ["Votre nom", "Your name", "اسمك"],
  "signup.jobTitle": ["Votre fonction", "Your role", "وظيفتك"],
  "signup.jobTitleOther": ["Précisez", "Please specify", "حدّد"],
  "signup.email": ["Adresse de courriel", "Email address", "البريد الإلكتروني"],
  "signup.emailHint": ["C'est aussi votre identifiant de connexion.", "This is also your login.", "هذا أيضاً معرّف دخولك."],
  "signup.phone": ["Téléphone", "Phone", "الهاتف"],
  "signup.phoneHint": [
    "Uniquement si vous souhaitez être aide au démarrage.",
    "Only if you would like help getting started.",
    "فقط إن رغبت في مساعدة عند البدء.",
  ],
  "signup.optional": ["optionnel", "optional", "اختياري"],
  "signup.password": ["Mot de passe", "Password", "كلمة المرور"],
  "signup.passwordHint": ["Dix caractères au minimum.", "Ten characters minimum.", "عشرة أحرف على الأقل."],
  "signup.confirm": ["Confirmez le mot de passe", "Confirm the password", "أكّد كلمة المرور"],
  "signup.mismatch": [
    "Les deux mots de passe ne correspondent pas",
    "The two passwords do not match",
    "كلمتا المرور غير متطابقتين",
  ],
  "signup.showPassword": ["Afficher le mot de passe", "Show password", "إظهار كلمة المرور"],
  "signup.hidePassword": ["Masquer le mot de passe", "Hide password", "إخفاء كلمة المرور"],
  "signup.recap": ["Récapitulatif", "Summary", "ملخص"],
  "signup.back": ["Retour", "Back", "رجوع"],
  "signup.next": ["Continuer", "Continue", "متابعة"],
  "signup.submit": ["Créer mon compte", "Create my account", "أنشئ حسابي"],
  "signup.pending": ["Création en cours", "Creating", "جارٍ الإنشاء"],
  "signup.required": ["obligatoire", "required", "إلزامي"],
  "signup.none": ["Choisir", "Choose", "اختر"],
  "signup.draftRestored": [
    "Vos réponses précédentes ont été retrouvées.",
    "Your previous answers were restored.",
    "تمّت استعادة إجاباتك السابقة.",
  ],
  "signup.included1": [
    "{players} joueurs et {teams} équipe, sans date de fin",
    "{players} players and {teams} team, with no end date",
    "{players} لاعباً و{teams} فريق، دون تاريخ انتهاء",
  ],
  "signup.included2": [
    "Les {tests} tests et les {norms} lignes de normes, sans restriction",
    "All {tests} tests and {norms} rows of norms, with no restriction",
    "كل الاختبارات البالغ عددها {tests} و{norms} سطراً من المعايير، دون قيود",
  ],
  "signup.included3": [
    "L'application mobile et la saisie hors ligne",
    "The mobile app and offline entry",
    "تطبيق الهاتف والإدخال دون اتصال",
  ],
  "signup.terms": [
    "En créant un compte vous acceptez les conditions générales et la politique de confidentialité.",
    "By creating an account you accept the terms of service and the privacy policy.",
    "بإنشائك حساباً فإنك تقبل الشروط العامة وسياسة الخصوصية.",
  ],
  "signup.haveAccount": ["Vous avez déjà un compte ?", "Already have an account?", "هل لديك حساب بالفعل؟"],
  "signup.signIn": ["Se connecter", "Log in", "سجّل الدخول"],

  // --- Fonctions ------------------------------------------------------------
  "job.COACH": ["Entraîneur", "Head coach", "مدرب"],
  "job.STRENGTH_COACH": ["Préparateur physique", "Strength and conditioning coach", "معدّ بدني"],
  "job.DIRECTOR": ["Directeur sportif", "Sporting director", "مدير رياضي"],
  "job.ANALYST": ["Analyste", "Performance analyst", "محلل أداء"],
  "job.MEDICAL": ["Staff médical", "Medical staff", "الطاقم الطبي"],
  "job.OTHER": ["Autre", "Other", "أخرى"],

  // --- Erreurs renvoyees par l'action serveur -------------------------------
  //
  // L'action ne renvoie que des cles. Une phrase ecrite en dur dans une action
  // serveur aurait toujours ignore deux des trois langues de cette page.
  "error.rateLimit": [
    "Trop d'inscriptions depuis ce réseau. Réessayez dans une heure.",
    "Too many sign ups from this network. Try again in an hour.",
    "عدد كبير من التسجيلات من هذه الشبكة. حاول بعد ساعة.",
  ],
  "error.disposable": [
    "Cette adresse est temporaire. Utilisez l'adresse de votre club.",
    "That address is temporary. Use your club address.",
    "هذا العنوان مؤقت. استعمل عنوان ناديك.",
  ],
  "error.emailTaken": [
    "Impossible de créer un compte avec cette adresse. Essayez de vous connecter.",
    "This address cannot be used to create an account. Try logging in.",
    "لا يمكن إنشاء حساب بهذا العنوان. جرّب تسجيل الدخول.",
  ],
  "error.clubRequired": ["Le nom du club est requis", "The club name is required", "اسم النادي مطلوب"],
  "error.nameRequired": ["Votre nom est requis", "Your name is required", "اسمك مطلوب"],
  "error.emailInvalid": ["Adresse de courriel invalide", "Invalid email address", "بريد إلكتروني غير صالح"],
  "error.passwordShort": [
    "Le mot de passe doit contenir au moins dix caractères",
    "The password must be at least ten characters",
    "يجب أن تتكون كلمة المرور من عشرة أحرف على الأقل",
  ],
  "error.passwordMismatch": [
    "Les deux mots de passe ne correspondent pas",
    "The two passwords do not match",
    "كلمتا المرور غير متطابقتين",
  ],
  "error.rejected": ["Inscription refusée", "Sign up refused", "تم رفض التسجيل"],
  "error.invalid": ["Données invalides", "Invalid data", "بيانات غير صالحة"],

  // --- Banniere de consentement --------------------------------------------
  "consent.title": ["Mesure d'audience", "Audience measurement", "قياس الجمهور"],
  "consent.body": [
    "Nous aimerions déposer des cookies de mesure, dont ceux de Meta et de Microsoft Clarity, pour savoir quelles publicités amènent des inscriptions et où les visiteurs abandonnent. Refuser ne change rien à ce que vous pouvez faire sur ce site.",
    "We would like to set measurement cookies, including Meta's and Microsoft Clarity's, to learn which ads bring sign ups and where visitors give up. Declining changes nothing about what you can do on this site.",
    "نودّ وضع ملفات تعريف ارتباط للقياس، منها ملفات ميتا ومايكروسوفت كلاريتي، لمعرفة أي الإعلانات تجلب تسجيلات وأين ينسحب الزوار. الرفض لا يغيّر شيئاً ممّا يمكنك فعله في هذا الموقع.",
  ],
  "consent.accept": ["Accepter", "Accept", "أوافق"],
  "consent.decline": ["Refuser", "Decline", "أرفض"],
  "consent.more": ["En savoir plus", "Learn more", "اعرف المزيد"],
} as const satisfies Record<string, Entry>;

export type MarketingKey = keyof typeof MARKETING_MESSAGES;

const INDEX: Record<MarketingLocale, 0 | 1 | 2> = { fr: 0, en: 1, ar: 2 };

/** Remplace les marqueurs {nom} d'un texte par leurs valeurs. */
export const fill = (text: string, values: Record<string, string | number>): string =>
  Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    text,
  );

export type MarketingTranslator = (
  key: MarketingKey,
  values?: Record<string, string | number>,
) => string;

export const createMarketingTranslator =
  (locale: MarketingLocale): MarketingTranslator =>
  (key, values) => {
    const entry = MARKETING_MESSAGES[key] as Entry | undefined;
    if (!entry) return key;
    const text = entry[INDEX[locale]];
    return values ? fill(text, values) : text;
  };
