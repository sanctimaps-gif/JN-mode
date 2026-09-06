/* =========================================================
   JN MODE — Pages publiques
   Chaque vue renvoie { html, after } ; « after » branche les
   interactions une fois le HTML injecté.
   ========================================================= */
(function (w) {
  'use strict';

  const V = {};
  const esc = U.esc;

  /* =======================================================
     BRIQUES RÉUTILISABLES
     ======================================================= */
  function productCard(p) {
    const img = Store.imagesOf(p)[0];
    const cat = Store.findCat(p.catId);
    const isNew = (Date.now() - new Date(p.createdAt).getTime()) < 1000 * 3600 * 24 * 21;
    const dots = (p.colors || []).slice(0, 5).map(function (c) {
      return '<i class="dot" style="background:' + esc(c.hex) + '" title="' + esc(c.name) + '"></i>';
    }).join('');

    return '' +
      '<a class="card" href="#/p/' + esc(p.id) + '">' +
        '<div class="card__media">' +
          '<img src="' + esc(img) + '" alt="' + esc(p.name) + '" loading="lazy" />' +
          (isNew ? '<span class="card__flag card__flag--new">Nouveauté</span>' : '') +
        '</div>' +
        '<div class="card__body">' +
          (p.brand ? '<span class="card__brand">' + esc(p.brand) + '</span>' : '') +
          '<span class="card__name">' + esc(p.name) + '</span>' +
          '<span class="card__meta">' + esc(cat ? cat.name : '') + '</span>' +
          '<span class="card__foot">' +
            '<span class="card__price">' + esc(U.price(p.price)) + '</span>' +
            '<span class="dots">' + dots + '</span>' +
          '</span>' +
        '</div>' +
      '</a>';
  }
  V.productCard = productCard;

  function grid(products) {
    if (!products.length) {
      return '<div class="empty"><h3>Rayon en cours de réassort</h3>' +
        '<p>Aucun article dans cette sous-catégorie pour le moment. Repassez très vite&nbsp;!</p></div>';
    }
    return '<div class="grid">' + products.map(productCard).join('') + '</div>';
  }

  function crumbs(nodes, tail) {
    const parts = ['<a href="#/">Accueil</a>'];
    (nodes || []).forEach(function (n) {
      parts.push('<span>›</span><a href="#/c/' + esc(n.id) + '">' + esc(n.name) + '</a>');
    });
    if (tail) parts.push('<span>›</span><span>' + esc(tail) + '</span>');
    return '<nav class="crumbs">' + parts.join('') + '</nav>';
  }

  function catCard(node) {
    const kids = node.children || [];
    const chips = kids.slice(0, 6).map(function (k) {
      return '<span class="cat__chip">' + esc(k.name) + '</span>';
    }).join('');
    const nb = Store.countIn(node.id);
    return '' +
      '<a class="cat" href="#/c/' + esc(node.id) + '">' +
        (node.icon ? '<span class="cat__icon">' + esc(node.icon) + '</span>' : '') +
        '<span class="cat__name">' + esc(node.name) + '</span>' +
        '<span class="cat__sub">' + (kids.length ? kids.length + ' catégories · ' : '') + nb + ' article' + (nb > 1 ? 's' : '') + '</span>' +
        (chips ? '<span class="cat__list">' + chips + '</span>' : '') +
      '</a>';
  }

  function hoursList(cls) {
    const today = Store.todayIndex();
    return (Store.state.shop.hours || []).map(function (h, i) {
      const val = h.closed || !h.open ? 'Fermé' : h.open.replace(':', 'h') + ' – ' + h.close.replace(':', 'h');
      return '<li class="' + (i === today ? 'is-today ' : '') + (h.closed ? 'is-closed' : '') + '">' +
        '<span class="h-day">' + esc(h.day) + '</span><span class="h-val">' + esc(val) + '</span></li>';
    }).join('');
  }
  V.hoursList = hoursList;

  /* =======================================================
     ACCUEIL
     ======================================================= */
  V.home = function () {
    const shop = Store.state.shop;
    const st = Store.openStatus();

    const html =
      '<section class="hero">' +
        '<p class="hero__eyebrow">86 rue Jeanne d\'Arc — Rouen</p>' +
        '<h1>La mode féminine,<br /><em>choisie une pièce à la fois.</em></h1>' +
        '<p>' + esc(shop.intro || '') + '</p>' +
        '<div class="hero__actions">' +
          '<a class="btn btn--gold" href="#/c/' + esc(Store.roots()[0] ? Store.roots()[0].id : '') + '">Découvrir les vêtements</a>' +
          '<a class="btn btn--ghost" style="color:#fff;border-color:rgba(255,255,255,.5)" href="#/acces">Venir à la boutique</a>' +
        '</div>' +
      '</section>' +

      '<section class="section">' +
        '<div class="section__head"><h2>Nos rayons</h2>' +
        '<p>' + esc(st.label) + ' · ' + esc(shop.address) + ', ' + esc(shop.postal) + ' ' + esc(shop.city) + '</p></div>' +
        '<div class="catgrid">' + Store.roots().map(catCard).join('') + '</div>' +
      '</section>' +

      '<section class="section">' +
        '<div class="section__head"><h2>Les nouveautés</h2>' +
        '<a class="section__more" href="#/nouveautes">Tout voir</a></div>' +
        grid(Store.newest(8)) +
      '</section>' +

      '<section class="section">' +
        '<div class="section__head"><h2>Coups de cœur de la boutique</h2>' +
        '<p>Notre sélection du moment</p></div>' +
        grid(Store.featured(4)) +
      '</section>';

    return { html: html };
  };

  /* =======================================================
     NOUVEAUTÉS
     ======================================================= */
  V.nouveautes = function () {
    return {
      html: crumbs([], 'Nouveautés') +
        '<section class="section"><div class="section__head"><h2>Les nouveautés</h2>' +
        '<p>Les dernières pièces arrivées en boutique</p></div>' +
        grid(Store.newest(24)) + '</section>'
    };
  };

  /* =======================================================
     CATÉGORIE / SOUS-CATÉGORIE
     ======================================================= */
  V.category = function (id, params) {
    const node = Store.findCat(id);
    if (!node) return V.notFound();
    const trail = Store.trail(id);
    const parents = trail.slice(0, -1);

    /* Catégorie intermédiaire : on montre uniquement ses sous-catégories */
    if (!Store.isLeaf(node)) {
      return {
        html: crumbs(parents, node.name) +
          '<section class="section">' +
            '<div class="section__head"><h2>' + (node.icon ? esc(node.icon) + ' ' : '') + esc(node.name) + '</h2>' +
            '<p>' + Store.countIn(node.id) + ' articles répartis dans ' + node.children.length + ' catégories</p></div>' +
            '<p class="hint" style="margin-bottom:18px">Choisissez une catégorie pour voir les articles.</p>' +
            '<div class="catgrid">' + node.children.map(catCard).join('') + '</div>' +
          '</section>'
      };
    }

    /* Feuille : le catalogue */
    let items = Store.productsIn(id).slice();
    const sort = (params && params.tri) || 'recent';
    const sorters = {
      recent: (a, b) => String(b.createdAt).localeCompare(String(a.createdAt)),
      prix: (a, b) => (a.price || 0) - (b.price || 0),
      'prix-desc': (a, b) => (b.price || 0) - (a.price || 0),
      nom: (a, b) => a.name.localeCompare(b.name, 'fr')
    };
    items.sort(sorters[sort] || sorters.recent);

    const opts = [['recent', 'Nouveautés'], ['prix', 'Prix croissant'],
                  ['prix-desc', 'Prix décroissant'], ['nom', 'Ordre alphabétique']]
      .map(o => '<option value="' + o[0] + '"' + (sort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('');

    const html =
      crumbs(parents, node.name) +
      '<section class="section">' +
        '<div class="section__head"><h2>' + esc(node.name) + '</h2>' +
        '<p>' + items.length + ' article' + (items.length > 1 ? 's' : '') + ' au catalogue</p></div>' +
        '<div class="toolbar">' +
          '<label for="triSel" style="margin-right:6px">Trier par</label>' +
          '<select id="triSel">' + opts + '</select>' +
          (Auth.isLogged() ? '<span class="toolbar__sp"></span><a class="btn btn--sm btn--gold" href="#/admin?tab=articles&cat=' + esc(node.id) + '">Ajouter un article ici</a>' : '') +
        '</div>' +
        grid(items) +
      '</section>';

    return {
      html: html,
      after: function () {
        const sel = document.getElementById('triSel');
        if (sel) sel.addEventListener('change', function () {
          location.hash = '#/c/' + node.id + '?tri=' + sel.value;
        });
      }
    };
  };

  /* =======================================================
     FICHE ARTICLE
     ======================================================= */
  V.product = function (id) {
    const p = Store.product(id);
    if (!p) return V.notFound();

    const trail = Store.trail(p.catId);
    const imgs = Store.imagesOf(p);
    const admin = Auth.isLogged();
    const rating = Store.ratingOf(p);
    const shop = Store.state.shop;

    /* --- Galerie (photos ajoutables / supprimables par la gérante) --- */
    const thumbs = imgs.map(function (src, i) {
      return '<button class="thumb' + (i === 0 ? ' is-active' : '') + '" data-thumb="' + i + '" type="button">' +
        '<img src="' + esc(src) + '" alt="Visuel ' + (i + 1) + '" />' +
        (admin && Store.hasPhotos(p) ? '<span class="thumb__del" data-delimg="' + i + '" title="Retirer cette photo">×</span>' : '') +
        '</button>';
    }).join('') +
    (admin ? '<button class="thumb thumb--add" id="addPhoto" type="button" title="Ajouter une photo">+</button>' : '');

    /* --- Tailles --- */
    const out = p.sizesOut || [];
    const sizes = (p.sizes || []).length
      ? (p.sizes || []).map(function (s) {
          const off = out.indexOf(s) !== -1;
          return '<span class="chip' + (off ? ' chip--off' : '') + '"' +
            (off ? ' title="Momentanément épuisée"' : '') + '>' + esc(s) + '</span>';
        }).join('')
      : '<span class="hint">Tailles à confirmer en boutique.</span>';

    /* --- Couleurs --- */
    const colors = (p.colors || []).length
      ? (p.colors || []).map(function (c) {
          return '<span class="swatch"><i style="background:' + esc(c.hex) + '"></i>' + esc(c.name) + '</span>';
        }).join('')
      : '<span class="hint">Coloris disponibles en boutique.</span>';

    /* --- Avis --- */
    const reviewsHtml = (p.reviews || []).length
      ? (p.reviews || []).map(function (r) {
          return '<article class="review">' +
            '<div class="review__top">' +
              '<span class="review__name">' + esc(r.name) + '</span>' +
              '<span class="stars">' + U.stars(r.rating) + '</span>' +
              '<span class="review__date">' + esc(U.dateFR(r.date)) + '</span>' +
            '</div>' +
            (r.text ? '<p class="review__txt">' + esc(r.text) + '</p>' : '') +
            (admin ? '<button class="review__del" data-delrev="' + esc(r.id) + '" type="button">Supprimer cet avis</button>' : '') +
          '</article>';
        }).join('')
      : '<p class="hint">Aucun avis pour le moment — soyez la première à donner le vôtre.</p>';

    const similar = Store.similar(p, 6);

    const html =
      crumbs(trail.slice(0, -1), (trail[trail.length - 1] || {}).name) +

      '<div class="product">' +
        /* ---------- LA PHOTO ---------- */
        '<div class="gallery">' +
          '<div class="gallery__main">' +
            '<img id="mainImg" src="' + esc(imgs[0]) + '" alt="' + esc(p.name) + '" />' +
            (imgs.length > 1 ?
              '<div class="gallery__nav">' +
                '<button type="button" data-step="-1" aria-label="Photo précédente">‹</button>' +
                '<button type="button" data-step="1" aria-label="Photo suivante">›</button>' +
              '</div>' : '') +
          '</div>' +
          '<div class="gallery__thumbs" id="thumbs">' + thumbs + '</div>' +
          (admin ? '<p class="hint">Espace gérante : cliquez sur « + » pour ajouter une photo, sur « × » pour en retirer une.</p>' : '') +
        '</div>' +

        /* ---------- LES INFORMATIONS SOUS LA PHOTO ---------- */
        '<div class="pinfo">' +
          (p.brand ? '<p class="pinfo__brand">' + esc(p.brand) + '</p>' : '') +
          '<h1>' + esc(p.name) + '</h1>' +
          '<p class="pinfo__price">' + esc(U.price(p.price)) + '</p>' +
          (rating.count ?
            '<div class="rating"><span class="stars">' + U.stars(rating.avg) + '</span>' +
            '<span class="rating__score">' + String(rating.avg).replace('.', ',') + '/5</span>' +
            '<span class="rating__count">' + rating.count + ' avis</span></div>' : '') +
          '<p class="pinfo__ref">Référence ' + esc(p.ref || '—') + '</p>' +

          '<div class="block"><p class="block__title">Marque</p>' +
            '<p style="margin:0;font-size:16px">' + esc(p.brand || 'Sélection de la boutique') + '</p></div>' +

          '<div class="block"><p class="block__title">Tailles disponibles</p>' +
            '<div class="chips">' + sizes + '</div>' +
            (out.length ? '<p class="hint" style="margin-top:8px">Les tailles barrées sont momentanément épuisées.</p>' : '') +
          '</div>' +

          '<div class="block"><p class="block__title">Couleurs disponibles</p>' +
            '<div class="swatches">' + colors + '</div></div>' +

          '<div class="block"><p class="block__title">Description</p>' +
            '<p class="desc">' + esc(p.description || '') + '</p>' +
            (p.material ? '<p class="hint" style="margin-top:8px">Composition : ' + esc(p.material) + '</p>' : '') +
          '</div>' +

          '<div class="block">' +
            '<p class="block__title">Réserver / se renseigner</p>' +
            '<p class="hint">Cet article est vendu en boutique. Appelez le ' + esc(shop.phone || '') +
            ' ou passez au ' + esc(shop.address) + ' pour l\'essayer.</p>' +
            (admin ? '<p style="margin-top:12px"><a class="btn btn--sm btn--gold" href="#/admin?tab=articles&edit=' + esc(p.id) + '">Modifier cet article</a></p>' : '') +
          '</div>' +
        '</div>' +
      '</div>' +

      /* ---------- LES AVIS ---------- */
      '<section class="section" id="avis">' +
        '<div class="section__head"><h2>Avis des clientes</h2>' +
        '<p>' + (rating.count ? rating.count + ' avis · note moyenne ' + String(rating.avg).replace('.', ',') + '/5' : 'Aucun avis pour l\'instant') + '</p></div>' +
        '<div class="reviews">' + reviewsHtml + '</div>' +

        '<div class="panel" style="max-width:640px">' +
          '<h3>Donner mon avis</h3>' +
          '<p class="hint">Votre retour aide les autres clientes à se décider.</p>' +
          '<form class="form" id="reviewForm">' +
            '<div class="form__row"><label for="rvName">Votre prénom</label>' +
              '<input type="text" id="rvName" maxlength="40" required /></div>' +
            '<div class="form__row"><label>Votre note</label>' +
              '<div class="starpick" id="starPick">' +
                [1, 2, 3, 4, 5].map(n => '<button type="button" data-star="' + n + '" aria-label="' + n + ' étoile(s)">★</button>').join('') +
              '</div><input type="hidden" id="rvRating" value="0" /></div>' +
            '<div class="form__row"><label for="rvText">Votre commentaire</label>' +
              '<textarea id="rvText" maxlength="1200" placeholder="Coupe, taille, qualité, accueil en boutique…"></textarea></div>' +
            '<button class="btn btn--gold" type="submit">Publier mon avis</button>' +
          '</form>' +
        '</div>' +
      '</section>' +

      /* ---------- LES ARTICLES SIMILAIRES ---------- */
      '<section class="section">' +
        '<div class="section__head"><h2>Vous aimerez aussi</h2>' +
        '<p>Des articles proches, dans le même esprit</p></div>' +
        (similar.length ? '<div class="grid">' + similar.map(productCard).join('') + '</div>'
                        : '<p class="hint">Pas encore d\'article similaire dans ce rayon.</p>') +
      '</section>';

    return {
      html: html,
      after: function () {
        let idx = 0;
        const main = document.getElementById('mainImg');
        const list = Store.imagesOf(Store.product(id));

        function show(i) {
          idx = (i + list.length) % list.length;
          main.src = list[idx];
          U.$$('#thumbs .thumb[data-thumb]').forEach(function (b) {
            b.classList.toggle('is-active', Number(b.dataset.thumb) === idx);
          });
        }

        U.$$('.gallery__nav button').forEach(function (b) {
          b.addEventListener('click', function () { show(idx + Number(b.dataset.step)); });
        });

        U.$$('#thumbs .thumb[data-thumb]').forEach(function (b) {
          b.addEventListener('click', function (e) {
            if (e.target.dataset.delimg !== undefined) return;
            show(Number(b.dataset.thumb));
          });
        });

        /* Gestion des photos (gérante) */
        U.$$('[data-delimg]').forEach(function (x) {
          x.addEventListener('click', function (e) {
            e.stopPropagation(); e.preventDefault();
            if (!confirm('Retirer cette photo de l\'article ?')) return;
            Store.removeImage(id, Number(x.dataset.delimg));
            App.render();
          });
        });

        const add = document.getElementById('addPhoto');
        if (add) add.addEventListener('click', function () {
          Media.pickImage().then(function (dataUrl) {
            const r = Store.addImage(id, dataUrl);
            if (!r.ok && r.msg) U.toast(r.msg);
            App.render();
          }).catch(function (err) {
            if (err && err.message && err.message !== 'annulé') U.toast(err.message);
          });
        });

        /* Avis */
        const pick = document.getElementById('starPick');
        const hidden = document.getElementById('rvRating');
        if (pick) {
          U.$$('button', pick).forEach(function (b) {
            b.addEventListener('click', function () {
              const n = Number(b.dataset.star);
              hidden.value = n;
              U.$$('button', pick).forEach(function (o) {
                o.classList.toggle('is-on', Number(o.dataset.star) <= n);
              });
            });
          });
        }

        const form = document.getElementById('reviewForm');
        if (form) form.addEventListener('submit', function (e) {
          e.preventDefault();
          const r = Store.addReview(id, {
            name: document.getElementById('rvName').value,
            rating: hidden.value,
            text: document.getElementById('rvText').value
          });
          if (!r.ok) { U.toast(r.msg); return; }
          App.render();
          const a = document.getElementById('avis');
          if (a) a.scrollIntoView({ behavior: 'smooth' });
        });

        U.$$('[data-delrev]').forEach(function (b) {
          b.addEventListener('click', function () {
            if (!confirm('Supprimer cet avis ?')) return;
            Store.deleteReview(id, b.dataset.delrev);
            App.render();
          });
        });
      }
    };
  };

  /* =======================================================
     PLANS D'ACCÈS
     ======================================================= */
  V.acces = function () {
    const shop = Store.state.shop;
    const a = shop.access || {};
    const li = function (arr) {
      return '<ul>' + (arr || []).map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>';
    };

    const html =
      crumbs([], 'Plans d\'accès') +
      '<section class="section">' +
        '<div class="section__head"><h2>Venir à la boutique</h2>' +
        '<p>' + esc(shop.address) + ' — ' + esc(shop.postal) + ' ' + esc(shop.city) + '</p></div>' +

        (a.mapEmbed ?
          '<div class="map"><iframe title="Plan d\'accès JN Mode" src="' + esc(a.mapEmbed) + '" loading="lazy"></iframe></div>' +
          '<p class="hint" style="margin:-8px 0 16px">' + esc(shop.name) + ' — ' + esc(shop.address) + ', ' +
          esc(shop.postal) + ' ' + esc(shop.city) + '. Si le plan ne s\'affiche pas, utilisez le bouton « Ouvrir le plan en grand ».</p>'
          : '') +

        '<div class="toolbar" style="margin-bottom:26px">' +
          (a.itineraire ? '<a class="btn btn--gold btn--sm" href="' + esc(a.itineraire) + '" target="_blank" rel="noopener">Lancer l\'itinéraire</a>' : '') +
          (a.mapLink ? '<a class="btn btn--ghost btn--sm" href="' + esc(a.mapLink) + '" target="_blank" rel="noopener">Ouvrir le plan en grand</a>' : '') +
          (shop.phone ? '<a class="btn btn--ghost btn--sm" href="tel:' + esc(shop.phone.replace(/\s/g, '')) + '">Appeler la boutique</a>' : '') +
        '</div>' +

        (a.reperes ? '<div class="alert">' + a.reperes + '</div>' : '') +

        '<div class="access">' +
          '<div class="access__card"><h3>🚇 En métro</h3>' + li(a.metro) + '</div>' +
          '<div class="access__card"><h3>🚌 En bus &amp; TEOR</h3>' + li(a.bus) + '</div>' +
          '<div class="access__card"><h3>🚆 En train</h3>' + li(a.train) + '</div>' +
          '<div class="access__card"><h3>🚗 En voiture</h3>' + li(a.voiture) + '</div>' +
          '<div class="access__card"><h3>🅿️ Où se garer</h3>' + li(a.parkings) + '</div>' +
          '<div class="access__card"><h3>🚲 À vélo</h3>' + li(a.velo) + '</div>' +
          '<div class="access__card"><h3>🚶‍♀️ À pied</h3>' + li(a.pied) + '</div>' +
          '<div class="access__card"><h3>🕒 Horaires d\'ouverture</h3><ul class="hours">' + hoursList() + '</ul>' +
            (shop.hoursNote ? '<p class="hint" style="margin-top:10px">' + esc(shop.hoursNote) + '</p>' : '') + '</div>' +
        '</div>' +
      '</section>';

    return { html: html };
  };

  /* =======================================================
     LA MAISON JN MODE
     ======================================================= */
  V.boutique = function () {
    const shop = Store.state.shop;
    const st = Store.openStatus();
    return {
      html: crumbs([], 'La maison JN Mode') +
        '<section class="section"><div class="section__head"><h2>La maison JN Mode</h2>' +
        '<p>' + esc(st.label) + '</p></div>' +
        '<div class="prose"><p style="white-space:pre-line">' + esc(shop.about || '') + '</p></div>' +
        '<div class="access" style="margin-top:32px">' +
          '<div class="access__card"><h3>📍 Adresse</h3><p>' + esc(shop.address) + '<br />' +
            esc(shop.postal) + ' ' + esc(shop.city) + '<br />' + esc(shop.country) + '</p>' +
            '<a class="btn btn--sm btn--ghost" href="#/acces">Plans d\'accès</a></div>' +
          '<div class="access__card"><h3>📞 Contact</h3>' +
            (shop.phone ? '<p><a href="tel:' + esc(shop.phone.replace(/\s/g, '')) + '">' + esc(shop.phone) + '</a></p>' : '') +
            (shop.email ? '<p><a href="mailto:' + esc(shop.email) + '">' + esc(shop.email) + '</a></p>' : '') +
            (shop.instagram ? '<p><a href="' + esc(shop.instagram) + '" target="_blank" rel="noopener">Instagram de la boutique</a></p>' : '') +
            (shop.facebook ? '<p><a href="' + esc(shop.facebook) + '" target="_blank" rel="noopener">Page Facebook</a></p>' : '') +
          '</div>' +
          '<div class="access__card"><h3>🕒 Horaires</h3><ul class="hours">' + hoursList() + '</ul></div>' +
        '</div></section>'
    };
  };

  /* =======================================================
     RECHERCHE
     ======================================================= */
  V.search = function (q) {
    const res = Store.search(q);
    return {
      html: crumbs([], 'Recherche') +
        '<section class="section"><div class="section__head"><h2>« ' + esc(q) + ' »</h2>' +
        '<p>' + res.length + ' résultat' + (res.length > 1 ? 's' : '') + '</p></div>' +
        (res.length ? grid(res) :
          '<div class="empty"><h3>Aucun résultat</h3><p>Essayez avec un autre mot : une marque, une couleur, un type de vêtement.</p></div>') +
        '</section>'
    };
  };

  /* =======================================================
     MENTIONS LÉGALES
     ======================================================= */
  V.mentions = function () {
    const shop = Store.state.shop;
    return {
      html: crumbs([], 'Mentions légales') +
        '<section class="section"><div class="section__head"><h2>Mentions légales</h2></div>' +
        '<div class="prose">' +
          '<h3>Éditeur du site</h3>' +
          '<p>' + esc(shop.name) + ' — ' + esc(shop.address) + ', ' + esc(shop.postal) + ' ' + esc(shop.city) + ', ' + esc(shop.country) + '.<br />' +
          (shop.phone ? 'Téléphone : ' + esc(shop.phone) + '<br />' : '') +
          (shop.email ? 'Courriel : ' + esc(shop.email) : '') + '</p>' +
          '<h3>Contenu du site</h3>' +
          '<p>Les articles présentés sont vendus exclusivement en boutique. Les disponibilités, les tailles et ' +
          'les coloris évoluent au fil des arrivages : ils sont donnés à titre indicatif et confirmés en magasin.</p>' +
          '<h3>Avis des clientes</h3>' +
          '<p>Les avis sont publiés sous la responsabilité de leurs auteurs. La boutique se réserve le droit de ' +
          'retirer tout avis contraire à la loi ou sans rapport avec les articles présentés.</p>' +
          '<h3>Données</h3>' +
          '<p>Ce site n\'utilise aucun traceur publicitaire. Les avis déposés et le catalogue sont conservés ' +
          'dans le navigateur utilisé pour la consultation.</p>' +
          '<h3>Création du site</h3>' +
          '<p>Site conçu et développé sur mesure. Pour toute demande de création de site, écrivez à ' +
          '<a href="mailto:Sanctimaps@gmail.com">Sanctimaps@gmail.com</a>.</p>' +
        '</div></section>'
    };
  };

  V.notFound = function () {
    return {
      html: '<div class="empty"><h3>Page introuvable</h3>' +
        '<p>Ce contenu n\'existe plus ou a été déplacé.</p>' +
        '<p style="margin-top:18px"><a class="btn btn--sm" href="#/">Retour à l\'accueil</a></p></div>'
    };
  };

  w.Views = V;
})(window);
