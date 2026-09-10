import { test, expect } from '@playwright/test';

test.describe('Auth Flow Smoke Test', () => {
    test('should render login page correctly', async ({ page }) => {
        await page.goto('/login');
        await expect(page.locator('h1, h2')).toContainText(/Sign in|Login|Welcome/i);
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });
});
