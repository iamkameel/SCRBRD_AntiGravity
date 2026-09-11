# SCRBRD Opposition Scouting & Dossier Generator
## Performance Analyst Cockpit

**Product:** SCRBRD / ScrbrdOS  
**Module:** Performance Analyst Cockpit  
**Feature:** Opposition Scouting & Dossier Generator  
**Primary sport:** Cricket  
**Primary users:** Performance Analysts, Head Coaches, Assistant Coaches, Captains  
**Status:** Product definition / functional specification  

---

## 1. Executive Summary

The Opposition Scouting & Dossier Generator is SCRBRD's dedicated competitive-intelligence environment for analysing opposition teams, players, tactical behaviour, matchup tendencies, spatial scoring patterns and match-specific risks.

The purpose of the module is not merely to generate a static scouting report. It should operate as a continuous intelligence system that:

1. collects relevant opposition evidence;
2. identifies repeatable patterns;
3. distinguishes facts from inferred tendencies;
4. allows analyst validation and override;
5. converts approved intelligence into tactical recommendations;
6. distributes role-specific match briefs;
7. monitors whether pre-match assumptions remain valid during the fixture; and
8. learns from the post-match outcome.

The operating principle is:

> **SCRBRD collects the evidence → detects tendencies → surfaces patterns → proposes hypotheses → the analyst validates them → SCRBRD packages approved intelligence into a match-ready dossier.**

This is especially important in school cricket, where sample sizes may be small, player development can be rapid, team selections may vary significantly and historical data can lose relevance quickly.

The system must therefore prioritise transparency, evidence quality, confidence scoring and human analyst judgement.

---

# 2. Product Objective

The Performance Analyst Cockpit should help the coaching team answer five fundamental questions.

| Question | SCRBRD Output |
|---|---|
| Who are we playing? | Opposition profile and context |
| How do they normally play? | Tactical identity and behavioural patterns |
| Who can hurt us? | Key-player threat analysis |
| Where are they vulnerable? | Exploitable patterns and matchups |
| What should we do about it? | Evidence-backed tactical plan |

The objective is to convert SCRBRD's ball-by-ball, spatial, player, team, historical and scouting datasets into **actionable cricket intelligence**.

---

# 3. Strategic Product Principle

SCRBRD should not become a platform that simply says:

> “AI has analysed your opponent.”

That framing creates false certainty.

Instead, every insight should be traceable back to:

- matches;
- deliveries;
- player samples;
- opposition quality;
- dates;
- venues;
- analyst observations;
- scoring zones;
- bowling locations;
- match phases;
- head-to-head history; and
- confidence levels.

The information hierarchy should always be:

> **What matters?**  
> ↓  
> **Why does it matter?**  
> ↓  
> **What should we do?**  
> ↓  
> **Show me the evidence.**

This prevents the cockpit from becoming an overload of statistics and visualisations without tactical meaning.

---

# 4. Core Intelligence Workflow

The module should follow a structured intelligence pipeline.

```text
Opponent
   ↓
Evidence
   ↓
Analysis
   ↓
Patterns
   ↓
Hypotheses
   ↓
Analyst Validation
   ↓
Tactical Plan
   ↓
Dossier
   ↓
Matchday Intelligence
   ↓
Post-Match Review
   ↓
Updated Opposition Memory
```

---

# 5. Phase A — Opposition Selection

The analyst begins by selecting the upcoming fixture.

Example:

```text
Westville Boys' High School 1st XI
vs
Durban High School 1st XI

Saturday 19 September
09:30
50-over match
WES Oval
```

SCRBRD should automatically resolve:

- opponent;
- competition;
- venue;
- format;
- current season;
- historical meetings;
- recent opposition fixtures;
- expected squad;
- known player records;
- team-role assignments;
- probable batting order;
- probable bowling attack;
- previous scouting reports;
- available media;
- analyst observations;
- head-to-head data;
- player-v-player data;
- venue-specific performance; and
- competition-specific performance.

---

# 6. Cockpit Landing Screen

The Performance Analyst Cockpit should use SCRBRD's broader design language:

- bento-box layout;
- Material 3 influence;
- restrained gradients;
- subtle liquid-glass surfaces;
- dense analytical information;
- strong hierarchy;
- interactive filtering; and
- progressive disclosure.

The analyst interface should feel more information-dense than spectator-facing SCRBRD screens.

## 6.1 Header

```text
Opposition Intelligence

WES 1st XI vs DHS 1st XI
Saturday · 09:30 · WES Oval

Dossier Completion: 78%
```

Primary actions:

- Refresh Data
- Add Observation
- Generate Analysis
- Review Dossier
- Publish
- Export
- Compare
- Open Match Plan

---

## 6.2 Intelligence Summary Cards

Suggested bento cards:

