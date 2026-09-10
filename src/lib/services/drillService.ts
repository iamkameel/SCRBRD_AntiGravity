import { SkillDomain, UUID } from "@/types/schema_v4";

export interface Drill {
    id: UUID;
    name: string;
    category: SkillDomain;
    subcategory: string;
    intensity: 'Low' | 'Medium' | 'High';
    duration: string; // e.g. "15 mins"
    targetAttributes: string[];
    equipmentNeeded?: string[];
    description: string;
    drillLevel: 'Foundation' | 'Intermediate' | 'Advanced';
}

/**
 * Static library of drills based on Section 15 of the SCRBRD Dossier.
 */
export const DRILL_LIBRARY: Drill[] = [
    // --- Batting Drills ---
    {
        id: "bat-001",
        name: "Drop-and-Run Rotation",
        category: "Batting",
        subcategory: "strike rotation",
        intensity: "Medium",
        duration: "15 mins",
        targetAttributes: ["Strike Rotation", "Gap Finding", "Running Between Wickets"],
        description: "Batter drops the ball into a nearby gap and sprints for a single. Focus on soft hands and immediate decision-making.",
        drillLevel: "Intermediate"
    },
    {
        id: "bat-002",
        name: "12-Ball Spin Scenario",
        category: "Batting",
        subcategory: "playing spin",
        intensity: "High",
        duration: "20 mins",
        targetAttributes: ["vs Spin", "Footwork", "Decision Making"],
        description: "Facing 12 balls from a spinner with specific field settings. Must maintain a target strike rate without losing a wicket.",
        drillLevel: "Advanced"
    },
    {
        id: "bat-003",
        name: "Cone Gap Target Practice",
        category: "Batting",
        subcategory: "gap finding",
        intensity: "Medium",
        duration: "20 mins",
        targetAttributes: ["Gap Finding", "Shot Range", "Control"],
        description: "Batter must hit specific gaps marked by cones. Focus on head position and balance through the shot.",
        drillLevel: "Foundation"
    },

    // --- Bowling Drills ---
    {
        id: "bow-001",
        name: "Yorker Target Grid",
        category: "Bowling",
        subcategory: "death bowling",
        intensity: "High",
        duration: "15 mins",
        targetAttributes: ["Death", "Control", "Repeatability"],
        description: "Bowling at a specific grid at the base of the stumps. 6 balls, aim for 4/6 successful yorkers.",
        drillLevel: "Advanced"
    },
    {
        id: "bow-002",
        name: "New Ball Swing Control",
        category: "Bowling",
        subcategory: "new ball execution",
        intensity: "Medium",
        duration: "25 mins",
        targetAttributes: ["New Ball", "Seam/Swing", "Line"],
        description: "Continuous bowling with a new ball, focusing on wrist position to maintain consistent outswing/inswing.",
        drillLevel: "Intermediate"
    },

    // --- Mental Drills ---
    {
        id: "men-001",
        name: "Pressure Decision Set",
        category: "Mental",
        subcategory: "reset after error",
        intensity: "Low",
        duration: "10 mins",
        targetAttributes: ["Reset", "Composure", "Decision Making"],
        description: "Coach introduces a 'bad call' or 'error' scenario. Player must execute a reset routine before the next delivery.",
        drillLevel: "Intermediate"
    },
    {
        id: "men-002",
        name: "Endurance Focus Block",
        category: "Mental",
        subcategory: "concentration",
        intensity: "Medium",
        duration: "45 mins",
        targetAttributes: ["Concentration", "Patience", "Work Ethic"],
        description: "Extended session with low frequency of scoring balls. Focus on maintaining intensity between deliveries.",
        drillLevel: "Advanced"
    },

    // --- Tactical Drills ---
    {
        id: "tac-001",
        name: "Field Placement Simulation",
        category: "Tactical",
        subcategory: "field awareness",
        intensity: "Low",
        duration: "15 mins",
        targetAttributes: ["Field Awareness", "Game State", "Option Selection"],
        description: "Interactive session where players are shown field settings and must decide on the optimal bowling/batting plan.",
        drillLevel: "Intermediate"
    }
];

export const drillService = {
    /**
     * Get the full drill library.
     */
    getAll(): Drill[] {
        return DRILL_LIBRARY;
    },

    /**
     * Get drills by category.
     */
    getByCategory(category: SkillDomain): Drill[] {
        return DRILL_LIBRARY.filter(d => d.category === category);
    },

    /**
     * Get drills by target attribute.
     */
    getByAttribute(attribute: string): Drill[] {
        return DRILL_LIBRARY.filter(d =>
            d.targetAttributes.some(attr => attr.toLowerCase() === attribute.toLowerCase())
        );
    },

    /**
     * Find a drill by its ID.
     */
    getById(id: UUID): Drill | undefined {
        return DRILL_LIBRARY.find(d => d.id === id);
    }
};
