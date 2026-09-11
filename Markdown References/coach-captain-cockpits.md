# SCRBRD — Coach & Captain Cockpits

## 1. Product Principle

For SCRBRD, **Coach & Captain Cockpits** should be meaningfully different from ordinary dashboards.

A dashboard tells you **what is happening**. A cockpit should help you decide **what to do next**.

That distinction matters. Simply giving coaches and captains more charts does not create a cockpit — it creates a busier dashboard.

The four core match-intelligence experiences should therefore remain distinct:

- **Scorer:** Record reality.
- **Captain:** Execute decisions.
- **Coach:** Make decisions.
- **Analyst:** Explain why those decisions worked or failed.

SCRBRD becomes the intelligence layer connecting all four.

---

# 2. Coach Cockpit

The **Coach Cockpit** should be the tactical, developmental and selection command centre for the team.

Its purpose is to answer five questions quickly:

1. Who is available?
2. Who should play?
3. What is our plan?
4. What is happening in the match?
5. What intervention should I make?

---

## 2.1 Match Command

The primary live-match workspace.

### Match State

Surface the essential state of the match:

- Score / wickets
- Overs
- Required run rate
- Current run rate
- Projected score
- Target / DLS target where applicable
- Partnership
- Last wicket
- Current batters
- Current bowler
- Remaining bowlers
- Overs remaining per bowler
- Powerplay / fielding restriction state
- New-ball availability
- Match phase

SCRBRD should go beyond conventional scorecard information.

### Momentum

Show:

- Last 5 overs
- Runs / wickets
- Dot-ball percentage
- Boundary frequency
- Pressure index
- Partnership momentum
- Expected score trajectory
- Win probability, once the model and underlying dataset are sufficiently trustworthy

### Tactical Alerts

Potential alerts include:

- Batter struggling against a particular bowling type
- Batter repeatedly scoring through one zone
- Bowler losing length consistency
- Boundary leakage region
- High dot-ball pressure
- Partnership becoming dangerous
- Bowler approaching workload threshold
- Match-up opportunity identified
- Field placement deviation from plan

These should be presented as **recommendations or evidence**, not instructions.

Automated tactical recommendations can create false confidence when the available dataset is too small, context-poor or statistically weak. SCRBRD should expose the evidence and confidence behind recommendations wherever possible.

---

# 3. Three-Phase Scoring Intelligence

The Coach Cockpit should directly consume the richer data captured through SCRBRD's **3-phase scoring model**.

## Phase 1 — Outcome

Traditional scoring data:

> 4 runs

## Phase 2 — Delivery Context

How it happened:

> Right-arm fast | over the wicket | good length | outside off

## Phase 3 — Spatial / Tactical Context

Where and how the ball travelled:

> Back-foot punch | point | ground | Zone 7

The cockpit can therefore reconstruct:

> **Bowler → delivery → batter response → shot → destination → outcome**

This makes coaching intelligence considerably richer than a traditional scorebook.

A coach should be able to ask questions such as:

> Where is their opener scoring?

> What happens when we bowl short to him?

> Which length is creating the most false shots?

and receive an immediate, evidence-based answer.

---

# 4. Tactical Pitch Map

Provide an interactive pitch visualisation.

## Filters

- Batter
- Bowler
- Bowling type
- Length
- Line
- Over range
- Match phase
- Runs
- Dot balls
- Wickets
- Boundaries
- False shots

## Bowling Heatmap

Shows where deliveries are landing.

## Outcome Heatmap

Shows where runs are being conceded or prevented.

## Danger / Effectiveness Zones

Highlight delivery regions producing:

- Wickets
- Edges
- False shots
- Dot balls
- Boundaries
- High-value scoring opportunities

The distinction between delivery density and delivery effectiveness is important.

A simple bowling heatmap can be misleading. A bowler may consistently hit one area without that area actually producing effective outcomes.

---

# 5. Wagon Wheel Intelligence