| Card | Example |
|---|---|
| Opposition Form | W W L W W |
| Games Analysed | 12 |
| Deliveries Analysed | 3,486 |
| Expected XI Confidence | 83% |
| Batting Power Index | 82 |
| Bowling Threat Index | 76 |
| Powerplay Strength | High |
| Middle-Overs Stability | Moderate |
| Death-Overs Strength | Weak |
| Spin Exposure | High |
| Left-Arm Pace Exposure | Moderate |
| Tactical Shift | Detected |
| Data Confidence | 86% |
| Last Updated | 2 hours ago |

A prominent **Data Confidence** indicator should appear throughout the module.

---

# 7. Data Confidence Model

SCRBRD should never present weak evidence as strong certainty.

Every material insight should include:

- source count;
- sample size;
- recency;
- competition relevance;
- venue relevance;
- data completeness;
- direct versus modelled evidence;
- confidence score; and
- analyst status.

Example:

```text
Vulnerable against left-arm seam
Confidence: 72% — Moderate

Based on:
142 deliveries
7 innings
3 dismissals
September 2025 – August 2026
```

Suggested confidence labels:

- 90–100%: Very High
- 75–89%: High
- 60–74%: Moderate
- 40–59%: Low
- Below 40%: Insufficient Evidence

Low-confidence conclusions should not be shown as definitive tactical instructions.

---

# 8. Opposition Team DNA

Each opponent should have an evolving tactical identity.

Example:

## DHS 1st XI — Team DNA

### Batting Identity

- aggressive top order;
- high boundary dependence;
- strong against pace;
- less productive against wrist spin;
- increased dot-ball pressure in middle overs;
- prefers scoring square of the wicket;
- often accelerates immediately after bowling changes.

### Bowling Identity

- new-ball seam emphasis;
- attacking powerplay fields;
- heavy dependence on two strike bowlers;
- reduced control from fifth bowler;
- slower-ball usage increases late in innings;
- defensive fields introduced rapidly after boundaries.

### Fielding Identity

- strong inner-ring pressure;
- aggressive catching positions early;
- high-quality close catching;
- average boundary prevention;
- strong throwing arms from deep square.

### Match Behaviour

- often chooses to bat when winning toss;
- attacks early;
- consolidates after losing wickets;
- uses strike bowlers aggressively after breakthroughs;
- can become conservative when defending below-par totals.

---

# 9. Form Intelligence

The platform should move beyond simple win/loss sequences.

Instead of:

```text
W W L W L
```

SCRBRD should identify the reason behind the results.

Example:

| Opposition | Result | Key Pattern |
|---|---|---|
| Hilton | Won | Openers contributed 132 |
| Kearsney | Won | New-ball attack took 4 wickets |
| Northwood | Lost | Middle-order collapse against spin |
| Glenwood | Won | Successful chase |
| Maritzburg College | Lost | Batting collapse in overs 18–27 |

Suggested generated insight:

> Both recent defeats involved significant middle-order deterioration after spin was introduced between overs 17 and 25.

This is more actionable than simply recording two losses.

---

# 10. Squad Intelligence

Each probable opposition player should have a dedicated scouting profile.

Example:

## A. Naidoo

**Role:** Opening batter  
**Batting:** Right-handed  
**Bowling:** Occasional off-spin  

### Season Metrics

| Metric | Value |
|---|---:|
| Runs | 624 |
| Average | 48.0 |
| Strike Rate | 91.7 |
| Boundary Percentage | 57% |
| Balls per Boundary | 8.1 |
| Dot-Ball Percentage | 31% |
| Powerplay Strike Rate | 101 |
| Middle-Overs Strike Rate | 78 |

### Dismissal Profile

| Type | Percentage |
|---|---:|
| Caught | 39% |
| Bowled | 18% |
| LBW | 16% |
| Run Out | 8% |
| Other | 19% |

### Observed Strengths

- strong square of the wicket;
- strong against short bowling;
- productive through cover;
- rotates strike effectively early.

### Potential Vulnerabilities

- left-arm seam across the body;
- fuller deliveries outside off;
- leg-spin after settling;
- reduced scoring rate immediately after powerplay.

---

# 11. Player Threat Model

Players should not be reduced to a single unexplained number.

SCRBRD should use a multidimensional threat model.

Example:

## Batting Threat

| Dimension | Score |
|---|---:|
| Current Form | 88 |
| Run Production | 84 |
| Boundary Threat | 91 |
| Strike Rotation | 74 |
| Pressure Resistance | 82 |
| Match Impact | 89 |

### Overall Threat Rating

**87 / 100**

The UI should explain the score's underlying drivers.

---

# 12. Wagon-Wheel Intelligence

SCRBRD's wagon-wheel dataset should become a tactical-analysis tool rather than only a visualisation.

Example distribution:

| Zone | Share |
|---|---:|
| Cover | 22% |
| Midwicket | 19% |
| Square Leg | 15% |
| Point | 14% |
| Straight | 12% |
| Third Man | 8% |
| Other | 10% |

The analyst should be able to view wagon wheels filtered by:

- pace;
- spin;
- left-arm pace;
- right-arm pace;
- off-spin;
- leg-spin;
- first 20 balls;
- balls 21–50;
- powerplay;
- middle overs;
- death overs;
- wickets in hand;
- pressure state;
- venue;
- competition;
- bowler type;
- individual bowler.

