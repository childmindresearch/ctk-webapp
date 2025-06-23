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
    id SERIAL PRIMARY KEY,
    text VARCHAR(10000) NOT NULL,
    parent_id INTEGER,
    priority INTEGER NOT NULL
);


-- Create function to set priority
CREATE OR REPLACE FUNCTION set_template_priority()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set priority if it's NULL
    IF NEW.priority IS NULL THEN
        NEW.priority := COALESCE((SELECT MAX(priority) FROM templates), 0) + 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_set_template_priority
    BEFORE INSERT ON templates
    FOR EACH ROW
    EXECUTE FUNCTION set_template_priority();


-- Insert admin user
INSERT INTO users (email, is_admin) VALUES
    ('development.user.admin@example.com', true);

-- Insert comprehensive DSM-5 codes organized by category
INSERT INTO dsm_codes (code, label) VALUES
    -- Neurodevelopmental Disorders
    ('314.01/F90.2', 'Attention-Deficit/Hyperactivity Disorder, Combined presentation'),
    ('314.00/F90.0', 'Attention-Deficit/Hyperactivity Disorder, Predominantly inattentive presentation'),
    ('314.01/F90.1', 'Attention-Deficit/Hyperactivity Disorder, Predominantly hyperactive/impulsive presentation'),
    ('299.00/F84.0', 'Autism Spectrum Disorder'),
    ('315.00/F80.9', 'Language Disorder'),
    ('315.39/F80.0', 'Speech Sound Disorder'),

    -- Schizophrenia Spectrum and Other Psychotic Disorders
    ('295.90/F20.9', 'Schizophrenia'),
    ('297.1/F22', 'Delusional Disorder'),
    ('298.8/F23', 'Brief Psychotic Disorder'),
    ('295.70/F25.1', 'Schizoaffective Disorder, Depressive type'),
    ('295.70/F25.0', 'Schizoaffective Disorder, Bipolar type'),

    -- Bipolar and Related Disorders
    ('296.41/F31.11', 'Bipolar I Disorder, Most recent episode manic, Mild'),
    ('296.42/F31.12', 'Bipolar I Disorder, Most recent episode manic, Moderate'),
    ('296.43/F31.13', 'Bipolar I Disorder, Most recent episode manic, Severe'),
    ('296.89/F31.81', 'Bipolar II Disorder'),
    ('301.13/F34.0', 'Cyclothymic Disorder'),

    -- Depressive Disorders
    ('296.21/F32.0', 'Major Depressive Disorder, Single episode, Mild'),
    ('296.22/F32.1', 'Major Depressive Disorder, Single episode, Moderate'),
    ('296.23/F32.2', 'Major Depressive Disorder, Single episode, Severe'),
    ('296.31/F33.0', 'Major Depressive Disorder, Recurrent episode, Mild'),
    ('296.32/F33.1', 'Major Depressive Disorder, Recurrent episode, Moderate'),
    ('296.33/F33.2', 'Major Depressive Disorder, Recurrent episode, Severe'),
    ('300.4/F34.1', 'Persistent Depressive Disorder (Dysthymia)'),

    -- Anxiety Disorders
    ('309.21/F93.0', 'Separation Anxiety Disorder'),
    ('312.23/F94.0', 'Selective Mutism'),
    ('300.29/F40.218', 'Specific Phobia, Animal'),
    ('300.29/F40.228', 'Specific Phobia, Natural environment'),
    ('300.29/F40.233', 'Specific Phobia, Blood-injection-injury'),
    ('300.23/F40.10', 'Social Anxiety Disorder'),
    ('300.01/F41.0', 'Panic Disorder'),
    ('300.22/F40.00', 'Agoraphobia'),
    ('300.02/F41.1', 'Generalized Anxiety Disorder'),

    -- Obsessive-Compulsive and Related Disorders
    ('300.3/F42.2', 'Obsessive-Compulsive Disorder'),
    ('300.7/F45.22', 'Body Dysmorphic Disorder'),
    ('300.3/F42.3', 'Hoarding Disorder'),
    ('312.39/F63.3', 'Trichotillomania (Hair-Pulling Disorder)'),
    ('698.4/L98.1', 'Excoriation (Skin-Picking) Disorder'),

    -- Trauma- and Stressor-Related Disorders
    ('309.81/F43.10', 'Posttraumatic Stress Disorder'),
    ('308.3/F43.0', 'Acute Stress Disorder'),
    ('309.0/F43.21', 'Adjustment Disorders with Depressed Mood'),
    ('309.24/F43.22', 'Adjustment Disorders with Anxiety'),
    ('309.28/F43.23', 'Adjustment Disorders with Mixed Anxiety and Depressed Mood'),

    -- Dissociative Disorders
    ('300.14/F44.81', 'Dissociative Identity Disorder'),
    ('300.12/F44.0', 'Dissociative Amnesia'),
    ('300.6/F48.1', 'Depersonalization/Derealization Disorder'),

    -- Somatic Symptom and Related Disorders
    ('300.82/F45.1', 'Somatic Symptom Disorder'),
    ('300.7/F45.21', 'Illness Anxiety Disorder'),
    ('300.11/F44.4', 'Conversion Disorder (Functional Neurological Symptom Disorder)'),

    -- Feeding and Eating Disorders
    ('307.1/F50.02', 'Anorexia Nervosa, Binge-eating/purging type'),
    ('307.51/F50.2', 'Bulimia Nervosa'),
    ('307.51/F50.81', 'Binge-Eating Disorder'),
    ('307.52/F50.82', 'Avoidant/Restrictive Food Intake Disorder'),

    -- Sleep-Wake Disorders
    ('780.52/G47.00', 'Insomnia Disorder'),
    ('780.54/G47.10', 'Hypersomnolence Disorder'),
    ('347.00/G47.419', 'Narcolepsy'),
    ('780.57/G47.31', 'Central Sleep Apnea'),

    -- Sexual Dysfunctions
    ('302.71/F52.0', 'Male Hypoactive Sexual Desire Disorder'),
    ('302.72/F52.22', 'Female Sexual Interest/Arousal Disorder'),
    ('302.74/F52.31', 'Female Orgasmic Disorder'),
    ('302.75/F52.32', 'Delayed Ejaculation'),

    -- Gender Dysphoria
    ('302.6/F64.2', 'Gender Dysphoria in Children'),
    ('302.85/F64.1', 'Gender Dysphoria in Adolescents and Adults'),

    -- Disruptive, Impulse-Control, and Conduct Disorders
    ('312.34/F63.81', 'Intermittent Explosive Disorder'),
    ('312.81/F91.1', 'Conduct Disorder, Childhood-onset type'),
    ('312.82/F91.2', 'Conduct Disorder, Adolescent-onset type'),
    ('301.7/F60.2', 'Antisocial Personality Disorder'),
    ('312.33/F63.2', 'Kleptomania'),
    ('312.31/F63.0', 'Pathological Gambling'),

    -- Substance-Related and Addictive Disorders
    ('305.00/F10.10', 'Alcohol Use Disorder, Mild'),
    ('303.90/F10.20', 'Alcohol Use Disorder, Moderate'),
    ('303.90/F10.20', 'Alcohol Use Disorder, Severe'),
    ('304.30/F12.20', 'Cannabis Use Disorder, Moderate'),
    ('304.30/F12.20', 'Cannabis Use Disorder, Severe'),
    ('304.40/F14.20', 'Cocaine Use Disorder, Moderate'),
    ('304.40/F14.20', 'Cocaine Use Disorder, Severe'),
    ('304.00/F11.20', 'Opioid Use Disorder, Moderate'),
    ('304.00/F11.20', 'Opioid Use Disorder, Severe'),
    ('304.10/F15.20', 'Stimulant Use Disorder, Moderate'),
    ('304.10/F15.20', 'Stimulant Use Disorder, Severe'),

    -- Neurocognitive Disorders
    ('331.0/G30.9', 'Major Neurocognitive Disorder Due to Alzheimer''s Disease'),
    ('290.40/F03.90', 'Major Neurocognitive Disorder Due to Vascular Disease'),
    ('331.83/G31.84', 'Major Neurocognitive Disorder with Lewy Bodies'),
    ('331.19/G31.09', 'Major Neurocognitive Disorder Due to Frontotemporal Lobar Degeneration'),
    ('331.82/G31.83', 'Major Neurocognitive Disorder Due to Huntington''s Disease'),

    -- Personality Disorders
    ('301.0/F60.0', 'Paranoid Personality Disorder'),
    ('301.20/F60.1', 'Schizoid Personality Disorder'),
    ('301.22/F21', 'Schizotypal Personality Disorder'),
    ('301.83/F60.3', 'Borderline Personality Disorder'),
    ('301.50/F60.4', 'Histrionic Personality Disorder'),
    ('301.81/F60.81', 'Narcissistic Personality Disorder'),
    ('301.82/F60.6', 'Avoidant Personality Disorder'),
    ('301.6/F60.7', 'Dependent Personality Disorder'),
    ('301.4/F60.5', 'Obsessive-Compulsive Personality Disorder');

