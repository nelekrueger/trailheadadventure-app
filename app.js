// ============================================================
// app.js — all UI logic for the Paws & Trails app
//
// This file never contains content or data.
// All data lives in data.js — edit only that file for content.
//
// Architecture:
//   - One build function per page, detected at the bottom
//   - Shared helpers at the top (sanitize, badges, maps)
//   - All maps use OpenFreeMap via L.maplibreGL (free, no key)
//   - All external data passed through sanitize() before DOM
// ============================================================


// ── SECURITY: XSS SANITIZER ──────────────────────────────────
// Always pass untrusted strings through sanitize() before
// inserting into innerHTML. Converts < > & " to safe entities,
// preventing any injected HTML or script execution.

function sanitize(str) {
  const div = document.createElement('div');
  div.textContent = String(str ?? '');
  return div.innerHTML;
}


// ── TILE LAYER FACTORY ────────────────────────────────────────
// Single function that creates an OpenFreeMap tile layer.
// All maps in the app must use this — never inline tile URLs.
// OpenFreeMap: free forever, no API key, no commercial restrictions.
// MIT licence. https://openfreemap.org

function makeMapLayer() {
  return L.maplibreGL({
    style: 'https://tiles.openfreemap.org/styles/liberty',
    attribution: 'OpenFreeMap © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });
}


// ── DISPLAY LABELS ───────────────────────────────────────────
// Human-readable labels used across cards and detail pages.
// Edit here to change how values appear on screen.

const DIFFICULTY_LABEL = {
  easy:   'Easy',
  medium: 'Medium',
  hard:   'Hard'
};

const DIFFICULTY_BADGE_CLASS = {
  easy:   'badge-easy',
  medium: 'badge-medium',
  hard:   'badge-hard'
};

const FACILITY_LABELS = {
  fireplace:    'Fire',
  water_nearby: 'Water',
  toilet:       'Toilet',
  parking:      'Parking',
  swimming:     'Swimming'
};

const FACILITY_ICON_CLASS = {
  fireplace:    'ph-fire',
  water_nearby: 'ph-drop',
  toilet:       'ph-toilet-paper',
  parking:      'ph-parking-sign',
  swimming:     'ph-waves'
};


// ── BADGE HELPERS ─────────────────────────────────────────────
// Return ready-to-insert HTML strings for common badges.
// Used on both list cards and detail pages.

// Coloured difficulty pill — Easy / Medium / Hard
function difficultyBadge(difficulty) {
  const label = DIFFICULTY_LABEL[difficulty] || difficulty;
  const cls   = DIFFICULTY_BADGE_CLASS[difficulty] || 'badge-type';
  return `<span class="badge ${cls}">${sanitize(label)}</span>`;
}

// Official trail badge or GPX-only badge
function officialBadge(item) {
  if (item.official_trail) {
    const name = item.trail_name || 'Official trail';
    return `<span class="badge badge-official">
      <i class="ph-light ph-check-circle"></i> ${sanitize(name)}
    </span>`;
  }
  return `<span class="badge badge-gpx">GPX route</span>`;
}

// One styled pill per facility with icon and label
function facilityBadges(facilities) {
  return (facilities || []).map(f => {
    const label     = FACILITY_LABELS[f]    || f;
    const iconClass = FACILITY_ICON_CLASS[f] || 'ph-tag';
    return `<span class="badge badge-facility">
      <i class="ph-light ${iconClass}"></i> ${sanitize(label)}
    </span>`;
  }).join('');
}


// ── PRICE DISPLAY ─────────────────────────────────────────────
// Renders $ / $$ / $$$ with active symbols dark, rest faded.
// $ is a price-level convention, not a currency symbol.

function priceDisplay(level) {
  const safeLevel = Math.min(Math.max(parseInt(level) || 1, 1), 3);
  const active    = '$'.repeat(safeLevel);
  const faded     = '$'.repeat(3 - safeLevel);
  return `<span class="price-range">
    <span class="active">${active}</span><span class="inactive">${faded}</span>
  </span>`;
}


// ── CAMP FEE DISPLAY ──────────────────────────────────────────
// 0 = free badge, 1–3 = $ price level badge.

function campFeeDisplay(fee) {
  if (!fee || fee === 0) {
    return `<span class="badge badge-free">
      <i class="ph-light ph-check"></i> Free
    </span>`;
  }
  const safeLevel = Math.min(Math.max(parseInt(fee), 1), 3);
  const active    = '$'.repeat(safeLevel);
  const faded     = '$'.repeat(3 - safeLevel);
  return `<span class="badge badge-fee">
    <span style="font-weight:700">${active}</span><span style="opacity:0.3">${faded}</span>
  </span>`;
}


// ── CAMP BOOKING DISPLAY ──────────────────────────────────────
// Returns a badge for the three booking states.

function campBookingDisplay(booking) {
  const map = {
    first_come:  `<span class="badge badge-first-come"><i class="ph-light ph-clock"></i> First come first served</span>`,
    required:    `<span class="badge badge-booking"><i class="ph-light ph-calendar-check"></i> Booking required</span>`,
    recommended: `<span class="badge badge-recommended"><i class="ph-light ph-calendar"></i> Booking recommended</span>`
  };
  return map[booking] || '';
}


// ── CAMP TAGS ─────────────────────────────────────────────────
// Returns dog friendly and car accessible feature badges.

function campTags(item) {
  return [
    item.dog_friendly   ? `<span class="badge badge-dog"><i class="ph-light ph-paw-print"></i> Dogs welcome</span>`  : '',
    item.car_accessible ? `<span class="badge badge-car"><i class="ph-light ph-car"></i> Car accessible</span>`      : ''
  ].filter(Boolean).join('');
}


// ── CAFE INFO GRID ────────────────────────────────────────────
// Builds the info grid and feature tags for a cafe detail page.
// Kept separate so buildCafeDetailPage() stays readable.

function buildCafeInfoHTML(item) {
  const paymentTags = [
    item.cash_only  ? `<span class="tag tag-payment"><i class="ph-light ph-money"></i> Cash only</span>`          : '',
    item.swish_only ? `<span class="tag tag-payment"><i class="ph-light ph-device-mobile"></i> Swish only</span>` : ''
  ].filter(Boolean).join('');

  const featureTags = [
    item.dog_friendly    ? `<span class="tag tag-yes"><i class="ph-light ph-paw-print"></i> Dogs welcome</span>`  : '',
    item.outdoor_seating ? `<span class="tag tag-yes"><i class="ph-light ph-park"></i> Outdoor seating</span>`    : '',
    item.vegetarian      ? `<span class="tag tag-yes"><i class="ph-light ph-leaf"></i> Vegetarian</span>`         : '',
    item.vegan           ? `<span class="tag tag-yes"><i class="ph-light ph-leaf"></i> Vegan</span>`              : ''
  ].filter(Boolean).join('');

  return `
    <div class="info-grid">
      <div class="info-card">
        <span class="info-card-label"><i class="ph-light ph-receipt"></i> Price</span>
        <span class="info-card-value">${priceDisplay(item.price_range)}</span>
      </div>
      ${item.vibe ? `
      <div class="info-card">
        <span class="info-card-label">Vibe</span>
        <span class="info-card-value">${sanitize(item.vibe)}</span>
      </div>` : ''}
    </div>

    ${featureTags ? `
    <div class="detail-section">
      <h3>Good to know</h3>
      <div class="tag-row">${featureTags}</div>
    </div>` : ''}

    ${paymentTags ? `
    <div class="detail-section">
      <h3><i class="ph-light ph-credit-card"></i> Payment</h3>
      <div class="tag-row">${paymentTags}</div>
    </div>` : ''}
  `;
}


// ── CUSTOM MAP ICONS ──────────────────────────────────────────
// Creates a teardrop-shaped Leaflet divIcon with a Phosphor
// icon inside. No image files needed.
// color should be a CSS colour string e.g. '#5c7a4e'

function makeIcon(iconClass, color) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        background:${color};
        width:36px; height:36px;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:2px solid white;
        box-shadow:0 2px 6px rgba(0,0,0,0.3);
        display:flex; align-items:center; justify-content:center;
      ">
        <i class="ph-light ${iconClass}" style="
          transform:rotate(45deg);
          font-size:16px;
          color:white;
          line-height:1;
        "></i>
      </div>`,
    iconSize:    [36, 36],
    iconAnchor:  [18, 36],
    popupAnchor: [0, -38]
  });
}

// One icon per category — reused on every map in the app
const ICONS = {
  hikes:     makeIcon('ph-sneaker',    '#5c7a4e'),
  bikes:     makeIcon('ph-bicycle',    '#4a7a8a'),
  cafes:     makeIcon('ph-fork-knife', '#a07840'),
  camps:     makeIcon('ph-tent',       '#7a5c3a'),
  firespots: makeIcon('ph-flame',      '#b84a20')
};

// Parking pin — blue P marker, shared by all route detail pages
const PARKING_ICON = L.divIcon({
  className: '',
  html: `
    <div style="
      background:#5a7a9a;
      width:32px; height:32px;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
      display:flex; align-items:center; justify-content:center;
    ">
      <span style="
        transform:rotate(45deg);
        font-size:13px;
        color:white;
        font-weight:700;
      ">P</span>
    </div>`,
  iconSize:    [32, 32],
  iconAnchor:  [16, 32],
  popupAnchor: [0, -34]
});


// ── SHARED: BUILD OVERVIEW MAP ────────────────────────────────
// Used by all five sub-pages (hikes, bikes, cafes, camps, firespots).
// Drops a marker for each item, fits the map to bounds,
// and wires up pin click → scroll + highlight matching card.
//
// Parameters:
//   mapId     id of the <div> to render into
//   items     array from data.js
//   category  "hikes" | "bikes" | "cafes" | "camps" | "firespots"
//   metaFn    function(item) → short string for popup subtitle

function buildOverviewMap(mapId, items, category, metaFn) {
  const el = document.getElementById(mapId);
  if (!el) return;

  const map = L.map(mapId);
  makeMapLayer().addTo(map);

  items.forEach(item => {
    const marker = L.marker([item.lat, item.lng], { icon: ICONS[category] });

    marker.bindPopup(`
      <div class="popup-title">${sanitize(item.name)}</div>
      <div class="popup-meta">${sanitize(metaFn(item))}</div>
    `);

    marker.addTo(map);

    // Clicking a pin scrolls to and highlights the matching card
    marker.on('click', () => {
      const card = document.getElementById('card-' + item.id);
      if (!card) return;

      document.querySelectorAll('.highlighted')
        .forEach(c => c.classList.remove('highlighted'));

      card.classList.add('highlighted');
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });

      setTimeout(() => card.classList.remove('highlighted'), 2500);
    });
  });

  // Zoom to fit all markers — fall back to Alingsås centre if empty
  if (items.length > 0) {
    const bounds = L.latLngBounds(items.map(i => [i.lat, i.lng]));
    map.fitBounds(bounds, { padding: [30, 30] });
  } else {
    map.setView([57.930, 12.620], 12);
  }
}


// ── SHARED: FILTER BAR ────────────────────────────────────────
// Wires up single-select filter pill buttons on any list page.
// Clicking marks it active and calls renderFn with the value.
//
// Parameters:
//   renderFn   function(filterValue) that re-renders the cards

function setupFilters(renderFn) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderFn(btn.dataset.filter);
    });
  });
}


// ════════════════════════════════════════════════════════════
// PAGE: HOME (index.html)
// ════════════════════════════════════════════════════════════
// Builds the main map with all five category layers,
// toggle filter buttons, and category card counts.

function buildHomePage() {
  const mapEl = document.getElementById('map');
  if (!mapEl) return;

  // Fill in entry counts on the category cards
  document.getElementById('count-hikes').textContent     = `${HIKES.length} routes`;
  document.getElementById('count-bikes').textContent     = `${BIKES.length} routes`;
  document.getElementById('count-cafes').textContent     = `${CAFES.length} places`;
  document.getElementById('count-camps').textContent     = `${CAMPS.length} spots`;
  document.getElementById('count-firespots').textContent = `${FIRESPOTS.length} spots`;

  const map = L.map('map', { center: [57.930, 12.620], zoom: 12 });
  makeMapLayer().addTo(map);

  // Each category gets its own layer group for independent toggling
  const layers = {
    hikes:     L.layerGroup().addTo(map),
    bikes:     L.layerGroup().addTo(map),
    cafes:     L.layerGroup().addTo(map),
    camps:     L.layerGroup().addTo(map),
    firespots: L.layerGroup().addTo(map)
  };

  function addMarkersToLayer(dataArray, category, detailPage, metaFn) {
    dataArray.forEach(item => {
      const marker = L.marker([item.lat, item.lng], { icon: ICONS[category] });
      marker.bindPopup(`
        <div class="popup-title">${sanitize(item.name)}</div>
        <div class="popup-meta">${sanitize(metaFn(item))}</div>
        <a class="popup-link"
           href="${sanitize(detailPage)}?id=${sanitize(item.id)}">
          View details →
        </a>
      `);
      marker.addTo(layers[category]);
    });
  }

  addMarkersToLayer(HIKES,     'hikes',     'hike-detail.html',     h => `${h.distance_km} km · ${DIFFICULTY_LABEL[h.difficulty]}`);
  addMarkersToLayer(BIKES,     'bikes',     'bike-detail.html',     b => `${b.distance_km} km · ${DIFFICULTY_LABEL[b.difficulty]}`);
  addMarkersToLayer(CAFES,     'cafes',     'cafe-detail.html',     c => c.type);
  addMarkersToLayer(CAMPS,     'camps',     'camp-detail.html',     c => c.type);
  addMarkersToLayer(FIRESPOTS, 'firespots', 'firespot-detail.html', f => f.type.replace(/_/g, ' '));

  // Toggle buttons show/hide each category layer independently
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.category;
      btn.classList.toggle('active');
      if (btn.classList.contains('active')) {
        map.addLayer(layers[cat]);
      } else {
        map.removeLayer(layers[cat]);
      }
    });
  });
}


// ════════════════════════════════════════════════════════════
// PAGE: HIKES LIST (hikes.html)
// ════════════════════════════════════════════════════════════
// Two independent filters:
//   difficulty — single select (all / easy / medium / hard)
//   distance   — multi select brackets (any combination)
// A route must pass BOTH active filters to appear.

function buildHikesPage() {
  const mapEl = document.getElementById('hikes-map');
  if (!mapEl) return;

  document.getElementById('page-count').textContent = `${HIKES.length} routes`;

  buildOverviewMap('hikes-map', HIKES, 'hikes',
    h => `${h.distance_km} km · ${h.elevation_m}m · ${DIFFICULTY_LABEL[h.difficulty]}`
  );

  let activeDifficulty = 'all';
  let activeBrackets   = []; // array of { min, max } objects

  function renderCards() {
    const list     = document.getElementById('items-list');
    const filtered = HIKES.filter(h => {
      const diffOk = activeDifficulty === 'all' || h.difficulty === activeDifficulty;
      const distOk = activeBrackets.length === 0
        || activeBrackets.some(b => h.distance_km >= b.min && h.distance_km < b.max);
      return diffOk && distOk;
    });

    if (filtered.length === 0) {
      list.innerHTML = '<p class="no-results">No routes match these filters.</p>';
      return;
    }

    list.innerHTML = filtered.map(h => `
      <a class="route-card"
         id="card-${sanitize(h.id)}"
         href="hike-detail.html?id=${sanitize(h.id)}">
        <div class="route-card-image">
          ${h.image
            ? `<img src="${sanitize(h.image)}" alt="${sanitize(h.name)}">`
            : '<i class="ph-light ph-sneaker" style="font-size:1.8rem;color:var(--muted)"></i>'}
        </div>
        <div class="route-card-body">
          <div class="route-card-title">${sanitize(h.name)}</div>
          <div class="route-card-stats">
            <span class="stat"><i class="ph-light ph-ruler"></i> ${sanitize(String(h.distance_km))} km</span>
            <span class="stat"><i class="ph-light ph-trend-up"></i> ${sanitize(String(h.elevation_m))} m</span>
            <span class="stat"><i class="ph-light ph-path"></i> ${sanitize(h.surface)}</span>
          </div>
          <div class="route-card-badges">
            ${difficultyBadge(h.difficulty)}
            ${officialBadge(h)}
          </div>
          <div class="route-card-desc">${sanitize(h.description)}</div>
        </div>
      </a>
    `).join('');
  }

  // Difficulty — single select
  document.querySelectorAll('.filter-btn:not(.bracket)').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn:not(.bracket)')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeDifficulty = btn.dataset.filter;
      renderCards();
    });
  });

  // Distance brackets — multi select toggle
  document.querySelectorAll('.filter-btn.bracket').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      activeBrackets = Array.from(
        document.querySelectorAll('.filter-btn.bracket.active')
      ).map(b => ({
        min: parseFloat(b.dataset.min),
        max: parseFloat(b.dataset.max)
      }));
      renderCards();
    });
  });

  renderCards();
}


// ════════════════════════════════════════════════════════════
// PAGE: BIKES LIST (bikes.html)
// ════════════════════════════════════════════════════════════
// Same two-filter pattern as hikes —
// difficulty (single select) + distance brackets (multi select)

function buildBikesPage() {
  const mapEl = document.getElementById('bikes-map');
  if (!mapEl) return;

  document.getElementById('page-count').textContent = `${BIKES.length} routes`;

  buildOverviewMap('bikes-map', BIKES, 'bikes',
    b => `${b.distance_km} km · ${b.elevation_m}m · ${DIFFICULTY_LABEL[b.difficulty]}`
  );

  let activeDifficulty = 'all';
  let activeBrackets   = [];

  function renderCards() {
    const list     = document.getElementById('items-list');
    const filtered = BIKES.filter(b => {
      const diffOk = activeDifficulty === 'all' || b.difficulty === activeDifficulty;
      const distOk = activeBrackets.length === 0
        || activeBrackets.some(br => b.distance_km >= br.min && b.distance_km < br.max);
      return diffOk && distOk;
    });

    if (filtered.length === 0) {
      list.innerHTML = '<p class="no-results">No routes match these filters.</p>';
      return;
    }

    list.innerHTML = filtered.map(b => `
      <a class="route-card"
         id="card-${sanitize(b.id)}"
         href="bike-detail.html?id=${sanitize(b.id)}">
        <div class="route-card-image">
          ${b.image
            ? `<img src="${sanitize(b.image)}" alt="${sanitize(b.name)}">`
            : '<i class="ph-light ph-bicycle" style="font-size:1.8rem;color:var(--muted)"></i>'}
        </div>
        <div class="route-card-body">
          <div class="route-card-title">${sanitize(b.name)}</div>
          <div class="route-card-stats">
            <span class="stat"><i class="ph-light ph-ruler"></i> ${sanitize(String(b.distance_km))} km</span>
            <span class="stat"><i class="ph-light ph-trend-up"></i> ${sanitize(String(b.elevation_m))} m</span>
            <span class="stat"><i class="ph-light ph-path"></i> ${sanitize(b.surface)}</span>
          </div>
          <div class="route-card-badges">
            ${difficultyBadge(b.difficulty)}
            ${officialBadge(b)}
          </div>
          <div class="route-card-desc">${sanitize(b.description)}</div>
        </div>
      </a>
    `).join('');
  }

  // Difficulty — single select
  document.querySelectorAll('.filter-btn:not(.bracket)').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn:not(.bracket)')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeDifficulty = btn.dataset.filter;
      renderCards();
    });
  });

  // Distance brackets — multi select
  document.querySelectorAll('.filter-btn.bracket').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      activeBrackets = Array.from(
        document.querySelectorAll('.filter-btn.bracket.active')
      ).map(b => ({
        min: parseFloat(b.dataset.min),
        max: parseFloat(b.dataset.max)
      }));
      renderCards();
    });
  });

  renderCards();
}


// ════════════════════════════════════════════════════════════
// PAGE: CAFES LIST (cafes.html)
// ════════════════════════════════════════════════════════════
// Single filter: type — cafe / restaurant / bar

function buildCafesPage() {
  const mapEl = document.getElementById('cafes-map');
  if (!mapEl) return;

  document.getElementById('page-count').textContent = `${CAFES.length} places`;

  buildOverviewMap('cafes-map', CAFES, 'cafes', c => c.type);

  function renderCards(filter) {
    const list     = document.getElementById('items-list');
    const filtered = filter === 'all'
      ? CAFES
      : CAFES.filter(c => c.type === filter);

    if (filtered.length === 0) {
      list.innerHTML = '<p class="no-results">No places match this filter.</p>';
      return;
    }

    list.innerHTML = filtered.map(c => `
      <a class="place-card"
         id="card-${sanitize(c.id)}"
         href="cafe-detail.html?id=${sanitize(c.id)}">
        <div class="place-card-image">
          ${c.images && c.images[0]
            ? `<img src="${sanitize(c.images[0])}" alt="${sanitize(c.name)}">`
            : '<i class="ph-light ph-fork-knife" style="font-size:1.8rem;color:var(--muted)"></i>'}
        </div>
        <div class="place-card-body">
          <div class="place-card-title">${sanitize(c.name)}</div>
          <div class="route-card-badges">
            <span class="badge badge-type">${sanitize(c.type)}</span>
          </div>
          <div class="place-card-desc">${sanitize(c.description)}</div>
          <div class="place-card-meta">
            ${(c.menu_highlights || []).slice(0, 3)
              .map(m => `<span class="badge badge-type">
                <i class="ph-light ph-fork-knife"></i> ${sanitize(m)}
              </span>`)
              .join('')}
          </div>
        </div>
      </a>
    `).join('');
  }

  renderCards('all');
  setupFilters(renderCards);
}


// ════════════════════════════════════════════════════════════
// PAGE: CAMPS LIST (camps.html)
// ════════════════════════════════════════════════════════════
// Single filter: type — shelter / campsite / fireplace

function buildCampsPage() {
  const mapEl = document.getElementById('camps-map');
  if (!mapEl) return;

  document.getElementById('page-count').textContent = `${CAMPS.length} spots`;

  buildOverviewMap('camps-map', CAMPS, 'camps', c => c.type);

  function renderCards(filter) {
    const list     = document.getElementById('items-list');
    const filtered = filter === 'all'
      ? CAMPS
      : CAMPS.filter(c => c.type === filter);

    if (filtered.length === 0) {
      list.innerHTML = '<p class="no-results">No spots match this filter.</p>';
      return;
    }

    list.innerHTML = filtered.map(c => `
      <a class="camp-card"
         id="card-${sanitize(c.id)}"
         href="camp-detail.html?id=${sanitize(c.id)}">
        <div class="camp-card-image">
          ${c.image
            ? `<img src="${sanitize(c.image)}" alt="${sanitize(c.name)}">`
            : '<i class="ph-light ph-tent" style="font-size:1.8rem;color:var(--muted)"></i>'}
        </div>
        <div class="camp-card-body">
          <div class="camp-card-title">${sanitize(c.name)}</div>
          <div class="route-card-badges">
            <span class="badge badge-type">${sanitize(c.type)}</span>
            ${campFeeDisplay(c.fee)}
            ${campBookingDisplay(c.booking)}
          </div>
          <div class="camp-card-desc">${sanitize(c.description)}</div>
          <div class="camp-card-facilities">
            ${campTags(c)}
            ${facilityBadges(c.facilities)}
          </div>
        </div>
      </a>
    `).join('');
  }

  renderCards('all');
  setupFilters(renderCards);
}


// ════════════════════════════════════════════════════════════
// PAGE: FIRE SPOTS LIST (firespots.html)
// ════════════════════════════════════════════════════════════
// Two filters:
//   type     — single select (all / official_bbq / official_firepit / unofficial)
//   features — multi select (seating / firewood provided / year round)
// A spot must pass BOTH to appear.

function buildFirespotsPage() {
  const mapEl = document.getElementById('firespots-map');
  if (!mapEl) return;

  document.getElementById('page-count').textContent = `${FIRESPOTS.length} spots`;

  buildOverviewMap('firespots-map', FIRESPOTS, 'firespots',
    f => f.type.replace(/_/g, ' ')
  );

  const TYPE_LABELS = {
    official_bbq:     'Official BBQ',
    official_firepit: 'Official fire pit',
    unofficial:       'Unofficial spot'
  };

  const SEATING_LABELS = {
    benches_and_table: 'Table & benches',
    benches_only:      'Benches',
    logs:              'Logs',
    none:              'No seating'
  };

  const TYPE_BADGE = {
    official_bbq:     'badge-official-bbq',
    official_firepit: 'badge-official-firepit',
    unofficial:       'badge-unofficial'
  };

  let activeType     = 'all';
  let activeFeatures = [];

  function renderCards() {
    const list     = document.getElementById('items-list');
    const filtered = FIRESPOTS.filter(f => {
      const typeOk = activeType === 'all' || f.type === activeType;
      const featOk = activeFeatures.every(feat => {
        if (feat === 'seating')    return f.seating !== 'none';
        if (feat === 'firewood')   return f.firewood === 'provided';
        if (feat === 'year_round') return f.season === 'year_round';
        return true;
      });
      return typeOk && featOk;
    });

    if (filtered.length === 0) {
      list.innerHTML = '<p class="no-results">No fire spots match these filters.</p>';
      return;
    }

    list.innerHTML = filtered.map(f => `
      <a class="firespot-card"
         id="card-${sanitize(f.id)}"
         href="firespot-detail.html?id=${sanitize(f.id)}">
        <div class="firespot-card-image">
          ${f.image
            ? `<img src="${sanitize(f.image)}" alt="${sanitize(f.name)}">`
            : '<i class="ph-light ph-flame" style="font-size:1.8rem"></i>'}
        </div>
        <div class="firespot-card-body">
          <div class="firespot-card-title">${sanitize(f.name)}</div>
          <div class="firespot-card-tags">
            <span class="badge ${TYPE_BADGE[f.type] || 'badge-type'}">
              ${sanitize(TYPE_LABELS[f.type] || f.type)}
            </span>
            ${f.seating !== 'none' ? `
            <span class="badge badge-facility">
              <i class="ph-light ph-park"></i>
              ${sanitize(SEATING_LABELS[f.seating] || f.seating)}
            </span>` : ''}
            ${f.firewood === 'provided' ? `
            <span class="badge badge-facility">
              <i class="ph-light ph-tree"></i> Wood provided
            </span>` : ''}
          </div>
          <div class="firespot-card-desc">${sanitize(f.description)}</div>
        </div>
      </a>
    `).join('');
  }

  // Type — single select
  document.querySelectorAll('.filter-btn:not(.bracket)').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn:not(.bracket)')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeType = btn.dataset.filter;
      renderCards();
    });
  });

  // Features — multi select
  document.querySelectorAll('.filter-btn.bracket').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      activeFeatures = Array.from(
        document.querySelectorAll('.filter-btn.bracket.active')
      ).map(b => b.dataset.feature);
      renderCards();
    });
  });

  renderCards();
}


// ════════════════════════════════════════════════════════════
// PAGE: ROUTE DETAIL — hike-detail.html / bike-detail.html
// ════════════════════════════════════════════════════════════
// Reads ?id= from URL, finds item in dataset,
// renders full detail view with map, elevation chart, parking.
//
// Parameters:
//   dataset    HIKES or BIKES from data.js
//   backUrl    list page to return to e.g. "hikes.html"
//   category   "hikes" or "bikes"

function buildRouteDetailPage(dataset, backUrl, category) {
  const mainEl = document.getElementById('detail-main');
  if (!mainEl) return;

  const params  = new URLSearchParams(window.location.search);
  const id      = params.get('id');
  const backBtn = document.querySelector('.back-btn');
  if (backBtn) backBtn.href = backUrl;

  const item = dataset.find(i => i.id === id);

  if (!item) {
    document.getElementById('detail-title').textContent = 'Not found';
    mainEl.innerHTML = `
      <div class="not-found">
        <h2>Route not found</h2>
        <p>This route doesn't exist or the link is broken.</p>
        <p><a href="${sanitize(backUrl)}">← Go back</a></p>
      </div>`;
    return;
  }

  document.getElementById('detail-title').textContent = item.name;
  document.title = `${item.name} — Paws & Trails`;

  const nearbyCamps = (item.shelters_nearby || [])
    .map(campId => CAMPS.find(c => c.id === campId))
    .filter(Boolean);

  const coverIcon = category === 'hikes'
    ? 'ph-sneaker'
    : 'ph-bicycle';

  mainEl.innerHTML = `

    <div class="detail-cover">
      ${item.image
        ? `<img src="${sanitize(item.image)}" alt="${sanitize(item.name)}">`
        : `<i class="ph-light ${coverIcon}" style="font-size:3rem;color:var(--muted)"></i>`}
    </div>

    <div class="detail-header">
      <div class="detail-title">${sanitize(item.name)}</div>
      <div class="detail-badges">
        ${difficultyBadge(item.difficulty)}
        ${officialBadge(item)}
        <span class="badge badge-type">
          <i class="ph-light ph-path"></i> ${sanitize(item.surface)}
        </span>
      </div>
    </div>

    <div class="detail-stats">
      <div class="detail-stat">
        <span class="detail-stat-value">${sanitize(String(item.distance_km))}</span>
        <span class="detail-stat-label">km</span>
      </div>
      <div class="detail-stat">
        <span class="detail-stat-value">${sanitize(String(item.elevation_m))}</span>
        <span class="detail-stat-label">m gain</span>
      </div>
      <div class="detail-stat">
        <span class="detail-stat-value">
          ${sanitize(DIFFICULTY_LABEL[item.difficulty] || item.difficulty)}
        </span>
        <span class="detail-stat-label">difficulty</span>
      </div>
    </div>

    <!-- Map — GPX route drawn here if gpx_file is set -->
    <div id="detail-map" class="detail-map"></div>

    <!-- Elevation profile — populated by drawElevationChart() if GPX loads -->
    <div class="elevation-section">
      <h3>Elevation profile</h3>
      <canvas id="elevation-canvas" class="elevation-chart"></canvas>
      <p id="elevation-placeholder"
         style="font-size:0.8rem;color:#aaa;text-align:center;padding:0.5rem 0">
        Add a GPX file to see the elevation profile
      </p>
    </div>

    <div class="detail-section">
      <h3>About this route</h3>
      <p>${sanitize(item.description)}</p>
    </div>

    ${item.good_to_know ? `
    <div class="detail-section">
      <h3>Good to know</h3>
      <p>${sanitize(item.good_to_know)}</p>
    </div>` : ''}

    ${item.official_trail && item.trail_markers ? `
    <div class="detail-section">
      <h3>Trail markers</h3>
      <p>${sanitize(item.trail_markers)}</p>
    </div>` : ''}

    ${item.parking_lat ? `
    <div class="detail-section">
      <h3><i class="ph-light ph-car"></i> Parking & start point</h3>
      <p>${sanitize(item.parking_note || 'Parking available at start point')}</p>
      <a class="maps-link"
         href="https://maps.google.com/?q=${encodeURIComponent(item.parking_lat + ',' + item.parking_lng)}"
         target="_blank"
         rel="noopener noreferrer"
         style="margin-top:0.65rem">
        <i class="ph-light ph-navigation-arrow"></i> Get directions to start
      </a>
    </div>` : ''}

    ${item.gpx_file
      ? `<a class="gpx-download" href="${sanitize(item.gpx_file)}" download>
           <i class="ph-light ph-download-simple"></i> Download GPX file
         </a>`
      : `<span class="gpx-download disabled">
           <i class="ph-light ph-download-simple"></i> GPX coming soon
         </span>`}

    ${nearbyCamps.length > 0 ? `
    <div class="detail-section">
      <h3>Nearby camps & shelters</h3>
      <div class="nearby-list">
        ${nearbyCamps.map(camp => `
          <a class="nearby-item" href="camp-detail.html?id=${sanitize(camp.id)}">
            <span class="nearby-item-icon"><i class="ph-light ph-tent"></i></span>
            <span class="nearby-item-name">${sanitize(camp.name)}</span>
            <span class="nearby-item-type">${sanitize(camp.type)}</span>
          </a>
        `).join('')}
      </div>
    </div>` : ''}
  `;

  buildRouteDetailMap(item, category);
}


// ── ROUTE DETAIL MAP ──────────────────────────────────────────
// Renders the map on a route detail page.
// Draws GPX route as a polyline if gpx_file is set.
// Falls back to a single start pin if no GPX.
// Called by buildRouteDetailPage() after HTML is in the DOM.

function buildRouteDetailMap(item, category) {
  const map = L.map('detail-map');
  makeMapLayer().addTo(map);

  // Start point marker
  L.marker([item.lat, item.lng], { icon: ICONS[category] })
    .bindPopup(`
      <div class="popup-title">${sanitize(item.name)}</div>
      <div class="popup-meta">Start point</div>
    `)
    .addTo(map);

  // Parking marker — only shown if coordinates are set in data.js
  if (item.parking_lat && item.parking_lng) {
    const parkingNote   = item.parking_note || 'Parking / start point';
    const directionsUrl = `https://maps.google.com/?q=${encodeURIComponent(item.parking_lat + ',' + item.parking_lng)}`;

    L.marker([item.parking_lat, item.parking_lng], { icon: PARKING_ICON })
      .bindPopup(`
        <div class="popup-title">Parking</div>
        <div class="popup-meta">${sanitize(parkingNote)}</div>
        <a class="popup-link"
           href="${sanitize(directionsUrl)}"
           target="_blank"
           rel="noopener noreferrer">
          Get directions →
        </a>
      `)
      .addTo(map);
  }

  if (item.gpx_file) {
    fetch(item.gpx_file)
      .then(response => {
        if (!response.ok) throw new Error('GPX file not found');
        return response.text();
      })
      .then(gpxText => {
        const points = parseGpx(gpxText);
        if (points.length === 0) return;

        const color     = category === 'hikes' ? '#2d6a2d' : '#1a6e6e';
        const routeLine = L.polyline(points, {
          color,
          weight:  4,
          opacity: 0.85
        }).addTo(map);

        map.fitBounds(routeLine.getBounds(), { padding: [20, 20] });

        drawElevationChart(points);

        const placeholder = document.getElementById('elevation-placeholder');
        if (placeholder) placeholder.style.display = 'none';
      })
      .catch(err => {
        // GPX failed — show start pin only, no crash
        console.warn('Could not load GPX:', err.message);
        map.setView([item.lat, item.lng], 13);
      });
  } else {
    map.setView([item.lat, item.lng], 13);
  }
}


