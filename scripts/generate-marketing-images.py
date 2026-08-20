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
# Largeurs des photos et des captures de la page publicitaire. Elles s'affichent
# soit en pleine largeur sur telephone, soit sur une demi colonne au dela.
LP_WIDTHS = (640, 960, 1440)

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


def crop_ratio(source: str, name: str, ratio: float, top_ratio: float = 0.5,
               widths: tuple[int, ...] = LP_WIDTHS) -> None:
    """Recadre au rapport demande autour d'un point vertical, puis exporte.

    `ratio` est largeur sur hauteur. `top_ratio` place le centre du cadre dans
    la hauteur d'origine : 0.5 centre, 0.35 remonte vers les visages.
    """
    with Image.open(ROOT / source) as image:
        image = image.convert("RGB")
        width, height = image.size
        target_height = round(width / ratio)

        if target_height <= height:
            top = round(height * top_ratio - target_height / 2)
            top = max(0, min(top, height - target_height))
            cropped = image.crop((0, top, width, top + target_height))
        else:
            # Source trop large pour le rapport demande : on rogne en largeur.
            target_width = round(height * ratio)
            left = round((width - target_width) / 2)
            cropped = image.crop((left, 0, left + target_width, height))

        export(cropped, name, widths)


def crop_left(source: str, name: str, ratio: float, top_ratio: float,
              keep_width: float, widths: tuple[int, ...] = LP_WIDTHS) -> None:
    """Garde la fraction gauche de l'image, puis recadre au rapport demande."""
    with Image.open(ROOT / source) as image:
        image = image.convert("RGB")
        image = image.crop((0, 0, round(image.width * keep_width), image.height))
        width, height = image.size
        target_height = round(width / ratio)
        if target_height <= height:
            top = round(height * top_ratio - target_height / 2)
            top = max(0, min(top, height - target_height))
            image = image.crop((0, top, width, top + target_height))
        export(image, name, widths)


def crop_box(source: str, name: str, left: float, top: float, right: float,
             bottom: float, widths: tuple[int, ...] = LP_WIDTHS) -> None:
    """Decoupe une region donnee en fractions de l'image, puis exporte.

    Sert a extraire la photographie d'une composition publicitaire, en laissant
    de cote les panneaux de texte et les maquettes d'interface incrustes.
    """
    with Image.open(ROOT / source) as image:
        image = image.convert("RGB")
        width, height = image.size
        box = (round(width * left), round(height * top),
               round(width * right), round(height * bottom))
        export(image.crop(box), name, widths)


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

    # -----------------------------------------------------------------------
    # Page publicitaire
    # -----------------------------------------------------------------------
    #
    # Les sources vivent dans lp/, un dossier de travail hors du site. Elles
    # pesent trois megaoctets piece et ne doivent jamais etre servies telles
    # quelles : c'est tout l'objet de ce script.

    # -----------------------------------------------------------------------
    # Fond du hero, deux cadrages de la meme scene
    # -----------------------------------------------------------------------
    #
    # Le hero d'un telephone est un rectangle debout. Y afficher un cadrage
    # paysage reviendrait a rogner tout ce qui n'est pas au centre, et il ne
    # resterait qu'un buste. Le cadrage vertical garde les trois membres du
    # staff, la tablette et les joueurs a l'entrainement derriere eux, c'est a
    # dire la scene entiere.
    #
    # La source fait deux mille pixels de cote, ce qui laisse de la matiere
    # pour un cadrage vertical en densite double. Les compositions 5.png et
    # 6.png, elles, ne font qu'un millier de pixels de haut : trop court.
    print("fond du hero, cadrage paysage :")
    crop_ratio("lp/4.jfif", "lp-hero", 16 / 9, 0.45)

    print("fond du hero, cadrage debout :")
    crop_ratio("lp/4.jfif", "lp-hero-debout", 4 / 5, 0.5, widths=(480, 720, 1080))

    print("brief au groupe :")
    # Seule la photographie est reprise, pas la composition publicitaire.
    # Les bandeaux d'origine portent leur texte en francais, incruste dans le
    # pixel : ils seraient faux sur les versions anglaise et arabe de la page,
    # illisibles sur un telephone, et invisibles pour un lecteur d'ecran. Ils
    # restent parfaits pour la publicite elle meme, ou ils sont nes.
    crop_box("lp/6.png", "lp-brief", 0.255, 0.0, 1.0, 0.66)

    print("staff et joueurs :")
    # Recadrage sur la partie gauche, et pas seulement pour la composition :
    # le maillot de droite porte l'ecusson d'un club professionnel existant.
    # Une marque tierce reconnaissable dans une publicite se defend mal, et
    # cela ne coute rien de la sortir du cadre.
    crop_left("lp/7.jfif", "lp-joueurs", 3 / 2, 0.42, 0.66)


if __name__ == "__main__":
    main()
