// ============================================================
// app.js — all logic for the Trailhead app
//
// This file never contains content/data.
// All data lives in data.js.
//
// The init block at the bottom detects which page is open
// by reading the URL filename, then runs only the relevant
// function. Each build function handles one page entirely.
// ============================================================


// ── SECURITY HELPER ──────────────────────────────────────────
// Always pass text from data through sanitize() before
// inserting it into the page. Prevents XSS attacks where
// a rogue string in your data files could run as code.

function sanitize(str) {
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }
  
  
  // ── DISPLAY LABELS ───────────────────────────────────────────
  // Human-readable labels used across cards and detail pages.
  // Edit here if you want to change how they appear on screen.
  
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
  
  /// Plain text labels — icon is added by facilityBadges() below
const FACILITY_ICONS = {
  fireplace:    'Fire',
  water_nearby: 'Water',
  toilet:       'Toilet',
  parking:      'Parking',
  swimming:     'Swimming'
};

// Icon class per facility — kept separate from the label
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
  
  // Blue official trail badge or purple GPX-only badge
  function officialBadge(item) {
    if (item.official_trail) {
      const name = item.trail_name || 'Official trail';
      return `<span class="badge badge-official">✓ ${sanitize(name)}</span>`;
    }
    return `<span class="badge badge-gpx">GPX route</span>`;
  }
  
  // Returns one styled pill per facility
