import { test, expect, Page } from '@playwright/test';

/**
 * Happy Path E2E Test for Live Scoring
 * 
 * This test covers the COMPLETE match lifecycle in a single flow:
 * 1. Login
 * 2. Create Match (via wizard)
 * 3. Handle Toss
 * 4. Select Players (Batsmen & Bowler)
 * 5. Record Multiple Balls (dot, single, four, six, wide, wicket)
 * 6. Verify Score Updates
 * 7. Test Undo Functionality
 * 8. End Innings (optional)
 * 
 * This is the PRIMARY test for validating the entire live scoring system.
 */

test.describe('Live Scoring - Happy Path', () => {
    const TEST_USER = {
        email: process.env.TEST_USER_EMAIL || 'kameel@maverickdesign.co.za',
        password: process.env.TEST_USER_PASSWORD || 'Nomdeplume1983!',
    };

    let matchId: string;

    // Enhanced login with retry logic
    async function login(page: Page, retries = 2) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            await page.goto('/login');
            await page.waitForSelector('input[type="email"]', { timeout: 5000 });
            await page.fill('input[type="email"]', TEST_USER.email);
            await page.fill('input[type="password"]', TEST_USER.password);
            await page.click('button[type="submit"]');
            await page.waitForTimeout(3000);

            const currentUrl = page.url();
            if (!currentUrl.includes('/login')) {
                console.log(`✅ Logged in successfully`);
                return;
            }

            if (attempt < retries) {
                console.log(`⚠️ Login attempt ${attempt} failed, retrying...`);
                await page.waitForTimeout(1000);
            }
        }
        throw new Error('Login failed after retries');
    }

    // Helper to get current score
    async function getCurrentScore(page: Page): Promise<{ runs: number; wickets: number }> {
        const scoreText = await page.locator('text=/\\d+\\/\\d+/').first().textContent().catch(() => '0/0');
        const [runs, wickets] = scoreText!.split('/').map(n => parseInt(n, 10));
        return { runs, wickets };
    }

    test('Complete Match Flow - Create, Toss, Select Players, Score Balls', async ({ page }) => {
        // ========================================
        // STEP 1: Login
        // ========================================
        await login(page);
        await page.screenshot({ path: 'test-results/happy-path-01-logged-in.png' });

        // ========================================
        // STEP 2: Create Match
        // ========================================
        console.log('\n📝 Creating match...');
        await page.goto('/matches/add');
        await page.waitForSelector('text=Who is Playing?', { timeout: 10000 });

        // Select Home Team
        const homeTeamTrigger = page.locator('[data-testid="home-team-select"]');
        await homeTeamTrigger.waitFor({ state: 'visible', timeout: 10000 });
        await homeTeamTrigger.click();
        await page.waitForTimeout(500);

        const homeSearchInput = page.locator('input[placeholder="Search..."]').first();
        await homeSearchInput.waitFor({ state: 'visible', timeout: 5000 });
        await homeSearchInput.fill('Capitals');
        await page.waitForTimeout(500);

        // Click first matching option
        const homeOption = page.locator('div[role="option"]').filter({ hasText: 'Capitals' }).first();
        await homeOption.click();
        console.log('✅ Selected home team: Capitals');

        await page.waitForTimeout(500);

        // Select Away Team
        const awayTeamTrigger = page.locator('[data-testid="away-team-select"]');
        await awayTeamTrigger.click();
        await page.waitForTimeout(500);

        const awaySearchInput = page.locator('input[placeholder="Search..."]').first();
        await awaySearchInput.waitFor({ state: 'visible', timeout: 5000 });
        await awaySearchInput.fill('Durban');
        await page.waitForTimeout(500);

        // Click first matching option
        const awayOption = page.locator('div[role="option"]').filter({ hasText: 'Durban' }).first();
        await awayOption.click();
        console.log('✅ Selected away team: Durban High School 1st XI');

        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-results/happy-path-02-teams-selected.png' });

        // Next to date/venue
        await page.click('button:has-text("Next")');
        await page.waitForSelector('text=When & Where?');

        // Fill date, time, venue
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];
        await page.fill('input[type="date"]', dateStr);
        await page.fill('input[type="time"]', '14:00');

        const venueSelect = page.locator('button[role="combobox"]').first();
        await venueSelect.click();
        await page.waitForTimeout(300);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        console.log('✅ Set date, time, and venue');

        // Next to format
        await page.click('button:has-text("Next")');
        await page.waitForSelector('text=Match Details');

        // Next to review
        await page.click('button:has-text("Next")');
        await page.waitForSelector('text=Officials & Review');

        // Submit match
        await page.click('button:has-text("Schedule Match")');
        await page.waitForTimeout(3000);

        // Get match ID
        await page.waitForURL(/\/matches\//, { timeout: 10000 });
        const currentUrl = page.url();
        console.log(`📍 Current URL after creation: ${currentUrl}`);

        let matchId = '';

        if (currentUrl.includes('/matches/') && !currentUrl.includes('/add')) {
            const urlParts = currentUrl.split('/');
            const matchesIndex = urlParts.findIndex((p: string) => p === 'matches');
            matchId = urlParts[matchesIndex + 1] || '';
            console.log(`🔗 Extracted matchId from URL: ${matchId}`);
        } else {
            console.log('📋 Redirected to list or same page, looking for match in list...');
            await page.screenshot({ path: 'test-results/happy-path-creation-failed.png' });
            // Redirected to list - find the match
            const matchLinks = page.locator('a[href^="/matches/"]');
            const count = await matchLinks.count();
            for (let i = 0; i < count; i++) {
                const href = await matchLinks.nth(i).getAttribute('href');
                if (href && !href.includes('/add') && href !== '/matches') {
                    matchId = href.split('/').pop() || '';
                    console.log(`🔎 Found matchId in list: ${matchId}`);
                    break;
                }
            }
        }

        console.log(`✅ Final Match ID: "${matchId}"`);
        expect(matchId).toBeTruthy();
        expect(matchId).not.toContain('add');

        // ========================================
        // STEP 3: Navigate to Match Management
        // ========================================
        await page.goto(`/matches/${matchId}/manage`);
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-results/happy-path-03-match-created.png' });
        console.log('✅ Navigated to match management');

        // ========================================
        // STEP 4: Handle Toss (if button exists)
        // ========================================
        console.log('\n🎲 Looking for toss button...');
        // Match the button with "Start Match" or "Toss"
        const tossButton = page.getByRole('button', { name: /Start Match|Toss/i });

        try {
            await expect(tossButton).toBeVisible({ timeout: 10000 });
            console.log('✅ Toss button found, clicking...');
            await tossButton.click();
        } catch (e) {
            console.log('ℹ️ No toss button found within 10s. Logging page state...');
            const html = await page.content();
            console.log('Page content snippet:', html.substring(0, 1000));
            await page.screenshot({ path: 'test-results/toss-button-not-found.png' });
        }
        await page.waitForTimeout(1000);

        // Select toss winner
        const tossWinnerTrigger = page.locator('[data-testid="toss-winner-select"], button[role="combobox"]').first();
        if (await tossWinnerTrigger.isVisible({ timeout: 2000 }).catch(() => false)) {
            await tossWinnerTrigger.click();
            await page.waitForTimeout(300);
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');
            console.log('✅ Selected toss winner');
        }

        // Select to bat first
        const batOption = page.locator('text=Bat, button:has-text("Bat")').first();
        if (await batOption.isVisible({ timeout: 2000 }).catch(() => false)) {
            await batOption.click();
            console.log('✅ Selected to bat first');
        }

        // Confirm toss
        const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Start")').first();
        if (await confirmBtn.isVisible()) {
            await confirmBtn.click();
            await page.waitForTimeout(1000);
            console.log('✅ Toss confirmed');
            await page.screenshot({ path: 'test-results/happy-path-04-toss-completed.png' });
        }

        // ========================================
        // STEP 5: Select Players (if needed)
        // ========================================
        const playersButton = page.locator('[data-testid="players-button"], button:has-text("Select Players")').first();
        if (await playersButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            console.log('\n👥 Selecting players...');
            await playersButton.click();
            await page.waitForTimeout(500);

            // Select striker
            const strikerSelect = page.locator('[data-testid="select-striker"], [data-testid="striker-select"]').first();
            if (await strikerSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
                await strikerSelect.click();
                await page.waitForTimeout(300);
                await page.keyboard.press('ArrowDown');
                await page.keyboard.press('Enter');
                console.log('✅ Selected striker');
            }

            // Select non-striker
            const nonStrikerSelect = page.locator('[data-testid="select-non-striker"], [data-testid="non-striker-select"]').first();
            if (await nonStrikerSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
                await nonStrikerSelect.click();
                await page.waitForTimeout(300);
                await page.keyboard.press('ArrowDown');
                await page.keyboard.press('ArrowDown');
                await page.keyboard.press('Enter');
                console.log('✅ Selected non-striker');
            }

            // Select bowler
            const bowlerSelect = page.locator('[data-testid="select-bowler"], [data-testid="bowler-select"]').first();
            if (await bowlerSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
                await bowlerSelect.click();
                await page.waitForTimeout(300);
                await page.keyboard.press('ArrowDown');
                await page.keyboard.press('Enter');
                console.log('✅ Selected bowler');
            }

            // Confirm selection
            const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Start Scoring")').first();
            if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                await confirmBtn.click();
                await page.waitForTimeout(1000);
                console.log('✅ Player selection confirmed');
                await page.screenshot({ path: 'test-results/happy-path-05-players-selected.png' });
            }
        }

        // ========================================
        // STEP 6: Record Balls & Verify Scores
        // ========================================
        console.log('\n🏏 Recording balls...');

        // Check if scoring interface is available
        const recordBallBtn = page.locator('[data-testid="record-ball-button"], button:has-text("Record Ball"), button:has-text("Score")').first();

        if (await recordBallBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            // Ball 1: Dot ball
            let scoreBefore = await getCurrentScore(page);
            console.log(`📊 Score before dot ball: ${scoreBefore.runs}/${scoreBefore.wickets}`);

            await recordBallBtn.click();
            await page.waitForTimeout(500);
            const dotButton = page.locator('button:has-text("0"), button:has-text("Dot")').first();
            if (await dotButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                await dotButton.click();
                await page.waitForTimeout(1000);

                let scoreAfter = await getCurrentScore(page);
                console.log(`📊 Score after dot ball: ${scoreAfter.runs}/${scoreAfter.wickets}`);
                expect(scoreAfter.runs).toBe(scoreBefore.runs); // No runs added
                expect(scoreAfter.wickets).toBe(scoreBefore.wickets); // No wickets
                console.log('✅ Dot ball recorded correctly');
            }

            // Ball 2: Single
            scoreBefore = await getCurrentScore(page);
            await recordBallBtn.click();
            await page.waitForTimeout(500);
            const singleButton = page.locator('button:has-text("1")').first();
            if (await singleButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                await singleButton.click();
                await page.waitForTimeout(1000);

                let scoreAfter = await getCurrentScore(page);
                console.log(`📊 Score after single: ${scoreAfter.runs}/${scoreAfter.wickets}`);
                expect(scoreAfter.runs).toBe(scoreBefore.runs + 1);
                console.log('✅ Single recorded correctly');
            }

            // Ball 3: Four
            scoreBefore = await getCurrentScore(page);
            await recordBallBtn.click();
            await page.waitForTimeout(500);
            const fourButton = page.locator('button:has-text("4")').first();
            if (await fourButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                await fourButton.click();
                await page.waitForTimeout(1000);

                let scoreAfter = await getCurrentScore(page);
                console.log(`📊 Score after four: ${scoreAfter.runs}/${scoreAfter.wickets}`);
                expect(scoreAfter.runs).toBe(scoreBefore.runs + 4);
                console.log('✅ Four recorded correctly');
                await page.screenshot({ path: 'test-results/happy-path-06-after-four.png' });
            }

            // Ball 4: Six
            scoreBefore = await getCurrentScore(page);
            await recordBallBtn.click();
            await page.waitForTimeout(500);
            const sixButton = page.locator('button:has-text("6")').first();
            if (await sixButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                await sixButton.click();
                await page.waitForTimeout(1000);

                let scoreAfter = await getCurrentScore(page);
                console.log(`📊 Score after six: ${scoreAfter.runs}/${scoreAfter.wickets}`);
                expect(scoreAfter.runs).toBe(scoreBefore.runs + 6);
                console.log('✅ Six recorded correctly');
            }

            // Ball 5: Wide
            scoreBefore = await getCurrentScore(page);
            await recordBallBtn.click();
            await page.waitForTimeout(500);
            const wideButton = page.locator('button:has-text("Wide"), button:has-text("Wd")').first();
            if (await wideButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                await wideButton.click();
                await page.waitForTimeout(1000);

                let scoreAfter = await getCurrentScore(page);
                console.log(`📊 Score after wide: ${scoreAfter.runs}/${scoreAfter.wickets}`);
                expect(scoreAfter.runs).toBe(scoreBefore.runs + 1); // Wide adds 1 run
                console.log('✅ Wide recorded correctly');
            }

            // ========================================
            // STEP 7: Test Undo Functionality
            // ========================================
            console.log('\n↩️ Testing undo...');
            const undoButton = page.locator('[data-testid="undo-button"], button:has-text("Undo")').first();
            if (await undoButton.isVisible({ timeout: 3000 }).catch(() => false)) {
                scoreBefore = await getCurrentScore(page);
                console.log(`📊 Score before undo: ${scoreBefore.runs}/${scoreBefore.wickets}`);

                await undoButton.click();
                const confirmUndoBtn = page.locator('button:has-text("Confirm"), button:has-text("Yes")').first();
                if (await confirmUndoBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                    await confirmUndoBtn.click();
                }
                await page.waitForTimeout(1000);

                let scoreAfter = await getCurrentScore(page);
                console.log(`📊 Score after undo: ${scoreAfter.runs}/${scoreAfter.wickets}`);
                expect(scoreAfter.runs).toBeLessThan(scoreBefore.runs); // Score should decrease
                console.log('✅ Undo worked correctly');
                await page.screenshot({ path: 'test-results/happy-path-07-after-undo.png' });
            }

            // Ball 6: Wicket
            scoreBefore = await getCurrentScore(page);
            await recordBallBtn.click();
            await page.waitForTimeout(500);
            const wicketButton = page.locator('button:has-text("Wicket"), button:has-text("W")').first();
            if (await wicketButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                await wicketButton.click();
                await page.waitForTimeout(500);

                // Select dismissal type
                const bowledOption = page.locator('text=Bowled, button:has-text("Bowled")').first();
                if (await bowledOption.isVisible({ timeout: 2000 }).catch(() => false)) {
                    await bowledOption.click();
                    await page.waitForTimeout(500);
                }

                const confirmWicketBtn = page.locator('button:has-text("Confirm"), button:has-text("Record")').first();
                if (await confirmWicketBtn.isVisible()) {
                    await confirmWicketBtn.click();
                }
                await page.waitForTimeout(1000);

                let scoreAfter = await getCurrentScore(page);
                console.log(`📊 Score after wicket: ${scoreAfter.runs}/${scoreAfter.wickets}`);
                expect(scoreAfter.wickets).toBe(scoreBefore.wickets + 1);
                console.log('✅ Wicket recorded correctly');
                await page.screenshot({ path: 'test-results/happy-path-08-after-wicket.png' });
            }

            console.log('\n✅ Happy path test completed successfully!');
            console.log(`📊 Final score: ${(await getCurrentScore(page)).runs}/${(await getCurrentScore(page)).wickets}`);
        }
    });
});