This should reveal how a batter's scoring geography changes under different conditions.

---

# 13. Bowling Location Heatmaps

For each batter, SCRBRD should display delivery-location maps with outcomes.

Conceptual model:

```text
              SHORT
      ┌────────┬────────┬────────┐
OFF   │        │        │        │
      ├────────┼────────┼────────┤
      │        │        │        │
      ├────────┼────────┼────────┤
LEG   │        │        │        │
      └────────┴────────┴────────┘
               FULL
```

Heatmap overlays may include:

- runs per delivery;
- strike rate;
- dot-ball percentage;
- boundary percentage;
- dismissal percentage;
- false-shot percentage;
- control percentage;
- average launch direction;
- expected scoring outcome.

Example tactical conclusion:

> Fuller deliveries in the fourth-stump channel have produced 4 dismissals from 71 deliveries while conceding only 3.2 runs per over.

This is stronger than a generic instruction such as:

> Bowl outside off stump.

---

# 14. Dismissal Intelligence

SCRBRD should analyse dismissal sequences rather than only the dismissal type.

Example:

## A. Naidoo — Last 10 Dismissals

- 4 caught behind
- 2 LBW
- 1 bowled
- 1 caught midwicket
- 2 run out

The more valuable layer is the sequence before dismissal.

### Pre-Dismissal Pattern

Three dismissals followed:

```text
Dot → Dot → Attacking Stroke
```

Two dismissals followed:

```text
Spinner Introduced
   ↓
Scoring Rate Reduced
   ↓
Pressure Increased
   ↓
Lofted Shot
   ↓
Dismissal
```

This turns dismissal data into behavioural scouting.

---

# 15. Bowler Intelligence

Each opposition bowler should have a usage and effectiveness profile.

Example:

## S. Mthembu

**Bowling:** Right-arm Fast-Medium

| Metric | Value |
|---|---:|
| Overs | 102 |
| Wickets | 28 |
| Economy | 3.77 |
| Strike Rate | 21.8 |

### Usage by Match Phase

| Phase | Usage |
|---|---:|
| Powerplay | 56% |
| Middle Overs | 19% |
| Death Overs | 25% |

### Delivery Profile

| Delivery Type | Share |
|---|---:|
| Good Length | 41% |
| Full | 28% |
| Short | 17% |
| Yorker | 9% |
| Other | 5% |

SCRBRD should allow analysts to view:

> release → pitch location → outcome

Example generated insight:

> Mthembu attacks fourth stump to right-handed batters during his first two overs.

Another:

> His economy rises from 3.2 to 5.7 once he reaches his fifth consecutive over.

---

# 16. Bowling Variation Detection

Where scoring metadata supports it, SCRBRD should track:

- slower ball;
- cutter;
- yorker;
- short ball;
- inswing;
- outswing;
- seam-away;
- leg-spin;
- googly;
- off-spin;
- arm ball;
- top-spinner;
- change of pace.

Example:

## Death Overs Variation Mix

| Variation | Share |
|---|---:|
| Slower Ball | 31% |
| Yorker | 27% |
| Length Ball | 19% |
| Short Ball | 14% |
| Other | 9% |

Possible generated insight:

> Expect slower-ball variation when the batter advances down the pitch.

This should carry an explicit confidence rating.

---

# 17. Batter vs Bowler Matchup Engine

This should become a core strategic feature.

Example:

## K. Singh vs A. Naidoo

**Matchup:** Leg-spin vs RHB

| Metric | Value |
|---|---:|
| Balls | 34 |
| Runs | 21 |
| Dismissals | 3 |
| Strike Rate | 61.8 |
| Dot-Ball Percentage | 52% |

### Matchup Status

**Favourable Matchup**

Confidence: **High**

---

# 18. Direct vs Modelled Matchups

SCRBRD must differentiate between:

## Direct Matchup

Actual player-versus-player evidence.

Example:

> Singh has bowled 34 deliveries to Naidoo.

## Modelled Matchup

Statistical approximation based on similar bowling and batting profiles.

Example:

> Naidoo has never faced Singh directly, but performs below average against right-arm leg-spin and Singh performs strongly against right-handed opening batters.

These should never be displayed as equivalent evidence.

---

# 19. Similarity Matching

Where direct H2H data is absent, SCRBRD can compare:

- batter vs bowling type;
- bowler vs batter type;
- batter vs delivery characteristics;
- bowler vs scoring zones;
- player vs competition tier;
- player vs venue type;
- player vs game phase.

The UI should make it clear that this is a **modelled projection**, not historical fact.

---

# 20. Team Phase Analysis

For limited-overs cricket, SCRBRD should analyse team performance by phase.

Suggested phases:

- Powerplay
- Early Middle Overs
- Late Middle Overs
- Death Overs

Example:

| Phase | Opposition | Competition Avg |
|---|---:|---:|
| Powerplay RR | 6.1 | 4.8 |
| Middle Overs RR | 4.1 | 4.6 |
| Death Overs RR | 6.3 | 7.0 |

