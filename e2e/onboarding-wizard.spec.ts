import { test, expect } from '@playwright/test';

test.describe('Onboarding Wizard Smoke Test', () => {
    test('should complete 3-step onboarding flow', async ({ page }) => {
        await page.goto('/onboarding');
        await expect(page.locator('h2')).toContainText(/School/i);

        // Step 1: Fill School
        await page.fill('input[placeholder*="Saint Stithians"]', 'St Andrews College');
        await page.click('button:has-text("Continue")');

        // Step 2: Select Role
        await expect(page.locator('h2')).toContainText(/Role/i);
        await page.click('button:has-text("Continue")');

        // Step 3: Fill Team
        await expect(page.locator('h2')).toContainText(/Team/i);
        await page.fill('input[placeholder*="St Stithians 1st XI"]', 'St Andrews 1st XI');
        await page.click('button:has-text("Complete Setup")');

        // Step 4: Complete Screen
        await expect(page.locator('h2')).toContainText(/Setup Complete/i);
    });
});
