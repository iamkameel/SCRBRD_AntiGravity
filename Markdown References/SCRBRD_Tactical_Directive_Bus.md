# SCRBRD — Live Real-Time Coach ↔ Captain Tactical Directive Sync

## 1. Purpose

The **Tactical Directive Bus** is SCRBRD’s real-time communication and match-intelligence layer connecting the **Coach Cockpit** and **Captain Cockpit** during a live fixture.

It is not merely a messaging feature.

The system must capture:

1. **Communication** — what the coach wants to happen.
2. **Execution** — what the captain accepts, modifies, dismisses, or implements.
3. **Outcome** — what subsequently happens in the match.
4. **Intelligence** — whether the tactical decision was effective.

The tactical system must remain separate from the authoritative scoring event stream. A directive represents **tactical intent**; a delivery represents **match truth**. The two are linked for analysis but must never be conflated.

---

## 2. Core Experience

```text
COACH COCKPIT
     │
     │  Transmit Directive
     ▼
TACTICAL DIRECTIVE
     │
     ├── Real-time transport
     │
     ▼
CAPTAIN TABLET
 ┌──────────────────────────────┐
 │ 🔊 NEW DIRECTIVE             │
 │                              │
 │ Protect deep square          │
 │ Short-ball plan to Batter 4  │
 │ Next 6 deliveries            │
 │                              │
 │ [ ACCEPT ] [ MODIFY ]        │
 │ [ DISMISS ]                  │
 └──────────────────────────────┘
     │
     ▼
CAPTAIN RESPONSE
     │
     ▼
COACH COCKPIT
     │
     ▼
DELIVERY OUTCOMES
     │
     ▼
TACTICAL EFFECTIVENESS
```

The captain must never directly edit the coach’s original directive. **Accept**, **Modify**, and **Dismiss** create response events, preserving an immutable record of the original instruction and the on-field response.

---

## 3. Directive Lifecycle

A tactical directive should follow a defined state machine:

```text
DRAFT
  ↓
QUEUED
  ↓
TRANSMITTED
  ↓
DELIVERED
  ↓
VIEWED
  ↓
┌──────────┬──────────┬───────────┐
│ ACCEPTED │ MODIFIED │ DISMISSED │
└──────────┴──────────┴───────────┘
       ↓
     ACTIVE
       ↓
┌───────────┬────────────┬─────────┐
│ COMPLETED │ SUPERSEDED │ EXPIRED │
└───────────┴────────────┴─────────┘
       ↓
OUTCOME ANALYSED
```

### Status definitions

- **Draft** — being prepared by the coach.
- **Queued** — submitted locally but not yet server-confirmed.
- **Transmitted** — authoritative backend has confirmed receipt.
- **Delivered** — captain’s device has received the directive.
- **Viewed** — captain has opened or acknowledged it.
- **Accepted** — captain agrees to execute the directive.
- **Modified** — captain proposes an alternative implementation.
- **Dismissed** — captain elects not to execute it.
- **Active** — currently applicable to match play.
- **Completed** — directive scope has finished.
- **Superseded** — replaced by a newer directive.
- **Expired** — no longer tactically relevant.
- **Outcome Analysed** — relevant delivery results have been attached and evaluated.

This distinction allows SCRBRD to answer operational questions such as whether an instruction was transmitted, actually received, seen, accepted and executed.

---

## 4. Tactical Directive Data Model

Conceptual Firestore structure:

```text
fixtures/{fixtureId}
    └── tactical_directives/{directiveId}
            directiveId
            tenantId
            fixtureId
            innings
            teamId

            issuedByPersonId
            issuedToPersonId

            sequence
            version

            directiveType
            title
            instruction

            phase
            tacticalIntent

            scope
            target

            fieldPlan
            bowlingPlan
            battingPlan

            trigger

            createdAt
            transmittedAt
            expiresAt

            status

            supersedesDirectiveId
            parentDirectiveId

        ├── responses/{responseId}
        ├── receipts/{personId}
        └── outcomes/{deliveryId}
```

### Example directive

