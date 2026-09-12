# SCRBRD Player Profile — UX Specification v2

**Status:** Draft for engineering and design · supersedes v1 (`SCRBRD_Player_Profile_UI_UX_Review.md`)
**Audience:** the engineers building the profile, the designer owning the system, and the product owner deciding scope
**How to read:** §1–§3 are the rules everything else follows. §4–§6 are the page spec. §7–§9 are constraints and how we measure. §10 is the plan. Appendix A maps v1 sections to this document.

---

## 0. The one-sentence brief

> SCRBRD should feel like an intelligence system that reveals the right information at the right depth — not a database showing everything it knows about an athlete.

The current profile has the right visual language and most of the right modules. What it lacks is a single connective idea: **every number on the page belongs to a scope, and the whole page is a function of that scope.** Once that is true, the context bar, cross-filtering, the inspector and evidence-backed AI all fall out naturally. Until it is true, each of them is decoration.

---

## 1. Principles

These are the tests any profile change must pass. They are ordered; when two conflict, the earlier one wins.

| # | Principle | The test |
|---|---|---|
| P1 | **Privacy by default** | Would a parent, scout or spectator see this? If the answer depends on role, the module is gated by RBAC, never by layout. Minors' data is a legal constraint (POPIA), not a design preference. |
| P2 | **Every number carries its scope** | Can the reader say, without scrolling, which season, team, format and competition this value describes, and how many matches it rests on? |
| P3 | **Zero is not "no data"** | A genuine recorded zero renders as `0`. Missing data renders as `—`. Never a plausible fallback. |
| P4 | **Depth on demand** | Snapshot in 5 seconds, analysis in 60, investigation only when asked. Nothing at level 3 is visible at level 1. |
| P5 | **Show once** | A statistic has one home on the page. If it appears twice, one of them is wrong. |
| P6 | **Evidence, not adjectives** | Any claim ("improving", "reliable") links to the numbers and the period that justify it. |
| P7 | **Decision-oriented** | Each module names the decision it supports (selection, workload, development plan, batting strategy). A module that supports no decision is removed or merged. |

---

## 2. The scope contract

This is the section v1 was missing. It is the technical backbone; the UI in §4–§6 assumes it exists.

### 2.1 Scope

```ts
type Scope = {
  season: SeasonId | 'career';
  team: TeamId | 'all';
  format: 'multiday' | '50over' | 't20' | 'all';
  competition: CompetitionId | 'all';
  window: 'all' | 'last5' | 'last10';
};
```

- Scope lives in the **URL** (`/players/:id?season=2026&team=1stXI&format=all&competition=all&window=all`). A profile view is therefore shareable, bookmarkable and back-button-safe, and the server can render it scoped on first load.
- Defaults: current season · player's primary team · all formats · all competitions · all matches. Defaults are resolved server-side from the player's registrations, never hardcoded.
- The option lists in the context bar are **derived from the player's actual history** (seasons they played, teams they were registered to), never a static list.

### 2.2 Scoped statistic

```ts
type Stat<T = number> = {
  value: T | null;        // null → render "—" (P3)
  scope: Scope;           // what the value describes (P2)
  sampleSize: number;     // matches / innings / balls behind it
  asOf: ISODateString;    // when it was computed
};
```

Every metric a module renders is a `Stat`, and the module renders the scope label from the `Stat`, not from its own assumptions. This is what makes P2 and P5 enforceable in code review.

### 2.3 One dataset per page

The page loads **one** scoped dataset (matches, innings, deliveries, assessments, events in scope). Modules are pure functions of that dataset plus local UI state. They do not fetch by `playerId` on their own.

- Changing scope changes the URL, which refetches the dataset once, keyed by `(playerId, scope)`, and every module re-derives.
- Cross-filters *within* a scope (§6.1: "spin only", "powerplay only") are client-side selectors over the loaded dataset and must not trigger network requests.
- The inspector (§6.2) fetches level-3 detail (deliveries, video, notes) on demand, keyed by the thing being inspected, and caches it.

### 2.4 Minimum sample rule

A `Stat` whose `sampleSize` is below a per-metric threshold renders with a muted treatment and a tooltip ("based on 3 innings"). Averages from fewer than 3 innings, strike rates from fewer than 30 balls, and impact from fewer than 10 qualified matches are shown but flagged. This replaces v1's Impact-only empty state (§16) with a general rule.

---

## 3. Information architecture

