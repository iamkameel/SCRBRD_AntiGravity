-- SCRBRD Schema V4: 13-Layer SQL Model
-- Extracted from ChatGPT share link: https://chatgpt.com/share/69ac1995-0b14-800b-a4b2-77f3ab3a8af1
-- Date: 2026-03-07

-- 1) Core Identity Layer
CREATE TABLE persons (
    person_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    preferred_name TEXT,
    date_of_birth DATE,
    gender TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    profile_image_url TEXT,
    biography TEXT,
    dominant_hand TEXT, -- 'Right', 'Left', 'Ambidextrous'
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE person_addresses (
    address_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES persons(person_id),
    address_type TEXT, -- 'Home', 'Work', 'Postal'
    line_1 TEXT,
    line_2 TEXT,
    suburb TEXT,
    city TEXT,
    province TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'South Africa'
);

CREATE TABLE person_emergency_contacts (
    emergency_contact_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES persons(person_id),
    contact_name TEXT NOT NULL,
    relationship TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    notes TEXT
);

CREATE TABLE person_documents (
    document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES persons(person_id),
    document_type TEXT, -- 'ID', 'Passport', 'License', 'Certificate'
    file_url TEXT NOT NULL,
    issued_on DATE,
    expires_on DATE,
    verified_by_person_id UUID REFERENCES persons(person_id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2) Organisations and School Structure
CREATE TABLE organisations (
    organisation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_type TEXT, -- 'School', 'Club', 'Academy', 'League', 'Governing Body'
    name TEXT NOT NULL,
    short_name TEXT,
    slug TEXT UNIQUE,
    logo_url TEXT,
    primary_colour TEXT,
    secondary_colour TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    website_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE venues (
    venue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(organisation_id),
    name TEXT NOT NULL,
    venue_type TEXT, -- 'Main Ground', 'Indoor Centre', 'Satellite Field'
    address_line_1 TEXT,
    suburb TEXT,
    city TEXT,
    province TEXT,
    country TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    timezone TEXT DEFAULT 'Africa/Johannesburg',
    notes TEXT
);

CREATE TABLE fields (
    field_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES venues(venue_id),
    name TEXT NOT NULL, -- 'A Field', 'Nets 1-4'
    field_type TEXT, -- 'Oval', 'Nets', 'Indoor'
    pitch_type TEXT, -- 'Turf', 'Astro', 'Concrete', 'Matting'
    boundary_length_m INTEGER,
    ends_json JSONB, -- {'North End': 'Pavilion End', 'South End': 'Forest End'}
    status TEXT DEFAULT 'available',
    notes TEXT
);

-- 3) Season, Competition and Team Hierarchy
CREATE TABLE seasons (
    season_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- '2025/26 Summer'
    sport TEXT DEFAULT 'Cricket',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE age_divisions (
    age_division_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport TEXT DEFAULT 'Cricket',
    name TEXT NOT NULL, -- 'U19', 'Open', 'U15'
    min_age INTEGER,
    max_age INTEGER,
    sort_order INTEGER
);

CREATE TABLE team_classes (
    team_class_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport TEXT DEFAULT 'Cricket',
    code TEXT NOT NULL, -- '1ST', '2ND', 'A', 'B'
    label TEXT NOT NULL,
    sort_order INTEGER
);

CREATE TABLE teams (
    team_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(organisation_id),
    season_id UUID NOT NULL REFERENCES seasons(season_id),
    sport TEXT DEFAULT 'Cricket',
    age_division_id UUID NOT NULL REFERENCES age_divisions(age_division_id),
    team_class_id UUID NOT NULL REFERENCES team_classes(team_class_id),
    gender_category TEXT, -- 'Male', 'Female', 'Mixed'
    name TEXT NOT NULL,
    display_name TEXT,
    short_name TEXT,
    team_colour_primary TEXT,
    team_colour_secondary TEXT,
    logo_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE competitions (
    competition_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    season_id UUID NOT NULL REFERENCES seasons(season_id),
    organisation_id UUID REFERENCES organisations(organisation_id),
    sport TEXT DEFAULT 'Cricket',
    name TEXT NOT NULL,
    competition_type TEXT, -- 'League', 'Knockout', 'Tournament'
    format TEXT, -- 'T20', '50-Over', 'Time-Cricket'
    overs_per_innings INTEGER,
    balls_per_over INTEGER DEFAULT 6,
    playing_conditions_id UUID, -- Link to rules/settings
    starts_on DATE,
    ends_on DATE,
    status TEXT DEFAULT 'planned'
);

CREATE TABLE competition_entries (
    competition_entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES competitions(competition_id),
    team_id UUID NOT NULL REFERENCES teams(team_id),
    seed INTEGER,
    group_name TEXT,
    joined_at TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'entered'
);

-- 4) Roles and Access Structure
CREATE TABLE user_accounts (
    user_account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES persons(person_id) UNIQUE,
    auth_provider TEXT, -- 'Firebase', 'Google', 'Apple'
    auth_identifier TEXT UNIQUE,
    last_login_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE system_roles (
    system_role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL, -- 'SUPER_ADMIN', 'ORG_ADMIN', 'SCORER'
    label TEXT NOT NULL
);

CREATE TABLE user_role_assignments (
    user_role_assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_account_id UUID NOT NULL REFERENCES user_accounts(user_account_id),
    system_role_id UUID NOT NULL REFERENCES system_roles(system_role_id),
    organisation_id UUID REFERENCES organisations(organisation_id),
    team_id UUID REFERENCES teams(team_id),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    status TEXT DEFAULT 'active'
);

CREATE TABLE team_memberships (
    team_membership_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(team_id),
    person_id UUID NOT NULL REFERENCES persons(person_id),
    membership_role TEXT DEFAULT 'Player', -- 'Player', 'Coach', 'Manager'
    squad_number TEXT,
    is_captain BOOLEAN DEFAULT false,
    is_vice_captain BOOLEAN DEFAULT false,
    batting_style TEXT,
    bowling_style TEXT,
    wicketkeeper BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active',
    joined_on DATE DEFAULT CURRENT_DATE,
    left_on DATE,
    notes TEXT
);

-- 5) Fixtures and Match Lifecycle
CREATE TABLE fixtures (
    fixture_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID REFERENCES competitions(competition_id),
    season_id UUID NOT NULL REFERENCES seasons(season_id),
    sport TEXT DEFAULT 'Cricket',
    home_team_id UUID NOT NULL REFERENCES teams(team_id),
    away_team_id UUID NOT NULL REFERENCES teams(team_id),
    venue_id UUID NOT NULL REFERENCES venues(venue_id),
    field_id UUID REFERENCES fields(field_id),
    scheduled_start_at TIMESTAMPTZ NOT NULL,
    scheduled_end_at TIMESTAMPTZ,
    match_type TEXT,
    overs_per_innings INTEGER,
    balls_per_over INTEGER DEFAULT 6,
    status TEXT DEFAULT 'scheduled', -- 'scheduled', 'live', 'completed', 'cancelled'
    round_name TEXT, -- 'Quarter Final', 'Round 5'
    notes TEXT,
    created_by_person_id UUID REFERENCES persons(person_id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE matches (
    match_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fixture_id UUID NOT NULL UNIQUE REFERENCES fixtures(fixture_id),
    live_status TEXT DEFAULT 'pre_match', -- 'toss', 'innings_1', 'innings_2', 'abandoned'
    match_state TEXT DEFAULT 'not_started',
    start_time_actual TIMESTAMPTZ,
    end_time_actual TIMESTAMPTZ,
    result_type TEXT, -- 'Win', 'Draw', 'Tie', 'No Result'
    winning_team_id UUID REFERENCES teams(team_id),
    won_by_runs INTEGER,
    won_by_wickets INTEGER,
    margin_text TEXT,
    toss_winner_team_id UUID REFERENCES teams(team_id),
    toss_decision TEXT, -- 'Bat', 'Bowl'
    duckworth_lewis_used BOOLEAN DEFAULT false,
    revised_target INTEGER,
    current_innings_no INTEGER,
    current_over INTEGER,
    current_ball INTEGER,
    version_no INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6) Match Officials and Line-ups
CREATE TABLE match_official_assignments (
    match_official_assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(match_id),
    person_id UUID NOT NULL REFERENCES persons(person_id),
    official_role TEXT, -- 'Umpire 1', 'Umpire 2', 'Scorer', 'Referee'
    assigned_by_person_id UUID REFERENCES persons(person_id),
    confirmed_at TIMESTAMPTZ,
    notes TEXT
);

CREATE TABLE match_team_sheets (
    match_team_sheet_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(match_id),
    team_id UUID NOT NULL REFERENCES teams(team_id),
    confirmed_by_person_id UUID REFERENCES persons(person_id),
    confirmed_at TIMESTAMPTZ,
    batting_order_locked BOOLEAN DEFAULT false,
    bowling_roster_locked BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'draft' -- 'confirmed', 'verified'
);

CREATE TABLE match_team_sheet_players (
    match_team_sheet_player_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_team_sheet_id UUID NOT NULL REFERENCES match_team_sheets(match_team_sheet_id),
    team_membership_id UUID REFERENCES team_memberships(team_membership_id),
    person_id UUID NOT NULL REFERENCES persons(person_id),
    shirt_number TEXT,
    batting_position INTEGER,
    is_starting_xi BOOLEAN DEFAULT true,
    is_substitute BOOLEAN DEFAULT false,
    is_wicketkeeper BOOLEAN DEFAULT false,
    is_captain BOOLEAN DEFAULT false,
    is_vice_captain BOOLEAN DEFAULT false,
    availability_status TEXT DEFAULT 'available',
    notes TEXT
);

-- 7) Innings, Overs and Ball-by-Ball Scoring
CREATE TABLE innings (
    innings_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(match_id),
    innings_no INTEGER NOT NULL,
    batting_team_id UUID NOT NULL REFERENCES teams(team_id),
    bowling_team_id UUID NOT NULL REFERENCES teams(team_id),
    innings_type TEXT, -- 'Standard', 'Super Over'
    target_runs INTEGER,
    max_overs INTEGER,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    closure_type TEXT, -- 'All Out', 'Overs Completed', 'Declared'
    total_runs INTEGER DEFAULT 0,
    total_wickets INTEGER DEFAULT 0,
    total_overs_decimal DECIMAL(5, 2) DEFAULT 0.0,
    total_balls INTEGER DEFAULT 0,
    extras_total INTEGER DEFAULT 0,
    byes INTEGER DEFAULT 0,
    leg_byes INTEGER DEFAULT 0,
    wides INTEGER DEFAULT 0,
    no_balls INTEGER DEFAULT 0,
    penalty_runs INTEGER DEFAULT 0,
    revised_target INTEGER,
    run_rate DECIMAL(5, 2),
    required_run_rate DECIMAL(5, 2),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE overs (
    over_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    innings_id UUID NOT NULL REFERENCES innings(innings_id),
    over_number INTEGER NOT NULL,
    bowler_person_id UUID NOT NULL REFERENCES persons(person_id),
    from_end TEXT, -- 'North', 'South'
    maiden BOOLEAN DEFAULT false,
    runs_conceded INTEGER DEFAULT 0,
    wickets_in_over INTEGER DEFAULT 0,
    legal_balls_bowled INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ
);

CREATE TABLE ball_events (
    ball_event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    innings_id UUID NOT NULL REFERENCES innings(innings_id),
    over_id UUID NOT NULL REFERENCES overs(over_id),
    over_number INTEGER NOT NULL,
    ball_in_over INTEGER NOT NULL,
    ball_sequence_global INTEGER NOT NULL,
    striker_person_id UUID NOT NULL REFERENCES persons(person_id),
    non_striker_person_id UUID NOT NULL REFERENCES persons(person_id),
    bowler_person_id UUID NOT NULL REFERENCES persons(person_id),
    batting_team_id UUID NOT NULL REFERENCES teams(team_id),
    bowling_team_id UUID NOT NULL REFERENCES teams(team_id),
    delivery_type TEXT, -- 'Leg Break', 'Bouncer', 'Yorker'
    shot_type TEXT, -- 'Cover Drive', 'Pull'
    contact_type TEXT, -- 'Clean', 'Edge', 'Missed'
    outcome_type TEXT, -- 'Runs', 'Wicket', 'Extra'
    runs_bat INTEGER DEFAULT 0,
    runs_extras INTEGER DEFAULT 0,
    runs_total INTEGER DEFAULT 0,
    extra_type TEXT, -- 'Wide', 'No Ball', 'Bye', 'Leg Bye'
    boundary_flag BOOLEAN DEFAULT false,
    is_legal_delivery BOOLEAN DEFAULT true,
    creates_free_hit BOOLEAN DEFAULT false,
    is_free_hit BOOLEAN DEFAULT false,
    wicket_flag BOOLEAN DEFAULT false,
    wicket_type TEXT, -- 'Bowled', 'Caught'
    dismissed_person_id UUID REFERENCES persons(person_id),
    credited_bowler_flag BOOLEAN DEFAULT true,
    assisting_fielder_1_id UUID REFERENCES persons(person_id),
    assisting_fielder_2_id UUID REFERENCES persons(person_id),
    pitch_zone TEXT,
    shot_zone TEXT,
    wagon_wheel_x DECIMAL(10, 5),
    wagon_wheel_y DECIMAL(10, 5),
    commentary_text TEXT,
    scorer_notes TEXT,
    recorded_by_person_id UUID REFERENCES persons(person_id),
    recorded_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    version_no INTEGER DEFAULT 1
);

-- 8) Derived Scorecard Layer
CREATE TABLE innings_batting_scorecards (
    batting_scorecard_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    innings_id UUID NOT NULL REFERENCES innings(innings_id),
    person_id UUID NOT NULL REFERENCES persons(person_id),
    batting_position INTEGER,
    dismissal_text TEXT,
    runs INTEGER DEFAULT 0,
    balls INTEGER DEFAULT 0,
    fours INTEGER DEFAULT 0,
    sixes INTEGER DEFAULT 0,
    strike_rate DECIMAL(7, 2),
    minutes_batted INTEGER,
    on_strike_last_known BOOLEAN DEFAULT false,
    is_not_out BOOLEAN DEFAULT true
);

CREATE TABLE innings_bowling_scorecards (
    bowling_scorecard_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    innings_id UUID NOT NULL REFERENCES innings(innings_id),
    person_id UUID NOT NULL REFERENCES persons(person_id),
    overs_decimal DECIMAL(5, 2) DEFAULT 0.0,
    maidens INTEGER DEFAULT 0,
    runs_conceded INTEGER DEFAULT 0,
    wickets INTEGER DEFAULT 0,
    wides INTEGER DEFAULT 0,
    no_balls INTEGER DEFAULT 0,
    economy_rate DECIMAL(5, 2)
);

CREATE TABLE innings_partnerships (
    partnership_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    innings_id UUID NOT NULL REFERENCES innings(innings_id),
    wicket_number INTEGER NOT NULL,
    batter_1_id UUID NOT NULL REFERENCES persons(person_id),
    batter_2_id UUID NOT NULL REFERENCES persons(person_id),
    runs INTEGER DEFAULT 0,
    balls INTEGER DEFAULT 0,
    started_ball_event_id UUID REFERENCES ball_events(ball_event_id),
    ended_ball_event_id UUID REFERENCES ball_events(ball_event_id)
);

CREATE TABLE innings_fall_of_wickets (
    fall_of_wicket_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    innings_id UUID NOT NULL REFERENCES innings(innings_id),
    wicket_number INTEGER NOT NULL,
    team_score INTEGER NOT NULL,
    batter_out_id UUID NOT NULL REFERENCES persons(person_id),
    over_display TEXT, -- '12.4'
    ball_event_id UUID NOT NULL REFERENCES ball_events(ball_event_id)
);

-- 9) Commentary, Narrative and Match Intelligence
CREATE TABLE commentary_entries (
    commentary_entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(match_id),
    innings_id UUID REFERENCES innings(innings_id),
    ball_event_id UUID REFERENCES ball_events(ball_event_id),
    commentary_type TEXT, -- 'Standard', 'Critical', 'Highlight'
    title TEXT,
    body TEXT NOT NULL,
    priority INTEGER DEFAULT 0,
    created_by_person_id UUID REFERENCES persons(person_id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE match_insights (
    match_insight_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(match_id),
    innings_id UUID REFERENCES innings(innings_id),
    related_ball_event_id UUID REFERENCES ball_events(ball_event_id),
    insight_type TEXT, -- 'Milestone', 'Trend', 'Win Probability'
    label TEXT,
    value_json JSONB,
    generated_at TIMESTAMPTZ DEFAULT now(),
    source TEXT -- 'SystemAI', 'ScorerManual'
);

-- 10) Statistics and Analytics
CREATE TABLE player_match_stats (
    player_match_stat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(match_id),
    team_id UUID NOT NULL REFERENCES teams(team_id),
    person_id UUID NOT NULL REFERENCES persons(person_id),
    role_played TEXT,
    runs INTEGER DEFAULT 0,
    balls INTEGER DEFAULT 0,
    fours INTEGER DEFAULT 0,
    sixes INTEGER DEFAULT 0,
    wickets INTEGER DEFAULT 0,
    overs_bowled DECIMAL(5, 2) DEFAULT 0.0,
    maidens INTEGER DEFAULT 0,
    runs_conceded INTEGER DEFAULT 0,
    catches INTEGER DEFAULT 0,
    stumpings INTEGER DEFAULT 0,
    run_outs INTEGER DEFAULT 0,
    strike_rate DECIMAL(7, 2),
    economy_rate DECIMAL(5, 2),
    fantasy_points DECIMAL(10, 2),
    player_of_match_points INTEGER DEFAULT 0
);

CREATE TABLE player_season_stats (
    player_season_stat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    season_id UUID NOT NULL REFERENCES seasons(season_id),
    team_id UUID NOT NULL REFERENCES teams(team_id),
    person_id UUID NOT NULL REFERENCES persons(person_id),
    matches_played INTEGER DEFAULT 0,
    innings_batted INTEGER DEFAULT 0,
    not_outs INTEGER DEFAULT 0,
    runs INTEGER DEFAULT 0,
    highest_score INTEGER DEFAULT 0,
    batting_average DECIMAL(7, 2),
    strike_rate DECIMAL(7, 2),
    balls_faced INTEGER DEFAULT 0,
    fours INTEGER DEFAULT 0,
    sixes INTEGER DEFAULT 0,
    innings_bowled INTEGER DEFAULT 0,
    balls_bowled INTEGER DEFAULT 0,
    wickets INTEGER DEFAULT 0,
    best_bowling TEXT, -- '5/23'
    bowling_average DECIMAL(7, 2),
    economy_rate DECIMAL(5, 2),
    catches INTEGER DEFAULT 0,
    stumpings INTEGER DEFAULT 0,
    run_outs INTEGER DEFAULT 0
);

CREATE TABLE team_season_stats (
    team_season_stat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    season_id UUID NOT NULL REFERENCES seasons(season_id),
    team_id UUID NOT NULL REFERENCES teams(team_id),
    competition_id UUID REFERENCES competitions(competition_id),
    matches_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    ties INTEGER DEFAULT 0,
    no_results INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    net_run_rate DECIMAL(10, 5),
    form_guide_json JSONB, -- ['W', 'L', 'W']
    last_updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE team_h2h_stats (
    team_h2h_stat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_a_id UUID NOT NULL REFERENCES teams(team_id),
    team_b_id UUID NOT NULL REFERENCES teams(team_id),
    matches_played INTEGER DEFAULT 0,
    team_a_wins INTEGER DEFAULT 0,
    team_b_wins INTEGER DEFAULT 0,
    ties INTEGER DEFAULT 0,
    no_results INTEGER DEFAULT 0,
    highest_team_a_score INTEGER,
    highest_team_b_score INTEGER,
    last_meeting_match_id UUID REFERENCES matches(match_id),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11) Player Development Layer
CREATE TABLE player_profiles (
    player_profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL UNIQUE REFERENCES persons(person_id),
    preferred_role TEXT, -- 'Top Order Batsman', 'Leg Spinner'
    batting_style TEXT, -- 'Right hand'
    bowling_style TEXT, -- 'Leg break'
    bowling_type_detail TEXT, 
    debut_date DATE,
    player_id_code TEXT UNIQUE,
    profile_status TEXT DEFAULT 'Prospect'
);

CREATE TABLE skill_ratings (
    skill_rating_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES persons(person_id),
    rated_by_person_id UUID NOT NULL REFERENCES persons(person_id),
    season_id UUID REFERENCES seasons(season_id),
    category TEXT, -- 'Physical', 'Tactical', 'Technical'
    attribute_name TEXT, -- 'Power Hitting', 'Stamina'
    rating_value INTEGER, -- 1-20
    notes TEXT,
    rated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE training_logs (
    training_log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES persons(person_id),
    team_id UUID REFERENCES teams(team_id),
    session_date DATE NOT NULL,
    session_type TEXT, -- 'Batting Nets', 'Fitness', 'Match Sim'
    workload INTEGER, -- 1-10
    notes TEXT,
    coach_comments TEXT,
    created_by_person_id UUID REFERENCES persons(person_id)
);

CREATE TABLE injury_records (
    injury_record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES persons(person_id),
    injury_type TEXT, -- 'Fracture', 'Strain'
    body_area TEXT, -- 'Ankle', 'Hamstring'
    severity TEXT, -- 'Low', 'Medium', 'High'
    occurred_on DATE,
    expected_return_date DATE,
    status TEXT DEFAULT 'Active', -- 'Recovering', 'Cleared', 'Permanent'
    rehab_plan TEXT,
    medical_notes TEXT,
    clearance_status BOOLEAN DEFAULT false
);

CREATE TABLE player_availability (
    availability_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES persons(person_id),
    team_id UUID NOT NULL REFERENCES teams(team_id),
    fixture_id UUID REFERENCES fixtures(fixture_id),
    available_from DATE,
    available_to DATE,
    availability_status TEXT DEFAULT 'Available',
    reason TEXT,
    updated_by_person_id UUID REFERENCES persons(person_id)
);

-- 12) Finance, Operations and Logistics
CREATE TABLE invoices (
    invoice_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID REFERENCES organisations(organisation_id),
    person_id UUID REFERENCES persons(person_id),
    related_entity_type TEXT, -- 'Membership', 'Match Fee'
    related_entity_id UUID,
    invoice_number TEXT UNIQUE,
    currency TEXT DEFAULT 'ZAR',
    subtotal DECIMAL(15, 2),
    tax_amount DECIMAL(15, 2),
    total_amount DECIMAL(15, 2),
    due_date DATE,
    status TEXT DEFAULT 'unpaid',
    issued_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE transactions (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(invoice_id),
    amount DECIMAL(15, 2) NOT NULL,
    payment_method TEXT, -- 'EFT', 'Card', 'Cash'
    processor_reference TEXT,
    transaction_date TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'completed'
);

CREATE TABLE vehicles (
    vehicle_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(organisation_id),
    registration_number TEXT UNIQUE,
    make TEXT,
    model TEXT,
    vehicle_type TEXT, -- 'Bus', 'MiniBus', 'SUV'
    capacity INTEGER,
    insurance_expiry DATE,
    service_due_date DATE,
    status TEXT DEFAULT 'active'
);

CREATE TABLE transport_trips (
    trip_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fixture_id UUID NOT NULL REFERENCES fixtures(fixture_id),
    vehicle_id UUID REFERENCES vehicles(vehicle_id),
    driver_person_id UUID REFERENCES persons(person_id),
    departure_time TIMESTAMPTZ,
    arrival_time TIMESTAMPTZ,
    route_notes TEXT,
    passenger_count INTEGER,
    status TEXT DEFAULT 'scheduled'
);

-- 13) Media, Notifications and Audit
CREATE TABLE media_assets (
    media_asset_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    related_entity_type TEXT, -- 'Person', 'Organisation', 'Match'
    related_entity_id UUID NOT NULL,
    uploaded_by_person_id UUID REFERENCES persons(person_id),
    media_type TEXT, -- 'Image', 'Video', 'PDF'
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    alt_text TEXT,
    metadata_json JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_person_id UUID NOT NULL REFERENCES persons(person_id),
    notification_type TEXT, -- 'Alert', 'Reminder', 'Message'
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    related_entity_type TEXT,
    related_entity_id UUID,
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ DEFAULT now(),
    read_at TIMESTAMPTZ
);

CREATE TABLE audit_logs (
    audit_log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_person_id UUID NOT NULL REFERENCES persons(person_id),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action_type TEXT NOT NULL, -- 'Create', 'Update', 'Delete'
    before_json JSONB,
    after_json JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
