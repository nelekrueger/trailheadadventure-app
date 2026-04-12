// ============================================================
// data.js — ALL content for the Paws & Trails app
//
// This is the ONLY file you need to edit to add or update
// content. Never edit app.js for content changes.
//
// TO ADD A NEW ENTRY: copy an existing entry from the relevant
// array below, paste it at the end of that array, update all
// the fields, and make sure the id is unique and sequential.
//
// Use the admin.html form to generate correct snippets
// without needing to type raw data manually.
// ============================================================


// ── HIKES & TRAIL RUNS ───────────────────────────────────────
// Hiking and trail running routes around Alingsås.
//
// Key fields:
//   id              unique, e.g. "hike-006"
//   distance_km     total route distance
//   elevation_m     total elevation gain in metres
//   difficulty      "easy" | "medium" | "hard"
//   surface         "trail" | "mixed" | "gravel" | "road"
//   official_trail  true if the route has official markers
//   trail_name      name of the official trail, or null
//   trail_markers   description of markers, or null
//   good_to_know    practical tips shown on detail page
//   gpx_file        path e.g. "data/gpx/hike-001.gpx" or null
//   image           path e.g. "assets/hike-001.jpg" or null
//   shelters_nearby array of camp ids nearby on the route
//   parking_lat/lng coordinates of the start/parking point
//   parking_note    description of parking situation
//   lat/lng         map pin coordinates (start point)

