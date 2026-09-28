const $ = (id) => document.getElementById(id);
let timer;

async function loadStats() {
  const r = await fetch('/api/stats');
  const s = await r.json();
  $('total').textContent = s.total.toLocaleString();
  $('states').textContent = s.states;
  $('cities').textContent = s.cities.toLocaleString();
  $('gov').textContent = s.government.toLocaleString();
}

async function loadCities() {
  const state = $('state').value;
  const r = await fetch('/api/cities?state=' + encodeURIComponent(state));
  const cities = await r.json();
  $('city').innerHTML = '<option value="">All cities</option>' +
    cities.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  }[c]));
}

function cardHtml(b) {
  const place = [b.city, b.district, b.state].filter(Boolean).join(', ');
  const service = b.service_time || 'Service time not listed';
  const category = b.category || 'Category not listed';
  const donor = b.donor_name || 'Demo donor not listed';
  const donorBg = b.donor_blood_group || '—';
  const donorGender = b.donor_gender || '—';

  return `<article class="card">
    <span class="tag">${escapeHtml(category)}</span>
    <h3>${escapeHtml(b.name || 'Unnamed Blood Bank')}</h3>
    <p class="muted">📍 ${escapeHtml(place || b.address || 'Location not listed')}</p>

    <div class="donor-mini">
      <strong>🧑 Donor</strong>
      <span>${escapeHtml(donor)}</span>
      <span>${escapeHtml(donorGender)}</span>
      <span class="blood-badge">${escapeHtml(donorBg)}</span>
    </div>

    <div class="meta">
      <span class="pill">🕐 ${escapeHtml(service)}</span>
      ${b.components ? `<span class="pill">🩸 Components: ${escapeHtml(b.components)}</span>` : ''}
      ${b.apheresis ? `<span class="pill">Apheresis: ${escapeHtml(b.apheresis)}</span>` : ''}
      ${b.total_units ? `<span class="pill">🩸 Units: ${escapeHtml(b.total_units)}</span>` : ''}
    </div>

    <p class="muted">${escapeHtml(b.address || '')}</p>
    <button class="details" onclick="openDetails(${Number(b.id)})">View donor & blood details →</button>
  </article>`;
}

async function searchBanks() {
  const params = new URLSearchParams({
    q: $('q').value.trim(),
    state: $('state').value,
    city: $('city').value,
    category: $('category').value,
    blood_group: $('bloodGroup').value,
    gender: $('gender').value,
    limit: 120
  });

  $('results').innerHTML = '<div class="empty">Searching the dataset…</div>';
  const r = await fetch('/api/search?' + params.toString());
  const data = await r.json();

  $('resultCount').textContent = `${data.count.toLocaleString()} matching records`;
  $('results').innerHTML = data.results.length
    ? data.results.map(cardHtml).join('')
    : '<div class="empty"><strong>No matching records found.</strong><br>Try another blood group, donor gender or search term.</div>';
}

async function openDetails(id) {
  const r = await fetch('/api/blood-banks/' + id);
  const b = await r.json();
  if (!r.ok) return;

  const map = b.latitude && b.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.latitude + ',' + b.longitude)}`
    : '';

  const inventory = [
    ['A+', b.a_pos], ['A-', b.a_neg], ['B+', b.b_pos], ['B-', b.b_neg],
    ['O+', b.o_pos], ['O-', b.o_neg], ['AB+', b.ab_pos], ['AB-', b.ab_neg]
  ].filter(x => x[1] !== '');

  const inventoryHtml = inventory.length
    ? `<div class="inventory-box"><h3>🩸 Blood Group Inventory</h3><div class="inventory-grid">${
        inventory.map(([g,u]) => `<div><b>${g}</b><span>${escapeHtml(u)} units</span></div>`).join('')
      }</div><p class="inventory-total">Total: <b>${escapeHtml(b.total_units)}</b> units</p></div>`
    : '';

  $('modalBody').innerHTML = `
    <div class="detail-head">
      <span class="tag">${escapeHtml(b.category || 'Blood Bank')}</span>
      <h2 id="modalTitle">${escapeHtml(b.name)}</h2>
      <p class="muted">${escapeHtml([b.city,b.district,b.state].filter(Boolean).join(', '))}</p>
    </div>

    <div class="donor-detail">
      <h3>🧑 Donor Information</h3>
      <div class="detail-grid">
        ${info('Donor Name', b.donor_name)}
        ${info('Age', b.donor_age)}
        ${info('Gender', b.donor_gender)}
        ${info('Blood Group', b.donor_blood_group)}
        ${info('Phone', b.donor_phone)}
      </div>
    </div>

    ${inventoryHtml}

    <div class="detail-grid">
      ${info('Address', b.address)} ${info('Pincode', b.pincode)}
      ${info('Contact', b.contact)} ${info('Mobile', b.mobile)}
      ${info('Helpline', b.helpline)} ${info('Email', b.email)}
      ${info('Website', b.website)} ${info('Service Time', b.service_time)}
      ${info('Blood Components', b.components)} ${info('Apheresis', b.apheresis)}
      ${info('License', b.license)} ${info('License Obtained', b.license_date)}
      ${info('Renewal Date', b.renewal_date)} ${info('Nodal Officer', b.officer)}
      ${info('Officer Contact', b.officer_contact)} ${info('Officer Mobile', b.officer_mobile)}
      ${info('Officer Email', b.officer_email)} ${info('Qualification', b.qualification)}
    </div>
    ${map ? `<a class="map-btn" href="${map}" target="_blank" rel="noopener">📍 Open location in Google Maps ↗</a>` : ''}
  `;

  $('modal').classList.remove('hidden');
}

function info(label, value) {
  if (!value) return '';
  return `<div class="info"><small>${escapeHtml(label)}</small><div>${escapeHtml(value)}</div></div>`;
}

function clearFilters() {
  $('q').value = '';
  $('state').value = '';
  $('city').innerHTML = '<option value="">All cities</option>';
  $('category').value = '';
  $('bloodGroup').value = '';
  $('gender').value = '';
  searchBanks();
}

function quickBloodGroup(group) {
  $('bloodGroup').value = group;
  document.getElementById('search').scrollIntoView({behavior:'smooth'});
  searchBanks();
}

$('searchBtn').addEventListener('click', searchBanks);
$('clearBtn').addEventListener('click', clearFilters);
$('state').addEventListener('change', async () => { await loadCities(); searchBanks(); });
$('city').addEventListener('change', searchBanks);
$('category').addEventListener('change', searchBanks);
$('bloodGroup').addEventListener('change', searchBanks);
$('gender').addEventListener('change', searchBanks);
$('q').addEventListener('input', () => {
  clearTimeout(timer);
  timer = setTimeout(searchBanks, 300);
});
$('closeModal').addEventListener('click', () => $('modal').classList.add('hidden'));
$('modal').addEventListener('click', e => {
  if (e.target === $('modal')) $('modal').classList.add('hidden');
});
document.querySelectorAll('.quick-tags button').forEach(btn =>
  btn.addEventListener('click', () => { $('q').value = btn.dataset.query; searchBanks(); })
);

loadStats();
loadCities();
searchBanks();
