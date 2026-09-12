# SCRBRD Player Profile UI/UX Review & Improvement Recommendations

## Executive Summary

The current SCRBRD player profile interface already has a strong visual language. It feels more like a high-performance sports intelligence platform than a conventional school-management system. The dark environment, bold typography, neon accents, analytical cards and cricket-specific visualisations are all moving in the right direction.

The primary issue is not a lack of information or visual sophistication. It is that the **information architecture is beginning to compete with the design system**.

There is a large amount of valuable information, but it is often presented as a collection of separate screens rather than as one connected **player intelligence experience**.

The key design opportunity is therefore not to remove depth, but to improve hierarchy and interaction by organising information into:

1. **Glanceable information**
2. **Contextual analysis**
3. **Deep investigation**

SCRBRD should not feel like a database showing everything it knows about an athlete. It should feel like an intelligence system that reveals the right information, at the right time, at the right level of depth.

---

# 1. Core UX Problem: Data Hierarchy

At present, too many elements are visually treated as equally important.

For example, the player hero presents:

- Matches
- Runs
- Average
- Strike rate
- Wickets
- Economy
- Catches

The Stats page then repeats similar information.

The Passport page introduces further batting and bowling values.

Career History adds seasonal performance data.

This causes three major problems.

### Repetition

The interface becomes visually larger than the amount of truly distinct information justifies.

### Unclear statistical scope

A user may not know whether a value refers to:

- Current season
- School career
- First XI only
- All teams
- Selected competition
- Selected format
- Last five matches

### Reduced trust

If two sections show different values without clearly communicating scope, users may assume the platform is inconsistent or inaccurate.

This is particularly important in a sports analytics product, where confidence in the data is fundamental.

Every statistic should therefore clearly communicate its scope.

Examples:

> **2026 Season · 1st XI · All Formats**

> **School Career · 2024–2026**

> **Last 5 Matches**

---

# 2. Introduce a Persistent Context Bar

Directly beneath the player identity area, SCRBRD should introduce a persistent analytical context selector.

Example:

**2026 Season ▾ | 1st XI ▾ | All Formats ▾ | All Competitions ▾ | Last 10 Matches ▾**

Changing any of these parameters should update all relevant analytical modules.

This includes:

- Statistics
- Wagon wheel
- Form
- Skills
- Impact
- Bowling analysis
- Player comparisons
- AI insights
- Match lists
- Relevant milestones

For example, switching:

> **2026 Season → Career**

should immediately transform the entire page into the player's career view.

This will become increasingly important as SCRBRD accumulates data across:

- Multiple seasons
- Multiple teams
- Schools
- Provincial teams
- Tournaments
- Cricket formats
- Age groups
- Representative levels

Without a global analytical context, player profiles will become difficult to interpret.

---

# 3. Compress the Player Hero

The current player hero is visually strong but occupies too much vertical space.

It should remain impressive when the profile first loads, but collapse as the user moves deeper into the page.

## Expanded State

Approximately **170–190px** high.

Contains:

- Avatar
- Name
- Role
- Team
- Key career metrics
- Match readiness
- Recent form
- Rank
- Live profile state

## Collapsed Sticky State

Approximately **64–72px** high.

Example:

> **AP · Aaron Phillips · All-Rounder · 1st XI · Match Ready**

> **40 Matches | 240 Runs | 66 Wkts | Impact 83 | Form ↑92**

This sticky state can remain visible while the user explores deeper analytical sections.

The goal is to retain identity and context without repeatedly consuming large amounts of screen real estate.

---

# 4. Simplify the Top-Level Navigation

The current structure contains approximately:

- Overview
- Stats
- Career History
- Impact
- Passport
- Rewards
- Intelligence

There is conceptual overlap between several of these sections.

A clearer structure would be:

| Proposed Section | Content |
|---|---|
| **Overview** | Current state, form, readiness, recent performance, next match |
| **Performance** | Batting, bowling, fielding, match statistics |
| **Development** | Skills, attributes, progression, coach assessments |
| **Intelligence** | Wagon wheel, H2H, matchups, tactical analytics |
| **Career** | Seasons, teams, milestones, honours, awards, selections |
| **Passport** | Verified identity, registrations, eligibility, credentials |

