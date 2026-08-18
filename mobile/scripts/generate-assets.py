"""
Genere le logo, les icones et l'ecran de lancement de l'application mobile.

--------------------------------------------------------------------------
Le signe
--------------------------------------------------------------------------

Une courbe vitesse temps de sprint : montee raide, puis plateau, avec le point
de mesure a l'extremite. C'est litteralement ce que l'application mesure, et
c'est la forme que tout preparateur physique reconnait immediatement.

Le signe precedent etait l'icone Activity d'une bibliotheque generique, la meme
que celle de milliers d'applications de sante. Une marque revendue a des clubs
ne peut pas se contenter d'un pictogramme d'inventaire.

Contraintes de lisibilite tenues ici :

. Le trace reste lisible a 48 pixels, la plus petite taille d'un lanceur
  Android. Aucun detail ne descend sous une epaisseur de trait de 7 % du cote.
. L'icone adaptative Android est rognee en cercle par certains lanceurs, et son
  quart exterieur peut disparaitre. Le signe tient donc dans le cercle central
  de 66 %, comme l'exige la documentation Android.
. L'icone de notification est monochrome blanche sur fond transparent : Android
  ignore les couleurs et ne garde que l'alpha depuis la version 5.

Usage : python mobile/scripts/generate-assets.py
"""

from pathlib import Path

from PIL import Image, ImageDraw

ASSETS = Path(__file__).resolve().parent.parent / "assets"

BRAND = (30, 64, 175)  # #1E40AF, le bleu de l'interface web
WHITE = (255, 255, 255)
INK = (10, 15, 28)  # #0A0F1C, le fond sombre de l'interface

# Suréchantillonnage : on dessine en grand puis on reduit, ce qui donne des
# bords lisses sans antialiasing natif sur les traces epais.
SCALE = 8


def bezier(p0, p1, p2, p3, steps=120):
    """Points d'une courbe cubique, pour tracer autre chose que des segments."""
    points = []
    for i in range(steps + 1):
        t = i / steps
        u = 1 - t
        x = u**3 * p0[0] + 3 * u**2 * t * p1[0] + 3 * u * t**2 * p2[0] + t**3 * p3[0]
        y = u**3 * p0[1] + 3 * u**2 * t * p1[1] + 3 * u * t**2 * p2[1] + t**3 * p3[1]
        points.append((x, y))
    return points


def draw_mark(size: int, colour, ratio: float = 1.0) -> Image.Image:
    """
    Trace le signe seul, sur fond transparent.

    `ratio` reduit le signe dans son cadre : 1.0 le fait toucher les bords de sa
    zone utile, 0.62 le place dans la zone sure d'une icone adaptative.

    Le trait est obtenu en tamponnant un disque le long de la courbe plutot
    qu'avec `draw.line(width=...)`. Pillow assemble en effet un polygone de
    jointure a chaque point, et ces polygones se recouvrent en laissant des
    coutures visibles sur un trait epais. Le tampon donne un trait parfaitement
    lisse, avec des bouts ronds gratuits.
    """
    big = size * SCALE
    image = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    # Repere local sur une grille de 24, centre puis reduit selon `ratio`.
    span = big * ratio
    offset = (big - span) / 2

    def point(x: float, y: float) -> tuple[float, float]:
        return (offset + span * x / 24, offset + span * y / 24)

    stroke = max(2.0, span * 0.082)
    radius = stroke / 2

    # Ligne de base : l'axe du temps. Discrete, elle ancre la courbe sans
    # entrer en concurrence avec elle.
    faint = colour + (110,) if len(colour) == 3 else colour
    thin = max(1.0, stroke * 0.30)
    bx0, by = point(3.0, 20.2)
    bx1, _ = point(21.0, 20.2)
    draw.rounded_rectangle(
        [bx0, by - thin / 2, bx1, by + thin / 2], radius=thin / 2, fill=faint
    )

    # Courbe de vitesse d'un sprint : montee tres raide au depart, puis plateau
    # franchement horizontal a la vitesse maximale. Les points de controle sont
    # choisis pour que la tangente de depart soit presque verticale et celle
    # d'arrivee presque plate : c'est ce contraste qui rend la courbe lisible
    # comme une courbe, et non comme une diagonale quelconque.
    curve = bezier(
        point(4.4, 19.4),
        point(6.2, 10.2),
        point(13.6, 6.6),
        point(19.3, 6.4),
        steps=240,
    )
    for x, y in curve:
        draw.ellipse([x - radius, y - radius, x + radius, y + radius], fill=colour)

    # Point de mesure a la vitesse maximale : le geste du chronometre qui
    # s'arrete. Un anneau plutot qu'un disque, pour ne pas epaissir la courbe.
    cx, cy = curve[-1]
    outer = stroke * 1.30
    draw.ellipse([cx - outer, cy - outer, cx + outer, cy + outer], fill=colour)
    inner = stroke * 0.52
    draw.ellipse(
        [cx - inner, cy - inner, cx + inner, cy + inner], fill=(0, 0, 0, 0)
    )

    return image.resize((size, size), Image.LANCZOS)


