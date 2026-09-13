# SCRBRD UI/UX Refactor — `design.md`

**Version:** 1.0  
**Status:** Design direction and implementation specification  
**Product:** SCRBRD / ScrbrdOS  
**Scope:** Complete UI/UX refactor across desktop, tablet and mobile  
**Primary vertical:** CricketOS  
**Design intent:** Premium sports intelligence platform combining broadcast clarity, performance analytics, modern editorial design and immersive real-time match experiences.

---

# 1. Design Vision

SCRBRD should feel like a **modern sports operating system**, not a generic school-management dashboard.

The reference art direction suggests a strong visual territory built from five ideas:

1. **Dark performance surfaces** — deep black, charcoal and midnight-blue foundations.
2. **Electric sports colour** — lime, acid green, cyan, cobalt and selective yellow accents.
3. **Atmospheric gradient fields** — soft, luminous colour transitions used as depth, not decoration.
4. **Immersive photography** — real sporting environments integrated into the interface rather than placed inside conventional cards.
5. **Dense but calm data design** — information-rich bento layouts with clear hierarchy and strong typographic control.

The desired result is a UI that feels:

- fast
- athletic
- intelligent
- premium
- youthful without being childish
- visually distinctive
- broadcast-aware
- data-rich without feeling cluttered
- immersive without becoming cinematic excess
- professional enough for schools, analysts and administrators
- exciting enough for players, parents and spectators

SCRBRD should look recognisable even when the logo is removed.

---

# 2. Refactor Objectives

The refactor should solve the following problems across the current product:

- reduce visual clutter
- eliminate inconsistent card styles
- remove over-sized headings
- create a disciplined hierarchy for dense information
- unify dashboards, profiles, Match Centre and scoring tools
- distinguish operational tools from spectator experiences
- create a coherent responsive system
- make real-time match state obvious at a glance
- create richer data visualisations without making the UI feel analytical for its own sake
- improve navigation across users with multiple roles
- give statistics meaningful visual priority
- establish reusable design tokens and components
- make team/school identity visible without destroying system consistency
- create a stronger premium product feel
- support dark and light environments
- support large displays, mobile devices and scorer tablets from the same design language

---

# 3. Core UX Principle

> **Show the truth first, context second, intelligence third, controls only where needed.**

This applies across SCRBRD.

For live sport:

> **Always-visible truth. Rotating intelligence. Interrupt only for significance.**

For administrative workflows:

> **Status first. Decision second. Action third. Detail on demand.**

For profiles:

> **Identity first. Current state second. History and analytics progressively disclosed.**

---

# 4. Art Direction

## 4.1 Overall Look

The new SCRBRD design language should combine:

- modern sports broadcast graphics
- premium fitness/performance dashboards
- Material 3 structural clarity
- subtle Apple-like depth and translucency
- editorial information design
- high-performance automotive instrumentation
- atmospheric digital gradients

The UI should avoid looking like:

- a generic SaaS admin template
- a banking dashboard
- an esports interface
- a neon cyberpunk product
- a school portal
- a collection of floating glass cards
- a Figma concept that cannot realistically be built

---

# 5. Visual Personality

The product should communicate the following personality traits:

| Trait | Expression |
|---|---|
| Performance | High-contrast numbers, responsive interactions, compact data |
| Intelligence | Contextual analytics, restrained visualisation, explainable insights |
| Energy | Electric colour accents, motion during meaningful events |
| Trust | Consistent patterns, stable layouts, readable typography |
| Youth | Fresh gradients, modern imagery, expressive highlights |
| Premium | Space, restraint, carefully controlled depth |
| Sport | Live state, team identity, score hierarchy, event-driven motion |
| South African | Authentic school/team imagery and local sporting context rather than generic stock imagery |

---

# 6. Colour System

The reference board suggests a palette built around luminous greens, acid yellow, cyan, blue and deep midnight.

The mistake would be to use all of these equally.