### Why this is stronger

**Impact** is not really a standalone information domain. It is an analytical dimension of Performance and Intelligence.

Similarly, **Rewards** do not necessarily require equal navigational prominence to Performance or Intelligence. Rewards, awards and accolades can remain distinct data structures while being surfaced within appropriate career/profile contexts.

---

# 5. Adopt a Three-Level Information Architecture

Every analytical area should support three levels of engagement.

## Level 1 — Snapshot

Answers:

> What do I need to know about this player right now?

Examples:

- Form
- Readiness
- Current season performance
- Impact
- Role
- Recent match
- Development trajectory

This should be understandable in approximately **5 seconds**.

## Level 2 — Analysis

Answers:

> Why is this player performing this way?

Examples:

- Wagon wheel
- Pitch map
- Dismissal analysis
- Bowling zones
- Phase performance
- Opposition matchups
- Skills trajectory

This should support approximately **30–60 seconds** of meaningful exploration.

## Level 3 — Investigation

Answers:

> Show me exactly what caused this.

Examples:

- Individual deliveries
- Specific innings
- Video
- Match timeline
- Coach notes
- Shot events
- Field placements
- Training history

These deeper elements should usually appear through:

- Drawers
- Expandable modules
- Modal investigations
- Dedicated analysis modes

This allows SCRBRD to remain extremely detailed without presenting everything simultaneously.

---

# 6. Turn Overview into the Player Command Centre

The Overview screen should answer four primary questions.

| Question | Module |
|---|---|
| How is the player doing? | **Form** |
| Is the player ready? | **Readiness** |
| What is changing? | **Development** |
| What should I know? | **Insight** |

A stronger top-level composition could be:

- **Form 82 ↑ +9**
- **Readiness 88%**
- **Impact 83**
- **Development +16**

Below this, provide a contextual intelligence statement.

Example:

> **Current Intelligence**  
> Aaron's bowling effectiveness has improved across his last five appearances. Economy has remained stable while wicket frequency has increased, particularly during middle overs.

Then provide:

**Explore →**

This makes the page feel like an intelligence system rather than a dashboard full of unrelated widgets.

---

# 7. Improve Career History Through Visual Storytelling

The Career History screen contains strong concepts:

- Multi-season skill progression
- Role archetype fit
- Longitudinal runway
- Career timeline

The issue is that the screen becomes a long vertical report.

Career History should communicate **movement and progression**.

## Multi-Season Skill Progression

Instead of repeatedly showing separate rows with numerical scores, use a heatmap.

Example:

| Season | Batting | Bowling | Fielding | Physical | Mental | Tactical |
|---|---:|---:|---:|---:|---:|---:|
| 2024 | 72 | 45 | 68 | 70 | 72 | 75 |
| 2025 | 81 | 50 | 74 | 78 | 80 | 84 |
| 2026 | 88 | 52 | 79 | 84 | 86 | 91 |

Colour intensity communicates development immediately.

Hovering or selecting a value could reveal:

> **Tactical Awareness — 91**  
> +7 YoY  
> Coach assessment updated 04 Sep

This is both more compact and easier to interpret.

---

# 8. Reduce Radar Chart Overuse

Radar charts look sophisticated and sport-specific, but they become difficult to interpret when used repeatedly.

Use radar charts where they represent a player's **overall profile shape**.

Example:

### Player DNA

- Batting
- Bowling
- Fielding
- Physical
- Mental
- Tactical

For changes over time, use:

- Slope charts
- Heatmaps
- Indexed bars
- Sparklines
- Small multiples

A useful rule:

> Radar charts should communicate **shape**, not history.

---

# 9. Expand Role Archetype Fit

The Role Archetype Fit concept is one of the strongest ideas in the interface.

Examples:

- Opener — 88%
- Top-order Anchor — 88%
- Bowling All-Rounder — 73%

This should become a major intelligence feature.

Selecting:

> **Top-order Anchor · 88%**

could expand to:

### Why Aaron fits this role

- Batting stability +12
- Dot-ball management +9
- Pressure composure +14
- Boundary conversion +6
- Powerplay survival +11

With benchmarking such as:

