"""
Prepare les photographies de la page d'accueil pour le web.

Les originaux fournis pesent environ 2,6 Mo chacun, en 1494 x 2848 ou 3000 x 1408 :
inexploitables tels quels sur un telephone. Ce script les recadre au format
d'affichage, produit trois largeurs par image et ecrit du WebP, ce qui divise le
poids par vingt sans perte visible.

Le recadrage est fait ici, pas en CSS : envoyer une image deux fois plus haute
que la zone ou elle s'affiche reste du gaspillage, meme avec object-fit.

Les portraits sont ramenes en 3:4. La mise en page les affiche en 4:3 sur
telephone et en 3:4 a partir de la tablette, le navigateur recadrant la bande
centrale. L'image large est laissee dans son cadrage d'origine.

Usage : python scripts/generate-marketing-images.py
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "marketing"

# Largeurs generees, alignees sur les tailles reelles d'affichage :
# telephone, tablette, puis ecran large en densite double.
PORTRAIT_WIDTHS = (480, 720, 1080)
WIDE_WIDTHS = (800, 1280, 1920)

QUALITY = 78


def portrait(source: str, name: str, top_ratio: float) -> None:
    """Recadre en 3:4 a partir d'un point haut donne, puis exporte les largeurs."""
    with Image.open(ROOT / source) as image:
        image = image.convert("RGB")
        width, height = image.size
        target_height = round(width * 4 / 3)
        top = round(height * top_ratio)
        # Sans cette borne, un ratio trop bas sortirait du cadre en bas.
        top = max(0, min(top, height - target_height))
        cropped = image.crop((0, top, width, top + target_height))
        export(cropped, name, PORTRAIT_WIDTHS)


def wide(source: str, name: str) -> None:
    with Image.open(ROOT / source) as image:
        export(image.convert("RGB"), name, WIDE_WIDTHS)


def export(image: Image.Image, name: str, widths: tuple[int, ...]) -> None:
    for target in widths:
        if target > image.width:
            continue
        ratio = target / image.width
        resized = image.resize((target, round(image.height * ratio)), Image.LANCZOS)
        path = OUT / f"{name}-{target}.webp"
        resized.save(path, "WEBP", quality=QUALITY, method=6)
        print(f"  {path.relative_to(ROOT)}  {resized.width}x{resized.height}  {path.stat().st_size // 1024} ko")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    print("terrain (accueil) :")
    # Cadrage haut a 9 % : garde les visages, la tablette et le haut du telephone.
    portrait("app2.jpg", "terrain", 0.09)

    print("staff (restitution) :")
    # Un peu plus bas : le staff, l'ecran mural et l'ordinateur portable.
    portrait("app1.jpg", "staff", 0.15)

    print("bord de touche (bande large) :")
    wide("app3.jfif", "touche")


if __name__ == "__main__":
    main()
