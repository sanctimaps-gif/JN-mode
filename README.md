# JN Mode — site de la boutique

Site vitrine et catalogue de **JN Mode**, boutique de prêt-à-porter féminin
au **86 rue Jeanne d'Arc, 76000 Rouen (France)**.

Application web autonome : aucun serveur applicatif, aucune base de données,
aucune dépendance externe à installer. Les fichiers se déposent tels quels
sur n'importe quel hébergement.

---

## 1. Mettre le site en ligne

Copiez le contenu du dossier à la racine de l'hébergement (OVH, Ionos,
Hostinger, Netlify, GitHub Pages, o2switch…) :

```
index.html
assets/css/styles.css
assets/js/*.js
```

C'est tout : le site fonctionne dès l'ouverture de `index.html` par le
navigateur.

### Aperçu en local

Un simple double-clic sur `index.html` suffit dans la plupart des cas.
Pour un aperçu strictement identique à la production :

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

---

## 2. Espace gérante

Accès : bouton **« Espace gérante »** en haut à droite, ou adresse `#/admin`.

### Première connexion

| | |
|---|---|
| Code de départ | `JNMODE76` |
| À la première connexion | le site **impose** le remplacement de ce code |
| Ensuite | le code se change à tout moment, **l'ancien code est toujours exigé** |

Le code n'est jamais conservé en clair : seule une empreinte SHA-256 salée et
étirée (900 tours) est enregistrée. Après 5 essais ratés, la saisie est
bloquée une minute.

> **Code oublié = données à réinitialiser.** Il n'existe volontairement aucune
> porte dérobée. La réinitialisation (onglet *Sauvegarde*) rétablit le code de
> départ **et** le catalogue d'origine : pensez à télécharger régulièrement une
> sauvegarde.

### Ce que la gérante peut faire

| Onglet | Actions |
|---|---|
| **Catégories** | créer / renommer / réordonner / supprimer catégories et sous-catégories, à tous les niveaux |
| **Articles** | créer, modifier, supprimer un article ; marque, prix, référence, tailles (dont tailles épuisées), couleurs, matière, description, mise en avant ; **ajouter et retirer des photos** |
| **Boutique & logo** | **changer le logo**, nom, accroche, adresse, téléphone, e-mail, **lien Instagram**, Facebook, autre site, présentation |
| **Horaires & accès** | horaires jour par jour (avec jours fermés), plan intégré, itinéraire, métro, bus/TEOR, train, voiture, parkings, vélo, à pied |
| **Avis** | consulter et supprimer les avis déposés par les clientes |
| **Code d'accès** | changer le code (ancien code obligatoire) |
| **Sauvegarde** | télécharger / restaurer une sauvegarde `.json`, réinitialiser |

Les photos peuvent aussi se gérer **directement depuis la fiche article**
quand on est connectée : « + » pour ajouter, « × » pour retirer.

---

## 3. Règle d'organisation du catalogue

**Les articles ne se rangent que dans les sous-catégories du dernier niveau.**
Une catégorie qui contient des sous-catégories n'affiche jamais d'articles :
elle présente ses sous-catégories. L'application fait respecter cette règle :

