const $ = (id) => document.getElementById(id);
let timer;

async function loadStats() {
  const r = await fetch('https://rakthsetu-blood-bank-management-system.onrender.com/api/stats');
  const s = await r.json();
  $('total').textContent = s.total.toLocaleString();
  $('states').textContent = s.states;
  $('cities').textContent = s.cities.toLocaleString();
  $('gov').textContent = s.government.toLocaleString();
}

async function loadCities() {
  const state = $('state').value;
  const r = await fetch('https://rakthsetu-blood-bank-management-system.onrender.com/api/cities?state=' + encodeURIComponent(state));
  const cities = await r.json();
  $('city').innerHTML = '<option value="">All cities</option>' + cities.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function cardHtml(b) {
  const place = [b.city, b.district, b.state].filter(Boolean).join(', ');
  const service = b.service_time || 'Service time not listed';
  const category = b.category || 'Category not listed';
  return `<article class="card">
    <span class="tag">${escapeHtml(category)}</span>
    <h3>${escapeHtml(b.name || 'Unnamed Blood Bank')}</h3>
    <p class="muted">📍 ${escapeHtml(place || b.address || 'Location not listed')}</p>
    <div class="meta">
      <span class="pill">🕐 ${escapeHtml(service)}</span>
      ${b.components ? `<span class="pill">🩸 Components: ${escapeHtml(b.components)}</span>` : ''}
      ${b.apheresis ? `<span class="pill">Apheresis: ${escapeHtml(b.apheresis)}</span>` : ''}
    </div>
    <p class="muted">${escapeHtml(b.address || '')}</p>
    <button class="details" onclick="openDetails(${Number(b.id)})">View full details →</button>
  </article>`;
}

async function searchBanks() {
  const params = new URLSearchParams({
    q: $('q').value.trim(), state: $('state').value, city: $('city').value,
    category: $('category').value, limit: 120
  });
  $('results').innerHTML = '<div class="empty">Searching the dataset…</div>';
  const r = await fetch('https://rakthsetu-blood-bank-management-system.onrender.com/api/search?' + params.toString());
  const data = await r.json();
  $('resultCount').textContent = `${data.count.toLocaleString()} matching records`;
  $('results').innerHTML = data.results.length ? data.results.map(cardHtml).join('') : '<div class="empty"><strong>No blood banks found.</strong><br>Try a different search or clear the filters.</div>';
}

async function openDetails(id) {
  const r = await fetch('https://rakthsetu-blood-bank-management-system.onrender.com/api/blood-banks/' + id);
  const b = await r.json();
  if (!r.ok) return;
  const map = b.latitude && b.longitude ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.latitude + ',' + b.longitude)}` : '';
  $('modalBody').innerHTML = `<div class="detail-head"><span class="tag">${escapeHtml(b.category || 'Blood Bank')}</span><h2 id="modalTitle">${escapeHtml(b.name)}</h2><p class="muted">${escapeHtml([b.city,b.district,b.state].filter(Boolean).join(', '))}</p></div>
  <div class="detail-grid">
    ${info('Address', b.address)} ${info('Pincode', b.pincode)} ${info('Contact', b.contact)} ${info('Mobile', b.mobile)}
    ${info('Helpline', b.helpline)} ${info('Email', b.email)} ${info('Website', b.website)} ${info('Service Time', b.service_time)}
    ${info('Blood Components', b.components)} ${info('Apheresis', b.apheresis)} ${info('License', b.license)} ${info('License Obtained', b.license_date)}
    ${info('Renewal Date', b.renewal_date)} ${info('Nodal Officer', b.officer)} ${info('Officer Contact', b.officer_contact)} ${info('Officer Mobile', b.officer_mobile)}
    ${info('Officer Email', b.officer_email)} ${info('Qualification', b.qualification)}
  </div>
  ${map ? `<a class="map-btn" href="${map}" target="_blank" rel="noopener">📍 Open location in Google Maps ↗</a>` : ''}`;
  $('modal').classList.remove('hidden');
}

function info(label, value) {
  if (!value) return '';
  return `<div class="info"><small>${escapeHtml(label)}</small><div>${escapeHtml(value)}</div></div>`;
}

function clearFilters() {
  $('q').value = ''; $('state').value = ''; $('city').innerHTML = '<option value="">All cities</option>'; $('category').value = '';
  searchBanks();
}

$('searchBtn').addEventListener('click', searchBanks);
$('clearBtn').addEventListener('click', clearFilters);
$('state').addEventListener('change', async () => { await loadCities(); searchBanks(); });
$('city').addEventListener('change', searchBanks);
$('category').addEventListener('change', searchBanks);
$('q').addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(searchBanks, 300); });
$('closeModal').addEventListener('click', () => $('modal').classList.add('hidden'));
$('modal').addEventListener('click', e => { if (e.target === $('modal')) $('modal').classList.add('hidden'); });
document.querySelectorAll('.quick-tags button').forEach(btn => btn.addEventListener('click', () => { $('q').value = btn.dataset.query; searchBanks(); }));

loadStats(); loadCities(); searchBanks();