> Compared with KZN school 1st XI players in the same role.

This transforms a percentage from a decorative score into explainable player intelligence.

---

# 10. Turn Career Runway into an Interactive Trajectory

Instead of showing season cards alone, show the player's progression through cricket structures.

Example:

**U15A → U16A → 2nd XI → 1st XI → Provincial U19**

Add milestone markers:

- 500 career runs
- Player of the Tournament
- First XI debut
- Vice-captaincy
- Provincial selection

Selecting any milestone should update the surrounding analysis.

This creates the feeling of exploring the player's **journey**, not reading a static database record.

---

# 11. Clarify the Purpose of Passport

The current Passport page combines too many unrelated categories:

- Identity
- Career history
- Statistics
- Skills
- Form
- Scouting
- Honours
- Badges
- Eligibility
- Milestones

The Passport should primarily answer:

> **Who is this athlete and what is officially verified?**

## Keep in Passport

- Identity
- Date of birth
- School
- Roles
- Team history
- Historical registrations
- Representative selections
- Eligibility
- Verified achievements
- Captaincy
- Credentials

## Move Elsewhere

- Skills → Development
- Form → Overview
- Performance → Performance
- Scouting intelligence → Intelligence
- General honours → Career

This makes Passport a credible verified sporting identity rather than another analytics dashboard.

---

# 12. Make Intelligence the Deep Analytical Workspace

The Wagon Wheel and Battle Card are among the strongest parts of the interface.

This is where SCRBRD starts to differentiate itself from conventional scoring systems.

The opportunity is to make these modules much more interactive.

---

# 13. Expand the Wagon Wheel

The Wagon Wheel should support dynamic filtering.

Potential filters:

- Batting hand
- Pace / spin
- Powerplay / middle / death
- Runs / boundaries / dismissals
- Bowler
- Venue
- Competition
- Match
- Date range
- Innings phase

Selecting an individual shot should reveal contextual detail.

Example:

> **4 runs · Cover Drive**

- Bowler: J Smith
- Ball: 6.3
- Length: Full
- Line: Outside off
- Shot quality: 91
- Expected runs: 2.4
- Result: FOUR

And ideally:

**▶ View delivery**

This connects visualisation → event → evidence.

---

# 14. Add Wagon Wheel Visual Modes

Individual vectors become noisy as the dataset grows.

Allow users to switch between visual modes:

- Shots
- Density
- Runs
- Boundaries
- Dismissals
- Efficiency

Example region insight:

> **Cover region**  
> 38 shots  
> 72 runs  
> 1.89 runs/shot  
> 18% boundary rate

This turns the Wagon Wheel into genuine spatial batting intelligence.

---

# 15. Improve the Battle Card

The Battle Card is a strong concept, but player comparison requires better contextual normalisation.

A strike rate of 135 is not automatically superior without considering:

- Batting position
- Age group
- Competition quality
- Format
- Player role
- Sample size

Instead of showing only raw values, allow comparison modes.

### Aaron Phillips vs Ryan Sharma

Views:

- Raw Stats
- Normalised
- Percentile
- Head-to-Head

Domains:

- Batting
- Bowling
- Fielding
- Physical
- Tactical
- Mental

Example:

> **Batting Impact 82**  
> +14 vs role average

This is more meaningful than showing an isolated strike rate alone.

---

# 16. Redesign the Impact Screen

The Impact screen currently feels unfinished because a very large empty state occupies much of the canvas.

Do not allocate half the screen to "insufficient data".

Instead show an explanatory progress state.

Example:

> **Impact Analysis requires 3 additional qualified matches**

**7 / 10 matches**

Supporting text:

> We need enough recent match events to calculate contextual batting, bowling and fielding impact reliably.

Then show what is already available:

- Batting influence
- Bowling influence
- Pressure events
- Clutch contribution

This turns an empty state into an informative state.

---

# 17. Make Impact Event-Based

A generic impact score is not enough.

The more meaningful question is:

> What exactly did the player do that changed the match?

Create a match impact timeline.

Example:

**11.2 — Wicket**  
+8.4 Impact

**13.5 — Dot-ball pressure**  
+1.2

**16.1 — Catch**  
+4.7

