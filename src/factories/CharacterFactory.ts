import Phaser from 'phaser';
import { COLORS, TEXTURE_KEYS } from '../utils/constants.js';

/**
 * Renders all procedural character, prop, and FX textures into the scene's
 * texture cache. Called once during BootScene so every later scene can just
 * use these texture keys without paying any drawing cost at gameplay time.
 *
 * Drawing characters procedurally with Phaser.Graphics keeps us free of
 * sprite-sheet alpha-key headaches while still producing a recognizable
 * stylized ninja silhouette across many poses.
 */

const FRAME_W = 96;
const FRAME_H = 112;
const BOSS_W = 152;
const BOSS_H = 176;

interface NinjaPalette {
  outfit: number;
  outfitDark: number;
  sash: number;
  mask: number;
  skin: number;
  weapon: number;
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

const BOSS_PALETTE: NinjaPalette = {
  outfit: 0x521022,
  outfitDark: 0x2a0610,
  sash: 0xf2b134,
  mask: 0x14142b,
  skin: 0xeebc8a,
  weapon: 0xd9d9e0,
  weaponEdge: 0xffe066,
};

type Pose =
  | 'idle'
  | 'run1'
  | 'run2'
  | 'jump'
  | 'fall'
  | 'attack1'
  | 'attack2'
  | 'attack3'
  | 'defend'
  | 'slide'
  | 'slam'
  | 'throw'
  | 'wall';

export class CharacterFactory {
  static generateAll(scene: Phaser.Scene): void {
    // Player frames
    this.drawNinja(scene, TEXTURE_KEYS.NINJA_IDLE, NINJA_PALETTE, 'idle');
    this.drawNinja(scene, TEXTURE_KEYS.NINJA_RUN_1, NINJA_PALETTE, 'run1');
    this.drawNinja(scene, TEXTURE_KEYS.NINJA_RUN_2, NINJA_PALETTE, 'run2');
    this.drawNinja(scene, TEXTURE_KEYS.NINJA_JUMP, NINJA_PALETTE, 'jump');
    this.drawNinja(scene, TEXTURE_KEYS.NINJA_FALL, NINJA_PALETTE, 'fall');
    this.drawNinja(scene, TEXTURE_KEYS.NINJA_ATTACK_1, NINJA_PALETTE, 'attack1');
    this.drawNinja(scene, TEXTURE_KEYS.NINJA_ATTACK_2, NINJA_PALETTE, 'attack2');
    this.drawNinja(scene, TEXTURE_KEYS.NINJA_ATTACK_3, NINJA_PALETTE, 'attack3');
    this.drawNinja(scene, TEXTURE_KEYS.NINJA_DEFEND, NINJA_PALETTE, 'defend');
    this.drawNinja(scene, TEXTURE_KEYS.NINJA_SLIDE, NINJA_PALETTE, 'slide');
    this.drawNinja(scene, TEXTURE_KEYS.NINJA_SLAM, NINJA_PALETTE, 'slam');
    this.drawNinja(scene, TEXTURE_KEYS.NINJA_THROW, NINJA_PALETTE, 'throw');
    this.drawNinja(scene, TEXTURE_KEYS.NINJA_WALL, NINJA_PALETTE, 'wall');

    // Enemy frames
    this.drawNinja(scene, TEXTURE_KEYS.ENEMY_IDLE, ENEMY_PALETTE, 'idle');
    this.drawNinja(scene, TEXTURE_KEYS.ENEMY_RUN_1, ENEMY_PALETTE, 'run1');
    this.drawNinja(scene, TEXTURE_KEYS.ENEMY_RUN_2, ENEMY_PALETTE, 'run2');
    this.drawNinja(scene, TEXTURE_KEYS.ENEMY_ATTACK, ENEMY_PALETTE, 'attack1');

    // Boss frames (larger canvas)
    this.drawBoss(scene, TEXTURE_KEYS.BOSS_IDLE, 'idle');
    this.drawBoss(scene, TEXTURE_KEYS.BOSS_RUN_1, 'run1');
    this.drawBoss(scene, TEXTURE_KEYS.BOSS_RUN_2, 'run2');
    this.drawBoss(scene, TEXTURE_KEYS.BOSS_ATTACK, 'attack2');
    this.drawBoss(scene, TEXTURE_KEYS.BOSS_DASH, 'attack1');

    // Props
    this.drawCoin(scene);
    this.drawDango(scene);
    this.drawShuriken(scene);
    this.drawBarrel(scene);
    this.drawCheckpoint(scene, false);
    this.drawCheckpoint(scene, true);

    // Effects
    this.drawSlashFx(scene);
    this.drawParticle(scene);
    this.drawDust(scene);
    this.drawSpark(scene);
  }

