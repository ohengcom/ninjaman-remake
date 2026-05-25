import Phaser from 'phaser';

export class VfxManager {
  private scene: Phaser.Scene;
  private hitParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private sparkParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private dustParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private slashTrail!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public initAtmosphere() {
    // Subtle ambient glow + vignette for cinematic feel
    this.scene.cameras.main.filters.internal.addGlow(0x4dadf7, 1.5, 0, 0.3, undefined, 4, 6);
    this.scene.cameras.main.filters.internal.addVignette(0.5, 0.5, 0.85, 0.2);
  }

  public createAmbientMotes(mapWidth: number, mapHeight: number) {
    // Firefly/petal layer (slow, dreamy)
    this.scene.add.particles(this.scene.cameras.main.width / 2, mapHeight / 2, 'player_wave', {
      x: { min: 0, max: mapWidth },
      y: { min: 0, max: mapHeight },
      scale: { start: 0.06, end: 0 },
      alpha: { start: 0.4, end: 0 },
      tint: [0x74c0fc, 0x63e6be, 0xffb3c6],
      blendMode: 'SCREEN',
      lifespan: { min: 4000, max: 8000 },
      speed: { min: 5, max: 15 },
      angle: { min: 250, max: 290 },
      frequency: 250,
      quantity: 1,
    }).setScrollFactor(0.3).setDepth(-5);

    // Front sparkle layer
    this.scene.add.particles(this.scene.cameras.main.width / 2, mapHeight / 2, 'player_wave', {
      x: { min: 0, max: mapWidth },
      y: { min: 0, max: mapHeight },
      scale: { start: 0.08, end: 0 },
      alpha: { start: 0.7, end: 0 },
      tint: [0x74c0fc, 0xffa8c6, 0xfffbe6],
      blendMode: 'ADD',
      lifespan: { min: 2000, max: 5000 },
      speed: { min: 10, max: 30 },
      angle: { min: 260, max: 280 },
      frequency: 200,
      quantity: 1,
    }).setScrollFactor(0.8).setDepth(-2);
  }

  public createHitParticles() {
    // Impact burst particles (red/orange for hits)
    this.hitParticles = this.scene.add.particles(0, 0, 'player_wave', {
      speed: { min: 150, max: 500 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.2, end: 0 },
      tint: [ 0xff4444, 0xff8844, 0xffcc44, 0xffffff ],
      blendMode: 'ADD',
      lifespan: 350,
      gravityY: 500,
      emitting: false
    });

    // Upward spark fountain (gold/white for special hits)
    this.sparkParticles = this.scene.add.particles(0, 0, 'player_wave', {
      speed: { min: 250, max: 600 },
      angle: { min: -130, max: -50 },
      scale: { start: 0.12, end: 0 },
      tint: [ 0xffd43b, 0x00d4ff, 0xffffff ],
      blendMode: 'ADD',
      lifespan: 300,
      gravityY: 900,
      emitting: false
    });

    // Ground dust cloud
    this.dustParticles = this.scene.add.particles(0, 0, 'player_wave', {
      speed: { min: 30, max: 100 },
      angle: { min: -30, max: 210 },
      scale: { start: 0.25, end: 0 },
      alpha: { start: 0.5, end: 0 },
      tint: [ 0xc9c9c9, 0xa0a0a0, 0xe0e0e0 ],
      blendMode: 'NORMAL',
      lifespan: 500,
      gravityY: -30,
      emitting: false
    });

    // Slash trail (for melee attacks)
    this.slashTrail = this.scene.add.particles(0, 0, 'player_wave', {
      speed: { min: 20, max: 80 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.15, end: 0 },
      alpha: { start: 0.8, end: 0 },
      tint: [ 0x00d4ff, 0x00ff88, 0xffffff ],
      blendMode: 'ADD',
      lifespan: 200,
      emitting: false
    });
  }

  public emitHitParticle(x: number, y: number, count: number, type: 'hit' | 'spark' | 'dust' | 'slash' = 'hit') {
    if (type === 'hit' && this.hitParticles) {
      this.hitParticles.emitParticleAt(x, y, count);
    } else if (type === 'spark' && this.sparkParticles) {
      this.sparkParticles.emitParticleAt(x, y, count);
    } else if (type === 'dust' && this.dustParticles) {
      this.dustParticles.emitParticleAt(x, y, count);
    } else if (type === 'slash' && this.slashTrail) {
      this.slashTrail.emitParticleAt(x, y, count);
    }
  }

