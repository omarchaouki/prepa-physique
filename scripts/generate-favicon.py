"""
Genere le favicon du site, a partir du meme signe que l'application.

--------------------------------------------------------------------------
Le signe
--------------------------------------------------------------------------

La ligne de pouls sur le bleu de la marque, exactement celle de `Wordmark`
dans src/components/marketing/wordmark.tsx, de la coque Capacitor et de
l'application Expo. Le trace est celui de l'icone Activity de lucide, sur une
grille de 24 unites, identique dans les trois generateurs :

    scripts/generate-android-assets.py    coque Capacitor
    mobile/scripts/generate-assets.py     application Expo
    scripts/generate-favicon.py           ce fichier, le site

Les quatre supports doivent porter le meme signe. Un onglet qui montre autre
chose que l'ecran d'accueil du telephone ne se lit pas comme deux produits,
mais comme un produit mal fini.

--------------------------------------------------------------------------
Pourquoi le signe est plus gros ici que sur le site
--------------------------------------------------------------------------

Dans l'entete du site, le glyphe occupe 53 % de sa tuile et son trait mesure
2,2 unites : a 36 pixels il respire. A 16 pixels, le meme reglage donne une
ligne de pouls large de huit pixels et epaisse d'un seul, qui ne se lit plus.

Le glyphe grossit donc quand la tuile retrecit, et le trait avec lui, jusqu'a
82 % et 4,6 unites au plus petit format. Ce n'est pas une incoherence avec la
marque, c'est la correction optique que demande toute enseigne reduite a seize
pixels : les valeurs exactes sont dans `OPTICAL`, plus bas.

--------------------------------------------------------------------------
Ce qui est produit
--------------------------------------------------------------------------

    src/app/favicon.ico       16, 32 et 48 pixels dans un seul fichier
    src/app/apple-icon.png    180 pixels, ecran d'accueil iOS
    src/app/icon.svg          ecrit a la main, voir plus bas

`icon.svg` n'est pas engendre ici : c'est un vecteur de quinze lignes, et le
faire produire par un script le rendrait plus difficile a relire qu'a ecrire.
Il est versionne tel quel.

Next.js repere ces trois fichiers a la racine de `src/app/` par convention de
nom et pose lui meme les balises `<link>`. Il n'y a rien a declarer dans
`metadata`.

Usage : python scripts/generate-favicon.py
"""

from pathlib import Path

from PIL import Image, ImageDraw

APP = Path(__file__).resolve().parent.parent / "src" / "app"

BRAND = (30, 64, 175)  # #1E40AF, --accent du theme clair
WHITE = (255, 255, 255)

# Trace de l'icone Activity de lucide, sur une grille de 24 unites.
GLYPH = [(22, 12), (18, 12), (15, 21), (9, 3), (6, 12), (2, 12)]

# Surechantillonnage : on dessine en grand puis on reduit, ce qui donne des
# bords lisses sans antialiasing natif sur les traces epais.
SS = 8

# Part de la tuile occupee par le glyphe, et epaisseur du trait sur la grille
# de 24, par taille de rendu.
#
# Ces valeurs ne sont pas proportionnelles, et c'est le coeur du reglage. A 48
# pixels le trait mesure quatre pixels et se rend fidelement. A 16 pixels le
# meme reglage donne un trait de 1,3 pixel : le reechantillonnage l'etale sur
# deux colonnes a demi opaques, et le blanc franc devient un gris delave qui ne
# se lit plus. Le trait grossit donc quand la tuile retrecit, jusqu'a occuper
# pres d'un cinquieme de la grille au plus petit format.
#
# La cle est la taille de rendu ; la valeur retenue est celle de la plus grande
# cle inferieure ou egale.
OPTICAL = {
    16: {"ratio": 0.82, "stroke": 4.6},
    32: {"ratio": 0.78, "stroke": 3.4},
    48: {"ratio": 0.74, "stroke": 2.9},
}


def optical(size: int) -> tuple[float, float]:
    """Proportion et epaisseur a retenir pour une taille de rendu."""
    key = max(k for k in OPTICAL if k <= size)
    setting = OPTICAL[key]
    return setting["ratio"], setting["stroke"]


