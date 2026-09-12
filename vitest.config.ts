import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        // React 19's production build has no `act`, so RTL tests break if the
        // shell exports NODE_ENV=production. Force the test build regardless.
        env: { NODE_ENV: 'test' },
        setupFiles: ['./tests/setup.ts'],
        exclude: ['**/e2e/**', '**/node_modules/**', '**/dist/**', '**/cypress/**', '**/.{idea,git,cache,output,temp}/**'],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
});