SCRBRD should use a **neutral-first system with selective spectral accents**.

## 6.1 Core Neutral Palette

```css
--scrbrd-black:        #080A0B;
--scrbrd-ink:          #0D1012;
--scrbrd-graphite:     #14181B;
--scrbrd-surface:      #1A2024;
--scrbrd-surface-2:    #22292E;
--scrbrd-border:       rgba(255,255,255,0.09);

--scrbrd-white:        #F7F8F3;
--scrbrd-paper:        #F2F3ED;
--scrbrd-mist:         #E3E7E2;
--scrbrd-muted:        #A8B0AC;
```

## 6.2 Signature Spectral Palette

```css
--scrbrd-lime:         #D7F900;
--scrbrd-acid:         #B8F20A;
--scrbrd-green:        #31C884;
--scrbrd-emerald:      #0D985D;
--scrbrd-cyan:         #28C9E8;
--scrbrd-sky:          #188EF5;
--scrbrd-cobalt:       #315BA8;
--scrbrd-midnight:     #001F3F;
--scrbrd-yellow:       #FFD817;
```

These are design-system colours, not team colours.

## 6.3 Semantic Colours

```css
--state-positive:      #38D684;
--state-warning:       #FFC84A;
--state-critical:      #FF5F63;
--state-info:          #4DA7FF;
--state-neutral:       #8F9A96;
```

### Rules

- Never rely on colour alone to communicate state.
- Use red sparingly so a wicket, error or critical alert retains meaning.
- Lime is a SCRBRD signature accent, not a universal button colour.
- Yellow is used for attention and sport-energy moments, not as a permanent dominant colour.
- Team colours should not override semantic colours.
- If two schools have similar colours, SCRBRD neutrals maintain interface separation.

---

# 7. Gradient System

Gradients are a defining part of the new art direction, but should behave like **light**, not like decorative wallpaper.

## 7.1 Signature Gradient

```css
background:
  radial-gradient(circle at 20% 20%, rgba(215,249,0,.35), transparent 32%),
  radial-gradient(circle at 70% 45%, rgba(49,200,132,.30), transparent 38%),
  radial-gradient(circle at 95% 15%, rgba(40,201,232,.26), transparent 34%),
  linear-gradient(135deg, #07110A 0%, #08283A 100%);
```

## 7.2 Gradient Families

### Energy
Lime → green → cyan

### Match
Team A colour → dark neutral → Team B colour

### Performance
Cyan → blue → midnight

### Alert
Amber → orange → deep graphite

### Achievement
Lime → yellow → white glow

### Rules

- Never place body text directly over a high-frequency gradient.
- Blur and soften gradients.
- Use 1–2 dominant colour regions, not rainbow fills.
- Avoid gradients on every card.
- Gradients should signal hierarchy, identity or atmosphere.

---

# 8. Surface System

## 8.1 Surface Types

### Level 0 — Canvas
Primary application background.

### Level 1 — Structural Surface
Navigation, main content containers, large sections.

### Level 2 — Bento Surface
Cards, visualisations, analytics modules.

### Level 3 — Floating Surface
Menus, drawers, modal layers, transient controls.

### Level 4 — Live/Event Surface
Temporary high-priority states such as wickets, milestones, alerts.

---

# 9. Glass Treatment

Use glass selectively.

Recommended:

```css
background: rgba(20,24,27,.72);
backdrop-filter: blur(18px) saturate(115%);
border: 1px solid rgba(255,255,255,.08);
box-shadow: 0 12px 40px rgba(0,0,0,.18);
```

Use glass for:

- match overlays
- navigation rails
- contextual panels over imagery
- modal intelligence cards
- floating match controls

Do not use glass for:

- dense tables
- forms
- scoring number pads
- every dashboard card
- critical text-heavy workflows

---

# 10. Shape Language

The reference direction strongly supports softened geometry.

## Radius Scale

