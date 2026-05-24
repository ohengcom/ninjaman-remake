import Phaser from 'phaser';
import { PROJECTILE_CONFIG } from '../config/combat.js';

export class Projectile extends Phaser.Physics.Arcade.Sprite {
    public damage: number = 10;
    private lifetimeTimer: Phaser.Time.TimerEvent | null = null;
    
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'projectile');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.body!.setSize(20, 10);
        (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    }

    public fire(x: number, y: number, dirX: number, speed: number, damage: number, textureKey: string = 'projectile') {
        this.setTexture(textureKey);
        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.enableBody(true, x, y, true, true);
        (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
        
        // Adjust hitbox for player wave vs sniper bullet
        if (textureKey === 'player_wave') {
            this.body!.setSize(30, 40);
            this.setScale(1); // Reset any forced size from previous reuse
        } else {
            this.body!.setSize(20, 10);
            this.setDisplaySize(60, 15); // Make arrow larger
        }
        
        this.damage = damage;
        this.setVelocityX(speed * dirX);
        this.setFlipX(dirX < 0);
        
        // Auto kill after lifetime expires
        this.lifetimeTimer?.remove(false);
        this.lifetimeTimer = this.scene.time.delayedCall(PROJECTILE_CONFIG.lifetime, () => {
            this.lifetimeTimer = null;
            if (this.active) this.disableBody(true, true);
        });
    }

    public hit() {
        this.lifetimeTimer?.remove(false);
        this.lifetimeTimer = null;
        this.disableBody(true, true);
    }

    override destroy(fromScene?: boolean) {
        this.lifetimeTimer?.remove(false);
        this.lifetimeTimer = null;
        super.destroy(fromScene);
    }
}