/* =========================================================
   JN MODE — Données de l'application
   Persistance : navigateur (localStorage).
   Toute la logique métier (rayons, articles, avis) est ici.
   ========================================================= */
(function (w) {
  'use strict';

  const KEY = 'jnmode.data.v1';
  const VERSION = 1;

  const S = {
    state: null,
    listeners: []
  };

  /* =======================================================
     CONSTRUCTION DES DONNÉES INITIALES
     ======================================================= */
  function buildTree() {
    const roots = [];

    function mkNode(name, icon, parentPath) {
      const slugPath = (parentPath ? parentPath + '/' : '') + U.slug(name);
      return { id: U.uid('cat'), name: name, icon: icon || '', path: slugPath, children: [] };
    }

    SEED.TREE.forEach(function (rootSpec) {
      const root = mkNode(rootSpec[0], rootSpec[1], '');
      const kids = rootSpec[2] || [];
      kids.forEach(function (k) {
        if (typeof k === 'string') {
          root.children.push(mkNode(k, '', root.path));
        } else {
          const group = mkNode(k[0], '', root.path);
          (k[1] || []).forEach(function (leaf) {
            group.children.push(mkNode(leaf, '', group.path));
          });
          root.children.push(group);
        }
      });
      roots.push(root);
    });
    return roots;
  }

  function buildProducts(tree) {
    const list = [];
    let seq = 0;

    walkAll(tree, function (node, ancestors) {
      if (node.children.length) return;                 // seules les feuilles portent des articles
      const rows = SEED.CATALOG[node.path] || [];
      const rootSlug = (ancestors[0] || node).path.split('/')[0];
      const intros = SEED.INTROS[rootSlug] || SEED.INTROS['vetements'];
      const icon = (ancestors[0] || node).icon || '';

      rows.forEach(function (row, i) {
        const colors = U.splitList(row[3]).map(function (c) {
          return { name: c, hex: U.hexOf(c) };
        });
        const desc =
          intros[(seq + i) % intros.length] + ' ' +
          SEED.OUTROS[(seq + i) % SEED.OUTROS.length];

        list.push({
          id: U.uid('art'),
          catId: node.id,
          name: row[0],
          brand: row[1],
          price: row[2],
          ref: 'JN-' + String(1000 + seq + i),
          sizes: (SEED.SIZES[rootSlug] || ['Taille unique']).slice(),
          sizesOut: [],
          colors: colors,
          description: desc,
          material: '',
          images: [],                                    // vide = visuel généré
          reviews: [],
          featured: (seq + i) % 17 === 0,
          createdAt: new Date(Date.now() - (seq + i) * 36e5).toISOString(),
          _glyph: icon
        });
      });
      seq += rows.length;
    });

    return list;
  }

  function freshState() {
    const tree = buildTree();
    return {
      version: VERSION,
      shop: U.deep(SEED.SHOP),
      tree: tree,
      products: buildProducts(tree),
      admin: null,                                       // créé au premier accès (voir auth.js)
      savedAt: new Date().toISOString()
    };
  }

  /* =======================================================
     CHARGEMENT / SAUVEGARDE
     ======================================================= */
  S.load = function () {
    let raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { raw = null; }

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.tree && parsed.products) {
          S.state = parsed;
          if (!S.state.shop.access) S.state.shop.access = U.deep(SEED.SHOP.access);
          return S.state;
        }
      } catch (e) { /* données illisibles : on repart du catalogue de base */ }
    }
    S.state = freshState();
    S.save();
    return S.state;
  };

  S.save = function () {
    if (!S.state) return false;
    S.state.savedAt = new Date().toISOString();
    try {
      localStorage.setItem(KEY, JSON.stringify(S.state));
      return true;
    } catch (e) {
      U.toast("Mémoire du navigateur saturée : allégez les photos ou exportez vos données.");
      return false;
    }
  };

  S.commit = function (msg) {
    const ok = S.save();
    S.listeners.forEach(function (fn) { try { fn(); } catch (e) {} });
    if (msg && ok) U.toast(msg);
    return ok;
  };

  S.onChange = function (fn) { S.listeners.push(fn); };

  S.reset = function () {
    S.state = freshState();
    S.commit('Catalogue réinitialisé.');
  };

  /* =======================================================
     PARCOURS DE L'ARBORESCENCE
     ======================================================= */
  function walkAll(nodes, cb, ancestors) {
    ancestors = ancestors || [];
    (nodes || []).forEach(function (n) {
      cb(n, ancestors);
      if (n.children && n.children.length) walkAll(n.children, cb, ancestors.concat([n]));
    });
  }
  S.walk = function (cb) { walkAll(S.state.tree, cb, []); };

  S.roots = function () { return S.state.tree; };

  S.findCat = function (id) {
    let found = null;
    walkAll(S.state.tree, function (n) { if (n.id === id) found = n; });
    return found;
  };

  S.findCatByPath = function (path) {
    let found = null;
    walkAll(S.state.tree, function (n) { if (n.path === path) found = n; });
    return found;
  };

  /* Chaîne d'ancêtres (du rayon principal jusqu'à la catégorie) */
  S.trail = function (id) {
    let trail = null;
    walkAll(S.state.tree, function (n, anc) { if (n.id === id) trail = anc.concat([n]); });
    return trail || [];
  };

  S.parentOf = function (id) {
    const t = S.trail(id);
    return t.length > 1 ? t[t.length - 2] : null;
  };

  S.siblingsOf = function (id) {
    const p = S.parentOf(id);
    return p ? p.children : S.state.tree;
  };

  S.isLeaf = function (node) { return !!node && (!node.children || node.children.length === 0); };

  S.leafIds = function (id) {
    const node = S.findCat(id);
    if (!node) return [];
    const ids = [];
    (function rec(n) {
      if (!n.children || !n.children.length) { ids.push(n.id); return; }
      n.children.forEach(rec);
    })(node);
    return ids;
  };

  S.countIn = function (id) {
    const leaves = S.leafIds(id);
    return S.state.products.filter(function (p) { return leaves.indexOf(p.catId) !== -1; }).length;
  };

  /* =======================================================
     ARTICLES
     ======================================================= */
  S.productsIn = function (catId) {
    const leaves = S.leafIds(catId);
    return S.state.products.filter(function (p) { return leaves.indexOf(p.catId) !== -1; });
  };

  S.product = function (id) {
    return S.state.products.find(function (p) { return p.id === id; }) || null;
  };

  S.newest = function (n) {
    return S.state.products.slice()
      .sort(function (a, b) { return String(b.createdAt).localeCompare(String(a.createdAt)); })
      .slice(0, n || 8);
  };

  S.featured = function (n) {
    const f = S.state.products.filter(function (p) { return p.featured; });
    return (f.length ? f : S.newest(n || 8)).slice(0, n || 8);
  };

  /* Articles similaires : même catégorie, puis catégories voisines */
  S.similar = function (product, n) {
    n = n || 6;
    if (!product) return [];
    const same = S.state.products.filter(function (p) {
      return p.catId === product.catId && p.id !== product.id;
    });
    const parent = S.parentOf(product.catId);
    let near = [];
    if (parent) {
      const ids = S.leafIds(parent.id);
      near = S.state.products.filter(function (p) {
        return p.id !== product.id && p.catId !== product.catId && ids.indexOf(p.catId) !== -1;
      });
    }
    const trail = S.trail(product.catId);
    let wide = [];
    if (trail.length) {
      const rootIds = S.leafIds(trail[0].id);
      wide = S.state.products.filter(function (p) {
        return p.id !== product.id && rootIds.indexOf(p.catId) !== -1;
      });
    }
    const seen = {}; const out = [];
    same.concat(near, wide).forEach(function (p) {
      if (out.length >= n || seen[p.id]) return;
      seen[p.id] = 1; out.push(p);
    });
    return out;
  };

  S.search = function (q) {
    const needle = U.norm(q).trim();
    if (needle.length < 2) return [];
    return S.state.products.filter(function (p) {
      const cat = S.findCat(p.catId);
      const hay = U.norm([
        p.name, p.brand, p.description, p.ref,
        (p.colors || []).map(c => c.name).join(' '),
        cat ? cat.name : ''
      ].join(' '));
      return needle.split(/\s+/).every(function (t) { return hay.indexOf(t) !== -1; });
    });
  };

  /* Visuels d'un article (photos chargées, sinon visuel généré) */
  S.imagesOf = function (p) {
    if (p.images && p.images.length) return p.images;
    const hex = (p.colors && p.colors[0]) ? p.colors[0].hex : '#e3dbd1';
    return [Media.placeholder(p.name, hex, p._glyph || '')];
  };

  S.hasPhotos = function (p) { return !!(p.images && p.images.length); };

  /* Note moyenne */
  S.ratingOf = function (p) {
    const rs = p.reviews || [];
    if (!rs.length) return { avg: 0, count: 0 };
    const sum = rs.reduce(function (a, r) { return a + (Number(r.rating) || 0); }, 0);
    return { avg: Math.round((sum / rs.length) * 10) / 10, count: rs.length };
  };

  /* =======================================================
     ÉCRITURES — RAYONS
     ======================================================= */
  function rebuildPaths() {
    (function rec(nodes, prefix) {
      nodes.forEach(function (n) {
        n.path = (prefix ? prefix + '/' : '') + U.slug(n.name);
        if (n.children && n.children.length) rec(n.children, n.path);
      });
    })(S.state.tree, '');
  }

  S.addCat = function (parentId, name, icon) {
    name = String(name || '').trim();
    if (!name) return { ok: false, msg: 'Le nom est obligatoire.' };

    const parent = parentId ? S.findCat(parentId) : null;
    if (parentId && !parent) return { ok: false, msg: 'Catégorie parente introuvable.' };

    if (parent && S.isLeaf(parent) && S.productsIn(parent.id).length) {
      return {
        ok: false,
        msg: '« ' + parent.name + ' » contient déjà des articles. Déplacez-les avant d\'y créer une sous-catégorie.'
      };
    }

    const list = parent ? parent.children : S.state.tree;
    const clash = list.some(function (n) { return U.slug(n.name) === U.slug(name); });
    if (clash) return { ok: false, msg: 'Une catégorie porte déjà ce nom à cet endroit.' };

    const node = { id: U.uid('cat'), name: name, icon: icon || '', path: '', children: [] };
    list.push(node);
    rebuildPaths();
    S.commit('Catégorie « ' + name + ' » ajoutée.');
    return { ok: true, id: node.id };
  };

  S.renameCat = function (id, name, icon) {
    const n = S.findCat(id);
    if (!n) return { ok: false, msg: 'Catégorie introuvable.' };
    name = String(name || '').trim();
    if (!name) return { ok: false, msg: 'Le nom est obligatoire.' };
    n.name = name;
    if (icon !== undefined) n.icon = icon;
    rebuildPaths();
    S.commit('Catégorie mise à jour.');
    return { ok: true };
  };

  S.moveCat = function (id, dir) {
    const list = S.siblingsOf(id);
    const i = list.findIndex(function (n) { return n.id === id; });
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return { ok: false };
    const tmp = list[i]; list[i] = list[j]; list[j] = tmp;
    S.commit();
    return { ok: true };
  };

  /* Suppression : mode 'refuse' (par défaut) ou 'cascade' */
  S.deleteCat = function (id, mode) {
    const node = S.findCat(id);
    if (!node) return { ok: false, msg: 'Catégorie introuvable.' };
    const nb = S.countIn(id);
    if (nb && mode !== 'cascade') {
      return {
        ok: false, needConfirm: true, count: nb,
        msg: 'Cette catégorie contient ' + nb + ' article(s).'
      };
    }
    const leaves = S.leafIds(id);
    S.state.products = S.state.products.filter(function (p) { return leaves.indexOf(p.catId) === -1; });

    const list = S.siblingsOf(id);
    const i = list.findIndex(function (n) { return n.id === id; });
    if (i >= 0) list.splice(i, 1);

    S.commit('Catégorie « ' + node.name + ' » supprimée.');
    return { ok: true };
  };

  /* Toutes les feuilles (pour les listes déroulantes de l'admin) */
  S.allLeaves = function () {
    const out = [];
    walkAll(S.state.tree, function (n, anc) {
      if (!n.children.length) {
        out.push({ id: n.id, label: anc.map(a => a.name).concat([n.name]).join(' › ') });
      }
    }, []);
    return out;
  };

  /* =======================================================
     ÉCRITURES — ARTICLES
     ======================================================= */
  S.saveProduct = function (data) {
    const isNew = !data.id;
    let p = isNew ? null : S.product(data.id);

    if (!data.catId) return { ok: false, msg: 'Choisissez une sous-catégorie.' };
    const cat = S.findCat(data.catId);
    if (!cat) return { ok: false, msg: 'Sous-catégorie introuvable.' };
    if (!S.isLeaf(cat)) return { ok: false, msg: 'Les articles se rangent uniquement dans une sous-catégorie.' };
    if (!String(data.name || '').trim()) return { ok: false, msg: "Le nom de l'article est obligatoire." };

    if (isNew) {
      p = {
        id: U.uid('art'), reviews: [], images: [], createdAt: new Date().toISOString(),
        ref: 'JN-' + String(1000 + S.state.products.length + 1)
      };
      S.state.products.push(p);
    }

    p.catId = data.catId;
    p.name = String(data.name).trim();
    p.brand = String(data.brand || '').trim();
    p.price = Number(String(data.price || '').replace(',', '.')) || 0;
    p.ref = String(data.ref || p.ref || '').trim();
    p.sizes = Array.isArray(data.sizes) ? data.sizes : U.splitList(data.sizes);
    p.sizesOut = Array.isArray(data.sizesOut) ? data.sizesOut : U.splitList(data.sizesOut);
    p.material = String(data.material || '').trim();
    p.description = String(data.description || '').trim();
    p.featured = !!data.featured;
    p.colors = (Array.isArray(data.colors) ? data.colors : U.splitList(data.colors))
      .map(function (c) {
        return typeof c === 'string' ? { name: c, hex: U.hexOf(c) } : { name: c.name, hex: c.hex || U.hexOf(c.name) };
      });
    if (data.images) p.images = data.images;
    if (!p.reviews) p.reviews = [];

    const trail = S.trail(p.catId);
    p._glyph = trail.length ? trail[0].icon : '';

    S.commit(isNew ? 'Article ajouté au catalogue.' : 'Article mis à jour.');
    return { ok: true, id: p.id };
  };

  S.deleteProduct = function (id) {
    const i = S.state.products.findIndex(function (p) { return p.id === id; });
    if (i < 0) return { ok: false };
    const name = S.state.products[i].name;
    S.state.products.splice(i, 1);
    S.commit('« ' + name + ' » supprimé.');
    return { ok: true };
  };

  S.addImage = function (productId, dataUrl) {
    const p = S.product(productId);
    if (!p) return { ok: false };
    if (!p.images) p.images = [];
    if (p.images.length >= 8) return { ok: false, msg: '8 photos maximum par article.' };
    p.images.push(dataUrl);
    const ok = S.commit('Photo ajoutée.');
    return { ok: ok };
  };

  S.removeImage = function (productId, index) {
    const p = S.product(productId);
    if (!p || !p.images) return { ok: false };
    p.images.splice(index, 1);
    S.commit('Photo retirée.');
    return { ok: true };
  };

  /* =======================================================
     AVIS CLIENTES
     ======================================================= */
  S.addReview = function (productId, review) {
    const p = S.product(productId);
    if (!p) return { ok: false, msg: 'Article introuvable.' };
    const name = String(review.name || '').trim();
    const text = String(review.text || '').trim();
    const rating = Math.min(5, Math.max(1, Number(review.rating) || 0));
    if (!name) return { ok: false, msg: 'Merci d\'indiquer votre prénom.' };
    if (!rating) return { ok: false, msg: 'Merci de donner une note.' };
    if (text.length > 1200) return { ok: false, msg: 'Avis trop long (1200 caractères maximum).' };

    if (!p.reviews) p.reviews = [];
    p.reviews.unshift({
      id: U.uid('avis'), name: name.slice(0, 40), rating: rating,
      text: text, date: new Date().toISOString()
    });
    S.commit('Merci, votre avis est publié.');
    return { ok: true };
  };

  S.deleteReview = function (productId, reviewId) {
    const p = S.product(productId);
    if (!p || !p.reviews) return { ok: false };
    p.reviews = p.reviews.filter(function (r) { return r.id !== reviewId; });
    S.commit('Avis supprimé.');
    return { ok: true };
  };

  S.allReviews = function () {
    const out = [];
    S.state.products.forEach(function (p) {
      (p.reviews || []).forEach(function (r) {
        out.push({ product: p, review: r });
      });
    });
    return out.sort(function (a, b) { return String(b.review.date).localeCompare(String(a.review.date)); });
  };

  /* =======================================================
     BOUTIQUE
     ======================================================= */
  S.updateShop = function (patch) {
    Object.assign(S.state.shop, patch);
    S.commit('Informations de la boutique enregistrées.');
    return { ok: true };
  };

  S.updateHours = function (hours) {
    S.state.shop.hours = hours;
    S.commit('Horaires enregistrés.');
    return { ok: true };
  };

  S.setLogo = function (dataUrl) {
    S.state.shop.logo = dataUrl || null;
    S.commit(dataUrl ? 'Logo mis à jour.' : 'Logo retiré.');
    return { ok: true };
  };

  /* Ouvert / fermé maintenant */
  S.openStatus = function (now) {
    now = now || new Date();
    const idx = (now.getDay() + 6) % 7;                  // 0 = lundi
    const today = (S.state.shop.hours || [])[idx];
    if (!today || today.closed || !today.open || !today.close) {
      return { open: false, label: "Fermé aujourd'hui", today: today };
    }
    const mins = now.getHours() * 60 + now.getMinutes();
    const toMin = function (t) {
      const m = String(t).match(/^(\d{1,2})[:h](\d{2})$/);
      return m ? Number(m[1]) * 60 + Number(m[2]) : null;
    };
    const o = toMin(today.open), c = toMin(today.close);
    if (o == null || c == null) return { open: false, label: 'Horaires à confirmer', today: today };
    if (mins >= o && mins < c) return { open: true, label: "Ouvert aujourd'hui jusqu'à " + today.close.replace(':', 'h'), today: today };
    if (mins < o) return { open: false, label: "Ouvre aujourd'hui à " + today.open.replace(':', 'h'), today: today };
    return { open: false, label: 'Fermé pour aujourd\'hui', today: today };
  };

  S.todayIndex = function () { return (new Date().getDay() + 6) % 7; };

  /* =======================================================
     SAUVEGARDE / RESTAURATION
     ======================================================= */
  S.export = function () {
    const copy = U.deep(S.state);
    delete copy.admin;                                    // le code d'accès n'est jamais exporté
    return JSON.stringify(copy, null, 2);
  };

  S.import = function (json) {
    let data;
    try { data = JSON.parse(json); } catch (e) { return { ok: false, msg: 'Fichier illisible.' }; }
    if (!data || !data.tree || !data.products) return { ok: false, msg: 'Ce fichier ne contient pas de catalogue JN Mode.' };
    const admin = S.state.admin;
    S.state = data;
    S.state.admin = admin;                                // on conserve le code d'accès en place
    S.commit('Sauvegarde restaurée.');
    return { ok: true };
  };

  S.storageSize = function () {
    try {
      const bytes = new Blob([localStorage.getItem(KEY) || '']).size;
      return (bytes / 1024 / 1024).toFixed(2);
    } catch (e) { return '?'; }
  };

  S.KEY = KEY;
  w.Store = S;
})(window);
