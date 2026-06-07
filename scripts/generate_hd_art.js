import { Jimp } from 'jimp';

const WIDTH = 1920;
const HEIGHT = 1080;
const FRAME_W = 256;
const FRAME_H = 256;
const SHEET_COLS = 8;
const SHEET_ROWS = 8;

const rgba = (r, g, b, a = 255) => (((r & 255) << 24) | ((g & 255) << 16) | ((b & 255) << 8) | (a & 255)) >>> 0;

function blend(c1, c2, t) {
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * t),
    Math.round(c1[1] + (c2[1] - c1[1]) * t),
    Math.round(c1[2] + (c2[2] - c1[2]) * t),
  ];
}

function rect(img, x, y, w, h, color) {
  img.scan(Math.max(0, Math.floor(x)), Math.max(0, Math.floor(y)), Math.max(0, Math.floor(w)), Math.max(0, Math.floor(h)), function (px, py, idx) {
    if (px >= 0 && px < this.bitmap.width && py >= 0 && py < this.bitmap.height) this.setPixelColor(color, px, py);
  });
}

function circle(img, cx, cy, r, color) {
  const rr = r * r;
  const minX = Math.max(0, Math.floor(cx - r));
  const maxX = Math.min(img.bitmap.width - 1, Math.ceil(cx + r));
  const minY = Math.max(0, Math.floor(cy - r));
  const maxY = Math.min(img.bitmap.height - 1, Math.ceil(cy + r));
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= rr) img.setPixelColor(color, x, y);
    }
  }
}

function ellipse(img, cx, cy, rx, ry, color) {
  const minX = Math.max(0, Math.floor(cx - rx));
  const maxX = Math.min(img.bitmap.width - 1, Math.ceil(cx + rx));
  const minY = Math.max(0, Math.floor(cy - ry));
  const maxY = Math.min(img.bitmap.height - 1, Math.ceil(cy + ry));
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) img.setPixelColor(color, x, y);
    }
  }
}

function line(img, x1, y1, x2, y2, width, color) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps;
    circle(img, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, width / 2, color);
  }
}

function poly(img, points, color) {
  const minY = Math.floor(Math.min(...points.map((p) => p[1])));
  const maxY = Math.ceil(Math.max(...points.map((p) => p[1])));
  for (let y = minY; y <= maxY; y++) {
    const hits = [];
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
        hits.push(a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
      }
    }
    hits.sort((a, b) => a - b);
    for (let i = 0; i < hits.length; i += 2) rect(img, hits[i], y, hits[i + 1] - hits[i], 1, color);
  }
}

function gradient(img, top, bottom) {
  for (let y = 0; y < img.bitmap.height; y++) {
    const t = y / (img.bitmap.height - 1);
    const [r, g, b] = blend(top, bottom, t);
    rect(img, 0, y, img.bitmap.width, 1, rgba(r, g, b));
  }
}

function addSun(img, x, y, r, color) {
  for (let i = r; i > 0; i -= 6) circle(img, x, y, i, rgba(color[0], color[1], color[2], Math.max(8, Math.floor(70 * i / r))));
  circle(img, x, y, r * 0.42, rgba(color[0], color[1], color[2], 230));
}

function addMountains(img, y, color, peaks, amp) {
  for (let i = 0; i < peaks; i++) {
    const x = (i / peaks) * WIDTH - 220;
    const w = WIDTH / peaks + 540;
    const peak = y - amp - ((i * 73) % 160);
    poly(img, [[x, y], [x + w * 0.5, peak], [x + w, y]], color);
  }
}

function addTrees(img, baseY, color, count, seed) {
  for (let i = 0; i < count; i++) {
    const x = ((i * 173 + seed) % WIDTH);
    const h = 160 + ((i * 41 + seed) % 230);
    const w = 45 + ((i * 19) % 44);
    rect(img, x - 8, baseY - h * 0.45, 16, h * 0.45, rgba(35, 24, 26, 220));
    poly(img, [[x - w, baseY - h * 0.25], [x, baseY - h], [x + w, baseY - h * 0.25]], color);
    poly(img, [[x - w * 0.8, baseY - h * 0.05], [x, baseY - h * 0.72], [x + w * 0.8, baseY - h * 0.05]], color);
  }
}