Generated tactical interpretation:

> Opposition is strongest during the powerplay but underperforms competition average through the middle overs.

Potential strategic response:

> Increase pressure between overs 11 and 30.

---

# 21. Partnership Intelligence

SCRBRD should identify partnerships that materially affect opposition performance.

Example:

## Naidoo + Pillay

| Metric | Value |
|---|---:|
| Average Partnership | 71 |
| Share of Team Runs | 32% |
| Innings Together | 9 |
| Average Balls Together | 84 |

Potential tactical insight:

> Removing either player before the partnership reaches 30 materially reduces DHS's projected innings total.

The system should also identify:

- highest-value partnerships;
- recurring stabilisation pairs;
- acceleration partnerships;
- collapse-prevention combinations;
- opening partnerships;
- lower-order recovery pairs.

---

# 22. Collapse Detection

SCRBRD should detect sequences of clustered wickets.

Example:

```text
132/2
138/3
143/4
146/5
```

The system should investigate possible triggers such as:

- bowling change;
- introduction of spin;
- sustained dot-ball pressure;
- field change;
- required run-rate increase;
- partnership break;
- new batter exposure;
- phase transition.

Potential collapse signature:

```text
Spinner Introduced
   ↓
Run Rate Declines
   ↓
Dot-Ball Pressure Increases
   ↓
Attacking Stroke
   ↓
Wicket
   ↓
New Batter Under Pressure
   ↓
Second Wicket
```

Collapse signatures should be surfaced prominently.

---

# 23. Field Placement Intelligence

SCRBRD can use spatial data to propose field plans.

Example:

## Recommended Field — A. Naidoo vs Leg-Spin

Suggested positions:

- Slip
- Backward Point
- Cover
- Long-Off
- Long-On
- Deep Midwicket
- Square Leg

Evidence:

> 61% of boundary attempts against leg-spin have targeted the leg-side arc.

Each recommended field should include:

- objective;
- bowler type;
- batter state;
- scoring zones to protect;
- catching zones;
- boundary zones;
- probability/confidence;
- analyst notes.

---

# 24. Tactical Scenario Generator

The cockpit should support interactive tactical scenarios.

Example input:

```text
Defending 220
Opposition 87/1
Over 16
Naidoo 44*
Pillay 21*
```

SCRBRD may return:

### Tactical Objective

Reduce boundary frequency and increase dot-ball pressure.

### Bowling Recommendation

Introduce wrist spin.

### Field Recommendation

- Deep Midwicket
- Long-On
- Deep Cover

### Supporting Evidence

Naidoo strike rate against spin: **69**

Naidoo strike rate against pace: **104**

This allows preparation for realistic match situations.

---

# 25. Strength / Vulnerability Matrix

A high-level matrix should summarise the opponent.

| Area | Rating |
|---|---|
| Opening Batting | Strong |
| Middle Order | Moderate |
| Lower Order | Weak |
| New-Ball Bowling | Strong |
| Spin | Moderate |
| Fifth Bowler | Weak |
| Fielding | Strong |
| Chasing | Moderate |
| Defending | Strong |

Suggested colour logic:

- Green: Strong
- Amber: Moderate
- Red: Vulnerable

This becomes one of the fastest coach-facing summaries.

---

# 26. Tactical Opportunity Cards

Important opportunities should be surfaced as concise, actionable cards.

Example:

## Opportunity 01

**Attack middle overs with wrist spin**

Confidence: **High**

Evidence:

- Opposition SR vs wrist spin: 67
- Competition average: 82

---

## Opportunity 02

**Target fifth bowler**

Confidence: **High**

Evidence:

- Fifth bowler economy: 6.7
- Primary bowlers economy: 4.1

---

## Opportunity 03

**Protect square-leg boundary against Naidoo**

Confidence: **Moderate**

Evidence:

- 39% of boundaries in previous six innings travelled through the leg-side square arc.

---

# 27. Analyst Notes

Quantitative analytics should be supplemented with qualitative analyst observations.

Suggested categories:

### Technical

Example:

> Front-foot movement appears early.

### Behavioural

Example:

> Appears frustrated after sustained dot-ball pressure.

### Tactical

Example:

> Leaves crease regularly against spin.

### Fielding

Example:

> Strong throwing arm from deep.

### Selection Context

Example:

> Recently promoted to opening position.

### Role Change

Example:

> Has begun bowling regularly during the powerplay.

Observations should be tagged, searchable and linked to evidence.

---

# 28. Evidence Model

Every insight should include evidence metadata.

Suggested fields:

- source;
- sample size;
- date range;
- fixture references;
- delivery references;
- analyst observations;
- confidence;
- recency;
- competition context;
- venue context;
- direct/modelled flag;
- approved status.

Example:

```text
Insight:
Vulnerable against left-arm seam

Confidence:
72% — Moderate

Evidence:
142 deliveries
7 innings
3 dismissals
September 2025 – August 2026
```