```css
--radius-sm: 10px;
--radius-md: 16px;
--radius-lg: 22px;
--radius-xl: 30px;
--radius-pill: 999px;
```

### Rules

- Pill shapes are for state, filters and compact selectors.
- Cards use 16–24 px depending on scale.
- Hero containers can use 28–36 px.
- Avoid making every rectangular object a pill.
- Data tables should retain structural alignment rather than over-rounded rows.

---

# 11. Typography

Typography must carry much of the hierarchy because the interface will contain significant amounts of data.

## 11.1 Recommended Character

Use a clean grotesk or neo-grotesk with:

- excellent numeric legibility
- tabular numbers
- multiple weights
- compact display behaviour
- clear lowercase forms

Suitable directions:

- Inter / Inter Tight
- Geist
- Söhne-like grotesk
- SF-inspired system grotesk
- ABC Diatype-like character
- Neue Haas-inspired display treatment

Avoid heavily stylised athletic fonts for normal UI.

---

# 12. Typography Scale

```text
Display XL     56–72 px
Display L      44–56 px
Heading XL     34–40 px
Heading L      28–32 px
Heading M      22–26 px
Heading S      18–20 px
Body L         16–18 px
Body M         14–16 px
Body S         12–14 px
Label          11–12 px
Micro          9–11 px
```

### Key Rule

Large typography is reserved for:

- score
- player performance
- match result
- hero identity
- major dashboard KPI

Page headings should generally remain **28–36 px**, not oversized display text.

---

# 13. Numerical Typography

Numbers are central to SCRBRD.

Use:

- tabular numerals
- slightly tighter tracking
- strong weight contrast
- aligned decimals
- consistent cricket notation

Examples:

```text
154/5
17.5
8.64
73 (43)
3/29
141.90
```

Numbers should frequently be more visually dominant than their labels.

---

# 14. Grid System

## Desktop

- 12-column grid
- max content width: 1440–1600 px
- outer margin: 32–48 px
- gutter: 16–24 px

## Tablet Landscape

- 8-column grid
- margin: 20–28 px
- gutter: 12–16 px

## Mobile

- 4-column grid
- margin: 16–20 px
- gutter: 12 px

## Spacing Scale

```text
4
8
12
16
20
24
32
40
48
64
80
96
```

Do not introduce arbitrary spacing values unless required by a specific component.

---

# 15. Bento Layout Philosophy

SCRBRD should use bento composition without allowing every module equal prominence.

## Hierarchy

### A — Hero
The most important current state.

Examples:

- current live match
- next fixture
- current player state
- critical admin task

### B — Primary
High-value current data.

### C — Context
Supporting data and visualisations.

### D — Utility
Secondary operations and links.

Card size communicates priority.

---

# 16. Navigation Refactor

Navigation should be calm, persistent and role-aware.

## Desktop

Use a compact left rail with:

- SCRBRD mark
- Home
- Match Centre
- Fixtures
- Teams
- Players
- Training
- Analytics
- Messages/notifications
- role-specific modules
- settings/profile

Labels can expand on hover or when the rail is pinned.

## Tablet

Use collapsible navigation rail or adaptive side sheet.

## Mobile

Use bottom navigation for the five most important destinations and a "More" sheet for secondary functions.

---

# 17. Multi-Role UX

Users may hold multiple roles.

Do not create separate products for each role.

Use:

**Profile → Active role/context switcher**

Example:

```text
Kameel Kalyan
Coach · WBHS U16A
⌄
```

Switching role changes:

- dashboard
- available actions
- navigation
- alerts
- data permissions

It should not log the user into a separate application.

---

# 18. Dashboard Architecture

Dashboards must be role-specific rather than generic.

Every dashboard should answer:

1. What requires attention?
2. What is happening now?
3. What is happening next?
4. What has changed?
5. What can I act on?

## Dashboard Layout

```text
Context Header
Primary Hero
Attention / Action Row
Current Activity
Performance / Analytics
Timeline / Feed
Secondary Modules
```

