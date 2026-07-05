-- Flyway Schema Migration: Initial Database Structure

CREATE TABLE contacts (
    id VARCHAR(36) PRIMARY KEY,
    contact_type VARCHAR(20) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(200),
    email_address VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    address_line1 VARCHAR(200) NOT NULL,
    address_line2 VARCHAR(200),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL
);

CREATE UNIQUE INDEX idx_contacts_email ON contacts(email_address);

CREATE TABLE vehicles (
    id VARCHAR(36) PRIMARY KEY,
    vin VARCHAR(17) NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    manufacture_year INT NOT NULL,
    license_plate VARCHAR(50),
    vehicle_type VARCHAR(50) NOT NULL,
    fuel_type VARCHAR(50) NOT NULL
);

CREATE UNIQUE INDEX idx_vehicles_vin ON vehicles(vin);

CREATE TABLE policies (
    id VARCHAR(36) PRIMARY KEY,
    policy_number VARCHAR(50) NOT NULL,
    contact_id VARCHAR(36) NOT NULL,
    vehicle_id VARCHAR(36) NOT NULL,
    policy_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    effective_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    cancellation_date DATE,
    cancellation_reason VARCHAR(255),
    previous_policy_id VARCHAR(36),
    CONSTRAINT fk_policies_contact FOREIGN KEY (contact_id) REFERENCES contacts(id),
    CONSTRAINT fk_policies_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

CREATE UNIQUE INDEX idx_policies_number ON policies(policy_number);
CREATE INDEX idx_policies_contact ON policies(contact_id);
CREATE INDEX idx_policies_vehicle ON policies(vehicle_id);

CREATE TABLE claims (
    id VARCHAR(36) PRIMARY KEY,
    claim_number VARCHAR(50) NOT NULL,
    policy_id VARCHAR(36) NOT NULL,
    loss_date DATE NOT NULL,
    reported_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    claim_type VARCHAR(50) NOT NULL,
    description VARCHAR(1000),
    CONSTRAINT fk_claims_policy FOREIGN KEY (policy_id) REFERENCES policies(id)
);

CREATE UNIQUE INDEX idx_claims_number ON claims(claim_number);
CREATE INDEX idx_claims_policy ON claims(policy_id);

CREATE TABLE policy_history (
    id VARCHAR(36) PRIMARY KEY,
    policy_id VARCHAR(36) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    description VARCHAR(1000),
    performed_by VARCHAR(100) NOT NULL,
    CONSTRAINT fk_policy_history_policy FOREIGN KEY (policy_id) REFERENCES policies(id)
);

CREATE INDEX idx_policy_history_policy ON policy_history(policy_id);

CREATE TABLE claim_history (
    id VARCHAR(36) PRIMARY KEY,
    claim_id VARCHAR(36) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    description VARCHAR(1000),
    performed_by VARCHAR(100) NOT NULL,
    CONSTRAINT fk_claim_history_claim FOREIGN KEY (claim_id) REFERENCES claims(id)
);

CREATE INDEX idx_claim_history_claim ON claim_history(claim_id);
