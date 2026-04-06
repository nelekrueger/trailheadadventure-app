// ============================================================
// data.js — ALL content for the Trailhead app lives here
//
// TO ADD A NEW HIKE: copy an existing entry in HIKES,
// paste it at the end of the array, change the values,
// make sure the id is unique (hike-004, hike-005 etc.)
//
// Same pattern for BIKES, CAFES, CAMPS.
// Never edit app.js for content changes.
// ============================================================


// ── HIKES & TRAIL RUNS ───────────────────────────────────────
// Fields:
//   id            unique string, e.g. "hike-001"
//   name          display name
//   distance_km   number
//   elevation_m   total elevation gain in metres
//   difficulty    "easy" | "medium" | "hard"
//   surface       "trail" | "mixed" | "gravel" | "road"
//   official_trail  true if it has official markers/name
//   trail_name    name of the official trail, or null
//   trail_markers description of markers, or null
//   description   short paragraph shown on card and detail page
//   good_to_know  practical tips shown on detail page
//   gpx_file      path to .gpx file, e.g. "data/gpx/hike-001.gpx", or null
//   image         path to cover image, e.g. "assets/hike-001.jpg", or null
//   shelters_nearby  array of camp ids visible as overlay on this route
//   lat / lng     coordinates for the map pin (start point)
//   parking_lat: coordinates for the parking latitude
//   parking_long coordinataes for the parking longitude
//   parking_note any info on the parking