The SCRBRD wagon wheel becomes a tactical intelligence tool inside the cockpit.

The coach should be able to switch between:

- Current batter
- Both batters
- Team
- Bowler vs batter
- Match phase
  - Powerplay
  - Middle overs
  - Death overs

## Filters

- Ground / aerial
- Boundary
- Runs
- Shot type
- Delivery length
- Delivery line
- Bowler
- Bowling type
- Match phase

Example insight:

> 62% of Batter A's scoring shots against pace are between point and cover.

The coach can then alter field placement, bowling line or delivery plan accordingly.

---

# 6. Field Setting Board

This should become one of SCRBRD's strongest tactical tools.

Provide an interactive cricket field with draggable players.

The coach can:

- Create field presets
- Save field plans by batter
- Save plans by bowler
- Switch between left- and right-handed batters
- Compare intended vs actual field
- Attach tactical notes
- Push a field plan to the Captain Cockpit

Example presets:

- Aggressive new-ball field
- Left-handed accumulator
- Death-over yorker plan
- Leg-spinner attacking field

During the match:

> Recommended field → Captain receives → Captain confirms or adjusts.

This creates a measurable collaboration loop between coach and captain.

---

# 7. Batter Match-Up Matrix

Provide a live match-up table.

| Batter | Bowler | Balls | Runs | SR | Dots | Boundaries | Dismissals |
|---|---:|---:|---:|---:|---:|---:|---:|

Historical SCRBRD data can enrich this with:

## Batter Weaknesses

- Short ball
- Full outside off
- Left-arm spin
- Leg spin
- Yorker
- Wide line

## Scoring Tendencies

- Preferred zone
- Preferred shot
- Boundary areas
- Rotation efficiency
- Dot-ball tendency
- Match-phase behaviour

The interface should distinguish between genuine long-term tendencies and conclusions drawn from small samples.

---

# 8. Bowler Management

The coach needs an immediate view of each bowler.

## Match Data

- Overs
- Maidens
- Runs
- Wickets
- Economy
- Dot percentage
- Boundary percentage
- Current spell
- Previous spell
- Remaining allocation

## Workload Intelligence

Where appropriate:

- Balls bowled today
- Balls bowled this week
- Previous match workload
- Training workload
- Medical or workload restrictions

### RBAC Requirement

Medical information requires strict role-based access.

A captain does **not** automatically need access to medical records simply because the coach has authorised access.

The captain may only need an operational status such as:

> **AVAILABLE**

or:

> **RESTRICTED — maximum 4 overs**

without being shown the medical reason for the restriction.

---

# 9. Team Selection

Before the match, the Coach Cockpit becomes a selection room.

## Squad Availability

- 🟢 Available
- 🟡 Limited
- 🔴 Unavailable
- ⚪ Unknown

Relevant selection information can include:

- Form
- Recent performances
- Training attendance
- Position
- Role
- Batting order
- Bowling type
- Skills matrix
- Workload
- Recent match participation
- Recent overs bowled
- Availability status

The coach creates and confirms:

- Starting XI
- Batting order
- Bowling plans
- Captain
- Vice-captain
- Wicketkeeper
- Substitutes / reserves

---

# 10. Player Development

The coach should be able to move directly from match evidence into player development.

## Form

Review:

- Last 5 innings
- Last 10 innings
- Season

## Batting

- Average
- Strike rate
- Boundary percentage
- Dot-ball percentage
- Dismissal types
- Shot distribution
- Scoring zones

## Bowling

- Economy
- Strike rate
- Average
- Dot-ball percentage
- Length consistency
- Line consistency
- Wicket zones

## Fielding

- Catches
- Drops
- Run-out involvement
- Fielding efficiency

## Skills Matrix

Connect evidence to player development across:

- Technical
- Tactical
- Physical
- Mental
- Fielding
- Leadership

This creates a direct link between match evidence, coaching observations, player-development plans and future selection.

---

# 11. Captain Cockpit

