/* ============================================================
   DATA — all site content lives here.
   Schema owned by WS0 (see PLAN.md §4). Content filled by WS5 / the user.
   Dates: ISO strings with offset (Miami is UTC-04:00 in March 2027).
   Unknown values: 'TBD' (renders as CLASSIFIED) or null (row hidden).
   ============================================================ */
window.VICE = {
  event: {
    title: 'Grand Theft Pietro',
    subtitle: 'Vice Weekend',
    city: 'Miami, FL',
    start: '2027-03-19T15:00:00-04:00',
    end:   '2027-03-21T23:59:00-04:00',
    dateLabel: 'March 19–21, 2027',
    footer: 'What happens in Vice, stays in Vice.',
    contact: 'Bill', // "Send your flight to ___"
  },

  loadingTips: [
    'TIP: SPF 50 is not optional. Pietro is not carrying you home.',
    'TIP: Hydrate between South Beach and the club. Your liver has a wanted level too.',
    'TIP: Cuban coffee is a performance-enhancing drug. Use responsibly.',
    'TIP: Never split a check eight ways at 3 AM.',
  ],

  // Photos: images/crew/{slug}.png (falls back to .jpg/.jpeg/.webp, then a placeholder)
  crew: [
    {
      slug: 'pietro',
      name: 'Pietro Conte',
      role: 'The Groom',
      epithet: 'The Kingpin of South Beach',
      bio: 'TODO',
      wanted: 5,
      isGroom: true,
      tilt: 0,
    },
    { slug: 'crew1', name: 'TBD', epithet: 'TBD', bio: 'TODO', wanted: 3 },
    { slug: 'crew2', name: 'TBD', epithet: 'TBD', bio: 'TODO', wanted: 4 },
    { slug: 'crew3', name: 'TBD', epithet: 'TBD', bio: 'TODO', wanted: 2 },
    { slug: 'crew4', name: 'TBD', epithet: 'TBD', bio: 'TODO', wanted: 3 },
    { slug: 'crew5', name: 'TBD', epithet: 'TBD', bio: 'TODO', wanted: 4 },
  ],

  missions: [
    {
      id: 'arrival', title: 'Touchdown in Vice',
      start: '2027-03-19T15:00:00-04:00', end: '2027-03-19T18:00:00-04:00',
      location: 'TBD', mapsQuery: null, link: null,
      objectives: ['Check into the safehouse', 'Change into linen', 'Report to the pool'],
      dressCode: null, tbd: true,
    },
    {
      id: 'fri-dinner', title: 'TBD',
      start: '2027-03-19T20:00:00-04:00', end: '2027-03-19T22:00:00-04:00',
      location: 'TBD', mapsQuery: null, link: null, objectives: [], dressCode: null, tbd: true,
    },
    {
      id: 'fri-night', title: 'TBD',
      start: '2027-03-19T23:00:00-04:00', end: '2027-03-20T03:00:00-04:00',
      location: 'TBD', mapsQuery: null, link: null, objectives: [], dressCode: null, tbd: true,
    },
    {
      id: 'sat-day', title: 'TBD',
      start: '2027-03-20T11:00:00-04:00', end: '2027-03-20T17:00:00-04:00',
      location: 'TBD', mapsQuery: null, link: null, objectives: [], dressCode: null, tbd: true,
    },
    {
      id: 'sat-dinner', title: 'TBD',
      start: '2027-03-20T20:00:00-04:00', end: '2027-03-20T22:00:00-04:00',
      location: 'TBD', mapsQuery: null, link: null, objectives: [], dressCode: null, tbd: true,
    },
    {
      id: 'sat-night', title: 'TBD',
      start: '2027-03-20T23:00:00-04:00', end: '2027-03-21T04:00:00-04:00',
      location: 'TBD', mapsQuery: null, link: null, objectives: [], dressCode: null, tbd: true,
    },
    {
      id: 'sun-recovery', title: 'TBD',
      start: '2027-03-21T11:00:00-04:00', end: '2027-03-21T15:00:00-04:00',
      location: 'TBD', mapsQuery: null, link: null, objectives: [], dressCode: null, tbd: true,
    },
  ],

  safehouse: {
    name: 'TBD',
    address: 'TBD',
    mapsQuery: 'Miami Beach, FL',
    checkIn: 'Fri, Mar 19 · 3:00 PM',
    checkOut: 'Sun, Mar 21 · 11:00 AM',
    bookingUrl: null,
  },

  flights: {
    // { name, from, departs:'2027-03-19T12:05:00-04:00', to:'MIA', arrives:'…', flight:'AA 1234', trackUrl:null }
    arrivals: [],
    departures: [],
  },

  // { room:'Suite 1', names:['…','…'] }
  rooms: [],

  // { title, body }
  gettingAround: [],

  // { item:'Linen shirt', qty:2, icon:'👕' }  (qty and icon optional)
  loadout: [],

  weather: {
    summary: 'Mid-March in Miami: highs around 80°F, lows around 67°F, mostly dry.',
    note: null,
    dressCode: null,
  },
};