```yaml
directiveId: D-1082
fixtureId: FIX-2044
teamId: WES-1XI
version: 2

directiveType: BOWLING_FIELD_PLAN
phase: MIDDLE_OVERS
tacticalIntent: BUILD_PRESSURE

instruction: >
  Protect square boundary and attack fourth-stump channel.

scope:
  type: NEXT_6_BALLS

target:
  batterId: PLAYER-442
  bowlerId: PLAYER-118

fieldPlan:
  presetId: FP-023
  fieldChanges:
    - player: PLAYER-301
      from: MID_WICKET
      to: DEEP_SQUARE
    - player: PLAYER-205
      from: POINT
      to: DEEP_POINT

bowlingPlan:
  line: FOURTH_STUMP
  length: GOOD_LENGTH
  variation: SEAM
  targetZone: OUTSIDE_OFF

successCriteria:
  maxRuns: 3
  boundaryAllowed: false

status: TRANSMITTED
```

This enables directives to become structured tactical data rather than unstructured chat messages.

---

## 5. Directive Types

The system should support structured directive categories including:

- Field placement change
- Bowling plan
- Batting plan
- Batter-specific plan
- Bowler-specific plan
- Partnership disruption
- Boundary protection
- Wicket-taking attack
- Run-rate suppression
- Powerplay strategy
- Middle-over strategy
- Death-over strategy
- New-batter plan
- Match-up instruction
- Tempo change
- Rotation/change of bowler
- Trigger-based instruction
- Custom tactical instruction

---

## 6. Directive Scope

Every instruction should have an explicit tactical scope.

```text
NEXT_BALL
NEXT_3_BALLS
NEXT_6_BALLS
CURRENT_OVER
NEXT_OVER
BATTER
BOWLER_SPELL
PARTNERSHIP
MATCH_PHASE
UNTIL_CANCELLED
CUSTOM
```

This is critical because an instruction without an expiry or scope can become dangerous when connectivity is intermittent.

---

## 7. Coach Cockpit

The Coach Cockpit is the tactical creation and monitoring environment.

The coach should be able to:

- select a tactical objective;
- select a target batter or bowler;
- modify the field visually;
- select line and length;
- select bowling variation;
- define directive duration;
- define success criteria;
- attach tactical notes;
- transmit the directive;
- cancel or supersede an active directive;
- monitor captain acknowledgement;
- evaluate delivery outcomes.

### Transmit Directive

```text
┌──────────────────────────────────────────┐
│ TACTICAL PLAN                            │
│                                          │
│ Target: N. Petersen                      │
│ Phase: Middle Overs                      │
│                                          │
│ FIELD                                    │
│ Deep square → ON                         │
│ Deep point → ON                          │
│                                          │
│ BOWLING                                  │
│ 4th stump · Good length                  │
│                                          │
│ Duration: Next 6 balls                   │
│ Target: ≤3 runs                          │
│                                          │
│           [ TRANSMIT DIRECTIVE ]         │
└──────────────────────────────────────────┘
```

---

## 8. Captain Cockpit

The Captain Cockpit must **not** simply reproduce the Coach Cockpit on a smaller screen.

The captain is actively participating in the match.

The interaction principle should therefore be:

```text
GLANCE
  ↓
UNDERSTAND
  ↓
RESPOND
  ↓
RETURN TO MATCH
```

Instructions should be concise, visual and immediately actionable.

### Example

```text
┌──────────────────────────────────┐
│ ⚡ COACH DIRECTIVE               │
│                                  │
│ 4TH STUMP                        │
│ GOOD LENGTH                      │
│                                  │
│ NEXT 3 BALLS                     │
│                                  │
│ Deep square ← CHANGE             │
│ Deep point  ← CHANGE             │
│                                  │
│ [ ACCEPT ]                       │
│ [ MODIFY ]       [ DISMISS ]     │
└──────────────────────────────────┘
```

---

## 9. Captain Responses

### 9.1 Accept

The captain confirms the directive without altering it.

```text
Coach:
Protect leg-side boundary.
Bowl into the pitch.

Captain:
✓ ACCEPTED
```

Coach receives:

```text
✓ Accepted by Captain · 14:37:12
```

