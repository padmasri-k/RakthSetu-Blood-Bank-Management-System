# RakthSetu — Blood Bank Management System

A complete college DBMS project website built from the supplied `blood-banks.csv` dataset.

## What is included now
- Responsive frontend website
- Flask/Python backend
- Your supplied 2,823-record dataset
- Dashboard statistics
- Blood-bank search
- State, category and city filters
- Blood-bank detail view
- Contact, service, licensing and nodal-officer information
- Location/map links using the latitude/longitude present in the dataset
- REST API endpoints used by the frontend

## Run
1. Install Python 3.10+.
2. Open this project folder in VS Code.
3. Open Terminal.
4. Run:
   `python -m venv venv`
5. Windows:
   `venv\\Scripts\\activate`
6. Install:
   `pip install -r requirements.txt`
7. Start:
   `python app.py`
8. Open:
   `http://127.0.0.1:5000`

## Important
The current application deliberately uses the supplied CSV as its backend data source. The SQL tables and ER diagram are a separate DBMS phase and can be added later without changing the website design.


## Updated donor and blood-group version

The website now uses the extended project dataset and displays:
- Donor name, age, gender, blood group and phone
- Blood-group filters
- Donor-gender filter
- Project-demo blood-group inventory and total units
- Separate donors.csv, donations.csv and blood_inventory.csv support files

The added donor/inventory/donation values are synthetic project-demo data because
the original source blood-bank directory did not contain donor or blood-stock data.