async function makeForest() {
  const img = new Jimp({ width: WIDTH, height: HEIGHT, color: rgba(0, 0, 0, 0) });
  gradient(img, [8, 18, 32], [30, 58, 61]);
  addSun(img, 1460, 210, 210, [96, 226, 205]);
  addMountains(img, 720, rgba(20, 43, 62, 245), 7, 360);
  addMountains(img, 830, rgba(25, 62, 72, 245), 6, 280);
  addTrees(img, 965, rgba(28, 91, 61, 245), 34, 19);
  addTrees(img, 1030, rgba(12, 59, 45, 255), 46, 71);
  for (let i = 0; i < 70; i++) circle(img, (i * 157) % WIDTH, 140 + ((i * 83) % 520), 2 + (i % 3), rgba(108, 255, 210, 80));
  rect(img, 0, 980, WIDTH, 100, rgba(8, 31, 33, 255));
  await img.write('public/assets/backgrounds/bg_forest.png');
}

async function makeBeach() {
  const img = new Jimp({ width: WIDTH, height: HEIGHT, color: rgba(0, 0, 0, 0) });
  gradient(img, [18, 47, 89], [232, 146, 95]);
  addSun(img, 1120, 355, 260, [255, 191, 113]);
  rect(img, 0, 600, WIDTH, 210, rgba(28, 126, 166, 235));
  for (let i = 0; i < 16; i++) line(img, -80, 610 + i * 14, WIDTH + 80, 640 + i * 10, 3, rgba(169, 233, 255, 90));
  rect(img, 0, 810, WIDTH, 270, rgba(215, 174, 108, 255));
  for (let i = 0; i < 90; i++) ellipse(img, (i * 97) % WIDTH, 850 + ((i * 31) % 190), 18 + (i % 4) * 8, 3, rgba(255, 228, 164, 90));
  addMountains(img, 625, rgba(22, 82, 112, 190), 5, 180);
  for (let i = 0; i < 9; i++) {
    const x = 160 + i * 210;
    line(img, x, 815, x + 38, 675, 16, rgba(79, 54, 40, 230));
    poly(img, [[x + 35, 675], [x - 70, 715], [x + 15, 735]], rgba(21, 91, 67, 220));
    poly(img, [[x + 42, 675], [x + 150, 700], [x + 70, 730]], rgba(26, 118, 83, 220));
  }
  await img.write('public/assets/backgrounds/bg_beach.png');
}

async function makeCastle() {
  const img = new Jimp({ width: WIDTH, height: HEIGHT, color: rgba(0, 0, 0, 0) });
  gradient(img, [9, 8, 21], [54, 44, 61]);
  addSun(img, 1415, 180, 180, [164, 95, 255]);
  addMountains(img, 770, rgba(23, 20, 38, 255), 8, 410);
  for (let i = 0; i < 8; i++) {
    const x = 180 + i * 230;
    const h = 250 + (i % 3) * 90;
    rect(img, x, 760 - h, 110, h, rgba(53, 49, 67, 255));
    rect(img, x + 14, 780 - h, 82, 22, rgba(34, 31, 48, 255));
    poly(img, [[x - 10, 760 - h], [x + 55, 675 - h], [x + 120, 760 - h]], rgba(72, 51, 75, 255));
    for (let y = 820 - h; y < 725; y += 70) rect(img, x + 40, y, 28, 38, rgba(175, 91, 217, 150));
  }
  rect(img, 0, 740, WIDTH, 340, rgba(34, 31, 43, 255));
  for (let i = 0; i < 32; i++) rect(img, i * 72, 710 + (i % 2) * 20, 48, 60, rgba(42, 38, 53, 255));
  for (let i = 0; i < 120; i++) rect(img, (i * 83) % WIDTH, 780 + ((i * 47) % 260), 36, 4, rgba(85, 76, 94, 80));
  await img.write('public/assets/backgrounds/bg_castle.png');
}

function drawSteelBlade(img, hiltX, hiltY, tipX, tipY, width, alpha = 255) {
  const dx = tipX - hiltX;
  const dy = tipY - hiltY;
  const len = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / len;
  const ny = dx / len;
  poly(img, [
    [hiltX + nx * width, hiltY + ny * width],
    [tipX, tipY],
    [hiltX - nx * width, hiltY - ny * width],
    [hiltX - nx * width * 0.35, hiltY - ny * width * 0.35],
  ], rgba(176, 188, 195, alpha));
  line(img, hiltX, hiltY, tipX, tipY, Math.max(1, width * 0.22), rgba(244, 249, 250, alpha));
  line(img, hiltX - nx * width * 1.6, hiltY - ny * width * 1.6, hiltX + nx * width * 1.6, hiltY + ny * width * 1.6, width * 0.45, rgba(92, 70, 46, alpha));
}

