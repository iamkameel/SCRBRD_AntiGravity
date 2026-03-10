---
trigger: always_on
---

20. Schema Specification
20.1 Shared platform entities
persons

personId (PK)

firstName

lastName

displayName

email

phone

profileImageUrl

dateOfBirth

gender

biography

emergencyContact

status

createdAt

updatedAt

schools

schoolId (PK)

name

shortName

region

crestUrl

contactInfo

status

seasons

seasonId (PK)

name

sport

startDate

endDate

status

teams

teamId (PK)

schoolId (FK)

seasonId (FK)

sport

ageDivision

className

suffix

displayName

teamColors

status

role_assignments

assignmentId (PK)

personId (FK)

scopeType

scopeId

role

startDate

endDate

status

notifications

notificationId (PK)

recipientId (FK)

type

message

status

relatedEntityType

relatedEntityId

createdAt

readAt

audit_logs

logId (PK)

actorId (FK)

action

entityType

entityId

beforeState

afterState

timestamp

20.2 Competition and fixtures
competitions

competitionId (PK)

seasonId (FK)

sport

name

type

ruleset

status

fixtures

fixtureId (PK)

seasonId (FK)

competitionId (FK)

sport

homeTeamId (FK)

awayTeamId (FK)

venueId (FK)

scheduledAt

status

workflowState

createdBy

updatedAt

official_assignments

assignmentId (PK)

fixtureId (FK)

personId (FK)

role

status

20.3 Match-day operations
team_squads

squadId (PK)

teamId (FK)

seasonId (FK)

players[]

status

match_day_squads

matchDaySquadId (PK)

fixtureId (FK)

teamId (FK)

version

status

captainId

viceCaptainId

createdBy

approvedBy

createdAt

approvedAt

match_day_selection_items

selectionItemId (PK)

matchDaySquadId (FK)

personId (FK)

selectionStatus

selected_xi

twelfth_man

standby

not_selected

withdrawn

replaced

late_addition

orderIndex

notes

availability_responses

responseId (PK)

fixtureId (FK)

personId (FK)

status

responseAt

notes

replacement_logs

replacementLogId (PK)

fixtureId (FK)

teamId (FK)

outgoingPlayerId

incomingPlayerId

changedBy

reason

timestamp

fixture_readiness_checks

readinessId (PK)

fixtureId (FK)

squadReady

groundReady

transportReady

officialsReady

medicalChecked

equipmentReady

overallStatus

updatedAt

20.4 Cricket match engine
innings

inningsId (PK)

fixtureId (FK)

inningsNumber

battingTeamId

bowlingTeamId

state

totalRuns

wickets

balls

overs

ball_events

ballEventId (PK)

fixtureId (FK)

inningsId (FK)

inningsNumber

overNumber

ballNumber

strikerId

nonStrikerId

bowlerId

eventType

runsOffBat

extraType

extraRuns

wicketType

dismissedPlayerId

fielderIds[]

shotZone

shotRing

shotType

commentaryText

createdBy

createdAt

scorecards

scorecardId (PK)

fixtureId (FK)

inningsId (FK)

totals

battingCard[]

bowlingCard[]

partnerships[]

fallOfWickets[]

extras

refreshedAt

commentary

commentaryId (PK)

fixtureId (FK)

ballEventId (FK)

text

authoredBy

createdAt

20.5 Player development and history
player_profiles

playerProfileId (PK)

personId (FK)

schoolId (FK)

primarySport

battingStyle

bowlingStyle

dominantHand

primaryRoleArchetype

secondaryRoleArchetype

currentTeamId

currentSeasonId

skill_matrices

skillMatrixId (PK)

personId (FK)

seasonId (FK)

roleArchetype

status

createdAt

updatedAt

skill_assessments

assessmentId (PK)

skillMatrixId (FK)

personId (FK)

assessorId (FK)

domain

attribute

rawScore1to9

normalisedScore

rubricVersion

note

assessedAt

player_role_profiles

roleProfileId (PK)

personId (FK)

seasonId (FK)

primaryArchetype

secondaryArchetype

coachConfidence

notes

performance_indices

performanceIndexId (PK)

