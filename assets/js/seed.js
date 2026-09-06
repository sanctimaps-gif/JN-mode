/* =========================================================
   JN MODE — Données de départ
   (arborescence des rayons, catalogue d'exemple, infos boutique)
   Tout est modifiable ensuite depuis l'espace gérante.
   ========================================================= */
(function (w) {
  'use strict';

  /* ---------------------------------------------------------
     1. INFORMATIONS DE LA BOUTIQUE
     --------------------------------------------------------- */
  const SHOP = {
    name: 'JN Mode',
    tagline: "Prêt-à-porter féminin — Rouen",
    address: "86 Rue Jeanne d'Arc",
    postal: '76000',
    city: 'Rouen',
    country: 'France',
    phone: '02 35 89 42 10',
    email: '',
    instagram: '',
    facebook: '',
    website: '',
    logo: null,
    about:
      "JN Mode, c'est une boutique de prêt-à-porter féminin installée au cœur de Rouen, " +
      "sur la rue Jeanne d'Arc. Des collections renouvelées chaque semaine, choisies une " +
      "à une : des pièces faciles à porter au quotidien comme des tenues plus habillées, " +
      "à des prix pensés pour être accessibles.\n\n" +
      "On vous accueille sans rendez-vous, on prend le temps de vous conseiller, et on vous " +
      "dit toujours honnêtement quand une coupe ne vous met pas en valeur. C'est ça, l'esprit " +
      "de la maison.",
    intro:
      "Robes, hauts, bas, vestes, chaussures, sacs, bijoux fantaisie et accessoires : " +
      "découvrez toute la sélection de la boutique, rayon par rayon.",
    hours: [
      { day: 'Lundi', open: '10:00', close: '19:00', closed: false },
      { day: 'Mardi', open: '10:00', close: '19:00', closed: false },
      { day: 'Mercredi', open: '10:00', close: '19:00', closed: false },
      { day: 'Jeudi', open: '10:00', close: '19:00', closed: false },
      { day: 'Vendredi', open: '10:00', close: '19:00', closed: false },
      { day: 'Samedi', open: '10:00', close: '19:00', closed: false },
      { day: 'Dimanche', open: '', close: '', closed: true }
    ],
    hoursNote: "Horaires susceptibles d'être ajustés pendant les fêtes et les soldes.",

    /* Plans d'accès */
    access: {
      mapEmbed: 'https://www.openstreetmap.org/export/embed.html?bbox=1.0885%2C49.4405%2C1.0965%2C49.4455&layer=mapnik&marker=49.44300%2C1.09250',
      mapLink: "https://www.openstreetmap.org/search?query=86%20Rue%20Jeanne%20d'Arc%2076000%20Rouen",
      itineraire: "https://www.google.com/maps/dir/?api=1&destination=86+Rue+Jeanne+d%27Arc+76000+Rouen",
      lat: '49.4430', lng: '1.0925',
      metro: [
        "Station <strong>Théâtre des Arts</strong> — lignes de métro T1 / T2 / T3, à 3 minutes à pied (descendre la rue Jeanne d'Arc vers la Seine).",
        "Station <strong>Palais de Justice</strong> — lignes T1 / T2 / T3, à 4 minutes à pied (remonter la rue Jeanne d'Arc)."
      ],
      bus: [
        "TEOR <strong>T1, T2, T3</strong> — arrêt Théâtre des Arts ou Palais de Justice.",
        "Lignes <strong>F1, F2, F3</strong> — arrêt Théâtre des Arts.",
        "Lignes <strong>11, 13, 20</strong> — arrêt Palais de Justice / Rue Jeanne d'Arc."
      ],
      train: [
        "Gare de <strong>Rouen Rive-Droite</strong> — environ 12 minutes à pied : descendre la rue Jeanne d'Arc tout droit, la boutique est sur la gauche au n°86.",
        "Depuis la gare, le métro (direction Technopôle ou Georges Braque) dépose à Théâtre des Arts en 4 minutes."
      ],
      voiture: [
        "Depuis l'A150 / Pont Guillaume-le-Conquérant : suivre <strong>Centre-ville / Rue Jeanne d'Arc</strong>.",
        "La rue Jeanne d'Arc est en sens unique montant depuis les quais : arriver par les quais bas de la Seine.",
        "Le centre historique est partiellement piéton : privilégier un parking puis 2 à 5 minutes de marche."
      ],
      parkings: [
        "<strong>Parking Vieux-Marché</strong> — 5 min à pied (le plus proche).",
        "<strong>Parking Palais de Justice</strong> — 4 min à pied.",
        "<strong>Parking Espace du Palais</strong> — 3 min à pied.",
        "<strong>Parking Hôtel de Ville</strong> — 8 min à pied.",
        "Places en surface payantes rue Jeanne d'Arc et rues adjacentes (horodateurs)."
      ],
      velo: [
        "Station <strong>Lovélo</strong> Théâtre des Arts et Palais de Justice à proximité immédiate.",
        "Arceaux à vélo devant le n°80 et à l'angle de la rue aux Ours."
      ],
      pied: [
        "Depuis la <strong>Cathédrale Notre-Dame</strong> : 6 minutes par la rue du Gros-Horloge puis la rue Jeanne d'Arc.",
        "Depuis le <strong>Gros-Horloge</strong> : 4 minutes.",
        "Depuis la <strong>place du Vieux-Marché</strong> : 6 minutes."
      ],
      reperes: "La boutique se trouve sur la rue Jeanne d'Arc, l'artère principale qui relie la gare aux quais de Seine, entre la rue du Gros-Horloge et la rue aux Ours."
    }
  };

  /* ---------------------------------------------------------
     2. ARBORESCENCE DES RAYONS
     [ nom, icône, [ enfants ] ]  — un enfant peut lui-même
     être un sous-groupe : ['Robes', ['Robes courtes', ...]]
     Les articles ne vivent que dans les feuilles.
     --------------------------------------------------------- */
  const TREE = [
    ['Vêtements', '👗', [
      ['Robes', ['Robes courtes', 'Robes longues', 'Robes habillées', 'Robes décontractées']],
      ['Hauts', ['T-shirts', 'Tops', 'Chemisiers', 'Blouses']],
      ['Bas', ['Pantalons', 'Jeans', 'Jupes', 'Shorts']],
      ['Vestes', ['Vestes légères', 'Blazers', 'Gilets']],
      ['Textile', ['Pulls', 'Gilets', 'Ensembles']]
    ]],
    ['Chaussures', '👟', ['Baskets', 'Bottines', 'Sandales', 'Chaussures habillées']],
    ['Sacs & maroquinerie', '👜', ['Sacs à main', 'Sacs bandoulière', 'Sacs à dos', 'Petite maroquinerie']],
    ['Bijoux fantaisie', '💍', ['Colliers', 'Bracelets', "Boucles d'oreilles", 'Bagues']],
    ['Accessoires', '🧢', ['Ceintures', 'Écharpes', 'Accessoires cheveux', 'Autres accessoires de mode']]
  ];

  /* ---------------------------------------------------------
     3. CATALOGUE DE DÉPART
     clé = chemin de la feuille ; valeur = [nom, marque, prix, couleurs]
     --------------------------------------------------------- */
  const CATALOG = {
    'vetements/robes/robes-courtes': [
      ['Robe Camille', 'Atelier Blanche', 39.9, 'Noir, Écru, Rose poudré'],
      ['Robe Suzon plissée', 'Maison Lyra', 45, 'Bleu marine, Bordeaux'],
      ['Robe Lison à volants', 'Céleste', 35.9, 'Imprimé fleuri, Noir']
    ],
    'vetements/robes/robes-longues': [
      ['Robe Alma fluide', 'Maison Lyra', 55, 'Kaki, Noir, Écru'],
      ['Robe Ondine bohème', 'Ambre & Lin', 59.9, 'Imprimé fleuri, Beige'],
      ['Robe Colette portefeuille', 'Rive Gauche', 49.9, 'Bordeaux, Vert sapin']
    ],
    'vetements/robes/robes-habillees': [
      ['Robe Éléonore satinée', 'Nova Milano', 69.9, 'Noir, Bleu marine, Framboise'],
      ['Robe Margaux dentelle', 'Céleste', 79, 'Noir, Ivoire'],
      ['Robe Victoire cintrée', 'Maison Lyra', 65, 'Rouge, Noir']
    ],
    'vetements/robes/robes-decontractees': [
      ['Robe Jeanne en jersey', 'Sélection JN', 29.9, 'Gris chiné, Noir, Kaki'],
      ['Robe-chemise Anouk', 'Studio 76', 42, 'Denim, Écru'],
      ['Robe Nina en maille', 'Sélection JN', 34.9, 'Camel, Anthracite']
    ],
    'vetements/hauts/t-shirts': [
      ['T-shirt Basique coton bio', 'Sélection JN', 14.9, 'Blanc, Noir, Rose poudré, Kaki'],
      ['T-shirt Lila brodé', 'Camélia', 19.9, 'Écru, Bleu ciel'],
      ['T-shirt col V Manon', 'Sélection JN', 16.5, 'Blanc, Marine, Bordeaux']
    ],
    'vetements/hauts/tops': [
      ['Top Aurore satiné', 'Nova Milano', 24.9, 'Ivoire, Noir, Vert amande'],
      ['Top Zoé à bretelles', 'Céleste', 19.9, 'Noir, Blanc, Corail'],
      ['Top Iris dos nu', 'Lune Paris', 27.5, 'Framboise, Noir']
    ],
    'vetements/hauts/chemisiers': [
      ['Chemisier Adèle', 'Atelier Blanche', 34.9, 'Blanc, Bleu ciel, Rayé'],
      ['Chemisier Garance imprimé', 'Céleste', 39.9, 'Imprimé fleuri, Noir'],
      ['Chemisier Olivia en lin', 'Ambre & Lin', 44.9, 'Écru, Kaki, Blanc']
    ],
    'vetements/hauts/blouses': [
      ['Blouse Romane volantée', 'Maison Lyra', 32.9, 'Écru, Rose poudré'],
      ['Blouse Sarah col claudine', 'Camélia', 29.9, 'Blanc, Marine'],
      ['Blouse Faustine fluide', 'Rive Gauche', 36.5, 'Noir, Lilas']
    ],
    'vetements/bas/pantalons': [
      ['Pantalon Céline taille haute', 'Rive Gauche', 42.9, 'Noir, Camel, Marine'],
      ['Pantalon Palazzo Louise', 'Maison Lyra', 39.9, 'Écru, Noir'],
      ['Pantalon Nora carotte', 'Studio 76', 45, 'Kaki, Anthracite']
    ],
    'vetements/bas/jeans': [
      ['Jean Mom Charlie', 'Studio 76', 45.9, 'Denim, Bleu clair'],
      ['Jean Slim Emma', 'Verso', 39.9, 'Noir, Denim'],
      ['Jean Wide-leg Alice', 'Studio 76', 49.9, 'Bleu clair, Écru']
    ],
    'vetements/bas/jupes': [
      ['Jupe Rosalie plissée', 'Céleste', 34.9, 'Noir, Camel, Vert sapin'],
      ['Jupe Bérénice midi', 'Maison Lyra', 38.9, 'Imprimé fleuri, Marine'],
      ['Jupe Capucine en jean', 'Studio 76', 32.5, 'Denim, Blanc']
    ],
    'vetements/bas/shorts': [
      ['Short Léa en lin', 'Ambre & Lin', 27.9, 'Écru, Kaki, Blanc'],
      ['Short Chiara taille haute', 'Verso', 29.9, 'Noir, Denim'],
      ['Short Paloma fluide', 'Céleste', 24.9, 'Corail, Marine']
    ],
    'vetements/vestes/vestes-legeres': [
      ['Veste Ninon en jean', 'Studio 76', 49.9, 'Denim, Bleu clair, Noir'],
      ['Veste Éden coupe-vent', 'Verso', 45, 'Kaki, Marine'],
      ['Veste Salomé en lin', 'Ambre & Lin', 54.9, 'Écru, Beige']
    ],
    'vetements/vestes/blazers': [
      ['Blazer Constance', 'Rive Gauche', 69.9, 'Noir, Camel, Marine'],
      ['Blazer Héloïse oversize', 'Nova Milano', 75, 'Écru, Anthracite'],
      ['Blazer Apolline cintré', 'Maison Lyra', 65, 'Bordeaux, Noir']
    ],
    'vetements/vestes/gilets': [
      ['Gilet long Marceline', 'Camélia', 44.9, 'Camel, Gris chiné, Noir'],
      ['Gilet sans manches Ada', 'Verso', 39.9, 'Kaki, Écru'],
      ['Gilet matelassé Justine', 'Studio 76', 49.9, 'Noir, Marine']
    ],
    'vetements/textile/pulls': [
      ['Pull Amandine col rond', 'Camélia', 34.9, 'Écru, Rose poudré, Gris chiné'],
      ['Pull Blanche torsadé', 'Maison Lyra', 42.9, 'Ivoire, Camel'],
      ['Pull Perrine col roulé', 'Sélection JN', 29.9, 'Noir, Bordeaux, Vert sapin']
    ],
    'vetements/textile/gilets': [
      ['Gilet maille Séraphine', 'Camélia', 39.9, 'Écru, Camel'],
      ['Gilet boutonné Odette', 'Maison Lyra', 44.9, 'Marine, Gris chiné'],
      ['Gilet court Fanny', 'Sélection JN', 32.9, 'Rose poudré, Noir']
    ],
    'vetements/textile/ensembles': [
      ['Ensemble Milo maille', 'Camélia', 59.9, 'Écru, Camel, Noir'],
      ['Ensemble Théa short + top', 'Céleste', 54.9, 'Imprimé fleuri, Kaki'],
      ['Ensemble Rosa tailleur', 'Nova Milano', 89, 'Noir, Marine']
    ],
    'chaussures/baskets': [
      ['Baskets Lya', 'Verso', 45.9, 'Blanc, Écru, Noir'],
      ['Baskets rétro Nova', 'Verso', 52.9, 'Blanc, Rose poudré'],
      ['Baskets montantes Kim', 'Studio 76', 49.9, 'Noir, Beige']
    ],
    'chaussures/bottines': [
      ['Bottines Chelsea Rita', 'Bella Rosa', 59.9, 'Noir, Camel'],
      ['Bottines à talon Livia', 'Nova Milano', 69.9, 'Noir, Bordeaux'],
      ['Bottines fourrées Nova', 'Bella Rosa', 64.9, 'Marron, Noir']
    ],
    'chaussures/sandales': [
      ['Sandales Lina tressées', 'Bella Rosa', 34.9, 'Camel, Noir, Doré'],
      ['Sandales compensées Ava', 'Nova Milano', 44.9, 'Beige, Noir'],
      ['Nu-pieds Élia', 'Bella Rosa', 29.9, 'Doré, Argenté']
    ],
    'chaussures/chaussures-habillees': [
      ['Escarpins Éva', 'Nova Milano', 54.9, 'Noir, Rouge, Marine'],
      ['Ballerines Manon', 'Bella Rosa', 39.9, 'Noir, Beige, Rose poudré'],
      ['Mocassins Georgia', 'Bella Rosa', 49.9, 'Noir, Camel']
    ],
    'sacs-maroquinerie/sacs-a-main': [
      ['Sac Céleste cabas', 'Lune Paris', 45.9, 'Camel, Noir, Écru'],
      ['Sac Margot à main', 'Lune Paris', 39.9, 'Bordeaux, Noir'],
      ['Sac Olympe grainé', 'Verso', 52.9, 'Taupe, Noir']
    ],
    'sacs-maroquinerie/sacs-bandouliere': [
      ['Sac bandoulière Juliette', 'Lune Paris', 32.9, 'Noir, Camel, Rouge'],
      ['Sac besace Nine', 'Verso', 36.9, 'Marine, Taupe'],
      ['Pochette bandoulière Sofia', 'Lune Paris', 27.9, 'Doré, Noir']
    ],
    'sacs-maroquinerie/sacs-a-dos': [
      ['Sac à dos Léonie', 'Lune Paris', 44.9, 'Noir, Camel'],
      ['Sac à dos souple Maya', 'Verso', 39.9, 'Kaki, Taupe'],
      ['Petit sac à dos Zia', 'Lune Paris', 34.9, 'Rose poudré, Noir']
    ],
    'sacs-maroquinerie/petite-maroquinerie': [
      ['Portefeuille Alice', 'Lune Paris', 19.9, 'Noir, Camel, Bordeaux'],
      ['Porte-cartes Nova', 'Verso', 12.9, 'Noir, Doré'],
      ['Trousse Lilou', 'Lune Paris', 15.9, 'Rose poudré, Écru']
    ],
    'bijoux-fantaisie/colliers': [
      ['Collier Étoile', 'Camélia', 14.9, 'Doré, Argenté'],
      ['Sautoir Perle', 'Lune Paris', 19.9, 'Doré, Ivoire'],
      ['Collier ras-de-cou Nina', 'Camélia', 12.9, 'Argenté, Doré']
    ],
    'bijoux-fantaisie/bracelets': [
      ['Bracelet Jonc Livia', 'Camélia', 11.9, 'Doré, Argenté'],
      ['Bracelet perles Suzie', 'Lune Paris', 9.9, 'Multicolore, Doré'],
      ['Manchette Aria', 'Camélia', 16.9, 'Doré, Cuivre']
    ],
    'bijoux-fantaisie/boucles-d-oreilles': [
      ["Créoles Lou", 'Camélia', 9.9, 'Doré, Argenté'],
      ["Boucles pendantes Ines", 'Lune Paris', 14.9, 'Doré, Perle'],
      ["Puces d'oreilles Cléa", 'Camélia', 7.9, 'Argenté, Doré']
    ],
    'bijoux-fantaisie/bagues': [
      ['Bague fine Anna', 'Camélia', 8.9, 'Doré, Argenté'],
      ['Lot de 3 bagues Lila', 'Lune Paris', 12.9, 'Doré'],
      ['Bague ornée Vera', 'Camélia', 14.9, 'Argenté, Doré']
    ],
    'accessoires/ceintures': [
      ['Ceinture fine Aline', 'Verso', 15.9, 'Noir, Camel'],
      ['Ceinture large Rosalie', 'Lune Paris', 22.9, 'Noir, Bordeaux'],
      ['Ceinture tressée Nina', 'Verso', 18.9, 'Camel, Taupe']
    ],
    'accessoires/echarpes': [
      ['Écharpe Douceur', 'Camélia', 19.9, 'Gris chiné, Camel, Rose poudré'],
      ['Foulard Bloom', 'Céleste', 12.9, 'Imprimé fleuri, Marine'],
      ['Étole Chaleur', 'Camélia', 24.9, 'Écru, Bordeaux']
    ],
    'accessoires/accessoires-cheveux': [
      ['Barrette Perle', 'Lune Paris', 6.9, 'Doré, Ivoire'],
      ['Chouchou satin Lot de 3', 'Céleste', 8.9, 'Noir, Rose poudré, Ivoire'],
      ['Serre-tête Camille', 'Camélia', 11.9, 'Noir, Léopard']
    ],
    'accessoires/autres-accessoires-de-mode': [
      ['Bonnet Hiver', 'Camélia', 14.9, 'Gris chiné, Noir, Écru'],
      ['Gants tactiles Nova', 'Verso', 16.9, 'Noir, Camel'],
      ['Lunettes de soleil Riva', 'Lune Paris', 19.9, 'Noir, Écaille']
    ]
  };

  /* ---------------------------------------------------------
     4. GÉNÉRATION DES DESCRIPTIONS
     --------------------------------------------------------- */
  const INTROS = {
    'vetements': [
      "Une pièce facile à porter, à la coupe travaillée pour tomber juste sans jamais serrer.",
      "Une matière souple et agréable, choisie pour tenir la journée entière sans faux pli.",
      "Un basique de la garde-robe revisité par la boutique, à assumer du matin au soir.",
      "Une coupe qui suit la silhouette avec délicatesse et se marie avec tout le reste du dressing.",
      "Un joli tombé, des finitions soignées : le genre de pièce qu'on garde plusieurs saisons."
    ],
    'chaussures': [
      "Un modèle confortable dès le premier jour, pensé pour la marche en ville.",
      "Une semelle souple et un maintien impeccable, sans renoncer à l'allure.",
      "Une finition soignée et un chaussant fidèle à la pointure habituelle.",
      "Un modèle facile à assortir, qui se porte aussi bien en jean qu'en robe."
    ],
    'sacs-maroquinerie': [
      "Un format bien pensé : l'essentiel rentre sans que le sac ne s'alourdisse.",
      "Une matière au toucher agréable, des coutures nettes et une fermeture qui tient.",
      "Un intérieur organisé avec poche zippée, pour retrouver ses affaires du premier coup.",
      "Une pièce sobre qui accompagne toutes les tenues, du bureau au week-end."
    ],
    'bijoux-fantaisie': [
      "Un bijou léger, sans nickel, qui se porte toute la journée sans y penser.",
      "Une finition brillante qui attrape joliment la lumière, seule ou superposée.",
      "Un petit détail qui suffit à réveiller une tenue simple.",
      "Une pièce délicate, parfaite à offrir comme à s'offrir."
    ],
    'accessoires': [
      "L'accessoire qui change tout : discret, mais on ne voit que lui.",
      "Une matière douce et une finition nette, pour un usage quotidien.",
      "Un basique bien coupé, à assortir selon l'humeur du jour.",
      "Un joli complément de tenue, pratique et facile à ranger."
    ]
  };

  const OUTROS = [
    "Disponible en boutique au 86 rue Jeanne d'Arc à Rouen — passez l'essayer, on vous conseille avec plaisir.",
    "À voir et à essayer en boutique : les stocks évoluent chaque semaine.",
    "Une question sur la taille ou la couleur ? Appelez la boutique, on vérifie pour vous.",
    "Pièce disponible en quantité limitée : mieux vaut passer rapidement."
  ];

  const SIZES = {
    'vetements': ['XS', 'S', 'M', 'L', 'XL'],
    'chaussures': ['36', '37', '38', '39', '40', '41'],
    'sacs-maroquinerie': ['Taille unique'],
    'bijoux-fantaisie': ['Taille unique'],
    'accessoires': ['Taille unique']
  };

  w.SEED = { SHOP: SHOP, TREE: TREE, CATALOG: CATALOG, INTROS: INTROS, OUTROS: OUTROS, SIZES: SIZES };
})(window);
