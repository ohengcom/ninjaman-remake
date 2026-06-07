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
    await expect(page.locator('#hud-integrity-bar')).toBeVisible();
    await expect(page.locator('#hud-score-value')).toHaveText(/\d+/);
    await expect(page.locator('#hud-sector-display')).toContainText(/ACT 1: MYSTICAL FOREST/);

    const levelOnePhysics = await page.evaluate(() => {
      const gameScene = window.game?.scene.scenes.find((s: any) => s.scene.key === 'GameScene') as any;
      if (!gameScene?.player) throw new Error('Missing GameScene player');
      const groundTop = gameScene.cameras.main.height - 48;
      const playerBottom = gameScene.player.body.bounds.max.y;
      const firstEnemy = gameScene.enemies.getChildren().find((enemy: any) => enemy.active);
      const enemyBottom = firstEnemy?.body.bounds.max.y ?? groundTop;
      const oneWayPlatforms = gameScene.matter.world.localWorld.bodies
        .filter((body: any) => body.isStatic && body.gameObject?.getData?.('isOneWay'));
      const highestPlatformTop = Math.min(...oneWayPlatforms.map((body: any) => body.bounds.min.y));
      return {
        playerGroundDelta: Math.abs(playerBottom - groundTop),
        enemyGroundDelta: Math.abs(enemyBottom - groundTop),
        platformAboveHead: highestPlatformTop < playerBottom - 140,
      };
    });
    expect(levelOnePhysics.playerGroundDelta).toBeLessThanOrEqual(2);
    expect(levelOnePhysics.enemyGroundDelta).toBeLessThanOrEqual(2);
    expect(levelOnePhysics.platformAboveHead).toBe(true);

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

    await page.evaluate(async () => {
      if (!window.game) throw new Error('Missing game test hook');
      const game = window.game;
      game.scene.stop('HUDScene');
      game.scene.stop('GameScene');
      game.scene.start('GameScene', { level: 3 });
    });
    await expect.poll(async () => page.evaluate(() => {
      const gameScene = window.game?.scene.scenes.find((s: any) => s.scene.key === 'GameScene') as any;
      return gameScene?.currentLevel;
    }), { timeout: 10000 }).toBe(3);

    const bossGroundDelta = await page.evaluate(() => {
      const gameScene = window.game?.scene.scenes.find((s: any) => s.scene.key === 'GameScene') as any;
      if (!gameScene?.boss) throw new Error('Missing boss');
      const groundTop = gameScene.cameras.main.height - 48;
      return Math.abs(gameScene.boss.body.bounds.max.y - groundTop);
    });
    expect(bossGroundDelta).toBeLessThanOrEqual(2);

    await page.evaluate(() => {
      const gameScene = window.game?.scene.scenes.find((s: any) => s.scene.key === 'GameScene') as any;
      if (!gameScene) throw new Error('Missing GameScene');
      const projectile = gameScene.projectiles.get(120, 120);
      projectile.fire(120, 120, 1, 10, 5, 'projectile');
      projectile.hit();
      projectile.hit();
    });

    await page.keyboard.press('Escape');
    await expect(page.locator('#menu-pause-overlay')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#menu-pause-overlay')).toBeHidden();
    
    // Verify we have transitioned (either Sector 2 HUD is loaded or no white screen/errors occurred)
    console.log('--- ENDING PLAYGROUND SIMULATION ---');
    expect(runtimeErrors).toEqual([]);
  });
});