personId (FK)

seasonId (FK)

teamId (FK)

roleArchetype

battingPerformanceScore

bowlingPerformanceScore

fieldingPerformanceScore

wicketkeepingPerformanceScore

overallPerformanceScore

confidenceLevel

updatedAt

readiness_scores

readinessScoreId (PK)

personId (FK)

seasonId (FK)

fixtureId (optional FK)

score

status

injuryModifier

workloadModifier

attendanceModifier

notes

updatedAt

development_trends

trendId (PK)

personId (FK)

seasonId (FK)

trendStatus

movementScore

summary

updatedAt

performance_entries

performanceEntryId (PK)

personId (FK)

fixtureId (FK)

seasonId (FK)

metricsJson

notes

createdAt

milestones

milestoneId (PK)

personId (FK)

seasonId (FK optional)

title

type

achievedOn

description

awards

awardId (PK)

personId (FK)

seasonId (FK optional)

fixtureId (FK optional)

title

awardingBody

awardedOn

description

accolades

accoladeId (PK)

personId (FK)

seasonId (FK optional)

source

notedOn

comments

isPublic

tags[]

20.6 Scouting and rankings
scouting_reports

scoutingReportId (PK)

personId (FK)

seasonId (FK optional)

fixtureId (FK optional)

scoutId (FK)

roleArchetype

currentAbilityScore

potentialScore

readinessView

strengthsSummary

developmentAreasSummary

recommendation

visibilityScope

createdAt

updatedAt

scouting_watchlists

watchlistId (PK)

ownerId (FK)

scopeType

scopeId

title

description

createdAt

scouting_watchlist_items

watchlistItemId (PK)

watchlistId (FK)

personId (FK)

status

note

addedAt

player_rankings

playerRankingId (PK)

seasonId (FK optional)

competitionId (FK optional)

rankingType

roleArchetype (optional)

personId (FK)

value

rankPosition

qualificationThresholdMet

calculatedAt

team_rankings

teamRankingId (PK)

seasonId (FK optional)

competitionId (FK optional)

rankingType

teamId (FK)

value

rankPosition

calculatedAt

school_rankings

schoolRankingId (PK)

seasonId (FK optional)

rankingType

schoolId (FK)

value

rankPosition

calculatedAt

ranking_snapshots

rankingSnapshotId (PK)

rankingEntityType

rankingEntityId

rankingType

windowType

rankPosition

value

snapshotDate

20.7 Training and recommendation engine
drills

drillId (PK)

sport

name

category

subcategory

description

intensity

duration

format

equipment

ageSuitability

level

drill_tags

drillTagId (PK)

drillId (FK)

domain

attribute

roleArchetype

drill_restrictions

restrictionId (PK)

drillId (FK)

injuryTag

medicalRestriction

notes

drill_progressions

progressionId (PK)

drillId (FK)

level

progressionType

description

development_needs

needId (PK)

personId (FK)

seasonId (FK)

domain

attribute

roleArchetype

priorityRank

developmentNeedScore

weaknessType

generatedAt

drill_recommendations

recommendationId (PK)

personId (FK)

seasonId (FK)

needId (FK)

drillId (FK)

recommendationType

confidenceLevel

generatedBy

generatedAt

recommendation_feedback

feedbackId (PK)

recommendationId (FK)

coachId (FK)

action

accepted

modified

rejected

note

timestamp

training_plans

trainingPlanId (PK)

scopeType

player

unit

team

scopeId

seasonId (FK)

title

objective

status

createdBy

createdAt

training_sessions

trainingSessionId (PK)

teamId (FK)

seasonId (FK)

scheduledAt

venueId

theme

objective

status

session_assignments

sessionAssignmentId (PK)

trainingSessionId (FK)

personId (FK optional)

drillId (FK)

assignedBy

status

session_logs

sessionLogId (PK)

trainingSessionId (FK)

personId (FK optional)

drillId (FK)

completed

coachObservation

playerResponse

effectivenessScore

loggedAt

20.8 Medical, facilities, and transport
injury_records

injuryRecordId (PK)

personId (FK)

injuryType

severity

bodyArea

status

occurredOn

