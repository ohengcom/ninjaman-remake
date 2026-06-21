import Phaser from 'phaser';
import { PROJECTILE_CONFIG } from '../config/combat.js';

export class Projectile extends Phaser.Physics.Matter.Sprite {
    public damage: number = 10;
    private lifetimeTimer: Phaser.Time.TimerEvent | null = null;
    
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene.matter.world, x, y, 'projectile');
        scene.add.existing(this);
        
        this.setRectangle(20, 10);
        this.setOrigin(0.5, 0.5);
        this.setIgnoreGravity(true);
        this.setSensor(true);
    }

    public fire(x: number, y: number, dirX: number, speed: number, damage: number, textureKey: string = 'projectile') {
        this.lifetimeTimer?.remove(false);
        this.lifetimeTimer = null;
        this.setTexture(textureKey);
        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);
        
        // Adjust hitbox for player wave vs sniper bullet
        if (textureKey === 'player_wave') {
            this.setRectangle(76, 34);
            this.setOrigin(0.5, 0.5);
            this.setDisplaySize(120, 56);
        } else {
            this.setRectangle(20, 10);
            this.setOrigin(0.5, 0.5);
            this.setDisplaySize(60, 15); // Make arrow larger
        }

        if (!this.isBodyInWorld()) {
          this.scene.matter.world.add(this.body as MatterJS.BodyType);
        }
        this.setIgnoreGravity(true);
        this.setSensor(true);
        
        this.damage = damage;
        this.setVelocityX(speed * dirX);
        this.setFlipX(dirX < 0);
        
        // Auto kill after lifetime expires
        this.lifetimeTimer = this.scene.time.delayedCall(PROJECTILE_CONFIG.lifetime, () => {
            this.lifetimeTimer = null;
            if (this.active) {
                this.removeBodyFromWorld();
                this.setActive(false);
                this.setVisible(false);
            }
        });
    }

    public hit() {
        this.lifetimeTimer?.remove(false);
        this.lifetimeTimer = null;
        this.removeBodyFromWorld();
        this.setActive(false);
        this.setVisible(false);
    }

    private removeBodyFromWorld(): void {
        if (this.isBodyInWorld()) {
            this.scene.matter.world.remove(this.body as MatterJS.BodyType);
        }
    }

    private isBodyInWorld(): boolean {
        const worldBodies = (this.scene.matter.world.localWorld as unknown as { bodies: MatterJS.BodyType[] }).bodies;
        return !!this.body && worldBodies.includes(this.body as MatterJS.BodyType);
    }

    override destroy(fromScene?: boolean) {
        this.lifetimeTimer?.remove(false);
        this.lifetimeTimer = null;
        super.destroy(fromScene);
    }
}