The **Captain Cockpit should not simply be a reduced Coach Cockpit**.

The captain is operating inside the match, often under significant cognitive load. The interface should therefore prioritise:

> **Immediacy over analysis.**

The distinction is:

**Coach = analysis + planning**

**Captain = execution + situational awareness**

---

# 12. Captain Cockpit — Core Match Screen

The primary screen should provide immediate match context without requiring interpretation of complex analytics.

Example:

```text
┌─────────────────────────────────────┐
│ 187/4            32.3 OVERS         │
│ RR 5.75          PROJECTED 286      │
└─────────────────────────────────────┘
```

## Current Match State

Display:

- Score
- Wickets
- Overs
- Current run rate
- Required run rate where applicable
- Projected score
- Partnership
- Match phase
- Momentum indicator

Example recent sequence:

```text
Last 5:
6 • 1 4 2 • | 1 W • 2 1 0
```

---

# 13. Current Batters

Example:

## Patel

**67 (71)**  
Strike rate: **94.3**

Primary scoring tendency:

> Cover ↑

## Naidoo

**18 (12)**  
Strike rate: **150**

Primary scoring tendency:

> Mid-wicket ↑

Only information that can influence an immediate tactical decision should dominate this view.

---

# 14. Current Bowler

Example:

## Daniels

**6.3–0–31–2**

Economy: **4.77**

Current spell:

```text
• 1 • W 2 •
```

Remaining allocation:

> **3.3 overs**

---

# 15. Captain Tactical Cards

Instead of large analytical modules, the captain receives compact, decision-oriented cards.

## Batter Tendency

> Patel has scored 68% of boundaries through the off side.

## Bowling Plan

> Daniels  
> Good length outside off.

## Field Plan

Show a visual field diagram with its source clearly identified.

Example:

> **Coach Recommended**

Captain actions:

- **ACCEPT**
- **MODIFY**
- **DISMISS**

The captain remains the on-field decision-maker. SCRBRD supports judgement rather than replacing it.

---

# 16. Over Planner

The Over Planner could become one of SCRBRD's signature tactical features.

Before an over:

## Over 33

**Bowler:** Daniels

### Intended Plan

1. Good length outside off
2. Same
3. Short surprise
4. Full
5. Good length
6. Yorker

Actual delivery data is captured underneath the plan as the over progresses.

At completion:

> **Plan adherence: 72%**

This creates valuable post-match coaching data because SCRBRD can compare **intent against execution**, rather than analysing outcomes without knowing what the team was trying to achieve.

---

# 17. Captain Decision Timeline

Important tactical decisions become logged events.

Example:

```text
17.2  Field changed
21.0  Bowling change
24.3  Slip removed
28.0  Spin introduced
31.0  Defensive field
```

These events become part of the match's tactical history and can later be compared against subsequent deliveries and outcomes.

Over time this allows SCRBRD to develop **captaincy analytics**.

---

# 18. Captaincy Analytics

Potential indicators include:

- Bowling change effectiveness
- Field adjustment effectiveness
- Wicket-after-change frequency
- Runs conceded after field changes
- Bowling rotation
- Match-up success
- Over allocation efficiency
- Review success where applicable
- Tactical plan adherence

SCRBRD should avoid prematurely reducing leadership to a simplistic metric such as:

> Captain rating: 87

Captaincy and leadership are highly contextual.

A stronger approach is to provide:

> **Decision Impact Indicators**

These show the measurable consequences surrounding decisions without pretending that every match situation can be reduced to one leadership score.

---

# 19. Coach ↔ Captain Communication

The two cockpits should operate as a connected tactical system.

```text
COACH
  ↓
TACTICAL PLAN
  ↓
CAPTAIN
  ↓
ON-FIELD EXECUTION
  ↓
SCRBRD DELIVERY DATA
  ↓
TACTICAL ANALYSIS
  ↓
COACH
```

Example:

The coach creates:

> Bowl wide outside off + protect cover boundary.

