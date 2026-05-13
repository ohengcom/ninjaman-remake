import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../utils/constants.js';

/**
 * Renders all procedural character & FX textures into the scene's texture cache.
 * Call this once during BootScene before any scene that uses these textures.
 */

const FRAME_W = 96;
const FRAME_H = 112;

interface NinjaPalette {
  outfit: number;       // main body color
  outfitDark: number;   // shading
  sash: number;         // accent stripe
  mask: number;         // mask color
  skin: number;         // exposed skin
  weapon: number;       // sword / weapon color
  weaponEdge: number;
}

const NINJA_PALETTE: NinjaPalette = {
  outfit: 0x1a1a2e,
  outfitDark: 0x0d0d1a,
  sash: 0xe94560,
  mask: 0x14142b,
  skin: 0xf2cba1,
  weapon: 0xd9d9e0,
  weaponEdge: 0xffffff,
};

const ENEMY_PALETTE: NinjaPalette = {
  outfit: 0x4a1a1a,
  outfitDark: 0x2a0d0d,
  sash: 0xf2b134,
  mask: 0x2a0d0d,
  skin: 0xd9a878,
  weapon: 0x8b6914,
  weaponEdge: 0xffd966,
};

export class CharacterFactory {
  static generateAll(scene: Phaser.Scene): void {
    // Player textures
    this.drawNinja(scene, TEXTURE_KEYS.NINJA_IDLE, NINJA_PALETTE, 'idle');
    this.drawNinja(scene, TEXTURE_KEYS.NINJA_RUN_1, NINJA_PALETTE, 'run1');
    this.drawNinja(scene, TEXTURE_KEYS.NINJA_RUN_2, NINJA_PALETTE, 'run2');
    this.drawNinja(scene, TEXTURE_KEYS.NINJA_JUMP, NINJA_PALETTE, 'jump');
    this.drawNinja(scene, TEXTURE_KEYS.NINJA_ATTACK_1, NINJA_PALETTE, 'attack1');
    this.drawNinja(scene, TEXTURE_KEYS.NINJA_ATTACK_2, NINJA_PALETTE, 'attack2');
    this.drawNinja(scene, TEXTURE_KEYS.NINJA_DEFEND, NINJA_PALETTE, 'defend');

    // Enemy textures
    this.drawNinja(scene, TEXTURE_KEYS.ENEMY_IDLE, ENEMY_PALETTE, 'idle');
    this.drawNinja(scene, TEXTURE_KEYS.ENEMY_RUN_1, ENEMY_PALETTE, 'run1');
    this.drawNinja(scene, TEXTURE_KEYS.ENEMY_RUN_2, ENEMY_PALETTE, 'run2');
    this.drawNinja(scene, TEXTURE_KEYS.ENEMY_ATTACK, ENEMY_PALETTE, 'attack1');

    // Effects
    this.drawSlashFx(scene);
    this.drawParticle(scene);
  }