Avoid:

- endless rows of KPI cards
- charts without decisions attached
- identical layouts for all roles

---

# 19. Hero Module Pattern

A dashboard hero should combine context, imagery and data.

Example:

```text
NEXT MATCH

WBHS U16A vs DHS U16A
Saturday · 09:00
Bowden's Field

Squad 13/15 confirmed
2 players unavailable

[Manage squad]
```

Background can use:

- venue imagery
- team imagery
- soft gradient
- abstract colour field

The image should feel integrated into the surface rather than inserted as a thumbnail.

---

# 20. Role Dashboard Priorities

## Player

- next match
- next training
- availability
- recent form
- development goals
- milestones
- coach feedback
- awards/rewards

## Coach

- squad availability
- upcoming match
- training planning
- player readiness
- tactical notes
- opposition intelligence
- recent performance
- notifications requiring action

## Captain

- upcoming match
- squad
- field/tactical directives
- match-day responsibilities
- player availability
- live coach communication

## Scorer

- assigned fixtures
- resume scoring
- offline/sync state
- scorecard completeness
- import/backfill tools
- scoring issues requiring correction

## Parent

- child's schedule
- consent
- transport
- invoices
- availability
- results
- communication
- relevant school/team news

## School Admin

- unresolved actions
- fixtures
- facilities
- teams
- transport
- finance
- permissions
- compliance
- disciplinary workflows

## Analyst / Scout

- opposition dossiers
- player comparisons
- trends
- H2H analysis
- scouting reports
- watchlists
- exported reports

## Spectator

- live matches
- upcoming fixtures
- scores/results
- headlines
- favourite teams
- player/team statistics

---

# 21. Match Centre

The Match Centre is the flagship product experience.

It should feel closer to a digital sports broadcast than an admin dashboard.

## Persistent Structure

```text
Match Context Bar

Live Match HUD

Primary Match Navigation

Contextual/Analytical Content
```

The live match state remains visible as users move through:

- Summary
- Scorecard
- Performance
- Commentary
- Live Feed
- Match Details

---

# 22. Match HUD

The Match HUD is a reusable component family.

## Standard Structure

```text
Competition / Live state

Team A      SCORE/WICKETS       Team B
                 OVERS
              TARGET

Striker           Non-striker

Bowler            Current over

Intelligence Ribbon
```

### Principles

- score dominates
- striker is obvious
- overs are subordinate
- target/chase equation is contextual
- recent balls are visually distinct
- no unnecessary admin metadata

---

# 23. Scoring HUD

The scorer interface should not be visually identical to the spectator view.

Priorities:

1. accuracy
2. speed
3. error prevention
4. recovery
5. context
6. aesthetics

## Scoring Layout

```text
Live Match State

Delivery Context / Enrichment

Scoring Controls

Outcome Confirmation

Undo / Correction
```

Touch targets must be large and consistent.

No advertising should appear in the scorer workflow.

---

# 24. Three-Phase Scoring

The interaction model should retain the same visual shell while the controls change.

## Phase 1 — Enrich

Capture selected analytical context:

- line
- length
- shot
- zone
- approach
- field state

## Phase 2 — Score

Primary outcome:

- 0
- 1
- 2
- 3
- 4
- 6
- extras
- wicket

## Phase 3 — Resolve

Conditional detail:

- dismissal
- dismissed batter
- fielder
- run-out details
- extras
- free hit
- confirmation

The scorer should never be forced through Phase 1 enrichment if match settings define it as optional.

---

# 25. Spectator HUD

The spectator interface is a distilled match view.

It should prioritise:

- score
- overs
- batters
- bowler
- current over
- target
- required rate
- partnership
- result state

It should exclude:

- scoring controls
- admin metadata
- correction tools
- sync status
- scorer identity
- tactical private data

---

# 26. Match Intelligence Ribbon