**18.4 — Boundary conceded**  
−2.1

This allows coaches, players and analysts to understand the evidence behind the score.

---

# 18. Make the Stats Screen More Visual

The current Stats page is clean but still too card-based.

The philosophy should shift from:

> Show statistics

to:

> Show patterns

## Batting Example

Primary metrics:

- Runs
- Average
- Strike rate

Then immediately show:

### Runs by innings

A sparkline or compact trend chart.

### Dismissal distribution

- Caught
- Bowled
- LBW
- Run out
- Not out

### Phase performance

- Powerplay
- Middle overs
- Death overs

The metrics remain visible, but the page becomes analytical instead of administrative.

---

# 19. Treat Batting, Bowling and Fielding Differently

These domains should not use identical card architecture.

They represent fundamentally different behaviours and therefore need different visualisations.

## Batting

Recommended visualisations:

- Wagon wheel
- Scoring zones
- Shot selection
- Dismissal matrix
- Runs distribution
- Strike rotation
- Boundary frequency
- Phase splits

## Bowling

Recommended visualisations:

- Pitch map
- Line/length heatmap
- Wicket zones
- Economy by phase
- Strike rate by phase
- Bowler-v-batter H2H
- Spell timeline

## Fielding

Recommended visualisations:

- Field involvement map
- Catch zones
- Catch difficulty
- Run-out involvement
- Saved runs
- Misfield frequency

This makes SCRBRD feel specifically designed for cricket intelligence.

---

# 20. Distinguish Zero from No Data

Values such as:

- 0 catches
- 0 run-outs
- 0 stumpings
- 0.0 averages

may mean either:

- The player genuinely recorded zero
- No data has been recorded

These are not the same thing.

Use:

**—**

for unavailable data.

Use:

**0**

only when zero is a genuine recorded result.

This improves data integrity and user trust.

---

# 21. Reduce the Size of the Skill Attribute Matrix

The full Physical / Mental / Tactical / Fielding matrix contains valuable information but creates excessive vertical depth.

Use collapsible or expandable domains.

Example:

### PHYSICAL · 78 ↑4

- Speed 7
- Agility 6
- Acceleration 7

**View 7 more →**

### MENTAL · 84 ↑6

- Composure 8
- Concentration 8
- Resilience 9

**View 6 more →**

This could reduce the screen height dramatically while preserving all underlying detail.

---

# 22. Make Skills Development Visual

Instead of only showing:

> Composure 8

show development over time.

Example:

### Composure

- 2024 — 5
- 2025 — 7
- 2026 — 8

**↗ +3**

Selecting the attribute could reveal:

- Coach assessment history
- Training correlation
- Match evidence
- Development notes
- Supporting clips

This turns a score into a development narrative.

---

# 23. Compress the Career Timeline

The current timeline gives similar visual weight to many events.

A minor accolade and a major provincial selection should not necessarily occupy the same amount of space.

Group events by year.

Example:

## 2026

- Provincial Selection
- 1,000 Career Runs
- Vice-Captain

## 2025

- Player of Tournament
- First XI Debut

## 2024

- U15A Debut

Then provide:

**Expand 2025 →**

This dramatically reduces scrolling without removing detail.

---

# 24. Introduce Cross-Filtering

This is one of the biggest opportunities to make SCRBRD feel like a professional intelligence system.

Selecting:

> **Spin Bowling**

in one module should update:

- Wagon wheel
- Average
- Strike rate
- Dismissals
- Boundary percentage
- Match list

Selecting:

> **Last 5 Matches**

should update every relevant component on the page.

This creates one connected analytical environment rather than a set of isolated cards.

---

# 25. Introduce a Contextual Inspector Drawer

Instead of permanently expanding the page, use a right-side Inspector Drawer.

Selecting any:

- Player
- Match
- Shot
- Delivery
- Metric
- Skill
- Milestone

could open:

## INSPECTOR

**Aaron Phillips**

### Cover Drive

- 18 shots
- 34 runs
- SR 188
- Boundary rate 27%

Then provide:

- Recent examples
- Video
- Match context
- Coach notes

This allows SCRBRD to contain enormous analytical depth without overwhelming the base interface.

---

