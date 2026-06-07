import { chromium } from 'playwright';
import { pathToFileURL } from 'url';

const FRAME_W = 256;
const FRAME_H = 256;
const SHEET_COLS = 8;
const SHEET_ROWS = 8;
const SHEET_W = FRAME_W * SHEET_COLS;
const SHEET_H = FRAME_H * SHEET_ROWS;

function poseForFrame(index) {
  if (index < 8) {
    const t = (index / 8) * Math.PI * 2;
    return { bob: Math.sin(t) * 2, lean: Math.sin(t) * 1.2, legL: -5, legR: 5, armL: -4, armR: 3, scarf: 24 + Math.sin(t) * 7, blade: -8 };
  }
  if (index < 16) {
    const stride = Math.sin(((index - 8) / 8) * Math.PI * 2);
    return { bob: -Math.abs(stride) * 5, lean: 7, legL: stride * 28, legR: -stride * 28, armL: -stride * 20 - 8, armR: stride * 19 + 8, scarf: 42, blade: 4, speed: true };
  }
  if (index < 22) {
    const i = index - 16;
    return { bob: -13 - i * 3, lean: 3, legL: -12 + i * 2, legR: 17 - i * 2, armL: -20, armR: 8, scarf: 44, blade: -18 + i * 5 };
  }
  if (index < 28) {
    const i = index - 22;
    return { bob: 3 + i, lean: -4, legL: -13, legR: 15, armL: -9, armR: 11, scarf: 50, blade: i < 2 ? -8 : null };
  }
  if (index < 36) {
    const i = index - 28;
    return { lean: 2 + i, legL: -9, legR: 15, armL: -13, armR: 22 + i * 6, scarf: 36 + i * 4, blade: 18 + i * 6, slash: i > 1, slashY: -36 + i * 8 };
  }
  if (index < 44) {
    const i = index - 36;
    return { lean: 8, legL: -18, legR: 22, armL: -26, armR: 42, scarf: 52, blade: -30 + i * 8, slash: true, slashY: -52 + i * 9 };
  }
  if (index < 52) {
    const i = index - 44;
    return { lean: 13, legL: -12, legR: 32, armL: -30, armR: 58, scarf: 64, blade: 40, slash: true, slashY: -12 + i * 4, afterimage: true };
  }
  if (index < 58) {
    const i = index - 52;
    return { lean: 2, legL: -5, legR: 6, armL: -9, armR: 18, scarf: 27, blade: -4, cast: i > 1, castSize: 18 + i * 10 };
  }
  if (index === 58) return { bob: -30, lean: 11, legL: -9, legR: 25, armL: -13, armR: 20, scarf: 56, blade: -54, slash: true, slashY: -64 };
  if (index === 59) return { bob: 8, lean: -16, legL: -12, legR: 11, armL: -24, armR: -22, scarf: 34, blade: null, hurt: true };
  return { lean: -1, legL: -4, legR: 5, armL: -10, armR: 8, scarf: 20, blade: -72, guard: true };
}

