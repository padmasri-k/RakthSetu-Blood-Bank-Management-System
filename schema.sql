CREATE DATABASE IF NOT EXISTS blood_bank_db;
USE blood_bank_db;

CREATE TABLE blood_bank (
    blood_bank_id INT PRIMARY KEY,
    blood_bank_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    blood_component_available VARCHAR(10),
    apheresis VARCHAR(10),
    service_time VARCHAR(50),
    license_no VARCHAR(100),
    license_date VARCHAR(50),
    renewal_date VARCHAR(50)
);

CREATE TABLE location (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    blood_bank_id INT NOT NULL,
    state VARCHAR(150),
    district VARCHAR(150),
    city VARCHAR(150),
    address TEXT,
    pincode VARCHAR(20),
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    FOREIGN KEY (blood_bank_id) REFERENCES blood_bank(blood_bank_id) ON DELETE CASCADE
);

CREATE TABLE contact (
    contact_id INT AUTO_INCREMENT PRIMARY KEY,
    blood_bank_id INT NOT NULL,
    contact_no VARCHAR(100),
    mobile VARCHAR(100),
    helpline VARCHAR(100),
    fax VARCHAR(100),
    email VARCHAR(255),
    website VARCHAR(255),
    FOREIGN KEY (blood_bank_id) REFERENCES blood_bank(blood_bank_id) ON DELETE CASCADE
);

CREATE TABLE nodal_officer (
    officer_id INT AUTO_INCREMENT PRIMARY KEY,
    blood_bank_id INT NOT NULL,
    officer_name VARCHAR(255),
    officer_contact VARCHAR(100),
    officer_mobile VARCHAR(100),
    officer_email VARCHAR(255),
    qualification VARCHAR(255),
    FOREIGN KEY (blood_bank_id) REFERENCES blood_bank(blood_bank_id) ON DELETE CASCADE
);

CREATE TABLE blood_component (
    component_id INT AUTO_INCREMENT PRIMARY KEY,
    blood_bank_id INT NOT NULL,
    component_name VARCHAR(100),
    available VARCHAR(10),
    FOREIGN KEY (blood_bank_id) REFERENCES blood_bank(blood_bank_id) ON DELETE CASCADE
);

CREATE INDEX idx_bank_state ON location(state);
CREATE INDEX idx_bank_city ON location(city);
CREATE INDEX idx_bank_category ON blood_bank(category);
