# SCRBRD Rewards, Awards, Accolades & Honours

## Purpose

SCRBRD should treat **Rewards**, **Awards**, **Accolades**, and
**Honours** as separate concepts. Although all four may arise from
sporting participation or achievement, they serve different product,
data, recognition, commercial, and player-development purposes.

The distinction should be preserved throughout the data model, player
profiles, dashboards, analytics, notifications, scouting tools, and
administrative workflows.

------------------------------------------------------------------------

## 1. Rewards

### Definition

**Rewards are benefits, points, credits, privileges, or redeemable
incentives earned by a user through eligible activity.**

Rewards form part of SCRBRD's engagement and incentive layer rather than
a player's formal sporting record.

A reward may be triggered automatically by verified activity, issued
through a campaign, granted by an authorised organisation, or earned
through participation.

### Examples

-   SCRBRD reward points
-   Sponsor vouchers
-   Equipment discounts
-   Merchandise offers
-   Tournament promotions
-   Participation incentives
-   School-approved challenges
-   Loyalty benefits
-   Campaign-specific rewards

### Key Characteristics

  Attribute              Rewards
  ---------------------- ----------------------------------------------------
  Primary purpose        Incentive and engagement
  Issuer                 SCRBRD, school, competition or authorised sponsor
  Trigger                Eligible activity, participation or campaign rules
  Redeemable             Potentially
  Transferable           Normally no
  Sporting prestige      None by default
  Scouting weight        None
  Commercial component   Potentially significant
  Expiry                 May apply

### Important Safeguard

SCRBRD should **not automatically turn every sporting action into reward
currency**.

For example, awarding points per run or wicket could unintentionally
encourage individual stat-chasing rather than team objectives. Reward
rules should therefore be configurable and governed separately from
official cricket statistics.

Rewards must also remain separate from protected player data. Sponsors
should never gain access to a minor's private sporting, medical,
contact, behavioural, or personal information merely because they
participate in the rewards ecosystem.

------------------------------------------------------------------------

## 2. Awards

### Definition

**Awards are formal recognitions granted to a player, team, official,
coach, or other participant by an authorised body.**

Awards form part of the official sporting record.

### Examples

-   Player of the Match
-   Player of the Tournament
-   Best Batter
-   Best Bowler
-   Best Fielder
-   Most Valuable Player
-   Coach's Award
-   Sportsman of the Year
-   Team of the Tournament
-   School Cricket Player of the Year

### Key Characteristics

  -----------------------------------------------------------------------
  Attribute                           Awards
  ----------------------------------- -----------------------------------
  Primary purpose                     Formal recognition

  Issuer                              School, team, competition,
                                      governing body or authorised
                                      organisation

  Trigger                             Selection, adjudication or defined
                                      statistical criteria

  Redeemable                          No

  Sporting prestige                   Yes

  Historical record                   Yes

  Scouting relevance                  Potentially

  Verification required               Yes
  -----------------------------------------------------------------------

### Data Model

``` text
awards
- awardId PK
- recipientType
- recipientId
- title
- awardType
- awardingBody
- fixtureId FK nullable
- competitionId FK nullable
- seasonId FK nullable
- awardedOn
- description
- verificationStatus
- evidence[]
- createdBy
- createdAt
```

`recipientType` should allow awards to apply to people and teams rather
than assuming every award belongs exclusively to an individual player.

------------------------------------------------------------------------

## 3. Accolades

### Definition

**Accolades are notable achievements, distinctions, records, milestones,
or recognised accomplishments associated with a participant's sporting
journey.**

Unlike awards, an accolade does not necessarily need to be formally
presented by an organisation.

Accolades help SCRBRD tell the historical and statistical story of a
player.

### Examples

-   First career century
-   1,000 career runs
-   Five wickets in an innings
-   Hat-trick
-   Century on debut
-   Fastest century for a school
-   School record partnership
-   Career-best bowling figures
-   100th wicket
-   Record number of appearances
-   First-team debut
-   Tournament record
-   Historic match performance

### Key Characteristics

  -----------------------------------------------------------------------
  Attribute                           Accolades
  ----------------------------------- -----------------------------------
  Primary purpose                     Achievement and legacy

  Issuer                              System, school, competition,
                                      administrator or verified source

  Trigger                             Milestone, record or notable
                                      achievement

  Redeemable                          No

  Historical importance               High

  Profile visibility                  High

  Scouting relevance                  Contextual

  Can be system-generated             Yes
  -----------------------------------------------------------------------

