import { chromium } from 'playwright';

const FRAME_W = 340;
const FRAME_H = 512;
const SHEET_W = FRAME_W * 3;
const SHEET_H = FRAME_H * 2;

const ENEMIES = {
  guard: {
    file: 'enemy_guard.png',
    name: 'armored guard',
    main: '#2f343a',
    cloth: '#7f2026',
    trim: '#9aa4aa',
    skin: '#b98b66',
    weapon: 'swordShield',
    scale: 1,
    bulk: 1.02,
    helmet: 'kabuto',
  },
  axe: {
    file: 'enemy_axe.png',
    name: 'raider brute',
    main: '#49332a',
    cloth: '#7a3517',
    trim: '#b6ad9a',
    skin: '#b17855',
    weapon: 'axe',
    scale: 1.08,
    bulk: 1.22,
    helmet: 'fur',
  },
  ninja: {
    file: 'enemy_ninja.png',
    name: 'shadow assassin',
    main: '#11151c',
    cloth: '#31566a',
    trim: '#89949a',
    skin: '#b88862',
    weapon: 'dualBlades',
    scale: 0.96,
    bulk: 0.88,
    helmet: 'hood',
  },
  sniper: {
    file: 'enemy_sniper.png',
    name: 'hooded archer',
    main: '#26382f',
    cloth: '#6c5135',
    trim: '#a3a08d',
    skin: '#bc8d66',
    weapon: 'bow',
    scale: 0.98,
    bulk: 0.94,
    helmet: 'hood',
  },
  boss: {
    file: 'boss_oni.png',
    name: 'oni warlord',
    main: '#422026',
    cloth: '#b22d23',
    trim: '#c2a56f',
    skin: '#7d463b',
    weapon: 'odachi',
    scale: 1.34,
    bulk: 1.34,
    helmet: 'horns',
  },
};

const ACTIONS = ['idle', 'walkA', 'walkB', 'attack', 'hurt', 'dead'];

function actionPose(action) {
  return {
    idle: { dx: 0, dy: 0, lean: 0, leftLeg: -8, rightLeg: 8, leftArm: -2, rightArm: 0, blade: 0, alpha: 1 },
    walkA: { dx: -7, dy: -3, lean: 3, leftLeg: 20, rightLeg: -18, leftArm: -12, rightArm: 8, blade: -4, alpha: 1 },
    walkB: { dx: 7, dy: 0, lean: -2, leftLeg: -20, rightLeg: 18, leftArm: 10, rightArm: -10, blade: 5, alpha: 1 },
    attack: { dx: 13, dy: -2, lean: 10, leftLeg: -16, rightLeg: 24, leftArm: -18, rightArm: 42, blade: 34, alpha: 1 },
    hurt: { dx: -11, dy: 4, lean: -14, leftLeg: -8, rightLeg: 10, leftArm: -24, rightArm: -16, blade: -18, alpha: 0.92 },
    dead: { dx: 0, dy: 110, lean: 90, leftLeg: -24, rightLeg: 34, leftArm: -30, rightArm: 44, blade: -30, alpha: 0.88 },
  }[action];
}