  /**
   * Draw a stylized ninja in a given pose.
   * Frame faces RIGHT by default (flipX in entity for left-facing).
   */
  private static drawNinja(
    scene: Phaser.Scene,
    key: string,
    p: NinjaPalette,
    pose: 'idle' | 'run1' | 'run2' | 'jump' | 'attack1' | 'attack2' | 'defend',
  ): void {
    if (scene.textures.exists(key)) {
      scene.textures.remove(key);
    }

    const g = scene.add.graphics({ x: 0, y: 0 });

    // Coordinates: frame is 96 wide x 112 tall.
    // Ground anchor near (48, 108). Origin is top-left.
    const cx = 48;

    // Body offsets per pose
    let leftLegX = -8;
    let rightLegX = 8;
    let leftArmAngle = 0;
    let rightArmAngle = 0;
    let bodyTilt = 0;
    let armOffset = 0;
    let weaponPose: 'rest' | 'slash-up' | 'slash-down' | 'guard' = 'rest';

    switch (pose) {
      case 'idle':
        break;
      case 'run1':
        leftLegX = -14;
        rightLegX = 12;
        leftArmAngle = 18;
        rightArmAngle = -18;
        bodyTilt = 4;
        break;
      case 'run2':
        leftLegX = 12;
        rightLegX = -14;
        leftArmAngle = -18;
        rightArmAngle = 18;
        bodyTilt = 4;
        break;
      case 'jump':
        leftLegX = -6;
        rightLegX = 14;
        leftArmAngle = -30;
        rightArmAngle = -30;
        bodyTilt = 8;
        armOffset = -6;
        break;
      case 'attack1':
        leftLegX = -16;
        rightLegX = 10;
        leftArmAngle = -10;
        rightArmAngle = -90;
        weaponPose = 'slash-up';
        break;
      case 'attack2':
        leftLegX = -10;
        rightLegX = 14;
        leftArmAngle = 0;
        rightArmAngle = 70;
        weaponPose = 'slash-down';
        break;
      case 'defend':
        leftLegX = -6;
        rightLegX = 6;
        leftArmAngle = -45;
        rightArmAngle = -45;
        weaponPose = 'guard';
        break;
    }

    // === LEGS ===
    // Back leg (drawn first so front leg is on top)
    this.drawLeg(g, cx + leftLegX, 78, p.outfit, p.outfitDark);
    this.drawLeg(g, cx + rightLegX, 78, p.outfit, p.outfitDark);

    // === BODY (torso) ===
    g.fillStyle(p.outfit, 1);
    g.fillRoundedRect(cx - 16 + bodyTilt, 40, 32, 42, 6);
    // Shading on body
    g.fillStyle(p.outfitDark, 1);
    g.fillRoundedRect(cx - 16 + bodyTilt, 70, 32, 12, 6);
    // Sash
    g.fillStyle(p.sash, 1);
    g.fillRect(cx - 16 + bodyTilt, 64, 32, 6);
    g.fillStyle(0xffffff, 0.15);
    g.fillRect(cx - 16 + bodyTilt, 64, 32, 2);

    // === HEAD ===
    const headX = cx + bodyTilt;
    const headY = 28;
    // Hood / mask back
    g.fillStyle(p.mask, 1);
    g.fillCircle(headX, headY, 14);
    // Skin (eyes strip)
    g.fillStyle(p.skin, 1);
    g.fillRect(headX - 11, headY - 3, 22, 6);
    // Eye glints
    g.fillStyle(0x14142b, 1);
    g.fillRect(headX + 2, headY - 2, 3, 3);
    g.fillRect(headX + 8, headY - 2, 2, 3);
    // Mask top fold (above eye strip)
    g.fillStyle(p.mask, 1);
    g.fillRect(headX - 14, headY - 14, 28, 11);
    // Headband
    g.fillStyle(p.sash, 1);
    g.fillRect(headX - 14, headY - 7, 28, 3);
    // Headband tail trailing behind
    g.fillTriangle(headX - 14, headY - 7, headX - 22, headY - 4, headX - 14, headY - 4);

    // === ARMS ===
    this.drawArm(g, cx - 12 + bodyTilt, 50 + armOffset, leftArmAngle, p.outfit, p.outfitDark, p.skin, false);
    this.drawArm(g, cx + 12 + bodyTilt, 50 + armOffset, rightArmAngle, p.outfit, p.outfitDark, p.skin, true);

    // === WEAPON (katana) ===
    this.drawWeapon(g, cx + bodyTilt, p, weaponPose);

    // Bake to texture
    g.generateTexture(key, FRAME_W, FRAME_H);
    g.destroy();
  }

  private static drawLeg(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    color: number,
    shadow: number,
  ): void {
    g.fillStyle(color, 1);
    g.fillRoundedRect(x - 6, y, 12, 28, 3);
    g.fillStyle(shadow, 1);
    g.fillRect(x - 6, y + 22, 12, 6);
    // foot
    g.fillStyle(0x0a0a14, 1);
    g.fillRoundedRect(x - 8, y + 26, 16, 4, 2);
  }

  private static drawArm(
    g: Phaser.GameObjects.Graphics,
    pivotX: number,
    pivotY: number,
    angleDeg: number,
    color: number,
    shadow: number,
    skin: number,
    isFront: boolean,
  ): void {
    const rad = Phaser.Math.DegToRad(angleDeg);
    const armLen = 26;
    const handLen = 6;

    const endX = pivotX + Math.sin(rad) * armLen;
    const endY = pivotY + Math.cos(rad) * armLen;

    g.lineStyle(8, color, 1);
    g.beginPath();
    g.moveTo(pivotX, pivotY);
    g.lineTo(endX, endY);
    g.strokePath();

    // shadow stripe
    g.lineStyle(2, shadow, 1);
    g.beginPath();
    g.moveTo(pivotX, pivotY);
    g.lineTo(endX, endY);
    g.strokePath();

    // hand
    g.fillStyle(skin, 1);
    g.fillCircle(
      endX + Math.sin(rad) * handLen * 0.5,
      endY + Math.cos(rad) * handLen * 0.5,
      4,
    );

    if (isFront) {
      // Front shoulder pad
      g.fillStyle(color, 1);
      g.fillCircle(pivotX, pivotY, 6);
    }
  }

