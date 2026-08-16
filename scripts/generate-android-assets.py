"""
Genere les icones et les ecrans de demarrage de l'application Android.

Le logo est le meme trace que celui de l'interface web : la ligne de pouls de
l'icone Activity, sur le bleu de la marque. Tout est dessine ici plutot que
stocke en binaire, ce qui permet de regenerer les images apres un changement de
couleur sans quitter le projet.

Usage : python scripts/generate-android-assets.py
"""

from pathlib import Path

from PIL import Image, ImageDraw

RES = Path(__file__).resolve().parent.parent / "android" / "app" / "src" / "main" / "res"

BRAND = (30, 64, 175)  # #1E40AF, identique a --color-brand-800 de l'interface
WHITE = (255, 255, 255)

# Trace de l'icone Activity de lucide, sur une grille de 24 unites.
GLYPH = [(22, 12), (18, 12), (15, 21), (9, 3), (6, 12), (2, 12)]

# Facteur de suréchantillonnage : on dessine en grand puis on reduit, ce qui
# donne des bords lisses sans avoir besoin d'antialiasing natif.
SS = 4


def draw_glyph(size: int, color, stroke_ratio: float = 0.085, scale: float = 1.0) -> Image.Image:
    """Dessine la ligne de pouls centree dans un carre transparent."""
    big = size * SS
    layer = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    span = big * scale
    offset = (big - span) / 2
    unit = span / 24.0

    points = [(offset + x * unit, offset + y * unit) for x, y in GLYPH]
    width = max(2, int(big * stroke_ratio * scale))

    draw.line(points, fill=color, width=width, joint="curve")
    # Extremites arrondies, la jointure "curve" ne les couvre pas.
    radius = width / 2
    for x, y in (points[0], points[-1]):
        draw.ellipse([x - radius, y - radius, x + radius, y + radius], fill=color)

    return layer.resize((size, size), Image.LANCZOS)


def rounded_square(size: int, color, radius_ratio: float = 0.22) -> Image.Image:
    big = size * SS
    layer = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    draw.rounded_rectangle([0, 0, big - 1, big - 1], radius=int(big * radius_ratio), fill=color)
    return layer.resize((size, size), Image.LANCZOS)


def circle(size: int, color) -> Image.Image:
    big = size * SS
    layer = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    draw.ellipse([0, 0, big - 1, big - 1], fill=color)
    return layer.resize((size, size), Image.LANCZOS)


def save(image: Image.Image, relative: str) -> None:
    path = RES / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, "PNG", optimize=True)
    print(f"  {relative}  {image.size[0]}x{image.size[1]}")


# --- Icones de lancement ---------------------------------------------------
# Tailles Android habituelles pour ic_launcher, par densite.
LAUNCHER = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}

# L'icone adaptative fait 108 dp, dont seuls les 72 dp centraux sont toujours
# visibles : le glyphe est donc dessine a 46% pour rester dans la zone sure.
FOREGROUND = {"mdpi": 108, "hdpi": 162, "xhdpi": 216, "xxhdpi": 324, "xxxhdpi": 432}

print("Icones de lancement")
for density, size in LAUNCHER.items():
    base = rounded_square(size, BRAND)
    base.alpha_composite(draw_glyph(size, WHITE, scale=0.56))
    save(base, f"mipmap-{density}/ic_launcher.png")

    round_base = circle(size, BRAND)
    round_base.alpha_composite(draw_glyph(size, WHITE, scale=0.52))
    save(round_base, f"mipmap-{density}/ic_launcher_round.png")

print("Calque avant de l'icone adaptative")
for density, size in FOREGROUND.items():
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    layer.alpha_composite(draw_glyph(size, WHITE, scale=0.40))
    save(layer, f"mipmap-{density}/ic_launcher_foreground.png")

# --- Ecrans de demarrage ---------------------------------------------------
SPLASH = {
    "drawable": (480, 320),
    "drawable-land-mdpi": (480, 320),
    "drawable-land-hdpi": (800, 480),
    "drawable-land-xhdpi": (1280, 720),
    "drawable-land-xxhdpi": (1600, 960),
    "drawable-land-xxxhdpi": (1920, 1280),
    "drawable-port-mdpi": (320, 480),
    "drawable-port-hdpi": (480, 800),
    "drawable-port-xhdpi": (720, 1280),
    "drawable-port-xxhdpi": (960, 1600),
    "drawable-port-xxxhdpi": (1280, 1920),
}

print("Ecrans de demarrage")
for folder, (width, height) in SPLASH.items():
    canvas = Image.new("RGBA", (width, height), BRAND + (255,))
    # Le logo occupe un quart de la plus petite dimension, ce qui reste
    # equilibre aussi bien en portrait qu'en paysage.
    logo_size = int(min(width, height) * 0.26)
    logo = draw_glyph(logo_size, WHITE, scale=0.92)
    canvas.alpha_composite(logo, ((width - logo_size) // 2, (height - logo_size) // 2))
    save(canvas.convert("RGB"), f"{folder}/splash.png")

print("\nTermine.")