// Icon and label are combined here in real HTML — not in the data object
function facilityBadges(facilities) {
  return (facilities || [])
    .map(f => {
      const label     = FACILITY_ICONS[f] || f;
      const iconClass = FACILITY_ICON_CLASS[f] || 'ph-tag';
      return `<span class="badge badge-facility">
        <i class="ph-light ${iconClass}"></i> ${sanitize(label)}
      </span>`;
    })
    .join('');
}
  
  
  // ── CUSTOM MAP ICONS ──────────────────────────────────────────
  // Creates a teardrop-shaped Leaflet marker using a coloured
  // div with an emoji inside. No image files needed.
  
  function makeIcon(emoji, color) {
    return L.divIcon({
      className: '',
      html: `
        <div style="
          background: ${color};
          width: 36px;
          height: 36px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            transform: rotate(45deg);
            font-size: 16px;
            line-height: 1;
          ">${emoji}</span>
        </div>`,
      iconSize:    [36, 36],
      iconAnchor:  [18, 36],
      popupAnchor: [0, -38]
    });
  }
  
  // One icon per category — reused on every map in the app
  const ICONS = {
    hikes: makeIcon('<i class="ph-light ph-boot"></i>',       '#6b7c5e'),
    bikes: makeIcon('<i class="ph-light ph-bicycle"></i>',    '#6b7870'),
    cafes: makeIcon('<i class="ph-light ph-fork-knife"></i>', '#9c7d58'),
    camps: makeIcon('<i class="ph-light ph-tent"></i>',       '#8c6e58')
  };
  
  
  // ── SHARED: BUILD OVERVIEW MAP ────────────────────────────────
  // Used by all four sub-pages (hikes, bikes, cafes, camps).
  // Drops a marker for each item, fits the map bounds,
  // and wires up pin click → scroll + highlight matching card.
  //
  // Parameters:
  //   mapId     id of the <div> to render the map into
  //   items     array from data.js (HIKES, BIKES etc.)
  //   category  "hikes" | "bikes" | "cafes" | "camps"
  //   metaFn    function(item) → short string for popup subtitle
  
  function buildOverviewMap(mapId, items, category, metaFn) {
    const el = document.getElementById(mapId);
    if (!el) return;
  
    const map = L.map(mapId);
  
    // OpenStreetMap tiles — free, no API key needed
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 19,
  // Remove subdomains — the {s} subdomain rotation is what triggers the block
}).addTo(map);
  
    items.forEach(item => {
      const marker = L.marker([item.lat, item.lng], { icon: ICONS[category] });
  
      // Popup shows name and short meta — no detail link yet
      // (detail links are on the cards below the map)
      marker.bindPopup(`
        <div class="popup-title">${sanitize(item.name)}</div>
        <div class="popup-meta">${sanitize(metaFn(item))}</div>
      `);
  
      marker.addTo(map);
  
      // Clicking a pin scrolls to and highlights the matching card
      marker.on('click', () => {
        const card = document.getElementById('card-' + item.id);
        if (!card) return;
  
        // Clear any existing highlights first
        document.querySelectorAll('.highlighted')
          .forEach(c => c.classList.remove('highlighted'));
  
        // Highlight and scroll to this card
        card.classList.add('highlighted');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
        // Auto-remove highlight after 2.5 seconds
        setTimeout(() => card.classList.remove('highlighted'), 2500);
      });
    });
  
    // Zoom to fit all markers with padding
    if (items.length > 0) {
      const bounds = L.latLngBounds(items.map(i => [i.lat, i.lng]));
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }
  
  
  // ── SHARED: FILTER BAR ────────────────────────────────────────
  // Wires up the filter pill buttons on any list page.
  // Clicking a button marks it active and calls renderFn
  // with the selected filter value so the cards re-render.
  //
  // Parameters:
  //   renderFn   function(filterValue) that re-renders cards
  
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
  
  
  // ── HOME PAGE ─────────────────────────────────────────────────
  // Builds the main map on index.html with all four category
  // layers, toggle filter buttons, and category card counts.
  
  function buildHomePage() {
    const mapEl = document.getElementById('map');
    if (!mapEl) return;
  
    // Fill in counts on the four category cards
    document.getElementById('count-hikes').textContent = `${HIKES.length} routes`;
    document.getElementById('count-bikes').textContent = `${BIKES.length} routes`;
    document.getElementById('count-cafes').textContent = `${CAFES.length} places`;
    document.getElementById('count-camps').textContent = `${CAMPS.length} spots`;
  
    const map = L.map('map', { center: [59.270, 18.120], zoom: 10 });
  
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 19,
  // Remove subdomains — the {s} subdomain rotation is what triggers the block
}).addTo(map);
  
    // Each category gets its own layer group so we can
    // show/hide it independently with the filter buttons
    const layers = {
      hikes: L.layerGroup().addTo(map),
      bikes: L.layerGroup().addTo(map),
      cafes: L.layerGroup().addTo(map),
      camps: L.layerGroup().addTo(map)
    };
  
    // Adds markers for one category into its layer
    function addMarkersToLayer(dataArray, category, detailPage, metaFn) {
      dataArray.forEach(item => {
        const marker = L.marker([item.lat, item.lng], { icon: ICONS[category] });
        marker.bindPopup(`
          <div class="popup-title">${sanitize(item.name)}</div>
          <div class="popup-meta">${sanitize(metaFn(item))}</div>
          <a class="popup-link" href="${sanitize(detailPage)}?id=${sanitize(item.id)}">
            View details →
          </a>
        `);
        marker.addTo(layers[category]);
      });
    }
  
    // Add all four categories to the map
    addMarkersToLayer(HIKES, 'hikes', 'hike-detail.html',
      h => `${h.distance_km} km · ${DIFFICULTY_LABEL[h.difficulty]}`);
    addMarkersToLayer(BIKES, 'bikes', 'bike-detail.html',
      b => `${b.distance_km} km · ${DIFFICULTY_LABEL[b.difficulty]}`);
    addMarkersToLayer(CAFES, 'cafes', 'cafe-detail.html',
      c => c.type);
    addMarkersToLayer(CAMPS, 'camps', 'camp-detail.html',
      c => c.type);
  
    // Filter toggle buttons — show/hide each category layer
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
  
  
  // ── HIKES LIST PAGE ───────────────────────────────────────────
  // Builds the overview map and card list on hikes.html.
  // Cards can be filtered by difficulty level.
  
  function buildHikesPage() {
    const mapEl = document.getElementById('hikes-map');
    if (!mapEl) return;
  
    document.getElementById('page-count').textContent = `${HIKES.length} routes`;
  
    buildOverviewMap('hikes-map', HIKES, 'hikes',
      h => `${h.distance_km} km · ${h.elevation_m}m · ${DIFFICULTY_LABEL[h.difficulty]}`
    );
  
    function renderCards(filter) {
      const list     = document.getElementById('items-list');
      const filtered = filter === 'all'
        ? HIKES
        : HIKES.filter(h => h.difficulty === filter);
  
      if (filtered.length === 0) {
        list.innerHTML = '<p class="no-results">No routes match this filter.</p>';
        return;
      }
  
      // Each card is a full <a> tag so the whole card is clickable
      // id="card-X" is what the map pin click uses to scroll here
      list.innerHTML = filtered.map(h => `
        <a class="route-card"
           id="card-${sanitize(h.id)}"
           href="hike-detail.html?id=${sanitize(h.id)}">
          <div class="route-card-image">
            ${h.image
              ? `<img src="${sanitize(h.image)}" alt="${sanitize(h.name)}">`
              : '🥾'}
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
  
    renderCards('all');
    setupFilters(renderCards);
  }
  
  
  // ── BIKES LIST PAGE ───────────────────────────────────────────
  // Builds the overview map and card list on bikes.html.
  
  function buildBikesPage() {
    const mapEl = document.getElementById('bikes-map');
    if (!mapEl) return;
  
    document.getElementById('page-count').textContent = `${BIKES.length} routes`;
  
    buildOverviewMap('bikes-map', BIKES, 'bikes',
      b => `${b.distance_km} km · ${b.elevation_m}m · ${DIFFICULTY_LABEL[b.difficulty]}`
    );
  
    function renderCards(filter) {
      const list     = document.getElementById('items-list');
      const filtered = filter === 'all'
        ? BIKES
        : BIKES.filter(b => b.difficulty === filter);
  
      if (filtered.length === 0) {
        list.innerHTML = '<p class="no-results">No routes match this filter.</p>';
        return;
      }
  
      list.innerHTML = filtered.map(b => `
        <a class="route-card"
           id="card-${sanitize(b.id)}"
           href="bike-detail.html?id=${sanitize(b.id)}">
          <div class="route-card-image">
            ${b.image
              ? `<img src="${sanitize(b.image)}" alt="${sanitize(b.name)}">`
              : '🚵'}
          </div>
          <div class="route-card-body">
            <div class="route-card-title">${sanitize(b.name)}</div>
            <div class="route-card-stats">
              <span class="stat">📏 ${sanitize(String(b.distance_km))} km</span>
              <span class="stat">⬆️ ${sanitize(String(b.elevation_m))} m</span>
              <span class="stat">🚵 ${sanitize(b.surface)}</span>
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
  
    renderCards('all');
    setupFilters(renderCards);
  }
  
  
  // ── CAFES LIST PAGE ───────────────────────────────────────────
  // Builds the overview map and card list on cafes.html.
  // Cards can be filtered by type: cafe / restaurant / bar.
  
  function buildCafesPage() {
    const mapEl = document.getElementById('cafes-map');
    if (!mapEl) return;
  
    document.getElementById('page-count').textContent = `${CAFES.length} places`;
  
    buildOverviewMap('cafes-map', CAFES, 'cafes',
      c => c.type
    );
  
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
              : '🍴'}
          </div>
          <div class="place-card-body">
            <div class="place-card-title">${sanitize(c.name)}</div>
            <div class="route-card-badges">
              <span class="badge badge-type">${sanitize(c.type)}</span>
            </div>
            <div class="place-card-desc">${sanitize(c.description)}</div>
            <div class="place-card-meta">
              ${(c.menu_highlights || []).slice(0, 3)
                .map(m => `<span class="badge badge-type">🍽 ${sanitize(m)}</span>`)
                .join(' ')}
            </div>
          </div>
        </a>
      `).join('');
    }
  
    renderCards('all');
    setupFilters(renderCards);
  }
  
  
  // ── CAMPS LIST PAGE ───────────────────────────────────────────
  // Builds the overview map and card list on camps.html.
  // Cards can be filtered by type: shelter / campsite / fireplace.
  
  function buildCampsPage() {
    const mapEl = document.getElementById('camps-map');
    if (!mapEl) return;
  
    document.getElementById('page-count').textContent = `${CAMPS.length} spots`;
  
    buildOverviewMap('camps-map', CAMPS, 'camps',
      c => c.type
    );
  
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
              : '⛺'}
          </div>
          <div class="camp-card-body">
            <div class="camp-card-title">${sanitize(c.name)}</div>
            <span class="badge badge-type">${sanitize(c.type)}</span>
            <div class="camp-card-desc">${sanitize(c.description)}</div>
            <div class="camp-card-facilities">
              ${facilityBadges(c.facilities)}
            </div>
          </div>
        </a>
      `).join('');
    }
  
    renderCards('all');
    setupFilters(renderCards);
  }
  
  
  // ── DETAIL PAGE: ROUTE (hike or bike) ────────────────────────
  // Runs on hike-detail.html and bike-detail.html.
  // Reads ?id= from the URL, finds the item in dataset,
  // and renders the full detail view with map and elevation.
  //
  // Parameters:
  //   dataset    HIKES or BIKES array from data.js
  //   backUrl    list page to return to e.g. "hikes.html"
  //   category   "hikes" or "bikes"
  
  function buildRouteDetailPage(dataset, backUrl, category) {
    const mainEl = document.getElementById('detail-main');
    if (!mainEl) return;
  
    // Read the ?id= value from the current URL
    const params = new URLSearchParams(window.location.search);
    const id     = params.get('id');
  
    // Point the back button at the correct list page
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) backBtn.href = backUrl;
  
    // Find the item — show error if not found
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
  
    // Update header title and browser tab
    document.getElementById('detail-title').textContent = item.name;
    document.title = `${item.name} — Trailhead`;
  
    // Find nearby camp spots listed in shelters_nearby
    const nearbyCamps = (item.shelters_nearby || [])
      .map(campId => CAMPS.find(c => c.id === campId))
      .filter(Boolean);
  
    // Render the full detail page HTML
    mainEl.innerHTML = `
  
      <!-- Cover image or emoji placeholder -->
      <div class="detail-cover">
        ${item.image
          ? `<img src="${sanitize(item.image)}" alt="${sanitize(item.name)}">`
          : (category === 'hikes' ? '🥾' : '🚵')}
      </div>
  
      <!-- Title and badges -->
      <div class="detail-header">
        <div class="detail-title">${sanitize(item.name)}</div>
        <div class="detail-badges">
          ${difficultyBadge(item.difficulty)}
          ${officialBadge(item)}
          <span class="badge badge-type">🏃 ${sanitize(item.surface)}</span>
        </div>
      </div>
  
      <!-- Key stats row -->
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
  
      <!-- Elevation profile — filled by drawElevationChart() if GPX loads -->
      <div class="elevation-section">
        <h3>Elevation profile</h3>
        <canvas id="elevation-canvas" class="elevation-chart"></canvas>
        <p id="elevation-placeholder"
           style="font-size:0.8rem;color:#aaa;text-align:center;padding:0.5rem 0">
          Add a GPX file to see the elevation profile
        </p>
      </div>
  
      <!-- About this route -->
      <div class="detail-section">
        <h3>About this route</h3>
        <p>${sanitize(item.description)}</p>
      </div>
  
      <!-- Good to know — only shown if field is set -->
      ${item.good_to_know ? `
      <div class="detail-section">
        <h3>Good to know</h3>
        <p>${sanitize(item.good_to_know)}</p>
      </div>` : ''}
  
      <!-- Trail markers — only shown for official trails -->
      ${item.official_trail && item.trail_markers ? `
      <div class="detail-section">
        <h3>Trail markers</h3>
        <p>${sanitize(item.trail_markers)}</p>
      </div>` : ''}
      
      <!-- Parking / start point info — only shown if set in data.js -->
      ${item.parking_lat ? `
      <div class="detail-section">
        <h3><i class="ph-light ph-car"></i> Parking & start point</h3>
        <p>${sanitize(item.parking_note || 'Parking available at start point')}</p>
        <a class="maps-link"
           href="https://maps.google.com/?q=${item.parking_lat},${item.parking_lng}"
           target="_blank"
           rel="noopener noreferrer"
           style="margin-top: 0.65rem;">
          <i class="ph-light ph-navigation-arrow"></i> Get directions to start
        </a>
      </div>` : ''}

      <!-- GPX download — greyed out if no file set yet -->
      ${item.gpx_file
        ? `<a class="gpx-download"
            href="${sanitize(item.gpx_file)}"
            download>
           <i class="ph-light ph-download-simple"></i> Download GPX file
         </a>`
         : `<span class="gpx-download disabled">
         <i class="ph-light ph-download-simple"></i> GPX coming soon
       </span>`}
  
      <!-- Nearby camps — only shown if shelters_nearby is populated -->
      ${nearbyCamps.length > 0 ? `
      <div class="detail-section">
        <h3>Nearby camps & shelters</h3>
        <div class="nearby-list">
          ${nearbyCamps.map(camp => `
            <a class="nearby-item"
               href="camp-detail.html?id=${sanitize(camp.id)}">
              <span class="nearby-item-icon">⛺</span>
              <span class="nearby-item-name">${sanitize(camp.name)}</span>
              <span class="nearby-item-type">${sanitize(camp.type)}</span>
            </a>
          `).join('')}
        </div>
      </div>` : ''}
  
    `;
  
    // Build the map now the HTML is in the DOM
    buildRouteDetailMap(item, category);
  }
  
  
  // ── DETAIL MAP (route pages) ──────────────────────────────────
  // Renders the map on a route detail page.
  // Draws the GPX route as a polyline if gpx_file is set.
  // Falls back to a single pin if no GPX available.
  
  function buildRouteDetailMap(item, category) {
    const map = L.map('detail-map');
  
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 19,
  // Remove subdomains — the {s} subdomain rotation is what triggers the block
}).addTo(map);
  
    // Start point pin — uses the category icon
