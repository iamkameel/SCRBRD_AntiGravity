import { test, expect } from "@playwright/test";

test.describe("School Cricket Operating System Hub", () => {
    test("loads the operating system hub page and renders core engines", async ({ page }) => {
        await page.goto("/operating-system");

        // Check title banner
        await expect(page.locator("h1")).toContainText("SCRBRD School Cricket OS");
        await expect(page.getByText("CANONICAL OPERATING SYSTEM")).toBeVisible();

        // Check DLS Calculator
        await expect(page.getByText("DLS Method Rain Target Calculator")).toBeVisible();
        await expect(page.getByText("Revised DLS Target")).toBeVisible();

        // Check Bowler Workload Monitor
        await expect(page.getByText("Youth Bowler Workload Safeguard")).toBeVisible();
        await expect(page.getByText("K. Steyn")).toBeVisible();

        // Check Captain Cockpit View
        await expect(page.getByText("Captain Tactical Cockpit")).toBeVisible();
        await expect(page.getByText("Quick Field Presets")).toBeVisible();

        // Check Commercial View
        await expect(page.getByText("Commercial & Sponsorship Revenue Hub")).toBeVisible();
        await expect(page.getByText("First National Bank (FNB)")).toBeVisible();

        // Check Multi-Sport Engine
        await expect(page.getByText("SCRBRD Multi-Sport Expansion Engine")).toBeVisible();
        await expect(page.getByText("Rugby 15s OS")).toBeVisible();

        // Check Parent Portal
        await expect(page.getByText("Parent & Family Live Match Portal")).toBeVisible();
        await expect(page.getByText("Joshua Patel (U15A)")).toBeVisible();

        // Check Historical Archive Vault
        await expect(page.getByText("Institutional Archival & Historical Record Vault")).toBeVisible();
        await expect(page.getByText("EST. 1953 CENTENARY VAULT")).toBeVisible();
    });

    test("triggers DRS Review modal and closes it", async ({ page }) => {
        await page.goto("/operating-system");

        // Click Trigger DRS Review button
        await page.click("button:has-text('Trigger DRS Review')");

        // Check DRS overlay is visible
        await expect(page.getByText("DRS Decision Review System")).toBeVisible();

        // Confirm decision
        await page.click("button:has-text('Confirm OUT (3/3 Red)')");

        // Modal should close
        await expect(page.getByText("DRS Decision Review System")).not.toBeVisible();
    });
});