---

# 29. AI Analyst

SCRBRD may include a conversational analysis layer.

Suggested queries:

- How should we bowl to Naidoo?
- Who should bowl during the powerplay?
- Which DHS batter struggles against spin?
- Who is their biggest threat?
- Which batter should we target early?
- How do they recover after losing two wickets quickly?
- Where do they score most against pace?
- Which bowler is weakest at the death?
- What are our best favourable matchups?
- What tactical assumptions have low confidence?

Example response:

> Consider introducing Singh early. Naidoo's strike rate against leg-spin is 64 compared with 96 against pace, while his dot-ball percentage rises from 31% to 49%.
>
> Evidence confidence: High  
> Sample: 183 deliveries

Every AI answer should cite its underlying SCRBRD evidence.

---

# 30. Analyst Override

Human analyst control is essential.

Every generated insight should allow:

- Agree
- Disagree
- Modify
- Add Context
- Exclude from Dossier
- Mark Outdated
- Approve for Coach
- Approve for Captain
- Archive

Example:

```text
AI:
Player struggles against short bowling.

Analyst:
Disagree.

Reason:
Sample is dominated by two difficult pitches.
```

Analyst corrections should become part of the intelligence record.

---

# 31. Fact, Inference and Recommendation

SCRBRD should visibly distinguish three information types.

## FACT

Directly derived from recorded data.

Example:

> Naidoo scored 34 runs from 52 deliveries against leg-spin.

## INFERENCE

A statistical interpretation.

Example:

> Naidoo appears less comfortable against leg-spin.

## RECOMMENDATION

A tactical judgement.

Example:

> Introduce Singh within Naidoo's first 25 deliveries.

These three categories should never look identical in the interface.

---

# 32. Dossier Builder

The primary output is the **Opposition Match Dossier**.

The dossier should remain dynamic until published.

Suggested structure:

---

## Cover

- Fixture
- Opponent
- Competition
- Venue
- Date
- Team logos
- Dossier version
- Analyst
- Approval status

---

## Executive Summary

- Three biggest strengths
- Three biggest vulnerabilities
- Three key threats
- Three tactical priorities
- Data confidence
- Selection uncertainty

---

## Squad Analysis

- probable XI;
- squad depth;
- likely batting order;
- likely bowling attack;
- player profiles;
- role changes;
- selection uncertainties.

---

## Batting Analysis

- team batting identity;
- top-order tendencies;
- middle-order stability;
- lower-order contribution;
- phase scoring;
- scoring zones;
- wagon-wheel patterns;
- dismissal patterns.

---

## Bowling Analysis

- attack composition;
- new-ball behaviour;
- middle-over strategy;
- death-over strategy;
- bowler usage;
- bowling maps;
- variation frequency.

---

## Matchups

- favourable;
- neutral;
- dangerous;
- direct H2H;
- modelled matchups.

---

## Tactical Plan

- powerplay plan;
- middle-over plan;
- death-over plan;
- batting plan;
- bowling plan;
- fielding priorities.

---

## Field Plans

Player-specific and phase-specific field diagrams.

---

## Scenarios

- batting first;
- bowling first;
- chasing;
- defending;
- early wickets;
- strong opposition start;
- rain-shortened game;
- final-over scenarios.

---

## Analyst Notes

Human observations and contextual information.

---

## Appendix

- statistics;
- historical matches;
- data sources;
- methodology;
- confidence ratings;
- version history.

---

# 33. Dossier Output Modes

One dossier format will not work for every role.

SCRBRD should generate multiple variants.

| Output | Intended User |
|---|---|
| Full Intelligence Dossier | Performance Analyst |
| Coaching Dossier | Head Coach |
| Captain's Brief | Captain |
| Bowling Plan | Bowlers |
| Batting Plan | Batters |
| Player Brief | Individual Player |
| Matchday Quick Sheet | Playing XI |
| Mobile Match Plan | Dugout |
| Post-Match Review | Analysts and Coaches |

---

# 34. Captain Mode

Captain mode should be concise and decision-focused.

Example:

## Opposition Threats

1. A. Naidoo — Opening Batter
2. S. Mthembu — New-Ball Bowler
3. R. Govender — Leg-Spinner

## Match Priorities

1. Win the first ten overs.
2. Introduce spin early to Naidoo.
3. Attack the fifth bowler.
4. Prevent Naidoo/Pillay partnership.

The captain should not need to read a 30-page analytical document.

---

# 35. Player-Specific Briefs

Each player should receive only the intelligence relevant to their role.

Example bowler brief:

```text
A. Naidoo

Plan:
Fourth-stump line.
Use fuller length early.
Avoid predictable short bowling.

Field:
Slip
Backward Point
Cover
Mid-Off
Deep Square Leg

Watch:
Advances against spin after 20 balls.
```

Player briefs should remain simple, role-specific and easy to consume on mobile.

---

# 36. Matchday Intelligence

Once the fixture begins, SCRBRD should compare real-time behaviour with the pre-match model.

Example:

## Pre-Match

