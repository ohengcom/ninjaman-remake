import Phaser from 'phaser';
import { COLORS, GAME_CONFIG, SCENE_KEYS } from '../utils/constants.js';

export interface HudUpdate {
  health: number;
  maxHealth: number;
  lives: number;
  score: number;
  enemiesRemaining: number;
  timeMs: number;
  paused?: boolean;
}

export class HudScene extends Phaser.Scene {
  private healthBarBg!: Phaser.GameObjects.Rectangle;
  private healthBarFill!: Phaser.GameObjects.Rectangle;
  private healthText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private enemiesText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private pausedOverlay?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: SCENE_KEYS.HUD });
  }

  create(): void {
    const w = GAME_CONFIG.WIDTH;

    // Top-left panel background
    const panel = this.add.rectangle(20, 20, 320, 80, 0x000000, 0.45);
    panel.setOrigin(0, 0);
    panel.setStrokeStyle(2, COLORS.PRIMARY, 0.6);

    // Health label
    this.add.text(36, 30, 'HP', {
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
      color: COLORS.MUTED_HEX,
    });

    // Health bar
    this.healthBarBg = this.add
      .rectangle(36, 50, 240, 14, COLORS.HEALTH_BG)
      .setOrigin(0, 0)
      .setStrokeStyle(1, COLORS.MUTED, 1);
    this.healthBarFill = this.add
      .rectangle(36, 50, 240, 14, COLORS.HEALTH_FILL)
      .setOrigin(0, 0);

    this.healthText = this.add.text(286, 48, '100/100', {
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
      color: COLORS.LIGHT_HEX,
    });

    this.livesText = this.add.text(36, 72, 'Lives x 3', {
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
      color: COLORS.ACCENT_HEX,
    });

    // Top-right info
    this.scoreText = this.add
      .text(w - 20, 30, 'Score: 0', {
        fontFamily: '"Courier New", monospace',
        fontSize: '20px',
        color: COLORS.LIGHT_HEX,
        fontStyle: 'bold',
      })
      .setOrigin(1, 0);

    this.timerText = this.add
      .text(w - 20, 56, 'Time: 0.0s', {
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        color: COLORS.MUTED_HEX,
      })
      .setOrigin(1, 0);

    this.enemiesText = this.add
      .text(w - 20, 76, 'Enemies: 0', {
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        color: COLORS.MUTED_HEX,
      })
      .setOrigin(1, 0);

    // Listen for updates
    this.scene.get(SCENE_KEYS.GAME).events.on('hud-update', this.handleUpdate, this);
    this.scene.get(SCENE_KEYS.GAME).events.on('hud-pause', this.showPaused, this);
    this.scene.get(SCENE_KEYS.GAME).events.on('hud-resume', this.hidePaused, this);

    // Cleanup if game scene shuts down
    this.events.once('shutdown', () => {
      this.scene.get(SCENE_KEYS.GAME)?.events.off('hud-update', this.handleUpdate, this);
      this.scene.get(SCENE_KEYS.GAME)?.events.off('hud-pause', this.showPaused, this);
      this.scene.get(SCENE_KEYS.GAME)?.events.off('hud-resume', this.hidePaused, this);
    });
  }

  private handleUpdate(data: HudUpdate): void {
    const pct = Phaser.Math.Clamp(data.health / data.maxHealth, 0, 1);
    this.healthBarFill.setSize(240 * pct, 14);
    // Color shift on low health
    if (pct < 0.3) {
      this.healthBarFill.setFillStyle(COLORS.PRIMARY);
    } else {
      this.healthBarFill.setFillStyle(COLORS.HEALTH_FILL);
    }
    this.healthText.setText(`${data.health}/${data.maxHealth}`);
    this.livesText.setText(`Lives x ${data.lives}`);
    this.scoreText.setText(`Score: ${data.score}`);
    this.enemiesText.setText(`Enemies: ${data.enemiesRemaining}`);
    this.timerText.setText(`Time: ${(data.timeMs / 1000).toFixed(1)}s`);
  }

  private showPaused(): void {
    if (this.pausedOverlay) return;
    const w = GAME_CONFIG.WIDTH;
    const h = GAME_CONFIG.HEIGHT;
    this.pausedOverlay = this.add.container(0, 0);
    const bg = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.6);
    const txt = this.add
      .text(w / 2, h / 2, 'PAUSED\nESC to resume', {
        fontFamily: 'Georgia, serif',
        fontSize: '48px',
        color: COLORS.LIGHT_HEX,
        align: 'center',
      })
      .setOrigin(0.5);
    this.pausedOverlay.add([bg, txt]);
  }

  private hidePaused(): void {
    this.pausedOverlay?.destroy(true);
    this.pausedOverlay = undefined;
  }
}