function frameSvg(index) {
  const p = poseForFrame(index);
  const cx = 128;
  const foot = 231 + (p.bob || 0);
  const shoulderY = foot - 134;
  const hipY = foot - 61;
  const headY = shoulderY - 35;
  const lean = p.lean || 0;
  const leftFoot = [cx - 31 + (p.legL || 0), foot - 5];
  const rightFoot = [cx + 32 + (p.legR || 0), foot - 5];
  const leftKnee = [cx - 17 + (p.legL || 0) * 0.45, hipY + 47];
  const rightKnee = [cx + 20 + (p.legR || 0) * 0.45, hipY + 47];
  const leftHand = [cx - 47 + (p.armL || 0), shoulderY + 65 + Math.abs(p.armL || 0) * 0.18];
  const rightHand = [cx + 47 + (p.armR || 0), shoulderY + 55 - Math.abs(p.armR || 0) * 0.18];

  const blade = p.blade === null ? '' : `<path d="M ${rightHand[0] - 2} ${rightHand[1]} L ${rightHand[0] + 78 + (p.blade || 0)} ${rightHand[1] - 64 - (p.blade || 0) * 0.16} L ${rightHand[0] + 91 + (p.blade || 0)} ${rightHand[1] - 68 - (p.blade || 0) * 0.16} L ${rightHand[0] + 12} ${rightHand[1] + 6} Z" fill="url(#blade)" stroke="#f7ffff" stroke-width="1.8"/><rect x="${rightHand[0] - 5}" y="${rightHand[1] - 4}" width="27" height="8" rx="4" fill="#503721" transform="rotate(-24 ${rightHand[0] + 8} ${rightHand[1]})"/>`;
  const slash = p.slash ? `<ellipse cx="${cx + 55}" cy="${shoulderY + (p.slashY || 0)}" rx="80" ry="18" fill="#d9f8ff" opacity=".24" transform="rotate(-13 ${cx + 55} ${shoulderY + (p.slashY || 0)})"/><path d="M ${cx - 2} ${shoulderY + (p.slashY || 0) + 12} C ${cx + 32} ${shoulderY + (p.slashY || 0) - 8}, ${cx + 78} ${shoulderY + (p.slashY || 0) - 10}, ${cx + 124} ${shoulderY + (p.slashY || 0) + 3}" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".35"/>` : '';
  const cast = p.cast ? `<circle cx="${rightHand[0] + 40}" cy="${rightHand[1] - 8}" r="${p.castSize}" fill="none" stroke="#9ff8ff" stroke-width="5" opacity=".33"/><path d="M ${rightHand[0] + 12} ${rightHand[1] - 8} C ${rightHand[0] + 37} ${rightHand[1] - 25}, ${rightHand[0] + 62} ${rightHand[1] - 18}, ${rightHand[0] + 82} ${rightHand[1] - 8}" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".58"/>` : '';
  const guard = p.guard ? `<ellipse cx="${cx + 43}" cy="${shoulderY + 38}" rx="24" ry="55" fill="#c9f6ff" opacity=".18" stroke="#eaffff" stroke-width="3"/>` : '';
  const afterimage = p.afterimage || p.speed ? `<g opacity=".16" transform="translate(-28 2)"><ellipse cx="${cx}" cy="${foot + 4}" rx="48" ry="10" fill="#8fdfff"/><path d="M ${cx - 36} ${shoulderY + 3} C ${cx - 14} ${shoulderY - 15}, ${cx + 39} ${shoulderY - 12}, ${cx + 36} ${hipY + 16} L ${cx - 27} ${hipY + 17} Z" fill="#7a8392"/></g>` : '';
  const hurt = p.hurt ? `<path d="M ${cx - 63} ${shoulderY - 19} l -14 -11 M ${cx - 57} ${shoulderY - 32} l -15 -20" stroke="#ff6b7d" stroke-width="4" stroke-linecap="round" opacity=".75"/>` : '';

  return `<g>
    <ellipse cx="${cx}" cy="${foot + 5}" rx="51" ry="10" fill="#000" opacity=".3"/>
    ${afterimage}${slash}${cast}${hurt}
    <g transform="rotate(${lean} ${cx} ${hipY})">
      <path d="M ${cx - 14} ${hipY} C ${leftKnee[0]} ${leftKnee[1]}, ${leftFoot[0]} ${leftFoot[1] - 18}, ${leftFoot[0]} ${leftFoot[1]}" fill="none" stroke="#080a0e" stroke-width="18" stroke-linecap="round"/>
      <path d="M ${cx + 15} ${hipY} C ${rightKnee[0]} ${rightKnee[1]}, ${rightFoot[0]} ${rightFoot[1] - 18}, ${rightFoot[0]} ${rightFoot[1]}" fill="none" stroke="#1c222b" stroke-width="18" stroke-linecap="round"/>
      <path d="M ${leftKnee[0] - 10} ${leftKnee[1] - 8} L ${leftKnee[0] + 14} ${leftKnee[1] - 3} L ${leftFoot[0] + 13} ${leftFoot[1] - 14} L ${leftFoot[0] - 14} ${leftFoot[1] - 19} Z" fill="#2f3742" opacity=".9"/>
      <path d="M ${rightKnee[0] - 12} ${rightKnee[1] - 7} L ${rightKnee[0] + 14} ${rightKnee[1] - 4} L ${rightFoot[0] + 14} ${rightFoot[1] - 15} L ${rightFoot[0] - 12} ${rightFoot[1] - 18} Z" fill="#111722" opacity=".92"/>
      <ellipse cx="${leftFoot[0] + 7}" cy="${leftFoot[1] + 1}" rx="21" ry="7" fill="#3d2b1d"/>
      <ellipse cx="${rightFoot[0] + 7}" cy="${rightFoot[1] + 1}" rx="21" ry="7" fill="#3d2b1d"/>
      <path d="M ${cx - 41} ${shoulderY + 5} C ${cx - 18} ${shoulderY - 19}, ${cx + 41} ${shoulderY - 17}, ${cx + 43} ${shoulderY + 7} L ${cx + 30} ${hipY + 20} C ${cx + 7} ${hipY + 32}, ${cx - 23} ${hipY + 29}, ${cx - 36} ${hipY + 15} Z" fill="url(#cloth)" stroke="#030508" stroke-width="4"/>
      <path d="M ${cx - 43} ${shoulderY + 4} C ${cx - 31} ${shoulderY - 7}, ${cx - 11} ${shoulderY - 9}, ${cx + 1} ${shoulderY - 3} L ${cx - 9} ${hipY + 23} L ${cx - 37} ${hipY + 13} Z" fill="#6a7280" opacity=".32"/>
      <path d="M ${cx + 6} ${shoulderY - 4} C ${cx + 30} ${shoulderY - 7}, ${cx + 44} ${shoulderY + 4}, ${cx + 42} ${shoulderY + 17} L ${cx + 24} ${hipY + 20} L ${cx - 2} ${hipY + 25} Z" fill="#05070b" opacity=".45"/>
      <path d="M ${cx - 46} ${shoulderY + 8} C ${cx - 61} ${shoulderY + 14}, ${cx - 64} ${shoulderY + 31}, ${cx - 52} ${shoulderY + 40} C ${cx - 35} ${shoulderY + 33}, ${cx - 31} ${shoulderY + 18}, ${cx - 46} ${shoulderY + 8} Z" fill="url(#steel)" opacity=".9"/>
      <path d="M ${cx + 40} ${shoulderY + 7} C ${cx + 59} ${shoulderY + 13}, ${cx + 64} ${shoulderY + 30}, ${cx + 51} ${shoulderY + 41} C ${cx + 33} ${shoulderY + 33}, ${cx + 29} ${shoulderY + 18}, ${cx + 40} ${shoulderY + 7} Z" fill="#2d3641" stroke="#6f7c86" stroke-width="2"/>
      <rect x="${cx - 32}" y="${hipY - 8}" width="66" height="13" rx="6" fill="#482f1e"/>
      <rect x="${cx - 8}" y="${hipY - 11}" width="17" height="18" rx="3" fill="url(#steel)"/>
      <path d="M ${cx - 33} ${hipY + 2} L ${cx - 7} ${hipY + 11} L ${cx - 19} ${foot - 18} L ${cx - 52} ${foot - 38} Z" fill="#05070b" opacity=".95"/>
      <path d="M ${cx + 26} ${hipY + 2} L ${cx + 48} ${hipY + 11} L ${cx + 36} ${foot - 30} L ${cx + 7} ${foot - 23} Z" fill="#05070b" opacity=".88"/>
      <path d="M ${cx - 27} ${shoulderY + 13} C ${cx - 41} ${shoulderY + 31}, ${leftHand[0] - 7} ${leftHand[1] - 14}, ${leftHand[0]} ${leftHand[1]}" fill="none" stroke="#090c12" stroke-width="15" stroke-linecap="round"/>
      <path d="M ${cx + 28} ${shoulderY + 12} C ${cx + 43} ${shoulderY + 30}, ${rightHand[0] - 6} ${rightHand[1] - 12}, ${rightHand[0]} ${rightHand[1]}" fill="none" stroke="#222935" stroke-width="15" stroke-linecap="round"/>
      <rect x="${leftHand[0] - 9}" y="${leftHand[1] - 8}" width="18" height="14" rx="6" fill="#4e3424"/>
      <rect x="${rightHand[0] - 9}" y="${rightHand[1] - 8}" width="18" height="14" rx="6" fill="#4e3424"/>
      ${blade}${guard}
      <path d="M ${cx - 21} ${shoulderY + 4} L ${cx - 72 - (p.scarf || 0)} ${shoulderY - 18} Q ${cx - 62} ${shoulderY + 13}, ${cx - 19} ${shoulderY + 17}" fill="#971e2d" opacity=".98"/>
      <path d="M ${cx - 20} ${shoulderY + 9} L ${cx - 55 - (p.scarf || 0) * 0.65} ${shoulderY + 13} Q ${cx - 45} ${shoulderY + 28}, ${cx - 12} ${shoulderY + 19}" fill="#c13c45" opacity=".86"/>
      <rect x="${cx - 22}" y="${shoulderY + 1}" width="46" height="17" rx="7" fill="#a42631"/>
      <ellipse cx="${cx + 1}" cy="${headY}" rx="25" ry="32" fill="#05070b" stroke="#111722" stroke-width="4"/>
      <ellipse cx="${cx + 4}" cy="${headY - 1}" rx="19" ry="26" fill="#222936"/>
      <path d="M ${cx - 23} ${headY - 8} L ${cx + 25} ${headY - 8} L ${cx + 18} ${headY + 6} L ${cx - 21} ${headY + 6} Z" fill="#050608"/>
      <rect x="${cx - 9}" y="${headY - 5}" width="17" height="6" rx="2" fill="#d2a076"/>
      <rect x="${cx + 9}" y="${headY - 5}" width="9" height="5" rx="2" fill="#f1fff6" opacity=".88"/>
      <path d="M ${cx - 21} ${headY - 20} L ${cx + 9} ${headY - 37} L ${cx + 27} ${headY - 16} Z" fill="#05070b"/>
      <path d="M ${cx - 15} ${shoulderY + 14} C ${cx - 22} ${shoulderY + 72}, ${cx - 16} ${hipY + 2}, ${cx - 23} ${hipY + 25}" fill="none" stroke="#fff" stroke-width="1.6" opacity=".14"/>
      <path d="M ${cx + 12} ${shoulderY + 13} C ${cx + 30} ${shoulderY + 80}, ${cx + 18} ${hipY + 4}, ${cx + 33} ${hipY + 25}" fill="none" stroke="#000" stroke-width="4" opacity=".24"/>
    </g>
  </g>`;
}

