# SCRBRD Design System
## Bento Grid × Material 3 × Gradient Depth × Subtle Liquid Glass

**Document:** `design.md`  
**Product:** SCRBRD / ScrbrdOS  
**Primary context:** Match Hub, Live Scoring, Coach/Player/School dashboards, spectator surfaces  
**Design intent:** Dense sports intelligence without visual clutter; fast operational use for scorers; rich, premium presentation for spectators, coaches and administrators.

---

# 1. Design Vision

SCRBRD should feel like a **modern sports operating system**, not a generic school-management dashboard.

The visual language combines four systems:

1. **Bento-box information architecture** for modular, glanceable data.
2. **Material 3 principles** for hierarchy, accessibility, adaptive components and predictable interaction.
3. **Controlled gradients** for energy, depth, context and brand expression.
4. **Subtle Apple-inspired liquid-glass cues** for premium translucency and layered depth — used sparingly so the interface remains functional and legible.

The result should be:

- fast under pressure;
- easy to scan;
- visually distinctive;
- highly modular;
- responsive across phone, tablet and desktop;
- appropriate for school sport, elite performance and broadcast-style spectator views;
- consistent across different roles while still adapting to the task at hand.

The guiding principle is:

> **Information first. Atmosphere second. Decoration last.**

---

# 2. Core Product Personality

SCRBRD should communicate:

- **Precision** — scores, stats and actions must feel trustworthy.
- **Momentum** — sport is live and dynamic.
- **Control** — scorers and officials must never feel lost.
- **Intelligence** — data should feel analysed, not merely displayed.
- **Prestige** — the product should feel credible enough for top schools, academies, provincial teams and professional environments.
- **Humanity** — profiles, achievements and milestones should feel personal rather than sterile.

Avoid a visual language that feels:

- like a banking app;
- like a generic SaaS admin template;
- over-glassmorphic;
- overly neon or gaming-oriented;
- cluttered with decorative cards;
- broadcast-heavy in operational scorer workflows;
- too childish for senior-school or elite environments.

---

# 3. Design Principles

## 3.1 Glanceability Before Density

Every screen should answer the user’s primary question within 1–2 seconds.

Examples:

- **Scorer:** What happened on the last ball, what is the current state, and what do I need to enter next?
- **Coach:** Who is available, who is performing, and what requires intervention?
- **Parent/Spectator:** What is the score, match situation and key momentum story?
- **Player:** What is next, how am I performing and what requires attention?
- **School Admin:** What needs approval, action or escalation?

Density is allowed only when the hierarchy remains obvious.

## 3.2 Progressive Disclosure

Do not show every field, option or stat at once.

Use a layered model:

- Level 1: headline state;
- Level 2: contextual supporting information;
- Level 3: expandable detail;
- Level 4: specialist or administrative controls.

This is especially important in live scoring.

## 3.3 Spatial Consistency

The same type of information should live in the same spatial region across screens whenever practical.

For example:

- primary score/status → upper-left or top centre;
- live context → centre;
- next-action controls → lower action zone;
- secondary analytics → right rail or lower bento row;
- alerts → visually distinct but non-blocking status surfaces.

## 3.4 Role-Adaptive, Not Role-Fragmented

SCRBRD should not feel like 17 unrelated products for 17 user roles.

The shell, navigation, component language and interaction rules remain consistent. The **content, permissions, priorities and available actions** adapt by role.

## 3.5 Operational Interfaces Must Be Calmer Than Spectator Interfaces

The scorer UI should prioritise:

- speed;
- certainty;
- touch-target size;
- undo/recovery;
- sequence;
- current game state;
- error prevention.

The spectator UI may use stronger gradients, animated transitions, sponsor surfaces and more editorial storytelling.

---

# 4. Visual Language

## 4.1 Bento-Box Composition

The bento system is not simply “lots of cards”. It is an information grid with intentional variation in size and emphasis.

### Grid principles

