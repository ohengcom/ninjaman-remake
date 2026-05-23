import Phaser from 'phaser';

export class VfxManager {
  private scene: Phaser.Scene;
  private hitParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private sparkParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private dustParticles!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public initAtmosphere() {
    this.scene.cameras.main.filters.internal.addGlow(0x4dadf7, 2, 0, 0.4, undefined, 4, 6);
    this.scene.cameras.main.filters.internal.addVignette(0.5, 0.5, 0.9, 0.15);
  }

  public createAmbientMotes(mapWidth: number, mapHeight: number) {
    // Back layer motes
    this.scene.add.particles(this.scene.cameras.main.width / 2, mapHeight / 2, 'platform', {
      x: { min: 0, max: mapWidth },
      y: { min: 0, max: mapHeight },
      scale: { start: 0.01, end: 0 },
      alpha: { start: 0.3, end: 0 },
      tint: [0x74c0fc, 0x63e6be],
      blendMode: 'SCREEN',
      lifespan: { min: 4000, max: 8000 },
      speed: { min: 5, max: 15 },
      angle: { min: 250, max: 290 },
      frequency: 300,
      quantity: 1,
    }).setScrollFactor(0.3);

    // Front layer motes
    this.scene.add.particles(this.scene.cameras.main.width / 2, mapHeight / 2, 'platform', {
      x: { min: 0, max: mapWidth },
      y: { min: 0, max: mapHeight },
      scale: { start: 0.025, end: 0 },
      alpha: { start: 0.8, end: 0 },
      tint: [0x74c0fc, 0x63e6be, 0xffa8a8],
      blendMode: 'ADD',
      lifespan: { min: 2000, max: 5000 },
      speed: { min: 10, max: 30 },
      angle: { min: 260, max: 280 },
      frequency: 150,
      quantity: 1,
    }).setScrollFactor(0.8);
  }

  public createHitParticles() {
    this.hitParticles = this.scene.add.particles(0, 0, 'platform', {
      speed: { min: 100, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.15, end: 0 },
      tint: [ 0xffa8a8, 0xffc9c9, 0xffffff ],
      blendMode: 'ADD',
      lifespan: 300,
      gravityY: 600,
      emitting: false
    });

    this.sparkParticles = this.scene.add.particles(0, 0, 'platform', {
      speed: { min: 200, max: 500 },
      angle: { min: -120, max: -60 },
      scale: { start: 0.08, end: 0 },
      tint: [ 0xffd43b, 0xffa8a8, 0xffffff ],
      blendMode: 'ADD',
      lifespan: 250,
      gravityY: 800,
      emitting: false
    });

    this.dustParticles = this.scene.add.particles(0, 0, 'platform', {
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.5, end: 0 },
      tint: [ 0xe9ecef, 0xdee2e6, 0xffffff ],
      blendMode: 'NORMAL',
      lifespan: 600,
      gravityY: -50,
      emitting: false
    });
  }

  public emitHitParticle(x: number, y: number, count: number, type: 'hit' | 'spark' | 'dust' = 'hit') {
    if (type === 'hit' && this.hitParticles) {
      this.hitParticles.emitParticleAt(x, y, count);
    } else if (type === 'spark' && this.sparkParticles) {
      this.sparkParticles.emitParticleAt(x, y, count);
    } else if (type === 'dust' && this.dustParticles) {
      this.dustParticles.emitParticleAt(x, y, count);
    }
  }

  public showComboPopup(x: number, y: number, comboCount: number) {
    const popup = this.scene.add.text(x, y, `${comboCount} HITS!`, {
        fontFamily: 'Inter, sans-serif', fontSize: '20px', color: '#ff6b6b', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.scene.tweens.add({ targets: popup, y: y - 40, alpha: 0, duration: 600, onComplete: () => popup.destroy() });
  }

  public showParryText(x: number, y: number) {
    const parryText = this.scene.add.text(x, y - 40, 'PARRY!', {
        fontFamily: 'Inter, sans-serif', fontSize: '24px', color: '#4dadf7', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.scene.tweens.add({ targets: parryText, y: y - 80, alpha: 0, duration: 600, onComplete: () => parryText.destroy() });
  }

  public showDamageText(_x: number, _y: number, _damage: number) {
    // Optional placeholder if we add damage numbers later
  }
}
