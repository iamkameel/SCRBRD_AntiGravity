---
trigger: always_on
---

# SCRBRD Cricket OS — Framework Document, Schema, and Logic Specification

## 1. Product Positioning

**SCRBRD Cricket OS** is the first fully realised sport engine inside the broader SCRBRD School Sports OS. It is designed to manage the full cricket lifecycle for schools:

* scheduling and fixture operations
* team and match-day selection
* live scoring and match intelligence
* player development and training recommendations
* medical, facilities, and transport coordination
* longitudinal player history across seasons
* dashboards, analytics, accolades, and institutional memory

### Core product principle

**History is everything.**

Every player, team, and school should accumulate a durable performance and development record over time. The system must not only capture match outcomes, but preserve:

* season-by-season progression
* skill development trends
* performance metrics
* readiness and injury history
* awards, milestones, and accolades
* role evolution and selection history
* coach observations and training outcomes

---

## 2. System Goals

### 2.1 Immediate goals for Cricket OS

* make fixture setup and match-day preparation simple and reliable
* make live scoring fast, accurate, and event-driven
* generate scorecards, stats, and intelligence automatically
* provide coaches with structured player development tools
* create persistent player, team, and school histories

### 2.2 Long-term goals for School Sports OS

* reuse shared platform infrastructure across sports
* extend into swimming and athletics as the next sport engines
* provide a unified school sport identity, scheduling, readiness, and reporting system

---

## 3. Top-Level Architecture

SCRBRD should be structured in five layers:

1. **Experience Layer**
2. **Application Layer**
3. **Domain Engines**
4. **Platform Services**
5. **Data and Infrastructure**

### 3.1 Experience Layer

Interfaces for:

* scorer console
* live match centre
* coach dashboard
* team dashboard
* player dashboard
* school admin dashboard
* system architect dashboard
* fields and groundskeeper dashboard
* transport hub

### 3.2 Application Layer

Workflow orchestration for:

* fixture setup
* squad selection
* readiness checks
* notifications
* approvals and locks
* audit trails
* role-scoped CRUD

### 3.3 Domain Engines

* Identity Engine
* Competition Engine
* Cricket Match Engine
* Player Development Engine
* Medical Engine
* Facilities and Grounds Engine
* Transport Engine
* Awards and Accolades Engine

### 3.4 Platform Services

* authentication
* RBAC and permission service
* notification service
* search
* audit logs
* analytics pipeline
* event bus / realtime updates
* reporting service

### 3.5 Data and Infrastructure

* operational data store
* event store / append-only event log
* analytics / read-model store
* media storage

---

## 4. RBAC and Permission Model

Permissions must be modelled as:

**role + scope + action + approval boundary**

### 4.1 Platform roles

* System Architect
* Platform Admin / Super Admin
* School Admin
* Sports Admin

### 4.2 Cricket operational roles

* Head Coach
* Assistant Coach
* Team Manager
* Scorer
* Umpire
* Groundskeeper
* Transport Coordinator
* Medical Staff

### 4.3 Participant roles

* Player
* Parent / Guardian
* Spectator / Public Viewer

### 4.4 Permission scopes

* platform-wide
* school
* season
* team
* fixture
* facility
* trip / vehicle
* player self

### 4.5 CRUD model

Use strong CRUD boundaries:

* **Create** only by authorised scoped roles
* **Read** by scoped access and sensitivity
* **Update** by responsible operational roles
* **Delete** should generally be archive / cancel / deactivate, not hard delete

### 4.6 Sensitive domains

Special restrictions required for:

* medical records
* minors' data
* disciplinary records
* finance
* private coach notes

---

## 5. Operational Dashboards

### 5.1 System Architect Dashboard

Purpose: platform governance and oversight.

Key views:

* school summary
* season summary
* live matches
* module health
* failed workflows
* notification delivery
* audit stream
* role and permission map
* integrity alerts

### 5.2 School Admin Dashboard

Purpose: school-level sports operations.

Key views:

* fixtures
* teams
* facilities
* staff assignments
* transport readiness
* match readiness
* school-wide player stats
* pending actions

### 5.3 Team Dashboard

Purpose: team operations and selection.

Key views:

* next fixture
* availability
* match-day squad
* training schedule
* player readiness
* transport status
* field readiness
* recent form
* team stats

### 5.4 Player Dashboard

Purpose: personal schedule, selection, stats, and development.

Key views:

* upcoming fixtures
* selection status
* standby status
* travel details
* season stats
* career history
* skill matrix
* readiness
* accolades and milestones
* charts across seasons

### 5.5 Fields / Facilities Dashboard

Purpose: facility readiness and operations.

Key views:

* field status
* bookings
* pitch prep schedule
* maintenance tasks
* fixture conflicts
* equipment readiness

### 5.6 Groundskeeper Dashboard

Purpose: match-day field preparation.

Key views:

* prep tasks
* readiness checklist
* pitch condition logs
* maintenance notes
* equipment checklists

### 5.7 Transport Hub

Purpose: travel operations linked to fixtures.

Key views:

* upcoming trips
* vehicles
* drivers
* passenger manifests
* route stops
* departure / arrival status
* issues and exceptions

### 5.8 Coach Development Dashboard

Purpose: player development and intervention planning.

Key views:

* squad skill distribution
* development watchlist
* readiness risks
* training recommendation sets
* player comparisons
* recent improvement trends

---

## 6. Pre-Match Workflow Specification

### 6.1 Fixture lifecycle states

* DRAFT
* SCHEDULED
* NOTIFIED
* SQUAD_SELECTION_OPEN
* MATCH_DAY_SQUAD_PENDING_CONFIRMATION
* MATCH_DAY_SQUAD_CONFIRMED
* PRE_MATCH_READY
* LIVE
* COMPLETED
* VERIFIED
* PUBLISHED

