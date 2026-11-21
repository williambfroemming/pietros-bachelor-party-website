/* ============================================================
   LOGISTICS (WS4) — "Flight Plan" page
   Renders arrivals/departures boards, rooms, getting around,
   loadout and weather from window.VICE into #logisticsMount.
   ============================================================ */
(function () {
  const U = window.VICE_UTIL;
  if (!U) return;
  const { h, fmtDate, isTBD, onReady, prefersReducedMotion } = U;

  /* ---------------- helpers ---------------- */
  const AIRLINE_ICAO = {
    AA: 'AAL', AMERICAN: 'AAL',
    DL: 'DAL', DELTA: 'DAL',
    UA: 'UAL', UNITED: 'UAL',
    B6: 'JBU', JETBLUE: 'JBU',
    WN: 'SWA', SOUTHWEST: 'SWA',
    AS: 'ASA', ALASKA: 'ASA',
    NK: 'NKS', SPIRIT: 'NKS',
    F9: 'FFT', FRONTIER: 'FFT',
  };

  /** "AA 1234" / "Delta 456" / "JetBlue Airways 12" → "AAL1234" / "DAL456" / "JBU12" */
  function flightCode(flight) {
    const raw = String(flight || '').trim();
    const m = raw.match(/^(.*?)[\s-]*(\d{1,5})$/);
    if (m && m[1]) {
      const prefix = m[1].toUpperCase().replace(/\b(AIR ?LINES|AIRWAYS)\b/g, '').replace(/[^A-Z0-9]/g, '');
      return (AIRLINE_ICAO[prefix] || prefix) + m[2];
    }
    return raw.replace(/\s+/g, '');
  }
  function trackUrl(f) {
    if (f.trackUrl) return f.trackUrl;
    if (isTBD(f.flight)) return null;
    return 'https://flightaware.com/live/flight/' + encodeURIComponent(flightCode(f.flight));
  }

  function time(v) { const t = new Date(v).getTime(); return isNaN(t) ? Infinity : t; }
  function sortBy(list, key) { return list.slice().sort((a, b) => time(a[key]) - time(b[key])); }

  const contact = () => (window.VICE.event && window.VICE.event.contact) || 'the organizer';
  const show = v => (isTBD(v) ? 'TBD' : String(v));

  /** Time cell: big HH:MM, small date line. */
  function timeCell(iso) {
    if (isTBD(iso)) return h('span', { class: 'board__tbd flap' }, 'TBD');
    const d = new Date(iso);
    if (isNaN(d)) return h('span', { class: 'flap' }, String(iso));
    return h('span', { class: 'board__when' },
      h('span', { class: 'board__time flap' }, fmtDate(iso, { hour: 'numeric', minute: '2-digit' })),
      h('span', { class: 'board__date flap' }, fmtDate(iso, { weekday: 'short', month: 'short', day: 'numeric' })));
  }

  /* ---------------- section shell ---------------- */
  function section(id, num, label, title, ...body) {
    return h('section', { class: 'lg-section', id, 'aria-labelledby': id + '-title' },
      h('header', { class: 'lg-head' },
        h('span', { class: 'lg-head__num', 'aria-hidden': 'true' }, num),
        h('div', null,
          h('p', { class: 'section-label' }, label),
          h('h2', { class: 'lg-title', id: id + '-title' }, title)
        )
      ),
      body
    );
  }

  function emptyBox(icon, title, text, extraClass) {
    return h('div', { class: 'lg-empty' + (extraClass ? ' ' + extraClass : '') },
      h('span', { class: 'lg-empty__icon', 'aria-hidden': 'true' }, icon),
      h('p', { class: 'lg-empty__title' }, title),
      text ? h('p', { class: 'lg-empty__text' }, text) : null
    );
  }

  /* ---------------- 1 + 2: flight boards ---------------- */
  const COLS = ['Crew', 'From', 'Departs', 'To', 'Arrives', 'Flight'];

  function boardRow(f) {
    const url = trackUrl(f);
    const flightLabel = show(f.flight);
    return h('tr', { class: 'board__row' },
      h('td', { 'data-label': 'Crew', class: 'board__crew' }, h('span', { class: 'flap' }, show(f.name))),
      h('td', { 'data-label': 'From', class: 'board__code' }, h('span', { class: 'flap' }, show(f.from))),
      h('td', { 'data-label': 'Departs' }, timeCell(f.departs)),
      h('td', { 'data-label': 'To', class: 'board__code' }, h('span', { class: 'flap' }, show(f.to || 'MIA'))),
      h('td', { 'data-label': 'Arrives' }, timeCell(f.arrives)),
      h('td', { 'data-label': 'Flight', class: 'board__flight' },
        url
          ? h('a', { class: 'board__track', href: url, target: '_blank', rel: 'noopener noreferrer',
              'aria-label': `Track ${flightLabel} on FlightAware (opens in new tab)` },
              h('span', { class: 'flap' }, flightLabel), ' ↗')
          : h('span', { class: 'board__tbd flap' }, flightLabel)
      )
    );
  }

  function placeholderRow() {
    return h('tr', { class: 'board__row board__row--ghost', 'aria-hidden': 'true' },
      COLS.map(() => h('td', null, h('span', { class: 'flap' }, '— — —'))));
  }

  function board(kind, title, rows) {
    const isEmpty = !rows.length;
    const icon = kind === 'arr' ? '🛬' : '🛫';
    const table = h('table', { class: 'board__table' },
      h('caption', { class: 'visually-hidden' }, title + ' flights. Times shown in Miami time.'),
      h('thead', null, h('tr', null, COLS.map(c => h('th', { scope: 'col' }, c)))),
      h('tbody', null,
        isEmpty
          ? [
              h('tr', { class: 'board__row board__row--empty' },
                h('td', { colspan: COLS.length },
                  h('span', { class: 'board__empty-msg flap' }, `No intel yet. Send your flight to ${contact()}.`),
                  h('span', { class: 'board__cursor', 'aria-hidden': 'true' }, '▌'))),
              placeholderRow(), placeholderRow(),
            ]
          : rows.map(boardRow)
      )
    );
    return h('div', { class: 'board board--' + kind + (isEmpty ? ' board--is-empty' : '') },
      h('div', { class: 'board__bar' },
        h('span', { class: 'board__bar-title' }, h('span', { 'aria-hidden': 'true' }, icon + ' '), title),
        h('span', { class: 'board__bar-meta' },
          h('span', { class: 'board__led', 'aria-hidden': 'true' }),
          isEmpty ? 'Awaiting intel' : `${rows.length} ${rows.length === 1 ? 'flight' : 'flights'}`,
          h('span', { class: 'board__tz' }, ' · Miami time'))
      ),
      h('div', { class: 'board__scroll' }, table)
    );
  }

  /* split-flap scramble on load */
  const FLAP_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  function flapIn(root) {
    if (prefersReducedMotion()) return;
    root.classList.add('is-flapping');
    const els = root.querySelectorAll('.flap');
    els.forEach((el, i) => {
      const final = el.textContent;
      const delay = Math.min(i * 22, 900);
      const steps = 6 + (i % 5);
      let n = 0;
      setTimeout(() => {
        const timer = setInterval(() => {
          n++;
          if (n >= steps) { clearInterval(timer); el.textContent = final; el.classList.add('is-set'); return; }
          el.textContent = final.replace(/[A-Za-z0-9]/g, () => FLAP_CHARS[(Math.random() * FLAP_CHARS.length) | 0]);
        }, 55);
      }, delay);
    });
  }

  /* ---------------- 3: rooms ---------------- */
  function rooms(list) {
    if (!list.length) {
      return h('div', { class: 'lg-rooms' },
        [1, 2, 3].map(n => h('article', { class: 'room room--ghost', 'aria-hidden': 'true' },
          h('p', { class: 'room__label' }, 'Suite'),
          h('p', { class: 'room__name' }, '0' + n),
          h('div', { class: 'room__redact' }, h('span'), h('span')),
          h('span', { class: 'room__stamp stamp' }, 'Pending'))),
        h('p', { class: 'lg-note' }, 'Room assignments drop once the safehouse is locked in.'));
    }
    return h('div', { class: 'lg-rooms' }, list.map(r => {
      const names = (r.names || []).filter(n => !isTBD(n));
      return h('article', { class: 'room' },
        h('p', { class: 'room__label' }, 'Safehouse key'),
        h('h3', { class: 'room__name' }, show(r.room)),
        names.length
          ? h('ul', { class: 'room__names' }, names.map(n => h('li', null, n)))
          : h('p', { class: 'room__open' }, 'Unassigned'));
    }));
  }

  /* ---------------- 4: getting around ---------------- */
  function gettingAround(list) {
    if (!list.length) {
      return emptyBox('🚕', 'Route intel incoming', 'Airport transfers, rideshare times and parking notes are on the way.');
    }
    return h('div', { class: 'lg-cards' }, list.map((c, i) =>
      h('article', { class: 'lg-card' },
        h('span', { class: 'lg-card__idx', 'aria-hidden': 'true' }, String(i + 1).padStart(2, '0')),
        h('h3', { class: 'lg-card__title' }, show(c.title)),
        c.body ? h('p', { class: 'lg-card__body' }, c.body) : null)));
  }

  /* ---------------- 5: loadout ---------------- */
  function loadout(list) {
    const SLOTS = 12;
    if (!list.length) {
      return h('div', { class: 'inv inv--empty' },
        h('div', { class: 'inv__grid', 'aria-hidden': 'true' },
          Array.from({ length: SLOTS }, () => h('div', { class: 'inv__tile inv__tile--blank' }))),
        h('div', { class: 'inv__overlay' },
          emptyBox('🎒', 'Inventory empty', 'Packing list drops soon. Pack sunscreen anyway.')));
    }
    return h('div', { class: 'inv' },
      h('ul', { class: 'inv__grid' }, list.map(it =>
        h('li', { class: 'inv__tile' },
          h('span', { class: 'inv__icon', 'aria-hidden': 'true' }, it.icon || '📦'),
          h('span', { class: 'inv__item' }, show(it.item)),
          it.qty != null && it.qty !== '' && Number(it.qty) !== 1 ? h('span', { class: 'inv__qty' }, '×' + it.qty) : null))));
  }

  /* ---------------- 6: weather ---------------- */
  function weather(w) {
    w = w || {};
    const summary = w.summary || '';
    const hi = (summary.match(/highs?[^0-9]{0,15}(\d{2,3})/i) || [])[1];
    const lo = (summary.match(/lows?[^0-9]{0,15}(\d{2,3})/i) || [])[1];
    const ev = window.VICE.event || {};
    const days = [];
    const start = new Date(ev.start), end = new Date(ev.end);
    if (!isNaN(start) && !isNaN(end)) {
      for (let t = start.getTime(), i = 0; t <= end.getTime() && i < 5; t += 864e5, i++) days.push(new Date(t).toISOString());
    }
    const hasDress = !isTBD(w.dressCode);
    return h('div', { class: 'wx' },
      h('div', { class: 'wx__main' },
        h('div', { class: 'wx__now' },
          h('span', { class: 'wx__sun', 'aria-hidden': 'true' }),
          h('div', null,
            h('p', { class: 'wx__city' }, (ev.city || 'Miami, FL')),
            hi ? h('p', { class: 'wx__temp' }, hi + '°', lo ? h('span', { class: 'wx__lo' }, ' / ' + lo + '°') : null) : null,
            h('p', { class: 'wx__cond' }, 'Sunny · Humid · Typical mid-March'))),
        summary ? h('p', { class: 'wx__summary' }, summary) : null,
        w.note ? h('p', { class: 'wx__note' }, w.note) : null,
        days.length && hi
          ? h('ul', { class: 'wx__days', 'aria-label': 'Typical conditions by day' }, days.map(iso =>
              h('li', { class: 'wx__day' },
                h('span', { class: 'wx__dow' }, fmtDate(iso, { weekday: 'short' })),
                h('span', { class: 'wx__dnum' }, fmtDate(iso, { month: 'numeric', day: 'numeric' })),
                h('span', { class: 'wx__dicon', 'aria-hidden': 'true' }, '☀️'),
                h('span', { class: 'wx__drange' }, hi + '° ', lo ? h('span', null, lo + '°') : null))))
          : null,
        days.length && hi ? h('p', { class: 'wx__fine' }, 'Historical averages, not a live forecast.') : null),
      h('aside', { class: 'wx__dress' + (hasDress ? '' : ' wx__dress--tbd') },
        h('p', { class: 'section-label' }, '// Dress code'),
        hasDress
          ? h('p', { class: 'wx__dress-text' }, w.dressCode)
          : [h('p', { class: 'wx__dress-text' }, 'Classified'),
             h('p', { class: 'wx__dress-sub' }, 'Full fit briefing drops soon.')])
    );
  }

  /* ---------------- quick-jump HUD ---------------- */
  const JUMPS = [
    ['lg-arrivals', 'Inbound'], ['lg-departures', 'Outbound'], ['lg-rooms', 'Rooms'],
    ['lg-around', 'Getting around'], ['lg-loadout', 'Loadout'], ['lg-weather', 'Weather'],
  ];
  function jumpBar() {
    return h('nav', { class: 'lg-jump', 'aria-label': 'Flight plan sections' },
      JUMPS.map(([id, label], i) =>
        h('a', { class: 'lg-jump__link', href: '#' + id },
          h('span', { class: 'lg-jump__num', 'aria-hidden': 'true' }, String(i + 1).padStart(2, '0')), label)));
  }

  /* ---------------- init ---------------- */
  function initLogistics(mount) {
    const V = window.VICE || {};
    const flights = V.flights || {};
    const arrivals = sortBy(flights.arrivals || [], 'arrives');
    const departures = sortBy(flights.departures || [], 'departs');

    const arrBoard = board('arr', 'MIA · Arrivals', arrivals);
    const depBoard = board('dep', 'MIA · Departures', departures);

    mount.textContent = '';
    mount.append(
      jumpBar(),
      section('lg-arrivals', '01', '// Arrivals', 'Inbound to MIA', arrBoard),
      section('lg-departures', '02', '// Departures', 'Outbound', depBoard),
      section('lg-rooms', '03', '// Safehouse', 'Safehouse Assignments', rooms(V.rooms || [])),
      section('lg-around', '04', '// Transport', 'Getting Around', gettingAround(V.gettingAround || [])),
      section('lg-loadout', '05', '// Inventory', 'Loadout', loadout(V.loadout || [])),
      section('lg-weather', '06', '// Forecast', 'Weather & Dress Code', weather(V.weather))
    );

    flapIn(arrBoard);
    // Departures board flips when it scrolls into view
    if ('IntersectionObserver' in window && !prefersReducedMotion()) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          io.disconnect();
          flapIn(depBoard);
        });
      }, { threshold: 0.2 });
      io.observe(depBoard);
    } else {
      flapIn(depBoard);
    }
  }

  onReady('logisticsMount', initLogistics);
})();
