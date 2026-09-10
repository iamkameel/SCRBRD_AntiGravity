# SCRBRD Cricket OS — Live Firestore Security Rules Specification

This document provides a detailed breakdown of the live Firebase Firestore security rules configured in `firestore.rules`.

---

## 1. System Role & Access Control Hierarchy

Security rules evaluate user identity and assigned role claims populated in `/people/$(request.auth.uid)`:

| Role Identifier | Operational Scope & Permissions |
| :--- | :--- |
| **System Architect** | Full platform governance, security override, audit log inspection. |
| **Admin** | Full system permissions, financial transactions, user deletion, ranking configuration. |
| **Sportsmaster** | School-level operational management across seasons, competitions, fixtures, venues, and leagues. |
| **Head Coach** | Squad selection, team lineups, player development, skill matrices, training plans. |
| **Assistant Coach** | Roster updates, session logging, drill assignments, skill assessment entries. |
| **Scorer / Umpire** | Live match scoring engine (`canScore()`), ball-by-ball events, scorecards, session locking. |
| **Medical Staff** | Exclusive access to sensitive medical records, injury logs, and medical notes. |
| **Groundskeeper** | Pitch readiness logs, field maintenance tasks, ground status, facility bookings. |
| **Transport Coordinator** | Vehicle fleets, transport trip schedules, passenger manifests. |
| **Player / Guardian / Public** | Authenticated read access to public operational schedules, teams, and live fixtures. |

---

## 2. Collection Security Matrix

### 2.1 Identity & Core Entities

| Path / Collection | Read Condition | Create / Update Condition | Delete Condition |
| :--- | :--- | :--- | :--- |
| `/people/{personId}` | `isSignedIn()` | `isOwner(personId)` \|\| `isCoach()` \|\| `canManageData()` | `isAdmin()` |
| `/schools/{schoolId}` | `isSignedIn()` | `canManageData()` | `canManageData()` |
| `/seasons/{seasonId}` | `isSignedIn()` | `canManageData()` | `canManageData()` |
| `/divisions/{divisionId}` | `isSignedIn()` | `canManageData()` | `canManageData()` |
| `/venues/{venueId}` | `isSignedIn()` | `canManageData()` | `canManageData()` |
| `/leagues/{leagueId}` | `isSignedIn()` | `canManageData()` | `canManageData()` |
| `/competitions/{competitionId}` | `isSignedIn()` | `canManageData()` | `canManageData()` |

---

### 2.2 Teams, Squads & Fixture Subcollections

| Path / Collection | Read Condition | Create / Update Condition | Delete Condition |
| :--- | :--- | :--- | :--- |
| `/teams/{teamId}` | `isSignedIn()` | `canManageData()` | `canManageData()` |
| `/teams/{teamId}/roster/{rosterId}` | `isSignedIn()` | `isCoach()` | `isCoach()` |
| `/teams/{teamId}/squads/{squadId}` | `isSignedIn()` | `isCoach()` | `isCoach()` |
| `/fixtures/{fixtureId}` | `isSignedIn()` | Update: `isSignedIn()`. Create: `canManageData()` | `canManageData()` |
| `/fixtures/{fixtureId}/lineups/{teamId}` | `isSignedIn()` | `isCoach()` \|\| `canManageData()` | `canManageData()` |
| `/fixtures/{fixtureId}/scorecards/{inningsId}` | `isSignedIn()` | `canScore()` | `canScore()` |
| `/fixtures/{fixtureId}/readinessChecks/{checkId}` | `isSignedIn()` | `isCoach()` \|\| `canManageData()` | `canManageData()` |
| `/fixtures/{fixtureId}/availabilityResponses/{resId}` | `isCoach()` \|\| `canManage()` | `isSignedIn()` | `canManageData()` |
| `/fixtures/{fixtureId}/transportAssignments/{id}` | `isSignedIn()` | `isTransport()` \|\| `canManageData()` | `isTransport()` |

---

### 2.3 Live Cricket Scoring Engine

| Path / Collection | Read Condition | Create / Update / Delete Condition |
| :--- | :--- | :--- |
| `/ballEvents/{eventId}` | `isSignedIn()` | `canScore()` (`Scorer`, `Umpire`, `Admin`) |
| `/innings/{inningsId}` | `isSignedIn()` | `canScore()` (`Scorer`, `Umpire`, `Admin`) |
| `/scoringLocks/{fixtureId}` | `isSignedIn()` | `canScore()` (Session handover & single-scorer concurrency locking) |