  // ============================================================
  // PLAYER / ENEMY NINJA
  // ============================================================

  private static drawNinja(
    scene: Phaser.Scene,
    key: string,
    p: NinjaPalette,
    pose: Pose,
  ): void {
    if (scene.textures.exists(key)) scene.textures.remove(key);

    const g = scene.add.graphics({ x: 0, y: 0 });
    const cx = FRAME_W / 2;

    // === Pose-specific layout values ===
    let leftLegX = -8;
    let rightLegX = 8;
    let leftArmAngle = 0;
    let rightArmAngle = 0;
    let bodyTilt = 0;
    let armOffset = 0;
    let bodyYOffset = 0;
    let weaponPose: 'rest' | 'slash-up' | 'slash-down' | 'slash-spin' | 'guard' | 'thrust' | 'throw' | 'none' = 'rest';
    let isLayingDown = false;
    let scarfAngle = -10;

    switch (pose) {
      case 'idle':
        scarfAngle = -8;
        break;
      case 'run1':
        leftLegX = -14;
        rightLegX = 12;
        leftArmAngle = 18;
        rightArmAngle = -18;
        bodyTilt = 4;
        scarfAngle = -30;
        break;
      case 'run2':
        leftLegX = 12;
        rightLegX = -14;
        leftArmAngle = -18;
        rightArmAngle = 18;
        bodyTilt = 4;
        scarfAngle = -30;
        break;
      case 'jump':
        leftLegX = -6;
        rightLegX = 14;
        leftArmAngle = -30;
        rightArmAngle = -30;
        bodyTilt = 8;
        armOffset = -6;
        scarfAngle = -50;
        break;
      case 'fall':
        leftLegX = -10;
        rightLegX = 12;
        leftArmAngle = 25;
        rightArmAngle = 25;
        bodyTilt = -4;
        scarfAngle = 30;
        break;
      case 'attack1':
        leftLegX = -16;
        rightLegX = 10;
        leftArmAngle = -10;
        rightArmAngle = -90;
        weaponPose = 'slash-up';
        scarfAngle = -40;
        break;
      case 'attack2':
        leftLegX = -10;
        rightLegX = 14;
        leftArmAngle = 0;
        rightArmAngle = 70;
        weaponPose = 'slash-down';
        scarfAngle = 30;
        break;
      case 'attack3':
        leftLegX = -18;
        rightLegX = 14;
        leftArmAngle = -50;
        rightArmAngle = 110;
        weaponPose = 'slash-spin';
        scarfAngle = 40;
        bodyTilt = -8;
        break;
      case 'defend':
        leftLegX = -6;
        rightLegX = 6;
        leftArmAngle = -45;
        rightArmAngle = -45;
        weaponPose = 'guard';
        break;
      case 'slide':
        isLayingDown = true;
        leftLegX = -22;
        rightLegX = 16;
        leftArmAngle = 80;
        rightArmAngle = -80;
        bodyYOffset = 30;
        scarfAngle = 55;
        weaponPose = 'none';
        break;
      case 'slam':
        leftLegX = -4;
        rightLegX = 4;
        leftArmAngle = 30;
        rightArmAngle = 30;
        bodyTilt = 0;
        bodyYOffset = -4;
        weaponPose = 'thrust';
        scarfAngle = 60;
        break;
      case 'throw':
        leftLegX = -14;
        rightLegX = 12;
        leftArmAngle = -45;
        rightArmAngle = -110;
        weaponPose = 'throw';
        scarfAngle = -25;
        break;
      case 'wall':
        leftLegX = 0;
        rightLegX = 8;
        leftArmAngle = 80;
        rightArmAngle = 60;
        bodyTilt = -6;
        scarfAngle = 35;
        break;
    }

    if (isLayingDown) {
      // Slide pose: rotated body silhouette
      this.drawSlidingNinja(g, cx, p);
      g.generateTexture(key, FRAME_W, FRAME_H);
      g.destroy();
      return;
    }

    // === LEGS ===
    this.drawLeg(g, cx + leftLegX, 78 + bodyYOffset, p.outfit, p.outfitDark);
    this.drawLeg(g, cx + rightLegX, 78 + bodyYOffset, p.outfit, p.outfitDark);

    // === BODY ===
    g.fillStyle(p.outfit, 1);
    g.fillRoundedRect(cx - 16 + bodyTilt, 40 + bodyYOffset, 32, 42, 6);
    g.fillStyle(p.outfitDark, 1);
    g.fillRoundedRect(cx - 16 + bodyTilt, 70 + bodyYOffset, 32, 12, 6);
    // Sash
    g.fillStyle(p.sash, 1);
    g.fillRect(cx - 16 + bodyTilt, 64 + bodyYOffset, 32, 6);
    g.fillStyle(0xffffff, 0.18);
    g.fillRect(cx - 16 + bodyTilt, 64 + bodyYOffset, 32, 2);

    // === SCARF (trailing cloth behind shoulder) ===
    this.drawScarf(g, cx + bodyTilt - 6, 44 + bodyYOffset, scarfAngle, p.sash);

    // === HEAD ===
    const headX = cx + bodyTilt;
    const headY = 28 + bodyYOffset;
    g.fillStyle(p.mask, 1);
    g.fillCircle(headX, headY, 14);
    // Eye strip
    g.fillStyle(p.skin, 1);
    g.fillRect(headX - 11, headY - 3, 22, 6);
    // Eyes
    g.fillStyle(0x14142b, 1);
    g.fillRect(headX + 2, headY - 2, 3, 3);
    g.fillRect(headX + 8, headY - 2, 2, 3);
    // Mask top
    g.fillStyle(p.mask, 1);
    g.fillRect(headX - 14, headY - 14, 28, 11);
    // Hood top peak
    g.fillTriangle(headX - 14, headY - 14, headX, headY - 22, headX + 14, headY - 14);
    // Headband
    g.fillStyle(p.sash, 1);
    g.fillRect(headX - 14, headY - 7, 28, 3);
    g.fillTriangle(headX - 14, headY - 7, headX - 22, headY - 4, headX - 14, headY - 4);

    // === ARMS ===
    this.drawArm(g, cx - 12 + bodyTilt, 50 + bodyYOffset + armOffset, leftArmAngle, p.outfit, p.outfitDark, p.skin, false);
    this.drawArm(g, cx + 12 + bodyTilt, 50 + bodyYOffset + armOffset, rightArmAngle, p.outfit, p.outfitDark, p.skin, true);

    // === WEAPON ===
    this.drawWeapon(g, cx + bodyTilt, p, weaponPose, bodyYOffset);

    g.generateTexture(key, FRAME_W, FRAME_H);
    g.destroy();
  }