The Captain Cockpit receives:

> **TACTICAL PLAN**

The captain can:

- Accept
- Modify
- Dismiss

If accepted, the corresponding field diagram and bowling plan load.

The scorer continues capturing deliveries.

SCRBRD can subsequently evaluate the result:

```text
PLAN RESULT

12 balls
7 dots
8 runs
1 wicket
```

A tactical decision therefore becomes measurable.

---

# 20. Tactical Intent as Data

This is an important extension of SCRBRD's data model.

Traditional scoring records primarily tell us **what happened**.

Three-phase scoring adds significant context about **how it happened**.

Coach and Captain Cockpits introduce another valuable layer:

> **What were we trying to make happen?**

This creates a chain of:

```text
TACTICAL INTENT
      ↓
FIELD PLAN
      ↓
DELIVERY PLAN
      ↓
ACTUAL DELIVERY
      ↓
BATTER RESPONSE
      ↓
SHOT / EVENT
      ↓
OUTCOME
```

That relationship has significant long-term value for coaching, scouting and match intelligence.

---

# 21. Coach Cockpit — Bento UI Structure

For tablet and desktop, structure the Coach Cockpit as a modular bento workspace.

```text
┌──────────────────────────────────────────────────────────┐
│ MATCH HEADER                                             │
│ 187/4 · 32.3 · RR 5.75 · PROJECTED 286 · MOMENTUM ↗     │
└──────────────────────────────────────────────────────────┘

┌──────────────────┐ ┌─────────────────────────────────────┐
│ MATCH STATE      │ │ LIVE FIELD                          │
│                  │ │                                     │
│ Batters          │ │            FIELD MAP                │
│ Bowler           │ │                                     │
│ Partnership      │ │                                     │
└──────────────────┘ └─────────────────────────────────────┘

┌────────────────────────┐ ┌───────────────────────────────┐
│ WAGON WHEEL            │ │ PITCH MAP                     │
│                        │ │                               │
│                        │ │                               │
└────────────────────────┘ └───────────────────────────────┘

┌────────────────────────┐ ┌───────────────────────────────┐
│ MATCH-UPS              │ │ TACTICAL INSIGHTS             │
│                        │ │                               │
└────────────────────────┘ └───────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ BOWLING / OVER MANAGEMENT                               │
└──────────────────────────────────────────────────────────┘
```

The layout should follow SCRBRD's broader visual direction:

- Bento-box information architecture
- Material 3 principles
- Strong information hierarchy
- Subtle gradients
- Restrained liquid-glass influence
- Layered surfaces rather than excessive decoration
- High legibility during live match conditions
- Touch-friendly controls on tablets
- Responsive reflow for mobile

Visual sophistication must never compromise match-day speed or clarity.

---

# 22. Captain Cockpit — Bento UI Structure

Captain mode should be substantially simpler.

```text
┌─────────────────────────────────────┐
│ 187/4            32.3 OVERS         │
│ RR 5.75          PROJECTED 286      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ CURRENT MATCH PLAN                  │
│ Daniels → good length outside off   │
└─────────────────────────────────────┘

┌────────────────────┐ ┌──────────────┐
│ FIELD MAP          │ │ BATTER       │
│                    │ │ TENDENCY     │
│                    │ │ Cover 68%    │
└────────────────────┘ └──────────────┘

┌─────────────────────────────────────┐
│ NEXT OVER                           │
│ Daniels · 3.3 remaining             │
│ [ KEEP ]     [ CHANGE ]             │
└─────────────────────────────────────┘
```

The Captain Cockpit should minimise navigation depth and favour glanceable information.

---

# 23. RBAC and Privacy

Coach and Captain Cockpits must respect SCRBRD's strict role-based access architecture.

Access should be determined by:

- Person
- Role
- Team
- School
- Season
- Fixture
- Assignment status
- Data classification
- Safeguarding requirements

A captain should not inherit every permission granted to a coach.

