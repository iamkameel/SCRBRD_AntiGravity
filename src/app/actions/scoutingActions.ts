"use server";

import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase-admin";
import { requireUser } from "@/lib/auth/session";
import { recordAuditLog } from "@/lib/services/auditService";
import {
    clampAbility,
    createAbilitySnapshot,
    deriveScoutGrade,
    REGIONAL_TALENT_DEMO,
    type AbilitySnapshot,
    type AssessmentMatrix,
    type InvitationalStatus,
    type ProvincialInvitational,
    type RegionalProspect,
    type ScoutGrade,
} from "@/lib/intelligence/talentIdentificationEngine";

export interface ScoutReportInput {
    personId: string;
    personName: string;
    roleArchetype: string;
    scoutGrade?: string;
    potentialScore?: string;
    metrics?: Record<string, number | undefined>;
    notes?: string;
    /** Legacy alias retained for older scouting form integrations. */
    scoutNotes?: string;
    assessment?: Partial<AssessmentMatrix>;
    school?: string;
    region?: string;
    age?: number;
    ageGroup?: string;
    observationDate?: string;
    confidenceLevel?: "High" | "Medium" | "Low";
    technicalScore?: number;
    tacticalScore?: number;
    physicalScore?: number;
    mentalScore?: number;
    competitivenessScore?: number;
    statisticalEvidenceScore?: number;
}

export interface ProspectItem {
    id: string;
    name: string;
    role: string;
    age: number;
    scoutGrade: string;
    potential: string;
    metrics: Record<string, number>;
    trend: "up" | "down" | "same";
    reports: number;
    inWatchlist?: boolean;
    isWatchlisted?: boolean;
}

export interface WatchlistMetadata {
    notes?: string;
    priority?: "High" | "Standard" | "Monitor";
    region?: string;
}

export interface ProvincialInvitationalInput {
    personId: string;
    personName: string;
    province: string;
    eventName: string;
    eventDate: string;
    ageGroup: string;
    status?: InvitationalStatus;
    notes?: string;
}

const DEFAULT_PROSPECTS: ProspectItem[] = REGIONAL_TALENT_DEMO.map((prospect) => ({
    id: prospect.id,
    name: prospect.name,
    role: prospect.roleArchetype,
    age: Number(prospect.ageGroup.replace(/\D/g, "")) || 17,
    scoutGrade: prospect.scoutGrade,
    potential: prospect.projectedPotential >= 94 ? "ELITE" : "HIGH",
    metrics: Object.fromEntries(
        Object.entries(prospect.abilityHistory.at(-1)?.abilities || {}).map(([key, value]) => [key.toLowerCase(), value]),
    ),
    trend: "up",
    reports: prospect.reportCount,
    inWatchlist: prospect.inWatchlist,
    isWatchlisted: prospect.inWatchlist,
}));

const grades: ScoutGrade[] = ["A+", "A", "B+", "B", "C"];
const invitationalStatuses: InvitationalStatus[] = ["Identified", "Invited", "Confirmed", "Attended", "Selected", "Declined"];

// Server actions have an active cache store in Next.js. Keeping this defensive
// also lets the domain actions run in unit tests and background maintenance jobs.
function revalidateScoutingPath() {
    try {
        revalidatePath("/scouting");
    } catch {
        // No active static-generation store (for example, a unit test).
    }
}

function numberWithinScale(value: unknown, max: number, fallback: number): number {
    const candidate = typeof value === "number" && Number.isFinite(value) ? value : fallback;
    // Older reports stored percentage metrics; new reports retain their native assessment scale.
    return Math.max(0, Math.min(max, candidate > max ? (candidate / 100) * max : candidate));
}

function assessmentFromReport(report: ScoutReportInput | Record<string, any>): AssessmentMatrix {
    const structuredAssessment = (report as Record<string, any>).assessment;
    const source = structuredAssessment && typeof structuredAssessment === "object" ? structuredAssessment : report;
    const metrics = report.metrics || {};

    return {
        technicalScore: numberWithinScale(source.technicalScore ?? metrics.velocity ?? metrics.technique, 20, 10),
        tacticalScore: numberWithinScale(source.tacticalScore ?? metrics.accuracy ?? metrics.tactical, 15, 7),
        physicalScore: numberWithinScale(source.physicalScore ?? metrics.stamina ?? metrics.physical, 15, 7),
        mentalScore: numberWithinScale(source.mentalScore ?? metrics.composure ?? metrics.mental, 20, 10),
        competitivenessScore: numberWithinScale(source.competitivenessScore ?? metrics.impact ?? metrics.competitive, 10, 5),
        statisticalEvidenceScore: numberWithinScale(source.statisticalEvidenceScore ?? metrics.evidence, 20, 10),
    };
}