- Use a **12-column desktop grid**.
- Use **8 columns on tablet landscape**.
- Use **4 columns on mobile**.
- Base spacing unit: **4 px**.
- Primary layout increments: 8 / 12 / 16 / 20 / 24 / 32 px.
- Standard card gap: **12–16 px**.
- Major section gap: **24–32 px**.

### Bento card sizes

Use four broad card classes:

- **S — Utility tile:** 1–2 metrics, shortcuts, small alerts.
- **M — Standard information card:** table snippet, player status, key stats.
- **L — Primary task card:** live score, match state, current innings, scoring action.
- **XL — Hero module:** Match Hub, wagon wheel, partnership graph, lineup, profile hero.

Do not give every card identical visual weight.

### Bento hierarchy

A screen should usually contain:

- one dominant card;
- two to four supporting cards;
- a small number of utility tiles;
- optional expandable detail below.

Avoid a dashboard composed of 10–15 equally weighted rectangles.

---

# 5. Surface System

SCRBRD uses a layered surface model inspired by Material 3 elevation and subtle liquid glass.

## 5.1 Surface Levels

### Surface 0 — App Canvas

Purpose: page background.

Characteristics:

- matte neutral base;
- minimal visual noise;
- subtle ambient radial gradients permitted;
- never full glass.

### Surface 1 — Standard Card

Purpose: most bento panels.

Characteristics:

- opaque or near-opaque;
- soft tonal separation from canvas;
- thin keyline or tonal edge;
- restrained shadow.

### Surface 2 — Elevated Action Card

Purpose: active scoring stage, urgent task, modal context, selected metric.

Characteristics:

- stronger tonal contrast;
- optional subtle gradient;
- deeper shadow;
- stronger border treatment.

### Surface 3 — Glass Layer

Purpose: overlays, floating controls, sticky action bars, match-status chips, selected contextual panes.

Characteristics:

- translucent;
- backdrop blur;
- inner highlight;
- fine border;
- used selectively.

**Rule:** glass is an accent layer, not the default card treatment.

---

# 6. Liquid Glass Treatment

The Apple-like influence should be subtle and functional.

## Use glass for

- floating navigation;
- sticky scoring controls;
- score-state overlay on photography;
- contextual detail drawer;
- segmented control container;
- floating action buttons;
- live-state pill;
- match switcher;
- tablet side rail;
- confirmation strip after a scoring action.

## Avoid glass for

- long tables;
- dense forms;
- scorecards;
- financial data;
- medical information;
- large text blocks;
- every bento tile;
- core ball-entry buttons.

## Suggested glass specification

```css
background: color-mix(in srgb, var(--surface) 72%, transparent);
backdrop-filter: blur(18px) saturate(125%);
-webkit-backdrop-filter: blur(18px) saturate(125%);
border: 1px solid rgba(255,255,255,0.14);
box-shadow:
  0 8px 30px rgba(0,0,0,0.10),
  inset 0 1px 0 rgba(255,255,255,0.12);
```

Dark mode should reduce white borders and rely more on tonal contrast.

Never sacrifice text contrast for translucency.

---

# 7. Colour Strategy

SCRBRD should use a **neutral core + contextual sport colour + team colour + semantic status colour**.

## 7.1 Neutral Core

Suggested neutral direction:

- near-black / charcoal for premium dark mode;
- cool off-white / light grey for light mode;
- slightly blue-biased greys to feel technical rather than corporate.

### Example token structure

```css
--scrbrd-bg: #0C1016;
--scrbrd-surface-1: #121821;
--scrbrd-surface-2: #18212C;
--scrbrd-surface-3: #202B38;
--scrbrd-text-primary: #F5F7FA;
--scrbrd-text-secondary: #A9B2C1;
--scrbrd-outline: rgba(255,255,255,0.10);
```

Exact brand colours should be derived from the SCRBRD identity system rather than hard-coded into every module.

