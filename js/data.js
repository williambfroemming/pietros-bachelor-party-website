/* ============================================================
   DATA — all site content lives here.
   Schema owned by WS0 (see PLAN.md §4). Content filled by WS5 / the user.
   Dates: ISO strings with offset (Miami is UTC-04:00 in March 2027).
   Unknown values: 'TBD' (renders as CLASSIFIED) or null (row hidden).
   ============================================================ */
window.VICE = {
  event: {
    title: 'Pietro’s Bachelor Party',
    subtitle: 'Vice City',
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
    'TIP: Linen wrinkles. That is the look. Do not iron it.',
    'TIP: The groom cannot be arrested for being too well dressed. We checked.',
    'TIP: A 4-star wanted level can be cleared by a recovery brunch and a nap.',
    'TIP: Uber XL fits six. The seventh guy is riding in the trunk of your memory.',
    'TIP: The ocean is not a pool. Lifeguards do not respond to "watch this."',
    'TIP: Sunglasses at night are allowed in Miami. It is basically the law.',
    'TIP: Save the safehouse address in your phone before your phone dies.',
    'TIP: One water per drink. The math is simple. The execution is not.',
    'TIP: Pastels are tactical camouflage on Ocean Drive.',
    'TIP: Check in to the group chat. Missing crew members trigger a manhunt.',
    'TIP: Respect +100 for whoever remembers where the boat is docked.',
  ],

  // Photos: set `photo: 'images/crew/{slug}.jpg'` once the portrait exists; `photo: null` shows the
  // PHOTO PENDING placeholder. (Omit `photo` entirely to auto-probe .png/.jpg/.jpeg/.webp.)
  // Groom only: optional `photoWide: 'images/crew/pietro-wide.jpg'` (16:9) for desktop.
  /* ---------- EPITHET BANK (WS5) ----------------------------------------
     Unassigned GTA-flavored epithets — pick one per crew member once the
     list is confirmed. (Already taken: The Smuggler (Bill), The Getaway
     Driver (Mario). Avoids everything used on the Mario site: Italian
     Stallion, The Don, King of New York, Brooklyn Blur, Consigliere, The OG,
     Cincinnati Streak, Margin Call, Closing Argument, Liquidity Provider,
     Doctor Is In, Conductor, Il Cugino, Controller, Mile High Cowboy.)
       'The Wheelman'          'The Fixer'             'The Organizer'
       'The Accountant'        'The Inside Man'        'The Lookout'
       'The Safecracker'       'The Muscle'            'The Smooth Talker'
       'The Forger'            'The Pilot'             'The Cleaner'
       'Mr. Vice'              'The Hustler'           'The Informant'
       'The Bagman'            'The Wild Card'         'The Ghost'
       'The Night Shift'       'The Best Man'          'The Ocean Drive Outlaw'
       'The Biscayne Bandit'
     ----------------------------------------------------------------------- */
  crew: [
    {
      slug: 'pietro',
      name: 'Pietro Conte',
      role: 'The Groom',
      epithet: 'The Kingpin of South Beach',
      bio: 'An Italian OG forged on the formidable streets of Addison, Illinois, now operating out of Marina Del Rey, where he is widely considered the best-dressed man in the jurisdiction. Known associates describe him as charming, impeccably tailored and dangerously good at talking his way into the best table in the room. Last seen heading to Miami for one final job before he goes legit.',
      wanted: 5,
      isGroom: true,
      photo: 'images/crew/pietro.jpg',
      tilt: 0,
    },
    {
      slug: 'bill',
      photo: 'images/crew/bill.jpg',
      name: 'Bill Froemming',
      epithet: 'The Smuggler',
      bio: "Silicon Valley's most prolific agentic AI auditing expert, now moonlighting as the operation's logistics man. Every flight, room and boat slip runs through him, so send him your itinerary or risk being left on the dock. Once Bill gets going, you can't stop him.",
      wanted: 4,
    },
    {
      slug: 'mario',
      photo: 'images/crew/mario.jpg',
      name: 'Mario Guagliardo',
      epithet: 'The Getaway Driver',
      bio: 'Formerly known as The Italian Stallion, the groom of the last job (Vegas) is back in the game, this time behind the wheel. A die-hard Indiana Hoosiers fan with a clean record of bringing the crew home. Pursuit units advised: he knows every back road out of Vice.',
      wanted: 4,
    },
    { slug: 'crew3', photo: null, name: 'TBD', epithet: 'TBD', bio: 'TODO', wanted: 2 },
    { slug: 'crew4', photo: null, name: 'TBD', epithet: 'TBD', bio: 'TODO', wanted: 3 },
    { slug: 'crew5', photo: null, name: 'TBD', epithet: 'TBD', bio: 'TODO', wanted: 4 },
  ],

  /* ---------- MISSION IDEAS (WS5) — NOTHING BELOW IS BOOKED ---------------
     When a venue is confirmed: set title, location, mapsQuery, objectives,
     dressCode (optional), and flip tbd to false.

     Fri dinner / Sat dinner — steakhouse or Italian dinner
       title: 'Operation Stone Crab' | 'The Last Supper (As a Free Man)' | 'The Sit-Down'
       objectives: ['Arrive in the dinner fit', 'Toast the groom', 'Do not let Pietro see the check']
       dressCode: 'Dinner sharp: collared shirt, no shorts'

     Fri night / Sat night — club night (e.g. LIV at the Fontainebleau, E11EVEN downtown)
       title: 'The Velvet Rope Job' | 'Vice After Dark' | 'Operation Neon'
       objectives: ['Get the whole crew past the door', 'Secure the table', 'Nobody gets left behind']
       dressCode: 'Club fit: closed-toe shoes, no athletic wear'

     Sat day — boat day on Biscayne Bay
       title: 'The Yacht Job' | 'Operation Sandbar' | 'Biscayne Bay Getaway'
       objectives: ['Report to the marina on time', 'Apply SPF (then reapply)', 'Keep the groom on board']
       dressCode: 'Swim trunks, linen, sunglasses'

     Sat day (alt) — South Beach pool / day party
       title: 'The Pool Deck Heist' | 'Operation Day Shift'
       objectives: ['Claim the cabana', 'Hydrate like a professional', 'Be dinner-ready by 7']

     Sat day (alt) — Wynwood Walls walk + Little Havana cigars
       title: 'The Art Heist' | 'Operation Calle Ocho'
       objectives: ['Photo with the walls', 'Cafecito on Calle Ocho', 'Light one for the groom']

     Sun recovery — recovery brunch
       title: 'The Brunch Heist' | 'Mission Recovery' | 'Clear Your Wanted Level'
       objectives: ['Eggs, coffee, electrolytes', 'Recount the evidence', 'Get to the airport on time']
     ----------------------------------------------------------------------- */
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
  gettingAround: [
    {
      title: 'MIA vs FLL',
      body: 'Miami International (MIA) is the closer airport: a rideshare to South Beach typically takes about 20–30 minutes. Fort Lauderdale (FLL) often has cheaper fares but is farther, usually about 40–60 minutes to South Beach, and more with Friday traffic. Either works; just factor in the drive.',
    },
    {
      title: 'Rideshare is the move',
      body: 'Skip the rental car. Parking on Miami Beach is scarce and expensive, and nobody should be driving after a club night anyway. Uber and Lyft are everywhere, and most of the weekend is a short ride apart.',
    },
    {
      title: 'Split the ride',
      body: 'Travel in packs. An Uber XL or Lyft XL fits about six, so one person calls it and the rest pay them back on Venmo. Prices can surge after midnight and when the clubs let out, so expect to wait a bit or walk a block to get a pickup.',
    },
    {
      title: 'Valet & parking',
      body: 'If you do drive, most hotels and many restaurants on the beach are valet-only, and overnight hotel valet typically runs well above what you would pay at home. Check your hotel’s rate before you book a car.',
    },
  ],

  // { item:'Linen shirt', qty:2, icon:'👕' }  (qty and icon optional)
  loadout: [
    { item: 'Linen shirts', qty: 2, icon: '👕' },
    { item: 'Swim trunks', qty: 2, icon: '🩳' },
    { item: 'Sunglasses', qty: 1, icon: '🕶️' },
    { item: 'SPF 50 sunscreen', qty: 1, icon: '🧴' },
    { item: 'Nice dinner fit', qty: 1, icon: '👔' },
    { item: 'White or pastel Miami Vice fit (theme night)', qty: 1, icon: '🌴' },
    { item: 'Club-ready shoes (closed-toe)', qty: 1, icon: '👞' },
    { item: 'Comfortable walking shoes or sandals', qty: 1, icon: '🩴' },
    { item: 'Photo ID', qty: 1, icon: '🪪' },
    { item: 'Phone charger + battery pack', qty: 1, icon: '🔋' },
    { item: 'Liquid IV / electrolytes', qty: 3, icon: '💧' },
    { item: 'Painkillers for Sunday', qty: 1, icon: '💊' },
  ],

  weather: {
    summary: 'Mid-March in Miami: highs around 80°F, lows around 67°F, mostly dry.',
    note: 'The sun is stronger than it feels with the ocean breeze. Reapply SPF every couple of hours, especially on the boat.',
    dressCode: 'Miami chic: linen, pastels, white and open collars. Leave the hoodies at home.',
  },
};
