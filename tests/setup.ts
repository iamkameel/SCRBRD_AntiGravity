import '@testing-library/jest-dom';
import { vi, beforeAll, afterAll } from 'vitest';

// Mock matchMedia for JSDOM
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock Firebase Auth for testing
global.fetch = global.fetch || (() => Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
})) as any;

// Suppress console errors in tests unless needed
const originalError = console.error;
beforeAll(() => {
    console.error = (...args: any[]) => {
        if (
            typeof args[0] === 'string' &&
            (args[0].includes('Warning: ReactDOM.render') ||
                args[0].includes('Not implemented: HTMLFormElement.prototype.submit'))
        ) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});

// Mock DataConnect
vi.mock('@/lib/dataconnect', () => ({
    dc: {
        _app: {},
        _config: {}
    },
    isDataConnectEnabled: vi.fn(() => false)
}));

// Mock generated SDK
vi.mock('@/generated/dataconnect', () => ({
    connectorConfig: {
        service: 'scrbrd-service',
        location: 'us-central1',
        connector: 'default'
    },
    listPeople: vi.fn(() => Promise.resolve({ data: { people: [] } })),
    getPerson: vi.fn(() => Promise.resolve({ data: { person: null } })),
    createPerson: vi.fn(() => Promise.resolve({ data: { create_person: {} } })),
    deletePerson: vi.fn(() => Promise.resolve({ data: { delete_person: {} } })),
    listPeopleRef: vi.fn(),
}));