-- Insert comprehensive template hierarchy
INSERT INTO templates (id, text, parent_id, priority) VALUES
    -- Root level
    (1, 'Clinical Assessment Templates', NULL, 0),

    -- Main categories
    (10, 'Initial Assessment', 1, 10),
    (20, 'Progress Notes', 1, 20),
    (30, 'Treatment Plans', 1, 30),
    (40, 'Discharge Planning', 1, 40),
    (50, 'Crisis Intervention', 1, 50),
    (60, 'Specialized Assessments', 1, 60),

    -- Initial Assessment subcategories
    (101, 'Adult Initial Assessment', 10, 10),
    (102, 'Child/Adolescent Initial Assessment', 10, 20),
    (103, 'Couples Assessment', 10, 30),
    (104, 'Family Assessment', 10, 40),
    (105, 'Group Assessment', 10, 50),

    -- Progress Notes subcategories
    (201, 'Individual Therapy Progress Note', 20, 10),
    (202, 'Group Therapy Progress Note', 20, 20),
    (203, 'Family Therapy Progress Note', 20, 30),
    (204, 'Medication Management Note', 20, 40),
    (205, 'Case Management Note', 20, 50),

    -- Treatment Plans subcategories
    (301, 'Individual Treatment Plan', 30, 10),
    (302, 'Group Treatment Plan', 30, 20),
    (303, 'Family Treatment Plan', 30, 30),
    (304, 'Crisis Treatment Plan', 30, 40),
    (305, 'Substance Abuse Treatment Plan', 30, 50),

    -- Discharge Planning subcategories
    (401, 'Discharge Summary', 40, 10),
    (402, 'Aftercare Plan', 40, 20),
    (403, 'Referral Summary', 40, 30),
    (404, 'Treatment Completion Summary', 40, 40),

    -- Crisis Intervention subcategories
    (501, 'Crisis Assessment', 50, 10),
    (502, 'Safety Plan', 50, 20),
    (503, 'Risk Assessment', 50, 30),
    (504, 'Emergency Contact Plan', 50, 40),

    -- Specialized Assessments subcategories
    (601, 'Substance Abuse Assessment', 60, 10),
    (602, 'Trauma Assessment', 60, 20),
    (603, 'Cognitive Assessment', 60, 30),
    (604, 'Mood Assessment', 60, 40),
    (605, 'Anxiety Assessment', 60, 50),
    (606, 'Personality Assessment', 60, 60),

    -- Detailed templates for Adult Initial Assessment
    (1011, 'Presenting Problem', 101, 10),
    (1012, 'History of Present Illness', 101, 20),
    (1013, 'Past Psychiatric History', 101, 30),
    (1014, 'Medical History', 101, 40),
    (1015, 'Social History', 101, 50),
    (1016, 'Family History', 101, 60),
    (1017, 'Mental Status Examination', 101, 70),
    (1018, 'Risk Assessment', 101, 80),
    (1019, 'Diagnostic Impression', 101, 90),
    (1020, 'Treatment Recommendations', 101, 100),

    -- Detailed templates for Child/Adolescent Initial Assessment
    (1021, 'Developmental History', 102, 10),
    (1022, 'School History', 102, 20),
    (1023, 'Behavioral Observations', 102, 30),
    (1024, 'Family Dynamics', 102, 40),
    (1025, 'Peer Relationships', 102, 50),

    -- Detailed templates for Individual Therapy Progress Note
    (2011, 'Session Objectives', 201, 10),
    (2012, 'Interventions Used', 201, 20),
    (2013, 'Client Response', 201, 30),
    (2014, 'Progress Toward Goals', 201, 40),
    (2015, 'Homework Assignments', 201, 50),
    (2016, 'Plan for Next Session', 201, 60),

    -- Detailed templates for Individual Treatment Plan
    (3011, 'Problem Statement', 301, 10),
    (3012, 'Long-term Goals', 301, 20),
    (3013, 'Short-term Objectives', 301, 30),
    (3014, 'Interventions', 301, 40),
    (3015, 'Target Dates', 301, 50),
    (3016, 'Responsible Party', 301, 60),
    (3017, 'Frequency of Services', 301, 70),

    -- Detailed templates for Crisis Assessment
    (5011, 'Precipitating Events', 501, 10),
    (5012, 'Current Mental Status', 501, 20),
    (5013, 'Suicide Risk Assessment', 501, 30),
    (5014, 'Homicide Risk Assessment', 501, 40),
    (5015, 'Support System', 501, 50),
    (5016, 'Coping Resources', 501, 60),
    (5017, 'Level of Care Needed', 501, 70),

    -- Detailed templates for Substance Abuse Assessment
    (6011, 'Substance Use History', 601, 10),
    (6012, 'Pattern of Use', 601, 20),
    (6013, 'Consequences of Use', 601, 30),
    (6014, 'Withdrawal History', 601, 40),
    (6015, 'Treatment History', 601, 50),
    (6016, 'Motivation for Change', 601, 60),
    (6017, 'Support System', 601, 70),

    -- Leaf templates with actual content
    (10111, 'Chief complaint and reason for seeking treatment at this time. Include duration and severity of symptoms.', 1011, 10),
    (10121, 'Detailed description of current symptoms including onset, duration, frequency, intensity, and impact on functioning.', 1012, 10),
    (10131, 'Previous psychiatric diagnoses, hospitalizations, therapy, and medication trials. Include response to treatment.', 1013, 10),
    (10141, 'Current medical conditions, medications, allergies, and recent medical care.', 1014, 10),
    (10151, 'Education, employment, relationships, living situation, legal issues, and substance use history.', 1015, 10),
    (10161, 'Family history of mental illness, substance abuse, suicide, and medical conditions.', 1016, 10),
    (10171, 'Appearance, behavior, speech, mood, affect, thought process, thought content, perception, cognition, insight, and judgment.', 1017, 10),
    (10181, 'Suicidal ideation, plan, intent, means, protective factors. Homicidal ideation. History of violence.', 1018, 10),
    (10191, 'Primary diagnosis with DSM-5 code. Rule-out diagnoses. Medical conditions. Psychosocial stressors.', 1019, 10),
    (10201, 'Recommended level of care, frequency of sessions, treatment modalities, and referrals.', 1020, 10),

    (20111, 'What were the main goals and objectives for this session?', 2011, 10),
    (20121, 'What therapeutic techniques and interventions were utilized during the session?', 2012, 10),
    (20131, 'How did the client respond to interventions? What was their engagement level?', 2013, 10),
    (20141, 'What progress has been made toward treatment goals since the last session?', 2014, 10),
    (20151, 'What assignments or activities were given to the client to complete before the next session?', 2015, 10),
    (20161, 'What are the planned interventions and focus areas for the next session?', 2016, 10),

    (30111, 'Clear, specific, and measurable statement of the problem to be addressed.', 3011, 10),
    (30121, 'Broad, overarching goals that the client hopes to achieve through treatment.', 3012, 10),
    (30131, 'Specific, measurable, achievable, relevant, and time-bound objectives.', 3013, 10),
    (30141, 'Evidence-based therapeutic techniques and approaches to be used.', 3014, 10),
    (30151, 'Realistic timeframes for achieving each objective and overall goals.', 3015, 10),
    (30161, 'Who will be responsible for implementing each intervention (therapist, client, family, etc.).', 3016, 10),
    (30171, 'How often services will be provided (weekly, bi-weekly, monthly, etc.).', 3017, 10),

    (50111, 'What events or circumstances led to the current crisis situation?', 5011, 10),
    (50121, 'Current presentation including mood, affect, thought process, and reality testing.', 5012, 10),
    (50131, 'Ideation, plan, intent, means, previous attempts, protective factors, risk level.', 5013, 10),
    (50141, 'Thoughts of harming others, history of violence, access to weapons, risk level.', 5014, 10),
    (50151, 'Available family, friends, and professional supports. Quality of relationships.', 5015, 10),
    (50161, 'Client''s usual coping strategies and current ability to utilize them effectively.', 5016, 10),
    (50171, 'Recommended level of care: outpatient, intensive outpatient, inpatient, etc.', 5017, 10),

    (60111, 'Types of substances used, age of first use, progression of use over time.', 6011, 10),
    (60121, 'Frequency, quantity, method of use, and times of day when substances are used.', 6012, 10),
    (60131, 'Physical, psychological, social, legal, and occupational consequences of substance use.', 6013, 10),
    (60141, 'History of withdrawal symptoms and need for medical supervision during detox.', 6014, 10),
    (60151, 'Previous treatment attempts including detox, rehab, therapy, and self-help groups.', 6015, 10),
    (60161, 'Client''s readiness for change and commitment to recovery process.', 6016, 10),
    (60171, 'Family and social supports for recovery. Triggers and high-risk situations.', 6017, 10);

-- Set the sequence to continue from where we left off
SELECT setval('templates_id_seq', 70000);