### 9.2 Modify

Modification creates a new response rather than editing the original instruction.

Example:

```text
COACH PLAN

Deep square
Fine leg
Short-ball attack

        ↓

CAPTAIN MODIFICATION

Deep square → Cow corner
Keep fine leg
Normal length instead of short
```

Optional rapid reasons:

- Wind conditions
- Batter movement
- Bowler preference
- Pitch behaviour
- Field restriction
- Match situation
- Other

The coach receives:

```text
⚠ CAPTAIN PROPOSES MODIFICATION

[ ACCEPT CAPTAIN PLAN ]
[ REINSTATE ORIGINAL ]
[ DISCUSS ]
```

### 9.3 Dismiss

Dismissal should require a lightweight reason:

- Conditions changed
- Batter changed
- Bowler uncomfortable
- Field restriction
- Injury
- Already implemented
- Tactical disagreement
- Directive arrived too late
- Other

The process must remain fast enough for live match conditions.

---

## 10. Real-Time Synchronisation

Captain Mode listens only to directives authorised for the active fixture, tenant, team and captain.

Conceptual implementation:

```javascript
const directivesQuery = query(
  collection(db, `fixtures/${fixtureId}/tactical_directives`),
  where("teamId", "==", activeTeamId),
  where("issuedToPersonId", "==", captainId),
  orderBy("transmittedAt", "desc")
);

const unsubscribe = onSnapshot(
  directivesQuery,
  { includeMetadataChanges: true },
  snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type !== "added") return;

      const directive = change.doc.data();

      if (snapshot.metadata.fromCache) return;
      if (isExpired(directive)) return;

      displayCaptainDirective(directive);
      playDirectivePing();
      acknowledgeReceipt(change.doc.id);
    });
  }
);
```

SCRBRD must visibly distinguish:

```text
● LIVE
◌ SYNCING
⚠ RECONNECTING
○ OFFLINE
```

A cached directive must never be presented as a newly received live instruction.

---

## 11. Foreground and Background Delivery

Firestore realtime listeners alone should not be treated as sufficient delivery infrastructure.

### Foreground

```text
Firestore listener
       ↓
Directive received
       ↓
Captain directive card
       ↓
Audio / vibration cue
```

### Background

```text
Directive created
       ↓
Push notification service
       ↓
Service worker / native notification
       ↓
Captain notification
       ↓
Open Captain Mode
       ↓
Retrieve current authoritative directive
```

A push notification should alert the captain that something has changed. The application should still retrieve the authoritative directive rather than trusting notification payload content as match state.

---

## 12. Acoustic and Haptic Feedback

Recommended notification language:

```text
PING
New coach directive

DOUBLE PING
Urgent update / directive superseded

CHIME
Coach accepts captain modification
```

Captain settings:

```text
Sound
Vibration
Sound + Vibration
Silent
```

The sound should be functional and restrained rather than intrusive.

---

## 13. Delivery Receipts

A simple `SENT` status is insufficient.

SCRBRD should expose:

```text
◌ Sending
✓ Server received
✓✓ Captain device received
✓✓ Captain viewed
```

If connectivity fails:

```text
⚠ NOT DELIVERED

Connection unavailable
Directive queued
```

These statuses must reflect actual system state rather than optimistic UI assumptions.

---

## 14. Expired Offline Directives

A critical rule:

> A directive that has expired before the captain reconnects must never generate a new-directive alert.

Instead:

```text
status: EXPIRED_BEFORE_DELIVERY
```

The event remains in the audit history but is not surfaced as an actionable tactical instruction.

This prevents a captain receiving instructions that relate to an over or batter situation that has already passed.

---

## 15. Versioning and Concurrency

Example race condition:

```text
14:42:10 Coach sends Directive A v1
14:42:15 Captain opens A v1
14:42:17 Coach sends A v2
14:42:21 Captain presses ACCEPT on A v1
```

Without version control the system cannot know which plan the captain accepted.

Every response therefore requires:

```yaml
directiveId: D-1082
directiveVersion: 1
responseId: RES-551
clientEventId: UUID
respondedAt: timestamp
```