## 7.2 Team Colour Inheritance

Team colours may customise:

- team identity strip;
- avatar ring;
- score comparison bars;
- small gradient highlights;
- selected-team state;
- broadcast/spectator surfaces.

Team colour must **not** override semantic UI states.

Example:

- red team colour does not replace the error colour;
- green school colour does not replace success status.

## 7.3 Semantic Colours

Use semantic colour consistently:

- success;
- warning;
- error;
- info;
- live;
- paused;
- scheduled;
- completed.

Never rely on colour alone. Pair with labels/icons where meaning is important.

---

# 8. Gradient System

Gradients provide energy and dimensionality, but must remain controlled.

## 8.1 Ambient Gradients

Use large, low-opacity radial gradients in the app canvas.

Purpose:

- subtly frame important regions;
- distinguish match contexts;
- make dark mode feel rich rather than flat.

## 8.2 Component Gradients

Use gradients for:

- live match hero surfaces;
- score comparison bars;
- selected-state accent;
- momentum visualisation;
- profile hero panels;
- sponsor-safe spectator surfaces.

Avoid gradients behind:

- dense text;
- forms;
- scorecard tables;
- critical action grids.

## 8.3 Gradient Behaviour

Gradients should generally be:

- low-contrast;
- directional;
- slightly desaturated;
- paired with solid surfaces;
- never rainbow unless representing genuine multivariate data.

---

# 9. Typography

Typography must feel contemporary, technical and highly legible.

## 9.1 Hierarchy

Suggested scale:

- **Display:** 40–56 px, only for large spectator hero moments.
- **H1:** 30–36 px.
- **H2:** 24–28 px.
- **H3:** 20–22 px.
- **Title:** 16–18 px, medium/semibold.
- **Body:** 14–16 px.
- **Label:** 12–14 px.
- **Micro:** 11–12 px, only for metadata.

Large headings should not dominate operational screens.

## 9.2 Scores and Numeric Data

Use tabular numerals for:

- scores;
- overs;
- run rates;
- strike rates;
- averages;
- timers;
- finance;
- rankings.

Score numerals may be large, but must retain clear label hierarchy.

Example:

```text
184/6
18.4 overs
RR 9.85
```

Do not style all three lines with equal prominence.

---

# 10. Shape Language

Material 3 encourages expressive shape, but SCRBRD should remain disciplined.

## Radius scale

- 8 px — small controls, tags, inputs.
- 12 px — compact cards.
- 16 px — default bento card.
- 20 px — major feature card.
- 24 px — hero surface.
- full pill — status, filters, segmented controls.

Avoid excessive 28–32 px rounding across every component; it can make the product feel toy-like.

## Nested radii

Child elements should generally use a smaller radius than the containing card.

Example:

- outer card: 20 px;
- inner metric tiles: 14 px;
- action buttons: 12 px.

---

# 11. Material 3 Influence

SCRBRD should borrow **principles**, not imitate the default Android appearance.

Use Material 3 for:

- adaptive colour roles;
- large touch targets;
- clear states;
- predictable elevation;
- accessible contrast;
- navigation rail / bottom nav logic;
- FAB hierarchy;
- segmented buttons;
- chips;
- bottom sheets;
- state layers;
- motion patterns;
- responsive breakpoints.

Customise the visual treatment so the product feels uniquely SCRBRD.

---

# 12. Interaction States

Every interactive component needs:

- default;
- hover;
- focus;
- pressed;
- selected;
- disabled;
- loading;
- error where relevant.

For live-scoring buttons, also consider:

- just-entered;
- reversible/undoable;
- pending sync;
- synced;
- conflict;
- locked by another scorer.

Feedback must be immediate.

---

# 13. Motion System

Motion should explain state changes, not entertain the scorer.

## 13.1 General timing

- micro interaction: 100–160 ms;
- card state: 180–240 ms;
- panel transition: 220–320 ms;
- page transition: 280–420 ms.

