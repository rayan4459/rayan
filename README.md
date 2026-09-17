# VegaPay — page principale (curiolab.me)

Page d'accueil « expérience » de la bague de paiement **VegaPay** : une bague modélisée
procéduralement (Three.js) reste en fond fixe et s'oriente au fil du scroll, façon page produit Apple.

Tout tient dans un seul fichier, `index.html` (HTML + CSS + JS). Three.js r128 est chargé depuis cdnjs.

## Sections

1. **Héro** — wordmark Vega✦Pay, bague de face.
2. **Chapitres** (4) — céramique brossée, biseaux polis, gravure, sans batterie ; la bague change de cadrage à chaque chapitre.
3. **Découvrez la bague** — la liste de caractéristiques à gauche (pastilles « + », flèches haut/bas) ;
   au clic, la carte se déplie et la bague pivote / zoome sur le détail : finitions (nuancier qui
   recolore la bague), céramique brossée, biseaux, gravure intérieure, paiement sans contact
   (ondes NFC animées), sans batterie, tailles (sélecteur).
4. **Comment ça marche** — trois étapes.
5. **Regardez-la de plus près** — la bague se fait tourner à la souris ou au doigt (aussi possible dans l'explorateur).

## Lancer en local

Ouvrez simplement `index.html` dans un navigateur, ou servez le dossier :

```bash
python3 -m http.server 8000
```

## Personnaliser

En tête du script dans `index.html` :

- `ENGRAVING` : texte gravé à l'intérieur.
- `FINISHES` : finitions (bande, biseaux, gravure, pastille).
- `SIZES` : tailles proposées.
- `FEATURES` : caractéristiques de l'explorateur, avec la vue de la bague pour chacune
  (`z` distance caméra, `rx` inclinaison, `ry` rotation, `rz` roulis, `fx`/`fy` décalage dans l'écran,
  `spin` angle figé, `nfc` ondes).
- `VIEWS` : cadrages des autres sections (héro, chapitres, comment ça marche, closer).

Les textes des sections sont directement dans le HTML.

## Déployer

Hébergeur statique au choix (GitHub Pages, Netlify, Vercel, Cloudflare Pages…). Pour GitHub Pages
avec le domaine curiolab.me, ajoutez un fichier `CNAME` contenant `curiolab.me` et configurez les DNS.