Replace generic "dynamic content" with a contextual **Intelligence Ribbon**.

Examples:

- `Need 44 from 26 balls`
- `Required rate now 10.15`
- `Lewis needs 8 for fifty`
- `Partnership 43 from 27`
- `17 runs from the last 12 balls`
- `Mkhize has conceded 11 from his last over`
- `DHS ahead of projected score by 9 runs`

The ribbon should rank insights by relevance rather than rotate randomly.

---

# 27. Event Interrupts

Use transient full-width states for:

- wicket
- milestone
- hat-trick ball
- five wickets
- hundred
- fifty
- new batter
- new bowler
- innings complete
- result
- Player of the Match

These states should be visually dramatic but short.

They should not permanently alter the page layout.

---

# 28. Data Visualisation Language

Visualisations should be understandable in under three seconds.

## Recommended Visualisations

- wagon wheel
- field map
- Manhattan
- worm
- run-rate line
- win-probability line
- phase comparison
- partnership timeline
- fall-of-wickets strip
- strike-rate evolution
- scoring-zone heat map
- line/length matrix
- bowler spell chart
- H2H radar where appropriate
- form sparkline
- season trend
- availability timeline

---

# 29. Data Visualisation Rules

- Keep axes and labels minimal.
- Directly label important values.
- Use team colours sparingly.
- Use neutral comparison lines.
- Do not use radar charts when a bar comparison is clearer.
- Avoid decorative 3D charts.
- Use animation only when it explains state change.
- Always provide a textual equivalent or accessible summary.
- Provide tooltips on desktop and tap details on touch devices.

---

# 30. Tables

Tables remain essential for:

- scorecards
- squads
- stats
- finance
- discipline
- player records
- fixtures

The refactor should not force every table into cards.

## Table Style

- quiet backgrounds
- clear row separation
- sticky header
- tabular numbers
- selective emphasis
- hover/tap affordance
- expandable rows for detail

Avoid full borders around every cell.

---

# 31. Scorecard Design

The scorecard should feel editorial and broadcast-informed.

## Batting

Columns:

- Batter
- Dismissal
- R
- B
- 4
- 6
- SR

## Bowling

- Bowler
- O
- M
- R
- W
- Econ
- Extras

Add expandable intelligence per row:

- wagon wheel
- recent balls
- match-up data
- commentary highlights
- milestones

---

# 32. Player Profiles

Player profiles should have three layers.

## Layer 1 — Identity

- photo
- name
- age group
- team
- role
- handedness
- primary skill
- status

## Layer 2 — Current State

- current season
- recent form
- availability
- next fixture
- training
- development focus

## Layer 3 — Intelligence

- career statistics
- skills matrices
- milestones
- awards
- performance trends
- H2H
- wagon wheels
- match-by-match history
- coach-visible development information

Sensitive information must remain permission-bound.

---

# 33. School Profiles

School profiles should feel like institutional sports destinations.

Include:

- identity
- crest
- colours
- location
- facilities
- teams
- fixtures
- results
- honours
- records
- current competitions
- notable players/alumni where authorised
- news
- media
- sponsor inventory
- venue information

The school identity should influence accents, not completely reskin the application.

---

# 34. Team Profiles

Team pages should prioritise:

- next fixture
- current competition
- current form
- squad
- standings
- leading performers
- recent matches
- statistics
- team identity
- coaching staff

---

# 35. Forms

Forms should be simple and quiet.

Rules:

- labels stay visible
- do not rely solely on placeholders
- group related fields
- use progressive disclosure
- autosave where safe
- clearly indicate required information
- validate inline
- preserve user input after errors
- avoid massive modal forms

For complex workflows use steps or side panels.

---

# 36. Buttons

## Primary
One dominant action per section.

## Secondary
Neutral surface.

## Tertiary
Text or icon action.

## Destructive
Red, explicit and confirmable.

Buttons should never all be lime.

Lime should be reserved for strong primary or live-performance moments.

