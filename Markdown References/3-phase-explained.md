# SCRBRD 3-Phase Scoring Explained

For SCRBRD, **3-phase scoring** is a way of separating **what happened**, **how it happened**, and **what we learn from it**.

The key principle is:

> **Record the authoritative cricket result first. Enrich it immediately afterwards. Derive everything else from that record.**

That separation matters because the scorer’s first responsibility is to keep the match score **fast, accurate and legally correct**. Rich analytics must never slow down or compromise scoring.

---

## Phase 1 — SCORE

**Capture the delivery result.**

This is the minimum information SCRBRD needs to know what happened to the score.

For example:

**Ball 14.3**
- Bowler: M. Naidoo
- Batter: T. Smith
- Delivery: legal
- Batter runs: **4**
- Extras: **0**
- Wicket: **No**

The scorer can record this almost instantly.

From Phase 1 alone SCRBRD can correctly calculate:

- Team score
- Batter score
- Bowler figures
- Balls and overs
- Extras
- Wickets
- Partnerships
- Strike
- Required run rate
- Fall of wickets
- Scorecard
- Match state

This becomes part of the **authoritative, append-only scoring history**.

So if the match is moving quickly, the scorer can effectively keep operating at this level without losing the game.

---

## Phase 2 — ENRICH

**Describe the cricket event.**

Once the score-critical result has been captured, SCRBRD can add richer information about the delivery.

Using the same boundary:

**14.3 — FOUR**

Now we add:

- Shot: Cover drive
- Direction: Extra cover
- Wagon-wheel segment: 5
- Field zone: Deep
- Contact quality: Clean
- Footwork: Front foot
- Delivery line: Outside off
- Delivery length: Half-volley
- Bowling type: Right-arm fast-medium
- Trajectory / shot height
- Field placement
- Optional coaching tags

Visually you can think of it as:

**4 → Cover Drive → Extra Cover**

instead of forcing the scorer to enter:

**Cover Drive → Extra Cover → Grounded → Front Foot → Half Volley → Good Contact → 4**

before SCRBRD knows the batter actually scored four.

That distinction is important.

The old approach risks turning scoring into data entry.

The 3-phase model makes **the cricket result the priority**.

SCRBRD's capture profiles can therefore operate at different levels:

| Profile | Phase 1 | Phase 2 |
|---|---|---|
| **QUICK** | Full scoring | Minimal |
| **STANDARD** | Full scoring | Selected cricket context |
| **FULL** | Full scoring | Detailed analytical capture |

All three produce a valid scorecard.

FULL simply creates a much richer dataset.

---

## Phase 3 — INTELLIGENCE

**SCRBRD interprets the accumulated events.**

The scorer does not manually create most of this.

The system derives it from Phases 1 and 2.

For example, after enough deliveries SCRBRD might know:

**T. Smith**
- 67 off 52
- 11 boundaries
- 72% of runs through the off side
- 31 runs through cover
- Strike rate against pace: 148
- Strike rate against spin: 103
- Dot-ball percentage: 29%
- Average scoring zone: cover / extra cover
- Dismissal vulnerability: full deliveries moving into the stumps

And that can power:

- Wagon wheels
- Pitch maps
- Manhattan charts
- Worms
- Partnerships
- Batter-v-bowler analysis
- Shot distribution
- Boundary maps
- Field-placement analysis
- Player H2H
- Team H2H
- Match insights
- Season statistics
- Player development history
- Scouting reports
- Skills matrices
- Coaching intelligence

So the flow becomes:

**PHASE 1**  
## SCORE
*What happened?*

↓

**PHASE 2**  
## CONTEXT
*How did it happen?*

↓

**PHASE 3**  
## INTELLIGENCE
*What does it mean?*

---

## Wicket Example

Imagine this delivery:

**18.4 — Rabada to Pillay**

### Phase 1

Capture:

**WICKET — caught — 0 runs**

Then identify:

- Batter: Pillay
- Bowler: Rabada
- Fielder: Jacobs
- Dismissal: caught

The scoreboard can immediately move from:

**142/4 → 142/5**

### Phase 2

Add richer context:

- Length: short
- Line: outside off
- Shot: pull
- Contact: mistimed
- Direction: deep mid-wicket
- Catch location: deep mid-wicket
- Fielder: Jacobs

### Phase 3

SCRBRD can eventually recognise patterns such as:

> Pillay has been dismissed three times this season playing attacking cross-batted shots to short deliveries.

Now SCRBRD is not merely storing a scorecard.

It is building a **cricket intelligence dataset**.

---

## Why This Architecture Matters for SCRBRD

There is an assumption worth challenging:

> **More data captured during the match automatically means a better scoring system.**

It does not.

If SCRBRD asks a school scorer ten questions after every ball, the system becomes unbearable to use. At school cricket level especially, scorers may be pupils, parents, teachers or volunteers rather than professional analysts.

The hierarchy therefore has to be:

**Accuracy > Speed > Enrichment > Analytics**

not:

**Analytics > everything else.**

That is what 3-phase scoring protects.

Because Phase 1 is authoritative and later data is enrichment, SCRBRD can also handle:

- Poor connectivity
- Offline scoring
- Undo and correction
- Scorer handover
- Later enrichment
- Deterministic replay
- Auditability
- Historical reconstruction

more cleanly.

---

## The Broader SCRBRD Product Model

There is also a broader product idea behind 3-phase scoring:

## CAPTURE → UNDERSTAND → DEVELOP

### Capture

Capture the match through delivery-level scoring.

### Understand

Understand performance through contextual analytics.

### Develop

Develop the player by carrying that intelligence across matches, seasons, teams and their long-term player journey.

This is where 3-phase scoring becomes much more than a scoring UX pattern.

It becomes a foundational principle of the **SCRBRD data model, scoring architecture and player-intelligence system**.