const HIKES = [
    {
      id: "hike-001",
      name: "Nackareservatet Loop",
      distance_km: 12.4,
      elevation_m: 180,
      difficulty: "medium",
      surface: "trail",
      official_trail: true,
      trail_name: "Sörmlandsleden",
      trail_markers: "Orange blazes on trees",
      description: "Beautiful forested loop south of the city with great views over the water.",
      good_to_know: "Can be muddy after rain. Dogs allowed on leash.",
      gpx_file: null,
      image: null,
      shelters_nearby: ["camp-001"],
      lat: 59.295,
      lng: 18.140,
      parking_lat: 59.295,
      parking_lng: 18.140,
      parking_note: "Free parking at Nackareservatet entrance, 20 spaces"
    },
    {
      id: "hike-002",
      name: "Tyresta Ridge Run",
      distance_km: 18.0,
      elevation_m: 220,
      difficulty: "hard",
      surface: "trail",
      official_trail: false,
      trail_name: null,
      trail_markers: null,
      description: "Ancient forest with rocky ridges and hidden lakes. Unmarked — GPX essential.",
      good_to_know: "No markings — follow GPX closely. Start early. Bring extra water.",
      gpx_file: null,
      image: null,
      shelters_nearby: ["camp-003"],
      lat: 59.180,
      lng: 18.270,
      parking_lat: 59.295,
      parking_lng: 18.140,
      parking_note: "Free parking at Nackareservatet entrance, 20 spaces"
    },
    {
      id: "hike-003",
      name: "Drevviken Easy Walk",
      distance_km: 6.2,
      elevation_m: 40,
      difficulty: "easy",
      surface: "mixed",
      official_trail: true,
      trail_name: "Drevvikenleden",
      trail_markers: "Yellow signs at junctions",
      description: "Flat lakeside walk, great for families and beginners.",
      good_to_know: "Pram-friendly on most sections. Parking at Brandbergen.",
      gpx_file: null,
      image: null,
      shelters_nearby: ["camp-002"],
      lat: 59.260,
      lng: 18.110,
      parking_lat: 59.295,
      parking_lng: 18.140,
      parking_note: "Free parking at Nackareservatet entrance, 20 spaces"
    }
  ];
  
  
  // ── BIKE ROUTES ──────────────────────────────────────────────
  // Same fields as HIKES plus:
  //   surface   especially relevant for bikes: "gravel" | "mixed" | "road"
  
  const BIKES = [
    {
      id: "bike-001",
      name: "Haninge Gravel Loop",
      distance_km: 45,
      elevation_m: 390,
      difficulty: "medium",
      surface: "gravel",
      official_trail: false,
      trail_name: null,
      trail_markers: null,
      description: "Mixed surface gravel route through farmland and forest edges.",
      good_to_know: "Gravel bike recommended. One steep climb at km 28. Some loose gravel.",
      gpx_file: null,
      image: null,
      shelters_nearby: ["camp-002"],
      lat: 59.170,
      lng: 18.150,
      parking_lat: 59.295,
      parking_lng: 18.140,
      parking_note: "Free parking at Nackareservatet entrance, 20 spaces"
    },
    {
      id: "bike-002",
      name: "Sörmland Gravel Classic",
      distance_km: 78,
      elevation_m: 620,
      difficulty: "hard",
      surface: "mixed",
      official_trail: true,
      trail_name: "Sörmland Trail",
      trail_markers: "Green signs at key junctions",
      description: "A full day epic through classic Sörmland landscape. Worth every climb.",
      good_to_know: "Bring food — no cafes after km 20. Weather changes fast out here.",
      gpx_file: null,
      image: null,
      shelters_nearby: ["camp-001", "camp-003"],
      lat: 59.050,
      lng: 17.950,
      parking_lat: 59.295,
      parking_lng: 18.140,
      parking_note: "Free parking at Nackareservatet entrance, 20 spaces"
    }
  ];
  
  
  // ── CAFES, BARS & RESTAURANTS ────────────────────────────────
  // Fields:
  //   id              unique string, e.g. "cafe-001"
  //   name            display name
  //   type            "cafe" | "restaurant" | "bar"
  //   description     short paragraph
  //   menu_highlights array of up to 5 dish/drink names
  //   images          array of image paths (can be empty [])
  //   lat / lng       coordinates for map pin
  
  const CAFES = [
    {
      id: "cafe-001",
      name: "Kafé Björken",
      type: "cafe",
      description: "Cozy woodland cafe with great cardamom buns and proper filter coffee.",
      menu_highlights: ["Cardamom buns", "Filter coffee", "Soup of the day"],
      images: [],
      lat: 59.320,
      lng: 18.050
    },
    {
      id: "cafe-002",
      name: "Trailside Espresso",
      type: "cafe",
      description: "Tiny espresso bar popular with runners and cyclists. Cash only.",
      menu_highlights: ["Espresso", "Banana bread", "Energy balls"],
      images: [],
      lat: 59.340,
      lng: 18.090
    },
    {
      id: "cafe-003",
      name: "Skogen Mat & Bar",
      type: "restaurant",
      description: "Rustic restaurant with a locally sourced seasonal menu.",
      menu_highlights: ["Wild mushroom pasta", "Elk burger", "Local craft beer"],
      images: [],
      lat: 59.310,
      lng: 18.120
    }
  ];
  
  
  // ── CAMPS, SHELTERS & FIRE SPOTS ─────────────────────────────
  // Fields:
  //   id          unique string, e.g. "camp-001"
  //   name        display name
  //   type        "shelter" | "campsite" | "fireplace"
  //   description short paragraph
  //   facilities  array of: "fireplace" | "water_nearby" | "toilet"
  //               | "parking" | "swimming"
  //   image       path to image, or null
  //   lat / lng   coordinates for map pin
  
  const CAMPS = [
    {
      id: "camp-001",
      name: "Fiskartorpet Shelter",
      type: "shelter",
      description: "Open lean-to shelter with fireplace. Fits about 6 people sleeping.",
      facilities: ["fireplace", "water_nearby", "toilet"],
      image: null,
      lat: 59.370,
      lng: 18.020
    },
    {
      id: "camp-002",
      name: "Drevviken Campsite",
      type: "campsite",
      description: "Car-accessible campsite with fire rings and a great spot for lake swimming.",
      facilities: ["fireplace", "toilet", "parking", "swimming"],
      image: null,
      lat: 59.260,
      lng: 18.100
    },
    {
      id: "camp-003",
      name: "Tyresta Fire Spot",
      type: "fireplace",
      description: "Designated fire spot inside the national park. Firewood sometimes provided.",
      facilities: ["fireplace", "water_nearby"],
      image: null,
      lat: 59.185,
      lng: 18.265
    }
  ];