---

# 37. Icons

Use one consistent icon family.

Icons should:

- be simple
- use consistent stroke weight
- not replace necessary text
- have tooltips on desktop
- include accessible labels

Avoid mixing filled and outline systems randomly.

---

# 38. Search

Global search should support:

- players
- teams
- schools
- fixtures
- competitions
- venues
- reports
- modules where permissions allow

Desktop search can live in the top command bar.

Mobile search opens a full-screen search surface.

---

# 39. Command Bar

For desktop power users:

```text
⌘ K
```

Search and quick actions:

- Find player
- Open fixture
- Start scoring
- Create training session
- Send notification
- View school
- Generate dossier

This should complement, not replace, normal navigation.

---

# 40. Notifications

Notifications should be ranked by importance.

Types:

- action required
- live
- informational
- milestone
- system

Do not use red dots for every notification.

A notification should always answer:

- what happened?
- who/what is affected?
- what action can I take?

---

# 41. Empty States

Empty states should explain what comes next.

Bad:

> No data.

Better:

> No upcoming fixtures have been scheduled for this team.

> Create a fixture or import the competition schedule.

Use illustration sparingly.

---

# 42. Loading States

Use skeletons shaped like the expected content.

For live data:

- show connection state
- retain last confirmed value
- indicate sync without blocking the interface

Avoid full-page spinners.

---

# 43. Offline State

Scoring must clearly communicate:

- online
- offline
- syncing
- synced
- conflict
- handover

These states should be persistent but unobtrusive.

Example:

```text
● Synced
```

or:

```text
○ Offline · 4 deliveries queued
```

---

# 44. Motion System

Motion should communicate cause and effect.

## Recommended

- 160–220 ms: controls
- 220–320 ms: cards/panels
- 350–500 ms: major transitions
- 800–1500 ms: celebratory event states

Use spring motion selectively for:

- score updates
- draggable fielders
- cards entering
- match-state changes

Avoid decorative perpetual motion.

---

# 45. Score Animation

When score changes:

- previous number remains spatially stable
- updated digit animates subtly
- no slot-machine effect
- boundaries can use a small energy pulse
- wickets use a stronger state interruption

---

# 46. Photography

Photography should be authentic and atmospheric.

Preferred:

- real school environments
- actual venues
- training moments
- match action
- natural light
- editorial sports photography
- wide environmental frames
- strong negative space for data overlays

Avoid:

- generic stock athletes
- artificial cut-outs unless intentionally used
- over-processed HDR
- cliché stadium imagery unrelated to school sport

---

# 47. Image Integration

The reference board demonstrates imagery as part of the interface.

Use images as:

- hero backdrops
- masked athlete cut-outs
- venue environments
- contextual content
- profile identity

Add gradient scrims for legibility rather than placing every image in a traditional card.

---

# 48. Light Mode

Light mode should feel like premium editorial sports media, not a white admin page.

Use:

- warm off-white canvas
- charcoal text
- soft grey structural lines
- spectral accents
- large areas of breathing room

Avoid pure white everywhere.

---

# 49. Dark Mode

Dark mode should be the flagship visual expression.

Use:

- black/graphite base
- restrained transparent layers
- luminous accents
- high-contrast numerics
- soft atmospheric gradients

Do not use blue-grey for every surface.

---

# 50. Team Colour Adaptation

Team identity can customise:

- team marker
- badge
- key line
- active tab
- match split gradient
- select chart series

It should not customise:

- semantic errors
- system navigation
- standard controls
- accessibility states

---

# 51. Accessibility

The refactor should meet WCAG 2.2 AA as a baseline.

Requirements:

- 4.5:1 text contrast where required
- 3:1 large text minimum
- non-colour state indicators
- keyboard navigation
- visible focus
- 44 × 44 px touch targets where practical
- reduced motion
- logical screen-reader order
- meaningful chart summaries
- accessible names for icon controls
- zoom/responsive text support