Use spring-like easing sparingly.

## 13.2 Appropriate motion

- score increment;
- wicket state change;
- selected scorer action;
- innings change;
- panel expansion;
- tab switch;
- bento card reflow;
- wagon-wheel shot reveal;
- match momentum update.

## 13.3 Avoid

- bouncing cards;
- excessive parallax;
- constant looping backgrounds;
- animated gradients behind scoring controls;
- transitions that delay ball entry.

Respect reduced-motion preferences.

---

# 14. Iconography

Use a single coherent icon family with Material-compatible geometry.

Icons should be:

- rounded but not playful;
- optically balanced;
- 18–24 px in most controls;
- paired with text for ambiguous actions.

Never rely on a cricket-specific icon if its meaning is not immediately obvious.

Example: “Retired hurt” should not be represented by an unexplained icon alone.

---

# 15. Navigation Architecture

## Desktop

Recommended structure:

- persistent navigation rail or compact sidebar;
- top contextual bar;
- primary workspace;
- optional contextual inspector/right rail.

## Tablet

Tablet is a priority SCRBRD form factor, especially for scoring.

Recommended:

- compact left rail;
- central workspace;
- optional right contextual pane;
- sticky scoring action area.

## Mobile

Recommended:

- bottom navigation for top-level spectator/player flows;
- compact top app bar;
- full-screen task states;
- bottom sheets for secondary detail.

Do not force a desktop dashboard onto mobile.

---

# 16. Match Hub Design

The Match Hub should be the definitive operational and informational home for a fixture.

## 16.1 Hero Match Card

Primary card contains:

- team identities;
- score;
- innings state;
- overs;
- target/revised target if relevant;
- current result equation;
- match status;
- venue;
- competition;
- live indicator;
- weather/pitch only if operationally relevant.

This card should feel visually important without becoming oversized.

## 16.2 Supporting Bento Modules

Suggested modules:

- current partnership;
- current batters;
- current bowler;
- run-rate comparison;
- recent balls;
- wagon wheel;
- Manhattan chart;
- fall of wickets;
- predicted score/range;
- lineup;
- officials;
- match notes;
- conditions;
- commentary;
- scorer status;
- sync/offline status.

Cards should rearrange by role.

---

# 17. Live Scoring — Primary UX Model

Live scoring must be treated as a **transactional workflow**, not just a dashboard.

The scorer must always understand:

1. the game state;
2. the current delivery context;
3. the required action;
4. what was just recorded;
5. how to undo/correct it.

## 17.1 Three-Phase Scoring Alignment

The interface should support a clear sequential model:

### Phase 1 — Enrich / Prepare

Capture or confirm contextual information that can be prepared before the delivery result is entered.

Examples:

- striker;
- non-striker;
- bowler;
- bowling end;
- over state;
- field/shot context if captured pre-delivery;
- optional delivery setup information.

### Phase 2 — Score / Record Outcome

Primary scoring controls:

- dot;
- 1 / 2 / 3;
- 4;
- 6;
- wicket;
- extras;
- dead ball / no result where applicable.

This must be the largest and fastest interaction zone.

### Phase 3 — Enrich / Resolve

Capture contextual metadata triggered by the result:

- shot type;
- wagon-wheel location;
- dismissal type;
- fielder;
- run-out details;
- boundary context;
- optional tactical tags;
- notes.

Phase 3 should only appear when relevant.

## 17.2 Combined Enrich + Score Pane

Where Phase 1 and Phase 2 share the same pane, the UI should still preserve sequence.

Recommended pattern:

- **upper zone:** compact contextual enrich controls;
- **centre:** delivery-state preview;
- **lower dominant zone:** scoring action grid;
- after selection, the pane morphs or advances into Phase 3 without a full-page change.

The user should feel like they are moving through one continuous scoring loop.

---

# 18. Scoring Action Grid

The action grid is the most important operational component in CricketOS.