def rounded_square(size: int, colour, radius_ratio: float = 0.2237) -> Image.Image:
    """Fond arrondi au rayon des icones Android modernes."""
    big = size * SCALE
    image = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle(
        [0, 0, big - 1, big - 1], radius=int(big * radius_ratio), fill=colour
    )
    return image.resize((size, size), Image.LANCZOS)


def compose(size: int, background, mark_colour, ratio: float, rounded: bool) -> Image.Image:
    base = (
        rounded_square(size, background)
        if rounded
        else Image.new("RGBA", (size, size), background + (255,))
    )
    mark = draw_mark(size, mark_colour, ratio)
    base.alpha_composite(mark)
    return base


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)

    # Icone de l'application. Google Play l'exige en 512, Expo la veut en 1024
    # et sans transparence : un canal alpha fait rejeter le televersement.
    compose(1024, BRAND, WHITE, ratio=0.70, rounded=True).convert("RGB").save(
        ASSETS / "icon.png"
    )

    # Icone adaptative Android, en trois couches comme l'exige le systeme.
    #
    # Le premier plan est rogne par le lanceur, parfois en cercle, parfois en
    # carre arrondi, parfois en goutte. Seuls les 66 % centraux sont garantis
    # visibles : c'est pourquoi le signe y est reduit a 0.62.
    foreground = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    foreground.alpha_composite(draw_mark(1024, WHITE, ratio=0.62))
    foreground.save(ASSETS / "android-icon-foreground.png")

    Image.new("RGBA", (1024, 1024), BRAND + (255,)).save(
        ASSETS / "android-icon-background.png"
    )

    # Couche monochrome, utilisee par les icones themees d'Android 13 et plus.
    # Le systeme n'en garde que la silhouette et la recolorise lui meme.
    monochrome = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    monochrome.alpha_composite(draw_mark(1024, WHITE, ratio=0.62))
    monochrome.save(ASSETS / "android-icon-monochrome.png")

    # Icone de notification : Android n'en garde que la silhouette.
    notification = Image.new("RGBA", (96, 96), (0, 0, 0, 0))
    notification.alpha_composite(draw_mark(96, WHITE, ratio=0.86))
    notification.save(ASSETS / "notification-icon.png")

    # Ecran de lancement : le signe seul, centre par Expo sur le fond declare
    # dans app.json. Le meme fichier sert aux deux themes, seule la couleur de
    # fond change.
    splash = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    splash.alpha_composite(draw_mark(512, WHITE, ratio=0.92))
    splash.save(ASSETS / "splash-icon.png")

    # Vignette web, utilisee par Expo en mode navigateur.
    compose(48, BRAND, WHITE, ratio=0.70, rounded=True).save(ASSETS / "favicon.png")

    # Bandeau de la fiche Google Play, 1024 par 500, exige pour la publication.
    feature = Image.new("RGBA", (1024, 500), INK + (255,))
    feature.alpha_composite(draw_mark(320, WHITE, ratio=0.95), (96, 90))
    feature.convert("RGB").save(ASSETS / "play-feature-graphic.png")

    for path in sorted(ASSETS.glob("*.png")):
        with Image.open(path) as opened:
            print(f"  {path.name:32} {opened.size[0]:>5} x {opened.size[1]:<5} {opened.mode}")


if __name__ == "__main__":
    main()
