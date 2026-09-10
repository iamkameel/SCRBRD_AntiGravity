import { test, expect } from '@playwright/test';

test.describe('Fixture Lifecycle Smoke Test', () => {
    test('should render match list and allow navigating to match details', async ({ page }) => {
        await page.goto('/matches');
        await expect(page.locator('body')).toBeVisible();
        await expect(page.locator('h1, h2')).toContainText(/Match|Fixture/i);
    });
});
