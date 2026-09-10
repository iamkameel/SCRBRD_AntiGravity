import { test, expect } from '@playwright/test';

test.describe('Transport Hub & Manifest E2E Suite', () => {
    test('should render transport hub with vehicles and trips', async ({ page }) => {
        await page.goto('/transport');
        await expect(page.locator('body')).toBeVisible();
        await expect(page.locator('h1, h2, h3')).toContainText(/Transport|Trips|Vehicles|Logistics/i);
    });

    test('should allow filtering or viewing trip manifests', async ({ page }) => {
        await page.goto('/transport');
        const manifestSection = page.locator('text=/Manifest|Passenger|Route|Bus|Van/i');
        await expect(manifestSection.first()).toBeVisible();
    });
});
