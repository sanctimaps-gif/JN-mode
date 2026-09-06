# Chiffrage — JN Mode, version avec base de données

Estimation pour faire évoluer le site livré (autonome, données dans le
navigateur) vers une **véritable application avec base de données**.

> Montants en **euros hors taxes**, sur la base d'un tarif journalier de
> **350 € à 450 € HT** selon le profil et le niveau d'engagement.
> Un devis contractuel doit reprendre le périmètre exact retenu.

---

## 1. Ce que la base de données change concrètement

| | Version livrée (sans BDD) | Version avec base de données |
|---|---|---|
| Où vivent les données | dans le navigateur de chaque visiteur | sur un serveur, une seule source de vérité |
| Modification depuis le magasin | visible **uniquement** sur cet ordinateur | visible **immédiatement par tout le monde** |
| Avis des clientes | restent sur l'appareil de la cliente | reçus, modérés et publiés pour tous |
| Photos | ~5 Mo au total, compressées | illimitées, servies en plusieurs tailles |
| Sauvegarde | export manuel `.json` | sauvegardes automatiques quotidiennes |
| Code d'accès | vérifié côté navigateur | vérifié côté serveur (hachage Argon2, sessions) |
| Plusieurs personnes | non | gérante + vendeuses, avec droits distincts |
| Référencement Google | limité (contenu chargé par script) | pages générées, fiches indexées une à une |
| Statistiques | aucune | articles vus, recherches, avis |

---

## 2. Périmètre chiffré — Formule « Boutique connectée »

Site vitrine + catalogue administrable, **sans vente en ligne**.

| Lot | Contenu | Charge |
|---|---|---|
| 1. Cadrage & conception | atelier avec la gérante, arborescence définitive, reprise de la charte existante, parcours d'administration | 1,5 j |
| 2. Base de données & hébergement | schéma PostgreSQL (catégories arborescentes, articles, tailles, couleurs, photos, avis, utilisateurs, journal), migrations, environnements de test et de production, nom de domaine, HTTPS | 1,5 j |
| 3. API & authentification | API REST, sessions sécurisées, hachage Argon2, limitation des tentatives, journal des connexions, réinitialisation du code par e-mail | 3 j |
| 4. Back-office complet | catégories et sous-catégories (créer / renommer / réordonner / supprimer), articles, **envoi et suppression de photos**, informations boutique, **logo**, horaires, plans d'accès, brouillons et publication | 4,5 j |
| 5. Gestion des images | envoi côté serveur, recadrage, génération automatique des formats (vignette / fiche / grand écran), WebP, stockage objet + CDN | 1,5 j |
| 6. Site public branché sur l'API | reprise intégrale du design livré, pages générées côté serveur, cache, temps de chargement, balises SEO et données structurées produit | 3 j |
| 7. Avis des clientes | dépôt, anti-spam, file de modération, notification e-mail à la gérante, publication | 1 j |
| 8. Recherche & filtres | recherche plein texte, filtres taille / couleur / prix / marque, tri | 1 j |
| 9. Sécurité, RGPD & exploitation | mentions légales, bandeau cookies si mesure d'audience, sauvegardes automatiques, supervision, alertes | 1,5 j |
| 10. Recette, mise en ligne & formation | tests, reprise des contenus existants, mise en production, formation 2 h sur place, guide illustré | 2 j |
| **Total** | | **20,5 j** |

### Montant

| Tarif journalier | Total HT |
|---|---|
| 350 € | **7 175 €** |
| 400 € | **8 200 €** |
| 450 € | **9 225 €** |

**Forfait proposé : 7 900 € HT** (≈ 9 480 € TTC à 20 %),
payable 40 % à la commande, 30 % à la recette, 30 % à la mise en ligne.

---

## 3. Formule allégée — « Boutique connectée Essentiel »

Même principe, mais en s'appuyant sur une plateforme gérée
(Supabase / Firebase) plutôt qu'un serveur sur mesure : moins de développement,
un peu moins de liberté sur le long terme.