- impossible de créer une sous-catégorie dans une catégorie qui contient déjà
  des articles (il faut d'abord les déplacer) ;
- la liste déroulante « Sous-catégorie » du formulaire article ne propose que
  des catégories de dernier niveau.

Arborescence livrée :

```
👗 Vêtements
   Robes        → Robes courtes · Robes longues · Robes habillées · Robes décontractées
   Hauts        → T-shirts · Tops · Chemisiers · Blouses
   Bas          → Pantalons · Jeans · Jupes · Shorts
   Vestes       → Vestes légères · Blazers · Gilets
   Textile      → Pulls · Gilets · Ensembles
👟 Chaussures            → Baskets · Bottines · Sandales · Chaussures habillées
👜 Sacs & maroquinerie   → Sacs à main · Sacs bandoulière · Sacs à dos · Petite maroquinerie
💍 Bijoux fantaisie      → Colliers · Bracelets · Boucles d'oreilles · Bagues
🧢 Accessoires           → Ceintures · Écharpes · Accessoires cheveux · Autres accessoires de mode
```

102 articles d'exemple sont pré-remplis pour que le catalogue soit
immédiatement présentable. Ils se modifient ou se suppriment un par un depuis
l'espace gérante.

---

## 4. Fiche article

Sous la photo (galerie de 8 photos maximum, modifiable par la gérante) :

1. marque
2. tailles disponibles (tailles épuisées barrées)
3. couleurs disponibles (pastilles de couleur)
4. description + composition
5. avis des clientes : note sur 5, prénom, commentaire — dépôt libre,
   modération par la gérante
6. **« Vous aimerez aussi »** : articles similaires (même sous-catégorie, puis
   catégories voisines, puis même rayon)

---

## 5. Plans d'accès

Page **« Venir à la boutique »** (`#/acces`) : plan interactif, bouton
itinéraire, repères dans la ville, puis métro, bus & TEOR, train, voiture,
parkings, vélo, à pied et horaires. Chaque ligne est modifiable dans l'onglet
*Horaires & accès*.

---

## 6. Points à vérifier avant la mise en ligne

- [ ] **Lien Instagram** — à renseigner dans *Boutique & logo*. Le compte n'a
      pas pu être confirmé de source sûre : demandez l'adresse exacte à la
      boutique et collez-la (tant que le champ est vide, le bouton Instagram
      n'apparaît pas). Aucun autre site officiel n'a été trouvé.
- [ ] **Horaires** — les annuaires professionnels indiquent
      *lundi au samedi, 10h – 19h, fermé le dimanche* : à confirmer avec la
      gérante, puis à ajuster dans *Horaires & accès*.
- [ ] **Téléphone** — `02 35 89 42 10` d'après les annuaires : à confirmer.
- [ ] **Logo** — à charger dans *Boutique & logo* (un monogramme « JM » est
      affiché en attendant).
- [ ] **Photos** — remplacer les visuels générés par les vraies photos.

---

## 7. Limites de cette version (sans base de données)

Les données vivent dans le **navigateur** (localStorage) :

- les modifications faites sur l'ordinateur de la boutique **ne se voient pas**
  sur les téléphones des clientes, et inversement ;
- les avis déposés par une cliente restent sur son propre appareil ;
- capacité d'environ **5 Mo** au total, photos comprises ;
- vider les données du navigateur efface le catalogue (d'où les sauvegardes) ;
- le code d'accès protège l'interface, mais pas les données elles-mêmes :
  une personne techniquement avertie peut lire le contenu de son propre
  navigateur.

Le passage à une version avec base de données lève toutes ces limites :
voir **[DEVIS-VERSION-BASE-DE-DONNEES.md](DEVIS-VERSION-BASE-DE-DONNEES.md)**.

---

## 8. Organisation du code

| Fichier | Rôle |
|---|---|
| `index.html` | structure de la page, en-tête, dépliant de droite, pied de page |
| `assets/css/styles.css` | toute la charte graphique (ivoire, encre, champagne doré) |
| `assets/js/utils.js` | outils : échappement HTML, formats, couleurs, notifications |
| `assets/js/media.js` | visuels générés, import et compression des photos |
| `assets/js/seed.js` | données de départ (boutique, arborescence, catalogue) |
| `assets/js/store.js` | modèle de données, persistance, règles métier |
| `assets/js/auth.js` | code d'accès (SHA-256 salé, étirement, verrouillage) |
| `assets/js/views.js` | pages publiques |
| `assets/js/admin.js` | espace gérante |
| `assets/js/app.js` | navigation, habillage, démarrage |

Toute donnée saisie est échappée avant affichage (`U.esc`), y compris les avis
des clientes.

---

*Site conçu et développé sur mesure. Pour toute demande de création de site :
**Sanctimaps@gmail.com***
