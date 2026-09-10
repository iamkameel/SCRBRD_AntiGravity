import { test, expect } from '@playwright/test';

test.describe('Player Profile Smoke Test', () => {
    test('should render players list and profile views', async ({ page }) => {
        await page.goto('/players');
        await expect(page.locator('body')).toBeVisible();
        await expect(page.locator('h1, h2')).toContainText(/Player|Directory|Profile/i);
    });
});