  /** Flash the screen white briefly for impactful hits */
  public hitFlash(duration: number = 60) {
    this.scene.cameras.main.flash(duration, 255, 255, 255, false, undefined, 0.3);
  }

  /** Show floating combo counter */
  public showComboPopup(x: number, y: number, comboCount: number) {
    const size = Math.min(20 + comboCount * 2, 48);
    const colors = ['#ff6b6b', '#ff8844', '#ffcc00', '#00d4ff', '#ff44ff'];
    const color = colors[Math.min(Math.floor(comboCount / 5), colors.length - 1)]!;
    
    const popup = this.scene.add.text(x, y, `${comboCount} HITS!`, {
        fontFamily: 'Orbitron, Inter, sans-serif',
        fontSize: `${size}px`,
        color: color,
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
        shadow: { blur: 8, color: color, fill: true, offsetX: 0, offsetY: 0 }
    }).setOrigin(0.5).setDepth(100);
    
    // Scale up then fade
    this.scene.tweens.add({
      targets: popup,
      y: y - 60,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0,
      duration: 700,
      ease: 'Back.easeOut',
      onComplete: () => popup.destroy()
    });
  }

  /** Show parry feedback text */
  public showParryText(x: number, y: number) {
    const parryText = this.scene.add.text(x, y - 40, '✦ PARRY ✦', {
        fontFamily: 'Orbitron, Inter, sans-serif',
        fontSize: '28px',
        color: '#00d4ff',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 3,
        shadow: { blur: 12, color: 'rgba(0, 212, 255, 0.8)', fill: true, offsetX: 0, offsetY: 0 }
    }).setOrigin(0.5).setDepth(100);
    
    this.scene.tweens.add({
      targets: parryText,
      y: y - 90,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 700,
      ease: 'Back.easeOut',
      onComplete: () => parryText.destroy()
    });
  }

