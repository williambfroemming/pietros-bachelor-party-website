/* ============================================================
   CORE (WS0) — shared helpers + nav behavior
   Exposes window.VICE_UTIL for feature scripts.
   ============================================================ */
(function () {
  const TZ = 'America/New_York';

  /** Tiny element builder: h('div', {class:'x', onclick:fn}, child, 'text', [more]) */
  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else if (k === 'html') el.innerHTML = v; // only for trusted, hard-coded markup
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (k === 'dataset') Object.assign(el.dataset, v);
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    appendChildren(el, children);
    return el;
  }
  function appendChildren(el, children) {
    for (const c of children) {
      if (c == null || c === false) continue;
      if (Array.isArray(c)) appendChildren(el, c);
      else el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
    }
  }

  /** Format an ISO date string in Miami time. */
  function fmtDate(iso, opts) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return String(iso);
    return new Intl.DateTimeFormat('en-US', Object.assign({ timeZone: TZ }, opts || {
      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    })).format(d);
  }

  function mapsUrl(query) {
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query || '');
  }
  function mapsEmbedUrl(query) {
    return 'https://maps.google.com/maps?q=' + encodeURIComponent(query || '') + '&t=&z=15&ie=UTF8&iwloc=&output=embed';
  }

  /** 0..1 scroll progress through the document. */
  function scrollProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  }

  /** Current time — overridable with ?now=2027-03-20T14:00 (interpreted as Miami time if no offset). */
  function now() {
    try {
      const p = new URLSearchParams(location.search).get('now');
      if (p) {
        const hasOffset = /([+-]\d\d:?\d\d|Z)$/.test(p);
        const d = new Date(hasOffset ? p : p + '-04:00');
        if (!isNaN(d)) return d;
      }
    } catch (e) { /* ignore */ }
    return new Date();
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  const isTBD = v => v == null || v === '' || String(v).toUpperCase() === 'TBD';

  /** Deterministic pseudo-random in [0,1) from a string. */
  function hash01(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return ((h >>> 0) % 10000) / 10000;
  }

  /** Run fn on DOMContentLoaded only if element #id exists. */
  function onReady(id, fn) {
    const run = () => { const el = document.getElementById(id); if (el) fn(el); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
    else run();
  }

  window.VICE_UTIL = { h, fmtDate, mapsUrl, mapsEmbedUrl, scrollProgress, now, prefersReducedMotion, isTBD, hash01, onReady, TZ };

  /* ---------------- nav behavior ---------------- */
  function navHeight() {
    const nav = document.getElementById('nav');
    return nav ? nav.offsetHeight : 0;
  }

  function closeMobile() {
    const drawer = document.getElementById('navMobile');
    const btn = document.getElementById('navHamburger');
    if (drawer) drawer.classList.remove('is-open');
    if (btn) { btn.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const id = link.getAttribute('href');
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight();
        window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        history.replaceState(null, '', id);
        closeMobile();
      });
    });
  }

  function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav__link[href^="#"]');
    if (!sections.length || !links.length || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(link => {
          link.classList.toggle('nav__link--active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: `-${navHeight()}px 0px -55% 0px`, threshold: 0 });
    sections.forEach(s => observer.observe(s));
  }

  function initHamburger() {
    const btn = document.getElementById('navHamburger');
    const drawer = document.getElementById('navMobile');
    if (!btn || !drawer) return;
    btn.addEventListener('click', () => {
      const open = !drawer.classList.contains('is-open');
      drawer.classList.toggle('is-open', open);
      btn.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobile));
  }

  function initFooter() {
    const el = document.getElementById('footerText');
    const ev = window.VICE && window.VICE.event;
    if (el && ev && ev.footer) el.textContent = `Miami, March 2027  ★  ${ev.footer}`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initActiveNav();
    initHamburger();
    initFooter();
  });
})();