| Lot | Charge |
|---|---|
| Cadrage & mise en place de la plateforme | 1 j |
| Modèle de données & règles d'accès | 1,5 j |
| Back-office (catégories, articles, photos, infos, logo, horaires) | 3,5 j |
| Site public branché sur la base | 2 j |
| Avis + modération | 0,75 j |
| Recette, mise en ligne, formation | 1,25 j |
| **Total** | **10 j** |

**Forfait proposé : 3 900 € HT** (≈ 4 680 € TTC).

C'est la formule recommandée pour une boutique de cette taille : elle couvre
tout le besoin exprimé, avec un budget deux fois moindre.

---

## 4. Options

| Option | Charge | Montant HT |
|---|---|---|
| Réservation / mise de côté en ligne (la cliente réserve, la boutique confirme) | 3 j | 1 200 € |
| Vente en ligne (paiement Stripe, livraison, click & collect, stocks) | 10 – 14 j | 4 000 € – 5 600 € |
| Gestion des stocks par taille et couleur | 2,5 j | 1 000 € |
| Publication automatique des nouveautés vers Instagram | 2 j | 800 € |
| Programme de fidélité | 3 j | 1 200 € |
| Version multilingue (anglais) | 2 j | 800 € |
| Rédaction des textes et séance photo produits | sur devis | — |

---

## 5. Coûts récurrents

| Poste | Coût annuel |
|---|---|
| Nom de domaine `.fr` | 12 € – 20 € |
| Hébergement + base de données gérée | 180 € – 420 € |
| Stockage des photos + CDN | 0 € – 120 € |
| Certificat HTTPS | inclus |
| Envoi d'e-mails (avis, alertes) | 0 € – 120 € |
| **Total** | **≈ 200 € – 680 € / an** |

**Maintenance (optionnelle, recommandée) :** mises à jour de sécurité,
sauvegardes vérifiées, corrections, 1 h d'évolutions par mois —
**80 € HT / mois** ou **880 € HT / an**.

---

## 6. Délais

| Formule | Délai après validation |
|---|---|
| Boutique connectée Essentiel (10 j) | 3 à 4 semaines |
| Boutique connectée (20,5 j) | 6 à 8 semaines |
| Avec vente en ligne | 10 à 14 semaines |

Le délai dépend surtout de la fourniture des contenus (photos, textes,
catalogue réel) par la boutique.

---

## 7. Hypothèses et exclusions

**Compris :** conception, développement, tests, mise en ligne, reprise des
contenus déjà saisis, formation, garantie de bon fonctionnement 3 mois
(correction des anomalies).

**Non compris :** création graphique d'un logo, photographies produits,
rédaction des fiches articles, achat du nom de domaine et de l'hébergement
(souscrits au nom de la boutique), campagnes publicitaires, frais de paiement
en ligne.

**Hypothèses :** une seule langue, un point de vente, un interlocuteur unique
côté boutique, contenus fournis dans un format exploitable.

---

## 8. Repère budgétaire

| Solution | Investissement de départ | Coût annuel |
|---|---|---|
| Site livré aujourd'hui (sans BDD) | déjà réalisé | ≈ 20 € (domaine + hébergement statique) |
| Boutique connectée Essentiel | 3 900 € HT | ≈ 200 € + maintenance |
| Boutique connectée | 7 900 € HT | ≈ 400 € + maintenance |
| Avec vente en ligne | 12 000 € – 14 000 € HT | ≈ 700 € + commissions de paiement |

À titre de comparaison, une boutique en ligne clé en main type Shopify revient
à 350 € – 800 € par an d'abonnement, sans personnalisation du catalogue ni
propriété du code.

---

*Chiffrage établi pour JN Mode — 86 rue Jeanne d'Arc, 76000 Rouen.
Contact : **Sanctimaps@gmail.com***