def draw_glyph(size: int, colour, ratio: float, stroke_units: float) -> Image.Image:
    """
    Trace le signe seul, sur fond transparent.

    Le dessin se fait en niveaux de gris, puis sert de canal alpha a une image
    unie. C'est le detail qui decide de la nettete du resultat : dessiner du
    blanc directement sur un canevas transparent laisse du noir dans les pixels
    inutilises, et la reduction melange ce noir aux bords du trait, qui vire au
    gris. Un masque ne fait varier que l'opacite, jamais la teinte, donc le
    trait reste franchement blanc jusqu'a son dernier pixel.

    Le trait est compose de segments, chacun tamponne par un disque a ses deux
    extremites. `draw.line(width=...)` laisse en effet des coutures visibles
    aux angles vifs, et cette ligne en compte quatre, dont deux tres fermes au
    sommet et au creux du pic.
    """
    big = size * SS
    mask = Image.new("L", (big, big), 0)
    draw = ImageDraw.Draw(mask)

    span = big * ratio
    offset = (big - span) / 2

    def point(x: float, y: float) -> tuple[float, float]:
        return (offset + span * x / 24, offset + span * y / 24)

    stroke = span * stroke_units / 24
    radius = stroke / 2
    pixels = [point(x, y) for x, y in GLYPH]

    for index in range(len(pixels) - 1):
        draw.line([pixels[index], pixels[index + 1]], fill=255, width=int(round(stroke)))

    # Bouts et angles arrondis : sans eux, les quatre sommets de la ligne
    # apparaissent tronques a plat, ce qui se voit beaucoup a petite taille.
    for x, y in pixels:
        draw.ellipse([x - radius, y - radius, x + radius, y + radius], fill=255)

    glyph = Image.new("RGBA", (size, size), tuple(colour) + (255,))
    glyph.putalpha(mask.resize((size, size), Image.LANCZOS))
    return glyph


def tile(size: int, radius_ratio: float) -> Image.Image:
    """
    Tuile bleue aux coins arrondis, fond du signe.

    Meme principe que le glyphe : seul l'arrondi passe par un masque, le bleu
    reste uni sur toute la surface. Sans cela, les quatre coins recoltaient une
    frange sombre, tres visible a 32 pixels.
    """
    big = size * SS
    mask = Image.new("L", (big, big), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, big - 1, big - 1], radius=int(big * radius_ratio), fill=255
    )

    image = Image.new("RGBA", (size, size), BRAND + (255,))
    image.putalpha(mask.resize((size, size), Image.LANCZOS))
    return image


def compose(size: int, radius_ratio: float) -> Image.Image:
    ratio, stroke = optical(size)
    base = tile(size, radius_ratio)
    base.alpha_composite(draw_glyph(size, WHITE, ratio, stroke))
    return base


def main() -> None:
    # Favicon multi resolution. Les trois tailles vivent dans le meme fichier :
    # le navigateur prend 16 pour l'onglet, Windows prend 32 pour un raccourci,
    # et 48 sert aux listes de favoris a forte densite.
    #
    # A 16 pixels les coins arrondis mangent un pixel entier et le carre parait
    # ronge : le rayon diminue avec la taille au lieu de rester proportionnel.
    frames = [
        compose(48, 0.22),
        compose(32, 0.19),
        compose(16, 0.13),
    ]
    frames[0].save(
        APP / "favicon.ico",
        format="ICO",
        sizes=[(48, 48), (32, 32), (16, 16)],
        append_images=frames[1:],
    )

    # Ecran d'accueil iOS. Le systeme applique lui meme son masque arrondi et
    # ne gere pas la transparence : la tuile est donc pleine et carree, sinon
    # les coins ressortent en noir.
    apple = Image.new("RGBA", (180, 180), BRAND + (255,))
    apple.alpha_composite(draw_glyph(180, WHITE, *optical(180)))
    apple.convert("RGB").save(APP / "apple-icon.png")

    for name in ("favicon.ico", "apple-icon.png"):
        print(f"  {name}  {(APP / name).stat().st_size} octets")


if __name__ == "__main__":
    main()
