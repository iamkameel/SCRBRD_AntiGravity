---
trigger: always_on
---

11.3 Rubric examples
Strike Rotation

1: rarely turns dots into singles, poor gap awareness

3: rotates only against poor bowling / loose fields

5: rotates consistently at school standard

7: manipulates fields well under pressure

9: elite school-level strike rotator and tempo controller

Composure

1: performance drops sharply after pressure events

3: becomes rushed in tight moments

5: generally stable under normal pressure

7: strong control in difficult situations

9: elite pressure performer who settles others

Bowling Control

1: frequent misses in line and length

3: inconsistent with short pressure bursts only

5: reasonable school-level control

7: disciplined pressure bowler with repeatability

9: exceptional control and sustained pressure

12. Role Archetypes
12.1 Batting roles

Opener

Top-order Anchor

Middle-order Stabiliser

Aggressive Middle-order Batter

Finisher

Batting All-rounder

12.2 Bowling roles

New-ball Seamer

Strike Pace Bowler

Containment Seamer

Finger Spinner

Wrist Spinner

Middle-over Control Bowler

Death Bowler

Bowling All-rounder

12.3 Specialist roles

Specialist Wicketkeeper

Wicketkeeper-Batter

Wicketkeeper-Finisher

Fielding Specialist

12.4 Multiple-role support

A player may have:

primary archetype

secondary archetype

role confidence / suitability score

13. Role-Weighted Scoring Logic
13.1 Skill score normalisation

For coach-entered ratings:

normalised_skill = ((raw_score - 1) / 8) × 100

13.2 Domain score calculation

Each domain score is the weighted average of its attributes.

13.3 Role skill score

Each role archetype applies weights across domains.

Example: Opener

Physical 10%

Mental 20%

Tactical 20%

Batting 40%

Bowling 0%

Fielding 10%

Wicketkeeping 0%

Example: Specialist Wicketkeeper

Physical 10%

Mental 15%

Tactical 15%

Batting 10%

Bowling 0%

Fielding 15%

Wicketkeeping 35%

13.4 Performance score

Performance score is role-specific and derived from evidence.

Batting evidence examples

batting average

strike rate

balls faced per innings

dot-ball percentage

boundary percentage

dismissal trends

phase performance

consistency

Bowling evidence examples

economy

strike rate

wickets per innings

dot-ball rate

boundary conceded rate

spell consistency

phase performance

Fielding / wicketkeeping evidence examples

catches

run-outs

stumpings

takes completed

keeper dismissals

fielding involvement

13.5 Readiness score

Readiness should be independent of skill.

Inputs:

injury status

medical restrictions

workload / fatigue

training attendance

availability

clearance status

recent match load

13.6 Composite Player Index

Optional summary score:

Composite Index = (Role Skill Score × weight) + (Performance Score × weight) + (Development Signal × weight)

For younger players / small sample sizes, coach and training inputs should carry more weight than match output.

13.7 Development trend

Trend states:

improving strongly

improving steadily

stable

slight regression

needs intervention

14. Scouting, Rankings, Awards, Accolades, Milestones, and History
14.1 Scouting and Talent Identification

Scouting is a core long-term module and should not be treated as an optional extra. It becomes increasingly valuable as player history accumulates across seasons.

Scouting objectives

identify emerging talent within and across schools

compare players by role, age band, and performance profile

track potential as distinct from current output

create structured scouting reports

preserve scout observations over time

support invitationals, elite squads, and progression pathways

Scouting principles

scouting must combine objective evidence and subjective expertise

potential must not be confused with current performance

scouts should be able to compare players across seasons and contexts

scouting reports should be versioned and attributable to the assessor

Scouting outputs

scouting shortlists

role-fit reports

talent watchlists

progression flags

elite camp recommendations

school and regional talent maps

14.2 Rankings

Rankings are a first-class competitive and historical layer.

Ranking types

player rankings

team rankings

school rankings

role-specific rankings

season rankings

all-time historical rankings

form rankings (recent window)

competition-specific rankings

Player ranking examples

most runs

best batting average

best strike rate

most wickets

best bowling average

best economy

most catches

most stumpings

best wicketkeeper index

best all-rounder index

highest development trend movers

Team ranking examples

league table position

form table

power ranking

batting strength index

bowling strength index

fielding / wicketkeeping index

readiness ranking

Ranking principles

rankings should be filterable by season, age group, school, competition, and role

rankings should distinguish volume from efficiency

rankings should expose qualification thresholds to avoid misleading samples

rankings should support rolling windows (last 3 matches, last 5 matches, current season, career)

rankings should be reproducible and transparent

