import Script from "next/script";

import type { TrackingSettings } from "@/lib/tracking";

/**
 * Balises de mesure d'audience.
 *
 * ---------------------------------------------------------------------------
 * Ce qui est charge, et quand
 * ---------------------------------------------------------------------------
 *
 * Deux outils, deux usages qui ne se recouvrent pas :
 *
 *   Pixel Meta      compte les conversions d'une campagne publicitaire. Sans
 *                   lui, Facebook ne sait pas quelles publicites amenent des
 *                   inscriptions et optimise a l'aveugle.
 *   Microsoft Clarity  enregistre les parcours et les cartes de chaleur. C'est
 *                   ce qui montre a quel champ du formulaire les visiteurs
 *                   abandonnent, ce qu'aucun compteur ne dira jamais.
 *
 * Les deux partent en `afterInteractive` : jamais avant que la page soit
 * utilisable. Une balise de mesure qui retarde l'affichage d'une page de vente
 * coute plus de visiteurs qu'elle n'en explique.
 *
 * ---------------------------------------------------------------------------
 * Pourquoi l'injection est sure
 * ---------------------------------------------------------------------------
 *
 * Les deux identifiants sont interpoles dans du code executable. Ils ne
 * traversent ce composant qu'apres avoir passe les motifs de `lib/tracking.ts`,
 * qui n'acceptent que des chiffres pour l'un et des caracteres alphanumeriques
 * pour l'autre : ni guillemet, ni parenthese, ni balise ne peuvent arriver ici.
 * Ne jamais assouplir ces motifs sans deplacer la valeur hors du script.
 */
export function TrackingScripts({ facebookPixelId, clarityProjectId }: TrackingSettings) {
  return (
    <>
      {facebookPixelId ? (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${facebookPixelId}');
fbq('track','PageView');`}
          </Script>
          {/* Repli sans JavaScript. Il ne mesure qu'une page vue, ce qui suffit
              a ne pas perdre completement un visiteur dont le navigateur bloque
              les scripts tiers mais pas les images. */}
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${facebookPixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      ) : null}

      {clarityProjectId ? (
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${clarityProjectId}");`}
        </Script>
      ) : null}
    </>
  );
}
