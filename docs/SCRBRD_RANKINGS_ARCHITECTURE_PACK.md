# SCRBRD Rankings & Impact Engine: Architecture Pack

This document contains the core system architecture and logical flow diagrams for the SCRBRD Rankings Intelligence Suite and Match Impact Engine.

---

## 1. SCRBRD System Architecture

This 4-layer architecture ensures clear separation between raw data collection, contextual intelligence, and the ranking ecosystem.

```mermaid
graph TD
    subgraph Experience_Layer ["Experience Layer (UI)"]
        A1[Scorer Console]
        A2[Live Match Centre]
        A3[Coach Dashboard]
        A4[Rankings Hub]
        A5[Scout Dashboard]
    end

    subgraph Intelligence_Layer ["Intelligence & Impact Engine"]
        B1[Context Multiplier Service]
        B2[Pressure State Evaluator]
        B3[Expected State Delta Model]
        B4[Impact Attribution Logic]
    end

    subgraph Rankings_Layer ["Global Rankings Engine"]
        C1[TeamRank Calculator]
        C2[Player Power Rating - PPR]
        C3[Scout Grade Engine]
        C4[Potential Index Model]
    end

    subgraph Data_Layer ["Data & Persistence Layer"]
        D1[(Ball Event Store)]
        D2[(Impact Snapshots)]
        D3[(Ranking Snapshots)]
        D4[(Scout Reports)]
    end

    %% Flow
    A1 --> D1
    D1 --> B1
    B1 --> B2 & B3
    B2 & B3 --> B4
    B4 --> D2
    D2 --> C1 & C2
    D4 --> C3 & C4
    C1 & C2 & C3 & C4 --> D3
    D3 --> A2 & A3 & A4 & A5
```

---

## 2. Live Match Data Pipeline

The millisecond-level flow from a scoring action to a global ranking update.

```mermaid
sequenceDiagram
    participant S as Scorer Console
    participant B as Backend / Event Bus
    participant I as Match Impact Engine
    participant R as Rankings Engine
    participant U as Subscriber UI (Fans/Coaches)

    S->>B: Scored Ball Event (4 runs, Zone: Mid-wicket)
    B->>I: Trigger Impact Calculation
    activate I
    I->>I: Fetch Context (Phase, Pressure, Opponent)
    I->>I: Compute Swing Adjustment (Expected State Delta)
    I->>I: Attribute Impact (Batter +, Bowler -)
    I-->>B: Publish Ball Impact Result
    deactivate I
    
    par Live Updates
        B->>U: Push Live Impact Pulse / Momentum Update
    and Async Processing
        B->>R: Update Live Performance Index (PPR)
        R->>B: Save Ranking Snapshot
    end
```

---

## 3. Match Impact Engine Logic Flow

The internal pipeline for evaluating a single ball's consequence.

```mermaid
flowchart LR
    E[Scoring Event] --> V[Base Event Value]
    
    subgraph Modifiers
        M1[Phase Multiplier]
        M2[Pressure Multiplier]
        M3[Opposition Quality]
        M4[Match Type Multiplier]
    end
    
    V --> XM[Weighted Event Value]
    M1 & M2 & M3 & M4 --> XM
    
    subgraph Delta_Model ["Expected State Delta"]
        WA[Win Prob / State After]
        WB[Win Prob / State Before]
        WA -.- WB --> SW[Swing Adjustment]
    end
    
    XM --> T[TOTAL BALL IMPACT]
    SW --> T
    
    T --> AT[Impact Attribution]
    AT --> P1[Batter Impact]
    AT --> P2[Bowler Impact]
    AT --> P3[Fielder Impact]
```

---

## 4. Rankings Intelligence Engine

How diverse data signals converge into the four definitive SCRBRD scores.

```mermaid
graph TD
    subgraph Match_Signals
        S1[Match Results]
        S2[Impact Scores - MIS]
        S3[Clutch Performance]
    end

    subgraph Qualitative_Signals
        Q1[Scout Assessments]
        Q2[Skill Matrix Ratings]
        Q3[Coach Observations]
    end

    S1 & S2 --> TR[TeamRank]
    S2 & S3 --> PPR[Player Power Rating]
    Q1 & Q2 & S2 --> SG[Scout Grade]
    Q2 & Q3 & TR --> PI[Potential Index]

    TR --> TR_Output[National Top 100 Schools]
    PPR --> PPR_Output[National Top 100 Players]
    SG --> SG_Output[Talent Watchlists]
    PI --> PI_Output[Future Prospect Radar]
```

---

## 5. Frontend Module Map

Target UI surfaces for each SCRBRD role.

```mermaid
mindmap
  root((SCRBRD Intelligence UI))
    Scorer Console
      Pressure State Chip
      Momentum Mini-strip
      End-of-Over Summary
    Live Match Centre
      Momentum Shading Graph
      Top Impact Leaderboard
      Key Match Moments Feed
    Coach Dashboard
      Squad Skill Distribution
      Execution Diagnostics
      Rescue/Collapse Analysis
    Rankings Hub
      National Top 100 Cards
      Rise/Fall Index
      Player Comparison Radar
    Scout Dashboard
      Prospect Radar
      Role Scarcity Heatmap
      Assessment Timeline
```

---

1. **Context Recognition:** We don't just count runs; we measure pressure and consequence.
2. **Attribution Fairness:** Impact is shared between bowlers, fielders, and batters based on multi-actor interaction.
3. **Snapshot Integrity:** Rankings are versioned and verifiable, creating a reliable historical record for every player.
4. **Hybrid Intelligence:** We combine hard ball-data with human scout expertise for a "Moneyball" level of precision.
