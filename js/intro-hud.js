/* ============================================================
   INTRO + HUD (WS1)
   - Loading screen injected into #intro (once per session, skippable,
     skipped under reduced motion or with ?nointro in the URL)
   - HUD countdown into #hud
   - Wanted-level stars into #wanted (fill with scroll progress)
   ============================================================ */
(function () {
  const U = window.VICE_UTIL || {};
  const VICE = window.VICE || {};
  const EV = VICE.event || {};
  const SESSION_KEY = 'gtp.introSeen';
  const LOAD_MS = 2500;
  const TIP_MS = 2000;

  const STAR_PATH = 'M12 1.6l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.7l-6.4 3.5 1.4-7.1-5.3-5 7.2-.9z';

  function el(tag, attrs, ...kids) {
    if (U.h) return U.h(tag, attrs, ...kids);
    const n = document.createElement(tag);
    if (attrs && attrs.class) n.className = attrs.class;
    kids.forEach(k => k != null && n.append(k));
    return n;
  }

  function hasParam(name) {
    try { return new URLSearchParams(location.search).has(name); } catch (e) { return false; }
  }
  function reducedMotion() {
    return U.prefersReducedMotion ? U.prefersReducedMotion() : false;
  }

  /* ---------------- loading screen ---------------- */
  function initIntro(mount) {
    if (hasParam('nointro') || reducedMotion()) return;
    const force = hasParam('intro');
    try {
      if (!force && sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch (e) { /* storage blocked: just show it */ }

    const tips = (VICE.loadingTips && VICE.loadingTips.length) ? VICE.loadingTips.slice() : ['TIP: Stay hydrated.'];
    let tipIdx = Math.floor(Math.random() * tips.length);

    const tipEl = el('p', { class: 'intro__tip', 'aria-live': 'polite' }, tips[tipIdx]);
    const fill = el('span', { class: 'intro__bar-fill' });
    fill.style.animationDuration = LOAD_MS + 'ms';

    const overlay = el('div', {
      class: 'intro',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': 'Loading Pietro’s Bachelor Party. Press any key to skip.',
      tabindex: '-1',
    },
      el('div', { class: 'intro__sun', 'aria-hidden': 'true' }),
      el('div', { class: 'intro__floor', 'aria-hidden': 'true' }),
      el('div', { class: 'intro__mark' },
        el('span', { class: 'intro__name' }, 'Pietro’s'),
        el('span', { class: 'intro__kicker intro__kicker--below' }, 'Bachelor Party'),
        el('span', { class: 'intro__script' }, EV.subtitle || 'Vice City')
      ),
      el('div', { class: 'intro__bottom' },
        tipEl,
        el('div', { class: 'intro__bar', 'aria-hidden': 'true' }, fill),
        el('div', { class: 'intro__row' },
          el('span', { class: 'intro__loading' }, 'Loading'),
          el('span', { class: 'intro__skip' }, 'Press any key / tap to skip')
        )
      )
    );

    mount.appendChild(overlay);
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    document.body.classList.add('is-intro');
    try { overlay.focus({ preventScroll: true }); } catch (e) { overlay.focus(); }

    const tipTimer = setInterval(() => {
      if (tips.length < 2) return;
      let next;
      do { next = Math.floor(Math.random() * tips.length); } while (next === tipIdx);
      tipIdx = next;
      tipEl.classList.remove('is-in');
      void tipEl.offsetWidth; // restart fade
      tipEl.textContent = tips[tipIdx];
      tipEl.classList.add('is-in');
    }, TIP_MS);

    let done = false;
    const doneTimer = setTimeout(close, LOAD_MS + 450);

    function close() {
      if (done) return;
      done = true;
      clearInterval(tipTimer);
      clearTimeout(doneTimer);
      window.removeEventListener('keydown', onKey, true);
      overlay.removeEventListener('pointerdown', close);
      overlay.classList.add('is-leaving');
      root.style.overflow = prevOverflow;
      document.body.classList.remove('is-intro');
      setTimeout(() => overlay.remove(), 450);
    }
    function onKey(e) {
      // swallow keys that would otherwise scroll/activate behind the overlay
      if ([' ', 'Enter', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', 'Tab'].includes(e.key)) e.preventDefault();
      close();
    }
    window.addEventListener('keydown', onKey, true);
    overlay.addEventListener('pointerdown', close);
  }

  /* ---------------- HUD countdown ---------------- */
  const pad = n => String(n).padStart(2, '0');

  function initHud(mount) {
    const start = new Date(EV.start || '2027-03-19T15:00:00-04:00').getTime();
    const end = new Date(EV.end || '2027-03-21T23:59:00-04:00').getTime();
    // honour ?now= overrides while still ticking in real time
    const offset = (U.now ? U.now().getTime() : Date.now()) - Date.now();

    const label = el('span', { class: 'hud__label' }, 'Time until Vice');
    const value = el('span', { class: 'hud__value' });
    const sr = el('span', { class: 'visually-hidden' });
    const box = el('div', { class: 'hud', role: 'timer', 'aria-live': 'off' }, label, value, sr);
    mount.appendChild(box);

    let state = '';
    let timer;
    function tick() {
      const t = Date.now() + offset;
      let next;
      if (t >= end) next = 'passed';
      else if (t >= start) next = 'active';
      else next = 'countdown';

      if (next !== state) {
        state = next;
        box.dataset.state = state;
        if (state === 'passed') {
          label.textContent = 'Mission passed';
          value.textContent = 'Respect +100';
          sr.textContent = '';
          clearInterval(timer);
        } else if (state === 'active') {
          label.textContent = 'Vice City';
          value.textContent = 'Mission active';
          sr.textContent = '';
        } else {
          label.textContent = 'Time until Vice';
        }
      }
      if (state === 'countdown') {
        let s = Math.max(0, Math.floor((start - t) / 1000));
        const d = Math.floor(s / 86400); s -= d * 86400;
        const hh = Math.floor(s / 3600); s -= hh * 3600;
        const mm = Math.floor(s / 60); s -= mm * 60;
        value.textContent = `${pad(d)}:${pad(hh)}:${pad(mm)}:${pad(s)}`;
        sr.textContent = `${d} days, ${hh} hours, ${mm} minutes`;
      }
    }
    tick();
    timer = setInterval(tick, 1000);

    // Desktop: the floating HUD only shows over the hero so it never covers content below.
    const hero = document.getElementById('hero');
    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => box.classList.toggle('is-away', !e.isIntersecting), {
        rootMargin: '-35% 0px 0px 0px',
      }).observe(hero);
    }
  }

  /* ---------------- wanted stars ---------------- */
  function initWanted(mount) {
    const NS = 'http://www.w3.org/2000/svg';
    const stars = [];
    for (let i = 0; i < 5; i++) {
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('class', 'wanted-star');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', STAR_PATH);
      svg.appendChild(p);
      mount.appendChild(svg);
      stars.push(svg);
    }
    mount.classList.add('wanted');

    let last = -1;
    let queued = false;
    function update() {
      queued = false;
      const p = U.scrollProgress ? U.scrollProgress() : 0;
      const n = Math.min(5, Math.ceil(p * 5 - 1e-6));
      if (n === last) return;
      stars.forEach((s, i) => {
        const on = i < n;
        s.classList.toggle('is-on', on);
        if (on && i >= last && last !== -1) {
          s.classList.remove('is-pop');
          void s.getBoundingClientRect();
          s.classList.add('is-pop');
        }
      });
      mount.dataset.level = String(n);
      last = n;
    }
    function request() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    }
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    window.addEventListener('load', request);
    update();
  }

  /* ---------------- boot ----------------
     Deferred scripts run after parsing, so mounts already exist. Run the intro
     immediately (before first paint where possible); the rest on ready. */
  const introMount = document.getElementById('intro');
  if (introMount) initIntro(introMount);

  function boot() {
    const hud = document.getElementById('hud');
    if (hud && !hud.firstChild) initHud(hud);
    const wanted = document.getElementById('wanted');
    if (wanted && !wanted.firstChild) initWanted(wanted);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.initIntroHud = boot;
})();
