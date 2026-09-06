/* =========================================================
   JN MODE — Accès gérante (code d'accès)
   Le code n'est jamais stocké en clair : seule une empreinte
   SHA-256 salée est conservée dans le navigateur.
   ========================================================= */
(function (w) {
  'use strict';

  /* ---------- SHA-256 (implémentation autonome) ---------- */
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  function sha256(ascii) {
    function rr(v, n) { return (v >>> n) | (v << (32 - n)); }
    const bytes = [];
    for (let i = 0; i < ascii.length; i++) {
      let c = ascii.charCodeAt(i);
      if (c < 128) bytes.push(c);
      else if (c < 2048) bytes.push(192 | (c >> 6), 128 | (c & 63));
      else bytes.push(224 | (c >> 12), 128 | ((c >> 6) & 63), 128 | (c & 63));
    }
    const bitLen = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    for (let i = 7; i >= 0; i--) bytes.push((bitLen / Math.pow(2, i * 8)) & 255);

    const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
               0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const wArr = new Array(64);

    for (let pos = 0; pos < bytes.length; pos += 64) {
      for (let i = 0; i < 16; i++) {
        wArr[i] = (bytes[pos + i * 4] << 24) | (bytes[pos + i * 4 + 1] << 16) |
                  (bytes[pos + i * 4 + 2] << 8) | bytes[pos + i * 4 + 3];
      }
      for (let i = 16; i < 64; i++) {
        const s0 = rr(wArr[i - 15], 7) ^ rr(wArr[i - 15], 18) ^ (wArr[i - 15] >>> 3);
        const s1 = rr(wArr[i - 2], 17) ^ rr(wArr[i - 2], 19) ^ (wArr[i - 2] >>> 10);
        wArr[i] = (wArr[i - 16] + s0 + wArr[i - 7] + s1) | 0;
      }
      let [a, b, c, d, e, f, g, h] = H;
      for (let i = 0; i < 64; i++) {
        const S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25);
        const ch = (e & f) ^ (~e & g);
        const t1 = (h + S1 + ch + K[i] + wArr[i]) | 0;
        const S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0;
        d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      const upd = [a, b, c, d, e, f, g, h];
      for (let i = 0; i < 8; i++) H[i] = (H[i] + upd[i]) | 0;
    }
    return H.map(function (x) { return ('00000000' + (x >>> 0).toString(16)).slice(-8); }).join('');
  }

  /* ---------- Paramètres ---------- */
  const DEFAULT_CODE = 'JNMODE76';        // code de première connexion (à changer aussitôt)
  const SESSION_KEY = 'jnmode.session';
  const ROUNDS = 900;                     // étirement de clé

  function digest(code, salt) {
    let h = sha256(salt + '|' + code + '|jnmode');
    for (let i = 0; i < ROUNDS; i++) h = sha256(h + salt);
    return h;
  }

  function newSalt() {
    return U.uid('s') + Math.random().toString(36).slice(2, 10);
  }

  const A = {
    DEFAULT_CODE: DEFAULT_CODE,
    fails: 0,
    lockedUntil: 0
  };

  /* Le compte existe-t-il déjà (code personnalisé posé) ? */
  A.isInitialised = function () {
    const a = Store.state.admin;
    return !!(a && a.hash && !a.mustChange);
  };

  A.mustChange = function () {
    const a = Store.state.admin;
    return !a || a.mustChange === true;
  };

  A.isLogged = function () {
    try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch (e) { return !!A._mem; }
  };

  A.setLogged = function (v) {
    A._mem = v;
    try {
      if (v) sessionStorage.setItem(SESSION_KEY, '1');
      else sessionStorage.removeItem(SESSION_KEY);
    } catch (e) { /* mode privé : la session reste en mémoire */ }
  };

  A.lockRemaining = function () {
    const left = Math.ceil((A.lockedUntil - Date.now()) / 1000);
    return left > 0 ? left : 0;
  };

  /* Vérifie un code (code par défaut tant qu'aucun n'a été posé) */
  A.check = function (code) {
    code = String(code || '');
    const a = Store.state.admin;
    if (!a || !a.hash) return code === DEFAULT_CODE;
    return digest(code, a.salt) === a.hash;
  };

  A.login = function (code) {
    if (A.lockRemaining()) {
      return { ok: false, msg: 'Trop de tentatives. Réessayez dans ' + A.lockRemaining() + ' secondes.' };
    }
    if (!A.check(code)) {
      A.fails++;
      if (A.fails >= 5) { A.lockedUntil = Date.now() + 60000; A.fails = 0; }
      return { ok: false, msg: 'Code incorrect.' };
    }
    A.fails = 0;
    A.setLogged(true);
    return { ok: true, mustChange: A.mustChange() };
  };

  A.logout = function () { A.setLogged(false); };

  /* Règles de robustesse du code */
  A.validate = function (code) {
    code = String(code || '');
    if (code.length < 6) return 'Le code doit contenir au moins 6 caractères.';
    if (code.toUpperCase() === DEFAULT_CODE) return 'Choisissez un code différent du code par défaut.';
    if (/^(.)\1+$/.test(code)) return 'Ce code est trop simple.';
    if (['123456', '000000', 'azerty', 'motdepasse'].indexOf(code.toLowerCase()) !== -1) {
      return 'Ce code est trop courant, choisissez-en un autre.';
    }
    return null;
  };

  /* Changement de code : l'ancien code est toujours exigé */
  A.changeCode = function (oldCode, newCode, confirmCode) {
    if (!A.check(oldCode)) return { ok: false, msg: 'Ancien code incorrect.' };
    const err = A.validate(newCode);
    if (err) return { ok: false, msg: err };
    if (newCode !== confirmCode) return { ok: false, msg: 'Les deux nouveaux codes ne correspondent pas.' };

    const salt = newSalt();
    Store.state.admin = {
      salt: salt,
      hash: digest(newCode, salt),
      mustChange: false,
      updatedAt: new Date().toISOString()
    };
    Store.commit('Code d\'accès modifié.');
    A.setLogged(true);
    return { ok: true };
  };

  w.Auth = A;
})(window);
