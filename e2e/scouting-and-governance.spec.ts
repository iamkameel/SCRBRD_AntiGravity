import { test, expect } from '@playwright/test';

test.describe('System Architect Governance & Scouting E2E Workflows', () => {
    test('System Architect telemetry page loads governance metrics', async ({ page }) => {
        await page.goto('/architect');

        // Check main title and status header
        await expect(page.locator('h1')).toContainText(/SYSTEM ARCHITECT/i);
        await expect(page.getByText(/SCRBRD OS 6-Engine Core Status Matrix/i)).toBeVisible();
        await expect(page.getByText(/Identity & Role Engine/i)).toBeVisible();
    });

    test('Scouting Dashboard loads talent identification cockpit', async ({ page }) => {
        await page.goto('/scouting');

        // Check scouting header and radar visualization
        await expect(page.getByText(/Scouting & Regional Talent Engine/i)).toBeVisible();
    });
});
