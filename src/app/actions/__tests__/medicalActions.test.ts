import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocks
const mockRequireUser = vi.fn();
const mockAdminDbDocUpdate = vi.fn();
const mockRecordAuditLog = vi.fn();
const mockLogIncident = vi.fn();
const mockUpdateIncidentStatus = vi.fn();

vi.mock("@/lib/auth/session", () => ({
    requireUser: (role: string) => mockRequireUser(role),
}));

vi.mock("@/lib/services/auditService", () => ({
    recordAuditLog: (entry: any) => mockRecordAuditLog(entry),
}));

vi.mock("@/lib/firebase-admin", () => ({
    adminDb: {
        collection: (collName: string) => ({
            doc: (id: string) => ({
                update: (data: any) => mockAdminDbDocUpdate(collName, id, data),
            }),
        }),
    },
}));

vi.mock("@/lib/services/medicalService", () => ({
    medicalService: {
        getIncidents: vi.fn().mockResolvedValue([]),
        logIncident: (inc: any) => mockLogIncident(inc),
        updateIncidentStatus: (id: string, status: string) => mockUpdateIncidentStatus(id, status),
    },
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

import { logMedicalIncidentAction, updateMedicalStatusAction, updateMedicalPersonAction } from "../medicalActions";

describe("Medical Server Actions Security", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("logs medical incident with requireUser('medical') and records audit log", async () => {
        mockRequireUser.mockResolvedValueOnce({ uid: "user_doc_1", email: "doctor@school.edu" });
        mockLogIncident.mockResolvedValueOnce("med_inc_999");

        const incident = {
            personId: "player_123",
            personName: "Aidan Smith",
            type: "CONCUSSION / HIA",
            severity: "High" as const,
            status: "Reported" as const,
            description: "Head impact",
            reportedBy: "Dr. Van Der Merwe",
            reportedAt: "2026-09-12T14:00:00Z",
        };

        const id = await logMedicalIncidentAction(incident);

        expect(id).toBe("med_inc_999");
        expect(mockRequireUser).toHaveBeenCalledWith("medical");
        expect(mockRecordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
            actorId: "user_doc_1",
            actionType: "SECURITY_ALERT",
            entityType: "medical_incident",
            entityId: "med_inc_999",
        }));
    });

    it("updates medical status with requireUser('medical') and records audit log", async () => {
        mockRequireUser.mockResolvedValueOnce({ uid: "user_doc_1", email: "doctor@school.edu" });
        mockUpdateIncidentStatus.mockResolvedValueOnce(undefined);

        await updateMedicalStatusAction("med_inc_999", "Cleared", "Aidan Smith");

        expect(mockRequireUser).toHaveBeenCalledWith("medical");
        expect(mockUpdateIncidentStatus).toHaveBeenCalledWith("med_inc_999", "Cleared");
        expect(mockRecordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
            actorId: "user_doc_1",
            actionType: "LOGISTICS_UPDATE",
            entityType: "medical_incident",
            entityId: "med_inc_999",
        }));
    });

    it("updates medical person profile with adminDb and requireUser('medical')", async () => {
        mockRequireUser.mockResolvedValueOnce({ uid: "user_doc_1", email: "doctor@school.edu" });
        mockAdminDbDocUpdate.mockResolvedValueOnce({});

        const formData = new FormData();
        formData.set("firstName", "Mark");
        formData.set("lastName", "Taylor");
        formData.set("qualification", "MBChB Sports Med");
        formData.set("registrationNumber", "MP-1029384");
        formData.set("experienceYears", "12");

        const res = await updateMedicalPersonAction("person_physio_1", { success: false }, formData);

        expect(res.success).toBe(true);
        expect(mockRequireUser).toHaveBeenCalledWith("medical");
        expect(mockAdminDbDocUpdate).toHaveBeenCalledWith("people", "person_physio_1", expect.objectContaining({
            firstName: "Mark",
            lastName: "Taylor",
            updatedBy: "user_doc_1",
        }));
        expect(mockRecordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
            actorId: "user_doc_1",
            actionType: "LOGISTICS_UPDATE",
            entityType: "player",
            entityId: "person_physio_1",
        }));
    });
});
