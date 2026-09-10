import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '../userService';

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
    default: {
        apiKey: 'mock-api-key',
    },
    db: {},
    auth: {}
}));

vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    doc: vi.fn(),
    getDocs: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    serverTimestamp: vi.fn(() => new Date())
}));

describe('UserService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getUsers', () => {
        it('should be a function', () => {
            expect(typeof UserService.getUsers).toBe('function');
        });

        it('should return an array', async () => {
            const { getDocs } = await import('firebase/firestore');
            vi.mocked(getDocs).mockResolvedValue({
                docs: []
            } as any);

            const users = await UserService.getUsers();
            expect(Array.isArray(users)).toBe(true);
        });
    });

    describe('getUser', () => {
        it('should be a function', () => {
            expect(typeof UserService.getUser).toBe('function');
        });

        it('should accept a uid parameter', () => {
            expect(UserService.getUser.length).toBe(1);
        });
    });

    describe('updateUser', () => {
        it('should be a function', () => {
            expect(typeof UserService.updateUser).toBe('function');
        });

        it('should accept uid and data parameters', () => {
            expect(UserService.updateUser.length).toBe(2);
        });
    });

    describe('deleteUser', () => {
        it('should be a function', () => {
            expect(typeof UserService.deleteUser).toBe('function');
        });

        it('should accept a uid parameter', () => {
            expect(UserService.deleteUser.length).toBe(1);
        });
    });

    describe('inviteUser', () => {
        it('should be a function', () => {
            expect(typeof UserService.inviteUser).toBe('function');
        });

        it('should accept email, role, and optional invitedBy parameters', () => {
            expect(UserService.inviteUser.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('getPendingInvitations', () => {
        it('should be a function', () => {
            expect(typeof UserService.getPendingInvitations).toBe('function');
        });

        it('should return an array', async () => {
            const { getDocs } = await import('firebase/firestore');
            vi.mocked(getDocs).mockResolvedValue({
                docs: []
            } as any);

            const invitations = await UserService.getPendingInvitations();
            expect(Array.isArray(invitations)).toBe(true);
        });
    });
});