const HIKES = [
  {
    id: "hike-001",
    name: "Hjortmarka Wilderness Trail",
    distance_km: 10.0,
    elevation_m: 187,
    difficulty: "medium",
    surface: "trail",
    official_trail: true,
    trail_name: "Vildmarksspåret",
    trail_markers: "Blue markings on trees and poles",
    description: "The most popular trail in Alingsås — and for good reason. Deep forests of oak, pine and birch, views over several forest lakes, and a genuine wilderness feeling despite being walkable from the city centre. The longest and wildest of the Hjortmarka trails.",
    good_to_know: "Boots strongly recommended — can be very wet and muddy. Dogs welcome on leash. Accessible by city bus line 1 to Ravinvägen, then 5-10 min walk to Hjortgården.",
    gpx_file: null,
    image: null,
    shelters_nearby: [],
    parking_lat: 57.9285,
    parking_lng: 12.6312,
    parking_note: "Parking at Hjortgården recreation area",
    lat: 57.9285,
    lng: 12.6312
  },
  {
    id: "hike-002",
    name: "Potatisleden",
    distance_km: 15.0,
    elevation_m: 96,
    difficulty: "medium",
    surface: "mixed",
    official_trail: true,
    trail_name: "Potatisleden",
    trail_markers: "Orange signs throughout",
    description: "The Potato Trail — a 15 km loop around Alingsås urban area passing through oak forests, villa areas, Stadsskogen park and deep forest. Close to the city the whole way but with a genuine nature feel. The stretch between Hjortgården and Ängabo through the oak forests is the highlight.",
    good_to_know: "Can be started and left at multiple points — great if you want a shorter section. Can get muddy with lots of roots. Some steep sections. Reachable by city bus.",
    gpx_file: null,
    image: null,
    shelters_nearby: [],
    parking_lat: 57.9285,
    parking_lng: 12.6312,
    parking_note: "Start at Hjortgården — parking available",
    lat: 57.9285,
    lng: 12.6312
  },
  {
    id: "hike-003",
    name: "Holleden",
    distance_km: 14.5,
    elevation_m: 373,
    difficulty: "medium",
    surface: "mixed",
    official_trail: true,
    trail_name: "Holleden",
    trail_markers: "Orange markers on trees and poles with position maps along route",
    description: "A cultural and historical trail that takes you through thousands of years of history — from Bronze and Iron Age burial fields to 19th century crofter farms. Starts and ends at Hol Church, passes through hilly forest, old farmland and crosses a former gravel railway line. Dahlbogården café is right at the finish.",
    good_to_know: "Start at Hols kyrka along the E20 between Alingsås and Vårgårda — bus stop right at the church with parking. One steep descent has a rope to hold onto. Gotaleden crosses the trail partway round — follow orange markers to stay on Holleden.",
    gpx_file: null,
    image: null,
    shelters_nearby: [],
    parking_lat: 58.0012,
    parking_lng: 12.7234,
    parking_note: "Free parking at Hols kyrka — bus stop also here",
    lat: 58.0012,
    lng: 12.7234
  },
  {
    id: "hike-004",
    name: "Gerdskastigen",
    distance_km: 4.7,
    elevation_m: 30,
    difficulty: "easy",
    surface: "mixed",
    official_trail: false,
    trail_name: null,
    trail_markers: null,
    description: "A flat loop around Lake Gerdsken, a stone's throw from Alingsås city centre. Passes Stampen's mill, Vimpeln shopping centre and several bathing spots. Perfect for an easy run, family walk or a quick after-work loop. Not marked — follow GPX or map.",
    good_to_know: "Accessible for prams, wheelchairs and bikes. Multiple bathing spots around the lake. Not officially marked so bring the GPX. Sweden's most densely populated lake — great birdwatching.",
    gpx_file: null,
    image: null,
    shelters_nearby: [],
    parking_lat: 57.9312,
    parking_lng: 12.6289,
    parking_note: "Park near Vimpeln shopping centre",
    lat: 57.9312,
    lng: 12.6289
  },
  {
    id: "hike-005",
    name: "Gotaleden — Stage 9",
    distance_km: 10.5,
    elevation_m: 120,
    difficulty: "easy",
    surface: "mixed",
    official_trail: true,
    trail_name: "Gotaleden",
    trail_markers: "Blue markers with walking symbol and text Gotaleden",
    description: "The final stage of the 71 km Gotaleden trail from Gothenburg — walking into Alingsås from Västra Bodarna. Passes through Bryngeskog forest, along the edge of Lake Mjörn to the small beach Playa Mjörn, through the unusual boardwalk forest Kongo, and into Nolhaga park before reaching the city centre. A beautiful finish to a great long-distance trail.",
    good_to_know: "Listed in New York Times 52 Places to Go 2020. Return to Gothenburg by train from Alingsås station (25 min). Nygrens Café in Alingsås is a great post-hike stop. All 9 stages accessible by public transport.",
    gpx_file: null,
    image: null,
    shelters_nearby: [],
    parking_lat: 57.9310,
    parking_lng: 12.5390,
    parking_note: "Start at Västra Bodarna — or take the train to Alingsås and walk it in reverse",
    lat: 57.9310,
    lng: 12.5390
  }
];


// ── BIKE ROUTES ──────────────────────────────────────────────
// Gravel and road cycling routes around Alingsås.
//
// Same fields as HIKES. Surface is especially relevant here:
//   "gravel"  gravel roads and forest tracks
//   "mixed"   combination of gravel, trail and asphalt
//   "road"    fully on asphalt — road or gravel bike on slicks

