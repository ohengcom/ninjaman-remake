import Phaser from 'phaser';
import { SaveManager } from '../managers/SaveManager.js';
import { SoundManager } from '../managers/SoundManager.js';
import { GameScene } from './GameScene.js';
import { SCORE_CONFIG } from '../config/combat.js';
import { calculateSPEarned } from '../utils/ScoreHelper.js';
import { GAME_EVENTS } from '../events.js';

export class HUDScene extends Phaser.Scene {
  private fpsText: Phaser.GameObjects.Text | null = null;

  private currentHealth: number = 100;
  private maxHealth: number = 100;
  private currentScore: number = 0;
  private currentLevel: number = 1;
  private gameScene!: GameScene;

  // DOM Elements
  private domHealthFill!: HTMLElement;
  private domHealthValue!: HTMLElement;
  private domScoreValue!: HTMLElement;
  private domLevelValue!: HTMLElement;
  private domStyleContainer!: HTMLElement;
  private domStyleText!: HTMLElement;

  constructor() {
    super({ key: 'HUDScene' });
  }

  create(): void {
    // Top Right: FPS
    this.fpsText = this.add.text(this.cameras.main.width - 20, 20, 'FPS: 0', {
      fontFamily: 'Courier', fontSize: '16px', color: '#6c7086'
    }).setOrigin(1, 0);

    // Grab DOM references
    this.domHealthFill = document.getElementById('health-fill')!;
    this.domHealthValue = document.getElementById('health-value')!;
    this.domScoreValue = document.getElementById('score-value')!;
    this.domLevelValue = document.getElementById('level-value')!;
    this.domStyleContainer = document.getElementById('style-container')!;
    this.domStyleText = document.getElementById('style-text')!;

    // Initial resets
    if (this.domHealthFill) this.domHealthFill.style.width = '100%';
    if (this.domHealthValue) this.domHealthValue.innerText = '100 / 100';
    if (this.domScoreValue) this.domScoreValue.innerText = '0';
    if (this.domLevelValue) this.domLevelValue.innerText = 'LEVEL 1';
    if (this.domStyleContainer) {
      this.domStyleContainer.classList.remove('visible');
      this.domStyleContainer.classList.remove('shake');
    }

    // Initialize global UI hooks (for Sound Toggle)
    const btnSound = document.getElementById('btn-toggle-sound');
    if (btnSound) {
      (window as any).toggleHUDGameSound = () => this.onToggleSound();
      btnSound.setAttribute('onclick', 'window.toggleHUDGameSound()');
    }

    this.gameScene = this.scene.get('GameScene') as GameScene;
    
    this.gameScene.events.on(GAME_EVENTS.UPDATE_HEALTH, this.onUpdateHealth);
    this.gameScene.events.on(GAME_EVENTS.UPDATE_SCORE, this.onUpdateScore);
    this.gameScene.events.on(GAME_EVENTS.UPDATE_LEVEL, this.onUpdateLevel);
    this.gameScene.events.on(GAME_EVENTS.UPDATE_STYLE, this.onUpdateStyle);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);

    this.input.keyboard!.on('keydown-Y', this.onToggleSound);
  }

  private updateDOMHealth() {
    if (!this.domHealthFill || !this.domHealthValue) return;

    const pct = Math.max(0, Math.min(100, (this.currentHealth / this.maxHealth) * 100));
    this.domHealthFill.style.width = `${pct}%`;
    this.domHealthValue.innerText = `${Math.ceil(this.currentHealth)} / ${this.maxHealth}`;

    if (pct < 30) {
      this.domHealthFill.style.background = '#f38ba8'; // Catppuccin Mocha Red
      this.domHealthFill.classList.add('pulse');
    } else {
      this.domHealthFill.style.background = '#89b4fa'; // Catppuccin Mocha Blue
      this.domHealthFill.classList.remove('pulse');
    }
  }

  private readonly onUpdateHealth = (health: number, max?: number) => {
    this.currentHealth = health;
    if (max) this.maxHealth = max;
    this.maxHealth = max || 100;
    this.updateDOMHealth();
  };

  private readonly onUpdateScore = (score: number) => {
    const earned = calculateSPEarned(this.currentScore, score, SCORE_CONFIG.spMilestoneInterval);
    
    if (earned > 0) {
      SaveManager.addSP(earned);
    }

    this.currentScore = score;
    
    if (this.domScoreValue) {
      this.domScoreValue.innerText = this.currentScore.toString();
    }
  };

  private readonly onUpdateLevel = (level: number) => {
    this.currentLevel = level;
    if (this.domLevelValue) {
      this.domLevelValue.innerText = `LEVEL ${this.currentLevel}`;
    }
  };

  private readonly onUpdateStyle = (style: string) => {
    if (!this.domStyleContainer || !this.domStyleText) return;

    if (!style) {
      this.domStyleContainer.classList.remove('visible');
      this.domStyleContainer.classList.remove('shake');
      return;
    }

    this.domStyleText.innerText = style;
    this.domStyleContainer.classList.add('visible');

    // Trigger CSS animation reflow
    this.domStyleContainer.classList.remove('shake');
    void this.domStyleContainer.offsetWidth; // Force reflow
    this.domStyleContainer.classList.add('shake');

    let color = '#cba6f7';
    switch (style) {
      case 'DEADLY': color = '#fab387'; break; // Yellow
      case 'CRAZY': color = '#f9e2af'; break; // Peach
      case 'BADASS': color = '#a6e3a1'; break; // Green
      case 'APOCALYPTIC': color = '#f38ba8'; break; // Red
      case 'SADISTIC': color = '#94e2d5'; break; // Teal
      case 'SMOKIN SICK STYLE': color = '#f5c2e7'; break; // Pink
    }
    
    this.domStyleText.style.color = color;
    this.domStyleText.style.textShadow = `0 0 10px ${color}, 0 0 20px ${color}`;
  };

  private readonly onToggleSound = () => {
    SoundManager.toggle(this.currentLevel);
    const isEnabled = SoundManager.enabled;
    const btnSound = document.getElementById('btn-toggle-sound');
    if (btnSound) {
      btnSound.innerText = isEnabled ? 'MUTE (Y)' : 'UNMUTE (Y)';
      btnSound.style.color = isEnabled ? '#cba6f7' : '#6c7086';
    }
  };

  private cleanup() {
    // Clear global function
    (window as any).toggleHUDGameSound = undefined;

    if (!this.gameScene) return;
    this.gameScene.events.off(GAME_EVENTS.UPDATE_HEALTH, this.onUpdateHealth);
    this.gameScene.events.off(GAME_EVENTS.UPDATE_SCORE, this.onUpdateScore);
    this.gameScene.events.off(GAME_EVENTS.UPDATE_LEVEL, this.onUpdateLevel);
    this.gameScene.events.off(GAME_EVENTS.UPDATE_STYLE, this.onUpdateStyle);
    this.input.keyboard?.off('keydown-Y', this.onToggleSound);
  }

  update() {
    if (this.fpsText) {
      this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
    }
  }
}
