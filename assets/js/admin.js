/* =========================================================
   JN MODE — Espace gérante
   Accès par code. Permet de gérer les rayons, les articles,
   les photos, le logo, les informations et les horaires.
   ========================================================= */
(function (w) {
  'use strict';

  const A = {};
  const esc = U.esc;

  const TABS = [
    ['rayons', 'Catégories'],
    ['articles', 'Articles'],
    ['boutique', 'Boutique & logo'],
    ['acces', 'Horaires & accès'],
    ['avis', 'Avis'],
    ['securite', 'Code d\'accès'],
    ['donnees', 'Sauvegarde']
  ];

  function go(params) {
    const q = Object.keys(params || {})
      .filter(k => params[k] !== undefined && params[k] !== '')
      .map(k => k + '=' + encodeURIComponent(params[k])).join('&');
    location.hash = '#/admin' + (q ? '?' + q : '');
  }

  /* =======================================================
     PORTE D'ENTRÉE
     ======================================================= */
  function gateLogin(msg) {
    const first = !Auth.isInitialised();
    return {
      html:
        '<div class="gate">' +
          '<h2>Espace gérante</h2>' +
          '<p class="hint">Réservé à la gérante de la boutique.</p>' +
          (first ?
            '<div class="alert">Première connexion : saisissez le code de départ <strong>' +
            esc(Auth.DEFAULT_CODE) + '</strong>. Il vous sera demandé de le remplacer immédiatement par un code personnel.</div>' : '') +
          (msg ? '<div class="alert alert--danger">' + esc(msg) + '</div>' : '') +
          '<form class="form" id="loginForm">' +
            '<div class="form__row"><label for="code">Code d\'accès</label>' +
              '<input type="password" id="code" autocomplete="current-password" required /></div>' +
            '<button class="btn btn--block" type="submit">Se connecter</button>' +
          '</form>' +
          '<p class="hint" style="margin-top:16px">Code oublié&nbsp;? Il n\'existe aucun moyen de le récupérer : ' +
          'seule une réinitialisation complète des données du site permet de repartir du code de départ.</p>' +
        '</div>',
      after: function () {
        document.getElementById('loginForm').addEventListener('submit', function (e) {
          e.preventDefault();
          const r = Auth.login(document.getElementById('code').value);
          if (!r.ok) { App.render(r.msg); return; }
          App.render();
        });
      }
    };
  }

  function gateChange(msg, ok) {
    const forced = Auth.mustChange();
    return {
      html:
        '<div class="gate">' +
          '<h2>' + (forced ? 'Choisissez votre code' : 'Changer le code d\'accès') + '</h2>' +
          '<p class="hint">' + (forced
            ? 'Pour votre sécurité, le code de départ doit être remplacé avant d\'aller plus loin.'
            : 'L\'ancien code est exigé pour pouvoir en définir un nouveau.') + '</p>' +
          (msg ? '<div class="alert alert--danger">' + esc(msg) + '</div>' : '') +
          (ok ? '<div class="alert alert--ok">' + esc(ok) + '</div>' : '') +
          '<form class="form" id="changeForm">' +
            '<div class="form__row"><label for="oldCode">Ancien code</label>' +
              '<input type="password" id="oldCode" autocomplete="current-password" required /></div>' +
            '<div class="form__row"><label for="newCode">Nouveau code (6 caractères minimum)</label>' +
              '<input type="password" id="newCode" autocomplete="new-password" required /></div>' +
            '<div class="form__row"><label for="newCode2">Confirmer le nouveau code</label>' +
              '<input type="password" id="newCode2" autocomplete="new-password" required /></div>' +
            '<button class="btn btn--gold btn--block" type="submit">Enregistrer le nouveau code</button>' +
          '</form>' +
        '</div>',
      after: function () {
        document.getElementById('changeForm').addEventListener('submit', function (e) {
          e.preventDefault();
          const r = Auth.changeCode(
            document.getElementById('oldCode').value,
            document.getElementById('newCode').value,
            document.getElementById('newCode2').value
          );
          if (!r.ok) { App.render(r.msg); return; }
          App.render();
        });
      }
    };
  }

  /* =======================================================
     VUE PRINCIPALE
     ======================================================= */
  A.view = function (params, flash) {
    params = params || {};

    if (!Auth.isLogged()) return gateLogin(flash);
    if (Auth.mustChange()) return gateChange(flash);
    if (params.tab === 'securite') return A.tabSecurite(params, flash);

    const tab = params.tab || 'rayons';
    const body = ({
      rayons: A.tabRayons,
      articles: A.tabArticles,
      boutique: A.tabBoutique,
      acces: A.tabAcces,
      avis: A.tabAvis,
      donnees: A.tabDonnees
    }[tab] || A.tabRayons).call(A, params, flash);

    const head =
      '<div class="admin__head">' +
        '<div><h1 style="font-size:32px">Espace gérante</h1>' +
        '<p class="hint">' + esc(Store.state.shop.name) + ' · ' + Store.state.products.length +
        ' articles · dernière sauvegarde ' + esc(U.dateFR(Store.state.savedAt)) + '</p></div>' +
        '<div style="display:flex;gap:8px;align-items:center">' +
          '<span class="admin__badge">Connectée</span>' +
          '<a class="btn btn--ghost btn--sm" href="#/">Voir le site</a>' +
          '<button class="btn btn--sm" id="logoutBtn" type="button">Se déconnecter</button>' +
        '</div>' +
      '</div>' +
      '<div class="tabs">' + TABS.map(function (t) {
        return '<button data-tab="' + t[0] + '" class="' + (t[0] === tab ? 'is-active' : '') + '">' + esc(t[1]) + '</button>';
      }).join('') + '</div>';

    return {
      html: head + body.html,
      after: function () {
        U.$$('.tabs button').forEach(function (b) {
          b.addEventListener('click', function () { go({ tab: b.dataset.tab }); });
        });
        const lo = document.getElementById('logoutBtn');
        if (lo) lo.addEventListener('click', function () { Auth.logout(); location.hash = '#/'; });
        if (body.after) body.after();
      }
    };
  };

  /* =======================================================
     ONGLET — CATÉGORIES
     ======================================================= */
  A.tabRayons = function () {
    function rows(nodes, level) {
      return nodes.map(function (n) {
        const leaf = Store.isLeaf(n);
        const nb = Store.countIn(n.id);
        return '' +
          '<div class="adm-node">' +
            '<div class="adm-row adm-row--l' + level + '">' +
              (n.icon ? '<span>' + esc(n.icon) + '</span>' : '') +
              '<span class="adm-row__name">' + esc(n.name) + '</span>' +
              '<span class="adm-row__tag">' + (leaf ? nb + ' article' + (nb > 1 ? 's' : '') : n.children.length + ' sous-cat.') + '</span>' +
              '<button class="iconbtn" data-up="' + esc(n.id) + '" title="Monter">↑</button>' +
              '<button class="iconbtn" data-down="' + esc(n.id) + '" title="Descendre">↓</button>' +
              (level < 3 ? '<button class="iconbtn" data-add="' + esc(n.id) + '">+ sous-catégorie</button>' : '') +
              '<button class="iconbtn" data-ren="' + esc(n.id) + '">Renommer</button>' +
              '<button class="iconbtn iconbtn--danger" data-del="' + esc(n.id) + '">Supprimer</button>' +
            '</div>' +
            (n.children.length ? rows(n.children, level + 1) : '') +
          '</div>';
      }).join('');
    }

    return {
      html:
        '<div class="panel">' +
          '<h3>Organisation des rayons</h3>' +
          '<p class="hint">Les articles se rangent uniquement dans les sous-catégories du dernier niveau. ' +
          'Une catégorie qui contient des sous-catégories ne peut pas contenir d\'articles.</p>' +
          '<div class="toolbar">' +
            '<input type="text" id="newRootName" placeholder="Nom du nouveau rayon principal" />' +
            '<input type="text" id="newRootIcon" placeholder="Icône (ex. 👗)" style="max-width:150px" />' +
            '<button class="btn btn--sm btn--gold" id="addRoot" type="button">Ajouter un rayon</button>' +
          '</div>' +
          '<div class="adm-tree">' + rows(Store.roots(), 1) + '</div>' +
        '</div>',

      after: function () {
        document.getElementById('addRoot').addEventListener('click', function () {
          const r = Store.addCat(null,
            document.getElementById('newRootName').value,
            document.getElementById('newRootIcon').value);
          if (!r.ok) U.toast(r.msg); else App.render();
        });

        U.$$('[data-add]').forEach(function (b) {
          b.addEventListener('click', function () {
            const name = prompt('Nom de la nouvelle sous-catégorie :');
            if (name === null) return;
            const r = Store.addCat(b.dataset.add, name, '');
            if (!r.ok) U.toast(r.msg); else App.render();
          });
        });

        U.$$('[data-ren]').forEach(function (b) {
          b.addEventListener('click', function () {
            const n = Store.findCat(b.dataset.ren);
            const name = prompt('Nouveau nom :', n.name);
            if (name === null) return;
            const icon = prompt('Icône (laisser vide si aucune) :', n.icon || '');
            const r = Store.renameCat(n.id, name, icon === null ? n.icon : icon);
            if (!r.ok) U.toast(r.msg); else App.render();
          });
        });

        U.$$('[data-del]').forEach(function (b) {
          b.addEventListener('click', function () {
            const n = Store.findCat(b.dataset.del);
            let r = Store.deleteCat(n.id);
            if (!r.ok && r.needConfirm) {
              if (!confirm(r.msg + '\n\nSupprimer la catégorie ET ses ' + r.count + ' article(s) ? Cette action est définitive.')) return;
              r = Store.deleteCat(n.id, 'cascade');
            }
            if (!r.ok && r.msg) U.toast(r.msg); else App.render();
          });
        });

        U.$$('[data-up]').forEach(function (b) {
          b.addEventListener('click', function () { Store.moveCat(b.dataset.up, -1); App.render(); });
        });
        U.$$('[data-down]').forEach(function (b) {
          b.addEventListener('click', function () { Store.moveCat(b.dataset.down, 1); App.render(); });
        });
      }
    };
  };

  /* =======================================================
     ONGLET — ARTICLES
     ======================================================= */
  A.tabArticles = function (params) {
    const leaves = Store.allLeaves();
    const editing = params.edit === 'new'
      ? { id: '', catId: params.cat || (leaves[0] && leaves[0].id), name: '', brand: '', price: '', ref: '', sizes: [], sizesOut: [], colors: [], description: '', material: '', images: [], featured: false }
      : (params.edit ? Store.product(params.edit) : null);

    const filterCat = params.cat || '';
    const q = params.q || '';
    let list = Store.state.products.slice();
    if (filterCat) {
      const ids = Store.leafIds(filterCat);
      list = list.filter(p => ids.indexOf(p.catId) !== -1);
    }
    if (q) {
      const n = U.norm(q);
      list = list.filter(p => U.norm(p.name + ' ' + p.brand + ' ' + p.ref).indexOf(n) !== -1);
    }
    list.sort((a, b) => a.name.localeCompare(b.name, 'fr'));

    /* ---- Formulaire d'édition ---- */
    let form = '';
    if (editing) {
      const opts = leaves.map(function (l) {
        return '<option value="' + esc(l.id) + '"' + (l.id === editing.catId ? ' selected' : '') + '>' + esc(l.label) + '</option>';
      }).join('');

      const imgs = (editing.images && editing.images.length)
        ? editing.images.map(function (src, i) {
            return '<div class="thumb" style="cursor:default"><img src="' + esc(src) + '" alt="" />' +
              '<button class="thumb__del" data-fdel="' + i + '" type="button" title="Retirer">×</button></div>';
          }).join('')
        : '<p class="hint" style="margin:0">Aucune photo : un visuel est généré automatiquement en attendant.</p>';

      form =
        '<div class="panel">' +
          '<h3>' + (editing.id ? 'Modifier un article' : 'Nouvel article') + '</h3>' +
          '<p class="hint">' + (editing.id ? 'Référence ' + esc(editing.ref || '—') : 'L\'article apparaîtra immédiatement dans la sous-catégorie choisie.') + '</p>' +
          '<form class="form" id="prodForm">' +
            '<input type="hidden" id="fId" value="' + esc(editing.id || '') + '" />' +
            '<div class="form__row"><label for="fCat">Sous-catégorie</label><select id="fCat">' + opts + '</select></div>' +
            '<div class="form__row form__row--2">' +
              '<div class="form__row"><label for="fName">Nom de l\'article</label>' +
                '<input type="text" id="fName" value="' + esc(editing.name) + '" required /></div>' +
              '<div class="form__row"><label for="fBrand">Marque</label>' +
                '<input type="text" id="fBrand" value="' + esc(editing.brand) + '" /></div>' +
            '</div>' +
            '<div class="form__row form__row--2">' +
              '<div class="form__row"><label for="fPrice">Prix (€) — 0 pour « prix en boutique »</label>' +
                '<input type="text" id="fPrice" value="' + esc(editing.price || '') + '" /></div>' +
              '<div class="form__row"><label for="fRef">Référence</label>' +
                '<input type="text" id="fRef" value="' + esc(editing.ref || '') + '" /></div>' +
            '</div>' +
            '<div class="form__row form__row--2">' +
              '<div class="form__row"><label for="fSizes">Tailles disponibles (séparées par des virgules)</label>' +
                '<input type="text" id="fSizes" value="' + esc((editing.sizes || []).join(', ')) + '" /></div>' +
              '<div class="form__row"><label for="fOut">Tailles épuisées</label>' +
                '<input type="text" id="fOut" value="' + esc((editing.sizesOut || []).join(', ')) + '" /></div>' +
            '</div>' +
            '<div class="form__row"><label for="fColors">Couleurs disponibles (séparées par des virgules)</label>' +
              '<input type="text" id="fColors" value="' + esc((editing.colors || []).map(c => c.name).join(', ')) + '" />' +
              '<p class="hint">Exemples reconnus : noir, écru, camel, bordeaux, rose poudré, kaki, doré…</p></div>' +
            '<div class="form__row"><label for="fMat">Composition / matière</label>' +
              '<input type="text" id="fMat" value="' + esc(editing.material || '') + '" /></div>' +
            '<div class="form__row"><label for="fDesc">Description</label>' +
              '<textarea id="fDesc">' + esc(editing.description || '') + '</textarea></div>' +
            '<div class="form__row"><label style="display:flex;align-items:center;gap:8px;text-transform:none;letter-spacing:0;font-size:14px">' +
              '<input type="checkbox" id="fFeat" ' + (editing.featured ? 'checked' : '') + ' style="width:auto" /> Mettre en avant sur la page d\'accueil</label></div>' +

            (editing.id ?
              '<div class="form__row"><label>Photos de l\'article</label>' +
                '<div class="gallery__thumbs" id="fImgs">' + imgs +
                  '<button class="thumb thumb--add" id="fAddImg" type="button" title="Ajouter une photo">+</button>' +
                '</div>' +
                '<p class="hint">8 photos maximum. Les images sont réduites automatiquement.</p></div>'
              : '<p class="hint">Les photos pourront être ajoutées juste après l\'enregistrement.</p>') +

            '<div class="toolbar" style="margin:0">' +
              '<button class="btn btn--gold" type="submit">Enregistrer</button>' +
              '<button class="btn btn--ghost" id="cancelEdit" type="button">Annuler</button>' +
              (editing.id ? '<span class="toolbar__sp"></span><a class="btn btn--ghost btn--sm" href="#/p/' + esc(editing.id) + '">Voir la fiche</a>' +
                '<button class="btn btn--danger btn--sm" id="delProd" type="button">Supprimer l\'article</button>' : '') +
            '</div>' +
          '</form>' +
        '</div>';
    }

    /* ---- Tableau ---- */
    const catOpts = '<option value="">Toutes les catégories</option>' +
      leaves.map(l => '<option value="' + esc(l.id) + '"' + (l.id === filterCat ? ' selected' : '') + '>' + esc(l.label) + '</option>').join('');

    const table = list.length ?
      '<table class="table"><thead><tr>' +
        '<th></th><th>Article</th><th>Marque</th><th>Catégorie</th><th>Prix</th><th>Photos</th><th>Avis</th><th></th>' +
      '</tr></thead><tbody>' +
      list.map(function (p) {
        const cat = Store.findCat(p.catId);
        return '<tr>' +
          '<td><img class="table__thumb" src="' + esc(Store.imagesOf(p)[0]) + '" alt="" /></td>' +
          '<td><strong>' + esc(p.name) + '</strong><br /><span class="hint">' + esc(p.ref || '') + '</span></td>' +
          '<td>' + esc(p.brand || '—') + '</td>' +
          '<td>' + esc(cat ? cat.name : '—') + '</td>' +
          '<td>' + esc(U.price(p.price)) + '</td>' +
          '<td>' + ((p.images || []).length || '—') + '</td>' +
          '<td>' + ((p.reviews || []).length || '—') + '</td>' +
          '<td><div class="table__actions">' +
            '<button class="iconbtn" data-edit="' + esc(p.id) + '">Modifier</button>' +
            '<button class="iconbtn iconbtn--danger" data-delp="' + esc(p.id) + '">Suppr.</button>' +
          '</div></td>' +
        '</tr>';
      }).join('') + '</tbody></table>'
      : '<p class="hint">Aucun article ne correspond à cette recherche.</p>';

    return {
      html: form +
        '<div class="panel">' +
          '<h3>Catalogue</h3>' +
          '<div class="toolbar">' +
            '<select id="filtCat">' + catOpts + '</select>' +
            '<input type="text" id="filtQ" placeholder="Rechercher un article…" value="' + esc(q) + '" />' +
            '<span class="toolbar__sp"></span>' +
            '<button class="btn btn--sm btn--gold" id="newProd" type="button">+ Nouvel article</button>' +
          '</div>' +
          table +
        '</div>',

      after: function () {
        const fc = document.getElementById('filtCat');
        fc.addEventListener('change', function () { go({ tab: 'articles', cat: fc.value, q: q }); });
        const fq = document.getElementById('filtQ');
        fq.addEventListener('change', function () { go({ tab: 'articles', cat: filterCat, q: fq.value }); });
        document.getElementById('newProd').addEventListener('click', function () {
          go({ tab: 'articles', edit: 'new', cat: filterCat });
        });

        U.$$('[data-edit]').forEach(function (b) {
          b.addEventListener('click', function () { go({ tab: 'articles', edit: b.dataset.edit }); });
        });
        U.$$('[data-delp]').forEach(function (b) {
          b.addEventListener('click', function () {
            const p = Store.product(b.dataset.delp);
            if (!confirm('Supprimer définitivement « ' + p.name + ' » ?')) return;
            Store.deleteProduct(p.id);
            App.render();
          });
        });

        const pf = document.getElementById('prodForm');
        if (!pf) return;

        pf.addEventListener('submit', function (e) {
          e.preventDefault();
          const id = document.getElementById('fId').value;
          const r = Store.saveProduct({
            id: id || undefined,
            catId: document.getElementById('fCat').value,
            name: document.getElementById('fName').value,
            brand: document.getElementById('fBrand').value,
            price: document.getElementById('fPrice').value,
            ref: document.getElementById('fRef').value,
            sizes: document.getElementById('fSizes').value,
            sizesOut: document.getElementById('fOut').value,
            colors: document.getElementById('fColors').value,
            material: document.getElementById('fMat').value,
            description: document.getElementById('fDesc').value,
            featured: document.getElementById('fFeat').checked
          });
          if (!r.ok) { U.toast(r.msg); return; }
          go({ tab: 'articles', edit: r.id, cat: filterCat });
        });

        document.getElementById('cancelEdit').addEventListener('click', function () {
          go({ tab: 'articles', cat: filterCat });
        });

        const dp = document.getElementById('delProd');
        if (dp) dp.addEventListener('click', function () {
          if (!confirm('Supprimer définitivement cet article ?')) return;
          Store.deleteProduct(document.getElementById('fId').value);
          go({ tab: 'articles', cat: filterCat });
        });

        const addImg = document.getElementById('fAddImg');
        if (addImg) addImg.addEventListener('click', function () {
          Media.pickImage().then(function (dataUrl) {
            const r = Store.addImage(editing.id, dataUrl);
            if (!r.ok && r.msg) U.toast(r.msg);
            App.render();
          }).catch(function (err) {
            if (err && err.message !== 'annulé') U.toast(err.message);
          });
        });

        U.$$('[data-fdel]').forEach(function (b) {
          b.addEventListener('click', function () {
            if (!confirm('Retirer cette photo ?')) return;
            Store.removeImage(editing.id, Number(b.dataset.fdel));
            App.render();
          });
        });
      }
    };
  };

  /* =======================================================
     ONGLET — BOUTIQUE & LOGO
     ======================================================= */
  A.tabBoutique = function () {
    const s = Store.state.shop;
    const f = function (id, label, val, type) {
      return '<div class="form__row"><label for="' + id + '">' + esc(label) + '</label>' +
        '<input type="' + (type || 'text') + '" id="' + id + '" value="' + esc(val || '') + '" /></div>';
    };

    return {
      html:
        '<div class="panel">' +
          '<h3>Logo de la boutique</h3>' +
          '<p class="hint">Format conseillé : image carrée ou horizontale, fond transparent (PNG) ou blanc.</p>' +
          '<div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">' +
            '<div style="width:110px;height:110px;border:1px solid var(--gris-clair);display:grid;place-items:center;background:var(--ivoire)">' +
              (s.logo ? '<img src="' + esc(s.logo) + '" alt="Logo" style="max-width:100%;max-height:100%" />'
                      : '<span style="font-family:var(--serif);font-size:26px;color:var(--gris)">' + esc(s.name.slice(0, 2).toUpperCase()) + '</span>') +
            '</div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
              '<button class="btn btn--sm btn--gold" id="logoUp" type="button">Charger un logo</button>' +
              (s.logo ? '<button class="btn btn--sm btn--ghost" id="logoDel" type="button">Retirer le logo</button>' : '') +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="panel">' +
          '<h3>Informations de la boutique</h3>' +
          '<p class="hint">Ces informations apparaissent dans l\'en-tête, le pied de page et les pages d\'accès.</p>' +
          '<form class="form" id="shopForm">' +
            '<div class="form__row form__row--2">' + f('sName', 'Nom de la boutique', s.name) + f('sTag', 'Accroche', s.tagline) + '</div>' +
            f('sAddr', 'Adresse', s.address) +
            '<div class="form__row form__row--2">' + f('sCp', 'Code postal', s.postal) + f('sCity', 'Ville', s.city) + '</div>' +
            '<div class="form__row form__row--2">' + f('sCountry', 'Pays', s.country) + f('sPhone', 'Téléphone', s.phone) + '</div>' +
            '<div class="form__row form__row--2">' + f('sMail', 'Adresse e-mail', s.email, 'email') + f('sSite', 'Autre site internet', s.website, 'url') + '</div>' +
            '<div class="form__row form__row--2">' + f('sIg', 'Lien Instagram', s.instagram, 'url') + f('sFb', 'Lien Facebook', s.facebook, 'url') + '</div>' +
            '<p class="hint" style="margin-top:-4px">Collez l\'adresse complète du compte, par exemple ' +
            'https://www.instagram.com/<em>nomducompte</em>/. Tant que le champ est vide, le bouton Instagram ' +
            'n\'apparaît pas sur le site.</p>' +
            '<div class="form__row"><label for="sIntro">Phrase d\'accroche de la page d\'accueil</label>' +
              '<textarea id="sIntro" style="min-height:70px">' + esc(s.intro || '') + '</textarea></div>' +
            '<div class="form__row"><label for="sAbout">Présentation de la boutique</label>' +
              '<textarea id="sAbout" style="min-height:170px">' + esc(s.about || '') + '</textarea></div>' +
            '<button class="btn btn--gold" type="submit">Enregistrer</button>' +
          '</form>' +
        '</div>',

      after: function () {
        document.getElementById('logoUp').addEventListener('click', function () {
          Media.pickImage({ maxW: 600, maxH: 600, keepAlpha: true }).then(function (d) {
            Store.setLogo(d); App.render();
          }).catch(function (err) { if (err && err.message !== 'annulé') U.toast(err.message); });
        });
        const ld = document.getElementById('logoDel');
        if (ld) ld.addEventListener('click', function () { Store.setLogo(null); App.render(); });

        document.getElementById('shopForm').addEventListener('submit', function (e) {
          e.preventDefault();
          Store.updateShop({
            name: document.getElementById('sName').value.trim() || 'JN Mode',
            tagline: document.getElementById('sTag').value,
            address: document.getElementById('sAddr').value,
            postal: document.getElementById('sCp').value,
            city: document.getElementById('sCity').value,
            country: document.getElementById('sCountry').value,
            phone: document.getElementById('sPhone').value,
            email: document.getElementById('sMail').value,
            website: document.getElementById('sSite').value,
            instagram: document.getElementById('sIg').value,
            facebook: document.getElementById('sFb').value,
            intro: document.getElementById('sIntro').value,
            about: document.getElementById('sAbout').value
          });
          App.render();
        });
      }
    };
  };

  /* =======================================================
     ONGLET — HORAIRES & ACCÈS
     ======================================================= */
  A.tabAcces = function () {
    const s = Store.state.shop;
    const a = s.access || {};
    const ta = function (id, label, arr, hint) {
      return '<div class="form__row"><label for="' + id + '">' + esc(label) + '</label>' +
        '<textarea id="' + id + '" style="min-height:110px">' + esc((arr || []).join('\n')) + '</textarea>' +
        (hint ? '<p class="hint">' + esc(hint) + '</p>' : '') + '</div>';
    };

    const hoursRows = (s.hours || []).map(function (h, i) {
      return '<tr>' +
        '<td style="width:120px">' + esc(h.day) + '</td>' +
        '<td><input type="time" data-ho="' + i + '" value="' + esc(h.open || '') + '" ' + (h.closed ? 'disabled' : '') + ' /></td>' +
        '<td><input type="time" data-hc="' + i + '" value="' + esc(h.close || '') + '" ' + (h.closed ? 'disabled' : '') + ' /></td>' +
        '<td><label style="display:flex;gap:6px;align-items:center;text-transform:none;letter-spacing:0;font-size:13px">' +
          '<input type="checkbox" data-hx="' + i + '" ' + (h.closed ? 'checked' : '') + ' style="width:auto" /> Fermé</label></td>' +
      '</tr>';
    }).join('');

    return {
      html:
        '<div class="panel">' +
          '<h3>Horaires d\'ouverture</h3>' +
          '<p class="hint">Le bandeau du site indique automatiquement si la boutique est ouverte.</p>' +
          '<table class="table"><thead><tr><th>Jour</th><th>Ouverture</th><th>Fermeture</th><th></th></tr></thead>' +
          '<tbody>' + hoursRows + '</tbody></table>' +
          '<div class="form__row" style="margin-top:16px"><label for="hNote">Note affichée sous les horaires</label>' +
            '<input type="text" id="hNote" value="' + esc(s.hoursNote || '') + '" /></div>' +
          '<button class="btn btn--gold" id="saveHours" type="button" style="margin-top:12px">Enregistrer les horaires</button>' +
        '</div>' +

        '<div class="panel">' +
          '<h3>Plans d\'accès</h3>' +
          '<p class="hint">Une ligne = une information affichée sur la page « Venir à la boutique ». ' +
          'Le gras s\'écrit avec &lt;strong&gt;texte&lt;/strong&gt;.</p>' +
          '<form class="form" id="accessForm">' +
            '<div class="form__row"><label for="aRep">Repère principal</label>' +
              '<input type="text" id="aRep" value="' + esc(a.reperes || '') + '" /></div>' +
            '<div class="form__row form__row--2">' +
              '<div class="form__row"><label for="aMap">Adresse du plan intégré</label>' +
                '<input type="url" id="aMap" value="' + esc(a.mapEmbed || '') + '" /></div>' +
              '<div class="form__row"><label for="aItin">Lien « lancer l\'itinéraire »</label>' +
                '<input type="url" id="aItin" value="' + esc(a.itineraire || '') + '" /></div>' +
            '</div>' +
            '<div class="form__row"><label for="aLink">Lien « ouvrir le plan en grand »</label>' +
              '<input type="url" id="aLink" value="' + esc(a.mapLink || '') + '" /></div>' +
            ta('aMetro', 'En métro', a.metro) +
            ta('aBus', 'En bus & TEOR', a.bus) +
            ta('aTrain', 'En train', a.train) +
            ta('aCar', 'En voiture', a.voiture) +
            ta('aPark', 'Où se garer', a.parkings) +
            ta('aVelo', 'À vélo', a.velo) +
            ta('aPied', 'À pied', a.pied) +
            '<button class="btn btn--gold" type="submit">Enregistrer les plans d\'accès</button>' +
          '</form>' +
        '</div>',

      after: function () {
        U.$$('[data-hx]').forEach(function (cb) {
          cb.addEventListener('change', function () {
            const i = cb.dataset.hx;
            U.$('[data-ho="' + i + '"]').disabled = cb.checked;
            U.$('[data-hc="' + i + '"]').disabled = cb.checked;
          });
        });

        document.getElementById('saveHours').addEventListener('click', function () {
          const hours = (Store.state.shop.hours || []).map(function (h, i) {
            const closed = U.$('[data-hx="' + i + '"]').checked;
            return {
              day: h.day, closed: closed,
              open: closed ? '' : U.$('[data-ho="' + i + '"]').value,
              close: closed ? '' : U.$('[data-hc="' + i + '"]').value
            };
          });
          Store.state.shop.hoursNote = document.getElementById('hNote').value;
          Store.updateHours(hours);
          App.render();
        });

        document.getElementById('accessForm').addEventListener('submit', function (e) {
          e.preventDefault();
          const lines = function (id) {
            return document.getElementById(id).value.split('\n').map(x => x.trim()).filter(Boolean);
          };
          Store.updateShop({
            access: {
              reperes: document.getElementById('aRep').value,
              mapEmbed: document.getElementById('aMap').value,
              mapLink: document.getElementById('aLink').value,
              itineraire: document.getElementById('aItin').value,
              lat: a.lat, lng: a.lng,
              metro: lines('aMetro'), bus: lines('aBus'), train: lines('aTrain'),
              voiture: lines('aCar'), parkings: lines('aPark'),
              velo: lines('aVelo'), pied: lines('aPied')
            }
          });
          App.render();
        });
      }
    };
  };

  /* =======================================================
     ONGLET — AVIS
     ======================================================= */
  A.tabAvis = function () {
    const all = Store.allReviews();
    return {
      html:
        '<div class="panel">' +
          '<h3>Avis déposés</h3>' +
          '<p class="hint">' + all.length + ' avis au total. Vous pouvez retirer un avis inapproprié.</p>' +
          (all.length ?
            '<table class="table"><thead><tr><th>Date</th><th>Article</th><th>Cliente</th><th>Note</th><th>Commentaire</th><th></th></tr></thead><tbody>' +
            all.map(function (x) {
              return '<tr>' +
                '<td style="white-space:nowrap">' + esc(U.dateFR(x.review.date)) + '</td>' +
                '<td><a href="#/p/' + esc(x.product.id) + '">' + esc(x.product.name) + '</a></td>' +
                '<td>' + esc(x.review.name) + '</td>' +
                '<td><span class="stars">' + U.stars(x.review.rating) + '</span></td>' +
                '<td>' + esc((x.review.text || '').slice(0, 140)) + '</td>' +
                '<td><button class="iconbtn iconbtn--danger" data-dr="' + esc(x.product.id) + '|' + esc(x.review.id) + '">Supprimer</button></td>' +
              '</tr>';
            }).join('') + '</tbody></table>'
            : '<p class="hint">Aucun avis pour le moment.</p>') +
        '</div>',
      after: function () {
        U.$$('[data-dr]').forEach(function (b) {
          b.addEventListener('click', function () {
            if (!confirm('Supprimer cet avis ?')) return;
            const parts = b.dataset.dr.split('|');
            Store.deleteReview(parts[0], parts[1]);
            App.render();
          });
        });
      }
    };
  };

  /* =======================================================
     ONGLET — CODE D'ACCÈS
     ======================================================= */
  A.tabSecurite = function (params, flash) {
    const inner = gateChange(flash);
    const head =
      '<div class="admin__head"><div><h1 style="font-size:32px">Code d\'accès</h1>' +
      '<p class="hint">Dernière modification : ' +
      esc(Store.state.admin && Store.state.admin.updatedAt ? U.dateFR(Store.state.admin.updatedAt) : 'jamais') + '</p></div>' +
      '<a class="btn btn--ghost btn--sm" href="#/admin?tab=rayons">Retour à l\'espace gérante</a></div>' +
      '<div class="tabs">' + TABS.map(function (t) {
        return '<button data-tab="' + t[0] + '" class="' + (t[0] === 'securite' ? 'is-active' : '') + '">' + esc(t[1]) + '</button>';
      }).join('') + '</div>';

    return {
      html: head + inner.html +
        '<p class="hint" style="text-align:center;max-width:520px;margin:0 auto">' +
        'Le code n\'est jamais conservé en clair. En cas d\'oubli, seule une réinitialisation ' +
        'complète (onglet Sauvegarde) permet de repartir du code de départ.</p>',
      after: function () {
        U.$$('.tabs button').forEach(function (b) {
          b.addEventListener('click', function () { go({ tab: b.dataset.tab }); });
        });
        inner.after();
      }
    };
  };

  /* =======================================================
     ONGLET — SAUVEGARDE
     ======================================================= */
  A.tabDonnees = function () {
    return {
      html:
        '<div class="panel">' +
          '<h3>Sauvegarder le catalogue</h3>' +
          '<p class="hint">Le catalogue est enregistré dans ce navigateur (' + Store.storageSize() + ' Mo utilisés). ' +
          'Téléchargez régulièrement une sauvegarde : elle contient les rayons, les articles, les photos et les avis.</p>' +
          '<div class="toolbar">' +
            '<button class="btn btn--sm btn--gold" id="expBtn" type="button">Télécharger une sauvegarde</button>' +
            '<button class="btn btn--sm btn--ghost" id="impBtn" type="button">Restaurer une sauvegarde</button>' +
          '</div>' +
        '</div>' +
        '<div class="panel">' +
          '<h3>Réinitialiser</h3>' +
          '<p class="hint">Efface tout et rétablit le catalogue de départ. Le code d\'accès revient au code initial. ' +
          'À n\'utiliser qu\'en dernier recours (code oublié, données corrompues).</p>' +
          '<button class="btn btn--sm btn--danger" id="resetBtn" type="button">Tout réinitialiser</button>' +
        '</div>',
      after: function () {
        document.getElementById('expBtn').addEventListener('click', function () {
          const blob = new Blob([Store.export()], { type: 'application/json' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'jn-mode-sauvegarde-' + new Date().toISOString().slice(0, 10) + '.json';
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        });

        document.getElementById('impBtn').addEventListener('click', function () {
          const input = document.createElement('input');
          input.type = 'file'; input.accept = 'application/json,.json';
          input.addEventListener('change', function () {
            const f = input.files && input.files[0];
            if (!f) return;
            const fr = new FileReader();
            fr.onload = function () {
              if (!confirm('Remplacer le catalogue actuel par cette sauvegarde ?')) return;
              const r = Store.import(String(fr.result));
              if (!r.ok) U.toast(r.msg); else App.render();
            };
            fr.readAsText(f);
          });
          input.click();
        });

        document.getElementById('resetBtn').addEventListener('click', function () {
          if (!confirm('Tout effacer et revenir au catalogue de départ ?')) return;
          if (!confirm('Dernière confirmation : cette action est définitive.')) return;
          Store.state.admin = null;
          Store.reset();
          Auth.logout();
          location.hash = '#/';
          App.render();
        });
      }
    };
  };

  w.Admin = A;
})(window);
