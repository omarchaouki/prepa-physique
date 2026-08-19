// Liste des pays produite par Intl, pas recopiee a la main.
const codes = [
"AF","ZA","AL","DZ","DE","AD","AO","AG","SA","AR","AM","AU","AT","AZ","BS","BH","BD","BB","BE","BZ","BJ","BT","BY","BO","BA","BW","BR","BN","BG","BF","BI","KH","CM","CA","CV","CL","CN","CY","CO","KM","CG","CD","KR","KP","CR","CI","HR","CU","DK","DJ","DM","EG","AE","EC","ER","ES","EE","SZ","US","ET","FJ","FI","FR","GA","GM","GE","GH","GR","GD","GT","GN","GQ","GW","GY","HT","HN","HU","IN","ID","IQ","IR","IE","IS","IL","IT","JM","JP","JO","KZ","KE","KG","KI","KW","LA","LS","LV","LB","LR","LY","LI","LT","LU","MK","MG","MY","MW","MV","ML","MT","MA","MU","MR","MX","FM","MD","MC","MN","ME","MZ","MM","NA","NR","NP","NI","NE","NG","NO","NZ","OM","UG","UZ","PK","PW","PS","PA","PG","PY","NL","PE","PH","PL","PT","QA","RO","GB","RU","RW","KN","SM","VC","LC","SB","SV","WS","ST","SN","RS","SC","SL","SG","SK","SI","SO","SD","SS","LK","SE","CH","SR","SY","SN","TJ","TZ","TD","CZ","TH","TL","TG","TO","TT","TN","TM","TR","TV","UA","UY","VU","VA","VE","VN","YE","ZM","ZW"
];
const fr = new Intl.DisplayNames(["fr"], { type: "region" });
const en = new Intl.DisplayNames(["en"], { type: "region" });
const seen = new Set();
const rows = [];
for (const code of codes) {
  if (seen.has(code)) continue;
  seen.add(code);
  const nfr = fr.of(code), nen = en.of(code);
  if (!nfr || !nen || nfr === code) continue;
  rows.push({ code, fr: nfr, en: nen });
}
rows.sort((a, b) => a.fr.localeCompare(b.fr, "fr"));
console.log(JSON.stringify(rows));
