# SCRBRD Live Match UI System

## Broadcast-Inspired Match Centre, Scoring HUD & Spectator HUD

### Purpose

This document consolidates the UI/UX analysis of the SCRBRD live-scoring
interface and the supplied cricket broadcast references. The objective
is not to reproduce Fox Cricket, TNT Sports or other television graphics
literally, but to extract the strongest principles of broadcast
information design and apply them to SCRBRD.

The central recommendation is to treat the **Match Centre, Scoring HUD
and Spectator HUD as three interfaces powered by one live match state**,
rather than as three unrelated products.

The resulting system should combine broadcast-level information
hierarchy with SCRBRD's richer delivery-level data, analytics and
interactive capabilities.

------------------------------------------------------------------------

# 1. Core Design Insight

Professional cricket broadcast graphics consistently organise
information around a single dominant object:

> **The live score is the visual anchor.**

Everything else is subordinate to it.

SCRBRD should therefore enforce the hierarchy:

**MATCH STATE → CURRENT CONTEST → CONTEXT → INTELLIGENCE**

rather than treating the live interface as a collection of equally
weighted dashboard cards.

The existing SCRBRD concept already contains the correct fundamental
match state:

-   score/wickets
-   overs
-   striker
-   non-striker
-   current bowler
-   current over
-   target
-   required rate
-   match information
-   dynamic contextual information

The next step is to make this hierarchy more disciplined, compressed and
consistent.

------------------------------------------------------------------------

# 2. Progressive Disclosure

Broadcast systems do not show every available statistic simultaneously.
The amount and type of information changes according to the state of the
match.

During normal play, the viewer may see:

-   team
-   score
-   overs
-   striker
-   non-striker
-   bowler
-   current over
-   target/chase equation

At significant moments, the interface temporarily expands or changes to
show:

-   wicket
-   milestone
-   new batter
-   new bowler
-   innings summary
-   match summary
-   batting card
-   bowling card
-   fall of wickets
-   result

SCRBRD should formalise this as a three-tier information system.

## Tier 1 --- Always Visible

Persistent match truth:

-   Score
-   Wickets
-   Overs
-   Current run rate
-   Required run rate during a chase
-   Target/chase state where applicable

## Tier 2 --- Rotating Intelligence

Context that helps explain the match:

-   Partnership
-   Momentum
-   Milestones
-   Match-ups
-   Records
-   Projected score
-   Recent scoring rate
-   Batter/bowler trends
-   Phase analysis

## Tier 3 --- Event Interrupts

Temporary high-priority states:

-   Wicket
-   Fifty
-   Century
-   Hat-trick ball
-   Partnership milestone
-   Record
-   Pressure spike
-   Innings complete
-   Match result
-   Player of the Match

### Design principle

> **Always-visible truth. Rotating intelligence. Interrupt only for
> significance.**

This should become a core rule of the SCRBRD live design system.

------------------------------------------------------------------------

# 3. One Live Match State, Three Interfaces

SCRBRD should not independently design the Match Centre, scoring
interface and spectator scoreboard.

Instead, create a single canonical:

## SCRBRD Live Match State

The same state is rendered differently according to the user's role and
context.

  Information         Scorer HUD                  Match Centre       Spectator HUD
  ------------------- --------------------------- ------------------ -----------------
  Score               Critical                    Critical           Critical
  Overs               Critical                    Critical           Critical
  Striker             Interactive                 Prominent          Prominent
  Non-striker         Interactive                 Prominent          Prominent
  Bowler              Interactive                 Prominent          Prominent
  Current over        Interactive                 Prominent          Compact
  Required rate       Important                   Important          Important
  Partnership         Secondary                   Important          Rotating
  Wagon wheel         Data input/enrichment       Analytics          Optional
  Field placement     Data input/enrichment       Analytics          Rare
  Commentary          Optional                    Detailed           Rotating
  Predictions         Avoid during core scoring   Contextual         Optional
  Match-ups           Coaching context            Analytical         Rotating
  Undo/correction     Critical                    Hidden             Never
  Scoring controls    Critical                    Never              Never
  Milestones          Notification                Event feature      Event interrupt
  Sponsor inventory   Never                       Light/contextual   Yes

