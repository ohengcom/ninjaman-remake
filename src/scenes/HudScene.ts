import Phaser from 'phaser';
import { COLORS, GAME_CONFIG, SCENE_KEYS, TEXTURE_KEYS } from '../utils/constants.js';

export interface HudUpdate {
  health: number;
  maxHealth: number;
  lives: number;
  score: number;
  enemiesRemaining: number;
  timeMs: number;
  coins: number;
  shuriken: number;
  zone: string;
  bossActive: boolean;
  bossHealth?: number;
  bossMaxHealth?: number;
}

/**
 * Top overlay scene: HP bar (with HUD-relative health icon), lives row,
 * coin/shuriken counters with HD icons, score/time, current zone tag,
 * combo pulse text, transient toasts, the boss health bar, and the pause
 * overlay. Listens to events emitted by GameScene rather than reading game
 * state directly so the two scenes stay decoupled.
 */
export class HudScene extends Phaser.Scene {
  // Player HP
  private healthBarBg!: Phaser.GameObjects.Rectangle;
  private healthBarFill!: Phaser.GameObjects.Rectangle;
  private healthText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;

  // Resource counters
  private coinIcon!: Phaser.GameObjects.Image;
  private coinText!: Phaser.GameObjects.Text;
  private shurikenIcon!: Phaser.GameObjects.Image;
  private shurikenText!: Phaser.GameObjects.Text;

  // Top-right info
  private scoreText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private zoneText!: Phaser.GameObjects.Text;
  private enemiesText!: Phaser.GameObjects.Text;

  // Combo + toasts
  private comboText!: Phaser.GameObjects.Text;
  private toastText?: Phaser.GameObjects.Text;

  // Boss bar
  private bossPanel!: Phaser.GameObjects.Container;
  private bossBarBg!: Phaser.GameObjects.Rectangle;
  private bossBarFill!: Phaser.GameObjects.Rectangle;
  private bossLabel!: Phaser.GameObjects.Text;

