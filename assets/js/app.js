/* =========================================================
   JN MODE — Navigation, habillage du site et démarrage
   ========================================================= */
(function (w) {
  'use strict';

  const App = {};
  const esc = U.esc;
  const OPEN_KEY = 'jnmode.open';

  /* ---------- Mémoire des rayons dépliés ---------- */
  let opened = {};
  try { opened = JSON.parse(localStorage.getItem(OPEN_KEY) || '{}') || {}; } catch (e) { opened = {}; }
  function persistOpen() {
    try { localStorage.setItem(OPEN_KEY, JSON.stringify(opened)); } catch (e) {}
  }

  /* ---------- Analyse de l'adresse ---------- */
  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, '');
    const qi = raw.indexOf('?');
    const path = (qi >= 0 ? raw.slice(0, qi) : raw).split('/').filter(Boolean);
    const params = {};
    if (qi >= 0) {
      raw.slice(qi + 1).split('&').forEach(function (pair) {
        if (!pair) return;
        const kv = pair.split('=');
        params[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || '').replace(/\+/g, ' '));
      });
    }
    return { path: path, params: params };
  }

  /* =======================================================
     HABILLAGE (en-tête, colonne de droite, pied de page)
     ======================================================= */
  function renderChrome(route) {
    const s = Store.state.shop;
    const st = Store.openStatus();
    const set = function (name, html) { const el = U.bind(name); if (el) el.innerHTML = html; };

    /* --- Bandeau --- */
    set('topAddress', esc(s.address) + ' — ' + esc(s.postal) + ' ' + esc(s.city));
    const status = U.bind('topStatus');
    if (status) {
      status.textContent = st.label;
      status.classList.toggle('is-closed', !st.open);
    }
    const tel = U.bind('topPhone');
    if (tel) {
      tel.textContent = s.phone || '';
      tel.href = s.phone ? 'tel:' + s.phone.replace(/\s/g, '') : '#';
      tel.style.display = s.phone ? '' : 'none';
    }
    U.$$('[data-bind="topInsta"], [data-bind="footInsta"]').forEach(function (el) {
      if (s.instagram) { el.href = s.instagram; el.style.display = ''; }
      else { el.style.display = 'none'; }
    });

    /* --- Marque --- */
    set('logo', s.logo ? '<img src="' + esc(s.logo) + '" alt="Logo ' + esc(s.name) + '" />' : Media.logoMono(s.name));
    set('shopName', esc(s.name));
    set('shopTagline', esc(s.tagline || ''));
    document.title = s.name + ' — ' + (s.tagline || 'Prêt-à-porter féminin');

    /* --- Navigation principale --- */
    const currentTrail = route.path[0] === 'c' ? Store.trail(route.path[1]).map(n => n.id) : [];
    set('mainnav', Store.roots().map(function (n) {
      return '<a href="#/c/' + esc(n.id) + '" class="' + (currentTrail.indexOf(n.id) !== -1 ? 'is-active' : '') + '">' +
        (n.icon ? esc(n.icon) + ' ' : '') + esc(n.name) + '</a>';
    }).join('') + '<a href="#/nouveautes">Nouveautés</a><a href="#/acces">Nous trouver</a>');

    /* --- Dépliant des catégories --- */
    renderTree(route);

    /* --- Encarts et pied de page --- */
    set('hoursMini', Views.hoursList());
    set('footHours', Views.hoursList());
    set('asideAddress', esc(s.address) + '\n' + esc(s.postal) + ' ' + esc(s.city) +
      (s.phone ? '\n' + esc(s.phone) : ''));
    set('footName', esc(s.name));
    set('footAbout', esc((s.about || '').split('\n\n')[0] || ''));
    set('footAddress', esc(s.address) + '<br />' + esc(s.postal) + ' ' + esc(s.city) + '<br />' + esc(s.country));
    const fp = U.bind('footPhone');
    if (fp) { fp.textContent = s.phone || ''; fp.href = s.phone ? 'tel:' + s.phone.replace(/\s/g, '') : '#'; }
    set('legalName', esc(s.name));
    set('year', String(new Date().getFullYear()));
  }

  /* ---------- Arborescence rétractable ---------- */
  function renderTree(route) {
    const host = U.bind('tree');
    if (!host) return;

    const currentId = route.path[0] === 'c' ? route.path[1] : null;
    const trailIds = currentId ? Store.trail(currentId).map(n => n.id) : [];

    function node(n, level) {
      const hasKids = n.children && n.children.length;
      const isOpen = !!opened[n.id] || trailIds.indexOf(n.id) !== -1;
      const nb = Store.countIn(n.id);

      return '' +
        '<div class="tree__node' + (isOpen ? ' is-open' : '') + '" data-node="' + esc(n.id) + '">' +
          '<div class="tree__row">' +
            '<a class="tree__link' + (n.id === currentId ? ' is-current' : '') + '" href="#/c/' + esc(n.id) + '">' +
              (n.icon ? '<span class="tree__icon">' + esc(n.icon) + '</span>' : '') +
              '<span class="tree__label">' + esc(n.name) + '</span>' +
              '<span class="tree__count">' + nb + '</span>' +
            '</a>' +
            (hasKids ?
              '<button class="tree__toggle" type="button" data-toggle="' + esc(n.id) + '" ' +
              'aria-expanded="' + (isOpen ? 'true' : 'false') + '" aria-label="Déplier ' + esc(n.name) + '">' +
                '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="none" stroke="currentColor" stroke-width="2" d="m6 9 6 6 6-6"/></svg>' +
              '</button>' : '') +
          '</div>' +
          (hasKids ? '<div class="tree__children">' +
            n.children.map(function (k) { return node(k, level + 1); }).join('') + '</div>' : '') +
        '</div>';
    }

    host.innerHTML = Store.roots().map(function (n) { return node(n, 1); }).join('');

    U.$$('[data-toggle]', host).forEach(function (b) {
      b.addEventListener('click', function () {
        const id = b.dataset.toggle;
        const el = host.querySelector('.tree__node[data-node="' + id + '"]');
        const willOpen = !el.classList.contains('is-open');
        el.classList.toggle('is-open', willOpen);
        b.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        opened[id] = willOpen;
        if (!willOpen) delete opened[id];
        persistOpen();
      });
    });
  }

  /* =======================================================
     ROUTAGE
     ======================================================= */
  App.render = function (flash) {
    const route = parseHash();
    const p = route.path;
    let view;

    if (!p.length) view = Views.home();
    else if (p[0] === 'c' && p[1]) view = Views.category(p[1], route.params);
    else if (p[0] === 'p' && p[1]) view = Views.product(p[1]);
    else if (p[0] === 'acces') view = Views.acces();
    else if (p[0] === 'boutique') view = Views.boutique();
    else if (p[0] === 'nouveautes') view = Views.nouveautes();
    else if (p[0] === 'mentions') view = Views.mentions();
    else if (p[0] === 'recherche') view = Views.search(route.params.q || '');
    else if (p[0] === 'admin') view = Admin.view(route.params, flash);
    else view = Views.notFound();

    renderChrome(route);

    const host = U.bind('view');
    host.innerHTML = view.html;
    if (view.after) view.after();

    const nav = document.getElementById('mainnav');
    if (nav) nav.classList.remove('is-open');
  };

  /* =======================================================
     DÉMARRAGE
     ======================================================= */
  function boot() {
    Store.load();

    /* Recherche */
    const form = document.getElementById('searchForm');
    const input = document.getElementById('searchInput');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const q = input.value.trim();
      if (q.length < 2) { U.toast('Saisissez au moins 2 caractères.'); return; }
      location.hash = '#/recherche?q=' + encodeURIComponent(q);
    });

    /* Menu mobile */
    const burger = document.getElementById('burger');
    burger.addEventListener('click', function () {
      document.getElementById('mainnav').classList.toggle('is-open');
    });

    /* Tout replier */
    const collapse = document.getElementById('collapseAll');
    collapse.addEventListener('click', function () {
      opened = {}; persistOpen();
      U.$$('.tree__node.is-open').forEach(function (el) {
        el.classList.remove('is-open');
        const t = el.querySelector(':scope > .tree__row .tree__toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    });

    window.addEventListener('hashchange', function () {
      App.render();
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'auto' : 'auto' });
    });

    App.render();
  }

  w.App = App;
  document.addEventListener('DOMContentLoaded', boot);
})(window);
