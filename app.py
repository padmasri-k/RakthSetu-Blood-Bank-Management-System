from flask import Flask, render_template, request, jsonify
import os, csv

app = Flask(__name__)
CSV_PATH = os.path.join(os.path.dirname(__file__), 'blood-banks.csv')


def load_data():
    with open(CSV_PATH, 'r', encoding='utf-8-sig', newline='') as f:
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
    blood_groups = val(row, 'Blood Groups Available (Project Demo)')
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
        'longitude': val(row, 'Longitude'),
        'donor_name': val(row, 'Donor Name (Project Demo)'),
        'donor_age': val(row, 'Donor Age (Project Demo)'),
        'donor_gender': val(row, 'Donor Gender (Project Demo)'),
        'donor_blood_group': val(row, 'Donor Blood Group (Project Demo)'),
        'donor_phone': val(row, 'Donor Phone (Project Demo)'),
        'blood_groups': blood_groups,
        'a_pos': val(row, 'A+ Units (Project Demo)'),
        'a_neg': val(row, 'A- Units (Project Demo)'),
        'b_pos': val(row, 'B+ Units (Project Demo)'),
        'b_neg': val(row, 'B- Units (Project Demo)'),
        'o_pos': val(row, 'O+ Units (Project Demo)'),
        'o_neg': val(row, 'O- Units (Project Demo)'),
        'ab_pos': val(row, 'AB+ Units (Project Demo)'),
        'ab_neg': val(row, 'AB- Units (Project Demo)'),
        'total_units': val(row, 'Total Units Available (Project Demo)')
    }


@app.route('/')
def index():
    states = sorted({val(r, 'State') for r in DATA if val(r, 'State')})
    categories = sorted({val(r, 'Category') for r in DATA if val(r, 'Category')})
    blood_groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
    genders = ['Male', 'Female']
    return render_template(
        'index.html',
        total=len(DATA),
        states=states,
        categories=categories,
        blood_groups=blood_groups,
        genders=genders
    )


@app.route('/api/stats')
def stats():
    states = {val(r, 'State') for r in DATA if val(r, 'State')}
    cities = {val(r, 'City') for r in DATA if val(r, 'City')}
    government = sum(1 for r in DATA if val(r, 'Category').lower() == 'government')
    component = sum(1 for r in DATA if val(r, 'Blood Component Available').upper() == 'YES')
    total_units = sum(int(float(val(r, 'Total Units Available (Project Demo)') or 0)) for r in DATA)
    donors = len({val(r, 'Donor Name (Project Demo)') for r in DATA if val(r, 'Donor Name (Project Demo)')})
    return jsonify({
        'total': len(DATA),
        'states': len(states),
        'cities': len(cities),
        'government': government,
        'component': component,
        'donors': donors,
        'units': total_units
    })


@app.route('/api/search')
def search():
    q = request.args.get('q', '').strip().lower()
    state = request.args.get('state', '').strip().lower()
    category = request.args.get('category', '').strip().lower()
    city = request.args.get('city', '').strip().lower()
    blood_group = request.args.get('blood_group', '').strip().lower()
    gender = request.args.get('gender', '').strip().lower()

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
        if blood_group and val(r, 'Donor Blood Group (Project Demo)').lower() != blood_group:
            continue
        if gender and val(r, 'Donor Gender (Project Demo)').lower() != gender:
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
        except (ValueError, TypeError):
            pass
    return jsonify({'error': 'Blood bank not found'}), 404


@app.route('/api/cities')
def cities():
    state = request.args.get('state', '').strip().lower()
    cities = sorted({
        val(r, 'City') for r in DATA
        if (not state or val(r, 'State').lower() == state) and val(r, 'City')
    })
    return jsonify(cities)


@app.route('/api/map')
def map_data():
    results = []
    for r in DATA:
        try:
            lat, lon = float(val(r, 'Latitude')), float(val(r, 'Longitude'))
            results.append({
                'id': val(r, 'Sr No'),
                'name': val(r, 'Blood Bank Name'),
                'city': val(r, 'City'),
                'state': val(r, 'State'),
                'lat': lat,
                'lon': lon
            })
        except (ValueError, TypeError):
            continue
    return jsonify(results[:1000])


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
