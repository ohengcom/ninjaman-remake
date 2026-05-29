import { test, expect } from '@playwright/test';

test('Transition Test', async ({ page }) => {
  page.on('console', msg => console.log(`[Browser Console]: ${msg.text()}`));
  page.on('pageerror', error => console.error(`[Browser Error]: ${error.message}`));
  
  console.log("Navigating to local dev server...");
  await page.goto('http://localhost:3000');
  
  await page.waitForTimeout(2000);
  console.log("Clicking to start...");
  await page.mouse.click(640, 360);
  await page.waitForTimeout(1000);
  
  console.log("Teleporting to end of level using browser evaluation...");
  await page.evaluate(() => {
    // Access Phaser game instance via window
    const game = (window as any).game;
    const gameScene = game.scene.scenes.find((s: any) => s.scene.key === 'GameScene');
    if (gameScene && gameScene.player) {
      gameScene.player.setPosition(gameScene.mapWidth - 150, 200);
    }
  });

  console.log("Walking right to trigger transition...");
  await page.keyboard.down('d');
  await page.waitForTimeout(3000); // 3 seconds should trigger transition
  await page.keyboard.up('d');
  
  console.log("Waiting 3 seconds for fade to complete...");
  await page.waitForTimeout(3000);
  
  console.log("Checking if GameScene level is 2...");
  const level = await page.evaluate(() => {
    const game = (window as any).game;
    const gameScene = game.scene.scenes.find((s: any) => s.scene.key === 'GameScene');
    return gameScene ? gameScene.currentLevel : -1;
  });
  
  console.log("Current level is:", level);
});
