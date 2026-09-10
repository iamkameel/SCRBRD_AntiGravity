import { test, expect } from '@playwright/test';

test.describe('Squad Selection Smoke Test', () => {
    test('should navigate to team directory and squad hub', async ({ page }) => {
        await page.goto('/teams');
        await expect(page.locator('body')).toBeVisible();
        await expect(page.locator('h1, h2')).toContainText(/Team|Directory|Squad/i);
    });
});