  private static drawSlidingNinja(g: Phaser.GameObjects.Graphics, cx: number, p: NinjaPalette): void {
    // Horizontal silhouette: ninja almost flat on ground
    const baseY = 88;
    // Trailing scarf
    g.fillStyle(p.sash, 0.85);
    g.fillTriangle(cx - 30, baseY - 6, cx - 50, baseY + 4, cx - 30, baseY + 6);
    // Body (long capsule)
    g.fillStyle(p.outfit, 1);
    g.fillRoundedRect(cx - 26, baseY - 14, 52, 26, 12);
    g.fillStyle(p.outfitDark, 1);
    g.fillRoundedRect(cx - 26, baseY + 2, 52, 10, 12);
    // Sash
    g.fillStyle(p.sash, 1);
    g.fillRect(cx - 8, baseY - 14, 8, 26);
    // Head (turned forward)
    g.fillStyle(p.mask, 1);
    g.fillCircle(cx + 24, baseY - 6, 12);
    g.fillStyle(p.skin, 1);
    g.fillRect(cx + 18, baseY - 8, 16, 4);
    g.fillStyle(0x14142b, 1);
    g.fillRect(cx + 22, baseY - 7, 3, 2);
    g.fillRect(cx + 28, baseY - 7, 2, 2);
    // Front leg extended
    g.fillStyle(p.outfit, 1);
    g.fillRoundedRect(cx - 38, baseY - 4, 26, 14, 6);
    g.fillStyle(p.outfitDark, 1);
    g.fillRoundedRect(cx - 38, baseY + 4, 26, 6, 6);
    // Trail dust strokes
    g.fillStyle(0xc7b8a0, 0.5);
    g.fillCircle(cx - 38, baseY + 14, 4);
    g.fillCircle(cx - 30, baseY + 16, 3);
    g.fillCircle(cx - 22, baseY + 18, 2);
  }

