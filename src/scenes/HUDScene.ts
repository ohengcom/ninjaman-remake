import Phaser from 'phaser';
import { SaveManager } from '../managers/SaveManager.js';
import { SoundManager } from '../managers/SoundManager.js';
import { GameScene } from './GameScene.js';

export class HUDScene extends Phaser.Scene {
  private fpsText: Phaser.GameObjects.Text | null = null;

  private currentHealth: number = 100;
  private maxHealth: number = 100;
  private currentScore: number = 0;
  private currentLevel: number = 1;
  private gameScene!: GameScene;
  private isSkillMenuOpen: boolean = false;

  // DOM Elements
  private domIntegrityBar: HTMLElement | null = null;
  private domHpNumeric: HTMLElement | null = null;
  private domSectorDisplay: HTMLElement | null = null;
  private domScoreValue: HTMLElement | null = null;
  private domStyleMeter: HTMLElement | null = null;
  private domStyleLetter: HTMLElement | null = null;
  private domSoundStatus: HTMLElement | null = null;
  private domSoundToggle: HTMLElement | null = null;
  private domSkillOverlay: HTMLElement | null = null;
  private domSpText: HTMLElement | null = null;
  private domHpText: HTMLElement | null = null;
  private domBtnUpgradeHp: HTMLElement | null = null;
  private domBtnUpgradeCombo: HTMLElement | null = null;
  private domBtnUpgradeDash: HTMLElement | null = null;

  private readonly onUpdateHealth = (health: number, max: number) => {
    this.currentHealth = health;
    this.maxHealth = max || 100;
    this.updateDOMHealth();
  };

  private readonly onUpdateScore = (score: number) => {
    const diff = score - this.currentScore;
    this.currentScore = score;
    
    if (this.domScoreValue) {
      this.domScoreValue.innerText = this.currentScore.toString();
    }
    
    if (diff > 0 && diff % 500 === 0) {
      SaveManager.addSP(1); // Give skill points for milestones
      if (this.isSkillMenuOpen) {
        this.refreshMenuData();
      }
    }
  };

  private readonly onUpdateLevel = (level: number) => {
    this.currentLevel = level;
    let levelName = 'CITY SECTOR';
    if (level === 2) levelName = 'FOREST SECTOR';
    if (level === 3) levelName = 'CORE SECTOR';
    if (this.domSectorDisplay) {
      this.domSectorDisplay.innerText = `SECTOR ${level}: ${levelName}`;
    }
  };

  private readonly onUpdateStyle = (style: string) => {
    if (!this.domStyleMeter || !this.domStyleLetter) return;
    
    if (style) {
      this.domStyleMeter.classList.add('active');
      this.domStyleLetter.innerText = style;
      
      // Reset classes
      this.domStyleLetter.className = 'style-rank-letter';
      
      const sLower = style.toLowerCase();
      if (sLower === 'c') this.domStyleLetter.classList.add('rank-c');
      else if (sLower === 'b') this.domStyleLetter.classList.add('rank-b');
      else if (sLower === 'a') this.domStyleLetter.classList.add('rank-a');
      else if (sLower === 's') this.domStyleLetter.classList.add('rank-s');
      else if (sLower.includes('ss')) this.domStyleLetter.classList.add('rank-sss');
    } else {
      this.domStyleMeter.classList.remove('active');
    }
  };

  private readonly onToggleSkillMenu = () => {
    SoundManager.playMenuBlip();
    this.isSkillMenuOpen = !this.isSkillMenuOpen;
    
    if (this.domSkillOverlay) {
      this.domSkillOverlay.style.display = this.isSkillMenuOpen ? 'flex' : 'none';
    }
    
    if (this.isSkillMenuOpen) {
      this.refreshMenuData();
      this.gameScene.scene.pause();
    } else {
      this.gameScene.scene.resume();
    }
  };

  private readonly onToggleSound = () => {
    SoundManager.toggle(this.currentLevel);
    this.updateSoundDisplay();
    SoundManager.playMenuBlip();
  };