function validGrade(value?: unknown, fallback?: ScoutGrade): ScoutGrade {
    return typeof value === "string" && grades.includes(value as ScoutGrade)
        ? value as ScoutGrade
        : fallback || "C";
}

function snapshotFromStoredReport(report: Record<string, any>, fallbackSeason: string): AbilitySnapshot {
    if (report.abilitySnapshot?.abilities && report.abilitySnapshot?.projectedAbilities) {
        return report.abilitySnapshot as AbilitySnapshot;
    }

    const assessment = assessmentFromReport(report);
    const total = Object.values(assessment).reduce((sum, score) => sum + score, 0);
    return createAbilitySnapshot(
        report.season || report.observationDate?.slice(0, 4) || fallbackSeason,
        assessment,
        validGrade(report.scoutGrade, deriveScoutGrade(total)),
        typeof report.age === "number" ? report.age : undefined,
        report.potentialScore,
    );
}

function pathwayStageFor(invitation?: ProvincialInvitational): RegionalProspect["pathwayStage"] {
    if (!invitation) return "School Squad";
    if (invitation.status === "Selected") return "National Camp";
    if (["Invited", "Confirmed", "Attended"].includes(invitation.status)) return "Provincial Invitational";
    return "Zonal Select";
}

/**
 * Creates a complete, auditable field report. The compact legacy metric shape
 * is accepted so existing integrations can continue submitting reports.
 */
