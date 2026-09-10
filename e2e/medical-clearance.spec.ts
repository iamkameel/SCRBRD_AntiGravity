import { test, expect } from '@playwright/test';

test.describe('Medical Clearance Smoke Test', () => {
    test('should render medical staff dashboard', async ({ page }) => {
        await page.goto('/medical');
        await expect(page.locator('body')).toBeVisible();
        await expect(page.locator('h1, h2')).toContainText(/Medical|Injuries|Clearance/i);
    });
});
