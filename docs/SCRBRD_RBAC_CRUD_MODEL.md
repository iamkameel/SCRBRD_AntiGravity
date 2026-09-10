# 1) RBAC architecture for SCRBRD

SCRBRD should use **hybrid access control**:

## A. Role-Based Access Control
Determines the user’s broad function:
* Super Admin
* School Admin
* Coach
* Parent
* Player
* etc.

## B. Scope-Based Access Control
Determines *where* they can act:
* platform-wide
* league
* school
* team
* fixture
* player-self
* linked-child

## C. Relationship-Based Access Control
Determines *why* they can access a record:
* assigned coach
* verified guardian
* match official
* payer
* medical officer
* scout assigned to event
* disciplinary panel member

## D. Workflow-State Access Control
Determines *when* they can act:
* draft
* pending approval
* live
* submitted
* reviewed
* locked
* archived
* under appeal

That fourth layer is often forgotten. It matters because a scorer may edit a scorecard while live, but not after it is locked.

---

# 2) Core role families

Roles in six layers.

## Layer 1: Platform Governance
1. Super Admin
2. Platform Operations Admin
3. Support Admin
4. Compliance / Safeguarding Officer
5. Audit / Read-Only Compliance Reviewer

## Layer 2: Competition & Governing Body
6. League Admin
7. Tournament Director
8. Competition Operations Manager
9. Regional Selector / Provincial Admin

## Layer 3: School Governance
10. School Owner / Executive Head
11. School Admin
12. School Staff / Registrar
13. Finance Admin
14. Welfare / Medical Officer
15. Transport / Logistics Admin
16. Facilities / Grounds Admin
17. Communications / Media Admin

## Layer 4: Sporting Operations
18. Head Coach
19. Assistant Coach
20. Team Manager
21. Strength & Conditioning Coach
22. Analyst / Performance Analyst
23. Scorer
24. Umpire
25. Match Referee / Match Commissioner
26. Groundsman / Match-Day Ops
27. Selector

## Layer 5: Participants
28. Player
29. Parent / Guardian
30. Adult Player-Payer / Self-Managed Adult Athlete

## Layer 6: External / Limited Roles
31. Scout
32. Sponsor / Partner Viewer
33. Photographer / Media Contributor
34. Spectator / Fan
35. Alumni / Old Boy Viewer

---

# 3) Data domains that permissions should apply to

1. **Identity & Accounts**
2. **Organisation & Structure**
3. **Fixtures & Match Operations**
4. **Performance & Development**
5. **Health, Welfare & Discipline**
6. **Finance & Commercial**
7. **Operations**
8. **System Governance**

---

# 4) Sensitivity levels

CRUD should not apply equally to every field.

* **Level 0 — Public**: fixtures, scores, public player stats
* **Level 1 — Internal Operational**: squad lists, training attendance
* **Level 2 — Restricted Personal**: email, phone, emergency contact
* **Level 3 — Sensitive Welfare / Discipline / Finance**: medical summaries, sanctions, invoices
* **Level 4 — Ultra-Restricted**: full medical records, appeal documents

---

# 5) Guardian and minor protection model

* every under-18 player must have at least **one verified guardian link**
* guardian link must be invited by school admin/existing guardian, or verified registration flow
* guardian must complete identity, consent, safeguarding acceptance

---

# 6) Full role rollout with purpose and access

*(Refer to detailed specification for explicit permissions matrix per role)*

---

# 7) Recommended SCRBRD role implementation model

Each user account should have:
* `userId`
* `personId`
* `globalRoles[]`
* `scopedRoles[]`

Example:

```json
{
  "personId": "p_123",
  "globalRoles": ["parent"],
  "scopedRoles": [
    {
      "role": "assistant_coach",
      "scopeType": "team",
      "scopeId": "team_u14a_2026"
    },
    {
      "role": "scorer",
      "scopeType": "fixture",
      "scopeId": "fix_456"
    }
  ]
}
```

---

# 8) Permission naming model

Do not encode all logic in role names. Use permission primitives.
Example structure:

## Identity
* `person.read.self`
* `person.read.school`
* `person.read.linked_child`
* `person.update.self_basic`
* `person.update.school_operational`
* `person.update.sensitive_identity`

## Fixture / Match
* `fixture.create.school`
* `fixture.update.school`
* `fixture.manage.competition`
* `lineup.update.team`
* `score.update.assigned_fixture`
* `score.submit.assigned_fixture`
* `score.amend.approved`

*(See master specification for full lists)*

---

# 9) Hard privacy rules SCRBRD should adopt

1. **Minors must have verified guardian linkage**
2. **Parents only see linked children**
3. **Coaches do not get full medical records**
4. **Scorers only operate on assigned fixtures**
5. **No hard delete of official scoring history**
6. **Public cannot see contact information**
7. **Sensitive access must be logged**
8. **Computed stats should not be manually edited freely**
9. **Historical role assignment should be end-dated, not erased**
10. **Cross-school private access is denied by default**

---

# Conclusion
No user should access a child’s personal data unless they have both a valid role and a valid relationship or scope. Role alone is not enough. School affiliation alone is not enough. Convenience is not enough.