L.marker([item.lat, item.lng], { icon: ICONS[category] })
.bindPopup(`
  <div class="popup-title">${sanitize(item.name)}</div>
  <div class="popup-meta">Start point</div>
`)
.addTo(map);

// Parking marker — only shown if parking coords are set
if (item.parking_lat && item.parking_lng) {
const parkingIcon = L.divIcon({
  className: '',
  html: `<div style="
    background: #5a7a9a;
    width: 32px; height: 32px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 2px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    display: flex; align-items: center; justify-content: center;
  "><span style="transform: rotate(45deg); font-size: 13px; color: white; font-weight: 700;">P</span></div>`,
  iconSize:    [32, 32],
  iconAnchor:  [16, 32],
  popupAnchor: [0, -34]
});

const parkingNote  = item.parking_note || 'Parking / start point';
const directionsUrl = `https://maps.google.com/?q=${item.parking_lat},${item.parking_lng}`;

L.marker([item.parking_lat, item.parking_lng], { icon: parkingIcon })
  .bindPopup(`
    <div class="popup-title">Parking</div>
    <div class="popup-meta">${sanitize(parkingNote)}</div>
    <a class="popup-link" href="${sanitize(directionsUrl)}"
       target="_blank" rel="noopener">Get directions →</a>
  `)
  .addTo(map);
};
  
    if (item.gpx_file) {
      // Fetch and parse the GPX file, then draw the route
      fetch(item.gpx_file)
        .then(response => {
          if (!response.ok) throw new Error('GPX file not found');
          return response.text();
        })
        .then(gpxText => {
          const points = parseGpx(gpxText);
          if (points.length === 0) return;
  
          // Draw the route line in the category colour
          const color     = category === 'hikes' ? '#2d6a2d' : '#1a6e6e';
          const routeLine = L.polyline(points, {
            color,
            weight:  4,
            opacity: 0.85
          }).addTo(map);
  
          // Fit map to the full route extent
          map.fitBounds(routeLine.getBounds(), { padding: [20, 20] });
  
          // Draw the elevation chart and hide the placeholder text
          drawElevationChart(points);
          const placeholder = document.getElementById('elevation-placeholder');
          if (placeholder) placeholder.style.display = 'none';
        })
        .catch(err => {
          // GPX failed — just show the pin, no crash
          console.warn('Could not load GPX:', err.message);
          map.setView([item.lat, item.lng], 13);
        });
    } else {
      // No GPX set — centre map on the start pin
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
  // Draws an SVG elevation profile into the #elevation-canvas element.
  // Uses the [lat, lng, ele] points array from parseGpx().
  // Pure SVG math — no charting library needed.
  
  function drawElevationChart(points) {
    const canvas = document.getElementById('elevation-canvas');
    if (!canvas) return;
  
    const elevations = points.map(p => p[2]);
    const minEle     = Math.min(...elevations);
    const maxEle     = Math.max(...elevations);
    const range      = maxEle - minEle || 1; // avoid divide by zero
  
    const W = 800; // internal SVG coordinate width
    const H = 100; // internal SVG coordinate height
  
    // Convert elevation to SVG y coordinate
    // Higher elevation = smaller y (SVG y axis goes top to bottom)
    const toY = ele => H - ((ele - minEle) / range) * (H * 0.8) - 10;
  
    // Build the polyline points string
    const step   = W / (points.length - 1 || 1);
    const pts    = elevations.map((ele, i) => `${(i * step).toFixed(1)},${toY(ele).toFixed(1)}`).join(' ');
  
    // Close the filled polygon back down to the baseline
    const filled = `${pts} ${W},${H} 0,${H}`;
  
    // Replace the canvas placeholder with an inline SVG
    canvas.outerHTML = `
      <svg id="elevation-canvas"
           class="elevation-chart"
           viewBox="0 0 ${W} ${H}"
           preserveAspectRatio="none"
           xmlns="http://www.w3.org/2000/svg">
  
        <!-- Shaded area under the elevation line -->
        <polygon
          points="${filled}"
          fill="rgba(45,106,45,0.15)"
          stroke="none"/>
  
        <!-- The elevation line -->
        <polyline
          points="${pts}"
          fill="none"
          stroke="#2d6a2d"
          stroke-width="2"
          stroke-linejoin="round"
          stroke-linecap="round"/>
  
        <!-- Max elevation label (top left) -->
        <text x="4" y="12"
          font-size="10"
          fill="#888"
          font-family="system-ui, sans-serif">
          ${Math.round(maxEle)}m
        </text>
  
        <!-- Min elevation label (bottom left) -->
        <text x="4" y="${H - 3}"
          font-size="10"
          fill="#888"
          font-family="system-ui, sans-serif">
          ${Math.round(minEle)}m
        </text>
      </svg>`;
  }
  
  
  // ── DETAIL PAGE: CAFE ─────────────────────────────────────────
  // Runs on cafe-detail.html.
  // Shows photo gallery, map pin, Open in Maps link,
  // description and menu highlights.
  
  function buildCafeDetailPage() {
    const mainEl = document.getElementById('detail-main');
    if (!mainEl) return;
  
    const params = new URLSearchParams(window.location.search);
    const id     = params.get('id');
    const item   = CAFES.find(c => c.id === id);
  
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
    document.title = `${item.name} — Trailhead`;
  
    // Google Maps deep link using coordinates
    const mapsUrl =
      `https://maps.google.com/?q=${item.lat},${item.lng}`;
  
    mainEl.innerHTML = `
  
      <!-- Cover photo or emoji placeholder -->
      <div class="detail-cover">
        ${item.images && item.images[0]
          ? `<img src="${sanitize(item.images[0])}" alt="${sanitize(item.name)}">`
          : '🍴'}
      </div>
  
      <!-- Additional photos grid — shown if more than one image -->
      ${item.images && item.images.length > 1 ? `
      <div class="photo-gallery">
        ${item.images.slice(1)
          .map(img => `<img src="${sanitize(img)}" alt="${sanitize(item.name)}">`)
          .join('')}
      </div>` : ''}
  
      <!-- Title and type badge -->
      <div class="detail-header">
        <div class="detail-title">${sanitize(item.name)}</div>
        <div class="detail-badges">
          <span class="badge badge-type">${sanitize(item.type)}</span>
        </div>
      </div>
  
      <!-- Map pin -->
      <div id="detail-map" class="detail-map"></div>
  
      <!-- Opens Google Maps in a new tab -->
      <a class="maps-link"
       href="${sanitize(mapsUrl)}"
       target="_blank"
       rel="noopener noreferrer">
      <i class="ph-light ph-map-pin"></i> Open in Google Maps
    </a>
  
      <!-- Description -->
      <div class="detail-section">
        <h3>About</h3>
        <p>${sanitize(item.description)}</p>
      </div>
  
      <!-- Menu highlights list -->
      ${item.menu_highlights && item.menu_highlights.length > 0 ? `
      <div class="detail-section">
        <h3>Menu highlights</h3>
        <div class="menu-list">
          ${item.menu_highlights
            .map(m => `<div class="menu-item">🍽 ${sanitize(m)}</div>`)
            .join('')}
        </div>
      </div>` : ''}
  
    `;
  
    // Simple pin map — no GPX for cafes
    const map = L.map('detail-map').setView([item.lat, item.lng], 15);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 19,
  // Remove subdomains — the {s} subdomain rotation is what triggers the block
}).addTo(map);
  
    L.marker([item.lat, item.lng], { icon: ICONS.cafes })
      .bindPopup(`<div class="popup-title">${sanitize(item.name)}</div>`)
      .openPopup()
      .addTo(map);
  }
  
  
  // ── DETAIL PAGE: CAMP ─────────────────────────────────────────
  // Runs on camp-detail.html.
  // Shows description, facilities, map pin, Open in Maps link,
  // and any routes that list this camp in shelters_nearby.
  
  function buildCampDetailPage() {
    const mainEl = document.getElementById('detail-main');
    if (!mainEl) return;
  
    const params = new URLSearchParams(window.location.search);
    const id     = params.get('id');
    const item   = CAMPS.find(c => c.id === id);
  
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
    document.title = `${item.name} — Trailhead`;
  
    const mapsUrl =
      `https://maps.google.com/?q=${item.lat},${item.lng}`;
  
    // Find any hike or bike routes that reference this camp
    const linkedRoutes = [
      ...HIKES.filter(h => (h.shelters_nearby || []).includes(item.id)),
      ...BIKES.filter(b => (b.shelters_nearby || []).includes(item.id))
    ];
  
    mainEl.innerHTML = `
  
      <!-- Cover image or emoji placeholder -->
      <div class="detail-cover">
        ${item.image
          ? `<img src="${sanitize(item.image)}" alt="${sanitize(item.name)}">`
          : '⛺'}
      </div>
  
      <!-- Title and type badge -->
      <div class="detail-header">
        <div class="detail-title">${sanitize(item.name)}</div>
        <div class="detail-badges">
          <span class="badge badge-type">${sanitize(item.type)}</span>
        </div>
      </div>
  
      <!-- Map pin -->
      <div id="detail-map" class="detail-map"></div>
  
      <!-- Opens Google Maps in a new tab -->
      <a class="maps-link"
       href="${sanitize(mapsUrl)}"
       target="_blank"
       rel="noopener noreferrer">
      <i class="ph-light ph-map-pin"></i> Open in Google Maps
    </a>
  
      <!-- Description -->
      <div class="detail-section">
        <h3>About this spot</h3>
        <p>${sanitize(item.description)}</p>
      </div>
  
      <!-- Facilities badges -->
      ${item.facilities && item.facilities.length > 0 ? `
      <div class="detail-section">
        <h3>Facilities</h3>
        <div style="display:flex; flex-wrap:wrap; gap:0.5rem; padding-top:0.25rem">
          ${facilityBadges(item.facilities)}
        </div>
      </div>` : ''}
  
      <!-- Routes that pass near this camp — linked back to their detail pages -->
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
                <span class="nearby-item-icon">${isHike ? '🥾' : '🚵'}</span>
                <span class="nearby-item-name">${sanitize(r.name)}</span>
                <span class="nearby-item-type">${sanitize(String(r.distance_km))} km</span>
              </a>`;
          }).join('')}
        </div>
      </div>` : ''}
  
    `;
  
    // Simple pin map
    const map = L.map('detail-map').setView([item.lat, item.lng], 14);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
      // Remove subdomains — the {s} subdomain rotation is what triggers the block
    }).addTo(map);
  
    L.marker([item.lat, item.lng], { icon: ICONS.camps })
      .bindPopup(`
        <div class="popup-title">${sanitize(item.name)}</div>
        <div class="popup-meta">${sanitize(item.type)}</div>
      `)
      .openPopup()
      .addTo(map);
  }
  
  
  // ── INIT ──────────────────────────────────────────────────────
  // Detects which page is open by reading the filename from
  // the URL, then runs exactly one build function.
  // This is more reliable than having every function
  // self-detect via element IDs.
  
  const currentPage = window.location.pathname.split('/').pop();
  
  if (currentPage === 'index.html' || currentPage === '') {
    buildHomePage();
  
  } else if (currentPage === 'hikes.html') {
    buildHikesPage();
  
  } else if (currentPage === 'bikes.html') {
    buildBikesPage();
  
  } else if (currentPage === 'cafes.html') {
    buildCafesPage();
  
  } else if (currentPage === 'camps.html') {
    buildCampsPage();
  
  } else if (currentPage === 'hike-detail.html') {
    // Pass the HIKES dataset, the back URL, and the category name
    buildRouteDetailPage(HIKES, 'hikes.html', 'hikes');
  
  } else if (currentPage === 'bike-detail.html') {
    buildRouteDetailPage(BIKES, 'bikes.html', 'bikes');
  
  } else if (currentPage === 'cafe-detail.html') {
    buildCafeDetailPage();
  
  } else if (currentPage === 'camp-detail.html') {
    buildCampDetailPage();
  }