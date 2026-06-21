import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('Main Menu loads correctly', async ({ page }) => {
    const runtimeErrors: string[] = [];
    page.on('pageerror', (error) => runtimeErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') runtimeErrors.push(message.text());
    });

    await page.goto('/');
    
    // Wait for the canvas to be initialized
    await page.waitForSelector('#game-container canvas');
    
    // Wait an additional moment for Phaser to render the initial frame
    await page.waitForTimeout(2000);
    
    await expect(page.locator('#game-container canvas')).toBeVisible();
    await expect(page.locator('.game-ui-overlay')).toBeHidden();
    expect(runtimeErrors).toEqual([]);
  });
});