If the response references an obsolete version:

```text
⚠ DIRECTIVE UPDATED

The coach changed this instruction
before your response was received.

[ VIEW UPDATED PLAN ]
```

---

## 16. Idempotency

Every client action must carry a unique `clientEventId`.

This prevents:

- duplicate Accept actions;
- duplicated modifications;
- repeated transmissions;
- reconnect replay duplication;
- double-taps;
- network retry duplication.

The server should treat repeated submissions with the same event ID as the same logical action.

---

## 17. Delivery Outcome Tagging

Tactical directives should be associated with the deliveries played while they are active.

Example:

```text
DIRECTIVE D-1082
Wide yorker defence
Prevent boundary
Next four balls

       │
       ├── 17.3 → 1 run
       ├── 17.4 → dot
       ├── 17.5 → 2 runs
       └── 17.6 → wicket
```

The authoritative delivery remains a scoring event.

```yaml
deliveryId: DEL-17-6
over: 17
ball: 6

runs: 0
wicket: true

tacticalContext:
  directiveId: D-1082
  directiveVersion: 2
```

The tactical reference enriches the scoring event without changing scoring truth.

---

## 18. Tactical Outcome Model

SCRBRD can evaluate:

```text
DIRECTIVE
    ↓
CAPTAIN RESPONSE
    ↓
IMPLEMENTATION
    ↓
DELIVERIES
    ↓
OUTCOME
    ↓
TACTICAL EFFECTIVENESS
```

Example Coach Cockpit card:

```text
┌──────────────────────────────────────────────┐
│ DIRECTIVE #18                         ACTIVE │
│                                              │
│ 🟢 Captain accepted                         │
│                                              │
│ Wide yorker defence                         │
│ Target: N. Petersen                         │
│                                              │
│ ● 1     ● 0     ● 2     ● W                │
│                                              │
│ 4 balls │ 3 runs │ 1 wicket                 │
│                                              │
│ Effectiveness                     89%        │
└──────────────────────────────────────────────┘
```

---

## 19. Tactical Effectiveness Metrics

Over time SCRBRD can calculate:

### Coach intelligence

- directive success rate;
- wickets following tactical changes;
- runs conceded per directive;
- boundary prevention rate;
- field-change effectiveness;
- bowling-plan effectiveness;
- batter-specific success;
- match-phase effectiveness;
- average deliveries until intended outcome.

### Captain intelligence

- acceptance rate;
- modification rate;
- dismissal rate;
- successful modification rate;
- captain modification versus original plan;
- decision effectiveness by match phase;
- response time;
- coach/captain tactical alignment.

### Team intelligence

- tactical execution rate;
- runs saved following field changes;
- wickets created by tactical plans;
- pressure-building sequences;
- phase-specific strategy success;
- opposition match-up effectiveness.

---

## 20. Coach vs Captain Intelligence

One particularly valuable analytical layer is comparison between:

```text
COACH INTENT
      ↓
CAPTAIN JUDGEMENT
      ↓
ACTUAL EXECUTION
      ↓
MATCH OUTCOME
```

SCRBRD could eventually identify patterns such as:

> Captain modifications to death-over plans have conceded 14% fewer boundaries than the original directive.

or:

> Coach short-ball plans against right-handed middle-order batters have produced a wicket every 19 deliveries.

These insights should be contextual evidence, not simplistic ratings of a coach or captain. Cricket outcomes contain significant confounding factors including player execution, opposition quality, pitch, weather and match state.

---

## 21. Three-Phase Scoring Integration

The directive system should complement SCRBRD’s three-phase scoring model rather than interfere with it.

```text
TACTICAL DIRECTIVE
       │
       ▼
PHASE 1 — ENRICH
Context / tactical intent / field plan
       │
       ▼
PHASE 2 — SCORE
Authoritative delivery result
       │
       ▼
PHASE 3 — REVIEW / INTELLIGENCE
Outcome linked back to tactical intent
```

This creates a loop:

```text
PLAN
 ↓
EXECUTE
 ↓
SCORE
 ↓
ANALYSE
 ↓
LEARN
 ↓
NEXT PLAN
```