## Requirements

- very large touch targets;
- predictable placement;
- no horizontal scrolling;
- strong selected/pressed state;
- optimised for muscle memory;
- primary run outcomes always visible;
- extras/wickets accessible without ambiguity;
- destructive or unusual actions separated from frequent actions.

Suggested hierarchy:

```text
[ DOT ] [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 6 ]
[ EXTRAS ] [ WICKET ] [ MORE ]
```

On tablet, consider larger physical separation between run buttons and event buttons.

---

# 19. Recent Balls / Delivery Timeline

Use ball chips or pills to show the recent sequence.

Examples:

```text
•  1  4  W  0  2  1
```

States can include:

- run outcome;
- wicket;
- wide;
- no-ball;
- bye;
- leg bye;
- pending/sync issue;
- corrected ball.

The latest delivery should be visually prominent.

Selecting a ball opens a detailed inspector rather than immediately editing it.

---

# 20. Undo and Correction UX

A scorer will make mistakes. Recovery is a core feature, not an edge case.

## Rules

- always show a visible **Undo last ball** action after scoring;
- retain a short undo window in the primary UI;
- older edits require deliberate ball selection;
- show dependencies created by the correction;
- preserve audit history;
- never silently rewrite history.

Use a confirmation surface only when the correction has downstream impact.

---

# 21. Offline and Sync State

Because scoring may happen on school grounds with unreliable connectivity, connectivity state must be visible but not distracting.

Use simple states:

- **Online — synced**;
- **Offline — saved locally**;
- **Syncing**;
- **Sync conflict**;
- **Scorer lock lost**.

The scorer should never wonder whether the delivery was saved.

A small persistent state indicator may live inside the glass top bar or scoring footer.

---

# 22. Data Visualisation

SCRBRD visualisation should feel analytical and editorial, not like a BI dashboard.

## Use for

- wagon wheel;
- run-rate chart;
- Manhattan chart;
- worm chart;
- partnerships;
- bowling lengths;
- pitch map;
- player skill radar;
- head-to-head comparison;
- form guide;
- performance progression;
- field placement;
- momentum.

## Rules

- axes and labels must remain readable;
- minimise unnecessary grid lines;
- tooltips should add detail, not restate labels;
- animate only meaningful changes;
- maintain colour-blind-safe differentiation;
- include numeric summaries near complex charts.

---

# 23. Wagon Wheel Treatment

The wagon wheel can be a signature SCRBRD visual.

Recommended styling:

- dark or neutral field surface;
- restrained field markings;
- lines coloured by run value or shot class;
- selected shot highlighted with glow or thicker path;
- batter orientation clearly indicated;
- filters in compact chips;
- sponsor branding only on spectator-facing versions.

Do not allow sponsor logos to interfere with shot-line legibility.

---

# 24. Player Cards

Player cards should communicate more than a headshot and name.

## Compact card

- avatar/photo;
- name;
- role;
- form indicator;
- availability;
- key stat;
- team/age group.

## Expanded card

- full performance summary;
- skills matrix;
- recent matches;
- trends;
- milestones;
- awards/accolades;
- role-specific action buttons.

Private attributes must respect RBAC and POPIA boundaries.

---

# 25. Status Chips

Use chips for concise states such as:

- LIVE;
- FINAL;
- DELAYED;
- RAIN;
- AVAILABLE;
- INJURED;
- PENDING;
- APPROVED;
- OVERDUE.

Do not create a chip for every piece of metadata.

Status chips should remain compact and semantically coloured.

---

# 26. Buttons

## Primary

Use for one dominant action per region.

Examples:

- Start match;
- Confirm innings;
- Save lineup;
- Submit report.

## Tonal / Secondary

Use for supporting actions.

## Text / Ghost

Use for low-priority actions.

## Destructive

Use sparingly and explicitly.

Scoring outcome buttons are a specialised class and should not inherit generic CTA styling.

---

