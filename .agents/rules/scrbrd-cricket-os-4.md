---
trigger: always_on
---

24.3 Team and squad entities
team_squads

Represents season squad context.

Key relationships:

one team squad belongs to one team and one season

one team squad has many squad members

squad_memberships

Recommended join entity for durability.

Fields:

squadMembershipId

squadId

personId

status

joinedAt

leftAt

match_day_squads

Versioned selection package for a fixture and team.

Key relationships:

one match-day squad belongs to one fixture and one team

one match-day squad has many selection items

one match-day squad may be approved by one person

match_day_selection_items

Stores XI, 12th man, standby, and replacement states.

Key relationships:

many selection items belong to one match-day squad

many selection items reference one person

availability_responses

Key relationships:

many availability responses belong to one fixture

many availability responses belong to one person

replacement_logs

Key relationships:

many replacement logs belong to one fixture

each log references outgoing and incoming persons

24.4 Cricket engine entities
innings

Key relationships:

one fixture has one or more innings

one innings has many ball events

one innings has one derived scorecard

ball_events

This is the canonical cricket event stream.

Key relationships:

many ball events belong to one fixture

many ball events belong to one innings

many ball events reference striker, non-striker, bowler, dismissed player, and optional fielders

scorecards

Derived read model.

Key relationships:

one scorecard belongs to one innings and one fixture

commentary

Key relationships:

many commentary items belong to one fixture

many commentary items optionally link to one ball event

24.5 Player history and development entities
player_profiles

One person may have one primary player profile, with season-linked derived records.

Key relationships:

one player profile belongs to one person

one player profile can link to many seasonal performance and assessment records

skill_matrices

Container entity for an assessment period.

Key relationships:

one skill matrix belongs to one person and one season

one skill matrix has many skill assessments

skill_assessments

Atomic assessment record.

Key relationships:

many skill assessments belong to one skill matrix

many skill assessments belong to one person

many skill assessments belong to one assessor

player_role_profiles

Key relationships:

one role profile belongs to one person and one season

performance_indices

Derived seasonal or rolling performance summaries.

Key relationships:

one performance index belongs to one person, one season, and optionally one team

readiness_scores

Can be season-level or fixture-specific.

Key relationships:

many readiness scores belong to one person

readiness may optionally link to one fixture

development_trends

Key relationships:

one development trend belongs to one person and one season

performance_entries

Granular logs from fixtures or reviews.

Key relationships:

many performance entries belong to one person

many performance entries belong to one fixture

milestones / awards / accolades

Each contributes to the historical profile.

Key relationships:

many milestones belong to one person

many awards belong to one person

many accolades belong to one person

24.6 Recommendation and training entities
drills

Master drill library.

Key relationships:

one drill has many tags

one drill has many restrictions

one drill has many progressions

one drill can appear in many recommendations and session assignments

development_needs

Key relationships:

many development needs belong to one person and one season

one development need may result in many drill recommendations

drill_recommendations

Key relationships:

many recommendations belong to one person

many recommendations link one development need to one drill

many recommendations have many feedback entries over time if desired

training_plans

Key relationships:

one training plan can have many sessions

one training plan may belong to a player, unit, or team

training_sessions

Key relationships:

one training session belongs to one team and season

one training session has many assignments and logs

session_assignments

Key relationships:

many session assignments belong to one training session

many session assignments reference one drill

may optionally reference one player

session_logs

Key relationships:

many session logs belong to one training session

may reference one player and one drill

24.7 Medical, facilities, and transport entities
injury_records

Key relationships:

many injury records belong to one person

many injury records may influence readiness scores

medical_notes

Key relationships:

many medical notes belong to one person

many medical notes belong to one medical staff author

fields

Key relationships:

one school has many fields

one field has many bookings

one field has many status logs

one field has many maintenance tasks

facility_bookings

Key relationships:

many bookings belong to one field

bookings may relate to a fixture or training session

ground_status_logs

Key relationships:

many ground status logs belong to one field

may optionally belong to one fixture

maintenance_tasks

Key relationships:

many maintenance tasks belong to one field

vehicles

Key relationships:

one school has many vehicles

one vehicle has many trips

transport_trips

Key relationships:

many transport trips may belong to one fixture

one trip uses one vehicle and one driver

one trip has many passengers

trip_passengers

Key relationships:

many trip passengers belong to one trip

many trip passengers reference one person

25. Mermaid ER Diagram (Logical)
erDiagram
    PERSONS ||--o{ ROLE_ASSIGNMENTS : has
    SCHOOLS ||--o{ TEAMS : owns
    SEASONS ||--o{ TEAMS : groups
    SEASONS ||--o{ COMPETITIONS : contains
    COMPETITIONS ||--o{ FIXTURES : schedules
    TEAMS ||--o{ FIXTURES : homeTeam
    TEAMS ||--o{ FIXTURES : awayTeam
    FIXTURES ||--o{ O