  private static drawScarf(
    g: Phaser.GameObjects.Graphics,
    pivotX: number,
    pivotY: number,
    angleDeg: number,
    color: number,
  ): void {
    const rad = Phaser.Math.DegToRad(angleDeg);
    const length = 28;
    const endX = pivotX + Math.cos(rad) * -length;
    const endY = pivotY + Math.sin(rad) * length;
    g.fillStyle(color, 1);
    g.beginPath();
    g.moveTo(pivotX, pivotY - 4);
    g.lineTo(pivotX, pivotY + 4);
    g.lineTo(endX + 2, endY + 4);
    g.lineTo(endX - 2, endY - 4);
    g.closePath();
    g.fillPath();
    // Highlight
    g.lineStyle(1, 0xffffff, 0.25);
    g.beginPath();
    g.moveTo(pivotX, pivotY);
    g.lineTo(endX, endY);
    g.strokePath();
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
    const endX = pivotX + Math.sin(rad) * armLen;
    const endY = pivotY + Math.cos(rad) * armLen;

    g.lineStyle(8, color, 1);
    g.beginPath();
    g.moveTo(pivotX, pivotY);
    g.lineTo(endX, endY);
    g.strokePath();

    g.lineStyle(2, shadow, 1);
    g.beginPath();
    g.moveTo(pivotX, pivotY);
    g.lineTo(endX, endY);
    g.strokePath();

    g.fillStyle(skin, 1);
    g.fillCircle(endX, endY, 4);

    if (isFront) {
      g.fillStyle(color, 1);
      g.fillCircle(pivotX, pivotY, 6);
    }
  }