### 3.1 Depth model

| Level | Question | Time | Where it lives |
|---|---|---|---|
| 1 · Snapshot | What do I need to know right now? | 5 s | Hero strip + Overview KPI row |
| 2 · Analysis | Why is the player performing this way? | 30–60 s | Tab bodies: charts, splits, matrices |
| 3 · Investigation | Show me exactly what caused this | on demand | Inspector drawer, deep-link to match / delivery |

Rule: a level-3 element (a delivery, a coach note, a clip) never renders inline at level 1 or 2. It is reached from them.

### 3.2 Tabs

Six domains. The in-flight implementation has five (Career folded into Development); the recommendation is to keep six, because Career answers "what has happened" and Development answers "what is changing" — different decisions (P7).

| Tab | Purpose | Decision it supports |
|---|---|---|
| **Overview** | Current state: form, readiness, what's changing, one insight | Selection this week; where to look next |
| **Performance** | Batting, bowling, fielding within scope | Batting order, bowling plan, rotation |
| **Development** | Skills, attributes, trajectory, coach assessments | Development plan, training focus |
| **Intelligence** | Spatial and matchup analytics: wagon wheel, pitch map, H2H, battle card | Opposition planning, tactics |
| **Career** | Seasons, teams, milestones, honours, awards, selections | Pathway, representative nominations |
| **Passport** | Verified identity, registrations, eligibility, credentials | Compliance, eligibility checks |

Impact is a *dimension* that appears inside Performance and Intelligence, not a tab. Rewards are surfaced in Career, not a tab.

### 3.3 Hero

Two states, and — correcting v1 — **no statistic appears in both the hero and the Overview KPI row.**

**Expanded (≈170 px):** avatar · name · role · primary team · school · age · readiness pill · recent form strip · rank/representative badge. No career metrics: those belong in Performance, scoped.

**Collapsed sticky (≈64 px), from the moment the tabs scroll under the header:**

```
AP  Aaron Phillips · All-Rounder · 1st XI        ● Match Ready   WWLWW
2026 ▾ · 1st XI ▾ · All formats ▾ · All comps ▾ · All matches ▾
```

The context bar is part of the sticky strip, so scope is always visible (P2) and always changeable. This is the single largest layout change from the current implementation, which makes the tab bar sticky but not identity or scope.

### 3.4 Overview composition

```
FORM 82 ↑9      READINESS 88%      IMPACT 83      DEVELOPMENT +16      (each: scope label · sample size)
┌──────────────────────────────────────┬──────────────────────────────┐
│ CURRENT PERFORMANCE (scoped)         │ SCRBRD INTELLIGENCE          │
│ runs-by-innings sparkline, last 10   │ one evidence-backed insight   │
│ dismissal mix · phase splits         │ + View evidence · Ask SCRBRD  │
├──────────────────────────────────────┴──────────────────────────────┤
│ NEXT MATCH · readiness detail · workload (role-gated)               │
├──────────────────────────────────────┬──────────────────────────────┤
│ WHAT'S CHANGING (skills slope, top 3 movers)  │ RECENT EVENTS       │
└──────────────────────────────────────┴──────────────────────────────┘
```

The four KPIs are the *only* place Form/Readiness/Impact/Development appear as headline numbers. Each is clickable → inspector explains how it was computed (P6, P7).

---

## 4. Tab specifications

Each tab lists: modules, visual rules, the no-data state, and the inspector hooks.

### 4.1 Performance

**Modules:** scoped summary band (Matches · Runs · Avg · SR · Wkts · Econ, each a `Stat` with scope label) → Batting story → Bowling story → Fielding story.

**Visual rules — the three disciplines are different shapes and get different charts:**

| Discipline | Primary visuals | Never |
|---|---|---|
| Batting | runs-by-innings sparkline · dismissal matrix · phase splits (PP/middle/death) · boundary frequency · strike rotation | a radar |
| Bowling | pitch map · line/length heatmap · economy & SR by phase · spell timeline · wicket zones | identical card to batting |
| Fielding | involvement map · catch zones · saved runs · misfield rate | a 0 where there is no data |

**No-data:** each discipline block renders its skeleton with `—` values and a one-line reason ("no bowling recorded in this scope") — not a hidden block, so the reader learns the scope is empty, not that the feature is missing.

**Inspector hooks:** any metric → its computation and the innings behind it; any dismissal cell → the matches; any phase → the deliveries.

### 4.2 Development