This provides consistency without forcing every user to see the same
interface.

------------------------------------------------------------------------

# 4. The SCRBRD Match HUD

A reusable **MatchHUD** should become the primary live-match component.

Example:

``` text
┌──────────────────────────────────────────────────────────────┐
│ KZN SUPER LEAGUE U16A                         LIVE ●         │
│                                                              │
│ DHS ●      DHS v WBHS        99/4        15.4        ● WBHS │
│                                    TARGET 143                │
├──────────────────────────────────────────────────────────────┤
│ ▶ LEWIS        11 (4)       HALL          15 (12)            │
├──────────────────────────────────────────────────────────────┤
│ MKHIZE    0.5   18/0        ●4 ●2 ●Wd ●3 ●1 ●6              │
├──────────────────────────────────────────────────────────────┤
│ Required 8.50    CRR 6.20    Partnership 8 (6)              │
└──────────────────────────────────────────────────────────────┘
```

The component should establish an immediate reading order:

1.  competition/live state
2.  teams
3.  score
4.  overs
5.  target/chase state
6.  batters
7.  bowler
8.  current over
9.  contextual intelligence

The current SCRBRD design direction contains these elements already. The
principal improvement should be **stronger hierarchy and greater visual
compression**.

------------------------------------------------------------------------

# 5. Responsive HUD Density

Broadcast graphics demonstrate how much useful information can be
compressed horizontally.

SCRBRD should create three density modes from the same component.

## Compact

For:

-   mobile sticky scorebar
-   spectator overlay
-   livestream graphics
-   small embedded widgets

Example:

``` text
DHS 99/4 · 15.4
Lewis 11* | Hall 15
Mkhize 0/18
```

## Standard

For:

-   primary Match Centre
-   tablet
-   mobile expanded state

Structure:

``` text
Team / Score / Overs
Batters
Bowler + Current Over
Match Intelligence
```

## Expanded

For:

-   desktop Match Centre
-   landscape tablet
-   pavilion displays
-   analysis views

Adds:

-   partnership
-   CRR/RRR
-   recent balls
-   projection
-   win probability where appropriate
-   phase analysis
-   contextual match-ups

The same component should respond to available space rather than
creating unrelated implementations.

------------------------------------------------------------------------

# 6. Score Hierarchy

The score must dominate the HUD.

For example:

**99/4**

should have substantially greater optical weight than:

**15.4 OVERS**

The score should generally appear approximately **2--2.5× the optical
prominence of the overs value**.

The hierarchy should be immediately understood without reading labels.

Suggested order:

1.  score/wickets
2.  batting team
3.  overs
4.  chase state
5.  active players
6.  current delivery context

------------------------------------------------------------------------

# 7. Striker State

Broadcast references make the active batter immediately identifiable.

SCRBRD should make the striker recognisable in a fraction of a second
using one or more of:

-   directional marker
-   active pill
-   subtle highlight
-   stronger typography
-   asterisk
-   restrained glow/accent

Example:

``` text
▶ LEWIS 11 (4)      HALL 15 (12)
```

or:

``` text
LEWIS 11* (4)       HALL 15 (12)
```

The active state must not depend solely on colour, both for
accessibility and rapid recognition.

------------------------------------------------------------------------

# 8. Colour as Information

The broadcast references use largely neutral foundations and reserve
colour for information.

SCRBRD should follow the same principle.

## Neutral foundation

-   deep charcoal
-   graphite
-   smoke
-   off-white/white

## Team identity

Each side may contribute its primary school/team colour, but team colour
should not overwhelm semantic states.

## Semantic colour

Suggested functions:

-   Green --- active, positive, confirmed
-   Amber --- warning, pressure, approaching threshold
-   Red --- wicket, dismissal, critical event
-   Blue --- neutral information
-   Purple --- intelligence/analysis, if required

## Delivery colours

Ball events can use a richer categorical palette because they encode
discrete outcomes:

``` text
0   ●
1   ●
2   ●
3   ●
4   ●
6   ●
Wd  ●
W   ●
```

