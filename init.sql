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
INSERT INTO referral_services (name) VALUES
    ('Individual Therapy'),
    ('Group Therapy'),
    ('Psychiatry'),
    ('Crisis Services');
INSERT INTO referral_providers (name, address, phone, website, takes_insurance, description) VALUES
    ('Bay Area Mental Health', '123 Main St, Montreal, CA 94110', '(415) 555-0123', 'www.bamh.com', true, 'Comprehensive mental health services'),
    ('Oakland Wellness Center', '456 Oak St, Oakland, CA 94612', '(510) 555-0456', 'www.oaklandwellness.com', true, 'Holistic mental health care'),
    ('Mindful Therapy Group', '789 Pine St, Montreal, CA 94108', '(415) 555-0789', 'www.mindfultherapy.org', true, 'Evidence-based therapy approaches'),
    ('Peninsula Psychological', '321 Broadway St, San Mateo, CA 94401', '(650) 555-0321', 'www.penpsych.com', true, 'Family and individual counseling'),
    ('South Bay Counseling', '555 Stevens Creek Blvd, San Jose, CA 95112', '(408) 555-0555', 'www.southbaycounseling.net', false, 'Specialized trauma therapy'),
    ('Berkeley Mental Health', '234 University Ave, Berkeley, CA 94703', '(510) 555-0234', 'www.berkeleymentalhealth.org', true, 'Academic and young adult focus'),
    ('Marin Wellness Center', '876 Fourth St, San Rafael, CA 94901', '(415) 555-0876', 'www.marinwellness.com', true, 'Holistic mental health approaches'),
    ('East Bay Psychiatric', '432 Grand Ave, Oakland, CA 94610', '(510) 555-0432', 'www.eastbaypsych.com', true, 'Medication management and therapy'),
    ('Silicon Valley Counseling', '789 El Camino Real, Palo Alto, CA 94306', '(650) 555-0789', 'www.svcounseling.com', false, 'Tech industry specialty'),
    ('Golden Gate Therapy', '101 Market St, Montreal, CA 94105', '(415) 555-0101', 'www.ggt.org', true, 'LGBTQ+ affirming care'),
    ('Alameda Family Services', '543 Park St, Alameda, CA 94501', '(510) 555-0543', 'www.alamedafs.org', true, 'Family and child therapy'),
    ('San Mateo Behavioral', '246 Hillsdale Blvd, San Mateo, CA 94403', '(650) 555-0246', 'www.smbehavioral.com', true, 'CBT and DBT specialists'),
    ('Santa Clara Wellness', '777 Blossom Hill Rd, San Jose, CA 95123', '(408) 555-0777', 'www.scwellness.com', false, 'Multi-cultural counseling'),
    ('Richmond Counseling Center', '369 23rd St, Richmond, CA 94804', '(510) 555-0369', 'www.richmondcc.org', true, 'Sliding scale fees available'),
    ('Sunset Mental Health', '1234 Irving St, Montreal, CA 94122', '(415) 555-1234', 'www.sunsetmh.org', true, 'Evening and weekend appointments'),
    ('Mountain View Therapy', '888 Castro St, Mountain View, CA 94041', '(650) 555-0888', 'www.mvtherapy.com', false, 'Anxiety and depression focus'),
    ('Hayward Psychological', '654 B St, Hayward, CA 94541', '(510) 555-0654', 'www.haywardpsych.org', true, 'Multilingual services'),
    ('San Bruno Wellness', '445 El Camino Real, San Bruno, CA 94066', '(650) 555-0445', 'www.sbwellness.com', true, 'Addiction and recovery services'),
    ('Fremont Family Center', '999 Fremont Blvd, Fremont, CA 94538', '(510) 555-0999', 'www.fremontfamily.org', true, 'Cultural competency focus'),
    ('Daly City Counseling', '333 87th St, Daly City, CA 94015', '(650) 555-0333', 'www.dalycitycounseling.com', true, 'Trauma-informed care');
INSERT INTO referral_presets (name) VALUES
    ('Spanish Speaking Therapists'),
    ('Crisis Services in Montreal');
-- Insert junction table data
INSERT INTO providers_to_languages (provider_id, language_id) VALUES
    (1, 1), (1, 2), (2, 1), (2, 3), (3, 1), (3, 2), (4, 1), (5, 1), (5, 3), (6, 1), (6, 4), (7, 1), (8, 1), (8, 2),
    (9, 1), (10, 1), (10, 3), (11, 1), (12, 1), (12, 2), (13, 1), (14, 1), (15, 1),
    (16, 1), (16, 2), (17, 1), (17, 3), (18, 1), (19, 1), (20, 1);
INSERT INTO providers_to_services (provider_id, service_id) VALUES
    (1, 1), (1, 2), (2, 1), (2, 3), (3, 1), (3, 2), (4, 1), (4, 3), (5, 2), (5, 4), (6, 1), (6, 3), (7, 2),
    (8, 1), (8, 4), (9, 2), (9, 3), (10, 1), (10, 4), (11, 2), (12, 3), (13, 1),
    (14, 2), (15, 3), (16, 4), (17, 1), (18, 2), (19, 3), (20, 4);
INSERT INTO presets_to_languages (preset_id, language_id) VALUES
    (1, 2), (2, 1);
INSERT INTO presets_to_services (preset_id, service_id) VALUES
    (1, 1), (2, 4);