function weaponSvg(type, cfg, p, cx, shoulderY, hipY) {
  const handX = cx + 59 + p.rightArm;
  const handY = shoulderY + 84 + (type === 'bow' ? -22 : 0);
  if (type === 'swordShield') {
    return `
      <path d="M ${handX - 102} ${handY - 2} C ${handX - 132} ${handY - 42}, ${handX - 104} ${handY - 82}, ${handX - 62} ${handY - 70} C ${handX - 44} ${handY - 28}, ${handX - 58} ${handY + 12}, ${handX - 98} ${handY + 28} Z" fill="url(#steel)" stroke="#3b4248" stroke-width="4"/>
      <path d="M ${handX - 98} ${handY - 46} C ${handX - 76} ${handY - 30}, ${handX - 72} ${handY - 4}, ${handX - 94} ${handY + 16}" fill="none" stroke="${cfg.cloth}" stroke-width="8" opacity=".72"/>
      <path d="M ${handX - 4} ${handY + 4} L ${handX + 122 + p.blade} ${handY - 84 + p.blade * -0.25} L ${handX + 136 + p.blade} ${handY - 95 + p.blade * -0.25} L ${handX + 18} ${handY - 8} Z" fill="url(#blade)" stroke="#eef6f8" stroke-width="2"/>
      <rect x="${handX - 13}" y="${handY - 12}" width="36" height="10" rx="5" fill="#5b432d" transform="rotate(-22 ${handX + 5} ${handY - 7})"/>`;
  }
  if (type === 'axe') {
    return `
      <path d="M ${handX - 18} ${handY + 30} L ${handX + 70 + p.blade} ${handY - 128}" stroke="#5b3a22" stroke-width="13" stroke-linecap="round"/>
      <path d="M ${handX + 50 + p.blade} ${handY - 144} C ${handX + 116 + p.blade} ${handY - 132}, ${handX + 126 + p.blade} ${handY - 68}, ${handX + 63 + p.blade} ${handY - 70} C ${handX + 82 + p.blade} ${handY - 96}, ${handX + 79 + p.blade} ${handY - 120}, ${handX + 50 + p.blade} ${handY - 144} Z" fill="url(#steel)" stroke="#3a3b3b" stroke-width="4"/>
      <path d="M ${handX + 48 + p.blade} ${handY - 132} C ${handX + 15 + p.blade} ${handY - 116}, ${handX + 18 + p.blade} ${handY - 76}, ${handX + 58 + p.blade} ${handY - 72}" fill="#d8d2c1" opacity=".45"/>`;
  }
  if (type === 'dualBlades') {
    return `
      <path d="M ${handX - 116} ${handY + 18} L ${handX - 36} ${handY - 60} L ${handX - 22} ${handY - 64} L ${handX - 92} ${handY + 30} Z" fill="url(#blade)"/>
      <path d="M ${handX + 6} ${handY + 6} L ${handX + 112 + p.blade} ${handY - 40} L ${handX + 124 + p.blade} ${handY - 36} L ${handX + 22} ${handY + 18} Z" fill="url(#blade)"/>
      <rect x="${handX - 42}" y="${handY - 62}" width="34" height="8" fill="#4d3625" transform="rotate(-38 ${handX - 25} ${handY - 58})"/>
      <rect x="${handX - 2}" y="${handY}" width="35" height="8" fill="#4d3625" transform="rotate(-15 ${handX + 15} ${handY + 4})"/>`;
  }
  if (type === 'bow') {
    return `
      <path d="M ${handX - 54} ${handY - 112} C ${handX - 4} ${handY - 74}, ${handX + 10} ${handY + 48}, ${handX - 56} ${handY + 104}" fill="none" stroke="#6b4325" stroke-width="10" stroke-linecap="round"/>
      <path d="M ${handX - 54} ${handY - 112} C ${handX - 18} ${handY - 30}, ${handX - 18} ${handY + 20}, ${handX - 56} ${handY + 104}" fill="none" stroke="#d7cfaa" stroke-width="2"/>
      <path d="M ${handX - 90} ${handY - 2} L ${handX + 85 + p.blade} ${handY - 2}" stroke="#d8d4c2" stroke-width="4"/>
      <path d="M ${handX + 84 + p.blade} ${handY - 2} l -22 -8 l 4 8 l -4 8 z" fill="#d8d4c2"/>`;
  }
  return `
      <path d="M ${handX - 12} ${handY + 16} L ${handX + 172 + p.blade} ${handY - 116} L ${handX + 196 + p.blade} ${handY - 126} L ${handX + 26} ${handY + 2} Z" fill="url(#blade)" stroke="#f1f4ef" stroke-width="3"/>
      <rect x="${handX - 24}" y="${handY - 7}" width="58" height="14" rx="7" fill="#6c4a29" transform="rotate(-30 ${handX + 5} ${handY})"/>`;
}

