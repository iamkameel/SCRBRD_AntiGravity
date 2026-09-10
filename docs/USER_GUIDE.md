# SCRBRD User Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Match Management](#match-management)
4. [Live Scoring](#live-scoring)
5. [Team Management](#team-management)
6. [Player Management](#player-management)
7. [Fields & Venues](#fields--venues)
8. [Administration](#administration)
9. [Data Analytics](#data-analytics)
10. [SCRBRD Ecosystem](#scrbrd-ecosystem)
11. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Login

1. Navigate to the login page at `/login`
2. Enter your email and password
3. Click "Sign In"

### Role-Based Access

SCRBRD supports multiple user roles with different permission levels:

| Role | Access Level |
|------|--------------|
| System Architect | Full access to all features |
| School Administrator | School-wide management |
| Head Coach | Team and match management |
| Assistant Coach | Limited team management |
| Team Manager | Administrative duties |
| Scorer | Match scoring and statistics |
| Umpire | Match officiating |
| Player | Personal stats and schedule |
| Parent/Guardian | View-only for linked players |
| Spectator | Public match information |

---

## Dashboard Overview

The dashboard provides role-specific widgets and quick actions:

### Key Widgets

- **Fixture Centre**: Live matches, recent results, upcoming fixtures
- **Quick Stats**: Total matches, teams, players, venues
- **Upcoming Events**: Calendar of scheduled activities
- **Team Performance**: Win/loss charts and form guides

### Navigation

Use the sidebar to access:

- **Home**: Dashboard overview
- **Matches**: All fixtures and results
- **Teams**: Team management
- **People**: Players, coaches, staff
- **Fields**: Venues and facilities
- **Calendar**: Schedule overview
- **Analytics**: Statistics and reports

---

## Match Management

### Creating a Match

1. Navigate to **Matches** → **Create Match**
2. Select **Home Team** and **Away Team**
3. Choose match date, time, and venue
4. Set overs limit (e.g., 20, 50)
5. Click **Create Match**

### Match Statuses

| Status | Description |
|--------|-------------|
| Scheduled | Match created but not started |
| Live | Match in progress |
| Completed | Match finished |
| Cancelled | Match cancelled |
| Postponed | Match rescheduled |

### Pre-Match Setup

1. Navigate to the match detail page
2. Click **Pre-Match Setup**
3. Select Playing XI for both teams
4. Set batting order
5. Record toss result
6. Click **Start Match**

---

## Live Scoring

### Accessing the Scoring Interface

1. Navigate to **Matches** → Select a live match
2. Click **Manage Match** or go to `/matches/[id]/manage`

### Recording Balls

1. Click **Record Ball**
2. Select runs scored (0, 1, 2, 3, 4, 6)
3. Optionally add extras (Wide, No Ball, Bye, Leg Bye)
4. For wickets, check **Wicket** and select the dismissal type
5. Click **Submit**

### Extras

| Extra Type | Description |
|------------|-------------|
| Wide | Ball too wide, 1 extra run |
| No Ball | Illegal delivery, 1 extra run |
| Bye | Ball passes without bat contact |
| Leg Bye | Ball hits pad, runs scored |

### Wicket Types

- **Bowled**: Stumps hit by delivery
- **Caught**: Ball caught by fielder
- **LBW**: Leg Before Wicket
- **Stumped**: Keeper removes bails
- **Run Out**: Bails broken while running
- **Hit Wicket**: Batsman hits own stumps

### Wagon Wheel

Click on the field diagram to record shot placement. The system tracks:

- Shot direction (angle)
- Shot distance (boundary, close, etc.)
- Run type (singles, fours, sixes)

### Player Selection

When a wicket falls or an over ends, the system automatically prompts for:

- **New Batsman**: After a wicket
- **New Bowler**: After each over (same bowler cannot bowl consecutive overs)

### Undo Function

Click **Undo** to reverse the last recorded ball. This is useful for correcting mistakes.

### Ending Innings

Click **End Innings** when:

- All batsmen are out (10 wickets)
- Overs are completed
- Team declares

### Match Completion

After the second innings, the system automatically determines the winner based on:

- Runs scored vs target
- Wickets remaining
- Overs remaining (if applicable)

---

## Team Management

### Creating a Team

1. Navigate to **Teams** → **Add Team**
2. Enter team name and abbreviation
3. Link to a school (optional)
4. Upload team logo
5. Click **Create Team**

### Managing Roster

1. Open team details
2. Go to **Players** tab
3. Click **Add Player** to assign existing players
4. Use **Batch Import** for multiple players

### View Modes

Toggle between:

- **Grid View**: Card-based layout
- **List View**: Detailed rows
- **Table View**: Spreadsheet-style

---

## Player Management

### Adding Players

1. Navigate to **People** → **Add Player**
2. Fill in personal details (name, DOB, contact)
3. Assign role (Batsman, Bowler, All-Rounder, Wicket-Keeper)
4. Add batting/bowling style
5. Link to team(s)
6. Click **Save**

### Player Profile

View comprehensive stats including:

- Career statistics
- Recent form
- Skills radar chart
- **Tactical Comparison**: Benchmark performance against league averages
- **Scouting Intelligence**: Potential ratings, growth metrics, and elite projections
- Match history

---

## Fields & Venues

### Field Details

Each venue page includes 5 tabs:

1. **Overview**: Pitch conditions, dimensions, about
2. **Facilities**: Amenities list
3. **Booking**: Calendar with availability
4. **Capacity**: Occupancy tracking and trends
5. **Maintenance**: Groundskeeping logs

### Booking a Venue

1. Navigate to field detail page
2. Click **Booking** tab
3. Select date on calendar
4. Click **New Booking**
5. Fill in:
   - Event title
   - Start/End time
   - Event type (Match, Practice, Maintenance)
   - Organizer
6. Enable **Recurring** for repeated bookings
7. Click **Create Booking**

### Conflict Detection

The system prevents double-booking by checking existing reservations.

---

## Administration

### User Management

1. Navigate to **Administration** → **User Management**
2. View all users in a sortable table
3. Actions:
   - **Invite User**: Send email invitation
   - **Edit Role**: Change permissions
   - **Activate/Deactivate**: Toggle access

### Audit Log

Track all system activities:

- User logins
- Data changes
- Administrative actions

### Data Management

- **Export**: Download data as CSV
- **Backup**: Create Firestore backups
- **Migration**: Import legacy data

---

## Data Analytics

### Match Visualizations

- **Worm Graph**: Run progression over overs
- **Manhattan Chart**: Runs per over bar chart
- **Wagon Wheel**: Shot placement diagram
- **Pitch Map**: Bowling line & length heatmap

### Team Analytics

- **Form Guide**: W/L streak sparklines
- **Win/Loss Gauge**: Season performance
- **Head-to-Head**: Comparison stats

### Player Analytics

- **Skills Radar**: Multi-dimensional ability chart
- **Career Stats**: Cumulative performance
- **Trend Analysis**: Form over time

---

## SCRBRD Ecosystem

The SCRBRD Ecosystem is the architectural hub of the platform, visualizing the interconnection between performance, intelligence, and infrastructure.

### Core Pillars

1. **Athlete Intelligence**: Data-driven insights from the Player Passport.
2. **Coach Development**: Tactical analysis and squad management tools.
3. **School Infrastructure**: Digital assets for schools and groundskeepers.
4. **Scouting & Recruitment**: Elite talent identification pipelines.

### Advanced Visuals

- **AI Brain Engine**: Real-time processing of multivariate match data.
- **Ranking Pyramid**: Visualization of the global competitive hierarchy.
- **Algorithm Transparency**: Insights into how player and school rankings are calculated.

---

## Troubleshooting

### Common Issues

#### "Match has not started" Error

- Ensure the match status is "Live"
- Complete pre-match setup first

#### Scoring Disabled

- Select both batsmen (striker, non-striker)
- Select the current bowler

#### Data Not Syncing

- Check internet connection
- Refresh the page
- The system uses real-time Firestore listeners

### Support

For technical support:

- Email: support@scrbrd.com
- Documentation: Visit `/docs`
- Report bugs via the in-app feedback form

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `R` | Record Ball (opens dialog) |
| `U` | Undo last ball |
| `P` | Open player selection |
| `1-6` | Quick run entry (in dialog) |
| `W` | Toggle wicket checkbox |

---

*Last updated: December 2024*
