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
    await page.waitForTimeout(3000);

    const overlay = page.locator('.game-ui-overlay');
    const canvas = page.locator('#game-container canvas');

    console.log('--- ATTEMPTING TO START GAME ---');
    
    // Proactive canvas click with force: true to guarantee browser and keyboard focus!
    for (let attempt = 0; attempt < 5; attempt++) {
      await canvas.click({ force: true });
      await page.waitForTimeout(200);
      await page.keyboard.press('Space');
      await page.waitForTimeout(1000);
      if (await overlay.isVisible()) break;
    }

    await expect(overlay).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#hud-integrity-bar')).toBeVisible();
    await expect(page.locator('#hud-score-value')).toHaveText(/\d+/);
    await expect(page.locator('#hud-sector-display')).toContainText('SECTOR');

    console.log('--- STARTING BUTTON-MASH PLAYGROUND SIMULATION ---');
    
    // Walk a bit
    await page.keyboard.down('D');
    await page.waitForTimeout(1000);
    await page.keyboard.up('D');
    
    // Mash J 6 times very quickly to trigger 4th and 5th hits in recovery
    console.log('Mashing J key...');
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('J');
      await page.waitForTimeout(80);
    }
    
    await page.waitForTimeout(500);

    // Walk a bit more and mash again
    await page.keyboard.down('D');
    await page.waitForTimeout(1500);
    await page.keyboard.up('D');

    console.log('Mashing J key again...');
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('J');
      await page.waitForTimeout(80);
    }

    await page.waitForTimeout(1000);
    
    console.log('--- ENDING BUTTON-MASH PLAYGROUND SIMULATION ---');
    expect(runtimeErrors).toEqual([]);
  });
});