function drawClothFold(img, x1, y1, x2, y2, alpha = 100) {
  line(img, x1, y1, x2, y2, 1.2, rgba(255, 255, 255, alpha));
  line(img, x1 + 3, y1 + 4, x2 + 3, y2 + 4, 1.4, rgba(0, 0, 0, Math.floor(alpha * 0.7)));
}

function drawRealisticHeroFrame(target, pose, frameIndex) {
  const S = 4;
  const img = new Jimp({ width: FRAME_W * S, height: FRAME_H * S, color: rgba(0, 0, 0, 0) });
  const x = (v) => v * S;
  const y = (v) => v * S;
  const cx = x(128 + (pose.shiftX || 0));
  const foot = y(232 + (pose.footY || 0));
  const lean = x(pose.lean || 0);
  const bob = y(pose.bob || 0);
  const torsoX = cx + lean;
  const shoulderY = foot - y(130) + bob;
  const hipY = foot - y(60) + bob;
  const headY = shoulderY - y(34);
  const cloth = rgba(18, 21, 26, 255);
  const clothLight = rgba(45, 49, 56, 255);
  const clothDeep = rgba(6, 8, 12, 255);
  const leather = rgba(55, 42, 31, 255);
  const leatherLight = rgba(97, 75, 52, 255);
  const metal = rgba(112, 122, 127, 255);
  const skin = rgba(201, 155, 116, 255);
  const sash = rgba(116, 24, 31, 255);
  const sashLight = rgba(183, 54, 62, 235);
  ellipse(img, cx, foot + y(3), x(46), y(9), rgba(0, 0, 0, 70));

  if (pose.trail) {
    for (let i = 1; i <= 3; i++) {
      ellipse(img, torsoX - x(13 * i), shoulderY + y(44), x(20), y(58), rgba(28, 32, 40, 42));
      line(img, torsoX - x(24 * i), shoulderY - y(10), torsoX - x(52 + i * 14), shoulderY - y(24), x(6), rgba(108, 24, 35, 45));
    }
  }

  if (pose.slash) {
    ellipse(img, torsoX + x(50), shoulderY + y(pose.slashY || 0), x(72), y(20), rgba(218, 231, 235, 42));
    ellipse(img, torsoX + x(54), shoulderY + y((pose.slashY || 0) - 3), x(55), y(9), rgba(255, 255, 255, 58));
  }

  const leftKnee = [torsoX - x(18) + x(pose.legLX || 0), hipY + y(48) + y(pose.legLY || 0)];
  const leftFoot = [torsoX - x(28) + x(pose.legLX2 || pose.legLX || 0), foot - y(6) + y(pose.legLY2 || 0)];
  const rightKnee = [torsoX + x(20) + x(pose.legRX || 0), hipY + y(47) + y(pose.legRY || 0)];
  const rightFoot = [torsoX + x(30) + x(pose.legRX2 || pose.legRX || 0), foot - y(5) + y(pose.legRY2 || 0)];
  line(img, torsoX - x(12), hipY, leftKnee[0], leftKnee[1], x(15), clothDeep);
  line(img, leftKnee[0], leftKnee[1], leftFoot[0], leftFoot[1], x(13), cloth);
  line(img, torsoX + x(13), hipY, rightKnee[0], rightKnee[1], x(15), cloth);
  line(img, rightKnee[0], rightKnee[1], rightFoot[0], rightFoot[1], x(13), clothDeep);
  ellipse(img, leftFoot[0] + x(5), leftFoot[1] + y(2), x(18), y(6), leather);
  ellipse(img, rightFoot[0] + x(5), rightFoot[1] + y(2), x(18), y(6), leather);
  line(img, leftKnee[0] - x(4), leftKnee[1] - y(14), leftFoot[0] - x(2), leftFoot[1] - y(16), x(1.2), rgba(105, 112, 118, 120));
  line(img, rightKnee[0] + x(3), rightKnee[1] - y(16), rightFoot[0] + x(4), rightFoot[1] - y(15), x(1.2), rgba(105, 112, 118, 120));

  poly(img, [
    [torsoX - x(29), shoulderY + y(2)],
    [torsoX + x(28), shoulderY - y(4)],
    [torsoX + x(22), hipY + y(12)],
    [torsoX - x(22), hipY + y(14)],
  ], cloth);
  poly(img, [[torsoX - x(24), shoulderY + y(5)], [torsoX + x(8), shoulderY + y(2)], [torsoX - x(4), hipY + y(14)], [torsoX - x(29), hipY + y(4)]], clothLight);
  poly(img, [[torsoX + x(8), shoulderY + y(2)], [torsoX + x(29), shoulderY - y(3)], [torsoX + x(24), hipY + y(10)], [torsoX - x(2), hipY + y(14)]], clothDeep);
  rect(img, torsoX - x(24), hipY - y(7), x(52), y(12), leather);
  rect(img, torsoX - x(2), hipY - y(8), x(12), y(14), metal);
  poly(img, [[torsoX - x(32), hipY], [torsoX - x(7), hipY + y(8)], [torsoX - x(17), foot - y(18)], [torsoX - x(48), foot - y(35)]], rgba(10, 12, 17, 230));
  poly(img, [[torsoX + x(24), hipY], [torsoX + x(44), hipY + y(8)], [torsoX + x(33), foot - y(30)], [torsoX + x(8), foot - y(22)]], rgba(8, 10, 14, 220));

  const leftHand = [torsoX - x(44) + x(pose.armLX || 0), shoulderY + y(62) + y(pose.armLY || 0)];
  const rightHand = [torsoX + x(43) + x(pose.armRX || 0), shoulderY + y(53) + y(pose.armRY || 0)];
  line(img, torsoX - x(24), shoulderY + y(9), leftHand[0], leftHand[1], x(12), clothDeep);
  line(img, torsoX + x(25), shoulderY + y(7), rightHand[0], rightHand[1], x(12), cloth);
  circle(img, leftHand[0], leftHand[1], x(5), skin);
  circle(img, rightHand[0], rightHand[1], x(5), skin);
  line(img, torsoX - x(25), shoulderY + y(19), leftHand[0] - x(2), leftHand[1] - y(4), x(1.2), rgba(130, 136, 141, 120));
  line(img, torsoX + x(22), shoulderY + y(18), rightHand[0] + x(2), rightHand[1] - y(3), x(1.2), rgba(150, 156, 160, 125));

  if (pose.blade) {
    drawSteelBlade(img, rightHand[0] - x(1), rightHand[1] - y(2), rightHand[0] + x(74), rightHand[1] - y(66 + (pose.bladeLift || 0)), x(4), 245);
  }
  if (pose.guard) {
    drawSteelBlade(img, rightHand[0], rightHand[1], rightHand[0] + x(12), rightHand[1] - y(88), x(4), 245);
    ellipse(img, torsoX + x(36), shoulderY + y(36), x(18), y(46), rgba(190, 202, 207, 42));
  }
  if (pose.wave) {
    for (let i = 0; i < 5; i++) ellipse(img, rightHand[0] + x(30 + i * 20), rightHand[1] - y(8), x(18 + i * 7), y(8 + i * 3), rgba(214, 231, 235, 92 - i * 13));
  }

  line(img, torsoX - x(20), shoulderY - y(2), torsoX - x(70 + (pose.scarf || 0)), shoulderY - y(22) + y(pose.scarfY || 0), x(9), sash);
  line(img, torsoX - x(14), shoulderY + y(5), torsoX - x(58 + (pose.scarf || 0) * 0.7), shoulderY + y(14) + y(pose.scarfY || 0), x(7), sashLight);
  poly(img, [[torsoX - x(18), shoulderY + y(3)], [torsoX + x(20), shoulderY], [torsoX + x(17), shoulderY + y(17)], [torsoX - x(20), shoulderY + y(19)]], sash);

  ellipse(img, torsoX + x(1), headY, x(22), y(30), clothDeep);
  ellipse(img, torsoX + x(3), headY - y(1), x(18), y(25), cloth);
  rect(img, torsoX - x(17), headY - y(5), x(38), y(10), rgba(9, 10, 12, 255));
  rect(img, torsoX - x(7), headY - y(4), x(15), y(5), rgba(202, 158, 118, 245));
  rect(img, torsoX + x(7), headY - y(4), x(8), y(4), rgba(196, 211, 215, 235));
  poly(img, [[torsoX - x(20), headY - y(25)], [torsoX + x(9), headY - y(35)], [torsoX + x(24), headY - y(16)]], clothDeep);
  rect(img, torsoX - x(13), shoulderY - y(20), x(27), y(14), cloth);
  circle(img, torsoX + x(19), headY + y(3), x(3), skin);

  drawClothFold(img, torsoX - x(9), shoulderY + y(14), torsoX - x(15), hipY - y(8), 95);
  drawClothFold(img, torsoX + x(8), shoulderY + y(12), torsoX + x(15), hipY - y(10), 75);
  drawClothFold(img, torsoX - x(5), hipY + y(12), torsoX - x(21), foot - y(35), 65);
  drawClothFold(img, torsoX + x(11), hipY + y(12), torsoX + x(28), foot - y(38), 55);
  line(img, torsoX - x(30), shoulderY - y(5), torsoX - x(14), shoulderY - y(11), x(1.5), rgba(198, 205, 208, 120));
  line(img, torsoX + x(2), hipY - y(6), torsoX + x(27), hipY - y(5), x(1.2), leatherLight);

  img.blur(1);
  img.resize({ w: FRAME_W, h: FRAME_H });
  target.composite(img, (frameIndex % SHEET_COLS) * FRAME_W, Math.floor(frameIndex / SHEET_COLS) * FRAME_H);
}

