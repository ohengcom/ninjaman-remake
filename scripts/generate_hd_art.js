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

function drawBlade(img, cx, cy, dir, lift, alpha = 255) {
  const c1 = rgba(230, 251, 255, alpha);
  const c2 = rgba(74, 218, 255, Math.floor(alpha * 0.7));
  line(img, cx + dir * 4, cy - 26 + lift, cx + dir * 86, cy - 92 + lift, 9, c2);
  line(img, cx + dir * 14, cy - 28 + lift, cx + dir * 92, cy - 96 + lift, 3, c1);
}

function drawHero(img, frameX, frameY, pose) {
  const ox = frameX * FRAME_W;
  const oy = frameY * FRAME_H;
  const cx = ox + 128 + (pose.shiftX || 0);
  const foot = oy + 224 + (pose.footY || 0);
  const dir = 1;
  const suit = rgba(18, 23, 37, 255);
  const suit2 = rgba(37, 47, 74, 255);
  const skin = rgba(238, 195, 153, 255);
  const red = rgba(219, 45, 83, 255);
  const cyan = rgba(70, 226, 255, 240);
  const shadow = rgba(0, 0, 0, 52);
  ellipse(img, cx, foot + 6, 58, 10, shadow);
  if (pose.slash) {
    ellipse(img, cx + 45, foot - 92 + pose.slashY, 74, 22, rgba(75, 225, 255, 55));
    drawBlade(img, cx, foot - 60, dir, pose.slashY, 210);
  }
  if (pose.trail) {
    for (let i = 1; i <= 3; i++) {
      ellipse(img, cx - i * 18, foot - 94, 24, 49, rgba(33, 74, 106, 45));
      line(img, cx - i * 18, foot - 60, cx - i * 42, foot - 104, 10, rgba(219, 45, 83, 45));
    }
  }
  line(img, cx - 12, foot - 76, cx - 24 + pose.armLX, foot - 33 + pose.armLY, 17, suit2);
  line(img, cx + 18, foot - 76, cx + 42 + pose.armRX, foot - 47 + pose.armRY, 16, suit2);
  line(img, cx - 12, foot - 25, cx - 32 + pose.legLX, foot - 1 + pose.legLY, 20, suit);
  line(img, cx + 14, foot - 25, cx + 32 + pose.legRX, foot - 1 + pose.legRY, 20, suit);
  ellipse(img, cx, foot - 66, 31, 50, suit);
  rect(img, cx - 22, foot - 91, 44, 15, red);
  circle(img, cx, foot - 129, 32, suit);
  rect(img, cx - 28, foot - 134, 56, 18, rgba(7, 10, 18, 255));
  rect(img, cx + 6, foot - 126, 19, 7, cyan);
  circle(img, cx + 28, foot - 135, 5, skin);
  line(img, cx - 22, foot - 138, cx - 82 - pose.scarf, foot - 155 + pose.scarfY, 16, red);
  line(img, cx - 13, foot - 132, cx - 68 - pose.scarf * 0.6, foot - 115 + pose.scarfY, 13, rgba(255, 78, 118, 230));
  rect(img, cx - 18, foot - 40, 38, 9, cyan);
  if (pose.blade) drawBlade(img, cx, foot - 50, dir, pose.bladeLift || 0, 255);
  if (pose.guard) {
    ellipse(img, cx + 38, foot - 75, 20, 48, rgba(94, 220, 255, 80));
    line(img, cx + 30, foot - 112, cx + 45, foot - 35, 5, cyan);
  }
  if (pose.wave) {
    for (let i = 0; i < 4; i++) ellipse(img, cx + 72 + i * 25, foot - 78, 24 + i * 9, 12 + i * 4, rgba(78, 229, 255, 125 - i * 24));
  }
}