# 26. Make the Main Navigation Collapsible

The sidebar currently consumes valuable horizontal space.

Support two states.

## Expanded

Approximately **210px**

## Compact

Approximately **64–72px**

Analytical pages such as:

- Wagon Wheel
- Battle Card
- Pitch Maps
- Team Comparison

should also support a dedicated:

**Focus Mode**

This can collapse the navigation and maximise the analytical canvas.

---

# 27. Improve Typography Hierarchy

Some secondary labels are currently extremely small.

The dark background makes this more noticeable.

Labels such as:

- CAREER METRICS
- LONGITUDINAL SEASON RUNWAY
- PERSONNEL DATA SHEET

look visually sophisticated, but approach illegibility at normal laptop scaling.

Suggested hierarchy:

### Micro labels

Condensed uppercase

### Analytical labels

Approximately **13–14px minimum**

### Primary metric values

Approximately **28–40px**

### Section headings

Approximately **18–24px**

The interface should feel futuristic, not forensic.

---

# 28. Reduce Decorative Borders

Many elements currently exist inside bordered cards.

This creates **container fatigue**.

Hierarchy should rely more on:

- Spacing
- Background elevation
- Tonal separation
- Typography
- Alignment

Material 3 tonal surface logic would work well.

Example hierarchy:

### Surface 0

Main canvas

### Surface 1

Primary section

### Surface 2

Interactive card

### Selected / Highlighted

Subtle coloured tonal surface

Reserve stronger borders for:

- Selected
- Live
- Warning
- Interactive focus
- Error states

This will make the system feel calmer and more premium.

---

# 29. Establish Clear Semantic Colour Rules

Green currently performs several roles:

- Brand accent
- Positive performance
- Selection
- Live status
- Player identity

This risks semantic confusion.

Suggested colour grammar:

| Meaning | Colour |
|---|---|
| Brand / Selected | SCRBRD Violet |
| Positive / Improving | Green |
| Batting | Green |
| Bowling | Blue |
| Fielding | Cyan |
| Warning | Amber |
| Negative | Red |
| AI / Intelligence | Violet |

Users will gradually learn this visual language across the platform.

---

# 30. Use Animation as Feedback

SCRBRD should feel dynamic, but animation must reinforce interaction rather than decorate the interface.

Good examples:

- Changing season causes charts to morph
- Selecting a batter redraws the Wagon Wheel
- Opening Battle Card brings player profiles together
- Hovering Career Timeline updates performance context
- A live scoring event subtly pulses the affected metric

Recommended timing:

### Standard UI transitions

**150–250ms**

### Analytical transitions

**300–450ms**

Avoid long cinematic transitions in operational workflows.

---

# 31. Add Intelligence Summaries Above Complex Charts

Not every user will immediately understand advanced analytics.

This is particularly relevant for:

- Parents
- Players
- School administrators
- Less analytical coaching users

Each complex visualisation should answer:

> What does this mean?

Example above Wagon Wheel:

> **Scoring tendency**  
> Aaron generates 42% of his boundaries through the off-side, with the cover drive currently his most efficient scoring option.

Example above bowling analysis:

> **Bowling tendency**  
> 61% of Aaron's wickets this season have come from good-length deliveries outside off stump.

The visualisation can then provide the evidence underneath.

---

# 32. Make AI Insights Evidence-Based

Current AI-style observations such as:

> Good bowling average of 21.8. Reliable with the ball.

are too generic.

SCRBRD should aim for evidence-backed analysis.

Example:

> **Bowling effectiveness improving**  
> Aaron has taken 7 wickets across his last four matches at 18.4, compared with a season average of 21.8. Five of those wickets came between overs 8–15.

Then provide:

- **View evidence**
- **Compare period**
- **Ask SCRBRD**

AI should explain the data rather than simply repeat it.

---

# 33. Make Every Card Decision-Oriented

A useful design test is:

> What decision does this module help someone make?

Examples:

### Readiness Score

Helps a coach make:

- Selection decisions
- Workload decisions

### Skill Matrix

Helps a coach make:

- Development planning decisions

### Wagon Wheel

Helps with:

- Batting strategy
- Opposition planning

### Recent Form

Helps with:

- Selection
- Batting order
- Rotation

A generic Composite Index is less useful unless the user can understand:

- How it was calculated
- Why it matters
- What action it should inform

---

# 34. Recommended Desktop Composition

```text
┌─────────────────────────────────────────────────────────────────────┐
│ AP  AARON PHILLIPS     All-Rounder · 1st XI        MATCH READY ●  │
│ 2026 ▾ · 1st XI ▾ · All Formats ▾ · All Competitions ▾            │
├─────────────────────────────────────────────────────────────────────┤
│ Overview   Performance   Development   Intelligence   Career Passport│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ FORM 82 ↑       READINESS 88       IMPACT 83       DEVELOPMENT +16 │
│                                                                     │
├──────────────────────────────────────┬──────────────────────────────┤
│ CURRENT PERFORMANCE                  │ SCRBRD INTELLIGENCE          │
│                                      │                              │
│    Form / performance visualisation  │  Key contextual insight      │
│                                      │                              │
├──────────────────────────────────────┴──────────────────────────────┤
│                                                                     │
│ PERFORMANCE STORY                                                   │
│                                                                     │
│   Batting       Bowling       Fielding                              │
│                                                                     │
├──────────────────────────────────────┬──────────────────────────────┤
│ VISUAL ANALYSIS                      │ RECENT EVENTS                │
│ Wagon / pitch / skills               │ Match timeline               │
│                                      │                              │
└──────────────────────────────────────┴──────────────────────────────┘
```

The system remains rich.

There is simply less interface surrounding the data.

---

# 35. Make the Interface Role-Aware

The same player profile should not necessarily look identical to:

- Player
- Parent
- Coach
- Scout
- Performance Analyst
- School Administrator
- Public Spectator

## Scout Example

Prioritise:

- Role Archetype
- Potential Ceiling
- Development trajectory
- Representative level
- Battle Card
- Comparison tools

## Parent Example

Prioritise:

- Season performance
- Awards
- Milestones
- Fixtures
- Development

Avoid exposing confidential scouting or private coaching information.

This should be governed through SCRBRD's RBAC model rather than by creating entirely separate applications.

---

# 36. Separate Public Profile from Performance Intelligence

Establish two distinct modes.

## Public Profile

Contains:

- Identity
- Teams
- Public statistics
- Highlights
- Honours
- Milestones
- Fixtures
- Public media

## Performance Intelligence

Contains:

- Readiness
- Development
- Skills matrix
- Coach assessments
- Matchups
- Workload
- Scouting
- Impact analysis
- Tactical intelligence

This separation also supports stronger privacy controls, POPIA alignment and child safeguarding.

---

# 37. Recommended Priority Order

The next UI/UX pass should prioritise the following:

1. Introduce a global **Season / Team / Format / Competition** context system.
2. Compress the player hero and make it sticky/collapsible.
3. Restructure the current top-level tabs into clearer information domains.
4. Eliminate duplicated statistics and clearly label data scope.
5. Redesign the Impact empty state.
6. Convert Stats from static statistic cards into analytical visualisations.
7. Turn Intelligence into the primary deep-interaction analytical area.
8. Reduce the large Skills matrix using progressive disclosure.
9. Compress Career Timeline by year with expandable detail.
10. Introduce the Inspector Drawer.
11. Introduce cross-filtering across analytical modules.
12. Make AI insights evidence-based and clickable.
13. Build role-aware profile experiences through RBAC.
14. Establish consistent semantic colour rules.
15. Add Focus Mode for deep analytical workflows.

---

# Core Product Principle

The most important design principle going forward should be:

> **SCRBRD should not feel like a database showing everything it knows about an athlete. It should feel like an intelligence system revealing the right information at the right level of depth.**

The current interface already contains several strong differentiators:

- Role Archetype Fit
- Career Runway
- Battle Card
- Wagon Wheel
- Readiness intelligence
- Longitudinal development
- Impact analysis
- Player Passport

The next stage should focus less on creating more cards and more on making these systems:

- Connected
- Contextual
- Interactive
- Explainable
- Role-aware
- Evidence-backed
- Visually coherent

That is the path towards a player profile that remains immersive and data-rich without becoming dense or overwhelming.
