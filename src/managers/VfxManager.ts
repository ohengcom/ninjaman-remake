import Phaser from 'phaser';

export class VfxManager {
  private scene: Phaser.Scene;
  private hitParticles!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public initAtmosphere() {
    this.scene.cameras.main.filters.internal.addGlow(0xe94560, 4, 0, 1, undefined, 4, 10);
    this.scene.cameras.main.filters.internal.addVignette(0.5, 0.5, 0.9, 0.4);
  }

  public createAmbientMotes(mapWidth: number, mapHeight: number) {
    this.scene.add.particles(this.scene.cameras.main.width / 2, mapHeight / 2, 'platform', {
      x: { min: 0, max: mapWidth },
      y: { min: 0, max: mapHeight },
      scale: { start: 0.02, end: 0 },
      alpha: { start: 0.6, end: 0 },
      tint: [0x00ffff, 0xe94560, 0xffffff],
      blendMode: 'ADD',
      lifespan: { min: 3000, max: 6000 },
      speed: { min: 10, max: 40 },
      angle: { min: 250, max: 290 },
      frequency: 200,
      quantity: 1,
    }).setScrollFactor(0.5);
  }

  public createHitParticles() {
    this.hitParticles = this.scene.add.particles(0, 0, 'platform', {
      speed: { min: -200, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.1, end: 0 },
      tint: [ 0xffffff, 0x00ffff, 0xe94560 ],
      blendMode: 'ADD',
      lifespan: 400,
      gravityY: 500,
      emitting: false
    });
  }

  public emitHitParticle(x: number, y: number, count: number) {
    if (this.hitParticles) {
      this.hitParticles.emitParticleAt(x, y, count);
    }
  }

  public showComboPopup(x: number, y: number, comboCount: number) {
    const popup = this.scene.add.text(x, y, `${comboCount} HITS!`, {
        fontFamily: 'Impact', fontSize: '20px', color: '#e94560'
    }).setOrigin(0.5);
    this.scene.tweens.add({ targets: popup, y: y - 40, alpha: 0, duration: 600, onComplete: () => popup.destroy() });
  }

  public showParryText(x: number, y: number) {
    const parryText = this.scene.add.text(x, y - 40, 'PARRY!', {
        fontFamily: 'Impact', fontSize: '24px', color: '#00ffff'
    }).setOrigin(0.5);
    this.scene.tweens.add({ targets: parryText, y: y - 80, alpha: 0, duration: 600, onComplete: () => parryText.destroy() });
  }

  public showDamageText(_x: number, _y: number, _damage: number) {
    // Optional placeholder if we add damage numbers later
  }
}