// ── GPX PARSER ────────────────────────────────────────────────
// Reads a GPX XML string and returns an array of
// [lat, lng, elevation] arrays — one per trackpoint.
// GPX format: <trkpt lat="..." lon="..."><ele>...</ele></trkpt>

function parseGpx(gpxText) {
  const parser = new DOMParser();
  const xml    = parser.parseFromString(gpxText, 'text/xml');
  const points = [];

  xml.querySelectorAll('trkpt').forEach(pt => {
    const lat   = parseFloat(pt.getAttribute('lat'));
    const lng   = parseFloat(pt.getAttribute('lon'));
    const eleEl = pt.querySelector('ele');
    const ele   = eleEl ? parseFloat(eleEl.textContent) : 0;

    if (!isNaN(lat) && !isNaN(lng)) {
      points.push([lat, lng, ele]);
    }
  });

  return points;
}


// ── ELEVATION CHART ───────────────────────────────────────────
// Draws an SVG elevation profile into #elevation-canvas.
// Uses the [lat, lng, ele] points array from parseGpx().
// Pure SVG math — no charting library needed.

function drawElevationChart(points) {
  const canvas = document.getElementById('elevation-canvas');
  if (!canvas) return;

  const elevations = points.map(p => p[2]);
  const minEle     = Math.min(...elevations);
  const maxEle     = Math.max(...elevations);
  const range      = maxEle - minEle || 1; // avoid divide-by-zero

  const W = 800;
  const H = 100;

  // SVG y axis is inverted — higher elevation = smaller y
  const toY = ele => H - ((ele - minEle) / range) * (H * 0.8) - 10;

  const step   = W / (points.length - 1 || 1);
  const pts    = elevations
    .map((ele, i) => `${(i * step).toFixed(1)},${toY(ele).toFixed(1)}`)
    .join(' ');

  // Close the filled polygon back to the baseline
  const filled = `${pts} ${W},${H} 0,${H}`;

  canvas.outerHTML = `
    <svg id="elevation-canvas"
         class="elevation-chart"
         viewBox="0 0 ${W} ${H}"
         preserveAspectRatio="none"
         xmlns="http://www.w3.org/2000/svg">

      <polygon
        points="${filled}"
        fill="rgba(45,106,45,0.15)"
        stroke="none"/>

      <polyline
        points="${pts}"
        fill="none"
        stroke="#2d6a2d"
        stroke-width="2"
        stroke-linejoin="round"
        stroke-linecap="round"/>

      <text x="4" y="12"
        font-size="10" fill="#888"
        font-family="system-ui, sans-serif">
        ${Math.round(maxEle)}m
      </text>

      <text x="4" y="${H - 3}"
        font-size="10" fill="#888"
        font-family="system-ui, sans-serif">
        ${Math.round(minEle)}m
      </text>
    </svg>`;
}


