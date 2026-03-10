# SCRBRD Rankings Intelligence Suite & Match Impact Engine

## Part 1: SCRBRD Global Rankings System

Here’s a proper design framework for The SCRBRD Global Rankings System — built to feel credible, competitive, and commercially powerful, not just like a flashy leaderboard.

The core idea
SCRBRD should not merely rank who scored the most runs or took the most wickets.

It should rank:
- Who is performing best now
- Who is strongest relative to opposition and context
- Who projects best long-term
- Who scouts should care about most

That means you need four distinct but connected systems, not one blended score pretending to do everything.

### 1. The four ranking pillars

**A. National School Cricket Rankings**
This ranks teams and schools.

Purpose:
- establish the strongest schools and teams nationally
- compare provinces, leagues, divisions and age groups
- create narrative, prestige and rivalry
- power media, sponsorship and tournament seeding

Outputs:
- National Top 100 Schools
- Provincial rankings
- Age-group rankings: U13, U15, U17, 1st XI
- Format rankings: T20, 40-over, 50-over, multi-day
- Rolling form table
- Strength-of-schedule table

Important:
A school’s ranking should not be based only on wins. That is too blunt and easy to distort.
It should include:
- win/loss results
- margin of victory
- strength of opponent
- away vs home weighting
- competition level
- consistency over time
- recent form weighting

**B. Player Power Ratings**
This ranks current player performance.

Purpose:
- identify the best current school cricketers
- compare players across teams and provinces
- reward impact, not just volume
- create a fantasy-sport style “heat” around school cricket

Outputs:
- National Top 100 Batters
- National Top 100 Bowlers
- National Top 100 All-Rounders
- National Top 50 Wicketkeepers
- National Top 50 Fielders
- Team MVP rankings
- Match impact leaderboards

This is your most visible ranking layer.

**C. Scouting Scores**
This ranks recruitment attractiveness.

Purpose:
- help schools, academies, provincial selectors and scouts identify talent
- evaluate players beyond raw scoreboard stats
- surface hidden value
- A player with modest stats but elite technique, athleticism and adaptability may rank highly here.

Outputs:
- Scout Grade
- Role archetype fit
- Recruitment priority score
- “Undervalued talent” list
- “High ceiling” watchlist

This is more qualitative + quantitative than Player Power Ratings.

**D. Predictive Player Potential**
This estimates future ceiling, not present output.

Purpose:
- project development curve
- identify future provincial / franchise / professional prospects
- guide coaching investment and scholarship decisions

Outputs:
- Potential Tier: Elite / High / Strong / Developmental
- Growth trajectory
- Readiness score
- Risk score
- 12-month and 24-month projection bands

This is the hardest part, and the easiest part to get wrong.
So it must be framed as probabilistic projection, not “this player will definitely make it”.

### 2. The biggest design mistake to avoid

Do not create one giant master score for everything.
That would be seductive, but flawed.

Why?
Because:
- the best current performer is not always the best long-term prospect
- the most talented player is not always the best scout fit
- the strongest school team is not always producing the best individual talent
- different formats distort performance differently

So SCRBRD should show:
- Team Ranking Score
- Player Power Rating
- Scouting Score
- Potential Score

Each with different logic, but connected. That is more honest, more useful, and more defensible.

### 3. Ranking architecture

**A. National School Cricket Rankings model**
Team Ranking Score (TRS)
A weighted rating from 0–100.

Inputs:
- Match result
- Margin of result
- Opponent strength
- Competition strength
- Recency
- Home/away
- Squad continuity/injuries if known
- Format-specific weighting

Suggested formula structure:
`TRS = Base Result Score + Opponent Strength Modifier + Margin Modifier + Competition Multiplier + Recency Weight + Consistency Bonus`

Example logic:
- Beat a top-10 team away from home: big uplift
- Beat a weak team at home narrowly: small uplift
- Lose closely to the #1 team away: small drop, maybe even respectable retention
- Heavy losses to lower-ranked teams: sharp penalty

Suggested weighting:
- Result: 35%
- Strength of opposition: 25%
- Margin: 15%
- Competition importance: 10%
- Recency/form: 10%
- Consistency bonus: 5%

Ranking views:
- Overall national
- By province
- By age group
- By format
- By season
- Rolling last 10 matches

**B. Player Power Rating (PPR)**
A live performance-based player score from 0–100.
This should be role-aware.
A batter, bowler, keeper and all-rounder cannot be judged by one identical rubric.

Batter PPR inputs:
- runs
- strike rate relative to format
- average
- balls faced impact
- boundary rate
- dot-ball percentage
- scoring in pressure phases
- performance against stronger bowling units
- chase performance / clutch factor
- consistency

Bowler PPR inputs:
- wickets
- economy relative to format
- strike rate
- dot-ball percentage
- boundary prevention
- powerplay / middle / death effectiveness
- wickets of top-order players
- control metrics
- consistency

