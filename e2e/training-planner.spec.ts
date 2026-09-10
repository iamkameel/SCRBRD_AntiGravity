import { test, expect } from '@playwright/test';

test.describe('Training Session Planner Smoke Test', () => {
    test('should render training planner and drill taxonomy library', async ({ page }) => {
        await page.goto('/development/training');
        await expect(page.locator('h1')).toContainText(/Training Session Planner/i);
        await expect(page.locator('h2:has-text("Drill Taxonomy Library")')).toBeVisible();
        await expect(page.locator('button:has-text("Save Training Plan")')).toBeVisible();
    });
});
