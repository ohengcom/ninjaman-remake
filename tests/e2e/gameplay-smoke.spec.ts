import { expect, test } from '@playwright/test';

test.describe('Gameplay Smoke', () => {
  test('enters gameplay and handles core inputs without runtime errors', async ({ page }) => {
    test.setTimeout(90000);
    const runtimeErrors: string[] = [];

    page.on('pageerror', (error) => {
      console.error('Browser runtime error caught:', error.message, error.stack);
      runtimeErrors.push(error.message + '\n' + (error.stack || ''));
    });
    page.on('console', (message) => {
      if (message.type() === 'error') {
        console.error('Browser console error:', message.text());
        runtimeErrors.push(message.text());
      } else {
        console.log('Browser console:', message.text());
      }
    });

    await page.goto('/');
    await page.waitForSelector('#game-container canvas');
    await page.waitForTimeout(5000);

    const overlay = page.locator('.game-ui-overlay');

    // Proven startup loop that guarantees entry into GameScene
    for (let attempt = 0; attempt < 10; attempt++) {
      await page.keyboard.press('Space');
      await page.locator('#game-container').click();
      await page.waitForTimeout(1000);
      if (await overlay.isVisible()) break;
    }

    await expect(overlay).toBeVisible({ timeout: 45000 });
    await expect(page.locator('#hud-integrity-bar')).toBeVisible();
    await expect(page.locator('#hud-score-value')).toHaveText(/\d+/);
    await expect(page.locator('#hud-sector-display')).toContainText('SECTOR');

    // Hold D to walk right, press J to attack, repeat to hit crates/barrels/enemies
    console.log('--- STARTING PLAYGROUND SIMULATION ---');
    
    // Phase 1: Walk to right and swing
    await page.locator('#game-container').click();
    await page.keyboard.down('D');
    await page.waitForTimeout(1500);
    await page.keyboard.up('D');
    
    // Press J multiple times (combo)
    await page.keyboard.press('J');
    await page.waitForTimeout(150);
    await page.keyboard.press('J');
    await page.waitForTimeout(150);
    await page.keyboard.press('J');
    await page.waitForTimeout(300);

    // Phase 2: Walk right further
    await page.keyboard.down('D');
    await page.waitForTimeout(2000);
    await page.keyboard.up('D');

    // Press J and L
    await page.keyboard.press('J');
    await page.waitForTimeout(150);
    await page.keyboard.press('L');
    await page.waitForTimeout(300);

    // Phase 3: Walk to the end of level (Sector 1 mapWidth = 5120)
    // Hold D for a long duration to walk to x > 4470 (level portal)
    await page.keyboard.down('D');
    await page.waitForTimeout(6500);
    await page.keyboard.up('D');

    // Wait for level transition fade out & restart to complete
    await page.waitForTimeout(3000);

    await expect(page.locator('#game-container canvas')).toBeVisible();
    
    // Verify we have transitioned (either Sector 2 HUD is loaded or no white screen/errors occurred)
    console.log('--- ENDING PLAYGROUND SIMULATION ---');
    expect(runtimeErrors).toEqual([]);
  });
});