All-rounder PPR:
Not just batting score + bowling score.
It should reward:
- genuine two-discipline impact in the same match
- balance across roles
- match-winning versatility

Wicketkeeper PPR:
- dismissals
- clean takes / stumping difficulty
- byes conceded contextually
- catching efficiency
- run-out involvement
- keeping consistency
- match pressure execution

Fielder PPR:
- catches
- run-outs
- boundary saves
- direct-hit rate
- pressure moments
- fielding error penalty

Suggested PPR structure:
`PPR = Production + Efficiency + Match Impact + Opponent Quality + Recency + Role Bonus`

Example weighting for batters:
- Production: 30%
- Efficiency: 20%
- Match impact: 20%
- Opponent quality: 15%
- Recency: 10%
- Role context bonus: 5%

### 4. Scouting Score design

This is where SCRBRD becomes more than Cricinfo-lite.
Scout Score (SS) should combine:

Quantitative signals:
- age-relative performance
- output versus strong opposition
- physical profile
- role rarity
- durability / availability
- progression rate
- consistency

Qualitative scouting inputs:
- technique
- temperament
- game awareness
- athleticism
- decision-making
- coachability
- competitiveness
- leadership presence
- fielding intent
- adaptability

Example categories:
- Technical: /20
- Tactical: /15
- Physical: /15
- Mental: /20
- Competitive profile: /10
- Statistical evidence: /20

Output:
- Total = /100

Scout outputs:
- Scout Grade: A+, A, B+, B, C
- Prospect Category: Immediate impact, Long-term project, High-upside athlete, Role specialist, System player
- Confidence level: High / Medium / Low
- Exposure level: Under-scouted / Properly rated / Overexposed

This is important: a scouting score should not be fully automated. It should be human-augmented. Otherwise you risk rewarding stat-padding and missing actual talent.

### 5. Predictive Player Potential model

This should answer: How good could this player become, given age, growth, skill profile, and trajectory?

Predictive Potential Score (PPS)
Key inputs:
- age vs competition level
- development trend over time
- skill matrix progression
- physical development markers
- role scarcity
- adaptability across formats
- technical quality
- injury history / durability risk
- mental resilience markers
- scouting assessments
- match performance under stronger opposition

Suggested model components:
`PPS = Age Advantage + Development Trend + Skill Ceiling + Athletic Projection + Mental Projection + Role Value - Risk Penalty`

Potential tiers:
- Tier 1: Elite national prospect
- Tier 2: Provincial/pro pathway prospect
- Tier 3: Strong emerging prospect
- Tier 4: Development player
- Tier 5: Monitor only

Risk overlays:
- Injury risk
- Over-reliance on one skill
- Weakness versus stronger opposition
- Underdeveloped secondary skills
- Small sample size risk
- Maturity uncertainty

This should always show: Ceiling, Readiness, Risk
Because a player can have:
- high ceiling, low readiness
- medium ceiling, high readiness
- elite output, but fragile projection
That nuance matters.

### 6. Moneyball angle — where it works and where it doesn’t

The phrase is strong, but you should be careful.
A sceptic would say: “Moneyball worked because baseball has cleaner discrete events and stronger data structure. School cricket is messier, less standardised, and more context-heavy.”

That sceptic is right.
So SCRBRD’s advantage is not “we copy Moneyball”.
It is: “We bring structured, contextual intelligence to a level of cricket that has historically been under-analysed.”

Better positioning:
- The intelligence engine for school cricket
- The talent ID and ranking layer for youth cricket
- The operating system for school cricket performance
- The data-driven future of school cricket

Moneyball is a useful reference, but not your whole identity.

### 7. Governance and anti-gaming rules

If this system is going to carry weight, it must be trusted.
You need anti-distortion safeguards:
- minimum matches threshold
- minimum balls faced / overs bowled
- sample-size confidence weighting
- outlier suppression
- opposition-strength normalisation
- stat-padding detection
- role eligibility rules
- manual scout moderation
- audit trail for score changes

Example:
A player who scores 120 against weak opposition once and little else should not automatically outrank a player with six strong 45–70 contributions against elite schools.
Consistency and context must win.

### 8. Data model for SCRBRD
(Moved to Database/Schema Section)

---

## Part 2: SCRBRD Match Impact Engine

The Match Impact Engine should estimate how much an event mattered. What is the impact of each ball?

A traditional scorecard treats a four in the first over of a low-pressure chase the same as a boundary that takes win probability from 38% to 51%. SCRBRD should evaluate the contextual match impact.

### 1. Match Impact Engine structure

The engine should work in three layers:

**Layer A: Event Value**
What happened on this ball? (dot, single, boundary, wicket, extra, run-out, etc.)

