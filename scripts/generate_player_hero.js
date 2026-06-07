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
    return { action: 'idle', bob: Math.sin(t) * 2, lean: Math.sin(t) * 1.5, leftLeg: -4, rightLeg: 4, leftArm: -4, rightArm: 3, scarf: 22 + Math.sin(t) * 7, blade: -8 };
  }
  if (index < 16) {
    const i = index - 8;
    const stride = Math.sin((i / 8) * Math.PI * 2);
    return { action: 'run', bob: Math.abs(stride) * -4, lean: 7, leftLeg: stride * 27, rightLeg: -stride * 27, leftArm: -stride * 18 - 8, rightArm: stride * 17 + 8, scarf: 38, blade: 5 };
  }
  if (index < 22) {
    const i = index - 16;
    return { action: 'jump', bob: -12 - i * 3, lean: 3, leftLeg: -10 + i * 2, rightLeg: 16 - i * 2, leftArm: -18, rightArm: 7, scarf: 42, blade: -18 + i * 4 };
  }
  if (index < 28) {
    const i = index - 22;
    return { action: 'fall', bob: 2 + i, lean: -3, leftLeg: -12, rightLeg: 14, leftArm: -8, rightArm: 10, scarf: 48, blade: i < 2 ? -8 : null };
  }
  if (index < 36) {
    const i = index - 28;
    return { action: 'slashA', lean: 2 + i, leftLeg: -8, rightLeg: 14, leftArm: -12, rightArm: 20 + i * 5, scarf: 34 + i * 4, blade: 18 + i * 6, slash: i > 1, slashY: -34 + i * 8 };
  }
  if (index < 44) {
    const i = index - 36;
    return { action: 'slashB', lean: 8, leftLeg: -16, rightLeg: 20, leftArm: -24, rightArm: 38, scarf: 50, blade: -28 + i * 8, slash: true, slashY: -48 + i * 9 };
  }
  if (index < 52) {
    const i = index - 44;
    return { action: 'slashC', lean: 12, leftLeg: -12, rightLeg: 30, leftArm: -28, rightArm: 54, scarf: 62, blade: 38, slash: true, slashY: -8 + i * 4, afterimage: true };
  }
  if (index < 58) {
    const i = index - 52;
    return { action: 'wave', lean: 2, leftLeg: -4, rightLeg: 5, leftArm: -8, rightArm: 16, scarf: 24, blade: -4, wave: i > 1, waveSize: 20 + i * 12 };
  }
  if (index === 58) return { action: 'uppercut', bob: -28, lean: 10, leftLeg: -8, rightLeg: 24, leftArm: -12, rightArm: 18, scarf: 55, blade: -52, slash: true, slashY: -62 };
  if (index === 59) return { action: 'hurt', bob: 7, lean: -15, leftLeg: -10, rightLeg: 10, leftArm: -22, rightArm: -20, scarf: 32, blade: null };
  return { action: 'guard', lean: -1, leftLeg: -3, rightLeg: 4, leftArm: -8, rightArm: 6, scarf: 18, blade: -70, guard: true };
}

