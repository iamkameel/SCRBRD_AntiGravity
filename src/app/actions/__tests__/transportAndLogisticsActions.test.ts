import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocks
const mockRequireUser = vi.fn();
const mockAdminDbCollectionAdd = vi.fn();
const mockAdminDbDocUpdate = vi.fn();
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
            add: (data: any) => mockAdminDbCollectionAdd(collName, data),
            doc: (id: string) => ({
                update: (data: any) => mockAdminDbDocUpdate(collName, id, data),
            }),
            where: () => ({
                orderBy: () => ({
                    get: () => mockAdminDbGet(collName),
                }),
                get: () => mockAdminDbGet(collName),
            }),
            orderBy: () => ({
                get: () => mockAdminDbGet(collName),
            }),
            get: () => mockAdminDbGet(collName),
        }),
    },
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

import {
    updateVehicleStatusAction,
    createTripAction,
    updateTripStatusAction,
    updatePassengerBoardingAction,
} from "../transportActions";

import {
    createEquipmentAction,
    updateEquipmentAction,
} from "../equipmentActions";

describe("Transport & Logistics Server Actions Security", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Vehicle & Transport Actions", () => {
        it("updates vehicle status with adminDb, requireUser('logistics'), and audit log", async () => {
            mockRequireUser.mockResolvedValueOnce({ uid: "logistics_admin", email: "transport@school.edu" });
            mockAdminDbDocUpdate.mockResolvedValueOnce({});

            const result = await updateVehicleStatusAction("veh_100", "Maintenance", 85);

            expect(result.success).toBe(true);
            expect(mockRequireUser).toHaveBeenCalledWith("logistics");
            expect(mockAdminDbDocUpdate).toHaveBeenCalledWith("vehicles", "veh_100", expect.objectContaining({
                status: "Maintenance",
                currentLoad: 85,
                updatedBy: "logistics_admin",
            }));
            expect(mockRecordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
                actorId: "logistics_admin",
                actionType: "LOGISTICS_UPDATE",
                entityType: "vehicle",
                entityId: "veh_100",
            }));
        });

        it("creates transport trip with adminDb, requireUser('logistics'), and audit log", async () => {
            mockRequireUser.mockResolvedValueOnce({ uid: "logistics_admin", email: "transport@school.edu" });
            mockAdminDbCollectionAdd.mockResolvedValueOnce({ id: "trip_200" });

            const result = await createTripAction({
                destination: "St John's Oval",
                vehicleId: "veh_100",
                fixture: "1st XI vs St John's",
                status: "Scheduled",
            });

            expect(result.success).toBe(true);
            expect(mockRequireUser).toHaveBeenCalledWith("logistics");
            expect(mockAdminDbCollectionAdd).toHaveBeenCalledWith("transport_trips", expect.objectContaining({
                destination: "St John's Oval",
                vehicleId: "veh_100",
                createdBy: "logistics_admin",
            }));
            expect(mockRecordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
                actorId: "logistics_admin",
                actionType: "LOGISTICS_CREATE",
                entityType: "transport_trip",
                entityId: "trip_200",
            }));
        });

        it("updates trip status with adminDb, requireUser('logistics'), and audit log", async () => {
            mockRequireUser.mockResolvedValueOnce({ uid: "logistics_admin", email: "transport@school.edu" });
            mockAdminDbDocUpdate.mockResolvedValueOnce({});

            const result = await updateTripStatusAction("trip_200", "In Transit", "1st XI vs St John's");

            expect(result.success).toBe(true);
            expect(mockRequireUser).toHaveBeenCalledWith("logistics");
            expect(mockAdminDbDocUpdate).toHaveBeenCalledWith("transport_trips", "trip_200", expect.objectContaining({
                status: "In Transit",
                updatedBy: "logistics_admin",
            }));
            expect(mockRecordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
                actorId: "logistics_admin",
                actionType: "LOGISTICS_UPDATE",
                entityType: "transport_trip",
                entityId: "trip_200",
            }));
        });

        it("updates passenger boarding status with adminDb, requireUser('logistics'), and audit log", async () => {
            mockRequireUser.mockResolvedValueOnce({ uid: "logistics_admin", email: "transport@school.edu" });
            mockAdminDbDocUpdate.mockResolvedValueOnce({});

            const result = await updatePassengerBoardingAction("p_1", "Boarded", "trip_200");

            expect(result.success).toBe(true);
            expect(mockRequireUser).toHaveBeenCalledWith("logistics");
            expect(mockAdminDbDocUpdate).toHaveBeenCalledWith("trip_passengers", "p_1", expect.objectContaining({
                boardingStatus: "Boarded",
                updatedBy: "logistics_admin",
            }));
            expect(mockRecordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
                actorId: "logistics_admin",
                actionType: "LOGISTICS_UPDATE",
                entityType: "transport_trip",
                entityId: "trip_200",
            }));
        });
    });

    describe("Equipment Asset Actions", () => {
        it("creates equipment asset with adminDb, requireUser('logistics'), and audit log", async () => {
            mockRequireUser.mockResolvedValueOnce({ uid: "logistics_admin", email: "equip@school.edu" });
            mockAdminDbCollectionAdd.mockResolvedValueOnce({ id: "eq_500" });

            const formData = new FormData();
            formData.set("name", "Kookaburra Match Balls");
            formData.set("category", "Balls");
            formData.set("quantity", "24");
            formData.set("condition", "Excellent");
            formData.set("location", "Main Pavilion Locker");

            const result = await createEquipmentAction({}, formData);

            expect(result.success).toBe(true);
            expect(mockRequireUser).toHaveBeenCalledWith("logistics");
            expect(mockAdminDbCollectionAdd).toHaveBeenCalledWith("equipment", expect.objectContaining({
                name: "Kookaburra Match Balls",
                quantity: "24",
                createdBy: "logistics_admin",
            }));
            expect(mockRecordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
                actorId: "logistics_admin",
                actionType: "LOGISTICS_CREATE",
                entityType: "equipment",
                entityId: "eq_500",
            }));
        });

        it("updates equipment asset with adminDb, requireUser('logistics'), and audit log", async () => {
            mockRequireUser.mockResolvedValueOnce({ uid: "logistics_admin", email: "equip@school.edu" });
            mockAdminDbDocUpdate.mockResolvedValueOnce({});

            const formData = new FormData();
            formData.set("name", "Kookaburra Match Balls");
            formData.set("category", "Balls");
            formData.set("quantity", "18");
            formData.set("condition", "Fair");
            formData.set("location", "Main Pavilion Locker");

            const result = await updateEquipmentAction("eq_500", {}, formData);

            expect(result.success).toBe(true);
            expect(mockRequireUser).toHaveBeenCalledWith("logistics");
            expect(mockAdminDbDocUpdate).toHaveBeenCalledWith("equipment", "eq_500", expect.objectContaining({
                name: "Kookaburra Match Balls",
                quantity: "18",
                updatedBy: "logistics_admin",
            }));
            expect(mockRecordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
                actorId: "logistics_admin",
                actionType: "LOGISTICS_UPDATE",
                entityType: "equipment",
                entityId: "eq_500",
            }));
        });
    });
});
