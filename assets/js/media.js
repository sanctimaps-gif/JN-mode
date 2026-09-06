/* =========================================================
   JN MODE — Images (visuels de secours + import/compression)
   ========================================================= */
(function (w) {
  'use strict';

  const M = {};

  /* ---------------------------------------------------------
     Visuel de remplacement : une carte SVG élégante générée à
     la volée à partir du nom de l'article et de sa couleur.
     Permet d'avoir un catalogue présentable avant que la
     gérante n'ait chargé ses propres photos.
     --------------------------------------------------------- */
  M.placeholder = function (label, colorHex, glyph) {
    const hex = colorHex || '#e3dbd1';
    const initials = String(label || 'JN')
      .split(/\s+/).slice(0, 2).map(x => x.charAt(0)).join('').toUpperCase();
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800">' +
      '<defs>' +
      '<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' + hex + '" stop-opacity=".55"/>' +
      '<stop offset="100%" stop-color="#faf6f1" stop-opacity=".95"/>' +
      '</linearGradient></defs>' +
      '<rect width="600" height="800" fill="#f3ece4"/>' +
      '<rect width="600" height="800" fill="url(#g)"/>' +
      '<circle cx="300" cy="330" r="132" fill="none" stroke="#ffffff" stroke-opacity=".75" stroke-width="1.5"/>' +
      '<text x="300" y="360" text-anchor="middle" font-family="Georgia,serif" font-size="96" ' +
      'fill="#1c1a18" fill-opacity=".62" letter-spacing="6">' + initials + '</text>' +
      (glyph ? '<text x="300" y="530" text-anchor="middle" font-size="54" opacity=".75">' + glyph + '</text>' : '') +
      '<text x="300" y="640" text-anchor="middle" font-family="Georgia,serif" font-size="26" ' +
      'fill="#1c1a18" fill-opacity=".5" letter-spacing="9">JN MODE</text>' +
      '<text x="300" y="676" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="13" ' +
      'fill="#1c1a18" fill-opacity=".38" letter-spacing="4">ROUEN</text>' +
      '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  };

  /* Logo de secours (monogramme) */
  M.logoMono = function (name) {
    const txt = String(name || 'JN Mode').split(/\s+/).map(x => x.charAt(0))
      .join('').toUpperCase().slice(0, 3);
    return '<span class="mono">' + txt + '</span>';
  };

  /* ---------------------------------------------------------
     Import d'une photo : redimensionnement + compression JPEG
     pour tenir dans le stockage du navigateur.
     --------------------------------------------------------- */
  M.readImage = function (file, opts) {
    opts = opts || {};
    const maxW = opts.maxW || 1100;
    const maxH = opts.maxH || 1460;
    const quality = opts.quality || 0.82;

    return new Promise(function (resolve, reject) {
      if (!file) return reject(new Error('Aucun fichier'));
      if (!/^image\//.test(file.type)) return reject(new Error("Ce fichier n'est pas une image."));
      if (file.size > 12 * 1024 * 1024) return reject(new Error('Image trop lourde (12 Mo maximum).'));

      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Lecture du fichier impossible.'));
      reader.onload = function () {
        const src = String(reader.result);

        // Les SVG et petits PNG transparents (logos) sont conservés tels quels.
        if (file.type === 'image/svg+xml' || (opts.keepAlpha && file.size < 500 * 1024)) {
          return resolve(src);
        }

        const img = new Image();
        img.onerror = () => reject(new Error('Image illisible.'));
        img.onload = function () {
          let { width: cw, height: ch } = img;
          const ratio = Math.min(maxW / cw, maxH / ch, 1);
          cw = Math.max(1, Math.round(cw * ratio));
          ch = Math.max(1, Math.round(ch * ratio));

          const canvas = document.createElement('canvas');
          canvas.width = cw; canvas.height = ch;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, cw, ch);
          ctx.drawImage(img, 0, 0, cw, ch);
          try {
            resolve(canvas.toDataURL('image/jpeg', quality));
          } catch (e) { resolve(src); }
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    });
  };

  /* Ouvre un sélecteur de fichier et renvoie l'image traitée */
  M.pickImage = function (opts) {
    return new Promise(function (resolve, reject) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';
      document.body.appendChild(input);
      input.addEventListener('change', function () {
        const f = input.files && input.files[0];
        document.body.removeChild(input);
        if (!f) return reject(new Error('annulé'));
        M.readImage(f, opts).then(resolve, reject);
      });
      input.click();
    });
  };

  w.Media = M;
})(window);
