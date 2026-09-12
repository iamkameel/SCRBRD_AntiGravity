# SCRBRD Migration & Build Tasks

## Phase 1: Teams as First-Class Entities (Current Focus)

- [x] **Audit**: Locate source of current team data (static vs Firestore) and analyze structure <!-- id: 1 -->
- [x] **Schema**:- [x] Consolidate Match and Person types in `src/types/firestore.ts`
- [x] Build comprehensive Firebase services for core entities
  - [x] Create `baseService.ts` for generic Firestore operations
  - [x] Create `matchService.ts`
  - [x] Create `personService.ts` (consolidated players, coaches, etc.)
  - [x] Create `teamService.ts` (refactored)
  - [x] Create `scoringService.ts`
- [x] Integrate and complete the XState FSM for the scoring engine
  - [x] Refine `scoringHubMachine.ts` with strict types and transitions
- [x] Update `useScoringHub.ts` for service layer integration
- [x] Implement premium `ReviewConfirmStep.tsx` UI
- [x] Wire FSM to `ScoringHubClient.tsx` and server actions and the UI
- [x] **UI Refactor**: Update `/teams` page to fetch strictly from Firestore `teams` collection <!-- id: 4 -->
- [x] **Dependencies**: Update `fixtures` and `results` to resolve team names via Firestore, removing `detailedTeamsData` dependency <!-- id: 5 -->

## Phase 2: Normalize Geography

- [x] **Schema**: Create/Verify `divisions`, `seasons`, `leagues` collections <!-- id: 6 -->
- [x] **Migration**: Seed initial divisions (e.g., "KZN High School 1st XI") and seasons ("2025") <!-- id: 7 -->
- [x] **Linkage**: Update `schools` and `teams` to use real Firestore IDs for `divisionId` instead of strings <!-- id: 8 -->
- [x] **Fixtures**: Wire `leagueId` and `divisionId` in fixtures to real collections <!-- id: 9 -->

### Phase 3: Matches & Results

- [x] **Schema**: Create `matches` collection. <!-- id: 10 -->
- [x] **Migration**: Ensure every fixture has a corresponding match document. <!-- id: 11 -->
- [x] **UI**: Update `/results` to read from `matches`. <!-- id: 12 -->
- [x] **Scoring**: Implement basic innings summary updates. <!-- id: 13 -->

### Phase 4: Unified People Model

- [x] **Schema**: Create `people` collection. <!-- id: 14 -->
- [x] **Migration**: Migrate `players` docs to `people` with `role: 'Player'`. <!-- id: 15 -->
- [x] **UI**: Update `/people` to read from `people` collection. <!-- id: 16 -->
- [x] **Linkage**: Update `teams` to reference `people` IDs for rosters. <!-- id: 17 -->
- [x] **Cleanup**: Deprecate `players` collection and static umpire/scorer lists <!-- id: 17 -->

## Phase 5: Pre-Match & Live Scoring

- [x] **State Machine**: Implement `SCHEDULED` -> `LIVE` -> `COMPLETED` transitions <!-- id: 18 -->
- [x] **Live Engine**: Build ball-by-ball persistence logic (V3 Event Sourced) <!-- id: 19 -->

## Phase 6: Refinement & Cleanup

- [x] **Unify Team Schemas**: Consolidate `teamSchema.ts` and `teamSchemas.ts` <!-- id: 20 -->
- [x] **Enhance Coach Form**: Add `SchoolTeamAssignment` to `CoachForm` <!-- id: 21 -->
- [x] **RBAC Data Structure**: Ensure `assignedSchools` and `teamIds` are handled in `UserService` <!-- id: 22 -->

## Phase 8: Player Development & Medical Engine (`/coach/development`)

- [ ] **Firestore Service Integration**: Wire real player profiles, readiness scores, and active interventions into `CoachDevelopmentHub` <!-- id: 27 -->
- [ ] **Medical Restriction Engine**: Enforce medical safety rules and workload limits in drill recommendations <!-- id: 28 -->
- [ ] **Assessment & Prescription Actions**: Connect skill rubric logging and intervention assignment server actions <!-- id: 29 -->
- [ ] **Verification**: Add Vitest tests for player development engine and run TypeScript check <!-- id: 30 -->

