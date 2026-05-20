import Phaser from 'phaser';
import { PROJECTILE_CONFIG } from '../config/combat.js';

export class Projectile extends Phaser.Physics.Arcade.Sprite {
    public damage: number = 10;
    
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
        } else {
            this.body!.setSize(20, 10);
        }
        
        this.damage = damage;
        this.setVelocityX(speed * dirX);
        this.setFlipX(dirX < 0);
        
        // Auto kill after lifetime expires
        this.scene.time.delayedCall(PROJECTILE_CONFIG.lifetime, () => {
            if (this.active) this.disableBody(true, true);
        });
    }

    public hit() {
        this.disableBody(true, true);
    }
}
