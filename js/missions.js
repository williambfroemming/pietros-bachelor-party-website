/* ============================================================
   MISSIONS + SAFEHOUSE (WS3)
   Renders VICE.missions into #missionsMount and VICE.safehouse
   into #safehouseMount. Status is computed from VICE_UTIL.now(),
   so ?now=2027-03-20T14:00 can be used to preview statuses.
   ============================================================ */
(function () {
  const U = window.VICE_UTIL;
  if (!U) return;
  const { h, fmtDate, mapsUrl, mapsEmbedUrl, isTBD, onReady, TZ } = U;

  // Missions starting before this hour (Miami time) belong to the previous day's group.
  const DAY_ROLLOVER_HOUR = 6;

  /* ---------- icons (trusted, hard-coded SVG) ---------- */
  const ICON = {
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 5a3 3 0 1 1 6 0v3H9V7Zm3 6.5a1.75 1.75 0 0 1 1 3.19V18.5h-2v-1.81a1.75 1.75 0 0 1 1-3.19Z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12 7v5l3.5 2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/></svg>',
    ext: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    shirt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 3 3 6l2 4 2-1v12h10V9l2 1 2-4-5-3c-.5 1.5-2 2.5-4 2.5S8.5 4.5 8 3Z"/></svg>',
  };
  const icon = (name, cls) => h('span', { class: 'mi-icon ' + (cls || ''), html: ICON[name] });

  /* ---------- helpers ---------- */
  const pad2 = n => String(n).padStart(2, '0');

  /** Miami-local calendar parts for a Date. */
  function miamiParts(d) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: TZ, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', hourCycle: 'h23', weekday: 'long',
    }).formatToParts(d);
    const o = {};
    parts.forEach(p => { o[p.type] = p.value; });
    return { y: +o.year, m: +o.month, d: +o.day, hour: +o.hour % 24, weekday: o.weekday };
  }

  /** Group key for a mission: its Miami date, with late-night (before 6 AM) rolled back a day. */
  function dayKey(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return { key: 'zz-unscheduled', label: 'UNSCHEDULED' };
    let p = miamiParts(d);
    if (p.hour < DAY_ROLLOVER_HOUR) p = miamiParts(new Date(d.getTime() - (p.hour + 1) * 3600e3));
    return {
      key: `${p.y}-${pad2(p.m)}-${pad2(p.d)}`,
      weekday: p.weekday.toUpperCase(),
      date: `${p.m}.${p.d}`,
    };
  }

  function statusOf(m, nowMs) {
    const s = Date.parse(m.start);
    let e = Date.parse(m.end);
    if (isNaN(s)) return 'locked';
    if (isNaN(e)) e = s + 2 * 3600e3;
    if (nowMs < s) return 'locked';
    if (nowMs <= e) return 'active';
    return 'complete';
  }

  const timeOnly = iso => fmtDate(iso, { hour: 'numeric', minute: '2-digit' });
  function timeRange(m) {
    if (!m.start || isNaN(Date.parse(m.start))) return 'TIME CLASSIFIED';
    const a = timeOnly(m.start);
    return m.end && !isNaN(Date.parse(m.end)) ? `${a} – ${timeOnly(m.end)}` : a;
  }

  /** Redacted black bars (decorative), with an accessible label. */
  function redacted(widths, label) {
    return h('span', { class: 'redacted', role: 'img', 'aria-label': label || 'Redacted' },
      widths.map(w => h('span', { class: 'redacted__bar', style: { width: w + 'ch' }, 'aria-hidden': 'true' })));
  }

  const STATUS_LABEL = { locked: 'LOCKED', active: 'ACTIVE', complete: 'COMPLETE' };

  /* ---------- mission card ---------- */
  function missionCard(m, index, nowMs) {
    const status = statusOf(m, nowMs);
    const titleTBD = isTBD(m.title);
    const classified = !!m.tbd || titleTBD;
    const locTBD = !!m.tbd || isTBD(m.location);
    const num = 'MISSION ' + pad2(index + 1);
    const title = titleTBD ? 'Classified Operation' : m.title;

    const statusBadge = h('span', { class: `mission__status mission__status--${status}` },
      status === 'locked' ? icon('lock', 'mi-icon--sm') : null,
      status === 'active' ? h('span', { class: 'mission__blip', 'aria-hidden': 'true' }) : null,
      STATUS_LABEL[status]);

    // Location row
    let locNode;
    if (locTBD) {
      locNode = redacted([9, 6], 'Location classified');
    } else {
      const q = !isTBD(m.mapsQuery) ? m.mapsQuery : m.location;
      locNode = h('a', { class: 'mission__maplink', href: mapsUrl(q), target: '_blank', rel: 'noopener noreferrer' },
        m.location, icon('ext', 'mi-icon--xs'));
    }

    const objectives = Array.isArray(m.objectives) ? m.objectives.filter(o => !isTBD(o)) : [];
    const hasLink = m.link && !isTBD(m.link);
    const hasDress = m.dressCode && !isTBD(m.dressCode);

    const stamps = [];
    if (status === 'complete') {
      stamps.push(h('span', { class: 'stamp mission__stamp mission__stamp--passed', 'aria-hidden': 'true' },
        h('span', { class: 'mission__stamp-small' }, 'Mission'), 'Passed'));
    } else if (classified) {
      stamps.push(h('span', { class: 'stamp mission__stamp mission__stamp--classified', 'aria-hidden': 'true' }, 'Classified'));
    }

    return h('article', {
      class: `mission mission--${status}` + (classified ? ' mission--classified' : '') + (stamps.length ? ' mission--stamped' : ''),
      id: m.id ? 'mission-' + m.id : null,
      'aria-label': `${num}: ${title}. Status: ${STATUS_LABEL[status]}${classified ? '. Classified' : ''}`,
    },
      h('header', { class: 'mission__top' },
        h('span', { class: 'mission__num' }, num),
        statusBadge),
      h('div', { class: 'mission__body' },
        h('h4', { class: 'mission__title' + (titleTBD ? ' mission__title--classified' : '') }, title),
        h('ul', { class: 'mission__meta' },
          h('li', null, icon('clock'), h('span', null, timeRange(m))),
          h('li', null, icon('pin'), h('span', { class: 'mission__loc' }, locNode))),
        objectives.length ? h('div', { class: 'mission__obj' },
          h('p', { class: 'mission__obj-label' }, 'Objectives'),
          h('ul', { class: 'mission__checklist' }, objectives.map(o =>
            h('li', null, h('span', { class: 'mission__box', 'aria-hidden': 'true' }), h('span', null, o))))) : null,
        (hasLink || hasDress) ? h('div', { class: 'mission__foot' },
          hasDress ? h('span', { class: 'mission__dress' }, icon('shirt', 'mi-icon--xs'), h('span', null, 'Dress code: ', h('strong', null, m.dressCode))) : null,
          hasLink ? h('a', { class: 'mission__intel', href: m.link, target: '_blank', rel: 'noopener noreferrer' }, 'Intel', icon('ext', 'mi-icon--xs')) : null) : null),
      stamps,
      status === 'locked' ? h('span', { class: 'mission__lock', 'aria-hidden': 'true', html: ICON.lock }) : null);
  }

  function initMissions(mount) {
    const list = (window.VICE && Array.isArray(window.VICE.missions)) ? window.VICE.missions.slice() : [];
    mount.textContent = '';
    if (!list.length) {
      mount.appendChild(h('p', { class: 'empty-state' }, 'No missions assigned yet. Stand by for orders.'));
      return;
    }
    list.sort((a, b) => (Date.parse(a.start) || Infinity) - (Date.parse(b.start) || Infinity));
    const nowMs = U.now().getTime();

    const groups = [];
    const byKey = {};
    list.forEach((m, i) => {
      const k = dayKey(m.start);
      if (!byKey[k.key]) { byKey[k.key] = { info: k, items: [] }; groups.push(byKey[k.key]); }
      byKey[k.key].items.push({ m, i });
    });

    groups.forEach(g => {
      const headId = 'missions-day-' + g.info.key;
      mount.appendChild(h('section', { class: 'mission-day', 'aria-labelledby': headId },
        h('h3', { class: 'mission-day__head', id: headId },
          h('span', { class: 'mission-day__weekday' }, g.info.weekday || g.info.label),
          g.info.date ? h('span', { class: 'mission-day__date' }, g.info.date) : null,
          h('span', { class: 'mission-day__rule', 'aria-hidden': 'true' }),
          h('span', { class: 'mission-day__count' }, g.items.length + (g.items.length === 1 ? ' mission' : ' missions'))),
        h('div', { class: 'mission-day__grid' }, g.items.map(({ m, i }) => missionCard(m, i, nowMs)))));
    });
  }

  /* ---------- safehouse ---------- */
  function hudRow(label, value) {
    return h('div', { class: 'hud-list__row' },
      h('dt', { class: 'hud-list__label' }, label),
      h('dd', { class: 'hud-list__value' }, value));
  }

  function initSafehouse(mount) {
    const s = (window.VICE && window.VICE.safehouse) || {};
    mount.textContent = '';
    const nameTBD = isTBD(s.name);
    const addrTBD = isTBD(s.address);
    const query = !isTBD(s.mapsQuery) ? s.mapsQuery : (!addrTBD ? s.address : 'Miami Beach, FL');
    const title = nameTBD ? 'Safehouse' : s.name;

    const mapPanel = h('figure', { class: 'panel safehouse__map', style: { '--tilt': '-1deg' } },
      h('div', { class: 'safehouse__map-fallback', 'aria-hidden': 'true' }, h('span', null, 'Acquiring satellite link…')),
      h('iframe', {
        class: 'safehouse__iframe',
        src: mapsEmbedUrl(query),
        title: 'Map: ' + (nameTBD ? query : s.name),
        loading: 'lazy',
        referrerpolicy: 'no-referrer-when-downgrade',
        allowfullscreen: true,
      }),
      h('figcaption', { class: 'panel--caption safehouse__caption' }, nameTBD ? 'Sector: ' + query : s.name));

    const rows = [];
    rows.push(hudRow('Name', nameTBD
      ? h('span', { class: 'safehouse__classified' }, 'Location classified')
      : s.name));
    rows.push(hudRow('Address', addrTBD ? redacted([14, 9], 'Address classified') : s.address));
    if (s.checkIn != null) rows.push(hudRow('Check-in', isTBD(s.checkIn) ? redacted([10], 'Check-in time classified') : s.checkIn));
    if (s.checkOut != null) rows.push(hudRow('Check-out', isTBD(s.checkOut) ? redacted([10], 'Check-out time classified') : s.checkOut));

    const actions = h('div', { class: 'safehouse__actions' },
      (s.bookingUrl && !isTBD(s.bookingUrl))
        ? h('a', { class: 'btn', href: s.bookingUrl, target: '_blank', rel: 'noopener noreferrer' }, 'Book your room')
        : null,
      h('a', { class: 'btn btn--cyan', href: mapsUrl(addrTBD ? query : s.address), target: '_blank', rel: 'noopener noreferrer' },
        'Open in Maps'));

    const details = h('div', { class: 'safehouse__intel' },
      h('p', { class: 'safehouse__eyebrow' }, h('span', { class: 'safehouse__dot', 'aria-hidden': 'true' }), 'Safehouse unlocked'),
      h('h3', { class: 'safehouse__name' + (nameTBD ? ' safehouse__name--tbd' : '') }, title),
      h('dl', { class: 'hud-list' }, rows),
      nameTBD ? h('p', { class: 'safehouse__note' }, 'Coordinates drop closer to go time. Keep your phone on.') : null,
      actions);

    mount.appendChild(h('div', { class: 'safehouse' }, mapPanel, details));
  }

  onReady('missionsMount', initMissions);
  onReady('safehouseMount', initSafehouse);

  window.VICE_MISSIONS = { initMissions, initSafehouse, dayKey, statusOf };
})();