### Data Model

``` text
accolades
- accoladeId PK
- personId FK
- accoladeType
- title
- description
- source
- fixtureId FK nullable
- competitionId FK nullable
- seasonId FK nullable
- notedOn
- verificationStatus
- isPublic
- tags[]
- evidence[]
- createdAt
```

Where possible, system-generated accolades should reference the
underlying verified SCRBRD match data rather than exist only as manually
entered text.

------------------------------------------------------------------------

## 4. Honours

### Definition

**Honours represent formal selection, representation, appointment, or
inclusion at a recognised level of the sporting pathway.**

Honours deserve their own category because selection for a
representative side is fundamentally different from winning an award or
achieving a statistical milestone.

### Examples

-   School 1st XI selection
-   District selection
-   Provincial selection
-   KZN representative team
-   SA Schools selection
-   National U19 selection
-   Invitational XI
-   Academy selection
-   Representative tour squad
-   National team selection

### Key Characteristics

  Attribute               Honours
  ----------------------- -----------------------------------
  Primary purpose         Record representative achievement
  Trigger                 Formal selection or appointment
  Issuer                  Recognised sporting organisation
  Redeemable              No
  Sporting prestige       High
  Scouting relevance      High, but contextual
  Verification required   Strongly recommended
  Historical record       Yes

### Data Model

``` text
honours
- honourId PK
- personId FK
- organisationId FK nullable
- teamId FK nullable
- title
- honourType
- representationLevel
- sport
- seasonId FK nullable
- startDate
- endDate nullable
- role
- verificationStatus
- evidence[]
- notes
- createdAt
```

------------------------------------------------------------------------

## 5. The Fundamental Difference

  ------------------------------------------------------------------------------------
  Dimension            Rewards          Awards         Accolades      Honours
  -------------------- ---------------- -------------- -------------- ----------------
  Incentive            Yes              No             No             No

  Formal recognition   Sometimes        Yes            Not            Yes
                                                       necessarily    

  Redeemable           Potentially      No             No             No

  Performance-linked   Sometimes        Usually        Usually        Often

  System-generated     Yes              Sometimes      Yes            Normally no

  Official selection   No               No             No             Yes

  Career history       Limited          Yes            Yes            Yes

  Commercial layer     Yes              No             No             No

  Scouting relevance   None             Contextual     Contextual     Significant

  Player profile       Wallet/Rewards   Awards         Achievements   Representative
                                                                      Honours
  ------------------------------------------------------------------------------------

------------------------------------------------------------------------

## 6. One Performance Can Generate Multiple Outcomes

These systems should remain separate even when they originate from the
same match.

For example, a player scores **104 not out in a school final** and is
subsequently selected for a provincial squad.

SCRBRD could record:

  System               Result
  -------------------- ----------------------------------------------
  Statistical record   104\*
  Reward               250 SCRBRD points under an eligible campaign
  Award                Player of the Match
  Accolade             First career century
  Honour               Provincial squad selection

These records describe different aspects of the player's journey and
should not be collapsed into a generic "achievement" object.

------------------------------------------------------------------------

## 7. Player Profile Architecture

A player's profile could contain separate areas for:

### Performance

Official cricket statistics, form, match history, analytics, skills
matrices and development data.

### Awards

Formal awards received throughout the player's career.

### Accolades & Milestones

Records, statistical achievements, debuts, personal bests and notable
career moments.

### Honours

Representative selections and progression through recognised sporting
structures.

### Rewards

Current points balance, earning history, available benefits, redemptions
and expiry information.

The **Rewards Wallet should not form part of the player's scouting
résumé**.

------------------------------------------------------------------------

## 8. Scouting and Ranking Implications

SCRBRD should avoid the assumption that awards, accolades and honours
can simply be converted into fixed ranking points.

An honour such as provincial selection may be meaningful evidence, but
selection environments differ between seasons, provinces, schools and
age groups. Likewise, awards can involve subjective adjudication.

The strongest scouting model should therefore remain grounded in
verified performance data.

A sensible hierarchy is:

``` text
Verified match performance
        ↓
Context-adjusted analytics
        ↓
Development / skills assessments
        ↓
Representative honours
        ↓
Awards
        ↓
Accolades and milestones
```

Rewards should sit **outside the sporting ranking model entirely**.

Awards, accolades and honours should provide additional context rather
than artificially inflate performance statistics.

------------------------------------------------------------------------