### 6.2 Pre-match workflow

#### Step 1 — Fixture scheduled

System sends notifications to:

* coaches
* team managers
* relevant players / team followers where configured

#### Step 2 — Match-day squad selection opens

Coach creates a **versioned match-day selection package** containing:

* playing XI
* 12th man
* standby players
* captain
* vice-captain
* selection version number
* draft / confirmed status

#### Step 3 — Player notifications

* Selected XI and 12th man receive participation notices
* Standby players receive standby notices
* all include fixture, venue, time, and transport details where relevant

#### Step 4 — Availability confirmation

Players respond:

* available
* unavailable
* pending issue
* late / concern flagged

#### Step 5 — Match-day replacement window

Authorised roles may:

* replace a selected player with a standby player
* promote standby to XII / XI
* reassign 12th man
* trigger updated notifications
* update transport manifests automatically

#### Step 6 — Readiness board

Per-fixture readiness should aggregate:

* squad confirmed
* player availability complete
* ground ready
* transport ready
* officials assigned
* medical restrictions checked
* equipment ready

---

## 7. Cricket Match Engine

### 7.1 Core principle

Cricket must be **event-driven**.

All scoring outputs derive from ball events, not from manually edited score summaries.

### 7.2 Match state model

* NOT_STARTED
* LIVE
* OVER_BREAK
* WICKET_PENDING_BATTER
* INNINGS_BREAK
* CLOSED
* RESULT_DECLARED

### 7.3 Ball event model

Each ball event should store:

* fixture id
* innings number
* over and ball index
* striker id
* non-striker id
* bowler id
* runs off bat
* extras
* wicket data
* field / shot zone
* shot type
* timestamp
* scorer id

### 7.4 Derived outputs

From ball events the system calculates:

* live score
* batting card
* bowling figures
* partnerships
* fall of wickets
* wagon wheel
* phase performance
* worm charts
* over summaries
* player match performance entries

---

## 8. Longitudinal Player History Model

The system must preserve player growth over multiple seasons.

### 8.1 Historical tracking dimensions

* season-by-season batting, bowling, fielding, and wicketkeeping output
* selection history
* role changes over time
* skill matrix progression
* training attendance and drill history
* injury and readiness history
* awards, accolades, and milestones
* coach observations and review notes
* comparisons to prior seasons

### 8.2 Required visual outputs

The player dashboard should support charts and metrics such as:

* runs by season
* batting average by season
* strike rate by season
* wickets by season
* economy rate by season
* catches / stumpings by season
* readiness trend over time
* skill domain scores over time
* composite development trend over time
* accolade timeline

### 8.3 Product principle

A player profile should read like a **career record**, not just a current-season card.

---

## 9. Player Development Intelligence Engine

This subsystem combines assessment, performance evidence, and recommendation logic.

### 9.1 Core outputs

Each player should have:

1. Skill Score
2. Performance Score
3. Readiness Score
4. Development Trend
5. Optional Composite Player Index

### 9.2 Core assessment chain

Player Profile
→ Role Archetype
→ Skill Matrix Assessment
→ Performance Evidence
→ Readiness and Medical Context
→ Development Need Scores
→ Drill Recommendations
→ Coach Review
→ Training Plan
→ Feedback Loop

---

## 10. Full Skill Matrix Framework

### 10.1 Top-level domains

1. Physical
2. Mental
3. Tactical
4. Batting
5. Bowling
6. Fielding
7. Wicketkeeping

### 10.2 Physical attributes

* speed
* agility
* acceleration
* coordination
* balance
* mobility
* strength
* power
* endurance
* durability / workload tolerance

### 10.3 Mental attributes

* concentration
* composure
* resilience
* confidence
* discipline
* competitive intent
* patience
* response to pressure
* recovery after error
* work ethic

### 10.4 Tactical attributes

* match awareness
* game situation understanding
* risk assessment
* decision-making
* phase awareness
* opposition reading
* shot / option selection
* field awareness
* bowling plan execution
* adaptability

### 10.5 Batting attributes

* setup and balance
* defensive technique
* leave judgement
* strike rotation
* gap finding
* boundary hitting
* shot range
* playing pace
* playing spin
* footwork
* tempo control
* innings building
* batting under pressure
* running between wickets

### 10.6 Bowling attributes

* run-up rhythm
* release consistency
* control
* line discipline
* length discipline
* pace / revolutions
* seam / swing / drift / shape
* variation quality
* wicket-taking threat
* new-ball execution
* middle-over control
* death-over execution
* tactical bowling intelligence
* repeatability under fatigue

### 10.7 Fielding attributes

* basic catching
* high catching
* slip catching
* ground fielding
* pick-up and release
* throwing accuracy
* throwing power
* reflexes
* anticipation
* positioning
* boundary fielding
* pressure fielding
* communication

### 10.8 Wicketkeeping attributes

* setup and stance
* glove work
* clean collection
* soft hands
* standing back takes
* standing up takes
* leg-side takes
* footwork to spin
* footwork to seam
* stumping speed
* gather-to-release speed
* take-to-throw accuracy
* reaction speed
* consistency
* communication from behind the stumps

---

## 11. Rating Rubrics and Assessment Scale

### 11.1 Coach rating scale

Use a **1–9 anchored scale** for coach input.

* 1 = severely underdeveloped
* 3 = below expected standard
* 5 = competent school standard
* 7 = strong performer
* 9 = elite school-level trait

The system may later normalise this to 0–100 for analytics.

### 11.2 Rubric principle

Every attribute requires anchor descriptors. Coaches should never rate freehand without rubric support.