The mistake to avoid is allowing every card and statistic to compete
through colour.

**Colour should explain state, not decorate the interface.**

------------------------------------------------------------------------

# 9. Delivery Timeline

The recent-ball sequence should be treated as a first-class match
component rather than decorative circles.

Example:

``` text
OVER 15

14.6    15.1    15.2    15.3    15.4
  1       4       •       W       2
          │               │
        FOUR           WICKET
```

This should become a reusable:

## `DeliveryTimeline`

On desktop/tablet, tapping or hovering over a delivery could reveal its
underlying SCRBRD event data:

``` text
15.3
Mkhize → Lewis

Length: Full
Line: Off stump
Shot: Drive
Zone: Cover
Outcome: W
Dismissal: Caught
```

This is an important point of differentiation from television graphics.

Broadcast tells the viewer **what happened**.

SCRBRD can expose **how it happened**.

------------------------------------------------------------------------

# 10. Persistent Match State in Match Centre

The live Match HUD should persist while users navigate between Match
Centre sections.

Recommended structure:

``` text
MATCH HEADER

LIVE MATCH HUD
────────────────────────────────────

SUMMARY | SCORECARD | PERFORMANCE |
COMMENTARY | LIVE FEED | MATCH DETAILS
```

Moving between tabs should not remove the current match state.

This gives SCRBRD the equivalent of television's persistent score bug
while allowing deeper exploration beneath it.

------------------------------------------------------------------------

# 11. Match Centre Information Architecture

Recommended desktop/tablet structure:

``` text
┌───────────────────────────────────────────────────────────────┐
│ Competition · Ground · Weather · LIVE                        │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│                    LIVE MATCH HUD                             │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│ Intelligence Ribbon                                           │
├───────────────────────────────┬───────────────────────────────┤
│ BATTERS                       │ BOWLER                        │
│ Lewis 44*                      │ Mkhize 0/18                  │
│ Hall 28                        │ Current Over                 │
├───────────────────────────────┼───────────────────────────────┤
│ Partnership                   │ Run-rate / Chase             │
├───────────────────────────────┼───────────────────────────────┤
│ Wagon Wheel                   │ Worm / Momentum              │
├───────────────────────────────┴───────────────────────────────┤
│ Commentary / Timeline                                         │
└───────────────────────────────────────────────────────────────┘
```

The design should retain SCRBRD's bento-box philosophy, but the boxes
should not receive equal visual priority.

The score is the anchor. Supporting modules progressively explain it.

------------------------------------------------------------------------

# 12. Intelligence Ribbon

The existing **Dynamic Content Bar** concept should evolve into a more
purposeful:

## Intelligence Ribbon

Rather than merely describing the mechanism as "dynamic content", the
name describes its value to the viewer.

Possible rotating states:

> Partnership: 43 from 27 balls

> Lewis needs 8 runs for 50

> DHS have scored 17 from the last 12 deliveries

> Lewis vs Mkhize: 21 runs from 13 balls

> Required rate has risen above 9.00

> WBHS need 44 from 26 balls

> 62% of Lewis's runs have come through the off side

The ribbon should rotate intelligently rather than randomly.

Priority should consider:

1.  match relevance
2.  recency
3.  statistical significance
4.  milestones
5.  tactical importance
6.  novelty

Repeated or low-value information should be suppressed.

------------------------------------------------------------------------

# 13. Event Interrupt System

Important match events should temporarily override the normal HUD
hierarchy.

## Wicket

``` text
              WICKET

            LEWIS 42

       DHS 112/5 · 16.2 OVERS
```

Followed by:

``` text
NEW BATTER
THABO NAIDOO
```

Then return to the normal HUD.

## Fifty

``` text
50
SEAN LEWIS

34 BALLS
6 × 4    2 × 6
SR 147.1
```

## Other event states

-   Century
-   Partnership 50/100
-   Hat-trick ball
-   Five-wicket haul
-   Record
-   New bowler
-   End of over
-   Innings complete
-   Target set
-   Match won
-   Player of the Match

These should be visually strong but temporary.