**Modules:** Player DNA radar (the *one* radar on the profile: Batting · Bowling · Fielding · Physical · Mental · Tactical) → multi-season skill heatmap → attribute matrix with progressive disclosure → coach assessment history.

**Radar rule (from v1 §8, kept):** radars show *shape*, never history. Change over time uses slope charts, the heatmap, or sparklines.

**Attribute matrix:** collapsed by domain, each showing domain score, YoY delta and top three attributes; "View n more" expands. Target: matrix ≤ 40% of its current height at rest.

**Attribute detail (inspector):** the score, its history (2024 → 2025 → 2026 with delta), assessing coach and date, and any linked evidence.

### 4.3 Intelligence

The deep analytical workspace. Modules: wagon wheel · pitch map · battle card / comparison · matchups.

**Wagon wheel:**
- Modes: shots · density · runs · boundaries · dismissals · efficiency.
- Filters (client-side selectors, §2.3): batting hand · pace/spin · phase · outcome · bowler · venue · match.
- Region hover: shots, runs, runs/shot, boundary %.
- Shot click → inspector: bowler, over.ball, line, length, shot quality, expected runs, result, ▶ view delivery when media exists.
- Above the chart, one **intelligence summary** in plain language (P6), e.g. "42% of boundaries through the off side; cover drive is the most efficient option in this scope."

**Battle card:** raw · normalised · percentile · head-to-head views. Normalisation controls for batting position, age group, format and role. Always shows sample size for both players.

