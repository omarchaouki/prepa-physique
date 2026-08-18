"""
Genere le logo, les icones et l'ecran de lancement de l'application mobile.

--------------------------------------------------------------------------
Le signe
--------------------------------------------------------------------------

La ligne de pouls, exactement celle du site : meme trace, meme bleu, meme
proportions. C'est le signe que les clients connaissent deja.

Une application et un site qui portent deux signes differents ne donnent pas
l'impression de deux produits, mais d'un produit mal fini. La coherence vaut
plus qu'un dessin plus original.

Le trace est celui de l'icone Activity, sur une grille de 24 unites, repris
tel quel de scripts/generate-android-assets.py pour que les deux generateurs
ne divergent jamais.

Contraintes de lisibilite tenues ici :

. Le trace reste lisible a 48 pixels, la plus petite taille d'un lanceur
  Android.
. L'icone adaptative est rognee, parfois en cercle : le signe tient dans les
  66 % centraux, comme l'exige la documentation Android.
. La couche monochrome ne garde que la silhouette, Android la recolorise.

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


# Trace de la ligne de pouls, sur une grille de 24 unites. Identique a celui de
# scripts/generate-android-assets.py, qui sert la coque Capacitor.
PULSE = [(22, 12), (18, 12), (15, 21), (9, 3), (6, 12), (2, 12)]


def draw_mark(size: int, colour, ratio: float = 1.0) -> Image.Image:
    """
    Trace le signe seul, sur fond transparent.

    `ratio` reduit le signe dans son cadre : 1.0 le fait toucher les bords de sa
    zone utile, 0.62 le place dans la zone sure d'une icone adaptative.

    Le trait est compose de segments, chacun tamponne par un disque a ses deux
    extremites. `draw.line(width=...)` laisse en effet des coutures visibles aux
    angles vifs, et cette ligne en compte quatre, dont deux tres fermes au
    sommet et au creux du pic.
    """
    big = size * SCALE
    image = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    span = big * ratio
    offset = (big - span) / 2

    def point(x: float, y: float) -> tuple[float, float]:
        return (offset + span * x / 24, offset + span * y / 24)

    stroke = max(2.0, span * 0.093)
    radius = stroke / 2

    pixels = [point(x, y) for x, y in PULSE]

    for index in range(len(pixels) - 1):
        draw.line([pixels[index], pixels[index + 1]], fill=colour, width=int(round(stroke)))

    # Bouts et angles arrondis : sans eux, les quatre sommets de la ligne
    # apparaissent tronques a plat, ce qui se voit beaucoup a petite taille.
    for x, y in pixels:
        draw.ellipse([x - radius, y - radius, x + radius, y + radius], fill=colour)

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