  constructor() {
    super({ key: 'HUDScene' });
  }

  create() {
    this.currentScore = 0;

    // Cache DOM Elements
    this.domIntegrityBar = document.getElementById('hud-integrity-bar');
    this.domHpNumeric = document.getElementById('hud-hp-numeric');
    this.domSectorDisplay = document.getElementById('hud-sector-display');
    this.domScoreValue = document.getElementById('hud-score-value');
    this.domStyleMeter = document.getElementById('hud-style-meter');
    this.domStyleLetter = document.getElementById('hud-style-letter');
    this.domSoundStatus = document.getElementById('hud-sound-status');
    this.domSoundToggle = document.getElementById('hud-sound-toggle');
    this.domSkillOverlay = document.getElementById('menu-skill-overlay');
    this.domSpText = document.getElementById('menu-sp-text');
    this.domHpText = document.getElementById('menu-hp-text');
    this.domBtnUpgradeHp = document.getElementById('btn-upgrade-hp');
    this.domBtnUpgradeCombo = document.getElementById('btn-upgrade-combo');
    this.domBtnUpgradeDash = document.getElementById('btn-upgrade-dash');

    // Register global listener for DOM sound toggle
    (window as any).toggleHUDGameSound = () => {
      this.onToggleSound();
    };

    // Bind skill upgrades
    if (this.domBtnUpgradeHp) {
      this.domBtnUpgradeHp.onclick = (e) => {
        e.stopPropagation();
        this.handleUpgradeHp();
      };
    }
    if (this.domBtnUpgradeCombo) {
      this.domBtnUpgradeCombo.onclick = (e) => {
        e.stopPropagation();
        this.handleUpgradeCombo();
      };
    }
    if (this.domBtnUpgradeDash) {
      this.domBtnUpgradeDash.onclick = (e) => {
        e.stopPropagation();
        this.handleUpgradeDash();
      };
    }

    // Bind click outside to close skill menu
    if (this.domSkillOverlay) {
      this.domSkillOverlay.onclick = (e) => {
        if (e.target === this.domSkillOverlay) {
          this.onToggleSkillMenu();
        }
      };
    }

    // Set initial display
    const sd = SaveManager.load();
    this.maxHealth = sd.maxHealth;
    this.currentHealth = sd.maxHealth;
    this.updateDOMHealth();
    this.updateSoundDisplay();
    this.onUpdateLevel(this.currentLevel);

    if (this.domScoreValue) {
      this.domScoreValue.innerText = '0';
    }

    // FPS counter in dev mode
    if (import.meta.env.DEV) {
      this.fpsText = this.add.text(20, this.cameras.main.height - 30, 'FPS: 60', {
        fontFamily: 'Courier New', fontSize: '14px', color: '#00ff00',
      });
    }

    this.gameScene = this.scene.get('GameScene') as GameScene;
    
    this.gameScene.events.on('update_health', this.onUpdateHealth);
    this.gameScene.events.on('update_score', this.onUpdateScore);
    this.gameScene.events.on('update_level', this.onUpdateLevel);
    this.gameScene.events.on('update_style', this.onUpdateStyle);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);