---

### 2.4 Player Development & Training Engine

| Path / Collection | Read Condition | Create / Update / Delete Condition |
| :--- | :--- | :--- |
| `/skillMatrices/{matrixId}` | `isSignedIn()` | `isCoach()` |
| `/skillMatrices/{matrixId}/assessments/{id}` | `isSignedIn()` | `isCoach()` |
| `/performanceIndices/{indexId}` | `isSignedIn()` | `isCoach()` |
| `/developmentTrends/{trendId}` | `isSignedIn()` | `isCoach()` |
| `/developmentNeeds/{needId}` | `isSignedIn()` | `isCoach()` |
| `/drillRecommendations/{recId}` | `isSignedIn()` | `isCoach()` |
| `/drills/{drillId}` | `isSignedIn()` | `isCoach()` |
| `/trainingSessions/{sessionId}` | `isSignedIn()` | `isCoach()` |
| `/trainingPlans/{planId}` | `isSignedIn()` | `isCoach()` |

---

### 2.5 Sensitive Domains (Medical & Financial)

| Path / Collection | Read Condition | Write Condition (`create`/`update`/`delete`) |
| :--- | :--- | :--- |
| `/injuryRecords/{recordId}` | `isMedical()` \|\| `isCoach()` | `isMedical()` |
| `/medicalNotes/{noteId}` | `isMedical()` | `isMedical()` *(Strictly Private)* |
| `/readinessScores/{scoreId}` | `isCoach()` \|\| `isMedical()` \|\| `canManageData()` | `isCoach()` \|\| `isMedical()` |
| `/financials/{transactionId}` | `isAdmin()` | `isAdmin()` |

---

### 2.6 Facilities, Grounds & Transport

| Path / Collection | Read Condition | Create / Update / Delete Condition |
| :--- | :--- | :--- |
| `/fields/{fieldId}` | `isSignedIn()` | `isGroundskeeper()` / Delete: `canManageData()` |
| `/fields/{fieldId}/bookings/{bookingId}` | `isSignedIn()` | `isGroundskeeper()` \|\| `canManageData()` |
| `/fields/{fieldId}/statusLogs/{logId}` | `isSignedIn()` | `isGroundskeeper()` |
| `/fields/{fieldId}/maintenanceTasks/{taskId}` | `isSignedIn()` | `isGroundskeeper()` |
| `/vehicles/{vehicleId}` | `isSignedIn()` | `isTransport()` |
| `/transportTrips/{tripId}` | `isSignedIn()` | `isTransport()` |

---

### 2.7 Scouting, Awards & Audit Stream

| Path / Collection | Read Condition | Create / Update Condition | Delete Condition |
| :--- | :--- | :--- | :--- |
| `/scoutingReports/{reportId}` | `isCoach()` \|\| `canManageData()` | `isCoach()` | `isAdmin()` |
| `/scoutingWatchlists/{watchlistId}` | `isCoach()` \|\| `canManageData()` | `isCoach()` | `isCoach()` |
| `/awards/{awardId}` | `isSignedIn()` | `isCoach()` \|\| `canManageData()` | `isCoach()` \|\| `canManageData()` |
| `/accolades/{accoladeId}` | `isSignedIn()` | `isCoach()` | `isCoach()` |
| `/milestones/{milestoneId}` | `isSignedIn()` | `isCoach()` \|\| `canManageData()` | `isCoach()` \|\| `canManageData()` |
| `/playerRankings/{rankingId}` | `isSignedIn()` | `isAdmin()` | `isAdmin()` |
| `/notifications/{notificationId}` | `isOwner(recipientId)` \|\| `isAdmin()` | `isOwner(recipientId)` | `isOwner(recipientId)` \|\| `isAdmin()` |
| `/auditLogs/{logId}` | `isAdmin()` | `create`: `isSignedIn()` | **`update, delete: if false;` (Immutable)** |

---

## 3. Governance Highlights

1. **Multi-Scorer Session Locking (`/scoringLocks`)**: Prevents concurrent ball entries by restricting active scoring tokens to single authenticated session holders while supporting structured handover routines.
2. **Immutable Audit Trail (`/auditLogs`)**: System audit logs are append-only. No user or administrator can update or purge recorded logs.
3. **Medical Isolation (`/medicalNotes`)**: Medical notes enforce complete isolation, restricting reads and writes exclusively to certified Medical Staff and System Admins.