> Naidoo strongest against pace.

## Live

```text
Naidoo 31 from 19

vs Pace:
27 from 13

vs Spin:
4 from 6
```

SCRBRD:

> Observed behaviour remains consistent with pre-match scouting.

Or:

> Warning: opponent behaviour differs significantly from historical model.

This transforms scouting from static preparation into a live learning system.

---

# 37. Live Analyst Alerts

Examples:

## Pattern Detected

> Opposition has attacked the first delivery after every bowling change.

## Matchup Available

> Singh vs Naidoo currently represents your highest-confidence bowling matchup.

## Bowler Fatigue Signal

```text
Mthembu

First Spell Economy: 2.8
Second Spell Economy: 5.9
```

## Partnership Warning

```text
Naidoo / Pillay
Current Partnership: 54
Historical Average: 71
```

## Tactical Deviation

> Opposition is using spin earlier than in 83% of analysed matches.

Live alerts should be prioritised to avoid notification overload.

---

# 38. Post-Match Learning Loop

After every fixture, SCRBRD should evaluate the accuracy of its pre-match intelligence.

Example:

## Prediction

> Naidoo vulnerable against leg-spin.

## Actual Outcome

```text
18 balls
9 runs
Dismissed
```

Status:

**Validated**

---

Another example:

## Prediction

> Fifth bowler vulnerable.

## Actual

```text
10 overs
29 runs
```

Status:

**Rejected**

The analyst may then record why:

- different bowler used;
- tactical plan changed;
- pitch conditions changed;
- historical sample was misleading;
- batter failed to attack;
- model assumption was incorrect.

This creates a learning loop.

---

# 39. Historical Opposition Memory

SCRBRD should maintain an evolving record for each opposition team.

Example:

```text
DHS 1st XI

2024
2025
2026
```

The analyst should be able to compare:

- batting style;
- bowling strategy;
- player roles;
- scoring rates;
- team selection;
- phase behaviour;
- captaincy tendencies.

Example change:

```text
2025
Batting-first preference

↓

2026
More aggressive chasing side
```

Historical data should not carry equal weight forever.

---

# 40. Recency Weighting

Recent performance should generally carry more weight than older data.

A conceptual model:

```text
Insight Score =
Recency
× Sample Size
× Competition Relevance
× Player Similarity
× Venue Relevance
× Data Quality
```

This prevents old data from dominating current analysis.

---

# 41. Competition Context

Raw statistics may be misleading without competition context.

Example:

Player A:

```text
500 runs
Average 55
```

Player B:

```text
420 runs
Average 42
```

If Player B faced significantly stronger opposition, the raw comparison may be misleading.

SCRBRD should eventually consider:

- opposition strength;
- bowling strength;
- competition tier;
- venue;
- match format;
- match situation;
- phase pressure.

Future metric:

**Opposition Strength Adjusted Performance**

---

# 42. Venue Intelligence

Opposition performance should also be analysed by location.

Example:

## Home

Win Rate: 78%

## Away

Win Rate: 54%

## WES Oval

Played: 4  
Won: 1

Possible insight:

> DHS scoring rate is 11% lower at WES Oval than its season average.

Venue therefore becomes part of tactical preparation.

---

# 43. Probable XI Generator

SCRBRD may estimate likely opposition selection using:

- recent selections;
- player availability;
- role requirements;
- team balance;
- recent form;
- captaincy;
- recurring combinations;
- squad depth.

Display:

```text
Probable XI Confidence: 82%
```

Selection should be expressed probabilistically rather than as certainty.

---

# 44. Privacy Boundary

Opposition scouting must not become unrestricted surveillance of school children.

The module should use legitimate sporting-performance information.

Opposition users should not gain access to protected information such as:

- private medical information;
- rehabilitation details;
- family information;
- private communications;
- academic records;
- private contact information;
- protected coaching notes;
- confidential wellbeing information;
- safeguarding information.

An opposition analyst may know:

> Batter struggles against off-spin.

They should not know:

> Batter is receiving treatment for a confidential medical condition.

This boundary must be enforced at:

- database level;
- RLS level;
- API level;
- role level;
- UI level.

---

# 45. RBAC

## Performance Analyst

Can:

- access full scouting cockpit;
- add observations;
- create reports;
- run analysis;
- create tactical plans;
- prepare dossier;
- approve analyst-level insight;
- publish to coaching staff.

---

## Head Coach

Can:

- view approved intelligence;
- add tactical notes;
- approve match plan;
- approve player/captain distribution;
- hide irrelevant sections.

---

## Assistant Coach

Can:

- access relevant tactical sections;
- add comments;
- view assigned players or units;
- contribute to plans.

---

## Captain

Can:

- access approved captain brief;
- view tactical priorities;
- view selected player threats;
- view approved field and bowling plans.

---

## Player

Can:

- access only role-relevant opposition intelligence;
- receive approved player-specific briefs.

---

## Parent / Spectator

No access.

Opposition scouting is an internal performance capability.

---

# 46. SCRBRD Data Sources