## 9. Rewards Economy

Rewards can support a separate SCRBRD ecosystem.

### Reward Wallet

``` text
reward_wallets
- walletId PK
- personId FK
- pointsEarned
- pointsRedeemed
- pointsExpired
- availableBalance
- updatedAt
```

### Reward Transactions

``` text
reward_transactions
- transactionId PK
- walletId FK
- rewardRuleId FK nullable
- fixtureId FK nullable
- campaignId FK nullable
- transactionType
- points
- description
- status
- createdAt
```

A ledger-based model is preferable to storing only a mutable points
balance because SCRBRD should be able to audit exactly **why points were
earned, redeemed, reversed or expired**.

### Reward Catalogue

``` text
reward_catalogue
- rewardItemId PK
- sponsorId FK nullable
- title
- description
- pointsCost
- quantityAvailable
- eligibilityRules
- validFrom
- validUntil
- status
```

### Reward Rules

``` text
reward_rules
- rewardRuleId PK
- name
- triggerType
- triggerConditions
- pointsValue
- scopeType
- scopeId
- validFrom
- validUntil
- status
```

Rules could be scoped to a school, competition, tournament, campaign or
other authorised environment.

------------------------------------------------------------------------

## 10. Governance for Minors

Because SCRBRD operates within school sport, rewards require stronger
controls than a conventional adult loyalty programme.

The system should support:

-   Parent/guardian consent where required.
-   Age-appropriate reward eligibility.
-   School-level participation controls.
-   Sponsor restrictions.
-   No behavioural advertising based on protected player data.
-   No direct sponsor access to children's contact information.
-   No sale or disclosure of protected player information in exchange
    for rewards.
-   Complete transaction audit trails.
-   Configurable campaign approval.
-   Clear expiry and redemption rules.
-   Appropriate POPIA-aligned processing and data minimisation.

Commercial engagement must remain structurally separated from SCRBRD's
protected player intelligence.

------------------------------------------------------------------------

## 11. Dashboard Treatment

The systems should surface differently according to role and RBAC
permissions.

### Player

-   Reward balance
-   Available rewards
-   Recent awards
-   Career accolades
-   Representative honours
-   Milestone progress

### Parent / Guardian

Where authorised:

-   Child reward activity
-   Redemption approvals where required
-   Awards and honours
-   Milestones
-   Privacy and participation controls

### Coach

-   Player awards
-   Performance-linked accolades
-   Representative honours
-   Development milestones

Coaches generally do **not** need access to a player's commercial reward
redemption history.

### School Administrator

-   School awards
-   Award administration
-   Honour verification
-   Reward programme configuration
-   Campaign approvals
-   Participation and safeguarding controls

### Scout

Subject to RBAC, consent and safeguarding rules:

-   Verified performance
-   Public/authorised accolades
-   Awards
-   Representative honours
-   Relevant development information

Scouts should have **no access to reward wallets or redemption
activity**.

### Sponsor

Only appropriately aggregated campaign information:

-   Campaign participation
-   Reward issuance
-   Redemption rates
-   Aggregate engagement
-   Campaign performance

Sponsors should not receive protected individual player intelligence
merely because they fund a reward.

------------------------------------------------------------------------

## 12. Recommended SCRBRD Domain Model

SCRBRD should formally recognise four independent domains:

``` text
SCRBRD Achievement & Engagement Layer

├── Rewards
│   ├── Wallets
│   ├── Transactions
│   ├── Reward Rules
│   ├── Campaigns
│   └── Redemption Catalogue
│
├── Awards
│   ├── Match Awards
│   ├── Competition Awards
│   ├── Season Awards
│   └── Institutional Awards
│
├── Accolades
│   ├── Milestones
│   ├── Records
│   ├── Personal Bests
│   ├── Debuts
│   └── Historic Achievements
│
└── Honours
    ├── School Representation
    ├── District Representation
    ├── Provincial Representation
    ├── National Representation
    └── Invitational / Representative Selection
```

------------------------------------------------------------------------

## 13. Core Principle

The distinction can be summarised simply:

> **Rewards recognise participation through value. Awards recognise
> excellence through formal recognition. Accolades record achievement
> and legacy. Honours record selection and representation.**

These concepts should remain separate at the **database, permissions,
UI, analytics and business-logic levels**.

That separation allows SCRBRD to build commercial engagement without
contaminating sporting credibility, while simultaneously creating a much
richer historical record of every player's sporting journey.