  // Pause
  private pausedOverlay?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: SCENE_KEYS.HUD });
  }

  create(): void {
    const w = GAME_CONFIG.WIDTH;

    // ===== Top-left: HP block =====
    const panel = this.add.rectangle(20, 20, 320, 86, 0x000000, 0.45);
    panel.setOrigin(0, 0);
    panel.setStrokeStyle(2, COLORS.PRIMARY, 0.6);

    this.add.text(36, 30, 'HP', {
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
      color: COLORS.MUTED_HEX,
    });

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

    this.livesText = this.add.text(36, 76, 'Lives x 3', {
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
      color: COLORS.ACCENT_HEX,
    });

    // ===== Resource counters (just below HP block) =====
    this.coinIcon = this.add
      .image(36, 130, TEXTURE_KEYS.COIN)
      .setOrigin(0, 0.5)
      .setDisplaySize(28, 28);
    this.coinText = this.add.text(72, 117, 'x 0', {
      fontFamily: '"Courier New", monospace',
      fontSize: '20px',
      color: COLORS.ACCENT_HEX,
      fontStyle: 'bold',
    });

    this.shurikenIcon = this.add
      .image(160, 130, TEXTURE_KEYS.SHURIKEN)
      .setOrigin(0, 0.5)
      .setDisplaySize(28, 28);
    this.shurikenText = this.add.text(196, 117, 'x 5', {
      fontFamily: '"Courier New", monospace',
      fontSize: '20px',
      color: COLORS.LIGHT_HEX,
      fontStyle: 'bold',
    });

    // ===== Top-right: score / time / zone / enemies =====
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

    this.zoneText = this.add
      .text(w - 20, 76, 'Zone: --', {
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        color: COLORS.ACCENT_HEX,
      })
      .setOrigin(1, 0);

    this.enemiesText = this.add
      .text(w - 20, 96, 'Enemies: 0', {
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        color: COLORS.MUTED_HEX,
      })
      .setOrigin(1, 0);

    // ===== Combo (centered, transient) =====
    this.comboText = this.add
      .text(w / 2, 60, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '40px',
        color: COLORS.PRIMARY_HEX,
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // ===== Boss bar (hidden by default, full-width along bottom) =====
    this.bossPanel = this.add.container(w / 2, 86);
    this.bossPanel.setVisible(false);
    const bossW = 760;
    const bossPanelBg = this.add
      .rectangle(0, 0, bossW + 12, 30, 0x000000, 0.6)
      .setOrigin(0.5)
      .setStrokeStyle(2, COLORS.BOSS_HEALTH_FILL, 0.8);
    this.bossBarBg = this.add
      .rectangle(0, 0, bossW, 18, COLORS.HEALTH_BG)
      .setOrigin(0.5);
    this.bossBarFill = this.add
      .rectangle(-bossW / 2, 0, bossW, 18, COLORS.BOSS_HEALTH_FILL)
      .setOrigin(0, 0.5);
    this.bossLabel = this.add
      .text(0, -22, 'TENGU SHOGUN', {
        fontFamily: 'Georgia, serif',
        fontSize: '16px',
        color: COLORS.ACCENT_HEX,
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 3,
      })
      .setOrigin(0.5);
    this.bossPanel.add([bossPanelBg, this.bossBarBg, this.bossBarFill, this.bossLabel]);

    // ===== Wire up game scene events =====
    const game = this.scene.get(SCENE_KEYS.GAME);
    if (!game) return;

    game.events.on('hud-update', this.handleUpdate, this);
    game.events.on('hud-pause', this.showPaused, this);
    game.events.on('hud-resume', this.hidePaused, this);
    game.events.on('hud-combo', this.flashCombo, this);
    game.events.on('hud-toast', this.showToast, this);
    game.events.on('hud-zone', this.flashZoneBanner, this);

    this.events.once('shutdown', () => {
      game.events.off('hud-update', this.handleUpdate, this);
      game.events.off('hud-pause', this.showPaused, this);
      game.events.off('hud-resume', this.hidePaused, this);
      game.events.off('hud-combo', this.flashCombo, this);
      game.events.off('hud-toast', this.showToast, this);
      game.events.off('hud-zone', this.flashZoneBanner, this);
    });
  }

  private handleUpdate(data: HudUpdate): void {
    const pct = Phaser.Math.Clamp(data.health / data.maxHealth, 0, 1);
    this.healthBarFill.setSize(240 * pct, 14);
    this.healthBarFill.setFillStyle(
      pct < 0.3
        ? COLORS.PRIMARY
        : pct < 0.6
          ? COLORS.ACCENT
          : COLORS.HEALTH_FILL,
    );
    this.healthText.setText(`${Math.max(0, Math.floor(data.health))}/${data.maxHealth}`);
    this.livesText.setText(`Lives x ${data.lives}`);
    this.coinText.setText(`x ${data.coins}`);
    this.shurikenText.setText(`x ${data.shuriken}`);
    this.scoreText.setText(`Score: ${data.score}`);
    this.timerText.setText(`Time: ${(data.timeMs / 1000).toFixed(1)}s`);
    this.zoneText.setText(`Zone: ${data.zone}`);
    this.enemiesText.setText(`Enemies: ${data.enemiesRemaining}`);

    // Boss bar
    if (data.bossActive && data.bossMaxHealth && data.bossHealth !== undefined) {
      this.bossPanel.setVisible(true);
      const bossPct = Phaser.Math.Clamp(data.bossHealth / data.bossMaxHealth, 0, 1);
      this.bossBarFill.setSize(760 * bossPct, 18);
    } else {
      this.bossPanel.setVisible(false);
    }
  }

  private flashCombo(combo: number): void {
    if (combo <= 1) {
      this.comboText.setAlpha(0);
      return;
    }
    this.comboText.setText(`x${combo} COMBO`);
    this.comboText.setAlpha(1);
    this.comboText.setScale(1);
    this.tweens.killTweensOf(this.comboText);
    this.tweens.add({
      targets: this.comboText,
      scale: { from: 1.4, to: 1 },
      duration: 180,
      ease: 'Back.Out',
    });
    this.tweens.add({
      targets: this.comboText,
      alpha: 0,
      delay: 600,
      duration: 400,
    });
  }

  private showToast(msg: string): void {
    this.toastText?.destroy();
    this.toastText = this.add
      .text(GAME_CONFIG.WIDTH / 2, 160, msg, {
        fontFamily: 'Georgia, serif',
        fontSize: '32px',
        color: COLORS.ACCENT_HEX,
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: this.toastText,
      alpha: 0,
      y: 130,
      duration: 1400,
      ease: 'Sine.easeIn',
      onComplete: () => this.toastText?.destroy(),
    });
  }

  private flashZoneBanner(zoneName: string): void {
    const banner = this.add
      .text(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT * 0.42, zoneName, {
        fontFamily: 'Georgia, serif',
        fontSize: '64px',
        color: COLORS.LIGHT_HEX,
        fontStyle: 'bold',
        stroke: COLORS.DARK_HEX,
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setAlpha(0);
    this.tweens.add({
      targets: banner,
      alpha: 1,
      duration: 320,
      yoyo: true,
      hold: 1100,
      onComplete: () => banner.destroy(),
    });
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
