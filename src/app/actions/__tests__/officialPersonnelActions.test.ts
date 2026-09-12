import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocks
const mockRequireUser = vi.fn();
const mockAdminDbCollectionAdd = vi.fn();
const mockAdminDbDocUpdate = vi.fn();
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

import { createUmpireAction, updateUmpireAction } from "../umpireActions";
import { createScorerAction, updateScorerAction } from "../scorerActions";

describe("Official Personnel Server Actions Security", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Umpire Actions", () => {
        it("creates umpire with adminDb, requireUser('management'), and records audit log", async () => {
            mockRequireUser.mockResolvedValueOnce({ uid: "mgmt_user_1", email: "admin@school.edu" });
            mockAdminDbCollectionAdd.mockResolvedValueOnce({ id: "umpire_doc_100" });

            const formData = new FormData();
            formData.set("firstName", "David");
            formData.set("lastName", "Shepherd");
            formData.set("dateOfBirth", "1975-05-15");
            formData.set("email", "david@shepherd.org");
            formData.set("certificationLevel", "Level 3 Elite");
            formData.set("homeAssociation", "KZN Umpires Association");
            formData.set("yearsActive", "15");

            await createUmpireAction({ success: false }, formData);

            expect(mockRequireUser).toHaveBeenCalledWith("management");
            expect(mockAdminDbCollectionAdd).toHaveBeenCalledWith("people", expect.objectContaining({
                firstName: "David",
                lastName: "Shepherd",
                role: "Umpire",
                createdBy: "mgmt_user_1",
            }));
            expect(mockRecordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
                actorId: "mgmt_user_1",
                actionType: "STAFF_ASSIGNED",
                entityType: "umpire",
                entityId: "umpire_doc_100",
            }));
        });

        it("updates umpire with adminDb, requireUser('management'), and records audit log", async () => {
            mockRequireUser.mockResolvedValueOnce({ uid: "mgmt_user_1", email: "admin@school.edu" });
            mockAdminDbDocUpdate.mockResolvedValueOnce({});

            const formData = new FormData();
            formData.set("firstName", "David");
            formData.set("lastName", "Shepherd");
            formData.set("dateOfBirth", "1975-05-15");
            formData.set("email", "david@shepherd.org");
            formData.set("certificationLevel", "Level 3 Elite");
            formData.set("homeAssociation", "KZN Umpires Association");
            formData.set("yearsActive", "16");

            await updateUmpireAction("umpire_doc_100", { success: false }, formData);

            expect(mockRequireUser).toHaveBeenCalledWith("management");
            expect(mockAdminDbDocUpdate).toHaveBeenCalledWith("people", "umpire_doc_100", expect.objectContaining({
                firstName: "David",
                lastName: "Shepherd",
                updatedBy: "mgmt_user_1",
            }));
            expect(mockRecordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
                actorId: "mgmt_user_1",
                actionType: "STAFF_ASSIGNED",
                entityType: "umpire",
                entityId: "umpire_doc_100",
            }));
        });
    });

    describe("Scorer Actions", () => {
        it("creates scorer with adminDb, requireUser('management'), and records audit log", async () => {
            mockRequireUser.mockResolvedValueOnce({ uid: "mgmt_user_1", email: "admin@school.edu" });
            mockAdminDbCollectionAdd.mockResolvedValueOnce({ id: "scorer_doc_200" });

            const formData = new FormData();
            formData.set("firstName", "Sarah");
            formData.set("lastName", "Jenkins");
            formData.set("dateOfBirth", "1988-09-20");
            formData.set("email", "sarah@cricket.org");
            formData.set("certificationLevel", "Level 2");
            formData.set("preferredMethod", "Digital");
            formData.set("experienceYears", "8");

            await createScorerAction({ success: false }, formData);

            expect(mockRequireUser).toHaveBeenCalledWith("management");
            expect(mockAdminDbCollectionAdd).toHaveBeenCalledWith("people", expect.objectContaining({
                firstName: "Sarah",
                lastName: "Jenkins",
                role: "Scorer",
                createdBy: "mgmt_user_1",
            }));
            expect(mockRecordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
                actorId: "mgmt_user_1",
                actionType: "STAFF_ASSIGNED",
                entityType: "scorer",
                entityId: "scorer_doc_200",
            }));
        });

        it("updates scorer with adminDb, requireUser('management'), and records audit log", async () => {
            mockRequireUser.mockResolvedValueOnce({ uid: "mgmt_user_1", email: "admin@school.edu" });
            mockAdminDbDocUpdate.mockResolvedValueOnce({});

            const formData = new FormData();
            formData.set("firstName", "Sarah");
            formData.set("lastName", "Jenkins");
            formData.set("dateOfBirth", "1988-09-20");
            formData.set("email", "sarah@cricket.org");
            formData.set("certificationLevel", "Level 2");
            formData.set("preferredMethod", "Digital");
            formData.set("experienceYears", "9");

            await updateScorerAction("scorer_doc_200", { success: false }, formData);

            expect(mockRequireUser).toHaveBeenCalledWith("management");
            expect(mockAdminDbDocUpdate).toHaveBeenCalledWith("people", "scorer_doc_200", expect.objectContaining({
                firstName: "Sarah",
                lastName: "Jenkins",
                updatedBy: "mgmt_user_1",
            }));
            expect(mockRecordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
                actorId: "mgmt_user_1",
                actionType: "STAFF_ASSIGNED",
                entityType: "scorer",
                entityId: "scorer_doc_200",
            }));
        });
    });
});