**Focus mode:** a control on this tab collapses the sidebar and hero to maximise the canvas. (The app's sidebar already supports a compact state; this is a per-page trigger for it, not a new component.)

### 4.4 Career

**Modules:** pathway trajectory (U15A → U16A → 2nd XI → 1st XI → Provincial U19, with milestone markers) → timeline grouped by year, major events weighted, "Expand 2025 →" for minor ones → honours & awards → rewards (surfaced here, not a tab).

Selecting a milestone sets a temporary scope highlight so the reader can see the performance around it.

### 4.5 Passport

**Purpose:** *who is this athlete and what is officially verified.* Identity · DOB · school · roles · registrations · representative selections · eligibility · captaincy · verified credentials.

**Removed from Passport (v1 §11, kept):** skills, form, performance stats, scouting intelligence, general honours. The current `PlayerPassportView` still embeds skill and form radars; those move to Development and Overview.

---

## 5. Cross-cutting behaviours

### 5.1 Cross-filtering

Two tiers, and they behave differently:

- **Scope change** (context bar): URL changes → one dataset refetch → whole page re-derives. Budget: skeleton within 100 ms, data within 1 s on a good connection.
- **In-scope filter** (a chip inside a module, e.g. "spin only"): pure client selector over the loaded dataset; all modules that declare the same dimension update. Budget: < 100 ms, zero network requests.

A filter is *published* to the page (affects other modules) only when it is a dimension in the shared dataset; module-local view toggles (heatmap vs shots) stay local.

### 5.2 Inspector drawer

- Opens from any metric, shot, delivery, skill, milestone, match or player.
- Content is **resolved from an identifier** (`{ kind: 'metric', key: 'battingAverage', scope }`), never hand-built at the call site. Unknown → `—`, not a placeholder number.
- Deep-linkable (`?inspect=metric:battingAverage`), so an insight can be shared.
- Accessibility: `role="dialog"` `aria-modal`, focus trapped, `Esc` closes, focus returns to the trigger.
- Loads lazily; level-3 fetches are cached by identifier.

### 5.3 AI and intelligence summaries

Every generated statement must carry: the claim · the numbers · the period · the sample size · a link to evidence. Template:

> **Bowling effectiveness improving** — 7 wickets in the last 4 matches at 18.4 vs a season average of 21.8 (11 matches). Five of those came in overs 8–15. *View evidence · Compare period · Ask SCRBRD*

Summaries without numbers do not ship. Summaries are computed per scope and cached with the dataset.

### 5.4 Role-aware rendering

One profile, gated by RBAC at the module level:

| Module | Player | Parent | Coach | Scout | Spectator |
|---|---|---|---|---|---|
| Public stats, honours, fixtures | ✓ | ✓ | ✓ | ✓ | ✓ |
| Readiness, workload | ✓ | ✓ | ✓ | – | – |
| Skills matrix, coach assessments | ✓ (read) | summary | ✓ | ✓ | – |
| Scouting notes, comparison tools | – | – | ✓ | ✓ | – |
| Impact, tactical intelligence | ✓ | – | ✓ | ✓ | – |

Gating hides the module and its data; it never renders a locked placeholder that reveals the module exists to someone who shouldn't see it.

### 5.5 Motion

Feedback, not decoration. Scope change: charts morph 300–450 ms. UI transitions: 150–250 ms. Live scoring events pulse the affected metric once. Honour `prefers-reduced-motion` everywhere. No animated blur, no filter animation on large surfaces.

---

## 6. Visual system

### 6.1 Typography scale (px, desktop / phone)

| Role | Size | Notes |
|---|---|---|
| Micro label (eyebrows) | 11 / 11 | condensed uppercase, letter-spaced; **never below 11** |
| Analytical label | 13 / 13 | the current 9–10 px labels move here |
| Body | 14 / 15 | |
| Metric value | 28–40 / 24–32 | tabular numerals |
| Section heading | 18–24 / 17–20 | |

The current implementation uses 9 px eyebrows extensively; at laptop scaling these fail the "futuristic, not forensic" test and WCAG contrast at that size.

### 6.2 Surfaces instead of borders

Tonal elevation carries hierarchy: Surface 0 canvas → Surface 1 section → Surface 2 interactive card → tinted surface for selected. Borders are reserved for **selected, live, warning, focus, error**. Target: fewer than one bordered container per module at rest.

### 6.3 Colour grammar

Fixes v1's two conflicts (green for both Positive and Batting; violet for both Brand and AI). Status hues and chart-series hues are separate families and never swap roles.

**Status hues (UI):**

| Meaning | Hue | Existing token |
|---|---|---|
| Brand / selected | Indigo | `--scrbrd-indigo` |
| Positive / improving / live | Emerald | `--scrbrd-emerald` |
| Warning / attention | Amber | `--scrbrd-amber` |
| Negative / wicket / error | Rose | `--scrbrd-rose` |
| AI / intelligence | Violet | `--scrbrd-violet` |
| Live match data | Sky | `--scrbrd-sky` |

**Series hues (charts only):** Batting — gold; Bowling — blue; Fielding — cyan. Desaturated relative to status hues so a bowling series never reads as "live" and a batting series never reads as "warning".

---

## 7. Mobile and pitch-side

v1 had no mobile section; for coaches this is the primary context.

- **Phone (≤ 640 px):** hero opens collapsed; context bar becomes a single "2026 · 1st XI · All ▾" chip that opens a sheet; tabs become a horizontally scrolling segmented control; charts render as small multiples stacked, never side-by-side; touch targets ≥ 44 px.
- **Tablet, landscape (pitch-side):** two-column Overview; Intelligence tab gets focus mode by default.
- **Offline:** the last loaded scope renders read-only from cache with an "as of" stamp; scope changes queue until reconnection.
- **Sunlight:** metric values and labels meet 4.5:1 contrast on the dark ground; no information carried by colour alone.

---

## 8. Budgets

These are acceptance criteria, not aspirations.

| Budget | Target |
|---|---|
| Overview LCP (p75, tablet on 4G) | ≤ 2.0 s |
| Scope change to updated charts | ≤ 1.0 s; skeleton ≤ 100 ms |
| In-scope filter to updated modules | ≤ 100 ms, 0 network requests |
| Tab switch | ≤ 300 ms, no refetch of already-loaded scope |
| Initial JS for Overview | Development, Intelligence, Career, Passport bodies lazy-loaded |
| Radars on the profile | exactly 1 |
| Labels below 11 px | 0 |
| Fabricated fallback values in production | 0 (P3) |
| Uncached fetches keyed on `playerId` alone | 0 (§2.3) |

---

## 9. Success metrics

Instrument before shipping so the change can be judged.

- **Time to first insight:** seconds from page load to first scroll or click that isn't a tab switch. Target: down 30%.
- **Scope usage:** share of sessions that change scope at least once. Target: > 40% for coach and scout roles.
- **Inspector engagement:** inspector opens per session; share that reach a deep link (match/delivery).
- **Scroll depth on Overview:** should *fall* — the answer is above the fold.
- **Trust signals:** support tickets or feedback mentioning "wrong stats" or "numbers don't match". Target: zero attributable to scope ambiguity.

---

## 10. Phased plan

Phases are ordered by dependency: nothing in a later phase works properly without the earlier one. "Status" reflects the `feat/director-command-dashboard` branch at the time of writing.

### Phase 1 — Trust and backbone

| Item | v1 ref | Status | Notes |
|---|---|---|---|
| Scope in URL; server-side scoped dataset; option lists derived from history | §2, §24 | **Not started** — bar exists, nothing consumes it | Blocks everything below |
| `Stat` type with `—` for null; remove all fallback literals | §1, §20 | Not started (23 fallbacks in the client) | Mechanical once the type exists |
| Hero collapse + sticky context strip; remove hero metrics | §3 | Partial — tab bar sticks, identity does not | |
| Six tabs (restore Career) | §4 | Partial — five tabs implemented | Small change |
| Inspector resolved by identifier; a11y | §25 | Partial — drawer exists, content is inline literals | |

### Phase 2 — Depth

| Item | v1 ref | Status |
|---|---|---|
| Performance tab: discipline-specific visuals; scoped summary band | §18, §19 | Not started |
| Impact: sample-size rule + event timeline | §16, §17 | Not started |
| Development: one radar, skill heatmap, collapsible matrix, attribute history | §7, §8, §21, §22 | Partial (matrix has inspector hook) |
| Career: trajectory + year-grouped timeline | §10, §23 | Not started |
| Passport: remove skills/form/perf; keep verified identity | §11 | Not started |

### Phase 3 — Connected

| Item | v1 ref | Status |
|---|---|---|
| In-scope cross-filtering with the 100 ms / zero-fetch budget | §24 | Not started |
| Wagon wheel modes, filters, shot inspector | §13, §14 | Not started (component takes no player data) |
| Battle card normalisation modes | §15 | Not started |
| Evidence-backed summaries with links | §31, §32 | Not started |
| Role-gated modules | §35, §36 | Not started — currently the simulator role, not auth |

### Phase 4 — Polish

| Item | v1 ref |
|---|---|
| Typography scale, surfaces over borders, colour grammar | §27, §28, §29 |
| Motion rules and reduced-motion audit | §30 |
| Focus mode trigger on Intelligence | §26 |
| Mobile and pitch-side layouts | §7 (new) |

---

## Appendix A — v1 → v2 map

| v1 | v2 | Change |
|---|---|---|
| Exec summary, §5, Core principle | §0, §1, §3.1 | Consolidated into ordered principles with tests |
| §1 Data hierarchy, §20 Zero vs no data | P2, P3, §2.2 | Became a data contract, not a guideline |
| §2 Context bar, §24 Cross-filtering | §2, §5.1 | Split into scope (URL, refetch) vs in-scope filters (client, no fetch); budgets added |
| §3 Hero | §3.3 | Removed metrics from hero to honour P5; context bar joins the sticky strip |
| §4 Navigation | §3.2 | Kept six tabs; noted the five-tab implementation |
| §6 Overview | §3.4 | KPI row is now the *only* home for those four numbers |
| §7, §8, §21, §22 | §4.2 | Merged into the Development spec |
| §9 Role archetype fit | §4.2 / §5.2 | Delivered through the inspector rather than as a separate feature |
| §10, §23 | §4.4 | Merged into Career |
| §11 Passport | §4.5 | Kept |
| §12–§15 | §4.3 | Merged into Intelligence with concrete filter/mode lists |
| §16, §17 | §2.4, §4.1 | Generalised into the minimum-sample rule + impact timeline |
| §18, §19 | §4.1 | Merged into Performance |
| §25 Inspector | §5.2 | Added resolver contract, deep-linking, accessibility |
| §26 Sidebar | §4.3 focus mode | Sidebar already collapses; kept only the per-page trigger |
| §27, §28 | §6.1, §6.2 | Concrete sizes; measurable targets |
| §29 Colour | §6.3 | Resolved green/green and violet/violet conflicts; mapped to existing tokens |
| §30 Animation | §5.5 | Kept; added reduced-motion and no-filter-animation rules |
| §31, §32 | §5.3 | One evidence contract for both |
| §33 Decision-oriented | P7, tab tables | Made a principle and a column, not a section |
| §34 Desktop composition | §3.4 | Kept; §7 adds mobile |
| §35, §36 | P1, §5.4 | Privacy promoted to the first principle; role matrix made explicit |
| §37 Priorities | §10 | Re-ordered by dependency; status added |
| — | §7, §8, §9 | **New:** mobile/pitch-side, budgets, success metrics |