  private static drawWeapon(
    g: Phaser.GameObjects.Graphics,
    centerX: number,
    p: NinjaPalette,
    pose: 'rest' | 'slash-up' | 'slash-down' | 'guard',
  ): void {
    if (pose === 'rest') {
      // sword sheathed at hip behind
      g.fillStyle(p.weapon, 1);
      g.fillRect(centerX - 22, 60, 18, 3);
      g.fillStyle(p.weaponEdge, 1);
      g.fillRect(centerX - 22, 60, 18, 1);
      // hilt
      g.fillStyle(p.outfitDark, 1);
      g.fillRect(centerX - 4, 58, 4, 7);
      return;
    }

    if (pose === 'slash-up') {
      // blade extending up-right diagonally
      g.lineStyle(4, p.weapon, 1);
      g.beginPath();
      g.moveTo(centerX + 18, 50);
      g.lineTo(centerX + 56, 8);
      g.strokePath();
      g.lineStyle(2, p.weaponEdge, 1);
      g.beginPath();
      g.moveTo(centerX + 18, 50);
      g.lineTo(centerX + 56, 8);
      g.strokePath();
      // hilt
      g.fillStyle(p.outfitDark, 1);
      g.fillRect(centerX + 14, 48, 8, 6);
      // motion line
      g.lineStyle(2, 0xffffff, 0.4);
      g.beginPath();
      g.moveTo(centerX + 30, 30);
      g.lineTo(centerX + 60, 18);
      g.strokePath();
      return;
    }

    if (pose === 'slash-down') {
      // blade extended forward at chest height
      g.lineStyle(4, p.weapon, 1);
      g.beginPath();
      g.moveTo(centerX + 12, 56);
      g.lineTo(centerX + 62, 64);
      g.strokePath();
      g.lineStyle(2, p.weaponEdge, 1);
      g.beginPath();
      g.moveTo(centerX + 12, 56);
      g.lineTo(centerX + 62, 64);
      g.strokePath();
      g.fillStyle(p.outfitDark, 1);
      g.fillRect(centerX + 8, 54, 8, 6);
      // motion line
      g.lineStyle(2, 0xffffff, 0.4);
      g.beginPath();
      g.moveTo(centerX + 30, 60);
      g.lineTo(centerX + 60, 70);
      g.strokePath();
      return;
    }

    if (pose === 'guard') {
      // blade vertical in front
      g.lineStyle(4, p.weapon, 1);
      g.beginPath();
      g.moveTo(centerX + 12, 12);
      g.lineTo(centerX + 12, 60);
      g.strokePath();
      g.lineStyle(2, p.weaponEdge, 1);
      g.beginPath();
      g.moveTo(centerX + 12, 12);
      g.lineTo(centerX + 12, 60);
      g.strokePath();
      g.fillStyle(p.outfitDark, 1);
      g.fillRect(centerX + 8, 58, 8, 6);
    }
  }

  private static drawSlashFx(scene: Phaser.Scene): void {
    const key = TEXTURE_KEYS.SLASH_FX;
    if (scene.textures.exists(key)) scene.textures.remove(key);

    const g = scene.add.graphics({ x: 0, y: 0 });
    const w = 120;
    const h = 80;
    // crescent slash arc
    g.lineStyle(8, 0xffffff, 0.95);
    g.beginPath();
    g.arc(w / 2, h, 60, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false);
    g.strokePath();
    g.lineStyle(3, 0xe94560, 0.9);
    g.beginPath();
    g.arc(w / 2, h, 50, Phaser.Math.DegToRad(210), Phaser.Math.DegToRad(330), false);
    g.strokePath();
    g.generateTexture(key, w, h);
    g.destroy();
  }

  private static drawParticle(scene: Phaser.Scene): void {
    const key = TEXTURE_KEYS.PARTICLE;
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const g = scene.add.graphics({ x: 0, y: 0 });
    g.fillStyle(0xffffff, 1);
    g.fillCircle(8, 8, 4);
    g.generateTexture(key, 16, 16);
    g.destroy();
  }
}