The module should leverage existing SCRBRD datasets.

Relevant entities include:

```text
fixtures
scoring_actions
ball_events
scorecards
player_season_stats
team_season_stats
player_h2h_stats
team_h2h_stats
scouting_reports
performance_entries
skill_ratings
match_lineups
media_assets
```

The key product opportunity is not merely adding more statistics.

It is building an intelligence layer across these datasets.

---

# 47. Proposed New Data Objects

## opposition_dossiers

```text
opposition_dossiers
    dossierId
    teamId
    opponentTeamId
    fixtureId
    createdBy
    seasonId
    status
    dataCutoff
    confidenceScore
    generatedAt
    approvedBy
    publishedAt
    version
```

---

## scouting_observations

```text
scouting_observations
    observationId
    subjectType
    subjectId
    analystId
    fixtureId
    category
    observation
    evidenceRefs[]
    confidence
    visibility
    createdAt
    updatedAt
```

---

## tactical_insights

```text
tactical_insights
    insightId
    opponentId
    playerId?
    fixtureId?
    category
    insightType
    hypothesis
    evidenceRefs[]
    sampleSize
    confidence
    generatedBy
    analystStatus
    analystNotes
    createdAt
    updatedAt
```

---

## matchup_models

```text
matchup_models
    matchupId
    batterId
    bowlerId
    matchupType
    directOrModelled
    balls
    runs
    dismissals
    dotBallPercentage
    boundaryPercentage
    modelledScore
    confidence
    calculatedAt
```

---

## tactical_plans

```text
tactical_plans
    planId
    fixtureId
    phase
    situation
    objective
    bowlingPlan
    battingPlan
    fieldPlan
    analystNotes
    status
    approvedBy
```

---

## live_intelligence_alerts

```text
live_intelligence_alerts
    alertId
    fixtureId
    type
    subjectId
    message
    evidenceRefs[]
    confidence
    priority
    createdAt
    acknowledgedAt
    dismissedAt
```

---

## scouting_model_reviews

```text
scouting_model_reviews
    reviewId
    fixtureId
    insightId
    predictedOutcome
    actualOutcome
    result
    analystComment
    reviewedBy
    reviewedAt
```

---

# 48. Suggested Information Architecture

```text
PERFORMANCE ANALYST

Overview

Opposition
 ├── Team DNA
 ├── Squad
 ├── Batting
 ├── Bowling
 ├── Fielding
 └── Form

Players
 ├── Batters
 ├── Bowlers
 ├── Matchups
 └── Head-to-Head

Spatial
 ├── Wagon Wheels
 ├── Pitch Maps
 ├── Shot Maps
 └── Field Maps

Intelligence
 ├── Strengths
 ├── Vulnerabilities
 ├── Patterns
 ├── Opportunities
 └── Analyst Notes

Strategy
 ├── Batting Plan
 ├── Bowling Plan
 ├── Field Plans
 ├── Phase Plans
 └── Scenarios

Dossier
 ├── Full Report
 ├── Coach Brief
 ├── Captain Brief
 ├── Player Briefs
 └── Matchday Sheet

Live
 ├── Alerts
 ├── Matchups
 ├── Pattern Detection
 └── Tactical Deviations

Review
 ├── Prediction Accuracy
 ├── Tactical Outcomes
 └── Analyst Learnings
```

---

# 49. UX Priorities

The cockpit should prioritise:

1. **Signal over noise**
2. **Evidence transparency**
3. **Role-specific information**
4. **Progressive disclosure**
5. **Fast tactical scanning**
6. **Analyst override**
7. **Confidence visibility**
8. **Live contextual relevance**
9. **Mobile-friendly matchday access**
10. **Historical intelligence continuity**

The interface should not reward information density for its own sake.

The analyst must always be able to identify:

- what matters;
- what is new;
- what changed;
- what is uncertain;
- what requires review;
- what should become part of the match plan.

---

# 50. Design Direction

The cockpit should use:

- bento-card layout;
- Material 3 interaction patterns;
- restrained gradients;
- glass-like translucent hierarchy;
- strong typography;
- compact analytical tables;
- interactive charts;
- heatmaps;
- cricket-field diagrams;
- confidence badges;
- evidence chips;
- timeline visualisations;
- direct-vs-modelled labels;
- fact/inference/recommendation badges.

The aesthetic should feel:

- elite;
- analytical;
- modern;
- credible;
- calm;
- tactical;
- data-rich without being chaotic.

---

# 51. Matchday Mobile Experience

A mobile version should prioritise:

### Header

Opponent  
Score  
Current phase  
Live insight state

### Primary Cards

- Current threat
- Recommended matchup
- Partnership warning
- Tactical deviation
- Field plan
- Analyst note

### Actions

- Acknowledge
- Add note
- Open matchup
- Open player
- Mark irrelevant
- Share with coach/captain

The mobile experience should support quick sideline decisions rather than deep exploration.

---

# 52. Alerts and Notification Logic

Alerts should be classified by priority.

## Critical

Examples:

- tactical model has materially changed;
- key dangerous partnership reached threshold;
- strong favourable matchup available;
- opposition behaviour strongly deviating from model.

## Important

Examples:

- phase weakness detected;
- bowler effectiveness dropping;
- repeated scoring zone detected.

## Informational

Examples:

- historical trend remains consistent;
- player scoring rate changed moderately.

The platform should avoid alert fatigue.

---

# 53. Versioning and Auditability

Every published dossier should be versioned.

Example:

```text
Dossier v1.0
Generated: 16 September 2026
Approved: 17 September 2026
Published: 18 September 2026
```

Changes should be auditable.

Audit log examples:

- analyst added observation;
- head coach approved tactical insight;
- AI recommendation modified;
- player brief updated;
- captain brief published;
- dossier withdrawn;
- live recommendation dismissed.

---

# 54. Performance and Quality Metrics

The module itself should be measurable.

Suggested KPIs:

- percentage of dossiers completed before matchday;
- average analyst review time;
- percentage of AI insights accepted;
- percentage modified;
- percentage rejected;
- prediction validation rate;
- average confidence of published insights;
- player brief open rate;
- captain brief open rate;
- tactical recommendation adoption rate;
- post-match review completion rate.

---

# 55. Future Capability — Video Intelligence

A later phase may integrate tagged match video.

Possible workflow:

```text
Insight:
Naidoo struggles against full left-arm seam.

Evidence:
18 video clips
142 tracked deliveries
3 dismissals
```

The analyst could open the supporting clips directly from the insight.

This would significantly strengthen evidence quality.

---

# 56. Future Capability — Automated Tactical Simulation

A future system could simulate:

- likely scoring trajectories;
- bowler matchups;
- field configurations;
- phase outcomes;
- target defence;
- chase probability.

Example:

```text
If Singh bowls overs 14–20 to Naidoo/Pillay:

Projected Runs: 24–31
Projected Wickets: 0.8
Confidence: Moderate
```

This should only be introduced once sufficient high-quality data exists.

---

# 57. Future Capability — Multi-Sport Extension

The core model is sport-agnostic.

The same framework could later support:

- rugby opposition analysis;
- football scouting;
- hockey tactical analysis;
- basketball matchup analysis;
- netball opposition reports.

The conceptual pipeline remains:

```text
Evidence
→ Patterns
→ Matchups
→ Tactical Insight
→ Role-Specific Brief
→ Live Validation
→ Review
```

Cricket should remain the first vertical because the existing SCRBRD delivery-level dataset is best suited to it.

---

# 58. Product Guardrails

SCRBRD should avoid:

- presenting AI outputs as facts;
- hiding weak sample sizes;
- over-relying on historical data;
- generating tactical recommendations without evidence;
- exposing protected child/player data;
- overloading players with complex analytics;
- treating modelled and direct matchups as equivalent;
- using outdated roles or line-ups without warnings;
- publishing unapproved insights;
- excessive live notifications.

---

# 59. Strategic Value to SCRBRD

This module connects several core SCRBRD capabilities.

```text
3-Phase Scoring
        ↓
Delivery-Level Event Data
        ↓
Wagon Wheel + Spatial Analytics
        ↓
Player Tendencies
        ↓
Head-to-Head
        ↓
Matchup Intelligence
        ↓
Skills Matrices
        ↓
Performance Analyst Cockpit
        ↓
Opposition Intelligence
        ↓
Coach & Captain Cockpits
        ↓
Tactical Decisions
        ↓
Live Scoring
        ↓
Real-Time Validation
        ↓
Post-Match Analysis
        ↓
Updated Intelligence
        ↓
Next Opposition Dossier
```

This produces a closed analytical loop:

> **Observe → Understand → Prepare → Execute → Measure → Learn**

---

# 60. Competitive Differentiator

The real product is not the PDF.

The product is the **living intelligence model** behind the dossier.

A coach should eventually be able to open SCRBRD and immediately see:

```text
DHS OPPOSITION BRIEF

3 Priority Actions
5 Player Threats
4 Favourable Matchups
2 Tactical Vulnerabilities
1 Major Selection Uncertainty

Overall Intelligence Confidence: 84%
```

Tapping any claim should open the evidence:

- deliveries;
- matches;
- wagon wheels;
- pitch maps;
- scorecards;
- historical comparisons;
- analyst observations;
- matchup records.

This is where SCRBRD evolves beyond a school sports management and scoring product and becomes a **professional-grade cricket intelligence platform**.

---

# 61. Final Product Principle

The Performance Analyst Cockpit should not try to replace the cricket analyst.

It should make the analyst:

- faster;
- better informed;
- more consistent;
- more evidence-driven;
- more capable of detecting patterns;
- more effective at communicating tactical intelligence.

The strongest version of SCRBRD is therefore not:

> **AI tells coaches what to do.**

It is:

> **SCRBRD turns cricket data into explainable intelligence that analysts and coaches can trust, interrogate and use.**

That principle should define the Opposition Scouting & Dossier Generator.
