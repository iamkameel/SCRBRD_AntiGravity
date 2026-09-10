# SCRBRD CricketOS — UI/UX Design System & Guidelines
## The Complete Design Bible · Season 2026

> **Status:** Production · Version 3 · Westville Boys' High School Pilot  
> **Stack:** React 18 · JSX · Inline CSS · DM Mono · Syne · DM Sans  
> **Architecture:** Single-file SPA (`cricket_os.jsx`) · Dark-first · Token-driven

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Colour System](#2-colour-system)
3. [Typography](#3-typography)
4. [Spacing & Border Radius](#4-spacing--border-radius)
5. [Surfaces & Elevation](#5-surfaces--elevation)
6. [Component Library](#6-component-library)
7. [Animation & Motion](#7-animation--motion)
8. [Layout & Navigation Shell](#8-layout--navigation-shell)
9. [Role-Based UI Adaptation](#9-role-based-ui-adaptation)
10. [Module Screen Patterns](#10-module-screen-patterns)
11. [Data Visualisation](#11-data-visualisation)
12. [Forms & Input](#12-forms--input)
13. [Live & Real-Time UI](#13-live--real-time-ui)
14. [Accessibility & Responsiveness](#14-accessibility--responsiveness)
15. [Writing Style & Microcopy](#15-writing-style--microcopy)
16. [Do / Don't Rules](#16-do--dont-rules)

---

## 1. Design Principles

### 1.1 Clarity Over Decoration
Every element earns its place. If removing it doesn't lose meaning, remove it. SCRBRD serves coaches making split-second decisions during live matches — visual noise is a bug.

### 1.2 Data-Forward
Numbers are the primary content. Typography choices, colour assignments and layout hierarchy all serve legibility of data first, branding second.

### 1.3 Role-Aware Presentation
The same data is presented differently depending on who is viewing it. A parent sees their child's next fixture. A coach sees squad fitness and tactical notes. The UI is not one-size-fits-all — it adapts to the logged-in role.

### 1.4 Dark-First
The primary theme is dark (`isDark: true`). Every component is designed dark-first, then audited for light-mode compatibility. Live match environments (pavilions, grounds) benefit from dark mode legibility.

### 1.5 Precision Typography
Three typefaces. No substitutes. Each has a specific, non-overlapping role:
- **DM Mono** — all numeric/data values
- **Syne** — all headings, labels, UI chrome
- **DM Sans** — all body copy, descriptions

### 1.6 Status-Coded Colour
Each system colour corresponds to a semantic meaning that is consistently applied across all 30 modules. Colour is never decorative — it always signals something.

---

## 2. Colour System

### 2.1 Theme Architecture

The design token object `D` is produced by `makeTheme(isDark)` which merges three layers:

```js
const D = makeTheme(isDark);
// D contains: DARK_THEME or LIGHT_THEME properties + THEME_ACCENTS
```

### 2.2 Dark Theme Surfaces

| Token | Hex | Usage |
|-------|-----|-------|
| `D.bg` | `#060910` | App background — deepest layer |
| `D.surf0` | `#0a0f1a` | Page canvas |
| `D.surf1` | `#0f1621` | Card base layer, modals |
| `D.surf2` | `#151d2e` | Input fields, secondary cards |
| `D.surf3` | `#1c2640` | Hover states, chip backgrounds |
| `D.border` | `rgba(255,255,255,0.07)` | Hairline borders |
| `D.borderMed` | `rgba(255,255,255,0.12)` | Visible separators |
| `D.cardBg` | `rgba(255,255,255,0.03)` | Ghost card background |
| `D.textPrimary` | `#f0f4ff` | Primary text |
| `D.textSecondary` | `#8b9bc4` | Secondary text, labels |
| `D.textMuted` | `#4a5570` | Muted text, placeholders |

### 2.3 Light Theme Surfaces

| Token | Hex | Usage |
|-------|-----|-------|
| `D.bg` | `#f0f4f8` | App background |
| `D.surf0` | `#ffffff` | Page canvas |
| `D.surf1` | `#ffffff` | Card base |
| `D.surf2` | `#f5f7fb` | Input fields |
| `D.surf3` | `#eaeff7` | Hover states |
| `D.border` | `rgba(0,0,0,0.08)` | Hairline borders |
| `D.textPrimary` | `#0f172a` | Primary text |
| `D.textSecondary` | `#334155` | Secondary text |
| `D.textMuted` | `#94a3b8` | Muted text |

### 2.4 Accent Colours — Semantic Mapping

| Token | Hex | Semantic Role | Used For |
|-------|-----|--------------|----------|
| `D.indigo` | `#6366f1` | **Brand primary** | Nav active, primary buttons, gradient start, Dashboard |
| `D.sky` | `#0ea5e9` | **Match / Live data** | Scores, match cards, sky-related data, away team |
| `D.emerald` | `#10b981` | **Positive / Live** | Wins, live status, fitness "good", active indicators |
| `D.amber` | `#f59e0b` | **Warning / Traction** | Notifications, upcoming status, moderate fitness |
| `D.rose` | `#f43f5e` | **Danger / Medical** | Injuries, errors, urgent alerts, wickets (W) |
| `D.violet` | `#8b5cf6` | **Restricted / Advanced** | Passport, Talent Radar, restricted features |
| `D.teal` | `#14b8a6` | **Infrastructure** | Grounds, school admin, logistics |
| `D.orange` | `#f97316` | **Scheduling / Officials** | Match officials, scheduling wizard |
| `D.cyan` | `#06b6d4` | **Support roles** | Coaching support, secondary data |
| `D.lime` | `#84cc16` | **Transport** | Driver role, vehicle/logistics status |
| `D.pink` | `#ec4899` | **Secondary accent** | Rarely used; decorative contexts only |

### 2.5 Gradients

```css
/* Primary — brand identity, hero elements, primary buttons */
gradMain: linear-gradient(135deg, #6366f1, #0ea5e9)

/* Gold — KPI highlights, traction data, achievements */
gradGold: linear-gradient(135deg, #f59e0b, #f97316)

/* Live — real-time indicators, active match, positive trends */
gradLive: linear-gradient(135deg, #10b981, #06b6d4)
```

### 2.6 Colour Application Rules

**Alpha tinting pattern:** When a colour is used as a background tint, use `color + "18"` (18% opacity hex suffix). For borders: `color + "30"`. For hover states: `color + "22"`.

```js
// Background tint
background: D.indigo + "18"   // → #6366f118

// Border
border: `1px solid ${D.indigo}30`   // → #6366f130

// Role badge
background: roleColor + "22"
```

**Never** use a raw accent colour as a large solid background — always tint it. The only exception is buttons, active nav items, and data chips.

### 2.7 Role Colour Assignments

Each of the 17 user roles has a specific accent colour used for their badge, dashboard header, and nav active state:

| Role | Colour Token | Hex |
|------|-------------|-----|
| `superadmin` | violet | `#8b5cf6` |
| `platformops` | violet (dark) | `#7c3aed` |
| `leagueadmin` | indigo | `#6366f1` |
| `tournamentdirector` | indigo (dark) | `#4f46e5` |
| `sportsmaster` | amber | `#f59e0b` |
| `schooladmin` | teal | `#14b8a6` |
| `medicalofficer` | rose | `#f43f5e` |
| `schoolstaff` | sky | `#0ea5e9` |
| `coach` | emerald | `#10b981` |
| `coachsupport` | cyan | `#06b6d4` |
| `matchofficial` | orange | `#f97316` |
| `selector` | amber | `#f59e0b` |
| `player` | emerald | `#10b981` |
| `adultplayer` | emerald | `#10b981` |
| `parent` | sky | `#0ea5e9` |
| `scout` | violet | `#8b5cf6` |
| `external` | muted | `#64748b` |

---

## 3. Typography

### 3.1 Font Stack

```css
/* Data / Numbers / Codes — DM Mono */
font-family: 'DM Mono', monospace;
/* Weights used: 400 (Regular), 500 (Medium) */

/* Headings / Labels / UI Chrome — Syne */
font-family: 'Syne', sans-serif;
/* Weights used: 600 (SemiBold), 700 (Bold), 800 (ExtraBold) */

/* Body / Descriptions / Prose — DM Sans */
font-family: 'DM Sans', sans-serif;
/* Weights used: 300, 400, 500, 600 */
```

Loaded via Google Fonts:
```
https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600
```

### 3.2 Type Scale

| Role | Font | Size | Weight | Token |
|------|------|------|--------|-------|
| Page title | Syne | 20–22px | 800 | `D.head` |
| Section heading | Syne | 16–18px | 700 | `D.head` |
| Card heading | Syne | 13–15px | 700 | `D.head` |
| KPI value (large) | DM Mono | 28–36px | 500–700 | `D.mono` |
| Score / stat | DM Mono | 18–24px | 500 | `D.mono` |
| Label / badge | Syne | 9–11px | 700 | `D.head` |
| Overline / meta | Syne | 8–10px | 700 | `D.head` |
| Body paragraph | DM Sans | 12–14px | 400 | `D.body` |
| Description | DM Sans | 11px | 400 | `D.body` |
| Caption | DM Sans | 9–10px | 400 | `D.body` |
| Player name | DM Sans | 13–15px | 600 | `D.body` |

### 3.3 Typography Rules

1. **Never mix font families within the same semantic role.** A data value is always DM Mono. A heading is always Syne.
2. **Overlines and labels are always uppercase** with `letter-spacing: 0.06–0.08em`.
3. **Score/stat values always use DM Mono** regardless of surrounding context.
4. **Font weight communicates hierarchy** — within DM Sans, use 600 for names, 400 for descriptions.
5. **Avoid pure white (`#ffffff`) text** — use `D.textPrimary` (#f0f4ff) which has a slight cool tint that reduces eye strain on dark backgrounds.

---

## 4. Spacing & Border Radius

### 4.1 Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `D.sm` | `6px` | Small chips, tags, tight containers |
| `D.md` | `10px` | Form inputs, secondary cards |
| `D.lg` | `14px` | Primary cards, panels |
| `D.xl` | `18px` | Modals, large containers |
| `D.pill` | `999px` | Buttons, badges, pills, status dots |

### 4.2 Spacing System

SCRBRD uses an informal 4px base grid. Common spacing values:

| Value | Usage |
|-------|-------|
| 4px | Micro gaps (badge padding) |
| 6px | Small internal padding |
| 8px | Default gap between inline elements |
| 12px | Section internal padding |
| 14–16px | Standard card padding |
| 20–24px | Page section padding |

### 4.3 Application Layout Spacing

```
Page padding:     24px (main content area)
Sidebar width:    220px (expanded) / 60px (collapsed)
TopBar height:    52px
Card gap:         12–16px
Section gap:      20–24px
Grid gap:         12px
```

---

## 5. Surfaces & Elevation

### 5.1 Elevation Model

SCRBRD uses colour depth (darker = lower, lighter = higher) rather than traditional drop shadows for elevation in dark mode. Shadows are used sparingly for modals and floating elements only.

```
Level 0 — App background:  D.bg     (#060910)
Level 1 — Sidebar, TopBar: D.surf1  (#0f1621)  
Level 2 — Cards:            D.surf2  (#151d2e) + subtle border
Level 3 — Inputs, chips:    D.surf3  (#1c2640)
Level 4 — Modal overlay:    D.surf1  + rgba(0,0,0,0.75) backdrop
```

### 5.2 Card Pattern

The standard card is a `Card` component with these properties:

```js
const Card = ({ children, sx, className="card-hover", onClick }) => (
  <div className={className} style={{
    background: D.surf1,
    border: `1px solid ${D.border}`,
    borderRadius: D.lg,          // 14px
    ...sx
  }}>
    {children}
  </div>
);
```

**Card hover state** (via `.card-hover` CSS class):
```css
.card-hover { transition: all 0.2s ease; }
.card-hover:hover { 
  transform: translateY(-1px); 
  box-shadow: 0 8px 32px rgba(0,0,0,0.2) !important; 
}
```

### 5.3 Active / Selected Card

When a card is selected (e.g. selected match in Match Centre), the border changes to the module's accent colour:

```js
border: `1px solid ${D.sky}55`   // sky, 33% opacity
```

### 5.4 Live Match Card

Live match cards receive a gradient background and emerald border:

```js
background: `linear-gradient(135deg, ${D.emerald}08, ${D.surf1})`
border: `1px solid ${D.emerald}22`
```

---

## 6. Component Library

### 6.1 Button — `Btn`

```jsx
<Btn variant="primary" size="md" onClick={handler}>Label</Btn>
```

| Prop | Options | Default |
|------|---------|---------|
| `variant` | `primary` · `success` · `danger` · `ghost` | `primary` |
| `size` | `sm` · `md` · `lg` | `md` |
| `disabled` | boolean | `false` |

**Variants:**

| Variant | Background | Use case |
|---------|-----------|----------|
| `primary` | `gradMain` (indigo→sky) | Primary CTA, schedule, create |
| `success` | `gradLive` (emerald→cyan) | Confirm, start scoring, live action |
| `danger` | `D.rose` | Delete, clear, destructive |
| `ghost` | Transparent + border | Secondary actions, cancel |

**Sizes:**

| Size | Padding | Font size | Usage |
|------|---------|-----------|-------|
| `sm` | 5px 12px | 11px | Inline actions, table rows |
| `md` | 8px 18px | 12px | Standard card actions |
| `lg` | 12px 24px | 14px | Primary page CTAs |

All buttons use `D.pill` (999px) border radius and `D.head` (Syne) font at weight 700 with `letter-spacing: 0.04em`. The `.pressBtn` CSS class gives a `scale(0.96)` press feedback on `:active`.

### 6.2 Badge — `Badge`

```jsx
<Badge color={D.emerald}>Live</Badge>
```

Renders as an uppercase, mono, pill-shaped tag. Background is `color + "18"`, border is `color + "30"`.

```
font-family: DM Mono
font-size: 9px
font-weight: 500
letter-spacing: 0.05em
text-transform: uppercase
padding: 2px 8px
border-radius: 999px
```

### 6.3 Avatar — `Avatar`

```jsx
<Avatar name="James Whitfield" size={32} color={D.indigo} />
```

Renders initials inside a circular container with a gradient background. Initials are extracted by the `initials(name)` utility (first letter of first and last word).

```
border-radius: 50%
background: linear-gradient(135deg, color+33, color+55)
border: 1px solid color+44
font-family: DM Mono
font-size: size × 0.35
font-weight: 700
```

### 6.4 Status Dot — `StatusDot`

```jsx
<StatusDot status="live" />      // Pulsing emerald dot
<StatusDot status="upcoming" />  // Sky dot
<StatusDot status="complete" />  // Muted dot
```

| Status | Colour | Animation |
|--------|--------|-----------|
| `live` | `D.emerald` | `livePulse` (box-shadow pulse) |
| `upcoming` | `D.sky` | none |
| `complete` | `D.textMuted` | none |
| `scheduled` | `D.amber` | none |

The live dot is also available as a standalone CSS class: `<div className="live-dot"/>` which renders a 6×6px pulsing green dot.

### 6.5 Progress Bar — `ProgressBar`

```jsx
<ProgressBar pct={74} color={D.emerald} height={4} />
```

- Background track: `D.surf3`
- Fill: accent colour
- Border radius: 4px
- Fill animation: `.skill-bar` class → `width: 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)` (spring bounce)

### 6.6 Skill Bar — `SkillBar`

```jsx
<SkillBar label="Batting Avg" value={82} color={D.sky} />
```

Composite of label row (Syne label left, DM Mono value right) + ProgressBar. `value` is treated as a percentage (0–100).

### 6.7 Pill — `Pill`

```jsx
<Pill color={D.sky} onClick={handler}>T20</Pill>
```

Inline filter chip. Background `color + "15"`, border `color + "28"`. Interactive when `onClick` is provided (cursor changes to pointer).

```
font-family: DM Sans
font-size: 11px
font-weight: 500
padding: 3px 10px
border-radius: 999px
```

### 6.8 Modal — `Modal`

```jsx
<Modal title="Add Player" onClose={closeHandler} width="520px">
  {/* content */}
</Modal>
```

- Full-screen backdrop: `rgba(0,0,0,0.75)`
- Container: `D.surf1` background, `D.xl` (18px) radius, `D.borderMed` border
- Header: Syne 15px/700, close button top-right
- Content padding: 20px
- Max height: 90vh with internal scroll

### 6.9 Section Header — `SectionHeader`

```jsx
<SectionHeader 
  title="Match Centre" 
  sub="Live scores, results & fixtures" 
  color={D.emerald}
  actions={<Btn size="sm">+ Schedule</Btn>}
/>
```

Renders a title row with a coloured 3px accent bar on the left, subtitle beneath, and an actions slot on the right. Standard on every module view.

### 6.10 KPI Card — `KPICard`

```jsx
<KPICard 
  label="Win Rate" 
  value="74%" 
  sub="Season 2026" 
  icon="📈" 
  color={D.emerald} 
  trend={+8}
/>
```

- Background: `D.surf1` with left colour bar (`color + "66"`, 3px wide)
- Value: DM Mono, 28px, accent colour
- Label: Syne, 10px, uppercase, muted
- Sub: DM Sans, 11px, secondary
- Trend: `↑`/`↓` in emerald/rose, Syne 10px

### 6.11 Input — `Input`

```jsx
<Input label="Player Name" value={name} onChange={setName} placeholder="Enter name..." />
```

- Background: `D.surf2`
- Border: `1px solid D.border`
- Border radius: `D.md` (10px)
- Font: DM Sans, 13px, `D.textPrimary`
- Label: Syne, 10px, uppercase, 0.08em letter-spacing, `D.textMuted`
- Padding: 9px 12px

### 6.12 Select — `Select`

```jsx
<Select label="Team" value={team} onChange={setTeam} options={["U19A","U15A","U13A"]} />
```

Options can be strings or `{ value, label }` objects. Matches `Input` styling exactly.

### 6.13 Radar Chart — `RadarChart`

```jsx
<RadarChart 
  data={[{label:"Technique",value:85},{label:"Power",value:78},...]} 
  color={D.indigo} 
  size={160} 
/>
```

SVG-based spider/radar chart. Renders:
- Background polygon at 100% opacity (faint fill)
- Data polygon at `color + "44"` fill, `color` stroke
- Grid circles at 25%, 50%, 75%, 100%
- Axis labels at each point (DM Sans, 9px)

---

## 7. Animation & Motion

### 7.1 CSS Animation Catalogue

| Class / Keyframe | Definition | Applied To |
|------------------|-----------|------------|
| `.os-page` | `fadeUp 0.25s ease` | Every module view on navigation |
| `@keyframes fadeUp` | `opacity:0, translateY(6px)` → `opacity:1, none` | Page transitions |
| `.pressBtn` | `transition: all 0.12s ease` | All interactive buttons |
| `.pressBtn:active` | `transform: scale(0.96)` | Button press feedback |
| `.card-hover` | `transition: all 0.2s ease` | All card components |
| `.card-hover:hover` | `translateY(-1px) + box-shadow` | Card hover lift |
| `.pulse` | `opacity: 1→0.5→1, 2s ease infinite` | Notification icons, loading states |
| `@keyframes pulse` | `0%,100%: opacity:1  50%: opacity:0.5` | |
| `.spin` | `spin 1s linear infinite` | Loading spinners |
| `@keyframes spin` | `to: rotate(360deg)` | |
| `.live-dot` | `livePulse 1.2s ease infinite` | Live match green dot |
| `@keyframes livePulse` | Box-shadow 0→6px→0 in emerald | |
| `.skill-bar` | `width 0.6s cubic-bezier(0.34,1.56,0.64,1)` | Progress bar fill on mount |
| `.tab-active::after` | 2px `gradMain` underline | Active tab indicator |

### 7.2 Motion Principles

1. **Transitions are fast** — 0.12s for interactive feedback, 0.2–0.25s for state changes. Never exceed 0.4s for UI motion.
2. **Spring easing on skill bars** — `cubic-bezier(0.34, 1.56, 0.64, 1)` creates a natural overshoot effect that makes data feel "alive".
3. **Pulse animations are subtle** — opacity drops to 50%, never to zero. Motion should be noticed peripherally, not distracting.
4. **Page transitions are directional** — `fadeUp` (Y from +6px) implies content loading upward, reinforcing the sense of depth.
5. **Never animate layout shifts** — no animating `width`, `height`, or `margin` on elements that affect document flow. Only animate `transform` and `opacity`.

---

## 8. Layout & Navigation Shell

### 8.1 App Shell Structure

```
┌─ SCRBRD_OS() ────────────────────────────────────────────────────┐
│                                                                   │
│  ┌── Sidebar (220px) ──┐  ┌── Main Content Area ──────────────┐  │
│  │  Logo/School        │  │  TopBar (52px)                    │  │
│  │  Role badge         │  │  ─────────────────────────────    │  │
│  │  Nav items (role-   │  │  <main> padding:24px              │  │
│  │  gated, icon+label) │  │    {VIEW_MAP[page]}               │  │
│  │  ─────────────────  │  │                                   │  │
│  │  Role switcher      │  │                                   │  │
│  └─────────────────────┘  └───────────────────────────────────┘  │
│                                                                   │
│  ScorerModal (fixed overlay, zIndex:1000) — only when open       │
└───────────────────────────────────────────────────────────────────┘
```

### 8.2 Sidebar

**Expanded (220px):**
- School logo at top (32px height)
- Role badge below logo
- Navigation items: icon (20px) + label (DM Sans 13px/500)
- Active item: `D.indigo + "18"` background, left accent bar (3px, role colour), text `D.textPrimary`
- Inactive item: `D.textMuted` colour, hover `D.surf2` background
- Role switcher at bottom (for multi-role users)

**Collapsed (60px):**
- Icons only, 24px, centered
- Tooltip on hover showing label
- Toggle button at bottom

### 8.3 TopBar (52px)

Left to right:
1. Back button (`← Back`) — only shown when `navHistory.length > 1`
2. Page title (Syne, 15px, 700) — current module name
3. Global search icon
4. Dark/light theme toggle
5. Role display chip (role icon + label)
6. Notification bell with unread count badge

### 8.4 Navigation History

Navigation uses a history stack (`navHistory` array, max 20 entries). `setPage()` pushes to history. `goBack()` pops. This enables in-app back navigation without browser history complications.

### 8.5 VIEW_MAP Pattern

```js
const VIEW_MAP = {
  dashboard:   <DashboardView     role={role} onNav={setPage} />,
  matches:     <MatchCentreView   role={role} onOpenScorer={setScorerMatch} />,
  // ... 28 more entries
};
// Rendered as: {VIEW_MAP[page] || VIEW_MAP.dashboard}
```

Every view receives at minimum: `role` prop. Views that need navigation pass `onNav={setPage}`. Views that need the scorer pass `onOpenScorer`.

### 8.6 Role-Gated Navigation

Sidebar only renders modules from the logged-in role's `nav[]` array. No module is hidden with CSS — it simply doesn't exist in the rendered nav tree if the role doesn't have access.

---

## 9. Role-Based UI Adaptation

### 9.1 The Six Permission Tiers

| Tier | Group | Roles | Nav Modules |
|------|-------|-------|-------------|
| 1 | Platform | superadmin, platformops | 28, 14 |
| 2 | Competition | leagueadmin, tournamentdirector | 11, 9 |
| 3 | School | sportsmaster, schooladmin, medicalofficer, schoolstaff | 19, 20, 10, 8 |
| 4 | Coaching | coach, coachsupport, matchofficial, selector | 21, 18, 6, 12 |
| 5 | Participant | player, adultplayer, parent | 11, 11, 9 |
| 6 | External | scout, external | 8, 5 |

### 9.2 Dashboard Personalisation

Each role renders a completely different `Dash*` component. The 26 dashboard variants include:

- **DashSuperAdmin** — platform health, all schools, global stats
- **DashSportsmaster** — programme KPIs, school power index, squad fitness overview
- **DashCoach** — live match banner, today's training, squad status, next fixture
- **DashPlayer** — personal stats, upcoming fixtures, fitness score, news
- **DashParent** — child's stats, next fixture + transport, selection news
- **DashMatchOfficial** — today's match, scoring link, weather, pitch report
- **DashMedical** — active injuries, RTW timeline, squad health summary

### 9.3 Conditional UI Elements

```jsx
// Pattern: role-gated action buttons
{(role === "coach" || role === "sportsmaster") && (
  <Btn size="sm" onClick={openAddPlayer}>+ Add Player</Btn>
)}

// Pattern: role-gated data sections
{role !== "external" && role !== "parent" && (
  <PassportSection player={player} />
)}

// Pattern: RESTRICTED badge on sensitive modules
{["player","parent","external"].includes(role) && (
  <RestrictedBanner message="Access restricted to coaching staff and above." />
)}
```

### 9.4 Sensitivity Levels

| Level | Description | Example Modules |
|-------|-------------|-----------------|
| 4 | Full platform | superadmin only |
| 3 | Medical / identity | medicalofficer, schooladmin |
| 2 | School ops | sportsmaster, coach |
| 1 | Public/comp | leagueadmin, external |

Medical data, player passports, injury details and talent radar are sensitivity level 3+.

---

## 10. Module Screen Patterns

### 10.1 Standard Module Layout

Every module view follows this structure:

```
┌─ .os-page (fadeUp animation) ─────────────────────────────────┐
│  <SectionHeader title="" sub="" color={accent} actions={...}/> │
│                                                                 │
│  [Filter bar / tab row — optional]                              │
│                                                                 │
│  [Main content grid]                                            │
│    ├── Primary content (left, ~60-70%)                          │
│    └── Detail panel (right, ~30-40%, sticky) — optional         │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### 10.2 List + Detail Pattern

Used in: Match Centre, Profiles, Squad, Staff, Newsfeed

```
Grid: { gridTemplateColumns: selItem ? "1fr 340px" : "1fr" }
```

The detail panel appears when an item is selected, pushing the list to share width. The detail panel is `position:sticky, top:16px` to follow scroll.

### 10.3 Tab Pattern

Used in: Profiles, Settings, School Profiles, Analytics

```jsx
{["Tab 1","Tab 2","Tab 3"].map(tab => (
  <button onClick={() => setActiveTab(tab)}
    className={activeTab === tab ? "tab-active" : ""}
    style={{
      borderBottom: activeTab === tab 
        ? `2px solid ${D.indigo}` 
        : "2px solid transparent"
    }}>
    {tab}
  </button>
))}
```

Active tab has a 2px `D.gradMain` underline via `.tab-active::after` pseudo-element.

### 10.4 Filter Pills Pattern

Used in: Match Centre, Squad, Newsfeed, Staff

```jsx
{["all","live","upcoming","complete"].map(f => (
  <button onClick={() => setFilter(f)} style={{
    background: filter === f ? D.indigo + "18" : "transparent",
    border: `1px solid ${filter === f ? D.indigo + "55" : D.border}`,
    color: filter === f ? D.textPrimary : D.textMuted,
    borderRadius: D.pill,
    fontFamily: D.body,
    fontWeight: filter === f ? 600 : 400,
    textTransform: "capitalize",
  }}>{f}</button>
))}
```

### 10.5 KPI Card Row Pattern

Used at top of most dashboard views:

```jsx
<div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px" }}>
  <KPICard label="Win Rate" value="74%" color={D.emerald} trend={+8} />
  <KPICard label="Squad Size" value="23" color={D.sky} />
  <KPICard label="Active Injuries" value="2" color={D.rose} />
  <KPICard label="Power Index" value="82.3" color={D.amber} />
</div>
```

### 10.6 Empty State Pattern

```jsx
{items.length === 0 && (
  <div style={{ textAlign:"center", padding:"40px", color:D.textMuted }}>
    <div style={{ fontSize:"32px", marginBottom:"12px" }}>{icon}</div>
    <div style={{ fontFamily:D.head, fontSize:"14px", color:D.textSecondary }}>
      No {itemName} found
    </div>
    <div style={{ fontFamily:D.body, fontSize:"12px", marginTop:"6px" }}>
      {actionHint}
    </div>
  </div>
)}
```

---

## 11. Data Visualisation

### 11.1 Radar/Spider Chart

Used in: Player Profiles, Skills View

- 4 categories: Batting, Bowling, Fielding, Fitness
- 5 axes per category (20 total)
- Scale: 0–100
- Colour thresholds: 80+ emerald, 60–79 sky, below 60 amber
- Size: 160px default

### 11.2 Bar Charts (Inline)

Used in: Analytics, Fitness, Dashboard widgets

```jsx
// Pattern: label + bar + value
<div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px" }}>
  <span style={{ fontFamily:D.mono, fontSize:"11px", width:"80px", textAlign:"right" }}>
    J. Whitfield
  </span>
  <div style={{ flex:1, height:"6px", background:D.surf3, borderRadius:"3px" }}>
    <div style={{ 
      width:`${(value/maxValue)*100}%`, 
      height:"100%", 
      background:D.emerald, 
      borderRadius:"3px",
      transition:"width 0.4s ease"
    }}/>
  </div>
  <span style={{ fontFamily:D.mono, fontSize:"11px", color:D.emerald, width:"36px" }}>
    {value}
  </span>
</div>
```

### 11.3 This-Over Ball Display (Scoring)

6 circular dots per over. Colour codes:

| Value | Background | Border | Text |
|-------|-----------|--------|------|
| `W` | rose 20% | rose | rose |
| `4` | sky 20% | sky | sky |
| `6` | violet 20% | violet | violet |
| `Wd` / `Nb` | amber 20% | amber | amber |
| `0` | muted 20% | muted | muted |
| `1`,`2`,`3` | emerald 20% | emerald | emerald |

### 11.4 Sparkline / Form Strip

Player "form" is an array of last 8 innings scores. Rendered as 8 small circles:

```
● ● ● ● ● ● ● ●
0 24 3  68 1  12 0  38
```

Each circle is 8px, filled in emerald (score > 20), amber (1–19), or rose (0).

### 11.5 Win Rate Donut

SVG donut chart. Win % arc in `D.emerald`, loss % arc in `D.surf3`. Centre text: percentage in DM Mono 24px.

---

## 12. Forms & Input

### 12.1 Modal Form Pattern

All add/edit actions open a `Modal` component. Forms inside modals follow this layout:

```jsx
<Modal title="Add Player" onClose={close} width="480px">
  <Input label="Full Name" value={name} onChange={setName} placeholder="James Whitfield" />
  <Select label="Team" value={team} onChange={setTeam} options={["U19A","U15A","U13A"]} />
  <div style={{ display:"flex", gap:"8px", marginTop:"20px" }}>
    <Btn variant="ghost" onClick={close}>Cancel</Btn>
    <Btn variant="primary" onClick={submit}>Add Player</Btn>
  </div>
</Modal>
```

### 12.2 Multi-Step Wizard Pattern

Used in: Schedule Match Modal (5 steps), Onboarding (4 steps)

```
Step indicator: [1] ── [2] ── [3] ── [4] ── [5]
                ●    ──  ●    ──  ○    ──  ○    ──  ○
                (completed = filled, current = ring, future = outline)

Navigation: [← Back]                    [Next →]
```

Each step renders independently. State is accumulated in a single object (`matchConfig`) passed through steps.

### 12.3 Input States

| State | Border | Background |
|-------|--------|-----------|
| Default | `D.border` | `D.surf2` |
| Focus | `D.indigo + "66"` | `D.surf2` |
| Error | `D.rose + "66"` | `D.rose + "08"` |
| Disabled | `D.border` | `D.surf3`, opacity 0.5 |

Focus state achieved via native `:focus` CSS (outline:none, border-color change).

### 12.4 Inline Editing Pattern

For quick edits (e.g. score entry, result confirmation) without a full modal:

```jsx
{editing ? (
  <input autoFocus value={val} onChange={e => setVal(e.target.value)}
    onBlur={save} onKeyDown={e => e.key === "Enter" && save()}
    style={{ /* matches surrounding text styles */ }}
  />
) : (
  <span onClick={() => setEditing(true)}>{val}</span>
)}
```

---

## 13. Live & Real-Time UI

### 13.1 LIVE_SCORE_BUS Architecture

```
SCRBRD v3 Scorer ──publish()──► LIVE_SCORE_BUS ──subscribe()──► useLiveScore() hook
                                       │
                                       ├── localStorage['scrbrd_live'] (cross-tab)
                                       └── window.CRICKET_OS_BUS (same-page)
```

### 13.2 Live Data Hook

```js
function useLiveScore() {
  const [ls, setLs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('scrbrd_live')) || LIVE_SCORE_BUS.getLatest(); }
    catch { return LIVE_SCORE_BUS.getLatest(); }
  });
  // Subscribes to bus + polls localStorage every 2s for cross-tab updates
  return ls;
}
```

Components that display live data call `useLiveScore()` and merge the result onto static match data.

### 13.3 Live UI Indicators

**Live dot:** `<div className="live-dot"/>` — 6px pulsing emerald circle, always visible on live match cards.

**LIVE badge:**
```jsx
<Badge color={D.rose}>LIVE</Badge>
```
Use rose (not emerald) for the badge itself — red is the universal "on-air" signal. The live score text uses emerald.

**Live score banner** (MatchCentreView):

```
╔══════════════════════════════════════════════════════════╗
║  ●LIVE  Hilton U19A   142/3  (14.2 ov)                  ║
║         CRR: 9.98  │  Need 58 off 34 balls  │ RRR: 10.2 ║
║         J. Whitfield ★ 68(42)   Bowler: 3-0-28-1        ║
║         This over: [1][0][W][4][1][·]                    ║
╚══════════════════════════════════════════════════════════╝
```

Background: `linear-gradient(135deg, D.emerald+"12", D.sky+"08")`. Border: `D.emerald+"33"`.

### 13.4 Snapshot Data Shape

```js
// Published by SCRBRD v3 on every ball
{
  matchId: "m3",               // or "battingTeam_v_bowlingTeam"
  inningsNum: 1,               // 1 or 2
  score: "142/3",              // "runs/wickets"
  overs: "14.2",               // "overs.balls"
  battingTeam: "Hilton U19A",
  bowlingTeam: "Kearsney U19A",
  target: null,                // set in 2nd innings
  striker: { name, runs, balls },
  nonStriker: { name, runs, balls },
  bowler: { name, overs, runs, wickets },
  thisOver: ["1","0","W","4","1"],  // ball display strings
  fow: [{ wicket, score, overs, batter }],
  inn1: { score, overs },      // always set
  inn2: { score, overs },      // set from 2nd innings
  ts: 1711234567890,           // Unix timestamp for freshness
}
```

---

## 14. Accessibility & Responsiveness

### 14.1 Minimum Touch Target

All interactive elements have a minimum effective touch area of 36×36px, even if visually smaller. Achieved via padding adjustments.

### 14.2 Colour Contrast

| Combination | Contrast Ratio | WCAG |
|------------|---------------|------|
| `#f0f4ff` on `#0f1621` | 14.2:1 | AAA |
| `#10b981` on `#0f1621` | 5.1:1 | AA |
| `#6366f1` on `#0f1621` | 4.7:1 | AA |
| `#f43f5e` on `#0f1621` | 5.8:1 | AA |
| `#4a5570` on `#0f1621` | 2.1:1 | ✗ (use for non-critical labels only) |

`D.textMuted` (#4a5570) intentionally falls below AA — it is reserved for decorative or non-essential labels (timestamps, metadata) where low contrast is acceptable.

### 14.3 Keyboard Navigation

- All interactive elements (`button`, `input`, `select`) retain native focus management
- Modal traps focus within it when open
- `Tab` order follows DOM order (maintained by logical JSX structure)
- `Escape` closes modals (`onClose` bound to `Escape` key event)

### 14.4 Responsive Behaviour

| Breakpoint | Sidebar | Grid | Cards |
|-----------|---------|------|-------|
| > 1200px | Expanded (220px) | Full grid | Full layout |
| 900–1200px | Collapsed (60px) | Adjusted | Full layout |
| < 900px | Hidden / overlay | Single column | Stacked |

The app's primary target environment is desktop (coaches using laptops at ground) and tablet (iPads in dugouts). Mobile is secondary — parent-facing modules (Parent Hub, Newsfeed, Inbox) are the mobile priority.

---

## 15. Writing Style & Microcopy

### 15.1 Voice & Tone

SCRBRD is a **precision tool, not a consumer app**. The voice is:
- **Direct** — no filler words
- **Data-respecting** — numbers are never rounded unnecessarily
- **Confident** — active voice, imperative labels
- **Cricket-literate** — uses correct cricket terminology (innings, over, maiden, FOW)

### 15.2 Label Conventions

| Pattern | Example | Not |
|---------|---------|-----|
| Action buttons: imperative verb | `Add Player` · `Start Scoring` · `Log Injury` | `Click to add player` |
| Section overlines: uppercase, short | `SQUAD FITNESS` · `MATCH DETAILS` | `Squad fitness overview` |
| Status labels: short, clear | `LIVE` · `UPCOMING` · `COMPLETE` | `Currently in progress` |
| Data labels: abbreviated where standard | `SR` (strike rate) · `HS` (high score) · `RTW` (return to play) | `Strike Rate` in a tight table |

### 15.3 Data Formatting

| Data type | Format | Example |
|-----------|--------|---------|
| Overs | `{overs}.{balls}` | `14.2` |
| Score | `runs/wickets` | `142/3` |
| Average | 1 decimal place | `48.2` |
| Economy | 2 decimal places | `7.25` |
| Strike rate | 1 decimal place | `135.4` |
| Fitness % | Integer | `74%` |
| Power Index | 1 decimal place | `82.3` |
| Date | `Day Mon` or ISO | `Fri 22 Mar` |

### 15.4 Error Messages

- **Specific:** `Player name is required` not `Invalid input`
- **Actionable:** `Select a ground before scheduling` not `Error: ground required`
- **Non-alarming:** Use `D.amber` for warnings, `D.rose` only for blocking errors

### 15.5 Empty States

Always explain what should be here and what to do:

```
📅
No matches scheduled
Schedule your first fixture using the + Schedule button above.
```

---

## 16. Do / Don't Rules

### 16.1 Colour

| ✅ Do | ❌ Don't |
|-------|---------|
| Use accent colours semantically | Use `D.rose` for non-error states |
| Tint backgrounds at 12–18% opacity | Use solid accent backgrounds for large areas |
| Use `D.textMuted` for timestamps/metadata | Use `D.textMuted` for readable body text |
| Use `D.emerald` for live/positive states | Use green for decorative purposes |

### 16.2 Typography

| ✅ Do | ❌ Don't |
|-------|---------|
| Use DM Mono for all numeric data | Mix DM Mono with body text mid-sentence |
| Keep overlines UPPERCASE in Syne | Mix fonts in a single heading |
| Use Syne 700+ for UI labels | Use DM Sans for headings |
| Size data values larger than labels | Use large sizes for descriptions |

### 16.3 Components

| ✅ Do | ❌ Don't |
|-------|---------|
| Use `Btn variant="ghost"` for cancel/back | Create custom button styles |
| Use `Modal` for all overlay forms | Use inline editing for complex forms |
| Use `Badge` for all status tags | Use raw text for status indicators |
| Use `D.pill` radius for action buttons | Use sharp corners on interactive elements |

### 16.4 Layout

| ✅ Do | ❌ Don't |
|-------|---------|
| Start every module with `SectionHeader` | Skip the section header for "simple" views |
| Stick the detail panel at `top: 16px` | Let the detail panel scroll with the page |
| Use 12px gap in all grids | Mix gap sizes within a single grid |
| Keep page padding at 24px | Nest pages inside extra padding containers |

### 16.5 RBAC / Role Gating

| ✅ Do | ❌ Don't |
|-------|---------|
| Conditionally render elements by role | Hide elements with CSS (`display:none`) |
| Show restricted badges for sensitive data | Simply remove data without explanation |
| Pass `role` prop to every view | Read role from global state inside views |
| Gate nav items via `ROLES[role].nav[]` | Hardcode role checks in the sidebar |

### 16.6 Live Data

| ✅ Do | ❌ Don't |
|-------|---------|
| Use `useLiveScore()` hook for live data | Poll the bus manually in components |
| Merge live data onto static match objects | Replace static data entirely |
| Show the live pulse dot on live cards | Use static text "LIVE" alone |
| Display RRR and CRR in 2nd innings | Show target without required run rate |

---

*End of SCRBRD CricketOS UI/UX Design System & Guidelines*

*Generated from live production codebase — cricket_os.jsx — Season 2026*  
*Contact: kameel@maverick.co.za · scrbrd.co.za*