  private static drawWeapon(
    g: Phaser.GameObjects.Graphics,
    centerX: number,
    p: NinjaPalette,
    pose: 'rest' | 'slash-up' | 'slash-down' | 'slash-spin' | 'guard' | 'thrust' | 'throw' | 'none',
    yOffset = 0,
  ): void {
    if (pose === 'none') return;
    const Y = (n: number): number => n + yOffset;

    if (pose === 'rest') {
      g.fillStyle(p.weapon, 1);
      g.fillRect(centerX - 22, Y(60), 18, 3);
      g.fillStyle(p.weaponEdge, 1);
      g.fillRect(centerX - 22, Y(60), 18, 1);
      g.fillStyle(p.outfitDark, 1);
      g.fillRect(centerX - 4, Y(58), 4, 7);
      return;
    }
    if (pose === 'slash-up') {
      g.lineStyle(4, p.weapon, 1);
      g.beginPath();
      g.moveTo(centerX + 18, Y(50));
      g.lineTo(centerX + 56, Y(8));
      g.strokePath();
      g.lineStyle(2, p.weaponEdge, 1);
      g.beginPath();
      g.moveTo(centerX + 18, Y(50));
      g.lineTo(centerX + 56, Y(8));
      g.strokePath();
      g.fillStyle(p.outfitDark, 1);
      g.fillRect(centerX + 14, Y(48), 8, 6);
      g.lineStyle(2, 0xffffff, 0.4);
      g.beginPath();
      g.moveTo(centerX + 30, Y(30));
      g.lineTo(centerX + 60, Y(18));
      g.strokePath();
      return;
    }
    if (pose === 'slash-down') {
      g.lineStyle(4, p.weapon, 1);
      g.beginPath();
      g.moveTo(centerX + 12, Y(56));
      g.lineTo(centerX + 62, Y(64));
      g.strokePath();
      g.lineStyle(2, p.weaponEdge, 1);
      g.beginPath();
      g.moveTo(centerX + 12, Y(56));
      g.lineTo(centerX + 62, Y(64));
      g.strokePath();
      g.fillStyle(p.outfitDark, 1);
      g.fillRect(centerX + 8, Y(54), 8, 6);
      g.lineStyle(2, 0xffffff, 0.4);
      g.beginPath();
      g.moveTo(centerX + 30, Y(60));
      g.lineTo(centerX + 60, Y(70));
      g.strokePath();
      return;
    }
    if (pose === 'slash-spin') {
      // Big arc behind ninja, blade trailing
      g.lineStyle(5, p.weapon, 1);
      g.beginPath();
      g.arc(centerX, Y(40), 44, Phaser.Math.DegToRad(-40), Phaser.Math.DegToRad(80), false);
      g.strokePath();
      g.lineStyle(3, p.weaponEdge, 0.9);
      g.beginPath();
      g.arc(centerX, Y(40), 44, Phaser.Math.DegToRad(-40), Phaser.Math.DegToRad(80), false);
      g.strokePath();
      g.lineStyle(3, 0xffffff, 0.4);
      g.beginPath();
      g.arc(centerX, Y(40), 52, Phaser.Math.DegToRad(-30), Phaser.Math.DegToRad(70), false);
      g.strokePath();
      return;
    }
    if (pose === 'guard') {
      g.lineStyle(4, p.weapon, 1);
      g.beginPath();
      g.moveTo(centerX + 12, Y(12));
      g.lineTo(centerX + 12, Y(60));
      g.strokePath();
      g.lineStyle(2, p.weaponEdge, 1);
      g.beginPath();
      g.moveTo(centerX + 12, Y(12));
      g.lineTo(centerX + 12, Y(60));
      g.strokePath();
      g.fillStyle(p.outfitDark, 1);
      g.fillRect(centerX + 8, Y(58), 8, 6);
      return;
    }
    if (pose === 'thrust') {
      // Pointing straight down for slam
      g.lineStyle(5, p.weapon, 1);
      g.beginPath();
      g.moveTo(centerX, Y(56));
      g.lineTo(centerX, Y(102));
      g.strokePath();
      g.lineStyle(2, p.weaponEdge, 1);
      g.beginPath();
      g.moveTo(centerX, Y(56));
      g.lineTo(centerX, Y(102));
      g.strokePath();
      g.fillStyle(p.outfitDark, 1);
      g.fillRect(centerX - 4, Y(52), 8, 6);
      return;
    }
    if (pose === 'throw') {
      // Hand cocked back with shuriken silhouette
      g.fillStyle(p.weapon, 1);
      g.fillTriangle(
        centerX - 28, Y(28),
        centerX - 24, Y(20),
        centerX - 20, Y(28),
      );
      g.fillTriangle(
        centerX - 28, Y(36),
        centerX - 24, Y(44),
        centerX - 20, Y(36),
      );
      g.fillTriangle(
        centerX - 32, Y(32),
        centerX - 24, Y(28),
        centerX - 24, Y(36),
      );
      g.fillTriangle(
        centerX - 16, Y(32),
        centerX - 24, Y(28),
        centerX - 24, Y(36),
      );
      g.fillStyle(p.outfitDark, 1);
      g.fillCircle(centerX - 24, Y(32), 2);
      return;
    }
  }

