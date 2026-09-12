import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocks
const mockRequireUser = vi.fn();
const mockAdminDbAdd = vi.fn();
const mockAdminDbDocUpdate = vi.fn();
const mockAdminDbDocDelete = vi.fn();
const mockAdminDbGet = vi.fn();
const mockRecordAuditLog = vi.fn();

vi.mock("@/lib/auth/session", () => ({
    requireUser: (role: string) => mockRequireUser(role),
}));

vi.mock("@/lib/services/auditService", () => ({
    recordAuditLog: (entry: any) => mockRecordAuditLog(entry),
}));

vi.mock("@/lib/firebase-admin", () => ({
    adminDb: {
        collection: (collName: string) => ({
            add: (data: any) => mockAdminDbAdd(collName, data),
            doc: (id: string) => ({
                update: (data: any) => mockAdminDbDocUpdate(collName, id, data),
                delete: () => mockAdminDbDocDelete(collName, id),
            }),
            where: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            get: () => mockAdminDbGet(collName),
        }),
    },
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    redirect: vi.fn(),
}));

import { createCoachAction, updateCoachAction } from "../coachActions";
import { createScoutReportAction, toggleWatchlistAction } from "../scoutingActions";

describe("Coach & Scouting Server Actions Security", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Coach Actions", () => {
        it("creates coach profile with requireUser('management') and records audit log", async () => {
            mockRequireUser.mockResolvedValueOnce({ uid: "user_coach_admin", email: "headcoach@school.edu" });
            mockAdminDbAdd.mockResolvedValueOnce({ id: "coach_doc_123" });

            const formData = new FormData();
            formData.set("firstName", "Gary");
            formData.set("lastName", "Kirsten");
            formData.set("email", "gkirsten@school.edu");
            formData.set("dateOfBirth", "1967-11-23");
            formData.set("schoolId", "school_st_stithians");
            formData.set("role", "Head Coach");

            await createCoachAction({}, formData);

            expect(mockRequireUser).toHaveBeenCalledWith("management");
            expect(mockAdminDbAdd).toHaveBeenCalledWith("people", expect.objectContaining({
                firstName: "Gary",
                lastName: "Kirsten",
                role: "Head Coach",
                createdBy: "user_coach_admin",
            }));
            expect(mockRecordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
                actorId: "user_coach_admin",
                actionType: "STAFF_ASSIGNED",
                entityType: "coach",
                entityId: "coach_doc_123",
            }));
        });

        it("updates coach profile with requireUser('management') and records audit log", async () => {
            mockRequireUser.mockResolvedValueOnce({ uid: "user_coach_admin", email: "headcoach@school.edu" });
            mockAdminDbDocUpdate.mockResolvedValueOnce({});

            const formData = new FormData();
            formData.set("firstName", "Gary");
            formData.set("lastName", "Kirsten");
            formData.set("email", "gkirsten@school.edu");
            formData.set("dateOfBirth", "1967-11-23");
            formData.set("schoolId", "school_st_stithians");
            formData.set("role", "Head Coach");

            await updateCoachAction("coach_doc_123", {}, formData);

            expect(mockRequireUser).toHaveBeenCalledWith("management");
            expect(mockAdminDbDocUpdate).toHaveBeenCalledWith("people", "coach_doc_123", expect.objectContaining({
                updatedBy: "user_coach_admin",
            }));
            expect(mockRecordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
                actorId: "user_coach_admin",
                actionType: "LOGISTICS_UPDATE",
                entityType: "coach",
                entityId: "coach_doc_123",
            }));
        });
    });

    describe("Scouting Actions", () => {
        it("creates scout report with requireUser('talent') and records audit log", async () => {
            mockRequireUser.mockResolvedValueOnce({ uid: "scout_user_1", email: "scout@scouting.org" });
            mockAdminDbAdd.mockResolvedValueOnce({ id: "report_doc_456" });

            const reportInput = {
                personId: "player_789",
                personName: "Junior Star",
                roleArchetype: "Fast Bowler",
                scoutGrade: "A+",
                potentialScore: "ELITE",
                metrics: { velocity: 89, accuracy: 94 },
                notes: "High potential seamer",
            };

            const res = await createScoutReportAction(reportInput);

            expect(res.success).toBe(true);
            expect(res.id).toBe("report_doc_456");
            expect(mockRequireUser).toHaveBeenCalledWith("talent");
            expect(mockRecordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
                actorId: "scout_user_1",
                actionType: "SCOUT_REPORT_SUBMITTED",
                entityType: "scouting_report",
                entityId: "report_doc_456",
            }));
        });

        it("toggles scouting watchlist with requireUser('talent') and records audit log", async () => {
            mockRequireUser.mockResolvedValueOnce({ uid: "scout_user_1", email: "scout@scouting.org" });
            mockAdminDbGet.mockResolvedValueOnce({ empty: true, docs: [] });
            mockAdminDbAdd.mockResolvedValueOnce({ id: "watchlist_doc_1" });

            const res = await toggleWatchlistAction("player_789");

            expect(res.success).toBe(true);
            expect(res.added).toBe(true);
            expect(mockRequireUser).toHaveBeenCalledWith("talent");
            expect(mockRecordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
                actorId: "scout_user_1",
                actionType: "LOGISTICS_CREATE",
                entityType: "scouting_report",
                entityId: "player_789",
            }));
        });
    });
});
