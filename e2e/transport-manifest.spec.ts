import { test, expect } from '@playwright/test';

test.describe('Transport Hub Smoke Test', () => {
    test('should render transport management hub', async ({ page }) => {
        await page.goto('/transport');
        await expect(page.locator('body')).toBeVisible();
        await expect(page.locator('h1, h2')).toContainText(/Transport|Trips|Vehicles/i);
    });
});