  // ============================================================
  // BOSS (bigger silhouette with horned helmet)
  // ============================================================
  private static drawBoss(
    scene: Phaser.Scene,
    key: string,
    pose: Pose,
  ): void {
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const g = scene.add.graphics({ x: 0, y: 0 });
    const cx = BOSS_W / 2;
    const p = BOSS_PALETTE;

    let leftLegX = -14;
    let rightLegX = 14;
    let leftArmAngle = 10;
    let rightArmAngle = -10;
    let weaponPose: 'rest' | 'slash-up' | 'slash-down' | 'thrust' = 'rest';

    switch (pose) {
      case 'idle':
        break;
      case 'run1':
        leftLegX = -22;
        rightLegX = 18;
        leftArmAngle = 30;
        rightArmAngle = -30;
        break;
      case 'run2':
        leftLegX = 18;
        rightLegX = -22;
        leftArmAngle = -30;
        rightArmAngle = 30;
        break;
      case 'attack1':
        leftLegX = -26;
        rightLegX = 18;
        leftArmAngle = -10;
        rightArmAngle = -100;
        weaponPose = 'slash-up';
        break;
      case 'attack2':
        leftLegX = -16;
        rightLegX = 22;
        rightArmAngle = 80;
        weaponPose = 'slash-down';
        break;
      default:
        break;
    }

    // Legs - bigger
    this.drawLegBig(g, cx + leftLegX, 110, p.outfit, p.outfitDark);
    this.drawLegBig(g, cx + rightLegX, 110, p.outfit, p.outfitDark);

    // Body - armored torso
    g.fillStyle(p.outfit, 1);
    g.fillRoundedRect(cx - 28, 60, 56, 60, 8);
    g.fillStyle(p.outfitDark, 1);
    g.fillRoundedRect(cx - 28, 105, 56, 16, 8);
    // Shoulder pauldrons
    g.fillStyle(p.outfitDark, 1);
    g.fillCircle(cx - 28, 66, 12);
    g.fillCircle(cx + 28, 66, 12);
    g.fillStyle(p.sash, 1);
    g.fillCircle(cx - 28, 66, 4);
    g.fillCircle(cx + 28, 66, 4);
    // Sash
    g.fillStyle(p.sash, 1);
    g.fillRect(cx - 28, 96, 56, 8);

    // Head with horned helmet
    const headX = cx;
    const headY = 44;
    g.fillStyle(p.mask, 1);
    g.fillCircle(headX, headY, 20);
    // Mempo (face plate)
    g.fillStyle(p.outfitDark, 1);
    g.fillRect(headX - 16, headY - 8, 32, 16);
    g.fillStyle(p.skin, 1);
    g.fillRect(headX - 12, headY - 4, 24, 6);
    g.fillStyle(0xff2222, 1);
    g.fillRect(headX - 8, headY - 2, 4, 3);
    g.fillRect(headX + 4, headY - 2, 4, 3);
    // Helmet horns
    g.fillStyle(p.weaponEdge, 1);
    g.fillTriangle(headX - 18, headY - 16, headX - 28, headY - 30, headX - 12, headY - 18);
    g.fillTriangle(headX + 18, headY - 16, headX + 28, headY - 30, headX + 12, headY - 18);
    // Helmet crest
    g.fillStyle(p.sash, 1);
    g.fillTriangle(headX - 4, headY - 22, headX, headY - 32, headX + 4, headY - 22);

    // Arms
    this.drawArmBig(g, cx - 22, 72, leftArmAngle, p.outfit, p.outfitDark, p.skin);
    this.drawArmBig(g, cx + 22, 72, rightArmAngle, p.outfit, p.outfitDark, p.skin);

    // Weapon (longer katana)
    if (weaponPose === 'slash-up') {
      g.lineStyle(6, p.weapon, 1);
      g.beginPath();
      g.moveTo(cx + 28, 70);
      g.lineTo(cx + 88, 6);
      g.strokePath();
      g.lineStyle(3, p.weaponEdge, 1);
      g.beginPath();
      g.moveTo(cx + 28, 70);
      g.lineTo(cx + 88, 6);
      g.strokePath();
      g.fillStyle(p.outfitDark, 1);
      g.fillRect(cx + 24, 68, 12, 8);
    } else if (weaponPose === 'slash-down') {
      g.lineStyle(6, p.weapon, 1);
      g.beginPath();
      g.moveTo(cx + 22, 76);
      g.lineTo(cx + 92, 92);
      g.strokePath();
      g.lineStyle(3, p.weaponEdge, 1);
      g.beginPath();
      g.moveTo(cx + 22, 76);
      g.lineTo(cx + 92, 92);
      g.strokePath();
    } else {
      g.fillStyle(p.weapon, 1);
      g.fillRect(cx - 36, 90, 28, 4);
      g.fillStyle(p.weaponEdge, 1);
      g.fillRect(cx - 36, 90, 28, 1);
      g.fillStyle(p.outfitDark, 1);
      g.fillRect(cx - 8, 88, 4, 8);
    }

    g.generateTexture(key, BOSS_W, BOSS_H);
    g.destroy();
  }

  private static drawLegBig(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    color: number,
    shadow: number,
  ): void {
    g.fillStyle(color, 1);
    g.fillRoundedRect(x - 10, y, 20, 50, 5);
    g.fillStyle(shadow, 1);
    g.fillRect(x - 10, y + 40, 20, 10);
    g.fillStyle(0x0a0a14, 1);
    g.fillRoundedRect(x - 12, y + 46, 24, 8, 4);
  }

