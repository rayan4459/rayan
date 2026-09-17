# CurioLab — page principale (curiolab.me)

Page d'accueil qui met en avant la bague de paiement **Curio Ring**, avec une bague
recréée en 3D (Three.js) et une section « explorateur » inspirée des pages produit Apple :
une liste de caractéristiques à gauche, la bague à droite qui tourne et zoome sur chaque
détail lorsqu'on clique.

## Contenu du site

| Fichier | Rôle |
| --- | --- |
| `index.html` | Structure de la page (nav, hero, explorateur, caractéristiques, comment ça marche, précommande, footer) |
| `styles.css` | Style (esthétique Apple : pastilles, cartes dépliantes, grille responsive) |
| `main.js` | Bague 3D procédurale, textures (brossage, gravure), animation des vues, logique de l'explorateur |
| `vendor/three/` | Three.js (r170) vendorisé, aucun CDN nécessaire |

Site 100 % statique : aucun build, aucune dépendance à installer.

## Lancer en local

Les modules ES doivent être servis en HTTP (pas en `file://`) :

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Personnaliser

Tout le contenu éditable se trouve en haut de `main.js` :

- `ENGRAVING` : texte gravé à l'intérieur de l'anneau.
- `FINISHES` : les finitions (couleur de la bande brossée, des chanfreins polis, de la pastille et de la gravure).
- `SIZES` : les tailles proposées.
- `FEATURES` : les caractéristiques de l'explorateur. Pour chacune : titre, texte, et la
  `pose` de la bague (`rx`, `ry`, `rz` en radians, `dist` = distance caméra, `px`/`py` = décalage).
  `spin` fixe l'angle du plateau tournant, `nfc: true` affiche les ondes sans contact.

Les textes des autres sections (hero, chiffres clés, étapes, précommande) sont directement dans `index.html`.
Les chiffres (5 ATM, 2,4 mm, tailles 6 à 13…) sont des valeurs indicatives à remplacer par les vraies.

## Déployer

N'importe quel hébergeur statique convient (GitHub Pages, Netlify, Vercel, Cloudflare Pages…) :
déployez le dossier tel quel. Pour GitHub Pages avec le domaine curiolab.me, ajoutez un fichier
`CNAME` contenant `curiolab.me` et configurez les DNS chez votre registrar.