  /** Show floating damage numbers */
  public showDamageText(x: number, y: number, damage: number) {
    const dmgText = this.scene.add.text(x + (Math.random() - 0.5) * 30, y, `${damage}`, {
      fontFamily: 'Orbitron, Inter, sans-serif',
      fontSize: '18px',
      color: '#ff4444',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(100);
    
    this.scene.tweens.add({
      targets: dmgText,
      y: y - 40,
      alpha: 0,
      duration: 500,
      onComplete: () => dmgText.destroy()
    });
  }

  /** 對精靈施加短暫的 Glow + ColorMatrix 受擊反饋，支持 Canvas 優雅降級 */
  public hitFlashFilter(target: Phaser.GameObjects.Sprite, color: number = 0xff4444, duration: number = 150) {
    if (this.scene.sys.game.config.renderType === Phaser.CANVAS) {
      target.setTint(color);
      this.scene.time.delayedCall(duration, () => {
        if (target.active) target.clearTint();
      });
      return;
    }

    try {
      if (!target.filters) target.enableFilters();
      const filters = target.filters as any;
      if (filters) {
        const glow = filters.internal.addGlow(color, 8, 0, 1, false, 4, 6);
        const cm = filters.internal.addColorMatrix();
        if (cm && typeof (cm as any).brightness === 'function') {
          (cm as any).brightness(1.5);
        }

        this.scene.tweens.add({
          targets: glow,
          outerStrength: 0,
          duration: duration,
          ease: 'Cubic.easeOut',
          onComplete: () => {
            if (target.active && target.filters) {
              const currentFilters = target.filters as any;
              currentFilters.internal.remove(glow);
              currentFilters.internal.remove(cm);
            }
          }
        });
      }
    } catch (e) {
      console.warn("Filters not supported or failed to apply:", e);
      target.setTint(color);
      this.scene.time.delayedCall(duration, () => {
        if (target.active) target.clearTint();
      });
    }
  }

  /** Boss 進入新階段時的視覺衝擊 */
  public bossPhaseTransition(phase: number) {
    if (this.scene.sys.game.config.renderType === Phaser.CANVAS) return;

    try {
      const cam = this.scene.cameras.main;
      if (phase === 2) {
        // 短暫 Bloom + 色偏
        const bloom = cam.filters.external.addBlur(0, 2, 2, 1);
        const cm = cam.filters.external.addColorMatrix();
        if (cm && typeof (cm as any).brightness === 'function') {
          (cm as any).brightness(1.3);
        }
        this.scene.time.delayedCall(600, () => {
          cam.filters.external.remove(bloom);
          cam.filters.external.remove(cm);
        });
      } else if (phase === 3) {
        // 狂暴階段：紅色 Vignette
        cam.filters.internal.addVignette(0.5, 0.5, 0.7, 0.4, 0xff2222);
      }
    } catch (e) {
      console.warn("VfxManager bossPhaseTransition filters failed:", e);
    }
  }

  /** 玩家死亡：全屏灰度 + 模糊 */
  public deathFilter() {
    if (this.scene.sys.game.config.renderType === Phaser.CANVAS) return;

    try {
      const cam = this.scene.cameras.main;
      const cm = cam.filters.external.addColorMatrix();
      const blur = cam.filters.external.addBlur(0, 0, 0, 0.5);

      this.scene.tweens.addCounter({
        from: 0, to: 1, duration: 1500,
        onUpdate: (tween) => {
          const v = (tween.getValue() as number) || 0;
          if (cm && typeof (cm as any).grayscale === 'function') {
            (cm as any).grayscale(v);
          }
          if (blur) {
            (blur as any).strength = v * 2;
          }
        }
      });
    } catch (e) {
      console.warn("VfxManager deathFilter failed:", e);
    }
  }

  /** Parry 成功時的短暫扭曲效果 */
  public parryImpact() {
    if (this.scene.sys.game.config.renderType === Phaser.CANVAS) return;

    try {
      const cam = this.scene.cameras.main;
      const barrel = cam.filters.external.addBarrel(1.04);

      this.scene.tweens.add({
        targets: barrel,
        amount: 1.0,
        duration: 200,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          try {
            cam.filters.external.remove(barrel);
          } catch(e) {}
        }
      });
    } catch (e) {
      console.warn("VfxManager parryImpact failed:", e);
    }
  }

  /** Hitstop 期間增強視覺衝擊 */
  public hitstopFilter(durationMs: number = 60) {
    if (this.scene.sys.game.config.renderType === Phaser.CANVAS) return;

    try {
      const cam = this.scene.cameras.main;
      const cm = cam.filters.external.addColorMatrix();
      if (cm && typeof (cm as any).contrast === 'function') {
        (cm as any).contrast(1.3);
      }

      this.scene.time.delayedCall(durationMs, () => {
        try {
          cam.filters.external.remove(cm);
        } catch(e) {}
      });
    } catch (e) {
      console.warn("VfxManager hitstopFilter failed:", e);
    }
  }

  /** 跟隨玩家的攻擊拖尾粒子 */
  public createAttackTrail(player: Phaser.Physics.Matter.Sprite): Phaser.GameObjects.Particles.ParticleEmitter {
    return this.scene.add.particles(0, 0, 'player_wave', {
      follow: player,
      followOffset: { x: 0, y: 0 },
      speed: { min: 20, max: 80 },
      scale: { start: 0.15, end: 0 },
      alpha: { start: 0.8, end: 0 },
      tint: [0x00d4ff, 0x00ff88, 0xffffff],
      blendMode: 'ADD',
      lifespan: 200,
      frequency: 50,
      emitting: false,
    });
  }

  /** Boss 進入新階段的粒子爆發 */
  public bossPhaseParticleBurst(x: number, y: number, phase: number) {
    const colors = phase === 3 ? [0xff4444, 0xff8844] : [0xffd43b, 0xffaa00];

    this.scene.add.particles(x, y, 'player_wave', {
      speed: { min: 200, max: 600 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.3, end: 0 },
      tint: colors,
      blendMode: 'ADD',
      lifespan: 800,
      gravityY: 200,
      frequency: -1, // explode
      quantity: 40,
      emitting: false,
    }).emitParticleAt(x, y, 40);
  }
}