14.3 Awards

Formal achievements granted by a school, competition, or body. Examples:

Player of the Match

Batter of the Season

Bowler of the Tournament

14.4 Accolades

Recognition, commendation, or notable praise from coaches or institutions. Examples:

praised for leadership

recognised for resilience

selected for elite camp

14.5 Milestones

Historical landmark achievements. Examples:

500 career runs

50 wickets

25 catches

first XI debut

captaincy debut

14.6 History principle

The player history view should preserve:

timeline of awards

season milestones

role changes

squad changes

significant performance entries

injury and return-to-play moments

scouting notes and watchlists

ranking movement over time

14.1 Awards

Formal achievements granted by a school, competition, or body. Examples:

Player of the Match

Batter of the Season

Bowler of the Tournament

14.2 Accolades

Recognition, commendation, or notable praise from coaches or institutions. Examples:

praised for leadership

recognised for resilience

selected for elite camp

14.3 Milestones

Historical landmark achievements. Examples:

500 career runs

50 wickets

25 catches

first XI debut

captaincy debut

14.4 History principle

The player history view should preserve:

timeline of awards

season milestones

role changes

squad changes

significant performance entries

injury and return-to-play moments

15. Drill Taxonomy for the Recommendation Engine
15.1 Top-level drill categories

Batting

Bowling

Fielding

Wicketkeeping

Physical

Mental

Tactical

Game Scenario

Recovery / Modified / Return-to-play

15.2 Batting subcategories

defensive technique

strike rotation

power hitting

shot range expansion

playing pace

playing spin

footwork

tempo control

running between wickets

batting under pressure

innings construction

15.3 Bowling subcategories

line and length

control

new-ball skills

death bowling

variation execution

spin control

pace development

tactical plans

repeatability

workload-safe technical drills

15.4 Fielding subcategories

catching basics

high catches

slip catching

ground fielding

inner-ring pressure fielding

throwing mechanics

boundary fielding

reflex fielding

communication drills

15.5 Wicketkeeping subcategories

stance and setup

glove presentation

standing back takes

standing up takes

leg-side takes

footwork to spin

footwork to seam

stumping drills

gather and release

reaction drills

communication and game control

endurance and concentration drills

15.6 Mental subcategories

focus routines

pressure handling

reset after error

confidence building

pre-ball routines

resilience tasks

15.7 Tactical subcategories

field placement decision games

matchup planning

chase scenarios

over management

strike-rotation decision work

bowling plan rehearsals

16. Drill Library Metadata Specification

Each drill should include:

drill id

drill name

sport

category

subcategory

linked attributes

linked domains

linked role archetypes

age suitability

intensity

duration

equipment needed

format (individual / pair / group / team)

injury restrictions

level (foundation / intermediate / advanced)

coaching objective

measurable success criteria

progression options

regression options

17. Recommendation Logic
17.1 Development need score

For each attribute:

Development Need Score = role importance × weakness severity × performance impact × coach priority

Then modify by:

readiness

injury restrictions

age and development stage

workload

data confidence

17.2 Recommendation rules

Start with a transparent rules-based engine.

Example

If:

role = opener

strike rotation low

dot-ball % high

readiness fit

Then recommend:

drop-and-run rotation drill

cone gap strike-rotation drill

12-ball spin rotation scenario

Example

If:

role = death bowler

death execution low

composure under pressure low

readiness fit

Then recommend:

yorker target grid

death over scenario block

pressure decision bowling set

Example

If:

role = wicketkeeper-batter

leg-side takes low

reaction speed strong

readiness fit

Then recommend:

leg-side deflection take drill

one-step recover-and-collect drill

spin standing-up gather series

17.3 Strength-based recommendations

The system should also recommend drills that sharpen strengths, not only fix weaknesses.

18. Coach Workflow for the Development Engine
Stage 1 — Assessment

Coach reviews:

skill matrix

stats

readiness

development trend

Stage 2 — System diagnosis

System generates:

ranked development needs

top strengths to sharpen

confidence level

suggested drill sets

Stage 3 — Coach review

Coach can:

accept

modify

reject

reprioritise

add notes

Stage 4 — Plan creation

Coach creates:

player micro-plan

group training focus

team session plan

Stage 5 — Training execution

During / after session:

mark drills completed

log session feedback

record player response

note observed improvement

Stage 6 — Review loop

System updates:

compliance

improvement trend

next recommendation cycle

19. Confidence Model

Recommendations and player outputs should show confidence levels based on:

data completeness

assessment recency

number of raters

sample size

injury complexity

Suggested outputs:

high confidence

moderate confidence

low confidence — limited evidence