**Layer B: Context Multiplier**
How important was this ball in context? (phase of innings, required run rate, wickets in hand, opposition quality, batter setness, match type, pressure state)

**Layer C: Swing Effect**
How much did this ball shift expected match outcome? (Expected Outcome delta)

### 2. Core formula

```
BallImpactScore =
BaseEventValue
× ContextMultiplier
× PressureMultiplier
× OppositionQualityMultiplier
+ SwingAdjustment
```

### 3. Context Multipliers

**A. Phase multiplier**
e.g. T20: Powerplay (1.15), Middle (1.00), Death (1.35)

**B. Pressure multiplier**
Based on current score state: Low (0.9), Normal (1.0), Elevated (1.15), High (1.3), Extreme (1.5)

**C. Opposition quality multiplier**
Ranked opponent difficulty: Weak (0.9), Average (1.0), Strong (1.1), Elite (1.25)

**D. Match type multiplier**
Friendly (0.9), League (1.0), Derby (1.15), Cup knockout (1.2), Final (1.3)

### 4. Swing Adjustment

Expected State Model:
`SwingAdjustment = ExpectedOutcomeAfterBall - ExpectedOutcomeBeforeBall`

A major shift in chase expectation earns a high swing bonus.

### 5. Impact attribution

Split impact across involved players:
- Boundary: Batter gets most positive impact, Bowler gets negative impact, Fielder minor negative if misfield.
- Wicket caught behind: Bowler gets primary positive impact, Keeper gets secondary positive impact, Batter gets negative impact.
- Run-out: Fielders get positive impact, dismissed batter gets negative impact.

### 6. Derived impact metrics

**A. Match Impact Score (MIS)**
Total impact contribution across the match.
`MIS = Sum(BallImpactContributions) + FieldingImpact + PressureBonuses`

**B. Clutch Impact Score**
Impact under high or extreme pressure only.

**C. Big Match Impact**
Only counted in derbies, knockouts, finals, top-ranked opposition.

**D. Momentum Shift Score**
Counts events that change innings direction (e.g. wicket after 40-run stand, boundary after 10 dot balls).

**E. Collapse Trigger / Rescue Index**
Collapse Trigger: bowlers/fielders who sparked collapses.
Rescue Index: batters who stabilised an innings from distress.

### 7. Match MVP logic

Use weighted impact:
`MatchMVPScore = MatchImpactScore * 0.50 + ClutchImpactScore * 0.20 + OppositionQualityScore * 0.10 + BigMomentCount * 0.10 + FieldingImpact * 0.10`

### 8. Explainability layer

If users see a player jump 8 spots, SCRBRD must explain why.
Each impact score should have a breakdown.
Example:
Match Impact: 18.6
- Batting impact: +11.2
- Clutch batting: +4.8
- Partnership rescue: +2.1
- Top moment: Six in over 18 changed chase pressure: +3.4

---

## Part 3: System Architecture & Workflow Flow

### Core Components
```
MATCH DATA
   │
   ├── scoring_actions
   ├── scorecards
   ├── player_season_stats
   │
   ▼
RANKING ENGINE
   │
   ├── TeamRank Calculator
   ├── Player Power Calculator
   ├── Scout Score Engine
   └── Potential Projection Engine
   │
   ▼
RANKING DATABASE
   │
   ├── ranking_snapshots
   ├── ranking_components
   ├── ranking_history
   │
   ▼
SCRBRD UI
   │
   ├── Rankings Hub
   ├── Team Rankings
   ├── Player Rankings
   ├── Prospect Radar
   └── Scout Dashboard
```

### Database Extensions
- `ranking_snapshots`
- `ranking_components`
- `ranking_history`
- `scout_reports`
- `potential_projections`
- `match_impact_events`
- `impact_attributions`
- `player_match_impact`
- `innings_momentum_segments`
- `impact_model_versions`

### UI Structure
**Live Scoring Hub:**
- Pressure state chip
- Momentum mini-strip
- Impact pulse subtle toast
- End-of-over summary card (Over Impact)

**Post-Match Scorecard:**
- Match MVP hero card
- Match Impact Breakdown (donut chart)
- Momentum timeline
- Top 10 decisive moments
- Player impact table

## Part 4: Implementation Phasing

**Phase 1: Foundation**
TeamRank, Player Power Ratings, basic movement tracking, Match Impact Engine V1, Post-match Impact tab, MVP logic.

**Phase 2: Intelligence**
Strength-of-opposition modelling, Scouting dashboards, role archetypes, Live momentum graph, Prospect Radar.

**Phase 3: Projection**
Player potential models, risk bands, readiness indicators, coach analytics mode.

**Phase 4: Prestige & Monetisation**
Awards, National Top 100 reports, Scout subscriptions, Sponsor integrations, Automated media stories.

*The rankings must be snapshot-based, models must be versioned, and live impact vs final impact should be clearly distinguished.*