---

## 22. RBAC

The tactical channel must be strictly team-private.

### Coach

**Can:**

- create directives;
- transmit directives;
- supersede directives;
- cancel directives;
- view captain responses;
- accept/reject captain modifications;
- view tactical outcomes.

### Captain

**Can:**

- read directives addressed to their authorised team;
- acknowledge receipt;
- accept;
- modify;
- dismiss;
- view current applicable tactical plans.

**Cannot:**

- alter the original coach directive;
- impersonate a coach;
- access opposition directives;
- rewrite historical tactical events.

### Scorer

May automatically associate active directive IDs with deliveries where authorised.

The scorer should **not automatically receive private tactical content** merely because they are scoring the match.

### Performance Analyst

May receive tactical outcome data according to explicit role and team permissions.

### Parent / Spectator / Opposition

```text
NO ACCESS
```

Private tactical data must never leak into public match feeds, spectator APIs, public scorecards, sponsor surfaces or opposition accounts.

---

## 23. Security Requirements

Every tactical read/write must be constrained by:

- tenant;
- fixture;
- team;
- person;
- active role assignment;
- match-role assignment where required;
- directive ownership;
- authorised recipient;
- directive lifecycle state.

Required controls include:

- authenticated users;
- strict Firestore Security Rules;
- server-side authorisation;
- App Check or equivalent client attestation;
- tenant isolation;
- immutable audit records;
- least-privilege access;
- security-rule regression tests;
- rate limiting;
- device/session validation.

Client-side hiding of tactical UI is **not** an access-control mechanism.

---

## 24. Audit Trail

Every important action should create an immutable audit event.

```yaml
eventId: EVT-88217
fixtureId: FIX-2044
directiveId: D-1082

actorId: PERSON-81
actorRole: CAPTAIN

action: DIRECTIVE_ACCEPTED

directiveVersion: 2

clientEventId: UUID
clientTimestamp: timestamp
serverTimestamp: timestamp

deviceId: DEVICE-44
```

Audit events should cover:

- directive created;
- transmitted;
- received;
- viewed;
- accepted;
- modified;
- dismissed;
- superseded;
- cancelled;
- expired;
- completed;
- outcome attached.

---

## 25. Architecture Boundary

SCRBRD’s authoritative scoring architecture is intended to be deterministic and event-sourced.

Firestore should therefore not accidentally become a competing source of match truth.

Recommended separation:

```text
┌─────────────────────────────────────┐
│ AUTHORITATIVE MATCH EVENT STORE     │
│                                     │
│ Deliveries                          │
│ Wickets                             │
│ Runs                                │
│ Match state                         │
└──────────────────┬──────────────────┘
                   │ references
                   ▼
┌─────────────────────────────────────┐
│ TACTICAL EVENT DOMAIN               │
│                                     │
│ Directives                          │
│ Responses                           │
│ Acknowledgements                    │
│ Tactical outcomes                   │
└──────────────────┬──────────────────┘
                   │ realtime projection
                   ▼
┌─────────────────────────────────────┐
│ FIRESTORE / REALTIME DELIVERY       │
│                                     │
│ Coach Cockpit                       │
│ Captain Cockpit                     │
└─────────────────────────────────────┘
```

Firestore may serve as the real-time tactical projection/transport layer, while authoritative tactical events are persisted consistently with the wider SCRBRD architecture.

Alternatively, Firebase can be made authoritative for this bounded tactical subsystem—but that decision must be explicit.

---

## 26. Performance Analyst Integration

Completed directives become input into the **Performance Analyst Cockpit**.

Analysts should be able to inspect:

- original tactical plan;
- captain response;
- captain modification;
- field configuration;
- intended target;
- active deliveries;
- delivery outcomes;
- expected versus actual outcome;
- tactical effectiveness;
- historical success against similar players;
- comparable situations.

This enables tactical learning rather than merely post-match statistics.

---

## 27. Opposition Dossier Integration

Historical directive effectiveness can contribute to the Opposition Scouting & Dossier Generator.

Example:

```text
BATTER: N. PETERSEN

Observed vulnerability:
4th-stump good-length seam

Historical tactical sample:
42 deliveries

Average:
18.4

Dismissals:
5

Dot-ball rate:
61%

Boundary rate:
7%

Recommended plan:
Attack fourth stump for first 6 balls
with deep point protection.
```

This closes the intelligence loop:

```text
HISTORICAL MATCH DATA
        ↓
OPPOSITION DOSSIER
        ↓
COACH PLAN
        ↓
LIVE DIRECTIVE
        ↓
CAPTAIN EXECUTION
        ↓
SCORING DATA
        ↓
TACTICAL ANALYSIS
        ↓
IMPROVED DOSSIER
```

---

## 28. Notification Priority

Not every tactical update should have the same urgency.

Recommended levels:

### P1 — Critical

Examples:

- immediate field correction;
- urgent bowling change;
- directive superseded before next delivery.

Strong visual and haptic signal.

### P2 — Tactical

Normal live directive.

Standard ping.

### P3 — Advisory

Information for the next over, batter or phase.

Low-priority visual cue.

This prevents notification fatigue.

---

## 29. Safety Rules

The following behaviours must never occur:

1. Stale directives surfaced as new instructions.
2. Opposition users accessing private tactics.
3. Cached writes displayed as server-confirmed.
4. Captain modifications overwriting coach instructions.
5. Directive state altering authoritative scoring truth.
6. Duplicate responses caused by retries.
7. Expired directives becoming active after reconnection.
8. Public spectator APIs exposing tactical content.
9. Old directive versions being silently accepted.
10. A captain receiving another team’s directives.

---

## 30. Implementation Phases

### Phase A — Real-Time Command Bus

Build:

- directive schema;
- Firestore projection;
- coach transmit;
- captain listener;
- delivery receipts;
- Accept;
- Modify;
- Dismiss;
- expiry;
- versioning;
- offline handling;
- security rules;
- audit events.

### Phase B — Scoring Integration

Add:

- active directive references;
- delivery outcome tagging;
- directive completion;
- automated scope handling;
- tactical result cards.

### Phase C — Tactical Intelligence

Add:

- success criteria;
- effectiveness scoring;
- coach/captain comparisons;
- batter/bowler tactical history;
- phase analytics;
- field-change effectiveness.

### Phase D — Predictive Match Intelligence

Eventually:

```text
SCRBRD detects situation
        ↓
Historical pattern search
        ↓
Suggested tactical plan
        ↓
Coach reviews
        ↓
Coach transmits
        ↓
Captain executes/modifies
        ↓
Outcome captured
        ↓
Model learns from result
```

Any machine-generated recommendation should remain advisory. The coach retains control of transmission and the captain retains legitimate on-field judgement.

---

## 31. Strategic Product Definition

This feature should be treated internally as:

# Tactical Directive Bus

rather than simply:

> Coach ↔ Captain Sync

The broader system becomes:

```text
COACH COCKPIT
      ↓
TACTICAL DIRECTIVE BUS
      ↓
CAPTAIN COCKPIT
      ↓
LIVE MATCH EXECUTION
      ↓
SCORING ENGINE
      ↓
PERFORMANCE ANALYST COCKPIT
      ↓
OPPOSITION DOSSIER
      ↓
FUTURE TACTICAL PLAN
```

This transforms the feature from a communication utility into a foundational component of SCRBRD’s **match-intelligence architecture**.

---

## 32. Product Principle

> **Capture intent. Record judgement. Measure execution. Learn from outcome.**

The competitive value is not that SCRBRD can send an instruction from one tablet to another.

The value is that SCRBRD can eventually understand the complete tactical chain:

```text
WHAT WAS INTENDED
        +
WHAT WAS DECIDED ON FIELD
        +
WHAT WAS EXECUTED
        +
WHAT ACTUALLY HAPPENED
        =
TACTICAL INTELLIGENCE
```

That dataset can power the Coach Cockpit, Captain Cockpit, Performance Analyst Cockpit, player development, opposition scouting and future decision-support systems while preserving the integrity of the underlying scoring record.
