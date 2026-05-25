import { expect, test } from '@playwright/test';

test.describe('Gameplay Smoke', () => {
  test('enters gameplay and handles core inputs without runtime errors', async ({ page }) => {
    const runtimeErrors: string[] = [];

    page.on('pageerror', (error) => {
      runtimeErrors.push(error.message);
    });
    page.on('console', (message) => {
      if (message.type() === 'error') {
        runtimeErrors.push(message.text());
      }
    });

    await page.goto('/');
    await page.waitForSelector('#game-container canvas');
    await page.waitForTimeout(2500);
    const overlay = page.locator('.game-ui-overlay');
    for (let attempt = 0; attempt < 5; attempt++) {
      await page.keyboard.press('Space');
      await page.locator('#game-container').click();
      await page.waitForTimeout(1000);
      if (await overlay.isVisible()) break;
    }

    await expect(overlay).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#hud-integrity-bar')).toBeVisible();
    await expect(page.locator('#hud-score-value')).toHaveText(/\d+/);
    await expect(page.locator('#hud-sector-display')).toContainText('SECTOR');

    await page.keyboard.down('D');
    await page.waitForTimeout(250);
    await page.keyboard.up('D');
    await page.keyboard.press('Space');
    await page.keyboard.press('J');
    await page.keyboard.press('L');
    await page.keyboard.down('K');
    await page.waitForTimeout(100);
    await page.keyboard.up('K');

    await page.keyboard.press('Escape');
    await expect(page.locator('#menu-pause-overlay')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#menu-pause-overlay')).toBeHidden();

    await expect(page.locator('#game-container canvas')).toBeVisible();
    expect(runtimeErrors).toEqual([]);
  });
});