// ════════════════════════════════════════════════════════════
// PAGE: CAFE DETAIL (cafe-detail.html)
// ════════════════════════════════════════════════════════════

function buildCafeDetailPage() {
  const mainEl = document.getElementById('detail-main');
  if (!mainEl) return;

  const params  = new URLSearchParams(window.location.search);
  const id      = params.get('id');
  const item    = CAFES.find(c => c.id === id);
  const backBtn = document.querySelector('.back-btn');
  if (backBtn) backBtn.href = 'cafes.html';

  if (!item) {
    document.getElementById('detail-title').textContent = 'Not found';
    mainEl.innerHTML = `
      <div class="not-found">
        <h2>Place not found</h2>
        <p><a href="cafes.html">← Go back</a></p>
      </div>`;
    return;
  }

  document.getElementById('detail-title').textContent = item.name;
  document.title = `${item.name} — Paws & Trails`;

  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(item.lat + ',' + item.lng)}`;

  mainEl.innerHTML = `

    <div class="detail-cover">
      ${item.images && item.images[0]
        ? `<img src="${sanitize(item.images[0])}" alt="${sanitize(item.name)}">`
        : '<i class="ph-light ph-fork-knife" style="font-size:3rem;color:var(--muted)"></i>'}
    </div>

    ${item.images && item.images.length > 1 ? `
    <div class="photo-gallery">
      ${item.images.slice(1)
        .map(img => `<img src="${sanitize(img)}" alt="${sanitize(item.name)}">`)
        .join('')}
    </div>` : ''}

    <div class="detail-header">
      <div class="detail-title">${sanitize(item.name)}</div>
      <div class="detail-badges">
        <span class="badge badge-type">${sanitize(item.type)}</span>
      </div>
    </div>

    <div id="detail-map" class="detail-map"></div>

    <a class="maps-link"
       href="${sanitize(mapsUrl)}"
       target="_blank"
       rel="noopener noreferrer">
      <i class="ph-light ph-map-pin"></i> Open in Google Maps
    </a>

    <div class="detail-section">
      <h3>About</h3>
      <p>${sanitize(item.description)}</p>
    </div>

    ${buildCafeInfoHTML(item)}

    ${item.menu_highlights && item.menu_highlights.length > 0 ? `
    <div class="detail-section">
      <h3>Menu highlights</h3>
      <div class="menu-list">
        ${item.menu_highlights
          .map(m => `<div class="menu-item">
            <i class="ph-light ph-fork-knife"></i> ${sanitize(m)}
          </div>`)
          .join('')}
      </div>
    </div>` : ''}
  `;

  const map = L.map('detail-map').setView([item.lat, item.lng], 15);
  makeMapLayer().addTo(map);

  L.marker([item.lat, item.lng], { icon: ICONS.cafes })
    .bindPopup(`<div class="popup-title">${sanitize(item.name)}</div>`)
    .openPopup()
    .addTo(map);
}


// ════════════════════════════════════════════════════════════
// PAGE: CAMP DETAIL (camp-detail.html)
// ════════════════════════════════════════════════════════════

function buildCampDetailPage() {
  const mainEl = document.getElementById('detail-main');
  if (!mainEl) return;

  const params  = new URLSearchParams(window.location.search);
  const id      = params.get('id');
  const item    = CAMPS.find(c => c.id === id);
  const backBtn = document.querySelector('.back-btn');
  if (backBtn) backBtn.href = 'camps.html';

  if (!item) {
    document.getElementById('detail-title').textContent = 'Not found';
    mainEl.innerHTML = `
      <div class="not-found">
        <h2>Spot not found</h2>
        <p><a href="camps.html">← Go back</a></p>
      </div>`;
    return;
  }

  document.getElementById('detail-title').textContent = item.name;
  document.title = `${item.name} — Paws & Trails`;

  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(item.lat + ',' + item.lng)}`;

  // Find hike and bike routes that reference this camp in shelters_nearby
  const linkedRoutes = [
    ...HIKES.filter(h => (h.shelters_nearby || []).includes(item.id)),
    ...BIKES.filter(b => (b.shelters_nearby || []).includes(item.id))
  ];

  mainEl.innerHTML = `

    <div class="detail-cover">
      ${item.image
        ? `<img src="${sanitize(item.image)}" alt="${sanitize(item.name)}">`
        : '<i class="ph-light ph-tent" style="font-size:3rem;color:var(--muted)"></i>'}
    </div>

    <div class="detail-header">
      <div class="detail-title">${sanitize(item.name)}</div>
      <div class="detail-badges">
        <span class="badge badge-type">${sanitize(item.type)}</span>
        ${campFeeDisplay(item.fee)}
        ${campBookingDisplay(item.booking)}
      </div>
    </div>

    <div id="detail-map" class="detail-map"></div>

    <a class="maps-link"
       href="${sanitize(mapsUrl)}"
       target="_blank"
       rel="noopener noreferrer">
      <i class="ph-light ph-map-pin"></i> Open in Google Maps
    </a>

    <div class="detail-section">
      <h3>About this spot</h3>
      <p>${sanitize(item.description)}</p>
    </div>

    <div class="detail-section">
      <h3>Good to know</h3>
      <div style="display:flex;flex-wrap:wrap;gap:0.5rem;padding-top:0.25rem">
        ${campTags(item)}
        ${facilityBadges(item.facilities)}
      </div>
    </div>

    ${linkedRoutes.length > 0 ? `
    <div class="detail-section">
      <h3>Nearby routes</h3>
      <div class="nearby-list">
        ${linkedRoutes.map(r => {
          const isHike    = HIKES.includes(r);
          const detailUrl = isHike
            ? `hike-detail.html?id=${sanitize(r.id)}`
            : `bike-detail.html?id=${sanitize(r.id)}`;
          return `
            <a class="nearby-item" href="${detailUrl}">
              <span class="nearby-item-icon">
                <i class="ph-light ${isHike ? 'ph-sneaker' : 'ph-bicycle'}"></i>
              </span>
              <span class="nearby-item-name">${sanitize(r.name)}</span>
              <span class="nearby-item-type">${sanitize(String(r.distance_km))} km</span>
            </a>`;
        }).join('')}
      </div>
    </div>` : ''}
  `;

  const map = L.map('detail-map').setView([item.lat, item.lng], 14);
  makeMapLayer().addTo(map);

  L.marker([item.lat, item.lng], { icon: ICONS.camps })
    .bindPopup(`
      <div class="popup-title">${sanitize(item.name)}</div>
      <div class="popup-meta">${sanitize(item.type)}</div>
    `)
    .openPopup()
    .addTo(map);
}


