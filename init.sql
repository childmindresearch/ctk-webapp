-- Connect to database
\c ctk;
-- Create tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    is_admin BOOLEAN
);
CREATE TABLE referral_languages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);
CREATE TABLE referral_area_covered (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);
CREATE TABLE referral_services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);
CREATE TABLE referral_providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    address VARCHAR(255),
    phone VARCHAR(20),
    website VARCHAR(255),
    takes_insurance BOOLEAN,
    description TEXT
);
CREATE TABLE referral_presets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);
-- Create junction tables with CASCADE
CREATE TABLE providers_to_languages (
    provider_id INTEGER REFERENCES referral_providers(id) ON DELETE CASCADE,
    language_id INTEGER REFERENCES referral_languages(id) ON DELETE CASCADE,
    PRIMARY KEY (provider_id, language_id)
);
CREATE TABLE providers_to_areas_covered (
    provider_id INTEGER REFERENCES referral_providers(id) ON DELETE CASCADE,
    area_covered_id INTEGER REFERENCES referral_area_covered(id) ON DELETE CASCADE,
    PRIMARY KEY (provider_id, area_covered_id)
);
CREATE TABLE providers_to_services (
    provider_id INTEGER REFERENCES referral_providers(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES referral_services(id) ON DELETE CASCADE,
    PRIMARY KEY (provider_id, service_id)
);
CREATE TABLE presets_to_languages (
    preset_id INTEGER REFERENCES referral_presets(id) ON DELETE CASCADE,
    language_id INTEGER REFERENCES referral_languages(id) ON DELETE CASCADE,
    PRIMARY KEY (preset_id, language_id)
);
CREATE TABLE presets_to_areas_covered (
    preset_id INTEGER REFERENCES referral_presets(id) ON DELETE CASCADE,
    area_covered_id INTEGER REFERENCES referral_area_covered(id) ON DELETE CASCADE,
    PRIMARY KEY (preset_id, area_covered_id)
);
CREATE TABLE presets_to_services (
    preset_id INTEGER REFERENCES referral_presets(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES referral_services(id) ON DELETE CASCADE,
    PRIMARY KEY (preset_id, service_id)
);
-- Insert data
INSERT INTO users (email, is_admin) VALUES
    ('development.user.admin@example.com', true);
INSERT INTO referral_languages (name) VALUES
    ('English'),
    ('Spanish'),
    ('Mandarin'),
    ('Vietnamese');
INSERT INTO referral_area_covered (name) VALUES
    ('San Francisco'),
    ('Oakland'),
    ('San Jose'),
    ('Berkeley');
INSERT INTO referral_services (name) VALUES
    ('Individual Therapy'),
    ('Group Therapy'),
    ('Psychiatry'),
    ('Crisis Services');
INSERT INTO referral_providers (name, address, phone, website, takes_insurance, description) VALUES
    ('Bay Area Mental Health', '123 Main St, San Francisco, CA 94110', '(415) 555-0123', 'www.bamh.com', true, 'Comprehensive mental health services'),
    ('Oakland Wellness Center', '456 Oak St, Oakland, CA 94612', '(510) 555-0456', 'www.oaklandwellness.com', true, 'Holistic mental health care');
INSERT INTO referral_presets (name) VALUES
    ('Spanish Speaking Therapists'),
    ('Crisis Services in SF');
-- Insert junction table data
INSERT INTO providers_to_languages (provider_id, language_id) VALUES
    (1, 1), (1, 2), (2, 1), (2, 3);
INSERT INTO providers_to_areas_covered (provider_id, area_covered_id) VALUES
    (1, 1), (1, 2), (2, 2), (2, 4);
INSERT INTO providers_to_services (provider_id, service_id) VALUES
    (1, 1), (1, 2), (2, 1), (2, 3);
INSERT INTO presets_to_languages (preset_id, language_id) VALUES
    (1, 2), (2, 1);
INSERT INTO presets_to_areas_covered (preset_id, area_covered_id) VALUES
    (1, 1), (2, 1);
INSERT INTO presets_to_services (preset_id, service_id) VALUES
    (1, 1), (2, 4);