---

# 52. Responsive Behaviour

Do not simply stack desktop cards vertically.

Each breakpoint should prioritise different information.

## Desktop
Density + comparison + multitasking.

## Tablet
Match operations + scoring + coaching.

## Mobile
Current state + primary action + progressive drill-down.

---

# 53. Mobile Match Centre

Suggested order:

1. live Match HUD
2. chase equation / intelligence
3. current batters
4. current bowler
5. recent balls
6. commentary
7. scorecard
8. analytics
9. match details

Keep score accessible while the user scrolls.

---

# 54. Tablet Landscape

Tablet is strategically important for:

- scoring
- coaching
- captain workflows
- analysis

Use split panes where beneficial.

Example:

```text
Live Match / Score
┌──────────────────┬────────────────────┐
│ Scoring Controls │ Wagon Wheel/Field  │
│                  │                    │
│ Current Delivery │ Context / Players  │
└──────────────────┴────────────────────┘
```

---

# 55. Desktop Workspace

Desktop should support richer simultaneous context.

Example:

```text
Navigation
┌─────────────┬───────────────────────────────┐
│ Rail        │ Match / Dashboard Header      │
│             ├───────────────────────────────┤
│             │ Hero / Live State             │
│             ├──────────────┬────────────────┤
│             │ Main Content │ Context Panel  │
└─────────────┴──────────────┴────────────────┘
```

---

# 56. Sidebar / Context Panel

Use a right-side contextual panel for:

- player detail
- fixture detail
- editing
- analytics explanation
- comments
- notifications
- filters

This reduces modal overload.

---

# 57. Drawers and Modals

Use modals only for:

- destructive confirmation
- compact critical decisions
- short temporary tasks

Use drawers/sheets for:

- editing
- detail
- contextual exploration
- filters

Use full pages for complex workflows.

---

# 58. Filtering

Filters should be persistent and understandable.

Use chips for common filters:

```text
All   Batting   Bowling   Fielding
```

Advanced filters live in a filter drawer.

Display active filter count.

---

# 59. Analytics Explainability

Every analytical metric should be interpretable.

Example:

**Pressure Index 72**

Provide:

> High pressure because required rate is 10.4, two wickets fell in 14 balls and dot-ball percentage has reached 48%.

Never show opaque AI percentages without explanation.

---

# 60. AI / Prediction UI

Predictive information must be clearly labelled.

Use:

- probability range
- source/context
- timestamp/state
- short explanation

Avoid:

> AI says WBHS will win.

Prefer:

> **WBHS win probability 64%**  
> Based on current score, wickets remaining, target and recent scoring rate.

---

# 61. Sponsorship

Sponsor presence belongs primarily in spectator-facing surfaces.

Allowed:

- match sponsor
- tournament sponsor
- school-level sponsor
- wagon-wheel sponsorship
- innings summary
- Player of the Match
- scoreboard surfaces

Avoid sponsor presence in:

- scoring controls
- private coaching interfaces
- medical data
- disciplinary workflows
- private player development tools

---

# 62. Privacy by Design

UI must reveal access boundaries visibly.

Sensitive modules should indicate:

- permission requirement
- private state
- restricted data
- role visibility

Do not show inaccessible information as blurred teasers.

If a role cannot access it, remove it from the interface.

---

# 63. Component Library

Core reusable components should include:

## Navigation
- AppRail
- BottomNav
- ContextSwitcher
- CommandBar
- Breadcrumbs

## Live Sport
- ScoreBug
- MatchHUD
- DeliveryTimeline
- IntelligenceRibbon
- ChaseEquation
- PartnershipCard
- BatterCard
- BowlerCard
- MatchSummary
- InningsSummary
- WicketEvent
- MilestoneEvent

## Data
- MetricCard
- StatRow
- DataTable
- Sparkline
- TrendChart
- ComparisonBar
- HeatMap
- WagonWheel
- FieldMap