  private static drawArmBig(
    g: Phaser.GameObjects.Graphics,
    pivotX: number,
    pivotY: number,
    angleDeg: number,
    color: number,
    shadow: number,
    skin: number,
  ): void {
    const rad = Phaser.Math.DegToRad(angleDeg);
    const armLen = 40;
    const endX = pivotX + Math.sin(rad) * armLen;
    const endY = pivotY + Math.cos(rad) * armLen;

    g.lineStyle(14, color, 1);
    g.beginPath();
    g.moveTo(pivotX, pivotY);
    g.lineTo(endX, endY);
    g.strokePath();
    g.lineStyle(4, shadow, 1);
    g.beginPath();
    g.moveTo(pivotX, pivotY);
    g.lineTo(endX, endY);
    g.strokePath();
    g.fillStyle(skin, 1);
    g.fillCircle(endX, endY, 6);
  }

  // ============================================================
  // PROPS
  // ============================================================
  private static drawCoin(scene: Phaser.Scene): void {
    const key = TEXTURE_KEYS.COIN;
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const g = scene.add.graphics({ x: 0, y: 0 });
    const size = 36;
    const c = size / 2;
    // Outer rim
    g.fillStyle(0xb8860b, 1);
    g.fillCircle(c, c, c - 1);
    // Main face
    g.fillStyle(COLORS.COIN, 1);
    g.fillCircle(c, c, c - 4);
    // Inner shine ring
    g.lineStyle(1, 0xfff5d6, 0.9);
    g.strokeCircle(c, c, c - 6);
    // Square hole
    g.fillStyle(0x6b4f0a, 1);
    g.fillRect(c - 4, c - 4, 8, 8);
    // Highlight
    g.fillStyle(0xffffff, 0.6);
    g.fillRect(c - 8, c - 12, 4, 4);
    g.generateTexture(key, size, size);
    g.destroy();
  }

  private static drawDango(scene: Phaser.Scene): void {
    const key = TEXTURE_KEYS.DANGO;
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const g = scene.add.graphics({ x: 0, y: 0 });
    const w = 56;
    const h = 32;
    // Skewer
    g.lineStyle(3, 0x6b4423, 1);
    g.beginPath();
    g.moveTo(2, h / 2);
    g.lineTo(w - 2, h / 2);
    g.strokePath();
    // Three balls
    const r = 9;
    const ballYs = [w * 0.25, w * 0.5, w * 0.75];
    const ballColors = [COLORS.DANGO_PINK, COLORS.DANGO_WHITE, COLORS.DANGO_GREEN];
    ballYs.forEach((bx, i) => {
      g.fillStyle(0x000000, 0.25);
      g.fillCircle(bx, h / 2 + 1, r);
      g.fillStyle(ballColors[i], 1);
      g.fillCircle(bx, h / 2, r);
      // Highlight
      g.fillStyle(0xffffff, 0.55);
      g.fillCircle(bx - 3, h / 2 - 3, 2);
    });
    g.generateTexture(key, w, h);
    g.destroy();
  }

  private static drawShuriken(scene: Phaser.Scene): void {
    const key = TEXTURE_KEYS.SHURIKEN;
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const g = scene.add.graphics({ x: 0, y: 0 });
    const size = 32;
    const c = size / 2;
    // Four-pointed star
    const points = [];
    for (let i = 0; i < 8; i++) {
      const r = i % 2 === 0 ? c - 1 : c * 0.35;
      const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
      points.push(c + Math.cos(angle) * r);
      points.push(c + Math.sin(angle) * r);
    }
    g.fillStyle(0x4a4a55, 1);
    g.beginPath();
    g.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) g.lineTo(points[i], points[i + 1]);
    g.closePath();
    g.fillPath();
    // Inner highlight
    g.lineStyle(1, 0xc7c7d1, 0.9);
    g.strokePath();
    // Center
    g.fillStyle(0x14142b, 1);
    g.fillCircle(c, c, 3);
    g.fillStyle(0xc7c7d1, 1);
    g.fillCircle(c, c, 1);
    g.generateTexture(key, size, size);
    g.destroy();
  }