export async function createScoutReportAction(report: ScoutReportInput) {
    try {
        const user = await requireUser("talent");
        const assessment = assessmentFromReport(report);
        const total = Object.values(assessment).reduce((sum, score) => sum + score, 0);
        const scoutGrade = validGrade(report.scoutGrade, deriveScoutGrade(total));
        const observationDate = report.observationDate || new Date().toISOString().slice(0, 10);
        const abilitySnapshot = createAbilitySnapshot(
            observationDate.slice(0, 4),
            assessment,
            scoutGrade,
            report.age,
            report.potentialScore,
        );

        const docRef = await adminDb.collection("scouting_reports").add({
            ...report,
            metrics: report.metrics || {},
            notes: report.notes || report.scoutNotes || "",
            scoutGrade,
            assessment,
            currentAbility: abilitySnapshot.currentAbility,
            projectedPotential: abilitySnapshot.projectedPotential,
            abilitySnapshot,
            observationDate,
            scoutUid: user.uid,
            scoutEmail: user.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        await recordAuditLog({
            actorId: user.uid,
            actorName: user.email || "Scout",
            actionType: "SCOUT_REPORT_SUBMITTED",
            entityType: "scouting_report",
            entityId: docRef.id,
            description: `Submitted talent evaluation report for ${report.personName} (${scoutGrade} / ${report.potentialScore || "UNCLASSIFIED"})`,
        });
        revalidateScoutingPath();

        return { success: true, id: docRef.id, abilitySnapshot };
    } catch (error) {
        console.error("Error creating scout report:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to create scout report." };
    }
}

/** Fetches the compact prospect view used by the evaluation dashboard. */
export async function getProspectsAction() {
    try {
        const [reportsSnap, watchlistSnap] = await Promise.all([
            adminDb.collection("scouting_reports").orderBy("createdAt", "desc").get(),
            adminDb.collection("scouting_watchlists").get(),
        ]);
        const watchlistIds = new Set(watchlistSnap.docs.map((doc: any) => doc.data().personId));

        if (reportsSnap.empty) {
            return { success: true, prospects: DEFAULT_PROSPECTS.map((prospect) => ({ ...prospect, inWatchlist: watchlistIds.has(prospect.id), isWatchlisted: watchlistIds.has(prospect.id) })) };
        }

        const prospects = new Map<string, ProspectItem>();
        reportsSnap.docs.forEach((doc: any) => {
            const data = doc.data();
            const personId = data.personId || doc.id;
            const snapshot = snapshotFromStoredReport(data, new Date().getFullYear().toString());
            const existing = prospects.get(personId);
            if (existing) {
                existing.reports += 1;
                return;
            }

            prospects.set(personId, {
                id: personId,
                name: data.personName || "Unknown Athlete",
                role: data.roleArchetype || "General Athlete",
                age: data.age || 17,
                scoutGrade: validGrade(data.scoutGrade),
                potential: data.potentialScore || (snapshot.projectedPotential >= 90 ? "ELITE" : "HIGH"),
                metrics: data.metrics || snapshot.abilities,
                trend: "up",
                reports: 1,
                inWatchlist: watchlistIds.has(personId),
                isWatchlisted: watchlistIds.has(personId),
            });
        });

        return { success: true, prospects: [...prospects.values()] };
    } catch (error) {
        console.error("Error fetching prospects:", error);
        return { success: true, prospects: DEFAULT_PROSPECTS };
    }
}

/** Fetches historical scouting reports for a specific athlete. */
export async function getScoutReportsAction(personId?: string) {
    try {
        let query: any = adminDb.collection("scouting_reports").orderBy("createdAt", "desc");
        if (personId) query = query.where("personId", "==", personId);
        const snap = await query.get();
        return { success: true, reports: snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) };
    } catch (error) {
        console.error("Error fetching scout reports:", error);
        return { success: false, error: "Failed to fetch scout reports.", reports: [] };
    }
}

/** Adds/removes an athlete from a scout's personal watchlist with optional triage metadata. */
export async function toggleWatchlistAction(personId: string, metadata: WatchlistMetadata = {}) {
    try {
        const user = await requireUser("talent");
        const existingSnap = await adminDb.collection("scouting_watchlists")
            .where("ownerUid", "==", user.uid)
            .where("personId", "==", personId)
            .get();

        if (!existingSnap.empty) {
            await adminDb.collection("scouting_watchlists").doc(existingSnap.docs[0].id).delete();
            await recordAuditLog({ actorId: user.uid, actorName: user.email || "Scout", actionType: "LOGISTICS_UPDATE", entityType: "scouting_report", entityId: personId, description: `Removed athlete ${personId} from scouting watchlist` });
            revalidateScoutingPath();
            return { success: true, added: false };
        }

        await adminDb.collection("scouting_watchlists").add({
            ownerUid: user.uid,
            personId,
            priority: metadata.priority || "Standard",
            notes: metadata.notes || "",
            region: metadata.region || "",
            addedAt: new Date().toISOString(),
        });
        await recordAuditLog({ actorId: user.uid, actorName: user.email || "Scout", actionType: "LOGISTICS_CREATE", entityType: "scouting_report", entityId: personId, description: `Added athlete ${personId} to scouting watchlist` });
        revalidateScoutingPath();
        return { success: true, added: true };
    } catch (error) {
        console.error("Error toggling watchlist:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to update watchlist." };
    }
}

/** Returns the current scout's athlete IDs for lightweight watchlist consumers. */
export async function getScoutingWatchlistAction() {
    try {
        const user = await requireUser("talent");
        const snapshot = await adminDb.collection("scouting_watchlists").where("ownerUid", "==", user.uid).get();
        return { success: true, watchlistIds: snapshot.docs.map((doc: any) => doc.data().personId).filter(Boolean) };
    } catch (error) {
        console.error("Error loading scouting watchlist:", error);
        return { success: false, watchlistIds: [], error: error instanceof Error ? error.message : "Failed to load scouting watchlist." };
    }
}

/**
 * Compatibility entry point for older pathway callers. New work should use
 * createProvincialInvitationalAction so it can capture province, date and age group.
 */
export async function nominateProvincialCampAction(personId: string, campName: string, pathwayStage = "Provincial Invitational") {
    try {
        const user = await requireUser("talent");
        const docRef = await adminDb.collection("provincial_invitationals").add({
            personId,
            personName: "Tracked Athlete",
            province: "Unassigned",
            eventName: campName,
            eventDate: "",
            ageGroup: "Open",
            pathwayStage,
            status: "Invited" as InvitationalStatus,
            createdBy: user.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        await recordAuditLog({ actorId: user.uid, actorName: user.email || "Scout", actionType: "LOGISTICS_CREATE", entityType: "scouting_report", entityId: docRef.id, description: `Nominated athlete ${personId} for ${campName}` });
        revalidateScoutingPath();
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error nominating athlete for provincial camp:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to nominate athlete." };
    }
}

/** Creates a provincial invitational record, separate from a scouting report. */
export async function createProvincialInvitationalAction(input: ProvincialInvitationalInput) {
    try {
        const user = await requireUser("talent");
        if (!input.personId || !input.personName || !input.province || !input.eventName || !input.eventDate || !input.ageGroup) {
            return { success: false, error: "Athlete, province, event, date, and age group are required." };
        }

        const status = invitationalStatuses.includes(input.status || "Identified") ? input.status || "Identified" : "Identified";
        const docRef = await adminDb.collection("provincial_invitationals").add({
            ...input,
            status,
            createdBy: user.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        await recordAuditLog({ actorId: user.uid, actorName: user.email || "Scout", actionType: "LOGISTICS_CREATE", entityType: "scouting_report", entityId: docRef.id, description: `Created ${status.toLowerCase()} provincial invitational for ${input.personName}` });
        revalidateScoutingPath();
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error creating provincial invitational:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to create provincial invitational." };
    }
}

/** Advances an invitation without altering the underlying scouting report. */
export async function updateProvincialInvitationalStatusAction(id: string, status: InvitationalStatus) {
    try {
        const user = await requireUser("talent");
        if (!invitationalStatuses.includes(status)) return { success: false, error: "Invalid invitational status." };

        await adminDb.collection("provincial_invitationals").doc(id).update({ status, updatedAt: new Date().toISOString(), updatedBy: user.uid });
        await recordAuditLog({ actorId: user.uid, actorName: user.email || "Scout", actionType: "LOGISTICS_UPDATE", entityType: "scouting_report", entityId: id, description: `Updated provincial invitational status to ${status}` });
        revalidateScoutingPath();
        return { success: true, status };
    } catch (error) {
        console.error("Error updating provincial invitational:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to update provincial invitational." };
    }
}

/**
 * Returns the regional selection board. It aggregates report history by player,
 * overlays a scout's watchlist and their latest provincial invitation, and has a
 * representative first-run dataset for empty deployments.
 */
export async function getRegionalTalentBoardAction() {
    try {
        const [reportsSnap, watchlistSnap, invitationalSnap] = await Promise.all([
            adminDb.collection("scouting_reports").get(),
            adminDb.collection("scouting_watchlists").get(),
            adminDb.collection("provincial_invitationals").get(),
        ]);

        if (reportsSnap.empty) return { success: true, prospects: REGIONAL_TALENT_DEMO, usingDemoData: true };

        const watchlists = new Map<string, Record<string, any>>();
        watchlistSnap.docs.forEach((doc: any) => watchlists.set(doc.data().personId, doc.data()));
        const invitationals = new Map<string, ProvincialInvitational>();
        invitationalSnap.docs.forEach((doc: any) => {
            const data = doc.data();
            const existing = invitationals.get(data.personId);
            if (!existing || String(data.updatedAt || data.createdAt || "") > String(existing.updatedAt || "")) {
                invitationals.set(data.personId, { id: doc.id, ...data } as ProvincialInvitational);
            }
        });

        const grouped = new Map<string, Array<Record<string, any>>>();
        reportsSnap.docs.forEach((doc: any) => {
            const data = { id: doc.id, ...doc.data() };
            const personId = data.personId || doc.id;
            const records = grouped.get(personId) || [];
            records.push(data);
            grouped.set(personId, records);
        });

        const prospects: RegionalProspect[] = [...grouped.entries()].map(([personId, records]) => {
            const seasonSnapshots = new Map<string, AbilitySnapshot>();
            records
                .sort((a, b) => String(a.createdAt || a.observationDate || "").localeCompare(String(b.createdAt || b.observationDate || "")))
                .forEach((record) => {
                    const snapshot = snapshotFromStoredReport(record, new Date().getFullYear().toString());
                    // A later report in a season supersedes the earlier snapshot while the
                    // reportCount remains available to indicate corroborating evidence.
                    seasonSnapshots.set(snapshot.season, snapshot);
                });
            const history = [...seasonSnapshots.values()];
            const latest = records[records.length - 1];
            const snapshot = history[history.length - 1];
            const invitational = invitationals.get(personId);
            const watchlist = watchlists.get(personId);

            return {
                id: personId,
                name: latest.personName || "Unknown Athlete",
                school: latest.school || "School not recorded",
                region: latest.region || "Regional network",
                ageGroup: latest.ageGroup || "Open",
                roleArchetype: latest.roleArchetype || "General Athlete",
                scoutGrade: validGrade(latest.scoutGrade),
                pathwayStage: pathwayStageFor(invitational),
                currentAbility: clampAbility(latest.currentAbility ?? snapshot.currentAbility),
                projectedPotential: clampAbility(latest.projectedPotential ?? snapshot.projectedPotential),
                abilityHistory: history,
                reportCount: records.length,
                notes: latest.notes || "No qualitative observation recorded.",
                inWatchlist: Boolean(watchlist),
                watchlistPriority: watchlist?.priority,
                invitational,
            };
        });

        return { success: true, prospects, usingDemoData: false };
    } catch (error) {
        console.error("Error loading regional talent board:", error);
        return { success: true, prospects: REGIONAL_TALENT_DEMO, usingDemoData: true };
    }
}
