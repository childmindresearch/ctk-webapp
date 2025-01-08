CREATE DATABASE ctk;
\c ctk;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    is_admin BOOLEAN
);

CREATE TABLE dsm_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(255) NOT NULL,
    label VARCHAR(255) NOT NULL
);

CREATE TABLE templates (
    id SERIAL PRIMARY KEY ,
    text VARCHAR(10000) NOT NULL,
    parent_id INTEGER,
    priority INTEGER NOT NULL
);

INSERT INTO users (email, is_admin) VALUES
    ('development.user.admin@example.com', true);

INSERT INTO dsm_codes (code, label) VALUES
    ('304.30/F12.20', 'Severe Cannabis Use Disorder'),
    ('300.23/F40.10', 'Social Anxiety Disorder');

INSERT INTO templates (id, text, parent_id, priority) VALUES
    (1, 'Root', NULL, 0),
    (2, 'Directory', 1, 0),
    (3, 'Leaf', 2, 0);