The system should distinguish between **important** and merely
**interesting** events so the interface does not constantly interrupt
itself.

------------------------------------------------------------------------

# 14. Broadcast-Style Innings Summary

The broadcast references demonstrate the effectiveness of summarising an
innings through only the most important performances.

Example:

## DHS 142/7 (20)

  Batting       Score Bowling     Figures
  --------- --------- --------- ---------
  Lewis       52 (37) Patel          3/24
  Hall        38 (29) Singh          2/31
  Naidoo      22 (11) Jacobs         1/18

**DHS set WBHS 143 to win**

Additional rotating insights could include:

-   most fours
-   most sixes
-   best strike rate
-   largest partnership
-   best economy
-   key phase

This is especially useful for spectators joining a match late.

------------------------------------------------------------------------

# 15. Match Summary

At innings breaks and after the match, the live HUD should be capable of
expanding into a broadcast-style Match Summary.

Example:

``` text
MATCH SUMMARY

DHS                 142/7
Lewis                52 (37)
Hall                 38 (29)
Naidoo               22 (11)

Patel                 3/24
Singh                 2/31
Jacobs                1/18


WBHS                 143/5
...
```

The result/chase state becomes a strong footer:

> **WBHS WIN BY 5 WICKETS**

or:

> **WBHS REQUIRE 143 TO WIN**

This component can also power shareable match-result graphics.

------------------------------------------------------------------------

# 16. Player Drill-Down

Broadcast graphics must remain passive and concise. SCRBRD does not have
that limitation.

Selecting:

**LEWIS 44\* (31)**

could expand into:

``` text
Sean Lewis
44 (31)

SR              141.9
4s                  5
6s                  1

Wagon Wheel
[visualisation]

vs Pace        30 (19)
vs Spin        14 (12)

Dot Balls          26%
Boundary %         19%

Last 10 balls
1 4 0 2 1 0 6 1 4 2
```

Further data could include:

-   scoring zones
-   wagon wheel
-   shot distribution
-   boundary distribution
-   strike rotation
-   phase performance
-   bowler match-ups
-   historical comparison
-   milestones
-   season context

The broadcast-inspired HUD therefore becomes the **entry layer into
deeper SCRBRD intelligence**, not the entire experience.

------------------------------------------------------------------------

# 17. Scorer HUD

The scorer interface should share SCRBRD's visual language but should
**not simply imitate the spectator interface**.

The scorer's priorities are:

1.  speed
2.  accuracy
3.  error prevention
4.  confirmation
5.  recovery
6.  visual polish

The scorer HUD should therefore use the same:

-   score treatment
-   typography
-   team identity
-   batter/bowler treatment
-   Delivery Timeline
-   event language

while exposing scoring controls beneath it.

Example:

``` text
LIVE MATCH HUD

────────────────────────────────

CURRENT DELIVERY / ENRICHMENT

0    1    2    3    4    6

EXTRAS        WICKET

UNDO          CORRECT
```

This should connect directly to SCRBRD's three-phase scoring workflow.

The broadcast HUD represents the **feedback state**.

The scoring controls represent the **interaction state**.

These two concepts should remain visually related but functionally
distinct.

------------------------------------------------------------------------

# 18. Three-Phase Scoring Integration

The Match HUD should remain stable while the scoring interaction changes
through the scoring sequence.

A conceptual workflow:

## Phase 1 --- Enrich

Capture contextual delivery information where required:

-   field
-   line
-   length
-   shot
-   zone
-   approach
-   field placement
-   other analytical enrichment

## Phase 2 --- Score

Capture the official outcome:

-   dot
-   1
-   2
-   3
-   4
-   6
-   extras
-   wicket

## Phase 3 --- Confirm / Resolve

Resolve exceptional or compound states:

-   wicket type
-   dismissed batter
-   fielder
-   run-out details
-   crossing/end state
-   extras detail
-   free hit
-   correction/validation

The score HUD provides immediate visual feedback after the event is
committed.

The interaction should be optimised for the scorer; the resulting state
should automatically feed the Match Centre and spectator interfaces.

------------------------------------------------------------------------