Likewise, being assigned as captain for one fixture should not automatically provide access to information for other teams, seasons or players.

Particularly sensitive information — including medical, injury, safeguarding and private development information — should expose only the minimum operational information required by the user's role.

Example:

```text
Player: M. Naidoo
Match status: RESTRICTED
Bowling allocation: Maximum 4 overs
```

The captain does not need the underlying diagnosis or medical record.

---

# 24. Information Confidence

SCRBRD should distinguish between:

- Recorded fact
- Calculated statistic
- Historical tendency
- Modelled probability
- Tactical recommendation
- Human-entered coaching observation

These are not equivalent.

For example:

> Patel scores 68% of his boundaries through the off side.

may be statistically accurate but meaningless if based on eight deliveries.

Where appropriate, SCRBRD should surface:

- Sample size
- Data recency
- Confidence
- Competition level
- Relevant historical window

This protects coaches and captains from over-interpreting weak data.

---

# 25. Core Product Rule

SCRBRD should resist becoming **data pornography** — endless visualisations simply because the underlying dataset allows them.

Different match participants have fundamentally different cognitive requirements.

## Scorer

> **Record reality.**

Priorities:

- Accuracy
- Speed
- Laws compliance
- Minimal interaction cost
- Recovery / undo
- Offline resilience

## Captain

> **Execute decisions.**

Priorities:

- Situational awareness
- Immediate tactical context
- Field execution
- Bowling decisions
- Communication
- Minimal cognitive load

## Coach

> **Make decisions.**

Priorities:

- Tactical intelligence
- Match-ups
- Trends
- Player management
- Selection
- Intervention
- Development

## Analyst

> **Explain why they worked.**

Priorities:

- Deep filtering
- Historical comparison
- Pattern detection
- Tactical evaluation
- Opposition analysis
- Post-match reporting

These are four different UX problems and should not be collapsed into one generic match dashboard.

---

# 26. SCRBRD Match Intelligence Loop

The complete system can ultimately operate as:

```text
                    ┌───────────────┐
                    │     COACH     │
                    │ Decide / Plan │
                    └───────┬───────┘
                            │
                     Tactical Intent
                            │
                            ▼
                    ┌───────────────┐
                    │    CAPTAIN    │
                    │    Execute    │
                    └───────┬───────┘
                            │
                      Match Reality
                            │
                            ▼
                    ┌───────────────┐
                    │    SCORER     │
                    │    Record     │
                    └───────┬───────┘
                            │
                     Delivery Data
                            │
                            ▼
                    ┌───────────────┐
                    │    SCRBRD     │
                    │ Intelligence  │
                    └───────┬───────┘
                            │
                       Analysis
                            │
                            ▼
                    ┌───────────────┐
                    │    ANALYST    │
                    │   Interpret   │
                    └───────┬───────┘
                            │
                       New Insight
                            │
                            └──────────→ COACH
```

The value is not any individual chart.

The value is the **closed intelligence loop** connecting tactical intent, match execution, delivery-level evidence, analysis and future decisions.

---

# 27. Strategic Opportunity

If implemented correctly, Coach & Captain Cockpits move SCRBRD beyond being a digital scoring platform.

The platform begins capturing three distinct layers of cricket intelligence:

1. **Outcome** — what happened.
2. **Context** — how it happened.
3. **Intent** — what the team was trying to achieve.

That third layer is particularly important.

Most historical cricket datasets can reconstruct the first layer. More advanced systems increasingly capture the second. SCRBRD has an opportunity to structure the relationship between **coaching intent, captaincy decisions and delivery-level execution** from grassroots and school cricket upwards.

That can become valuable across:

- Live coaching
- Player development
- Opposition analysis
- Scouting
- Selection
- Captain development
- Post-match review
- Historical tactical analysis
- Skills matrices
- Performance analytics

The Coach and Captain Cockpits should therefore be designed not as isolated screens, but as two specialised interfaces into the same underlying **SCRBRD Match Intelligence System**.