  private static drawBarrel(scene: Phaser.Scene): void {
    const key = TEXTURE_KEYS.BARREL;
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const g = scene.add.graphics({ x: 0, y: 0 });
    const w = 56;
    const h = 70;
    // Body
    g.fillStyle(0x6b4423, 1);
    g.fillRoundedRect(0, 0, w, h, 4);
    // Shading staves
    g.lineStyle(1, 0x4a2e15, 0.9);
    for (let i = 1; i < 6; i++) {
      g.beginPath();
      g.moveTo((i * w) / 6, 4);
      g.lineTo((i * w) / 6, h - 4);
      g.strokePath();
    }
    // Hoops
    g.fillStyle(0x2a1a0a, 1);
    g.fillRect(0, 6, w, 6);
    g.fillRect(0, h / 2 - 3, w, 6);
    g.fillRect(0, h - 12, w, 6);
    g.fillStyle(0xc7a667, 0.5);
    g.fillRect(0, 6, w, 1);
    g.fillRect(0, h / 2 - 3, w, 1);
    g.fillRect(0, h - 12, w, 1);
    // Top lid
    g.fillStyle(0x8b5e3c, 1);
    g.fillRect(2, 0, w - 4, 6);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  private static drawCheckpoint(scene: Phaser.Scene, lit: boolean): void {
    const key = lit ? TEXTURE_KEYS.CHECKPOINT_ON : TEXTURE_KEYS.CHECKPOINT_OFF;
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const g = scene.add.graphics({ x: 0, y: 0 });
    const w = 72;
    const h = 110;
    // Pole
    g.fillStyle(0x14142b, 1);
    g.fillRect(8, 0, 4, h);
    // Lantern body
    g.fillStyle(lit ? COLORS.PRIMARY : 0x4a4a55, 1);
    g.fillRoundedRect(20, 14, 44, 60, 8);
    // Inner glow
    if (lit) {
      g.fillStyle(0xfff5d6, 0.7);
      g.fillRoundedRect(28, 22, 28, 44, 6);
      g.fillStyle(COLORS.ACCENT, 0.6);
      g.fillCircle(42, 44, 14);
    } else {
      g.fillStyle(0x6b6b8d, 0.8);
      g.fillRoundedRect(28, 22, 28, 44, 6);
    }
    // Top + bottom caps
    g.fillStyle(0x14142b, 1);
    g.fillRect(16, 8, 52, 8);
    g.fillRect(16, 72, 52, 8);
    // Hanging string detail
    g.lineStyle(2, 0x14142b, 1);
    g.beginPath();
    g.moveTo(10, 0);
    g.lineTo(42, 8);
    g.strokePath();
    g.generateTexture(key, w, h);
    g.destroy();
  }

  // ============================================================
  // EFFECTS
  // ============================================================
  private static drawSlashFx(scene: Phaser.Scene): void {
    const key = TEXTURE_KEYS.SLASH_FX;
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const g = scene.add.graphics({ x: 0, y: 0 });
    const w = 140;
    const h = 90;
    g.lineStyle(10, 0xffffff, 0.95);
    g.beginPath();
    g.arc(w / 2, h, 70, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false);
    g.strokePath();
    g.lineStyle(4, 0xe94560, 0.9);
    g.beginPath();
    g.arc(w / 2, h, 60, Phaser.Math.DegToRad(210), Phaser.Math.DegToRad(330), false);
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

  private static drawDust(scene: Phaser.Scene): void {
    const key = TEXTURE_KEYS.DUST;
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const g = scene.add.graphics({ x: 0, y: 0 });
    g.fillStyle(0xffffff, 0.85);
    g.fillCircle(6, 6, 6);
    g.fillStyle(0xffffff, 0.4);
    g.fillCircle(6, 6, 4);
    g.generateTexture(key, 12, 12);
    g.destroy();
  }

  private static drawSpark(scene: Phaser.Scene): void {
    const key = TEXTURE_KEYS.SPARK;
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const g = scene.add.graphics({ x: 0, y: 0 });
    // Diamond shape
    g.fillStyle(0xffffff, 1);
    g.fillTriangle(4, 0, 8, 4, 4, 8);
    g.fillTriangle(0, 4, 4, 0, 4, 8);
    g.generateTexture(key, 8, 8);
    g.destroy();
  }
}