function frameSvg(index) {
  const p = poseForFrame(index);
  const cx = 128;
  const foot = 232 + (p.bob || 0);
  const shoulderY = foot - 131;
  const hipY = foot - 62;
  const headY = shoulderY - 36;
  const lean = p.lean || 0;
  const leftKnee = [cx - 18 + (p.leftLeg || 0) * 0.45, hipY + 48];
  const leftFoot = [cx - 31 + (p.leftLeg || 0), foot - 5];
  const rightKnee = [cx + 18 + (p.rightLeg || 0) * 0.45, hipY + 47];
  const rightFoot = [cx + 30 + (p.rightLeg || 0), foot - 5];
  const leftHand = [cx - 44 + (p.leftArm || 0), shoulderY + 63 + Math.abs(p.leftArm || 0) * 0.2];
  const rightHand = [cx + 43 + (p.rightArm || 0), shoulderY + 54 - Math.abs(p.rightArm || 0) * 0.18];
  const blade = p.blade === null ? '' : `<path d="M ${rightHand[0] - 1} ${rightHand[1] - 2} L ${rightHand[0] + 76 + (p.blade || 0)} ${rightHand[1] - 62 - (p.blade || 0) * 0.15} L ${rightHand[0] + 86 + (p.blade || 0)} ${rightHand[1] - 66 - (p.blade || 0) * 0.15} L ${rightHand[0] + 12} ${rightHand[1] + 2} Z" fill="url(#blade)" stroke="#eff8fb" stroke-width="1.4"/>`;
  const slash = p.slash ? `<ellipse cx="${cx + 52}" cy="${shoulderY + (p.slashY || 0)}" rx="78" ry="18" fill="#d9f6ff" opacity=".25" transform="rotate(-12 ${cx + 52} ${shoulderY + (p.slashY || 0)})"/><ellipse cx="${cx + 58}" cy="${shoulderY + (p.slashY || 0) - 3}" rx="52" ry="6" fill="#fff" opacity=".35" transform="rotate(-12 ${cx + 58} ${shoulderY + (p.slashY || 0) - 3})"/>` : '';
  const wave = p.wave ? `<circle cx="${rightHand[0] + 42}" cy="${rightHand[1] - 8}" r="${p.waveSize}" fill="none" stroke="#9ff8ff" stroke-width="5" opacity=".35"/><circle cx="${rightHand[0] + 43}" cy="${rightHand[1] - 8}" r="${Math.max(8, p.waveSize - 12)}" fill="#a6fff2" opacity=".16"/>` : '';
  const guard = p.guard ? `<ellipse cx="${cx + 40}" cy="${shoulderY + 38}" rx="22" ry="54" fill="#c9f6ff" opacity=".18" stroke="#eaffff" stroke-width="2"/>` : '';
  const afterimage = p.afterimage ? `<g opacity=".18" transform="translate(-26 2)"><ellipse cx="${cx}" cy="${foot + 3}" rx="43" ry="9" fill="#a8dcff"/><path d="M ${cx - 29} ${shoulderY} C ${cx - 15} ${shoulderY - 14}, ${cx + 34} ${shoulderY - 12}, ${cx + 28} ${hipY + 12} L ${cx - 20} ${hipY + 14} Z" fill="#69717f"/></g>` : '';

  return `<g>
    <ellipse cx="${cx}" cy="${foot + 5}" rx="47" ry="9" fill="#000" opacity=".28"/>
    ${afterimage}${slash}${wave}
    <g transform="rotate(${lean} ${cx} ${hipY})">
      <path d="M ${cx - 12} ${hipY} C ${leftKnee[0]} ${leftKnee[1]}, ${leftFoot[0]} ${leftFoot[1] - 18}, ${leftFoot[0]} ${leftFoot[1]}" fill="none" stroke="#070a0f" stroke-width="14" stroke-linecap="round"/>
      <path d="M ${cx + 13} ${hipY} C ${rightKnee[0]} ${rightKnee[1]}, ${rightFoot[0]} ${rightFoot[1] - 17}, ${rightFoot[0]} ${rightFoot[1]}" fill="none" stroke="#1a1e26" stroke-width="14" stroke-linecap="round"/>
      <ellipse cx="${leftFoot[0] + 6}" cy="${leftFoot[1] + 1}" rx="18" ry="6" fill="#3b2b1d"/>
      <ellipse cx="${rightFoot[0] + 6}" cy="${rightFoot[1] + 1}" rx="18" ry="6" fill="#3b2b1d"/>
      <path d="M ${cx - 30} ${shoulderY + 2} C ${cx - 10} ${shoulderY - 12}, ${cx + 32} ${shoulderY - 10}, ${cx + 30} ${shoulderY + 4} L ${cx + 23} ${hipY + 16} C ${cx + 4} ${hipY + 25}, ${cx - 18} ${hipY + 23}, ${cx - 29} ${hipY + 12} Z" fill="url(#cloth)" stroke="#040608" stroke-width="3"/>
      <path d="M ${cx - 29} ${shoulderY + 7} C ${cx - 9} ${shoulderY + 16}, ${cx - 9} ${hipY + 14}, ${cx - 24} ${hipY + 12}" fill="#59606a" opacity=".38"/>
      <rect x="${cx - 27}" y="${hipY - 8}" width="55" height="12" rx="5" fill="#442f21"/>
      <rect x="${cx - 6}" y="${hipY - 10}" width="14" height="16" rx="3" fill="url(#steel)"/>
      <path d="M ${cx - 31} ${hipY + 1} L ${cx - 7} ${hipY + 10} L ${cx - 18} ${foot - 20} L ${cx - 48} ${foot - 36} Z" fill="#05070b" opacity=".9"/>
      <path d="M ${cx + 23} ${hipY + 1} L ${cx + 44} ${hipY + 10} L ${cx + 34} ${foot - 29} L ${cx + 6} ${foot - 22} Z" fill="#05070b" opacity=".82"/>
      <path d="M ${cx - 23} ${shoulderY + 11} C ${cx - 38} ${shoulderY + 28}, ${leftHand[0] - 5} ${leftHand[1] - 14}, ${leftHand[0]} ${leftHand[1]}" fill="none" stroke="#090c12" stroke-width="12" stroke-linecap="round"/>
      <path d="M ${cx + 24} ${shoulderY + 10} C ${cx + 38} ${shoulderY + 28}, ${rightHand[0] - 4} ${rightHand[1] - 12}, ${rightHand[0]} ${rightHand[1]}" fill="none" stroke="#20252d" stroke-width="12" stroke-linecap="round"/>
      <circle cx="${leftHand[0]}" cy="${leftHand[1]}" r="5" fill="#c7976d"/>
      <circle cx="${rightHand[0]}" cy="${rightHand[1]}" r="5" fill="#c7976d"/>
      ${blade}${guard}
      <path d="M ${cx - 20} ${shoulderY + 2} L ${cx - 68 - (p.scarf || 0)} ${shoulderY - 18} Q ${cx - 56} ${shoulderY + 8}, ${cx - 18} ${shoulderY + 14}" fill="#8f1f2a" opacity=".95"/>
      <rect x="${cx - 19}" y="${shoulderY + 2}" width="41" height="15" rx="6" fill="#9d2630"/>
      <ellipse cx="${cx + 1}" cy="${headY}" rx="23" ry="31" fill="#05070b" stroke="#111722" stroke-width="3"/>
      <ellipse cx="${cx + 4}" cy="${headY - 1}" rx="17" ry="25" fill="#20252d"/>
      <rect x="${cx - 17}" y="${headY - 6}" width="39" height="11" rx="5" fill="#050608"/>
      <rect x="${cx - 7}" y="${headY - 4}" width="15" height="5" rx="2" fill="#cb9a70"/>
      <rect x="${cx + 8}" y="${headY - 4}" width="8" height="4" rx="2" fill="#edf5f0" opacity=".85"/>
      <path d="M ${cx - 20} ${headY - 20} L ${cx + 8} ${headY - 35} L ${cx + 25} ${headY - 15} Z" fill="#05070b"/>
      <path d="M ${cx - 14} ${shoulderY + 14} C ${cx - 20} ${shoulderY + 70}, ${cx - 15} ${hipY + 2}, ${cx - 22} ${hipY + 25}" fill="none" stroke="#fff" stroke-width="1.5" opacity=".14"/>
      <path d="M ${cx + 12} ${shoulderY + 13} C ${cx + 28} ${shoulderY + 78}, ${cx + 17} ${hipY + 4}, ${cx + 32} ${hipY + 25}" fill="none" stroke="#000" stroke-width="3" opacity=".22"/>
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
      <linearGradient id="cloth" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#676f7b"/><stop offset=".32" stop-color="#1d222b"/><stop offset="1" stop-color="#05070b"/></linearGradient>
      <linearGradient id="steel" x1="0" x2="1"><stop offset="0" stop-color="#3d444a"/><stop offset=".44" stop-color="#e6eef0"/><stop offset="1" stop-color="#6e777d"/></linearGradient>
      <linearGradient id="blade" x1="0" x2="1"><stop offset="0" stop-color="#f9ffff"/><stop offset=".42" stop-color="#84949c"/><stop offset="1" stop-color="#ecffff"/></linearGradient>
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
  console.log('Generated player_hero_hd.png (SVG-rendered hero sheet)');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await generatePlayerHeroSheet();
}
