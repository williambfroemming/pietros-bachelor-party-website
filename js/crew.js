/* ============================================================
   CREW (WS2) — "Most Wanted" comic-panel collage + flip cards
   Renders window.VICE.crew into #crewMount.
   ============================================================ */
(function () {
  const U = window.VICE_UTIL;
  if (!U) return;
  const { h, hash01, isTBD, onReady, prefersReducedMotion } = U;

  const IMG_EXTS = ['png', 'jpg', 'jpeg', 'webp'];
  const PLACEHOLDER = 'images/placeholder-crew.svg';
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const STAR_PATH = 'M12 2.2l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17l-5.9 3.3 1.3-6.6L2.5 9.1l6.6-.8z';

  const FILLERS = [
    ['More suspects', 'inbound'],
    ['Vice', '03.19.27'],
    ['Case file', 'open'],
  ];

  const isTodo = v => isTBD(v) || String(v).trim().toUpperCase() === 'TODO';

  function displayName(p) { return isTBD(p.name) ? 'Unknown Suspect' : p.name; }
  function displayEpithet(p) { return isTBD(p.epithet) ? 'Identity classified' : p.epithet; }
  function displayBio(p) { return isTodo(p.bio) ? 'File pending. Intel incoming.' : p.bio; }

  function tiltFor(p, i) {
    if (typeof p.tilt === 'number' && isFinite(p.tilt)) return p.tilt;
    return +(hash01(String(p.slug || i)) * 3 - 1.5).toFixed(2);
  }

  function wantedLevel(p) {
    const n = Math.round(Number(p.wanted));
    return Math.min(5, Math.max(1, isFinite(n) && n > 0 ? n : 1));
  }

  function starSvg(filled) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('class', 'crew-star' + (filled ? ' is-filled' : ''));
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', STAR_PATH);
    svg.appendChild(path);
    return svg;
  }

  function stars(level) {
    const wrap = h('div', { class: 'crew-card__stars', role: 'img', 'aria-label': `Wanted level ${level} of 5` });
    for (let i = 1; i <= 5; i++) wrap.appendChild(starSvg(i <= level));
    return wrap;
  }

  /** <img> source list. `photo: 'path'` → that file; `photo: null` → placeholder only;
   *  `photo` omitted → walks png → jpg → jpeg → webp → placeholder on error. */
  function portrait(p, eager) {
    const slug = String(p.slug || '').trim();
    let srcs;
    if (typeof p.photo === 'string' && p.photo.trim()) srcs = [p.photo.trim()];
    else if (p.photo === null) srcs = [];
    else srcs = slug ? IMG_EXTS.map(ext => `images/crew/${slug}.${ext}`) : [];
    srcs.push(PLACEHOLDER);
    let idx = 0;
    const img = h('img', {
      class: 'crew-card__img',
      src: srcs[0],
      alt: displayName(p),
      loading: eager ? 'eager' : 'lazy',
      decoding: 'async',
      draggable: 'false',
    });
    img.addEventListener('error', function onErr() {
      idx++;
      if (idx < srcs.length) img.src = srcs[idx];
      else img.removeEventListener('error', onErr);
      if (srcs[idx] === PLACEHOLDER) img.classList.add('is-placeholder');
    });
    if (srcs[0] === PLACEHOLDER) img.classList.add('is-placeholder');
    return img;
  }

  /** Optional wide hero art for the groom (`photoWide` in data), desktop only. */
  function tryWide(card, src) {
    if (!src) return;
    const probe = new Image();
    probe.onload = () => {
      card.style.setProperty('--wide', `url("${src}")`);
      card.classList.add('has-wide');
    };
    probe.src = src;
  }

  function buildCard(p, i) {
    const name = displayName(p);
    const groom = !!p.isGroom;
    const bioId = `crew-bio-${i}`;
    const role = !isTBD(p.role) ? p.role : (groom ? 'The Groom' : null);

    const card = h('div', {
      class: 'crew-card' + (groom ? ' crew-card--groom' : ''),
      role: 'button',
      tabindex: '0',
      'aria-pressed': 'false',
      'aria-label': `${name}${role ? ', ' + role : ''}. Reveal file`,
      'aria-describedby': bioId,
    },
      h('div', { class: 'crew-card__inner' },
        h('div', { class: 'crew-card__face crew-card__front' },
          portrait(p, groom),
          role ? h('span', { class: 'crew-card__badge' }, role) : null,
          h('span', { class: 'crew-card__hint', 'aria-hidden': 'true' }, 'Tap to reveal'),
          h('span', { class: 'crew-card__caption' }, name)
        ),
        h('div', { class: 'crew-card__face crew-card__back', 'aria-hidden': 'true' },
          h('div', { class: 'crew-card__back-scroll' },
            h('p', { class: 'crew-card__file' }, `// Case file ${String(i + 1).padStart(3, '0')}`),
            h('p', { class: 'crew-card__epithet' }, displayEpithet(p)),
            h('p', { class: 'crew-card__name' }, name),
            h('p', { class: 'crew-card__wanted-label' }, 'Wanted level'),
            stars(wantedLevel(p)),
            h('p', { class: 'crew-card__bio', id: bioId }, displayBio(p))
          )
        )
      )
    );
    card.style.setProperty('--tilt', tiltFor(p, i) + 'deg');
    if (groom && typeof p.photoWide === 'string') tryWide(card, p.photoWide.trim());
    return card;
  }

  /** One filler panel closes out the last grid row at each column count (2 / 3 / 4),
   *  spanning however many cells are empty there. */
  function buildFillers(othersCount) {
    const need = {
      c2: (2 - (othersCount % 2)) % 2,
      c3: (3 - ((4 + othersCount) % 3)) % 3,
      c4: (4 - (othersCount % 4)) % 4,
    };
    if (!need.c2 && !need.c3 && !need.c4) return null;
    const cls = ['crew-filler'];
    Object.keys(need).forEach(k => { if (need[k]) cls.push('crew-filler--' + k); });
    const [a, b] = FILLERS[othersCount % FILLERS.length];
    const filler = h('div', { class: cls.join(' '), 'aria-hidden': 'true' },
      h('span', { class: 'crew-filler__a' }, a), h('span', { class: 'crew-filler__b' }, b));
    filler.style.setProperty('--tilt', (hash01('filler' + othersCount) * 2 - 1).toFixed(2) + 'deg');
    Object.keys(need).forEach(k => filler.style.setProperty('--span-' + k, String(need[k] || 1)));
    return filler;
  }

  function setFlipped(card, on) {
    card.classList.toggle('is-flipped', on);
    card.setAttribute('aria-pressed', String(on));
    const back = card.querySelector('.crew-card__back');
    const front = card.querySelector('.crew-card__front');
    if (back) back.setAttribute('aria-hidden', String(!on));
    if (front) front.setAttribute('aria-hidden', String(on));
  }

  function initFlip(grid) {
    function toggle(card) {
      const open = !card.classList.contains('is-flipped');
      grid.querySelectorAll('.crew-card.is-flipped').forEach(o => { if (o !== card) setFlipped(o, false); });
      setFlipped(card, open);
    }
    grid.addEventListener('click', e => {
      const card = e.target.closest('.crew-card');
      if (card && grid.contains(card)) toggle(card);
    });
    grid.addEventListener('keydown', e => {
      const card = e.target.closest('.crew-card');
      if (!card || e.target !== card) return;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        toggle(card);
      } else if (e.key === 'Escape' && card.classList.contains('is-flipped')) {
        setFlipped(card, false);
      }
    });
  }

  function initFadeIn(grid) {
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) return;
    const items = grid.querySelectorAll('.crew-card, .crew-filler');
    grid.classList.add('is-animated'); // cards are only hidden once this class exists
    const io = new IntersectionObserver(entries => {
      let n = 0;
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.style.transitionDelay = `${Math.min(n++, 8) * 0.08}s`;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px 15% 0px', threshold: 0.05 });
    items.forEach(el => io.observe(el));
    // Clear the stagger delay after the reveal so hover/flip transitions stay snappy.
    grid.addEventListener('transitionend', e => {
      if (e.target.classList && e.target.classList.contains('is-visible')) e.target.style.transitionDelay = '';
    });
  }

  function initCrew(mount) {
    const crew = (window.VICE && Array.isArray(window.VICE.crew)) ? window.VICE.crew.slice() : [];
    mount.textContent = '';
    if (!crew.length) {
      mount.appendChild(h('p', { class: 'empty-state' }, 'No suspects on file. Yet.'));
      return;
    }
    // Groom always leads the collage.
    crew.sort((a, b) => (b.isGroom ? 1 : 0) - (a.isGroom ? 1 : 0));
    const hasGroom = !!crew[0].isGroom;
    const others = hasGroom ? crew.length - 1 : crew.length;

    const grid = h('div', { class: 'crew-grid' + (hasGroom ? '' : ' crew-grid--no-groom') },
      crew.map(buildCard),
      hasGroom ? buildFillers(others) : null
    );
    mount.appendChild(grid);
    initFlip(grid);
    initFadeIn(grid);
  }

  onReady('crewMount', initCrew);
  window.VICE_CREW = { init: initCrew };
})();