rehabPlan

returnToPlayStatus

clearanceDate

notes

medical_notes

medicalNoteId (PK)

personId (FK)

authorId (FK)

noteType

note

createdAt

fields

fieldId (PK)

schoolId (FK)

name

type

surface

status

notes

facility_bookings

bookingId (PK)

fieldId (FK)

startTime

endTime

purpose

relatedEntityType

relatedEntityId

status

ground_status_logs

groundStatusLogId (PK)

fieldId (FK)

fixtureId (optional FK)

conditionStatus

pitchReadiness

outfieldReadiness

equipmentReadiness

loggedBy

loggedAt

maintenance_tasks

maintenanceTaskId (PK)

fieldId (FK)

title

description

dueDate

status

assignedTo

vehicles

vehicleId (PK)

schoolId (FK)

registration

makeModel

type

capacity

status

transport_trips

tripId (PK)

fixtureId (FK)

teamId (FK)

vehicleId (FK)

driverId (FK)

scheduledDeparture

scheduledArrival

actualDeparture

actualArrival

routeStops

status

trip_passengers

tripPassengerId (PK)

tripId (FK)

personId (FK)

roleOnTrip

boardingStatus

21. Logic Specification for Engineering
21.1 Event-first rule

All live cricket calculations must derive from ball_events.

21.2 Read-model rule

Dashboards should rely on derived read models, not ad hoc client-side recomputation for critical state.

21.3 Versioning rule

Match-day squads, assessments, and major readiness states should be versioned.

21.4 Soft-delete rule

Use archive / inactive / cancelled states rather than destructive deletion in most operational domains.

21.5 Transparency rule

All player assessment outputs must expose underlying components, not only an overall number.

21.6 Recommendation safety rule

Drill recommendations must always filter against medical restrictions and readiness state.

21.7 Confidence rule

Performance and recommendation outputs should include confidence indicators based on data completeness and sample size.

21.8 Audit rule

All selection changes, readiness overrides, and sensitive updates must be logged.

22. V1 Boundary Recommendation
Must include

Identity Engine

Competition and Fixture Engine

Match-day squad workflow

Notifications

Cricket Match Engine

Live scoreboards and scorecards

Team and player dashboards

longitudinal season stats and history basics

awards, milestones, and accolades timeline basics

skill matrix v1

readiness scoring v1

rules-based drill recommendation engine v1

Should follow soon after

groundskeeper dashboard

fields dashboard

transport hub

richer coach workflow

development plans and session logging

confidence scoring refinement

Later

advanced intelligence

predictive models

multi-rater calibration

swimming engine

athletics engine

24. Database-Ready Entity Relationship Specification

This ER specification is designed to be implementation-ready for engineering, while still modular enough for future sports.

24.1 Core identity and organisation entities
persons

Primary entity for every human in the system.

Key relationships:

one person can have many role assignments

one person can belong to many teams over time

one person can have many player profile records across seasons

one person can receive many notifications

one person can have many injuries, assessments, accolades, awards, milestones, and training records

schools

A school owns teams, facilities, vehicles, and staff scopes.

Key relationships:

one school has many teams

one school has many fields / facilities

one school has many vehicles

one school has many role assignments through scope

seasons

Used to partition competition, team, and player history.

Key relationships:

one season has many teams

one season has many competitions

one season has many fixtures

one season has many player development records

teams

A team belongs to a school and a season.

Key relationships:

one team has many squad memberships

one team has many fixtures

one team has many match-day squads

one team has many training sessions

one team has many season stats

24.2 Competition and fixture entities
competitions

A competition exists within a season.

Key relationships:

one competition has many fixtures

one competition has many standings entries

fixtures

Central operational entity linking teams, ground, readiness, scoring, transport, and notifications.

Key relationships:

one fixture belongs to one competition and one season

one fixture links two teams

one fixture has many official assignments

one fixture has many notifications

one fixture has many readiness checks

one fixture has many match-day squads

one fixture has up to two innings sets in cricket

one fixture may have one or more transport trips

official_assignments

Links a person to a fixture in a role.

Key relationships:

many official assignments belong to one fixture

many official assignments belong to one person