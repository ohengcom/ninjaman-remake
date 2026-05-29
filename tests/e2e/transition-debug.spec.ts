import { test, expect } from '@playwright/test';

test('Transition Test Debug', async ({ page }) => {
  page.on('console', msg => console.log(`[Browser Console]: ${msg.text()}`));
  
  await page.goto('http://localhost:3000');
  
  // Wait for BootScene to finish
  await page.waitForFunction(() => {
    const game = (window as any).game;
    if (!game) return false;
    const mainMenu = game.scene.scenes.find((s: any) => s.scene.key === 'MainMenuScene');
    return mainMenu && mainMenu.scene.isActive();
  });
  
  await page.waitForTimeout(1000);
  await page.mouse.click(640, 360);
  await page.waitForTimeout(1000);
  
  await page.evaluate(() => {
    const game = (window as any).game;
    const gameScene = game.scene.scenes.find((s: any) => s.scene.key === 'GameScene');
    if (gameScene && gameScene.player) {
      gameScene.player.setPosition(gameScene.mapWidth - 800, 200);
    }
  });

  await page.keyboard.down('d');
  await page.waitForTimeout(3000);
  await page.keyboard.up('d');
  await page.waitForTimeout(3000);
  
  // Dump all scenes and their status
  const sceneInfo = await page.evaluate(() => {
    const game = (window as any).game;
    return game.scene.scenes.map((s: any) => ({
      key: s.scene.key,
      active: s.scene.isActive(),
      visible: s.scene.isVisible(),
      status: s.scene.status
    }));
  });
  
  console.log("Scene Info after transition:", sceneInfo);
  
  await page.screenshot({ path: 'transition-black-screen.png' });
});