async function makeHeroSheet() {
  const img = new Jimp({ width: FRAME_W * SHEET_COLS, height: FRAME_H * SHEET_ROWS, color: rgba(0, 0, 0, 0) });
  const poses = [
    ...Array.from({ length: 8 }, (_, i) => ({ armLX: -8, armLY: 4, armRX: i % 2 ? -4 : 0, armRY: i % 2 ? 2 : -2, legLX: -2, legLY: 0, legRX: 2, legRY: 0, scarf: 10 + i * 2, scarfY: Math.sin(i) * 7 })),
    ...Array.from({ length: 8 }, (_, i) => ({ shiftX: i % 2 ? 5 : -4, footY: i % 2 ? -5 : 0, armLX: -18, armLY: i % 2 ? -8 : 8, armRX: 10, armRY: -8, legLX: i % 2 ? 19 : -18, legLY: 0, legRX: i % 2 ? -19 : 18, legRY: -3, scarf: 35 + i * 3, scarfY: -10, blade: true, bladeLift: i % 2 ? -4 : 5, trail: true })),
    ...Array.from({ length: 6 }, (_, i) => ({ footY: -10 - i * 2, armLX: -16, armLY: -10, armRX: 10, armRY: -18, legLX: -10 + i * 2, legLY: -4, legRX: 16 - i, legRY: -10, scarf: 38, scarfY: -12, blade: true, bladeLift: -20 + i * 4 })),
    ...Array.from({ length: 6 }, (_, i) => ({ footY: 2 + i, armLX: -10, armLY: 8, armRX: 8, armRY: 14, legLX: -12, legLY: 8, legRX: 14, legRY: 5, scarf: 46, scarfY: 16, blade: i < 2 })),
    ...Array.from({ length: 8 }, (_, i) => ({ shiftX: i * 3, armLX: -10, armLY: 2, armRX: 24 + i * 2, armRY: -6 - i, legLX: -6, legLY: 0, legRX: 10, legRY: -3, scarf: 36 + i * 3, scarfY: -8, slash: i > 1, slashY: -28 + i * 7, blade: true, bladeLift: -8 + i * 2 })),
    ...Array.from({ length: 8 }, (_, i) => ({ shiftX: i * 2, armLX: -20, armLY: -14, armRX: 36, armRY: -34 + i * 2, legLX: -12, legLY: -4, legRX: 16, legRY: -5, scarf: 48, scarfY: -18, slash: true, slashY: -42 + i * 7, blade: true, bladeLift: -24 + i * 4 })),
    ...Array.from({ length: 8 }, (_, i) => ({ shiftX: i * 4, armLX: -24, armLY: 8, armRX: 50, armRY: 0, legLX: -14, legLY: 4, legRX: 28, legRY: 1, scarf: 60, scarfY: -22, slash: true, slashY: -10 + i * 3, blade: true, bladeLift: 10, trail: true })),
    ...Array.from({ length: 6 }, (_, i) => ({ armLX: -8, armLY: -4, armRX: 14, armRY: -6, legLX: -3, legLY: 0, legRX: 2, legRY: 0, scarf: 18, scarfY: 0, guard: i < 3, wave: i > 1, blade: true })),
    { armLX: -12, armLY: -8, armRX: 12, armRY: -10, legLX: -8, legLY: -4, legRX: 8, legRY: -8, scarf: 48, scarfY: -20, blade: true, bladeLift: -36 },
    { armLX: -10, armLY: 10, armRX: 20, armRY: 18, legLX: -10, legLY: 10, legRX: 18, legRY: 8, scarf: 52, scarfY: 22, slash: true, slashY: 28 },
  ];
  poses.forEach((pose, index) => drawHero(img, index % SHEET_COLS, Math.floor(index / SHEET_COLS), pose));
  await img.write('public/assets/sprites/player_hero_hd.png');
}

await makeForest();
await makeBeach();
await makeCastle();
await makeHeroSheet();

console.log('Generated HD backgrounds and player_hero_hd spritesheet.');