function helmetSvg(cfg, x, y) {
  if (cfg.helmet === 'horns') {
    return `
      <path d="M ${x - 22} ${y - 38} C ${x - 82} ${y - 86}, ${x - 84} ${y - 24}, ${x - 38} ${y - 15}" fill="#d7c8a1" stroke="#5f4b37" stroke-width="4"/>
      <path d="M ${x + 22} ${y - 38} C ${x + 82} ${y - 86}, ${x + 84} ${y - 24}, ${x + 38} ${y - 15}" fill="#d7c8a1" stroke="#5f4b37" stroke-width="4"/>`;
  }
  if (cfg.helmet === 'kabuto') {
    return `<path d="M ${x - 42} ${y - 38} C ${x - 24} ${y - 78}, ${x + 27} ${y - 78}, ${x + 44} ${y - 38} L ${x + 34} ${y - 15} L ${x - 36} ${y - 15} Z" fill="url(#steel)" stroke="#30363b" stroke-width="4"/>`;
  }
  if (cfg.helmet === 'fur') {
    return `<path d="M ${x - 49} ${y - 34} C ${x - 28} ${y - 84}, ${x + 35} ${y - 80}, ${x + 52} ${y - 31} C ${x + 34} ${y - 46}, ${x + 12} ${y - 50}, ${x - 8} ${y - 45} C ${x - 21} ${y - 49}, ${x - 37} ${y - 45}, ${x - 49} ${y - 34} Z" fill="#49311f" stroke="#21160f" stroke-width="4"/>`;
  }
  return `<path d="M ${x - 36} ${y - 34} C ${x - 21} ${y - 74}, ${x + 24} ${y - 74}, ${x + 39} ${y - 34} L ${x + 29} ${y - 7} L ${x - 31} ${y - 7} Z" fill="${cfg.main}" stroke="#050608" stroke-width="4"/>`;
}

function frameSvg(cfg, frameIndex) {
  const action = ACTIONS[frameIndex];
  const p = actionPose(action);
  const dead = action === 'dead';
  const cx = 170 + p.dx;
  const foot = dead ? 436 : 466 + p.dy;
  const sc = cfg.scale;
  const bulk = cfg.bulk;
  const shoulderY = foot - 238 * sc;
  const hipY = foot - 86 * sc;
  const headY = shoulderY - 54 * sc;
  const rot = dead ? 84 : p.lean;
  const body = `
    <ellipse cx="${cx}" cy="${foot + 9}" rx="${58 * bulk}" ry="13" fill="#000" opacity=".34"/>
    <g transform="rotate(${rot} ${cx} ${hipY})" opacity="${p.alpha}">
      <path d="M ${cx - 32 + p.leftLeg} ${hipY - 2} C ${cx - 62 + p.leftLeg} ${hipY + 80}, ${cx - 58 + p.leftLeg} ${foot - 28}, ${cx - 46 + p.leftLeg} ${foot - 8}" fill="none" stroke="${cfg.main}" stroke-width="${22 * sc}" stroke-linecap="round"/>
      <path d="M ${cx + 30 + p.rightLeg} ${hipY - 2} C ${cx + 66 + p.rightLeg} ${hipY + 78}, ${cx + 60 + p.rightLeg} ${foot - 28}, ${cx + 48 + p.rightLeg} ${foot - 8}" fill="none" stroke="#0a0c10" stroke-width="${22 * sc}" stroke-linecap="round"/>
      <ellipse cx="${cx - 44 + p.leftLeg}" cy="${foot - 5}" rx="28" ry="9" fill="#2f2219"/>
      <ellipse cx="${cx + 51 + p.rightLeg}" cy="${foot - 5}" rx="28" ry="9" fill="#2f2219"/>
      <path d="M ${cx - 55 * bulk} ${shoulderY} C ${cx - 30} ${shoulderY - 23}, ${cx + 35} ${shoulderY - 24}, ${cx + 56 * bulk} ${shoulderY + 2} L ${cx + 43 * bulk} ${hipY + 23} C ${cx + 18} ${hipY + 43}, ${cx - 22} ${hipY + 42}, ${cx - 45 * bulk} ${hipY + 22} Z" fill="url(#clothGrad)" stroke="#050608" stroke-width="5"/>
      <path d="M ${cx - 48 * bulk} ${shoulderY + 12} C ${cx - 21} ${shoulderY + 24}, ${cx - 22} ${hipY + 25}, ${cx - 42} ${hipY + 17}" fill="${cfg.trim}" opacity=".35"/>
      <path d="M ${cx + 7} ${shoulderY + 5} C ${cx + 35 * bulk} ${shoulderY + 8}, ${cx + 32 * bulk} ${hipY + 20}, ${cx + 3} ${hipY + 31}" fill="#050608" opacity=".4"/>
      <rect x="${cx - 58}" y="${hipY - 11}" width="116" height="18" rx="8" fill="#4c3523"/>
      <rect x="${cx - 12}" y="${hipY - 14}" width="25" height="24" rx="4" fill="${cfg.trim}"/>
      <path d="M ${cx - 49} ${shoulderY + 20} C ${cx - 88 + p.leftArm} ${shoulderY + 58}, ${cx - 88 + p.leftArm} ${shoulderY + 108}, ${cx - 63 + p.leftArm} ${shoulderY + 126}" fill="none" stroke="${cfg.main}" stroke-width="${19 * sc}" stroke-linecap="round"/>
      <path d="M ${cx + 50} ${shoulderY + 20} C ${cx + 84 + p.rightArm} ${shoulderY + 55}, ${cx + 91 + p.rightArm} ${shoulderY + 106}, ${cx + 69 + p.rightArm} ${shoulderY + 125}" fill="none" stroke="${cfg.main}" stroke-width="${19 * sc}" stroke-linecap="round"/>
      <circle cx="${cx - 63 + p.leftArm}" cy="${shoulderY + 126}" r="9" fill="${cfg.skin}"/>
      <circle cx="${cx + 69 + p.rightArm}" cy="${shoulderY + 125}" r="9" fill="${cfg.skin}"/>
      ${weaponSvg(cfg.weapon, cfg, p, cx, shoulderY, hipY)}
      <path d="M ${cx - 45} ${hipY + 12} L ${cx - 8} ${hipY + 28} L ${cx - 26} ${foot - 32} L ${cx - 70} ${foot - 54} Z" fill="#080a0d" opacity=".88"/>
      <path d="M ${cx + 31} ${hipY + 7} L ${cx + 67} ${hipY + 26} L ${cx + 39} ${foot - 44} L ${cx + 2} ${foot - 31} Z" fill="#050609" opacity=".82"/>
      <rect x="${cx - 53}" y="${shoulderY + 42}" width="106" height="13" rx="6" fill="${cfg.cloth}" opacity=".95"/>
      ${helmetSvg(cfg, cx, headY)}
      <ellipse cx="${cx + 2}" cy="${headY}" rx="${30 * sc}" ry="${41 * sc}" fill="${cfg.main}" stroke="#050608" stroke-width="5"/>
      <rect x="${cx - 27}" y="${headY - 9}" width="60" height="16" rx="7" fill="#060708"/>
      <rect x="${cx - 11}" y="${headY - 6}" width="22" height="6" rx="3" fill="${cfg.skin}"/>
      <rect x="${cx + 13}" y="${headY - 6}" width="12" height="5" rx="2" fill="#e8e7d8" opacity=".8"/>
      <path d="M ${cx - 28} ${shoulderY + 37} C ${cx - 20} ${shoulderY + 100}, ${cx - 33} ${hipY + 1}, ${cx - 20} ${hipY + 42}" fill="none" stroke="#fff" stroke-width="2" opacity=".16"/>
      <path d="M ${cx + 23} ${shoulderY + 35} C ${cx + 43} ${shoulderY + 104}, ${cx + 22} ${hipY + 7}, ${cx + 36} ${hipY + 36}" fill="none" stroke="#000" stroke-width="4" opacity=".22"/>
    </g>`;
  return body;
}

