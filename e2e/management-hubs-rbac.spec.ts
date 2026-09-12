import { test, expect } from '@playwright/test';

test.describe('Secured Management Hubs E2E Suite', () => {
    test('should render fields management hub', async ({ page }) => {
        await page.goto('/fields');
        await expect(page.locator('body')).toBeVisible();
        await expect(page.locator('body')).toContainText(/Field|Ground|Pitch|Facility|Maintenance/i);
    });

    test('should render transport hub', async ({ page }) => {
        await page.goto('/transport');
        await expect(page.locator('body')).toBeVisible();
        await expect(page.locator('body')).toContainText(/Transport|Trips|Vehicles|Logistics/i);
    });

    test('should render medical staff dashboard', async ({ page }) => {
        await page.goto('/medical');
        await expect(page.locator('body')).toBeVisible();
        await expect(page.locator('body')).toContainText(/Medical|Injuries|Clearance/i);
    });

    test('should render scouting hub', async ({ page }) => {
        await page.goto('/scouting');
        await expect(page.locator('body')).toBeVisible();
        await expect(page.locator('body')).toContainText(/Scouting|Reports|Watchlist|Talent/i);
    });

    test('should render personnel and official assignments hub', async ({ page }) => {
        await page.goto('/people');
        await expect(page.locator('body')).toBeVisible();
        await expect(page.locator('body')).toContainText(/Personnel|People|Staff|Official|Role|Director/i);
    });

    test('should render equipment logistics hub', async ({ page }) => {
        await page.goto('/equipment');
        await expect(page.locator('body')).toBeVisible();
        await expect(page.locator('body')).toContainText(/Equipment|Asset|Logistics|Inventory/i);
    });
});
