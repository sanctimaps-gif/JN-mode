/* =========================================================
   JN MODE — Utilitaires génériques
   ========================================================= */
(function (w) {
  'use strict';

  const U = {};

  /* ---------- Sélection DOM ---------- */
  U.$ = (sel, root) => (root || document).querySelector(sel);
  U.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  U.bind = (name) => document.querySelector('[data-bind="' + name + '"]');

  /* ---------- Échappement HTML (toute donnée saisie passe par ici) ---------- */
  U.esc = function (v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };
  U.attr = U.esc;

  /* ---------- Identifiants ---------- */
  U.uid = function (prefix) {
    return (prefix || 'id') + '-' + Date.now().toString(36) + '-' +
      Math.random().toString(36).slice(2, 8);
  };

  U.slug = function (s) {
    return String(s || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  /* ---------- Formats ---------- */
  U.price = function (n) {
    const v = Number(n);
    if (!isFinite(v) || v <= 0) return 'Prix en boutique';
    return v.toFixed(2).replace('.', ',') + ' €';
  };

  U.dateFR = function (iso) {
    try {
      return new Date(iso).toLocaleDateString('fr-FR',
        { day: '2-digit', month: 'long', year: 'numeric' });
    } catch (e) { return ''; }
  };

  U.stars = function (n, max) {
    max = max || 5;
    const full = Math.round(Number(n) || 0);
    let out = '';
    for (let i = 1; i <= max; i++) out += (i <= full ? '★' : '☆');
    return out;
  };

  /* ---------- Divers ---------- */
  U.splitList = function (str) {
    return String(str || '').split(/[,;\n|]+/).map(s => s.trim()).filter(Boolean);
  };

  U.deep = function (o) { return JSON.parse(JSON.stringify(o)); };

  U.debounce = function (fn, ms) {
    let t; return function () {
      const a = arguments, c = this;
      clearTimeout(t); t = setTimeout(() => fn.apply(c, a), ms || 250);
    };
  };

  U.norm = function (s) {
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  };

  /* ---------- Messages ---------- */
  let toastTimer = null;
  U.toast = function (msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 3200);
  };

  /* ---------- Couleurs nommées ---------- */
  U.COLORS = {
    'noir': '#1b1b1b', 'blanc': '#ffffff', 'écru': '#f0e7d8', 'ecru': '#f0e7d8',
    'crème': '#f6efe2', 'creme': '#f6efe2', 'ivoire': '#fbf7ee', 'beige': '#ddcdb4',
    'camel': '#b58a55', 'taupe': '#8b7d6f', 'marron': '#6b4a32', 'chocolat': '#4b3527',
    'gris': '#9a9a99', 'gris chiné': '#b3b3b0', 'anthracite': '#3a3d40',
    'bleu marine': '#22304a', 'marine': '#22304a', 'bleu ciel': '#a9c8e0',
    'bleu roi': '#2b4a9b', 'denim': '#4a6a92', 'bleu clair': '#b7cde0',
    'rouge': '#a4302c', 'bordeaux': '#6d2233', 'framboise': '#a53356',
    'rose poudré': '#e7c3bd', 'rose': '#e5a2af', 'fuchsia': '#c33b7c',
    'vert amande': '#b9c9a5', 'kaki': '#6c6a4b', 'vert sapin': '#2f4a3c', 'vert': '#4c6b52',
    'jaune': '#e3c15c', 'moutarde': '#c99a2e', 'orange': '#d9793f', 'corail': '#e2735f',
    'violet': '#6b4a83', 'lilas': '#c2b0d6', 'parme': '#cbb7d4',
    'doré': '#c8a86b', 'dore': '#c8a86b', 'argenté': '#c9ccd1', 'argente': '#c9ccd1',
    'cuivre': '#b3714b', 'léopard': '#c19a5b', 'leopard': '#c19a5b',
    'imprimé fleuri': '#d7bfc9', 'rayé': '#cfd6dd', 'raye': '#cfd6dd', 'multicolore': '#c9a2b6'
  };

  U.hexOf = function (name) {
    const k = String(name || '').trim().toLowerCase();
    return U.COLORS[k] || U.COLORS[U.norm(k)] || '#cdc5bb';
  };

  w.U = U;
})(window);