async function makeHeroSheet() {
  const img = new Jimp({ width: FRAME_W * SHEET_COLS, height: FRAME_H * SHEET_ROWS, color: rgba(0, 0, 0, 0) });
  const poses = [
    ...Array.from({ length: 8 }, (_, i) => ({ bob: Math.sin(i / 8 * Math.PI * 2) * 2, armLX: -4, armLY: 2, armRX: i % 2 ? -3 : 2, armRY: i % 2 ? 1 : -2, legLX: -2, legRX: 2, scarf: 8 + i, scarfY: Math.sin(i) * 4, blade: true })),
    ...Array.from({ length: 8 }, (_, i) => ({ shiftX: i % 2 ? 4 : -3, footY: i % 2 ? -4 : 0, lean: 4, armLX: i % 2 ? -24 : -10, armLY: i % 2 ? -8 : 8, armRX: i % 2 ? 16 : 7, armRY: -8, legLX: i % 2 ? 16 : -13, legLY: 0, legRX: i % 2 ? -18 : 16, legRY: -3, scarf: 30 + i * 2, scarfY: -8, blade: true, bladeLift: i % 2 ? -4 : 5, trail: true })),
    ...Array.from({ length: 6 }, (_, i) => ({ footY: -10 - i * 2, lean: 2, armLX: -18, armLY: -14, armRX: 8, armRY: -22, legLX: -8 + i * 2, legLY: -4, legRX: 15 - i, legRY: -9, scarf: 34, scarfY: -12, blade: true, bladeLift: -24 + i * 4 })),
    ...Array.from({ length: 6 }, (_, i) => ({ footY: 1 + i, lean: -2, armLX: -10, armLY: 9, armRX: 8, armRY: 15, legLX: -10, legLY: 8, legRX: 12, legRY: 5, scarf: 42, scarfY: 14, blade: i < 2 })),
    ...Array.from({ length: 8 }, (_, i) => ({ shiftX: i * 2, lean: i > 3 ? 8 : 2, armLX: -12, armLY: 2, armRX: 24 + i * 2, armRY: -8 - i, legLX: -5, legRY: -3, scarf: 32 + i * 2, scarfY: -8, slash: i > 1, slashY: -28 + i * 7, blade: true, bladeLift: -8 + i * 2 })),
    ...Array.from({ length: 8 }, (_, i) => ({ shiftX: i * 2, lean: 7, armLX: -22, armLY: -13, armRX: 34, armRY: -34 + i * 2, legLX: -11, legLY: -4, legRX: 15, legRY: -5, scarf: 44, scarfY: -17, slash: true, slashY: -42 + i * 7, blade: true, bladeLift: -24 + i * 4 })),
    ...Array.from({ length: 8 }, (_, i) => ({ shiftX: i * 4, lean: 11, armLX: -25, armLY: 7, armRX: 50, armRY: 0, legLX: -12, legLY: 4, legRX: 28, legRY: 1, scarf: 56, scarfY: -21, slash: true, slashY: -10 + i * 3, blade: true, bladeLift: 10, trail: true })),
    ...Array.from({ length: 6 }, (_, i) => ({ armLX: -8, armLY: -4, armRX: 12, armRY: -8, legLX: -3, legRX: 2, scarf: 16, scarfY: 0, guard: i < 3, wave: i > 1, blade: true })),
    { armLX: -12, armLY: -9, armRX: 10, armRY: -12, legLX: -8, legLY: -4, legRX: 8, legRY: -8, scarf: 44, scarfY: -20, blade: true, bladeLift: -36 },
    { armLX: -10, armLY: 10, armRX: 18, armRY: 18, legLX: -10, legLY: 10, legRX: 18, legRY: 8, scarf: 48, scarfY: 22, slash: true, slashY: 28 },
  ];
  poses.forEach((pose, index) => drawRealisticHeroFrame(img, pose, index));
  await img.write('public/assets/sprites/player_hero_hd.png');
}

await makeForest();
await makeBeach();
await makeCastle();
await makeHeroSheet();

console.log('Generated HD backgrounds and player_hero_hd spritesheet.');