const BIKES = [
  {
    id: "bike-001",
    name: "Gerdsken Runt",
    distance_km: 8.0,
    elevation_m: 169,
    difficulty: "medium",
    surface: "mixed",
    official_trail: false,
    trail_name: null,
    trail_markers: null,
    description: "A fun varied loop around Lake Gerdsken starting from Tegelbruket north of Alingsås. Mixes gravel, asphalt roads through residential areas and forest paths. Passes bathing spots and Stampen's mill. Great introduction to riding around Alingsås.",
    good_to_know: "Mix of terrain — gravel bike or hardtail recommended. Not marked, follow GPX. Intermediate route with some technical sections.",
    gpx_file: null,
    image: null,
    shelters_nearby: [],
    parking_lat: 57.9390,
    parking_lng: 12.6280,
    parking_note: "Start at Tegelbruket, north of Alingsås centre",
    lat: 57.9390,
    lng: 12.6280
  },
  {
    id: "bike-002",
    name: "Mjörn Runt",
    distance_km: 59.0,
    elevation_m: 405,
    difficulty: "medium",
    surface: "road",
    official_trail: false,
    trail_name: null,
    trail_markers: null,
    description: "A classic 60 km road loop around Lake Mjörn starting from Alingsås — one of the best known cycling routes in the area. Fully on asphalt with rolling countryside, lake views and several small villages. Organised annually as a cycling event by Alingsås CK.",
    good_to_know: "Road bike or gravel bike on road tyres ideal. 100% asphalt. Allow 2.5 to 3.5 hours. Great route for building fitness — largely rolling with no extreme climbs.",
    gpx_file: "assets/Bike_GPX/bike-002.gpx",
    image: null,
    shelters_nearby: [],
    parking_lat: 57.9310,
    parking_lng: 12.5390,
    parking_note: "Start from Alingsås city centre — ample parking near the station",
    lat: 57.9310,
    lng: 12.5390
  }
];


// ── CAFES, BARS & RESTAURANTS ────────────────────────────────
// Places to eat and drink around Alingsås.
//
// Key fields:
//   type            "cafe" | "restaurant" | "bar"
//   price_range     1=$ 2=$$ 3=$$$
//   vibe            style of the place e.g. "Cozy cabin cafe"
//   outdoor_seating true if seating outside available
//   cash_only       true if card not accepted
//   swish_only      true if only Swish payments accepted
//   dog_friendly    true if dogs welcome inside or outside
//   vegetarian      true if vegetarian options available
//   vegan           true if vegan options available
//   menu_highlights array of up to 5 signature items
//   images          array of image paths (can be empty [])

const CAFES = [
  {
    id: "cafe-001",
    name: "Nygrens Café",
    type: "cafe",
    description: "One of Sweden's best cafés according to the White Guide — and a must on the Alingsås fika trail. Housed in a beautifully renovated 18th century warehouse with exposed brick walls, velvet sofas and crystal chandeliers. Everything baked from scratch using organic ingredients. The sunny courtyard is perfect in summer.",
    menu_highlights: [
      "Cardamom buns",
      "Princess cake",
      "Open sandwiches",
      "Organic filter coffee",
      "Seasonal lunch"
    ],
    images: [],
    price_range:     2,
    vibe:            "Cozy cabin cafe",
    outdoor_seating: true,
    cash_only:       false,
    swish_only:      false,
    dog_friendly:    true,
    vegetarian:      true,
    vegan:           false,
    lat: 57.9308,
    lng: 12.6331
  },
  {
    id: "cafe-002",
    name: "Nolbygårds Ekobageri & Kafé",
    type: "cafe",
    description: "A gem just outside Alingsås centre — an organic bakery and café on a historic farm with floral wallpaper, tiled stoves and a charming rail bus in the garden you can sit in. Everything baked from scratch with KRAV-certified organic ingredients. A favourite with locals and a great post-run stop near Nolbygård.",
    menu_highlights: [
      "Cardamom buns",
      "Sourdough bread",
      "Organic mazarins",
      "Seasonal lunch",
      "Semla (in season)"
    ],
    images: [],
    price_range:     1,
    vibe:            "Traditional Swedish fika",
    outdoor_seating: true,
    cash_only:       false,
    swish_only:      false,
    dog_friendly:    true,
    vegetarian:      true,
    vegan:           true,
    lat: 57.9198,
    lng: 12.6089
  }
];