// ════════════════════════════════════════════════════════════
// PAGE: FIRE SPOT DETAIL (firespot-detail.html)
// ════════════════════════════════════════════════════════════

function buildFirespotDetailPage() {
  const mainEl = document.getElementById('detail-main');
  if (!mainEl) return;

  const params  = new URLSearchParams(window.location.search);
  const id      = params.get('id');  // fixed: was shadowed in original
  const item    = FIRESPOTS.find(f => f.id === id);
  const backBtn = document.querySelector('.back-btn');
  if (backBtn) backBtn.href = 'firespots.html';

  if (!item) {
    document.getElementById('detail-title').textContent = 'Not found';
    mainEl.innerHTML = `
      <div class="not-found">
        <h2>Fire spot not found</h2>
        <p><a href="firespots.html">← Go back</a></p>
      </div>`;
    return;
  }

  document.getElementById('detail-title').textContent = item.name;
  document.title = `${item.name} — Paws & Trails`;

  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(item.lat + ',' + item.lng)}`;

  const TYPE_LABELS = {
    official_bbq:     'Official BBQ',
    official_firepit: 'Official fire pit',
    unofficial:       'Unofficial spot'
  };

  const SEATING_LABELS = {
    benches_and_table: 'Table & benches',
    benches_only:      'Benches',
    logs:              'Logs only',
    none:              'No seating'
  };

  const FIREWOOD_LABELS = {
    provided:   'Firewood provided',
    buy_nearby: 'Buy nearby',
    bring_own:  'Bring your own'
  };

  const SEASON_LABELS = {
    year_round:  'Year round',
    summer_only: 'Summer only',
    winter_only: 'Winter only'
  };

  const TYPE_BADGE = {
    official_bbq:     'badge-official-bbq',
    official_firepit: 'badge-official-firepit',
    unofficial:       'badge-unofficial'
  };

  // Fire status banner — always shown at top of page
  const fireStatusHTML = item.fire_status === 'always_allowed'
    ? `<div class="fire-ok">
         <i class="ph-light ph-check-circle fire-ok-icon"></i>
         Fires always permitted at this designated spot.
       </div>`
    : `<div class="fire-warning">
         <i class="ph-light ph-warning fire-warning-icon"></i>
         <span>
           ${item.fire_status === 'seasonal_ban_possible'
             ? 'Fire bans are possible here during dry periods.'
             : 'Always check current fire restrictions before lighting.'}
           Check <a href="https://www.krisinformation.se"
                    target="_blank"
                    rel="noopener noreferrer">krisinformation.se</a> for active bans.
         </span>
       </div>`;

  const facilityTags = [
    item.grill_mesh    ? `<span class="tag tag-yes"><i class="ph-light ph-fire"></i> Grill mesh</span>`             : '',
    item.water_nearby  ? `<span class="tag tag-yes"><i class="ph-light ph-drop"></i> Water nearby</span>`           : '',
    item.toilet_nearby ? `<span class="tag tag-yes"><i class="ph-light ph-toilet-paper"></i> Toilet nearby</span>`  : '',
    item.parking       ? `<span class="tag tag-yes"><i class="ph-light ph-parking-sign"></i> Parking</span>`        : ''
  ].filter(Boolean).join('');

  // Resolve nearby camp IDs to full objects — use campId to avoid shadowing outer id
  const nearbyCamps = (item.nearby_camps || [])
    .map(campId => CAMPS.find(c => c.id === campId))
    .filter(Boolean);

  // Resolve nearby trail IDs to full objects — use trailId to avoid shadowing outer id
  const nearbyTrails = (item.nearby_trails || [])
    .map(trailId => {
      const hike = HIKES.find(h => h.id === trailId);
      const bike = BIKES.find(b => b.id === trailId);
      return hike ? { ...hike, category: 'hike' }
           : bike ? { ...bike, category: 'bike' }
           : null;
    })
    .filter(Boolean);

  mainEl.innerHTML = `

    ${fireStatusHTML}

    <div class="detail-cover">
      ${item.image
        ? `<img src="${sanitize(item.image)}" alt="${sanitize(item.name)}">`
        : '<i class="ph-light ph-flame" style="font-size:3rem;color:#9c7040"></i>'}
    </div>

    <div class="detail-header">
      <div class="detail-title">${sanitize(item.name)}</div>
      <div class="detail-badges">
        <span class="badge ${TYPE_BADGE[item.type] || 'badge-type'}">
          ${sanitize(TYPE_LABELS[item.type] || item.type)}
        </span>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-card">
        <span class="info-card-label">
          <i class="ph-light ph-park"></i> Seating
        </span>
        <span class="info-card-value">
          ${sanitize(SEATING_LABELS[item.seating] || item.seating)}
        </span>
      </div>
      <div class="info-card">
        <span class="info-card-label">
          <i class="ph-light ph-tree"></i> Firewood
        </span>
        <span class="info-card-value">
          ${sanitize(FIREWOOD_LABELS[item.firewood] || item.firewood)}
        </span>
      </div>
      <div class="info-card">
        <span class="info-card-label">
          <i class="ph-light ph-calendar"></i> Season
        </span>
        <span class="info-card-value">
          ${sanitize(SEASON_LABELS[item.season] || item.season)}
        </span>
      </div>
    </div>

    <div id="detail-map" class="detail-map"></div>

    <a class="maps-link"
       href="${sanitize(mapsUrl)}"
       target="_blank"
       rel="noopener noreferrer">
      <i class="ph-light ph-map-pin"></i> Open in Google Maps
    </a>

    <div class="detail-section">
      <h3>About this spot</h3>
      <p>${sanitize(item.description)}</p>
    </div>

    ${facilityTags ? `
    <div class="detail-section">
      <h3>Facilities</h3>
      <div class="tag-row">${facilityTags}</div>
    </div>` : ''}

    ${nearbyCamps.length > 0 ? `
    <div class="detail-section">
      <h3>Nearby camps & shelters</h3>
      <div class="nearby-list">
        ${nearbyCamps.map(c => `
          <a class="nearby-item" href="camp-detail.html?id=${sanitize(c.id)}">
            <span class="nearby-item-icon"><i class="ph-light ph-tent"></i></span>
            <span class="nearby-item-name">${sanitize(c.name)}</span>
            <span class="nearby-item-type">${sanitize(c.type)}</span>
          </a>
        `).join('')}
      </div>
    </div>` : ''}

    ${nearbyTrails.length > 0 ? `
    <div class="detail-section">
      <h3>Nearby routes</h3>
      <div class="nearby-list">
        ${nearbyTrails.map(r => `
          <a class="nearby-item"
             href="${r.category}-detail.html?id=${sanitize(r.id)}">
            <span class="nearby-item-icon">
              <i class="ph-light ${r.category === 'hike' ? 'ph-sneaker' : 'ph-bicycle'}"></i>
            </span>
            <span class="nearby-item-name">${sanitize(r.name)}</span>
            <span class="nearby-item-type">${sanitize(String(r.distance_km))} km</span>
          </a>
        `).join('')}
      </div>
    </div>` : ''}
  `;

  const map = L.map('detail-map').setView([item.lat, item.lng], 14);
  makeMapLayer().addTo(map);

  L.marker([item.lat, item.lng], { icon: ICONS.firespots })
    .bindPopup(`
      <div class="popup-title">${sanitize(item.name)}</div>
      <div class="popup-meta">${sanitize(TYPE_LABELS[item.type] || item.type)}</div>
    `)
    .openPopup()
    .addTo(map);
}


// ════════════════════════════════════════════════════════════
// INIT — page detection
// ════════════════════════════════════════════════════════════
// Detects the current page by filename and runs exactly one
// build function. Each function exits immediately if its
// key DOM element isn't present, so there's no risk of
// running the wrong function on the wrong page.

const currentPage = window.location.pathname.split('/').pop() || 'index.html';

const PAGE_MAP = {
  'index.html':          buildHomePage,
  '':                    buildHomePage,
  'hikes.html':          buildHikesPage,
  'bikes.html':          buildBikesPage,
  'cafes.html':          buildCafesPage,
  'camps.html':          buildCampsPage,
  'firespots.html':      buildFirespotsPage,
  'hike-detail.html':    () => buildRouteDetailPage(HIKES, 'hikes.html', 'hikes'),
  'bike-detail.html':    () => buildRouteDetailPage(BIKES, 'bikes.html', 'bikes'),
  'cafe-detail.html':    buildCafeDetailPage,
  'camp-detail.html':    buildCampDetailPage,
  'firespot-detail.html': buildFirespotDetailPage
};

const initFn = PAGE_MAP[currentPage];
if (initFn) initFn();