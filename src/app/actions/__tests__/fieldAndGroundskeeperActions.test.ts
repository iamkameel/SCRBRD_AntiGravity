import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocks
const mockRequireUser = vi.fn();
const mockAdminDbCollectionAdd = vi.fn();
const mockAdminDbDocUpdate = vi.fn();
const mockAdminDbDocDelete = vi.fn();
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
            add: (data: any) => mockAdminDbCollectionAdd(collName, data),
            doc: (id: string) => ({
                update: (data: any) => mockAdminDbDocUpdate(collName, id, data),
                delete: () => mockAdminDbDocDelete(collName, id),
            }),
        }),
    },
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    redirect: vi.fn(),
}));

import {
    createFieldAction,
    updateFieldAction,
    deleteFieldAction,
    logGroundStatusAction,
    upsertMaintenanceTaskAction,
} from "../fieldActions";
import {
    createGroundskeeperAction,
    updateGroundskeeperAction,
} from "../groundskeeperActions";

describe("Facilities, Fields & Groundskeeper Server Actions Security", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Field Actions", () => {
        it("creates field facility with adminDb, requireUser('fields'), and audit log", async () => {
            mockRequireUser.mockResolvedValueOnce({ uid: "facility_user_1", email: "fields@school.edu" });
            mockAdminDbCollectionAdd.mockResolvedValueOnce({ id: "field_doc_100" });

            const formData = new FormData();
            formData.set("name", "Oval A");
            formData.set("location", "Main Campus");
            formData.set("address", "123 School Lane");
            formData.set("pitchType", "Natural Turf");
            formData.set("scoreboardType", "Electronic LED");

            const result = await createFieldAction({}, formData);

            expect(result.success).toBe(true);
            expect(mockRequireUser).toHaveBeenCalledWith("fields");
            expect(mockAdminDbCollectionAdd).toHaveBeenCalledWith("fields", expect.objectContaining({
                name: "Oval A",
                pitchType: "Natural Turf",
                createdBy: "facility_user_1",
            }));
            expect(mockRecordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
                actorId: "facility_user_1",
                actionType: "LOGISTICS_CREATE",
                entityType: "field",
                entityId: "field_doc_100",
            }));
        });

        it("updates field facility with adminDb, requireUser('fields'), and audit log", async () => {
            mockRequireUser.mockResolvedValueOnce({ uid: "facility_user_1", email: "fields@school.edu" });
            mockAdminDbDocUpdate.mockResolvedValueOnce({});

            const formData = new FormData();
            formData.set("name", "Oval A (Renovated)");
            formData.set("location", "Main Campus");
            formData.set("pitchType", "Natural Turf");
            formData.set("scoreboardType", "Electronic LED");

            const result = await updateFieldAction("field_doc_100", {}, formData);

            expect(result.success).toBe(true);
            expect(mockRequireUser).toHaveBeenCalledWith("fields");
            expect(mockAdminDbDocUpdate).toHaveBeenCalledWith("fields", "field_doc_100", expect.objectContaining({
                name: "Oval A (Renovated)",
                updatedBy: "facility_user_1",
            }));
            expect(mockRecordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
                actorId: "facility_user_1",
                actionType: "LOGISTICS_UPDATE",
                entityType: "field",
                entityId: "field_doc_100",
            }));
        });

        it("deletes field facility with adminDb and audit log", async () => {
            mockRequireUser.mockResolvedValueOnce({ uid: "facility_user_1", email: "fields@school.edu" });
            mockAdminDbDocDelete.mockResolvedValueOnce({});

            const result = await deleteFieldAction("field_doc_100");

            expect(result.success).toBe(true);
            expect(mockRequireUser).toHaveBeenCalledWith("fields");
            expect(mockAdminDbDocDelete).toHaveBeenCalledWith("fields", "field_doc_100");
            expect(mockRecordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
                actorId: "facility_user_1",
                actionType: "LOGISTICS_DELETE",
                entityType: "field",
                entityId: "field_doc_100",
            }));
        });
    });

    describe("Ground Status Actions", () => {
        it("logs ground status with adminDb, requireUser('fields'), and audit log", async () => {
            mockRequireUser.mockResolvedValueOnce({ uid: "gk_user_1", email: "gk@school.edu" });
            mockAdminDbCollectionAdd.mockResolvedValueOnce({ id: "status_log_1" });
            mockAdminDbDocUpdate.mockResolvedValueOnce({});

            const result = await logGroundStatusAction({
                fieldId: "field_doc_100",
                conditionStatus: "EXCELLENT",
                pitchReadiness: "FIT",
            } as any);

            expect(result.success).toBe(true);
            expect(mockRequireUser).toHaveBeenCalledWith("fields");
            expect(mockAdminDbCollectionAdd).toHaveBeenCalledWith("ground_status_logs", expect.objectContaining({
                fieldId: "field_doc_100",
                conditionStatus: "EXCELLENT",
                loggedBy: "gk_user_1",
            }));
            expect(mockRecordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
                actorId: "gk_user_1",
                actionType: "READINESS_OVERRIDE",
                entityType: "ground_readiness",
                entityId: "status_log_1",
            }));
        });
    });

    describe("Maintenance Task Actions", () => {
        it("creates maintenance task with adminDb, requireUser('fields'), and audit log", async () => {
            mockRequireUser.mockResolvedValueOnce({ uid: "facility_user_1", email: "fields@school.edu" });
            mockAdminDbCollectionAdd.mockResolvedValueOnce({ id: "maint_task_1" });

            const result = await upsertMaintenanceTaskAction({
                fieldId: "field_doc_100",
                title: "Heavy Roller Pitch",
                status: "PENDING",
            });

            expect(result.success).toBe(true);
            expect(mockRequireUser).toHaveBeenCalledWith("fields");
            expect(mockAdminDbCollectionAdd).toHaveBeenCalledWith("maintenance_tasks", expect.objectContaining({
                fieldId: "field_doc_100",
                title: "Heavy Roller Pitch",
                createdBy: "facility_user_1",
            }));
            expect(mockRecordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
                actorId: "facility_user_1",
                actionType: "LOGISTICS_CREATE",
                entityType: "maintenance_task",
                entityId: "maint_task_1",
            }));
        });
    });

    describe("Groundskeeper Profile Actions", () => {
        it("creates groundskeeper with adminDb, requireUser('logistics'), and audit log", async () => {
            mockRequireUser.mockResolvedValueOnce({ uid: "logistics_admin", email: "admin@school.edu" });
            mockAdminDbCollectionAdd.mockResolvedValueOnce({ id: "gk_person_1" });

            const formData = new FormData();
            formData.set("firstName", "Jack");
            formData.set("lastName", "Curator");
            formData.set("dateOfBirth", "1980-01-01");
            formData.set("email", "jack@curator.org");
            formData.set("experienceYears", "12");

            await createGroundskeeperAction({ success: false }, formData);

            expect(mockRequireUser).toHaveBeenCalledWith("logistics");
            expect(mockAdminDbCollectionAdd).toHaveBeenCalledWith("people", expect.objectContaining({
                firstName: "Jack",
                lastName: "Curator",
                role: "Grounds-Keeper",
                createdBy: "logistics_admin",
            }));
            expect(mockRecordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
                actorId: "logistics_admin",
                actionType: "LOGISTICS_CREATE",
                entityType: "groundskeeper",
                entityId: "gk_person_1",
            }));
        });

        it("updates groundskeeper with adminDb, requireUser('logistics'), and audit log", async () => {
            mockRequireUser.mockResolvedValueOnce({ uid: "logistics_admin", email: "admin@school.edu" });
            mockAdminDbDocUpdate.mockResolvedValueOnce({});

            const formData = new FormData();
            formData.set("firstName", "Jack");
            formData.set("lastName", "Curator");
            formData.set("dateOfBirth", "1980-01-01");
            formData.set("email", "jack@curator.org");
            formData.set("experienceYears", "13");

            await updateGroundskeeperAction("gk_person_1", { success: false }, formData);

            expect(mockRequireUser).toHaveBeenCalledWith("logistics");
            expect(mockAdminDbDocUpdate).toHaveBeenCalledWith("people", "gk_person_1", expect.objectContaining({
                firstName: "Jack",
                lastName: "Curator",
                updatedBy: "logistics_admin",
            }));
            expect(mockRecordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
                actorId: "logistics_admin",
                actionType: "LOGISTICS_UPDATE",
                entityType: "groundskeeper",
                entityId: "gk_person_1",
            }));
        });
    });
});
