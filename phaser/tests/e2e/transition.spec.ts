import { test, expect } from '@playwright/test';

test('Transition Test', async ({ page }) => {
  test.setTimeout(90000);
  const runtimeErrors: string[] = [];
  page.on('console', msg => console.log(`[Browser Console]: ${msg.text()}`));
  page.on('pageerror', error => {
    console.error(`[Browser Error]: ${error.message}`);
    runtimeErrors.push(error.message);
  });
  
  await page.goto('/');
  
  await page.waitForSelector('#game-container canvas');
  await page.waitForTimeout(5000);

  await page.evaluate(async () => {
    if (!window.startGameForTests) throw new Error('Missing startGameForTests hook');
    await window.startGameForTests();
  });

  await expect.poll(async () => page.evaluate(() => {
    if (!window.game) return false;
    return window.game.scene.isActive('GameScene');
  }), { timeout: 10000 }).toBe(true);

  const overlay = page.locator('.game-ui-overlay');
  await expect(overlay).toBeVisible({ timeout: 45000 });
  
  await page.evaluate(() => {
    if (!window.game) throw new Error('Missing game test hook');
    const game = window.game;
    const gameScene = game.scene.scenes.find((s: any) => s.scene.key === 'GameScene');
    if (gameScene && gameScene.player) {
      gameScene.player.setPosition(gameScene.mapWidth - 150, 200);
    }
  });

  await page.keyboard.down('KeyD');
  await page.waitForTimeout(3000); // 3 seconds should trigger transition
  await page.keyboard.up('KeyD');
  
  await expect.poll(async () => page.evaluate(() => {
    if (!window.game) throw new Error('Missing game test hook');
    const game = window.game;
    const gameScene = game.scene.scenes.find((s: any) => s.scene.key === 'GameScene');
    return gameScene ? gameScene.currentLevel : -1;
  }), { timeout: 10000 }).toBe(2);
  
  expect(runtimeErrors).toEqual([]);
});
