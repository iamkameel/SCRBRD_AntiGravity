import { test, expect } from '@playwright/test';

test.describe('Skill Matrix Assessment Smoke Test', () => {
    test('should render skill assessment page and domain tabs', async ({ page }) => {
        await page.goto('/development/assessments');
        await expect(page.locator('h1')).toContainText(/Skill Matrix Assessment/i);
        await expect(page.locator('button:has-text("Batting")')).toBeVisible();
        await expect(page.locator('button:has-text("Bowling")')).toBeVisible();
        await expect(page.locator('button:has-text("Save Assessment")')).toBeVisible();
    });
});
