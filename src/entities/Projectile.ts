import Phaser from 'phaser';

export class Projectile extends Phaser.Physics.Arcade.Sprite {
    public damage: number = 10;
    
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'projectile');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.body!.setSize(20, 10);
        this.body!.allowGravity = false;
    }

    public fire(x: number, y: number, dirX: number, speed: number, damage: number, textureKey: string = 'projectile') {
        this.setTexture(textureKey);
        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.enableBody(true, x, y, true, true);
        this.body!.allowGravity = false;
        
        // Adjust hitbox for player wave vs sniper bullet
        if (textureKey === 'player_wave') {
            this.body!.setSize(30, 40);
        } else {
            this.body!.setSize(20, 10);
        }
        
        this.damage = damage;
        this.setVelocityX(speed * dirX);
        this.setFlipX(dirX < 0);
        
        // Auto kill after 2 seconds
        this.scene.time.delayedCall(2000, () => {
            if (this.active) this.disableBody(true, true);
        });
    }

    public hit() {
        this.disableBody(true, true);
    }
}