# 27. Inputs and Forms

Forms should follow Material 3 clarity with SCRBRD styling.

## Principles

- visible labels;
- helper text when needed;
- errors adjacent to the field;
- sensible defaults;
- autocomplete for known entities;
- segmented controls for short finite choices;
- date/time selectors optimised for sporting schedules;
- save state clearly communicated.

Avoid placeholder-only labels.

---

# 28. Tables and Scorecards

Scorecards require high density and should not be forced into decorative cards.

## Recommendations

- sticky headers;
- aligned numeric columns;
- tabular numerals;
- compact row heights;
- row expansion for detail;
- minimal borders;
- horizontal scroll only where unavoidable;
- first identity column remains sticky on small screens.

Use stronger row emphasis for:

- not-out batters;
- current bowler;
- wickets;
- milestones;
- anomalies.

---

# 29. Spectator Experience

Spectator surfaces can be more expressive than scorer surfaces.

Use:

- richer gradients;
- stronger team colours;
- live animations;
- broadcast-style score hierarchy;
- key-player moments;
- contextual storytelling;
- sponsor placements;
- hero photography;
- more prominent wagon wheel / charts.

Still maintain restrained typography and clear information order.

---

# 30. Coach Cockpit

Coach views should prioritise decisions rather than raw statistics.

Primary modules may include:

- availability;
- current match situation;
- player form;
- bowling workload;
- batting partnerships;
- field-placement insight;
- matchup intelligence;
- injury restrictions;
- performance alerts;
- training observations.

The bento hierarchy should surface exceptions and opportunities.

---

# 31. Dashboard Composition by Role

Every role can use the same design language with different bento priorities.

## Player

- next fixture;
- next training;
- form;
- personal goals;
- recent performance;
- milestones;
- availability;
- notifications.

## Parent

- child/children switcher;
- upcoming fixtures;
- transport;
- consent;
- invoices;
- notifications;
- spectator links.

## Coach

- availability;
- squads;
- performance flags;
- training;
- upcoming fixtures;
- recent reports.

## School Admin

- approvals;
- facilities;
- transport;
- finance;
- incidents;
- competitions;
- audit alerts.

## Scout

- prospect watchlist;
- upcoming fixtures;
- player comparison;
- reports;
- trend analytics;
- video/media references.

---

# 32. Responsive Behaviour

Responsive design should change **composition**, not merely scale cards.

## Desktop

- multi-column bento;
- persistent navigation;
- supporting right rail;
- simultaneous analytics.

## Tablet Landscape

Priority form factor for scoring.

- split-pane workflow;
- scoring controls always visible;
- score state pinned;
- contextual detail beside or above controls;
- 44–56 px minimum interactive targets, preferably larger for scoring.

## Tablet Portrait

- stacked primary panels;
- context collapses into drawers/sheets;
- action grid remains anchored.

## Mobile

- one dominant task per viewport;
- horizontal stat scrollers only for secondary metrics;
- bottom sheets for detail;
- minimal simultaneous charts;
- spectator layouts prioritise score and match situation.

---

# 33. Accessibility

Minimum requirements:

- WCAG 2.2 AA contrast;
- keyboard navigation on desktop;
- visible focus ring;
- screen-reader labels;
- semantic headings;
- minimum target size of 44 × 44 px;
- no meaning conveyed only by colour;
- reduced-motion support;
- text scaling resilience;
- accessible tables;
- meaningful alt text for media;
- chart summaries for non-visual users.

Operational scoring should aim above minimum accessibility standards because errors carry match consequences.

---

# 34. Privacy-Sensitive UI

SCRBRD handles minors and protected information.

Sensitive information should visually communicate restricted access.

Use:

- privacy labels;
- permission-aware fields;
- masked information where appropriate;
- role-gated actions;
- clear audit trail access for authorised users.

Do not use dramatic visual treatment that inadvertently exposes the existence of sensitive medical or disciplinary data to unauthorised roles.