## Identity
- PlayerAvatar
- TeamBadge
- SchoolBadge
- PlayerIdentity
- TeamIdentity

## Interaction
- PrimaryButton
- SegmentedControl
- FilterChip
- StatusPill
- Drawer
- Sheet
- Modal
- Tooltip

## System
- EmptyState
- Skeleton
- OfflineState
- SyncState
- ErrorState
- PermissionState

---

# 64. Component State Requirements

Every interactive component must specify:

- default
- hover
- active
- focus
- selected
- disabled
- loading
- error
- success

Do not leave state styling to implementation guesswork.

---

# 65. Content Density

Provide density modes where necessary.

## Comfortable
Parent/spectator/mobile.

## Standard
Default application.

## Dense
Scorecards, analyst tables, admin tools.

Density changes spacing, not core hierarchy.

---

# 66. Microcopy

Voice should be:

- concise
- clear
- human
- sport-aware
- not overly corporate

Prefer:

> 2 players unavailable

over:

> There are currently two players whose availability status is unavailable.

Prefer:

> Resume scoring

over:

> Continue match scoring workflow.

---

# 67. Status Language

Use consistent states.

Examples:

- Scheduled
- Live
- Delayed
- Suspended
- Complete
- Abandoned
- Cancelled

Avoid near-duplicate status terms across modules.

---

# 68. UX Anti-Patterns to Remove

The refactor should actively remove:

- excessive card borders
- oversized page headings
- decorative badges everywhere
- meaningless KPI rows
- too many simultaneous accent colours
- repeated information across cards
- deep modal chains
- excessive glass effects
- ambiguous icon-only actions
- random gradients
- inconsistent spacing
- hidden important actions
- duplicated navigation
- overly dense top bars
- charts without a user decision or insight

---

# 69. Design QA Checklist

Before a screen is considered complete:

### Hierarchy
- Can the primary information be understood in 3 seconds?
- Is there only one dominant area?

### Density
- Is any information duplicated?
- Can secondary detail be progressive?

### Colour
- Is colour carrying meaning?
- Are semantic states consistent?

### Typography
- Are numbers aligned?
- Are page headings appropriately restrained?

### Interaction
- Are primary actions obvious?
- Are touch targets adequate?

### Responsive
- Does the mobile layout reprioritise rather than merely stack?

### Accessibility
- Is the screen usable without colour?
- Is focus visible?
- Is the reading order logical?

### Privacy
- Is every visible data point appropriate for the role?

---

# 70. Refactor Rollout

## Phase 1 — Foundations

- colour tokens
- typography
- spacing
- surface system
- navigation
- buttons
- forms
- iconography
- accessibility states

## Phase 2 — Core Product Shell

- dashboard
- profile shell
- team/school identity
- tables
- filtering
- search
- responsive navigation

## Phase 3 — CricketOS Flagship

- Match Centre
- Match HUD
- Scorer HUD
- Spectator HUD
- scorecard
- commentary
- analytics
- three-phase scoring

## Phase 4 — Intelligence

- performance dashboards
- H2H
- scouting
- skill matrices
- predictive analytics
- coach/captain cockpit

## Phase 5 — Multi-Surface

- pavilion displays
- livestream overlays
- sponsor surfaces
- mobile spectator experience
- shareable match graphics

---

# 71. Final Design Direction

SCRBRD should move towards a visual language where:

- **dark neutral surfaces create authority**
- **electric spectral colour creates energy**
- **gradients create atmosphere**
- **photography creates emotional connection**
- **typography creates hierarchy**
- **bento layouts organise complexity**
- **broadcast conventions make live sport instantly readable**
- **progressive disclosure prevents data overload**
- **motion communicates match events**
- **role-aware UX protects privacy and removes irrelevant complexity**

The product should feel less like software managing sport and more like **the operating system through which the sport is experienced, recorded, analysed and understood**.

That is the target for the complete SCRBRD UI/UX refactor.