    this.input.keyboard!.on('keydown-K', this.onToggleSkillMenu);
    this.input.keyboard!.on('keydown-M', this.onToggleSound);
  }

  private updateDOMHealth() {
    if (this.domHpNumeric) {
      this.domHpNumeric.innerText = `${Math.max(0, Math.ceil(this.currentHealth))} / ${this.maxHealth}`;
    }
    if (this.domIntegrityBar) {
      const pct = Math.max(0, this.currentHealth / this.maxHealth);
      this.domIntegrityBar.style.width = `${pct * 100}%`;
      
      // Critical state blinking
      if (pct <= 0.3) {
        this.domIntegrityBar.classList.add('critical-hp');
      } else {
        this.domIntegrityBar.classList.remove('critical-hp');
      }
    }
  }

  private updateSoundDisplay() {
    if (this.domSoundStatus) {
      this.domSoundStatus.innerText = SoundManager.enabled ? 'ON' : 'OFF';
    }
    if (this.domSoundToggle) {
      if (SoundManager.enabled) {
        this.domSoundToggle.classList.add('on');
      } else {
        this.domSoundToggle.classList.remove('on');
      }
    }
  }

  private refreshMenuData() {
    const sd = SaveManager.load();
    if (this.domSpText) this.domSpText.innerText = `SKILL POINTS: ${sd.sp}`;
    if (this.domHpText) this.domHpText.innerText = `MAX INTEGRITY: ${sd.maxHealth}`;

    if (this.domBtnUpgradeHp) {
      // HP can be upgraded indefinitely
      this.domBtnUpgradeHp.innerHTML = `<span>[CLICK] MAX INTEGRITY +20</span><span>1 SP</span>`;
    }

    if (this.domBtnUpgradeCombo) {
      if (sd.comboLevel >= 3) {
        this.domBtnUpgradeCombo.classList.add('maxed');
        this.domBtnUpgradeCombo.innerHTML = `<span>COMBO LV.MAX (4 Hits)</span><span>MAXED</span>`;
      } else {
        this.domBtnUpgradeCombo.classList.remove('maxed');
        const nextLevel = sd.comboLevel + 1;
        const nextHits = sd.comboLevel + 2;
        this.domBtnUpgradeCombo.innerHTML = `<span>[CLICK] COMBO LV ${nextLevel} (${nextHits} Hits)</span><span>2 SP</span>`;
      }
    }

    if (this.domBtnUpgradeDash) {
      if (sd.dashInvincible) {
        this.domBtnUpgradeDash.classList.add('maxed');
        this.domBtnUpgradeDash.innerHTML = `<span>DASH INVINCIBILITY (MAXED)</span><span>MAXED</span>`;
      } else {
        this.domBtnUpgradeDash.classList.remove('maxed');
        this.domBtnUpgradeDash.innerHTML = `<span>[CLICK] DASH INVINCIBILITY</span><span>3 SP</span>`;
      }
    }
  }

  private handleUpgradeHp() {
    if (SaveManager.upgradeHealth(20, 1)) {
      SoundManager.playMenuBlip();
      const sd = SaveManager.load();
      this.maxHealth = sd.maxHealth;
      this.currentHealth = this.maxHealth; // Heal fully on upgrade
      this.updateDOMHealth();
      this.gameScene.upgradePlayerHealth(this.maxHealth);
      this.refreshMenuData();
    } else {
      this.shakeButton(this.domBtnUpgradeHp);
    }
  }

  private handleUpgradeCombo() {
    if (SaveManager.upgradeCombo(2)) {
      SoundManager.playMenuBlip();
      this.refreshMenuData();
    } else {
      this.shakeButton(this.domBtnUpgradeCombo);
    }
  }

  private handleUpgradeDash() {
    if (SaveManager.unlockDashInvincibility(3)) {
      SoundManager.playMenuBlip();
      this.refreshMenuData();
    } else {
      this.shakeButton(this.domBtnUpgradeDash);
    }
  }

  private shakeButton(btn: HTMLElement | null) {
    if (!btn) return;
    btn.classList.add('shake');
    this.time.delayedCall(400, () => {
      btn.classList.remove('shake');
    });
  }

  private cleanup() {
    // Hide overlay if open on exit
    if (this.domSkillOverlay) {
      this.domSkillOverlay.style.display = 'none';
    }
    
    // Clear global function
    (window as any).toggleHUDGameSound = undefined;

    if (!this.gameScene) return;
    this.gameScene.events.off('update_health', this.onUpdateHealth);
    this.gameScene.events.off('update_score', this.onUpdateScore);
    this.gameScene.events.off('update_level', this.onUpdateLevel);
    this.gameScene.events.off('update_style', this.onUpdateStyle);
    this.input.keyboard?.off('keydown-K', this.onToggleSkillMenu);
    this.input.keyboard?.off('keydown-M', this.onToggleSound);
  }

  update() {
    if (this.fpsText) {
      this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
    }
  }
}