---

# 35. Advertising and Sponsorship Surfaces

Sponsorship should feel integrated into spectator content, not operational tools.

## Allowed surfaces

- spectator Match Hub;
- tournament hub;
- venue page;
- broadcast scorecard;
- wagon wheel border or footer;
- match splash screen;
- post-match summary.

## Avoid

- scorer action grid;
- coach tactical views;
- private player dashboards;
- injury/medical surfaces;
- disciplinary workflows;
- admin approval flows.

Sponsor surfaces should never visually compete with the live score.

---

# 36. Empty States

Empty states should explain what the user can do next.

Example:

Instead of:

> No data.

Use:

> No wagon-wheel data yet. Shot locations will appear as deliveries are enriched.

Keep empty states concise and contextual.

---

# 37. Loading States

Use skeletons for predictable content.

Use spinners only for short blocking actions.

Scoring actions should use optimistic local feedback where safe.

Never blank the entire scorer interface while syncing.

---

# 38. Error States

Errors must answer:

1. what happened;
2. whether the last action was saved;
3. what the user should do next.

Example:

> **Delivery saved locally.** Connection lost. SCRBRD will sync automatically when connectivity returns.

This is better than:

> Network error.

---

# 39. Microcopy

SCRBRD copy should be:

- concise;
- calm;
- specific;
- operational;
- sports-literate;
- free of unnecessary technical language.

Avoid excessive exclamation marks and “fun” language during official scoring workflows.

---

# 40. Elevation

Use shadow sparingly.

Suggested approach:

- standard cards rely mostly on tonal contrast;
- floating surfaces use soft shadows;
- active modal/panel gets the strongest elevation;
- glass surfaces use inner highlight + low shadow;
- never stack multiple heavy shadows.

Dark mode should rely more on tonal elevation than black drop shadows.

---