# 19. Spectator Score HUD

The spectator HUD should be considerably simpler than the scorer
interface.

Example:

``` text
DHS                         WBHS

99/4                        TARGET 143
15.4

LEWIS 11* (4)
HALL 15 (12)

MKHIZE 0/18 (0.5)

4 · 2 · Wd · 3 · 1 · 6

Need 44 from 26 balls
RRR 10.15
```

The spectator does **not** need:

-   undo
-   correction
-   scoring validation
-   field-placement controls
-   scorer session status
-   administrative controls
-   three-phase workflow controls

The spectator should receive the result of the scoring workflow, not the
workflow itself.

------------------------------------------------------------------------

# 20. Mobile Spectator Experience

The mobile Match Centre should begin with a compact, persistent live
score object.

Suggested hierarchy:

``` text
LIVE · KZN SUPER LEAGUE

DHS               WBHS
99/4              TARGET 143
15.4 OVERS

Lewis 11* (4)     Hall 15 (12)

Mkhize 0/18 (0.5)
4  2  Wd  3  1  6

Need 44 from 26
RRR 10.15
```

Below it, use swipeable or vertically stacked bento modules for:

-   partnership
-   commentary
-   wagon wheel
-   match momentum
-   scorecard
-   player statistics
-   match-ups
-   innings summaries

The live score should remain accessible even deep inside the Match
Centre.

------------------------------------------------------------------------

# 21. Match Centre Navigation

Recommended primary navigation:

-   Summary
-   Scorecard
-   Performance
-   Commentary
-   Live Feed
-   Match Details

Potential analytical sub-navigation:

-   Partnerships
-   Wagon Wheel
-   Worm
-   Manhattan
-   Match-ups
-   Phase Analysis
-   Fall of Wickets

Do not expose every analytical view at the top level.

The navigation hierarchy should preserve simplicity for spectators while
allowing deeper exploration for advanced users.

------------------------------------------------------------------------

# 22. Material 3 + Liquid Glass Treatment

SCRBRD can retain its intended Material 3/bento-box language with a
subtle liquid-glass influence, but broadcast discipline should govern
it.

Recommended treatment:

-   dark neutral canvas
-   slightly elevated graphite surfaces
-   restrained translucency
-   subtle blur where background context exists
-   thin keylines rather than heavy borders
-   large-radius containers
-   minimal shadows
-   selective gradients
-   bright semantic accents
-   high-contrast numerical typography
-   compact metadata

Avoid:

-   excessive glow
-   multiple competing gradients
-   every module appearing as a floating glass card
-   decorative transparency behind critical scoring controls
-   low-contrast text
-   excessive rounded-pill treatment

Glass should create **depth and hierarchy**, not visual noise.

------------------------------------------------------------------------

# 23. Bento Layout Rules

The bento system should not imply that every tile is equally important.

Recommended hierarchy:

## Level A --- Hero

Live Match HUD

## Level B --- Current Contest

-   batters
-   bowler
-   partnership
-   chase equation

## Level C --- Match Intelligence

-   wagon wheel
-   momentum
-   worm
-   match-ups
-   projections

## Level D --- Supporting Information

-   conditions
-   weather
-   venue
-   officials
-   squads
-   match metadata

Card size should communicate importance.

------------------------------------------------------------------------

# 24. Sponsorship and Advertising

The spectator interface creates appropriate sponsor inventory, but
advertising should remain separate from protected player data and should
not interfere with scoring or coaching workflows.

Potential spectator placements:

-   Match HUD sponsor lock-up
-   innings summary
-   wagon-wheel perimeter/visual sponsorship
-   boundary/venue visualisation
-   Match Summary
-   Player of the Match
-   milestone cards
-   livestream overlay
-   result graphics

Advertising should be:

-   geo-scoped
-   school-scoped
-   tournament-scoped
-   venue-scoped
-   match-scoped

The Scorer HUD should remain operationally clean and advertising-free.

------------------------------------------------------------------------

# 25. Accessibility

Broadcast-inspired density must not compromise accessibility.

Requirements should include:

-   high text/background contrast
-   no state communicated by colour alone
-   scalable typography
-   minimum touch-target sizes
-   clear focus states
-   reduced-motion support
-   screen-reader labels
-   meaningful semantic ordering
-   sufficient differentiation between team and event colours

Animations for wickets, milestones and transitions should respect
reduced-motion settings.

------------------------------------------------------------------------

# 26. Motion System

Motion should communicate match-state change.

Suggested behaviour:

### Delivery scored

Small numerical transition and Delivery Timeline insertion.

### Boundary

Brief accent pulse.

### Wicket

Tier 3 event interrupt.

### Milestone

Short player-focused expansion.

### End of over

Delivery Timeline resolves into over summary.

### New batter/bowler

Context card transition.

### Innings complete

HUD expands into Innings Summary.

### Match complete

Transition to Match Summary/result state.

Avoid constant ambient animation. Motion should mean something.

------------------------------------------------------------------------

# 27. SCRBRD Live Visual System

The broader recommendation is to build a reusable design system rather
than redesign individual pages independently.

## Core components

-   `ScoreBug`
-   `MatchHUD`
-   `ExpandedMatchHUD`
-   `DeliveryTimeline`
-   `IntelligenceRibbon`
-   `ChaseEquation`
-   `PartnershipCard`
-   `BatterCard`
-   `BowlerCard`
-   `PlayerSpotlight`
-   `WagonWheel`
-   `MatchMomentum`
-   `InningsSummary`
-   `MatchSummary`
-   `BattingCard`
-   `BowlingCard`
-   `FallOfWickets`
-   `OverSummary`
-   `WicketEvent`
-   `MilestoneEvent`
-   `NewBatter`
-   `NewBowler`
-   `ResultCard`
-   `PlayerOfTheMatch`

------------------------------------------------------------------------

# 28. Multi-Surface Output

The same component system can ultimately power:

-   SCRBRD mobile app
-   SCRBRD web Match Centre
-   scorer tablet
-   captain/coach match interfaces
-   spectator tablet
-   school pavilion display
-   electronic scoreboard
-   livestream overlay
-   YouTube stream
-   tournament display
-   social match graphics
-   result cards
-   school websites

The underlying match state remains canonical while presentation changes
according to surface and role.

------------------------------------------------------------------------

# 29. Product Opportunity

The broadcast references should not lead SCRBRD towards becoming a copy
of television graphics.

They reveal the missing design discipline:

-   strong hierarchy
-   compression
-   progressive disclosure
-   temporal behaviour
-   event prioritisation
-   visual restraint

SCRBRD adds capabilities television graphics generally cannot expose
interactively:

-   delivery-level data
-   shot data
-   field placement
-   wagon wheels
-   player histories
-   head-to-head intelligence
-   match-ups
-   season statistics
-   tactical analysis
-   interactive scorecards
-   player development context

The strategic opportunity is therefore larger than a redesigned Match
Centre.

## SCRBRD can become a broadcast graphics and match-intelligence engine for school sport.

The live scoring system creates the data.

The Match Centre explains it.

The spectator HUD broadcasts it.

The analytical layer interrogates it.

The same event stream should power all four.

------------------------------------------------------------------------

# 30. Recommended Design Principle

The live SCRBRD experience should be governed by one sentence:

> **Always-visible truth. Rotating intelligence. Interrupt only for
> significance.**

Applied correctly, this creates a system that feels immediate like a
television broadcast, interactive like a modern sports application, and
considerably richer than either because it is built directly on SCRBRD's
structured match data.

------------------------------------------------------------------------

## Recommended Next Design Deliverables

The next UI/UX phase should translate this system into:

1.  **Match HUD component specification**
2.  **Scorer HUD specification**
3.  **Spectator HUD specification**
4.  **Desktop Match Centre wireframe**
5.  **Mobile Match Centre wireframe**
6.  **Landscape tablet Match Centre**
7.  **Event Interrupt state library**
8.  **Innings/Match Summary templates**
9.  **Livestream Score Bug**
10. **SCRBRD Live Visual System design tokens and component states**

These should be designed as one coherent system rather than isolated
screens.
