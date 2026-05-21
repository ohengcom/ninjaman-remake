import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('Main Menu loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the canvas to be initialized
    await page.waitForSelector('#game-container canvas');
    
    // Wait an additional moment for Phaser to render the initial frame
    await page.waitForTimeout(2000);
    
    // Take a screenshot of the main game container
    const container = page.locator('#game-container');
    await expect(container).toHaveScreenshot('main-menu.png', {
      maxDiffPixelRatio: 0.05,
    });
  });
});