function sheetSvg() {
  const frames = Array.from({ length: SHEET_COLS * SHEET_ROWS }, (_, i) => {
    const col = i % SHEET_COLS;
    const row = Math.floor(i / SHEET_COLS);
    return `<g transform="translate(${col * FRAME_W} ${row * FRAME_H})">${frameSvg(i)}</g>`;
  }).join('\n');

  return `<!doctype html><html><body style="margin:0;background:transparent"><svg xmlns="http://www.w3.org/2000/svg" width="${SHEET_W}" height="${SHEET_H}" viewBox="0 0 ${SHEET_W} ${SHEET_H}">
    <defs>
      <linearGradient id="cloth" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#707a88"/><stop offset=".28" stop-color="#242b36"/><stop offset="1" stop-color="#05070b"/></linearGradient>
      <linearGradient id="steel" x1="0" x2="1"><stop offset="0" stop-color="#323b43"/><stop offset=".45" stop-color="#dce8eb"/><stop offset="1" stop-color="#6e7a82"/></linearGradient>
      <linearGradient id="blade" x1="0" x2="1"><stop offset="0" stop-color="#f9ffff"/><stop offset=".42" stop-color="#80929c"/><stop offset="1" stop-color="#ecffff"/></linearGradient>
    </defs>
    ${frames}
  </svg></body></html>`;
}

export async function generatePlayerHeroSheet() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: SHEET_W, height: SHEET_H }, deviceScaleFactor: 1 });
  await page.setContent(sheetSvg());
  await page.locator('svg').screenshot({ path: 'public/assets/sprites/player_hero_hd.png', omitBackground: true });
  await browser.close();
  console.log('Generated player_hero_hd.png (redesigned SVG-rendered hero sheet)');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await generatePlayerHeroSheet();
}