// ── CAMPS & SHELTERS ─────────────────────────────────────────
// Overnight camping spots and day shelters around Alingsås.
//
// Key fields:
//   type            "shelter" | "campsite" | "fireplace"
//   facilities      array of: "fireplace" | "water_nearby"
//                   | "toilet" | "parking" | "swimming"
//   fee             0=free  1=$  2=$$  3=$$$
//   booking         "first_come" | "recommended" | "required"
//   dog_friendly    true if dogs welcome
//   car_accessible  true if reachable by car

const CAMPS = [
  {
    id: "camp-001",
    name: "Lövekulle Camping",
    type: "campsite",
    description: "The main campsite in Alingsås, beautifully situated right on the shore of Lake Mjörn — the largest lake in the area. Caravan, motorhome and tent pitches all available, most with lake views. Sandy beach and jumping tower 100m from the site. Also has cottages for rent. Open April to October.",
    facilities: ["fireplace", "toilet", "parking", "swimming"],
    fee:            2,
    booking:        "recommended",
    dog_friendly:   true,
    car_accessible: true,
    image: null,
    lat: 57.9178,
    lng: 12.5812
  },
  {
    id: "camp-002",
    name: "Hjortmarka Vindskydd",
    type: "shelter",
    description: "A simple lean-to windbreak shelter in the Hjortmarka recreation area, close to the start of both the Wilderness Trail and the Red Loop. A good spot to rest, eat lunch or wait out a rain shower. Used by trail runners and hikers year round.",
    facilities: ["water_nearby"],
    fee:            0,
    booking:        "first_come",
    dog_friendly:   true,
    car_accessible: false,
    image: null,
    lat: 57.9290,
    lng: 12.6318
  }
];


// ── FIRE SPOTS ───────────────────────────────────────────────
// Designated BBQ areas, fire pits and known fire spots.
// Separate from CAMPS which are overnight stays.
//
// Key fields:
//   type            "official_bbq" | "official_firepit"
//                   | "unofficial"
//   fire_status     "always_allowed" — designated spot, ok to use
//                   "check_local_rules" — verify before lighting
//                   "seasonal_ban_possible" — high risk in dry periods
//   seating         "benches_and_table" | "benches_only"
//                   | "logs" | "none"
//   firewood        "provided" | "buy_nearby" | "bring_own"
//   season          "year_round" | "summer_only" | "winter_only"
//   grill_mesh      true if an official BBQ grill mesh is installed
//   nearby_camps    array of camp ids near this spot
//   nearby_trails   array of hike/bike ids near this spot

const FIRESPOTS = [
  {
    id: "fire-001",
    name: "Nolhaga Park Grillplats",
    type: "official_bbq",
    description: "A municipal BBQ area inside the beautiful Nolhaga Castle Park, one of Alingsås most visited spots. Benches and tables nearby, surrounded by mature trees. A classic Alingsås evening — grill in the park, then walk along the lake. Right next to the children's farm and Nolhaga Castle.",
    fire_status:   "always_allowed",
    seating:       "benches_and_table",
    firewood:      "bring_own",
    season:        "year_round",
    grill_mesh:    true,
    water_nearby:  true,
    toilet_nearby: true,
    parking:       true,
    nearby_camps:  ["camp-001"],
    nearby_trails: ["hike-004"],
    image: null,
    lat: 57.9248,
    lng: 12.5978
  },
  {
    id: "fire-002",
    name: "Lövekulle Grillplats",
    type: "official_bbq",
    description: "A designated BBQ area right by the beach at Lövekulle, directly on Lake Mjörn. One of the most scenic fire spots in the area — grill as the sun goes down over the lake. Located next to the campsite café and toilet block.",
    fire_status:   "check_local_rules",
    seating:       "benches_and_table",
    firewood:      "bring_own",
    season:        "summer_only",
    grill_mesh:    true,
    water_nearby:  true,
    toilet_nearby: true,
    parking:       true,
    nearby_camps:  ["camp-001"],
    nearby_trails: ["bike-002"],
    image: null,
    lat: 57.9172,
    lng: 12.5808
  }
];