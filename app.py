from flask import Flask, render_template, request, jsonify
import os, csv
from collections import Counter

app = Flask(__name__)
CSV_PATH = os.path.join(os.path.dirname(__file__), 'blood-banks.csv')


def load_data():
    with open(CSV_PATH, 'r', encoding='latin1', newline='') as f:
        reader = csv.DictReader(f)
        rows = []
        for r in reader:
            clean = {k.strip(): (v.strip() if isinstance(v, str) else v) for k, v in r.items()}
            rows.append(clean)
        return rows

DATA = load_data()


def val(row, key):
    return row.get(key, '') or ''


def card(row):
    return {
        'id': val(row, 'Sr No'),
        'name': val(row, 'Blood Bank Name'),
        'state': val(row, 'State'),
        'district': val(row, 'District'),
        'city': val(row, 'City'),
        'address': val(row, 'Address').replace('\r\n', ', ').replace('\n', ', '),
        'pincode': val(row, 'Pincode'),
        'contact': val(row, 'Contact No'),
        'mobile': val(row, 'Mobile'),
        'helpline': val(row, 'Helpline'),
        'email': val(row, 'Email'),
        'website': val(row, 'Website'),
        'officer': val(row, 'Nodal Officer'),
        'officer_contact': val(row, 'Contact Nodal Officer'),
        'officer_mobile': val(row, 'Mobile Nodal Officer'),
        'officer_email': val(row, 'Email Nodal Officer'),
        'qualification': val(row, 'Qualification Nodal Officer'),
        'category': val(row, 'Category'),
        'components': val(row, 'Blood Component Available'),
        'apheresis': val(row, 'Apheresis'),
        'service_time': val(row, 'Service Time'),
        'license': val(row, 'License #'),
        'license_date': val(row, 'Date License Obtained'),
        'renewal_date': val(row, 'Date of Renewal'),
        'latitude': val(row, 'Latitude'),
        'longitude': val(row, 'Longitude')
    }


@app.route('/')
def index():
    states = sorted({val(r, 'State') for r in DATA if val(r, 'State')})
    categories = sorted({val(r, 'Category') for r in DATA if val(r, 'Category')})
    return render_template('index.html', total=len(DATA), states=states, categories=categories)


@app.route('/api/stats')
def stats():
    states = {val(r, 'State') for r in DATA if val(r, 'State')}
    cities = {val(r, 'City') for r in DATA if val(r, 'City')}
    government = sum(1 for r in DATA if val(r, 'Category').lower() == 'government')
    component = sum(1 for r in DATA if val(r, 'Blood Component Available').upper() == 'YES')
    return jsonify({'total': len(DATA), 'states': len(states), 'cities': len(cities), 'government': government, 'component': component})


@app.route('/api/search')
def search():
    q = request.args.get('q', '').strip().lower()
    state = request.args.get('state', '').strip().lower()
    category = request.args.get('category', '').strip().lower()
    city = request.args.get('city', '').strip().lower()
    try:
        limit = min(max(int(request.args.get('limit', 100)), 1), 500)
    except ValueError:
        limit = 100
    results = []
    for r in DATA:
        if state and val(r, 'State').lower() != state:
            continue
        if category and val(r, 'Category').lower() != category:
            continue
        if city and val(r, 'City').lower() != city:
            continue
        if q:
            hay = ' '.join(str(v or '') for v in r.values()).lower()
            if q not in hay:
                continue
        results.append(card(r))
        if len(results) >= limit:
            break
    return jsonify({'results': results, 'count': len(results)})


@app.route('/api/blood-banks/<int:bank_id>')
def detail(bank_id):
    for r in DATA:
        try:
            if int(float(val(r, 'Sr No'))) == bank_id:
                return jsonify(card(r))
        except ValueError:
            pass
    return jsonify({'error': 'Blood bank not found'}), 404


@app.route('/api/cities')
def cities():
    state = request.args.get('state', '').strip().lower()
    cities = sorted({val(r, 'City') for r in DATA if (not state or val(r, 'State').lower() == state) and val(r, 'City')})
    return jsonify(cities)


@app.route('/api/map')
def map_data():
    results = []
    for r in DATA:
        try:
            lat, lon = float(val(r, 'Latitude')), float(val(r, 'Longitude'))
            results.append({'id': val(r, 'Sr No'), 'name': val(r, 'Blood Bank Name'), 'city': val(r, 'City'), 'state': val(r, 'State'), 'lat': lat, 'lon': lon})
        except (ValueError, TypeError):
            continue
    return jsonify(results[:1000])


if __name__ == '__main__':
  app.run(host="0.0.0.0", port=5000, debug=True)