function sheetSvg(cfg) {
  const frames = ACTIONS.map((_, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    return `<g transform="translate(${col * FRAME_W} ${row * FRAME_H})">${frameSvg(cfg, i)}</g>`;
  }).join('\n');

  return `<!doctype html><html><body style="margin:0;background:transparent"><svg xmlns="http://www.w3.org/2000/svg" width="${SHEET_W}" height="${SHEET_H}" viewBox="0 0 ${SHEET_W} ${SHEET_H}">
    <defs>
      <linearGradient id="clothGrad" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${cfg.trim}"/><stop offset=".34" stop-color="${cfg.main}"/><stop offset="1" stop-color="#050608"/></linearGradient>
      <linearGradient id="steel" x1="0" x2="1"><stop offset="0" stop-color="#3f464b"/><stop offset=".42" stop-color="#d7dee0"/><stop offset="1" stop-color="#6e777b"/></linearGradient>
      <linearGradient id="blade" x1="0" x2="1"><stop offset="0" stop-color="#eef4f5"/><stop offset=".5" stop-color="#8f9da3"/><stop offset="1" stop-color="#f9ffff"/></linearGradient>
    </defs>
    ${frames}
  </svg></body></html>`;
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: SHEET_W, height: SHEET_H }, deviceScaleFactor: 1 });
  for (const cfg of Object.values(ENEMIES)) {
    await page.setContent(sheetSvg(cfg));
    await page.locator('svg').screenshot({ path: `phaser/public/assets/sprites/${cfg.file}`, omitBackground: true });
    console.log(`Generated ${cfg.file} (${cfg.name})`);
  }
  await browser.close();
}

await main();