# 41. Example Design Tokens

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-hero: 24px;
  --radius-pill: 999px;

  --motion-fast: 140ms;
  --motion-medium: 220ms;
  --motion-slow: 320ms;

  --scrbrd-bg: #0C1016;
  --scrbrd-surface-1: #121821;
  --scrbrd-surface-2: #18212C;
  --scrbrd-surface-3: #202B38;
  --scrbrd-text-primary: #F5F7FA;
  --scrbrd-text-secondary: #A9B2C1;
  --scrbrd-outline: rgba(255,255,255,.10);
}
```

These values are starting points and should be refined against the final SCRBRD brand palette.

---

# 42. Card Anatomy

A typical bento card should use this structure:

```text
┌─────────────────────────────────────┐
│ Eyebrow / status          Action    │
│ Main title                          │
│                                     │
│ Primary content                     │
│                                     │
│ Supporting metric / chart / list    │
│                                     │
│ Context / secondary action          │
└─────────────────────────────────────┘
```

Not every card requires every level.

Avoid redundant headings where context is obvious.

---

# 43. Live Match Tablet Layout

Recommended landscape composition:

```text
┌────────────────────────────────────────────────────────────────┐
│ Match Header / Score / Innings / Sync / Scorer                │
├──────────────────────────┬─────────────────────────────────────┤
│                          │                                     │
│ Match State              │  Enrich / Score Pane                │
│ - Batters                │  - Phase 1 context                  │
│ - Bowler                 │  - Large score buttons              │
│ - Partnership            │  - Relevant Phase 3 follow-up       │
│ - Recent balls           │                                     │
│                          │                                     │
├──────────────────────────┴─────────────────────────────────────┤
│ Secondary analysis: wagon wheel / over detail / commentary    │
└────────────────────────────────────────────────────────────────┘
```

The action pane should remain stable so the scorer builds muscle memory.

---

# 44. Scorer-Focused Design Rules

The following rules override purely aesthetic decisions:

1. The current ball state must always be visible.
2. The scoring action area must never be hidden behind analytics.
3. Core run buttons must not move during normal play.
4. The scorer must always know whether the last ball was saved.
5. Undo must be visible immediately after entry.
6. Rare events should not clutter the common path.
7. Wicket workflows must enforce legal follow-up information.
8. Extras must be cricket-law aware.
9. End-of-over, innings and match transitions must be explicit.
10. Offline scoring must feel first-class, not degraded.
11. One-screen visual flair must never increase scoring error risk.
12. The UI should favour sequence and certainty over raw configurability.

---

# 45. Visual Personality by Context

## Scorer

- quiet;
- high contrast;
- stable;
- minimal glass;
- large controls;
- functional gradients only.

## Coach

- analytical;
- richer data;
- moderate visualisation;
- quick comparisons;
- exception-based alerts.

## Player

- motivational;
- performance-led;
- stronger profile imagery;
- milestones and trends.

## Parent

- reassuring;
- schedule-led;
- clear child switching;
- low complexity.

## Spectator

- most expressive;
- richer gradients;
- glass overlays;
- broadcast influence;
- sponsor-ready.

## Admin

- restrained;
- operational;
- dense but structured;
- clear queues and status.

---

# 46. What Not to Do

Do not:

- apply glass to every card;
- use gradients everywhere;
- make headings excessively large;
- use massive empty padding in data-heavy screens;
- hide key controls for visual cleanliness;
- rely on hover for critical information;
- make mobile a reduced desktop copy;
- use inconsistent radii;
- overload dashboards with equal-priority cards;
- use team colours for semantic states;
- let sponsor branding interfere with official scoring;
- over-animate live-scoring controls;
- put critical ball-entry actions inside nested menus;
- prioritise visual novelty over scorer muscle memory.

---

# 47. Desired Overall Feel

The final SCRBRD experience should sit somewhere between:

- the clarity and adaptability of **Material 3**;
- the information architecture of a refined **bento dashboard**;
- the depth and premium polish of **Apple’s translucent layered interfaces**;
- the urgency and hierarchy of a **modern sports broadcast graphics package**;
- the precision of a professional **performance-analysis platform**.

It should not look like a direct copy of any of these systems.

The combination should create a distinct SCRBRD visual identity:

> **calm under pressure, rich in intelligence, unmistakably live.**

---

# 48. Implementation Priority

## Phase 1 — Foundation

- colour tokens;
- typography;
- spacing;
- radius;
- elevation;
- responsive grid;
- core components;
- accessibility states.

## Phase 2 — Operational Components

- scoring action grid;
- match header;
- delivery timeline;
- player switcher;
- wicket/extras workflows;
- sync status;
- undo/correction;
- Phase 1 → Phase 2 → Phase 3 scoring sequence.

## Phase 3 — Match Intelligence

- wagon wheel;
- partnerships;
- run-rate charts;
- bowling analysis;
- H2H;
- skills matrices;
- contextual insights.

## Phase 4 — Premium Layer

- glass surfaces;
- motion refinement;
- ambient gradients;
- spectator broadcast treatments;
- sponsor placements;
- role-specific customisation.

---

# 49. Final Design Test

Before approving any SCRBRD screen, ask:

- Can the primary task be understood in two seconds?
- Is there one obvious visual priority?
- Does the screen still work with gradients and glass removed?
- Are the most frequent actions the easiest to reach?
- Can a scorer operate it quickly under pressure?
- Does it adapt cleanly to tablet and mobile?
- Is every important state accessible without relying on colour?
- Does the interface respect RBAC and privacy boundaries?
- Are we showing data because it matters, or because it exists?
- Does it feel like SCRBRD rather than a generic admin template?

If the answer to any critical question is no, the screen needs another design pass.

---

# 50. Design North Star

**SCRBRD should feel less like filling in software and more like operating the match.**

The interface must disappear behind the user’s intent: score quickly, understand the game, make better decisions, and experience school sport with the polish of a modern professional platform.
