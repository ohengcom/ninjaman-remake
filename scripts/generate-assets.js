import fs from 'fs';
import path from 'path';

const publicDir = path.join(process.cwd(), 'public');
const assetsDir = path.join(publicDir, 'assets');
const outDir = path.join(assetsDir, 'sprites');
const bgDir = path.join(assetsDir, 'backgrounds');

[publicDir, assetsDir, outDir, bgDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ==========================================
// SHARED SVG DEFS (Catppuccin Mocha palette)
// ==========================================

const SHARED_DEFS = `
  <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="4.5" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="heavyGoldGlow" x="-80%" y="-80%" width="260%" height="260%">
    <feGaussianBlur stdDeviation="7" result="blur1"/>
    <feGaussianBlur stdDeviation="2.5" result="blur2"/>
    <feMerge><feMergeNode in="blur1"/><feMergeNode in="blur2"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="sakuraGlow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="4" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="inkMisty" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="1.8"/>
  </filter>
  <filter id="redGlow" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="3.5" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <linearGradient id="inkWashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#313244"/><stop offset="60%" stop-color="#11111b"/><stop offset="100%" stop-color="#11111b"/>
  </linearGradient>
  <linearGradient id="inkWashLight" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#6c7086"/><stop offset="50%" stop-color="#45475a"/><stop offset="100%" stop-color="#1e1e2e"/>
  </linearGradient>
  <linearGradient id="spiritGold" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#cdd6f4"/><stop offset="35%" stop-color="#f9e2af"/><stop offset="75%" stop-color="#fab387"/><stop offset="100%" stop-color="#fab387"/>
  </linearGradient>
  <linearGradient id="sacredMaple" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#f38ba8"/><stop offset="50%" stop-color="#fab387"/><stop offset="100%" stop-color="#eba0ac"/>
  </linearGradient>
  <linearGradient id="sakuraBlade" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#cdd6f4"/><stop offset="40%" stop-color="#f2cdcd"/><stop offset="85%" stop-color="#f5c2e7"/><stop offset="100%" stop-color="#cba6f7"/>
  </linearGradient>
  <linearGradient id="crimsonGaze" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#f38ba8"/><stop offset="60%" stop-color="#eba0ac"/><stop offset="100%" stop-color="#1e1e2e"/>
  </linearGradient>
`;

// ==========================================
// COMPONENT DRAWING HELPERS
// ==========================================

function drawHat(cx, cy, angle = 0) {
  return `<g transform="rotate(${angle} ${cx} ${cy})">
    <ellipse cx="${cx}" cy="${cy}" rx="22" ry="6" fill="url(#inkWashLight)" stroke="#fab387" stroke-width="1.8"/>
    <path d="M ${cx-22} ${cy} C ${cx-22} ${cy-12} ${cx+22} ${cy-12} ${cx+22} ${cy} Z" fill="url(#inkWashGrad)" stroke="#fab387" stroke-width="1.2"/>
    <line x1="${cx}" y1="${cy-12}" x2="${cx}" y2="${cy+4}" stroke="#fab387" stroke-width="0.8" opacity="0.6"/>
  </g>`;
}

function drawVisor(cx, cy) {
  return `<path d="M ${cx-6} ${cy} L ${cx} ${cy+4} L ${cx+6} ${cy}" fill="none" stroke="#fab387" stroke-width="2.2" filter="url(#heavyGoldGlow)"/>
    <polygon points="${cx-1.5},${cy} ${cx},${cy+2.5} ${cx+1.5},${cy}" fill="#cdd6f4"/>`;
}

function drawBody(cx, cy, lean = 0, scaleY = 1) {
  const h = 28 * scaleY;
  const w = 24;
  return `<g transform="rotate(${lean} ${cx} ${cy})">
    <path d="M ${cx-w/2} ${cy} L ${cx+w/2} ${cy} L ${cx+w/2-4} ${cy+h} L ${cx-w/2+4} ${cy+h} Z" fill="url(#inkWashGrad)" stroke="#fab387" stroke-width="1.2"/>
    <circle cx="${cx}" cy="${cy+h*0.4}" r="5" fill="#fab387" filter="url(#goldGlow)"/>
  </g>`;
}

function drawCape(cx, cy, flowX, flowY, spread = 1) {
  const x1 = cx - 4 + flowX * 0.3;
  const y1 = cy;
  const cpx = cx - 20 * spread + flowX;
  const cpy = cy + 15 + flowY;
  const ex = cx - 10 * spread + flowX * 1.5;
  const ey = cy + 30 + flowY;
  return `<path d="M ${x1} ${y1} C ${cpx} ${cpy} ${ex-5} ${ey-5} ${ex} ${ey} C ${ex+8} ${ey-8} ${x1+6} ${y1+4} ${x1} ${y1}" fill="url(#sacredMaple)" opacity="0.85" filter="url(#sakuraGlow)"/>`;
}

function drawLegs(cx, cy, leftAngle, rightAngle, length = 16) {
  const lx = cx - 6;
  const rx = cx + 6;
  const lRad = leftAngle * Math.PI / 180;
  const rRad = rightAngle * Math.PI / 180;
  const lEndX = lx + Math.sin(lRad) * length;
  const lEndY = cy + Math.cos(lRad) * length;
  const rEndX = rx + Math.sin(rRad) * length;
  const rEndY = cy + Math.cos(rRad) * length;
  return `<line x1="${lx}" y1="${cy}" x2="${lEndX}" y2="${lEndY}" stroke="url(#inkWashLight)" stroke-width="5" stroke-linecap="round"/>
    <line x1="${rx}" y1="${cy}" x2="${rEndX}" y2="${rEndY}" stroke="url(#inkWashLight)" stroke-width="5" stroke-linecap="round"/>
    <circle cx="${lEndX}" cy="${lEndY}" r="2.5" fill="#fab387"/>
    <circle cx="${rEndX}" cy="${rEndY}" r="2.5" fill="#fab387"/>`;
}

function drawArm(cx, cy, angle, length = 14) {
  const rad = angle * Math.PI / 180;
  const ex = cx + Math.cos(rad) * length;
  const ey = cy + Math.sin(rad) * length;
  return `<line x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}" stroke="url(#inkWashLight)" stroke-width="4" stroke-linecap="round"/>
    <circle cx="${ex}" cy="${ey}" r="2.5" fill="#fab387" filter="url(#goldGlow)"/>`;
}

function drawKatana(cx, cy, angle, length = 30) {
  const rad = angle * Math.PI / 180;
  const ex = cx + Math.cos(rad) * length;
  const ey = cy + Math.sin(rad) * length;
  return `<line x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}" stroke="url(#sakuraBlade)" stroke-width="3" stroke-linecap="round" filter="url(#sakuraGlow)"/>
    <line x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}" stroke="#cdd6f4" stroke-width="1.2" stroke-linecap="round"/>`;
}

function drawSlashArc(cx, cy, startAngle, endAngle, radius, opacity = 0.8) {
  const sr = startAngle * Math.PI / 180;
  const er = endAngle * Math.PI / 180;
  const sx = cx + Math.cos(sr) * radius;
  const sy = cy + Math.sin(sr) * radius;
  const ex = cx + Math.cos(er) * radius;
  const ey = cy + Math.sin(er) * radius;
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  return `<path d="M ${sx} ${sy} A ${radius} ${radius} 0 ${largeArc} 1 ${ex} ${ey}" fill="none" stroke="url(#sakuraBlade)" stroke-width="4" opacity="${opacity}" filter="url(#sakuraGlow)"/>`;
}

// ==========================================
// SPRITESHEET GENERATOR
// ==========================================

function generatePlayerSpriteSheet(name, frameCount, frameDrawer) {
  const frameWidth = 120;
  const frameHeight = 120;
  const width = frameWidth * frameCount;
  const height = frameHeight;

  let content = '';
  for (let i = 0; i < frameCount; i++) {
    const x = i * frameWidth;
    content += `<g transform="translate(${x}, 0)"><clipPath id="frame${i}"><rect x="0" y="0" width="${frameWidth}" height="${frameHeight}"/></clipPath><g clip-path="url(#frame${i})">${frameDrawer(i, frameCount)}</g></g>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>${SHARED_DEFS}</defs>
  ${content}
</svg>`;
  fs.writeFileSync(path.join(outDir, `${name}.svg`), svg);
}

// ==========================================
// IDLE ANIMATION (6 frames) - breathing cycle
// ==========================================

function drawIdleFrame(frame, total) {
  const t = frame / total;
  const breathY = Math.sin(t * Math.PI * 2) * 2;
  const capeSwayX = Math.sin(t * Math.PI * 2 + 0.5) * 3;
  const cx = 60, baseY = 40;
  const bodyY = baseY + 10 + breathY;

  let svg = '';
  svg += drawCape(cx, bodyY + 2, capeSwayX, -breathY * 0.5, 0.8);
  svg += drawBody(cx, bodyY, 0, 1);
  svg += drawLegs(cx, bodyY + 28, -5 + Math.sin(t * Math.PI * 2) * 2, 5 - Math.sin(t * Math.PI * 2) * 2, 18);
  svg += drawArm(cx - 12, bodyY + 8, -80 + breathY * 2, 12);
  svg += drawArm(cx + 12, bodyY + 8, -100 - breathY * 2, 12);
  svg += drawKatana(cx - 18, bodyY - 5, -70 + breathY, 28);
  svg += drawHat(cx, baseY + breathY, Math.sin(t * Math.PI * 2) * 1.5);
  svg += drawVisor(cx, baseY + 6 + breathY);
  return svg;
}

// ==========================================
// RUN ANIMATION (8 frames) - sprint cycle
// ==========================================

function drawRunFrame(frame, total) {
  const t = frame / total;
  const phase = t * Math.PI * 2;
  const cx = 60, baseY = 38;
  const bobY = Math.abs(Math.sin(phase)) * 4;
  const lean = 12;
  const bodyY = baseY + 10 - bobY;

  const leftLeg = Math.sin(phase) * 35;
  const rightLeg = Math.sin(phase + Math.PI) * 35;
  const leftArm = Math.sin(phase + Math.PI) * 30 - 90;
  const rightArm = Math.sin(phase) * 30 - 90;
  const capeFlow = -10 - Math.abs(Math.sin(phase)) * 8;

  let svg = '';
  svg += drawCape(cx, bodyY + 2, capeFlow, -bobY * 0.5, 1.2 + Math.sin(phase) * 0.2);
  svg += drawBody(cx, bodyY, lean, 0.95);
  svg += drawLegs(cx + 4, bodyY + 26, leftLeg, rightLeg, 20);
  svg += drawArm(cx - 10, bodyY + 8, leftArm, 13);
  svg += drawArm(cx + 10, bodyY + 8, rightArm, 13);
  svg += drawKatana(cx - 14, bodyY - 2, -50 + Math.sin(phase) * 5, 26);
  svg += drawHat(cx + 3, baseY - bobY, -lean * 0.6);
  svg += drawVisor(cx + 3, baseY + 6 - bobY);
  return svg;
}

// ==========================================
// JUMP ANIMATION (3 frames) - launch/rise/tuck
// ==========================================

function drawJumpFrame(frame) {
  const cx = 60, baseY = 38;
  let svg = '';

  if (frame === 0) {
    // Crouch/launch - compressed body, legs bent
    svg += drawCape(cx, 58, 2, 5, 0.6);
    svg += drawBody(cx, 52, -5, 0.8);
    svg += drawLegs(cx, 72, -25, 25, 14);
    svg += drawArm(cx - 12, 58, -120, 12);
    svg += drawArm(cx + 12, 58, -60, 12);
    svg += drawKatana(cx - 16, 48, -80, 26);
    svg += drawHat(cx, 44, 0);
    svg += drawVisor(cx, 50);
  } else if (frame === 1) {
    // Rising - extended body, arms up
    svg += drawCape(cx, baseY + 14, -5, 8, 1.0);
    svg += drawBody(cx, baseY + 8, -3, 1.05);
    svg += drawLegs(cx, baseY + 36, -10, 10, 16);
    svg += drawArm(cx - 12, baseY + 14, -130, 14);
    svg += drawArm(cx + 12, baseY + 14, -50, 14);
    svg += drawKatana(cx + 16, baseY + 4, -40, 28);
    svg += drawHat(cx, baseY, -3);
    svg += drawVisor(cx, baseY + 6);
  } else {
    // Apex tuck - knees pulled, compact
    svg += drawCape(cx, baseY + 8, -8, 12, 1.3);
    svg += drawBody(cx, baseY + 6, 0, 0.85);
    svg += drawLegs(cx, baseY + 28, -30, 30, 12);
    svg += drawArm(cx - 12, baseY + 12, -100, 10);
    svg += drawArm(cx + 12, baseY + 12, -80, 10);
    svg += drawKatana(cx - 14, baseY, -60, 24);
    svg += drawHat(cx, baseY - 2, 2);
    svg += drawVisor(cx, baseY + 4);
  }
  return svg;
}

// ==========================================
// FALL ANIMATION (3 frames) - spread/descend/brace
// ==========================================

function drawFallFrame(frame) {
  const cx = 60, baseY = 36;
  let svg = '';

  if (frame === 0) {
    svg += drawCape(cx, baseY + 10, -4, -8, 1.4);
    svg += drawBody(cx, baseY + 8, 3, 1.0);
    svg += drawLegs(cx, baseY + 36, -20, 20, 18);
    svg += drawArm(cx - 14, baseY + 14, -140, 14);
    svg += drawArm(cx + 14, baseY + 14, -40, 14);
    svg += drawKatana(cx - 18, baseY + 2, -70, 26);
    svg += drawHat(cx, baseY, 4);
    svg += drawVisor(cx, baseY + 6);
  } else if (frame === 1) {
    svg += drawCape(cx, baseY + 12, -2, -12, 1.2);
    svg += drawBody(cx, baseY + 12, 5, 1.0);
    svg += drawLegs(cx, baseY + 40, -5, 5, 18);
    svg += drawArm(cx - 12, baseY + 18, -110, 12);
    svg += drawArm(cx + 12, baseY + 18, -70, 12);
    svg += drawKatana(cx - 16, baseY + 6, -65, 26);
    svg += drawHat(cx, baseY + 2, 6);
    svg += drawVisor(cx, baseY + 8);
  } else {
    svg += drawCape(cx, baseY + 16, 0, -6, 0.9);
    svg += drawBody(cx, baseY + 16, 8, 0.9);
    svg += drawLegs(cx + 2, baseY + 40, 15, -15, 16);
    svg += drawArm(cx - 12, baseY + 22, -90, 12);
    svg += drawArm(cx + 12, baseY + 22, -90, 12);
    svg += drawKatana(cx - 14, baseY + 10, -55, 24);
    svg += drawHat(cx + 2, baseY + 4, 8);
    svg += drawVisor(cx + 2, baseY + 10);
  }
  return svg;
}

// ==========================================
// DASH ANIMATION (4 frames) - lean/streak/streak/decel
// ==========================================

function drawDashFrame(frame) {
  const cx = 60, baseY = 40;
  let svg = '';

  if (frame === 0) {
    svg += drawCape(cx, baseY + 12, -12, 0, 1.0);
    svg += drawBody(cx, baseY + 10, 20, 0.95);
    svg += drawLegs(cx + 6, baseY + 36, 15, -5, 18);
    svg += drawArm(cx - 8, baseY + 16, -60, 12);
    svg += drawArm(cx + 14, baseY + 16, -120, 12);
    svg += drawKatana(cx - 12, baseY + 4, -45, 26);
    svg += drawHat(cx + 4, baseY + 2, -15);
    svg += drawVisor(cx + 4, baseY + 8);
  } else if (frame === 1) {
    // Speed streak - body stretched, afterimage
    svg += `<ellipse cx="${cx}" cy="${baseY+30}" rx="40" ry="12" fill="url(#spiritGold)" opacity="0.3" filter="url(#goldGlow)"/>`;
    svg += drawCape(cx, baseY + 14, -20, 2, 1.5);
    svg += drawBody(cx + 5, baseY + 12, 30, 0.85);
    svg += drawLegs(cx + 10, baseY + 34, 25, 10, 16);
    svg += drawArm(cx - 4, baseY + 18, -40, 14);
    svg += drawArm(cx + 16, baseY + 18, -130, 10);
    svg += drawKatana(cx - 8, baseY + 6, -30, 28);
    svg += drawHat(cx + 8, baseY + 4, -20);
    svg += drawVisor(cx + 8, baseY + 10);
  } else if (frame === 2) {
    svg += `<ellipse cx="${cx-5}" cy="${baseY+30}" rx="45" ry="10" fill="url(#spiritGold)" opacity="0.5" filter="url(#heavyGoldGlow)"/>`;
    svg += `<path d="M 10 ${baseY+25} L 50 ${baseY+25}" stroke="#cdd6f4" stroke-width="2" opacity="0.6"/>`;
    svg += `<path d="M 5 ${baseY+35} L 45 ${baseY+35}" stroke="#fab387" stroke-width="1.5" opacity="0.4"/>`;
    svg += drawCape(cx, baseY + 14, -25, 4, 1.8);
    svg += drawBody(cx + 8, baseY + 12, 35, 0.8);
    svg += drawLegs(cx + 14, baseY + 32, 30, 15, 14);
    svg += drawArm(cx, baseY + 18, -35, 14);
    svg += drawArm(cx + 18, baseY + 16, -140, 10);
    svg += drawKatana(cx - 4, baseY + 6, -25, 30);
    svg += drawHat(cx + 10, baseY + 4, -25);
    svg += drawVisor(cx + 10, baseY + 10);
  } else {
    svg += `<ellipse cx="${cx-8}" cy="${baseY+30}" rx="30" ry="8" fill="url(#spiritGold)" opacity="0.15"/>`;
    svg += drawCape(cx, baseY + 12, -8, 0, 1.0);
    svg += drawBody(cx + 2, baseY + 10, 15, 0.95);
    svg += drawLegs(cx + 4, baseY + 36, 10, -5, 18);
    svg += drawArm(cx - 10, baseY + 16, -70, 12);
    svg += drawArm(cx + 12, baseY + 16, -110, 12);
    svg += drawKatana(cx - 14, baseY + 4, -55, 26);
    svg += drawHat(cx + 2, baseY + 2, -8);
    svg += drawVisor(cx + 2, baseY + 8);
  }
  return svg;
}

// ==========================================
// DEFEND ANIMATION (3 frames) - raise/form/hold
// ==========================================

function drawDefendFrame(frame) {
  const cx = 60, baseY = 40;
  let svg = '';

  if (frame === 0) {
    svg += drawCape(cx, baseY + 12, 2, 0, 0.7);
    svg += drawBody(cx, baseY + 10, -3, 1.0);
    svg += drawLegs(cx, baseY + 38, -10, 10, 16);
    svg += drawArm(cx - 12, baseY + 14, -100, 12);
    svg += drawArm(cx + 12, baseY + 14, -30, 14);
    svg += drawKatana(cx + 20, baseY + 2, -10, 28);
    svg += drawHat(cx, baseY + 2, 0);
    svg += drawVisor(cx, baseY + 8);
  } else if (frame === 1) {
    svg += drawCape(cx, baseY + 12, 3, 0, 0.6);
    svg += drawBody(cx, baseY + 10, -2, 1.0);
    svg += drawLegs(cx, baseY + 38, -8, 8, 16);
    svg += drawArm(cx - 12, baseY + 14, -90, 12);
    svg += drawArm(cx + 12, baseY + 12, -10, 16);
    svg += drawKatana(cx + 24, baseY - 4, 0, 32);
    svg += `<circle cx="${cx+30}" cy="${baseY+16}" r="18" fill="none" stroke="#fab387" stroke-width="2.5" stroke-dasharray="8 4" opacity="0.6" filter="url(#goldGlow)"/>`;
    svg += drawHat(cx, baseY + 2, -2);
    svg += drawVisor(cx, baseY + 8);
  } else {
    svg += drawCape(cx, baseY + 12, 4, 0, 0.5);
    svg += drawBody(cx, baseY + 10, -2, 1.0);
    svg += drawLegs(cx, baseY + 38, -8, 8, 16);
    svg += drawArm(cx - 12, baseY + 14, -85, 12);
    svg += drawArm(cx + 12, baseY + 10, -5, 18);
    svg += drawKatana(cx + 26, baseY - 8, 5, 34);
    svg += `<circle cx="${cx+32}" cy="${baseY+14}" r="22" fill="none" stroke="#fab387" stroke-width="3.5" stroke-dasharray="12 6" filter="url(#heavyGoldGlow)"/>`;
    svg += `<circle cx="${cx+32}" cy="${baseY+14}" r="14" fill="rgba(250,179,135,0.08)" stroke="#cdd6f4" stroke-width="1" stroke-dasharray="4 3"/>`;
    svg += drawHat(cx, baseY + 2, -2);
    svg += drawVisor(cx, baseY + 8);
  }
  return svg;
}

// ==========================================
// COMBO 1 ANIMATION (4 frames) - horizontal slash
// ==========================================

function drawCombo1Frame(frame) {
  const cx = 60, baseY = 40;
  let svg = '';

  if (frame === 0) {
    // Wind-up: pull back
    svg += drawCape(cx, baseY + 12, 6, 0, 0.8);
    svg += drawBody(cx, baseY + 10, -8, 1.0);
    svg += drawLegs(cx, baseY + 38, -5, 5, 17);
    svg += drawArm(cx - 14, baseY + 14, -140, 14);
    svg += drawArm(cx + 10, baseY + 14, -80, 12);
    svg += drawKatana(cx - 20, baseY - 2, -120, 30);
    svg += drawHat(cx - 2, baseY + 2, 5);
    svg += drawVisor(cx - 2, baseY + 8);
  } else if (frame === 1) {
    // Swing mid
    svg += drawSlashArc(cx + 10, baseY + 15, -30, 30, 35, 0.6);
    svg += drawCape(cx, baseY + 12, -4, 0, 1.0);
    svg += drawBody(cx + 2, baseY + 10, 5, 1.0);
    svg += drawLegs(cx + 2, baseY + 38, 5, -5, 17);
    svg += drawArm(cx - 10, baseY + 14, -60, 14);
    svg += drawArm(cx + 14, baseY + 12, -20, 16);
    svg += drawKatana(cx + 22, baseY + 2, 10, 34);
    svg += drawHat(cx + 2, baseY + 2, -3);
    svg += drawVisor(cx + 2, baseY + 8);
  } else if (frame === 2) {
    // Full extension
    svg += drawSlashArc(cx + 15, baseY + 15, -10, 60, 40, 0.9);
    svg += drawCape(cx, baseY + 12, -8, 0, 1.2);
    svg += drawBody(cx + 4, baseY + 10, 12, 0.95);
    svg += drawLegs(cx + 4, baseY + 36, 10, -8, 17);
    svg += drawArm(cx - 8, baseY + 14, -40, 14);
    svg += drawArm(cx + 16, baseY + 10, 10, 18);
    svg += drawKatana(cx + 28, baseY + 6, 30, 36);
    svg += drawHat(cx + 3, baseY + 2, -6);
    svg += drawVisor(cx + 3, baseY + 8);
  } else {
    // Recovery
    svg += drawCape(cx, baseY + 12, -3, 0, 0.9);
    svg += drawBody(cx + 2, baseY + 10, 4, 1.0);
    svg += drawLegs(cx + 2, baseY + 38, 3, -3, 17);
    svg += drawArm(cx - 10, baseY + 14, -70, 12);
    svg += drawArm(cx + 12, baseY + 14, -50, 14);
    svg += drawKatana(cx + 18, baseY + 4, 15, 28);
    svg += drawHat(cx + 1, baseY + 2, -2);
    svg += drawVisor(cx + 1, baseY + 8);
  }
  return svg;
}

// ==========================================
// COMBO 2 ANIMATION (4 frames) - upward diagonal slash
// ==========================================

function drawCombo2Frame(frame) {
  const cx = 60, baseY = 40;
  let svg = '';

  if (frame === 0) {
    svg += drawCape(cx, baseY + 12, 4, 2, 0.8);
    svg += drawBody(cx, baseY + 12, -5, 0.95);
    svg += drawLegs(cx, baseY + 38, -8, 8, 16);
    svg += drawArm(cx - 12, baseY + 16, -110, 14);
    svg += drawArm(cx + 10, baseY + 16, -90, 12);
    svg += drawKatana(cx - 16, baseY + 20, -150, 28);
    svg += drawHat(cx, baseY + 2, 3);
    svg += drawVisor(cx, baseY + 8);
  } else if (frame === 1) {
    svg += drawSlashArc(cx + 5, baseY + 20, -120, -60, 30, 0.6);
    svg += drawCape(cx, baseY + 12, -2, 2, 1.0);
    svg += drawBody(cx, baseY + 10, -2, 1.0);
    svg += drawLegs(cx, baseY + 38, -5, 5, 17);
    svg += drawArm(cx - 10, baseY + 14, -130, 14);
    svg += drawArm(cx + 12, baseY + 12, -50, 16);
    svg += drawKatana(cx + 14, baseY - 4, -50, 32);
    svg += drawHat(cx, baseY + 2, -2);
    svg += drawVisor(cx, baseY + 8);
  } else if (frame === 2) {
    svg += drawSlashArc(cx + 10, baseY + 10, -150, -30, 38, 0.9);
    svg += drawCape(cx, baseY + 12, -6, 4, 1.2);
    svg += drawBody(cx, baseY + 8, -8, 1.05);
    svg += drawLegs(cx, baseY + 38, -3, 3, 17);
    svg += drawArm(cx - 10, baseY + 12, -140, 14);
    svg += drawArm(cx + 14, baseY + 8, -80, 18);
    svg += drawKatana(cx + 10, baseY - 14, -80, 36);
    svg += drawHat(cx - 1, baseY, -5);
    svg += drawVisor(cx - 1, baseY + 6);
  } else {
    svg += drawCape(cx, baseY + 12, -2, 0, 0.9);
    svg += drawBody(cx, baseY + 10, -3, 1.0);
    svg += drawLegs(cx, baseY + 38, -4, 4, 17);
    svg += drawArm(cx - 10, baseY + 14, -100, 12);
    svg += drawArm(cx + 12, baseY + 12, -70, 14);
    svg += drawKatana(cx + 8, baseY - 6, -65, 28);
    svg += drawHat(cx, baseY + 2, -2);
    svg += drawVisor(cx, baseY + 8);
  }
  return svg;
}

// ==========================================
// COMBO 3 ANIMATION (4 frames) - spin slash
// ==========================================

function drawCombo3Frame(frame) {
  const cx = 60, baseY = 40;
  const spinAngle = frame * 90;
  let svg = '';

  if (frame === 0) {
    svg += drawCape(cx, baseY + 12, -4, 0, 1.0);
    svg += drawBody(cx, baseY + 10, 10, 0.95);
    svg += drawLegs(cx, baseY + 36, 10, -10, 16);
    svg += drawArm(cx - 10, baseY + 14, -60, 14);
    svg += drawArm(cx + 14, baseY + 14, -30, 14);
    svg += drawKatana(cx + 20, baseY + 4, 20, 30);
    svg += drawHat(cx + 2, baseY + 2, -5);
    svg += drawVisor(cx + 2, baseY + 8);
  } else if (frame === 1) {
    svg += `<circle cx="${cx}" cy="${baseY+20}" r="32" fill="none" stroke="url(#inkWashGrad)" stroke-width="6" opacity="0.5" stroke-dasharray="40 60" filter="url(#inkMisty)"/>`;
    svg += drawCape(cx, baseY + 12, 10, 0, 1.4);
    svg += drawBody(cx, baseY + 10, 0, 0.9);
    svg += drawLegs(cx, baseY + 34, 0, 0, 14);
    svg += drawArm(cx - 14, baseY + 14, -20, 16);
    svg += drawArm(cx + 14, baseY + 14, -160, 16);
    svg += drawKatana(cx - 20, baseY + 10, 160, 34);
    svg += drawHat(cx, baseY + 2, 0);
    svg += drawVisor(cx, baseY + 8);
  } else if (frame === 2) {
    svg += `<circle cx="${cx}" cy="${baseY+20}" r="36" fill="none" stroke="url(#sakuraBlade)" stroke-width="4" opacity="0.85" stroke-dasharray="60 40" filter="url(#sakuraGlow)"/>`;
    svg += `<circle cx="${cx}" cy="${baseY+20}" r="36" fill="none" stroke="#cdd6f4" stroke-width="1.5" opacity="0.9" stroke-dasharray="30 70"/>`;
    svg += drawCape(cx, baseY + 12, -10, 0, 1.6);
    svg += drawBody(cx, baseY + 10, 0, 0.9);
    svg += drawLegs(cx, baseY + 34, 0, 0, 14);
    svg += drawArm(cx + 14, baseY + 14, -20, 16);
    svg += drawArm(cx - 14, baseY + 14, -160, 16);
    svg += drawKatana(cx + 20, baseY + 10, -20, 34);
    svg += drawHat(cx, baseY + 2, 0);
    svg += drawVisor(cx, baseY + 8);
  } else {
    svg += `<circle cx="${cx}" cy="${baseY+20}" r="30" fill="none" stroke="url(#sakuraBlade)" stroke-width="2" opacity="0.4" filter="url(#sakuraGlow)"/>`;
    svg += drawCape(cx, baseY + 12, 5, 0, 1.0);
    svg += drawBody(cx, baseY + 10, 5, 1.0);
    svg += drawLegs(cx, baseY + 38, 5, -5, 17);
    svg += drawArm(cx - 10, baseY + 14, -70, 12);
    svg += drawArm(cx + 12, baseY + 14, -50, 14);
    svg += drawKatana(cx + 16, baseY + 4, 10, 28);
    svg += drawHat(cx + 1, baseY + 2, -3);
    svg += drawVisor(cx + 1, baseY + 8);
  }
  return svg;
}

// ==========================================
// COMBO 4 ANIMATION (4 frames) - heavy overhead slam
// ==========================================

function drawCombo4Frame(frame) {
  const cx = 60, baseY = 38;
  let svg = '';

  if (frame === 0) {
    // Raise overhead
    svg += drawCape(cx, baseY + 14, 4, -4, 0.7);
    svg += drawBody(cx, baseY + 8, -5, 1.1);
    svg += drawLegs(cx, baseY + 40, -5, 5, 16);
    svg += drawArm(cx - 8, baseY + 10, -150, 16);
    svg += drawArm(cx + 8, baseY + 10, -150, 16);
    svg += drawKatana(cx, baseY - 16, -90, 34);
    svg += drawHat(cx, baseY, 0);
    svg += drawVisor(cx, baseY + 6);
  } else if (frame === 1) {
    // Peak overhead
    svg += drawCape(cx, baseY + 14, 6, -6, 0.6);
    svg += drawBody(cx, baseY + 6, -8, 1.15);
    svg += drawLegs(cx, baseY + 40, -3, 3, 16);
    svg += drawArm(cx - 6, baseY + 8, -160, 18);
    svg += drawArm(cx + 6, baseY + 8, -160, 18);
    svg += drawKatana(cx, baseY - 22, -90, 38);
    svg += drawHat(cx, baseY - 2, 0);
    svg += drawVisor(cx, baseY + 4);
  } else if (frame === 2) {
    // Slam down
    svg += `<path d="M ${cx-3} ${baseY-10} L ${cx+3} ${baseY-10} L ${cx+8} ${baseY+60} L ${cx-8} ${baseY+60} Z" fill="url(#sakuraBlade)" opacity="0.7" filter="url(#sakuraGlow)"/>`;
    svg += drawCape(cx, baseY + 14, -8, 6, 1.3);
    svg += drawBody(cx, baseY + 14, 10, 0.85);
    svg += drawLegs(cx + 2, baseY + 36, 15, -10, 18);
    svg += drawArm(cx - 6, baseY + 16, -30, 16);
    svg += drawArm(cx + 6, baseY + 16, -30, 16);
    svg += drawKatana(cx + 4, baseY + 20, 80, 34);
    svg += drawHat(cx + 2, baseY + 4, -8);
    svg += drawVisor(cx + 2, baseY + 10);
  } else {
    // Impact - ground effect
    svg += `<ellipse cx="${cx}" cy="${baseY+58}" rx="28" ry="6" fill="none" stroke="#fab387" stroke-width="2.5" filter="url(#goldGlow)"/>`;
    svg += `<ellipse cx="${cx}" cy="${baseY+58}" rx="16" ry="3" fill="#cdd6f4" filter="url(#heavyGoldGlow)"/>`;
    svg += `<line x1="${cx-20}" y1="${baseY+60}" x2="${cx-35}" y2="${baseY+65}" stroke="#fab387" stroke-width="3" stroke-linecap="round" filter="url(#goldGlow)"/>`;
    svg += `<line x1="${cx+20}" y1="${baseY+60}" x2="${cx+35}" y2="${baseY+65}" stroke="#cba6f7" stroke-width="2.5" stroke-linecap="round"/>`;
    svg += drawCape(cx, baseY + 16, -4, 8, 1.0);
    svg += drawBody(cx, baseY + 16, 12, 0.85);
    svg += drawLegs(cx + 2, baseY + 36, 20, -15, 16);
    svg += drawArm(cx - 6, baseY + 20, -20, 14);
    svg += drawArm(cx + 6, baseY + 20, -20, 14);
    svg += drawKatana(cx + 2, baseY + 24, 85, 30);
    svg += drawHat(cx + 2, baseY + 6, -10);
    svg += drawVisor(cx + 2, baseY + 12);
  }
  return svg;
}

// ==========================================
// WAVE ATTACK ANIMATION (4 frames) - gather/thrust/release/recover
// ==========================================

function drawWaveFrame(frame) {
  const cx = 60, baseY = 40;
  let svg = '';

  if (frame === 0) {
    svg += drawCape(cx, baseY + 12, 6, 0, 0.7);
    svg += drawBody(cx, baseY + 10, -5, 1.0);
    svg += drawLegs(cx, baseY + 38, -8, 8, 16);
    svg += drawArm(cx - 12, baseY + 14, -80, 12);
    svg += drawArm(cx + 12, baseY + 14, -80, 12);
    svg += `<circle cx="${cx}" cy="${baseY+10}" r="6" fill="url(#spiritGold)" opacity="0.4" filter="url(#goldGlow)"/>`;
    svg += drawHat(cx, baseY + 2, 0);
    svg += drawVisor(cx, baseY + 8);
  } else if (frame === 1) {
    svg += drawCape(cx, baseY + 12, 8, 0, 0.6);
    svg += drawBody(cx, baseY + 10, -3, 1.0);
    svg += drawLegs(cx, baseY + 38, -6, 6, 16);
    svg += drawArm(cx - 10, baseY + 12, -50, 14);
    svg += drawArm(cx + 10, baseY + 12, -50, 14);
    svg += `<circle cx="${cx+8}" cy="${baseY+8}" r="10" fill="url(#spiritGold)" opacity="0.6" filter="url(#heavyGoldGlow)"/>`;
    svg += `<circle cx="${cx+8}" cy="${baseY+8}" r="4" fill="#cdd6f4"/>`;
    svg += drawHat(cx, baseY + 2, -2);
    svg += drawVisor(cx, baseY + 8);
  } else if (frame === 2) {
    svg += drawCape(cx, baseY + 12, -10, 2, 1.2);
    svg += drawBody(cx + 4, baseY + 10, 10, 0.95);
    svg += drawLegs(cx + 4, baseY + 36, 8, -5, 17);
    svg += drawArm(cx - 6, baseY + 14, -20, 16);
    svg += drawArm(cx + 16, baseY + 12, 0, 18);
    svg += `<circle cx="${cx+34}" cy="${baseY+12}" r="12" fill="url(#spiritGold)" filter="url(#heavyGoldGlow)"/>`;
    svg += `<circle cx="${cx+34}" cy="${baseY+12}" r="5" fill="#cdd6f4"/>`;
    svg += `<path d="M ${cx+34} ${baseY} A 6 6 0 0 0 ${cx+34} ${baseY+12} A 6 6 0 0 1 ${cx+34} ${baseY+24} A 12 12 0 0 0 ${cx+34} ${baseY} Z" fill="#cdd6f4" opacity="0.5"/>`;
    svg += drawHat(cx + 2, baseY + 2, -5);
    svg += drawVisor(cx + 2, baseY + 8);
  } else {
    svg += drawCape(cx, baseY + 12, -4, 0, 0.9);
    svg += drawBody(cx + 2, baseY + 10, 5, 1.0);
    svg += drawLegs(cx + 2, baseY + 38, 3, -3, 17);
    svg += drawArm(cx - 10, baseY + 14, -70, 12);
    svg += drawArm(cx + 12, baseY + 14, -40, 14);
    svg += drawHat(cx + 1, baseY + 2, -2);
    svg += drawVisor(cx + 1, baseY + 8);
  }
  return svg;
}

// ==========================================
// UPPERCUT ANIMATION (4 frames) - crouch/launch/extend/peak
// ==========================================

function drawUppercutFrame(frame) {
  const cx = 60, baseY = 38;
  let svg = '';

  if (frame === 0) {
    // Deep crouch
    svg += drawCape(cx, baseY + 20, 4, 4, 0.6);
    svg += drawBody(cx, baseY + 18, -5, 0.8);
    svg += drawLegs(cx, baseY + 36, -20, 20, 14);
    svg += drawArm(cx - 12, baseY + 22, -100, 12);
    svg += drawArm(cx + 10, baseY + 22, -120, 12);
    svg += drawKatana(cx + 6, baseY + 16, -100, 26);
    svg += drawHat(cx, baseY + 10, 3);
    svg += drawVisor(cx, baseY + 16);
  } else if (frame === 1) {
    // Launch upward
    svg += drawSlashArc(cx + 5, baseY + 20, -140, -80, 28, 0.5);
    svg += drawCape(cx, baseY + 14, 2, 8, 1.0);
    svg += drawBody(cx, baseY + 8, -8, 1.1);
    svg += drawLegs(cx, baseY + 38, -5, 5, 18);
    svg += drawArm(cx - 10, baseY + 10, -130, 14);
    svg += drawArm(cx + 10, baseY + 8, -140, 16);
    svg += drawKatana(cx + 8, baseY - 10, -80, 32);
    svg += drawHat(cx, baseY, -3);
    svg += drawVisor(cx, baseY + 6);
  } else if (frame === 2) {
    // Full extension upward
    svg += drawSlashArc(cx + 5, baseY + 10, -160, -20, 36, 0.9);
    svg += drawCape(cx, baseY + 12, -2, 12, 1.4);
    svg += drawBody(cx, baseY + 4, -12, 1.15);
    svg += drawLegs(cx, baseY + 38, 5, -5, 16);
    svg += drawArm(cx - 8, baseY + 6, -150, 16);
    svg += drawArm(cx + 8, baseY + 4, -160, 20);
    svg += drawKatana(cx + 4, baseY - 22, -85, 38);
    svg += drawHat(cx - 1, baseY - 4, -5);
    svg += drawVisor(cx - 1, baseY + 2);
  } else {
    // Peak - floating
    svg += drawCape(cx, baseY + 8, -6, 14, 1.5);
    svg += drawBody(cx, baseY + 2, -5, 1.0);
    svg += drawLegs(cx, baseY + 30, -15, 15, 14);
    svg += drawArm(cx - 10, baseY + 6, -130, 14);
    svg += drawArm(cx + 10, baseY + 4, -150, 16);
    svg += drawKatana(cx + 2, baseY - 18, -88, 34);
    svg += drawHat(cx, baseY - 6, -2);
    svg += drawVisor(cx, baseY);
  }
  return svg;
}

// ==========================================
// DIVE ATTACK ANIMATION (4 frames) - tuck/angle/plunge/impact
// ==========================================

function drawDiveFrame(frame) {
  const cx = 60, baseY = 36;
  let svg = '';

  if (frame === 0) {
    svg += drawCape(cx, baseY + 8, -4, -6, 1.2);
    svg += drawBody(cx, baseY + 6, 15, 0.9);
    svg += drawLegs(cx + 4, baseY + 28, -20, 20, 12);
    svg += drawArm(cx - 8, baseY + 10, -40, 14);
    svg += drawArm(cx + 12, baseY + 8, -20, 16);
    svg += drawKatana(cx + 20, baseY + 10, 30, 28);
    svg += drawHat(cx + 3, baseY, -10);
    svg += drawVisor(cx + 3, baseY + 6);
  } else if (frame === 1) {
    svg += drawCape(cx, baseY + 4, -8, -12, 1.5);
    svg += drawBody(cx + 4, baseY + 8, 30, 0.85);
    svg += drawLegs(cx + 8, baseY + 26, -10, 10, 12);
    svg += drawArm(cx, baseY + 12, -10, 16);
    svg += drawArm(cx + 16, baseY + 10, 20, 18);
    svg += drawKatana(cx + 24, baseY + 16, 50, 32);
    svg += drawHat(cx + 6, baseY + 2, -20);
    svg += drawVisor(cx + 6, baseY + 8);
  } else if (frame === 2) {
    // Full plunge
    svg += `<path d="M ${cx+10} ${baseY} L ${cx+14} ${baseY} L ${cx+20} ${baseY+50} L ${cx+6} ${baseY+50} Z" fill="url(#spiritGold)" opacity="0.5" filter="url(#goldGlow)"/>`;
    svg += drawCape(cx, baseY, -10, -16, 1.8);
    svg += drawBody(cx + 6, baseY + 12, 40, 0.8);
    svg += drawLegs(cx + 10, baseY + 28, -5, 5, 10);
    svg += drawArm(cx + 2, baseY + 16, 10, 16);
    svg += drawArm(cx + 18, baseY + 14, 40, 18);
    svg += drawKatana(cx + 26, baseY + 22, 65, 34);
    svg += drawHat(cx + 8, baseY + 4, -30);
    svg += drawVisor(cx + 8, baseY + 10);
  } else {
    // Impact
    svg += `<ellipse cx="${cx+10}" cy="${baseY+56}" rx="24" ry="5" fill="none" stroke="#fab387" stroke-width="2.5" filter="url(#goldGlow)"/>`;
    svg += `<ellipse cx="${cx+10}" cy="${baseY+56}" rx="14" ry="3" fill="#cdd6f4" opacity="0.8"/>`;
    svg += drawCape(cx, baseY + 14, -4, 6, 1.0);
    svg += drawBody(cx + 4, baseY + 16, 15, 0.9);
    svg += drawLegs(cx + 4, baseY + 38, 15, -10, 16);
    svg += drawArm(cx - 4, baseY + 20, -20, 14);
    svg += drawArm(cx + 14, baseY + 18, 20, 14);
    svg += drawKatana(cx + 18, baseY + 28, 70, 28);
    svg += drawHat(cx + 4, baseY + 6, -12);
    svg += drawVisor(cx + 4, baseY + 12);
  }
  return svg;
}

// ==========================================
// HURT ANIMATION (3 frames) - impact/stagger/recover
// ==========================================

function drawHurtFrame(frame) {
  const cx = 60, baseY = 40;
  let svg = '';

  if (frame === 0) {
    // Impact - jerked back
    svg += `<circle cx="${cx-5}" cy="${baseY+15}" r="8" fill="#f38ba8" opacity="0.4" filter="url(#redGlow)"/>`;
    svg += drawCape(cx, baseY + 12, 12, -4, 1.3);
    svg += drawBody(cx - 4, baseY + 12, -15, 0.9);
    svg += drawLegs(cx - 4, baseY + 36, 15, -15, 16);
    svg += drawArm(cx - 16, baseY + 16, -130, 12);
    svg += drawArm(cx + 8, baseY + 16, -40, 10);
    svg += drawKatana(cx - 20, baseY + 8, -130, 24);
    svg += drawHat(cx - 4, baseY + 4, 10);
    svg += drawVisor(cx - 4, baseY + 10);
  } else if (frame === 1) {
    // Stagger
    svg += drawCape(cx, baseY + 12, 8, -2, 1.1);
    svg += drawBody(cx - 2, baseY + 14, -10, 0.95);
    svg += drawLegs(cx - 2, baseY + 38, 10, -20, 17);
    svg += drawArm(cx - 14, baseY + 18, -120, 12);
    svg += drawArm(cx + 10, baseY + 18, -50, 10);
    svg += drawKatana(cx - 18, baseY + 10, -110, 24);
    svg += drawHat(cx - 2, baseY + 4, 6);
    svg += drawVisor(cx - 2, baseY + 10);
  } else {
    // Partial recovery
    svg += drawCape(cx, baseY + 12, 4, 0, 0.9);
    svg += drawBody(cx, baseY + 12, -4, 1.0);
    svg += drawLegs(cx, baseY + 40, -5, 5, 16);
    svg += drawArm(cx - 12, baseY + 16, -90, 12);
    svg += drawArm(cx + 10, baseY + 16, -70, 12);
    svg += drawKatana(cx - 16, baseY + 6, -80, 26);
    svg += drawHat(cx, baseY + 4, 2);
    svg += drawVisor(cx, baseY + 10);
  }
  return svg;
}

// ==========================================
// GENERATE ALL PLAYER SPRITESHEETS
// ==========================================

generatePlayerSpriteSheet('player_idle_sheet', 6, drawIdleFrame);
generatePlayerSpriteSheet('player_run_sheet', 8, drawRunFrame);
generatePlayerSpriteSheet('player_jump_sheet', 3, drawJumpFrame);
generatePlayerSpriteSheet('player_fall_sheet', 3, drawFallFrame);
generatePlayerSpriteSheet('player_dash_sheet', 4, drawDashFrame);
generatePlayerSpriteSheet('player_defend_sheet', 3, drawDefendFrame);
generatePlayerSpriteSheet('player_combo1_sheet', 4, drawCombo1Frame);
generatePlayerSpriteSheet('player_combo2_sheet', 4, drawCombo2Frame);
generatePlayerSpriteSheet('player_combo3_sheet', 4, drawCombo3Frame);
generatePlayerSpriteSheet('player_combo4_sheet', 4, drawCombo4Frame);
generatePlayerSpriteSheet('player_wave_sheet', 4, drawWaveFrame);
generatePlayerSpriteSheet('player_uppercut_sheet', 4, drawUppercutFrame);
generatePlayerSpriteSheet('player_dive_sheet', 4, drawDiveFrame);
generatePlayerSpriteSheet('player_hurt_sheet', 3, drawHurtFrame);

// ==========================================
// ENEMY & ENVIRONMENT SVG HELPERS
// ==========================================

function saveSvg(filename, content, width, height) {
  const fullContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>${SHARED_DEFS}</defs>
    ${content}
  </svg>`;
  fs.writeFileSync(path.join(outDir, filename), fullContent);
}

function saveBgSvg(filename, content, width, height) {
  const fullContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <filter id="bgGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5.5" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="inkMistyBg" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="8"/>
      </filter>
      <linearGradient id="parchmentFade" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fdfbf7"/><stop offset="40%" stop-color="#f5efe0"/><stop offset="85%" stop-color="#ede3cd"/><stop offset="100%" stop-color="#dfd2b5"/>
      </linearGradient>
      <linearGradient id="inkMistyFade" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ede3cd"/><stop offset="50%" stop-color="#ccc1aa"/><stop offset="100%" stop-color="#a69b85"/>
      </linearGradient>
      <linearGradient id="spiritGold" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#cdd6f4"/><stop offset="35%" stop-color="#f9e2af"/><stop offset="75%" stop-color="#fab387"/><stop offset="100%" stop-color="#fab387"/>
      </linearGradient>
    </defs>
    ${content}
  </svg>`;
  fs.writeFileSync(path.join(bgDir, filename), fullContent);
}

// ==========================================
// ENEMIES
// ==========================================

saveSvg('enemy_guard.svg', `
  <path d="M 16 24 L 56 24 L 60 55 L 12 55 Z" fill="url(#inkWashGrad)" stroke="#cba6f7" stroke-width="2.5"/>
  <path d="M 12 55 L 60 55 L 56 68 L 16 68 Z" fill="#cba6f7" stroke="#181825" stroke-width="1"/>
  <path d="M 22 34 L 50 34 M 24 42 L 48 42 M 26 50 L 46 50" stroke="#cba6f7" stroke-width="1.8"/>
  <circle cx="36" cy="38" r="6" fill="#fab387" filter="url(#goldGlow)"/>
  <rect x="24" y="8" width="24" height="16" rx="2" fill="#1e1e2e" stroke="#cba6f7" stroke-width="1.5"/>
  <rect x="28" y="13" width="16" height="4" fill="#fab387" filter="url(#goldGlow)"/>
  <rect x="56" y="16" width="4" height="48" fill="#313244" stroke="#cba6f7" stroke-width="0.8"/>
  <path d="M 55 16 C 55 0 65 -8 72 -14 L 75 -10 C 65 0 58 10 58 16" fill="url(#spiritGold)" filter="url(#goldGlow)"/>
`, 80, 80);

saveSvg('enemy_axe.svg', `
  <rect x="12" y="16" width="56" height="54" rx="10" fill="url(#inkWashGrad)" stroke="#eba0ac" stroke-width="3.5"/>
  <path d="M 26 26 L 42 26 M 34 26 L 34 40 M 26 40 L 42 40 M 26 33 L 42 33" stroke="#cba6f7" stroke-width="2.5" filter="url(#redGlow)"/>
  <circle cx="12" cy="43" r="8.5" fill="#181825" stroke="#cba6f7" stroke-width="1.8"/>
  <circle cx="68" cy="43" r="8.5" fill="#181825" stroke="#cba6f7" stroke-width="1.8"/>
  <polygon points="30,16 50,16 46,6 34,6" fill="#181825" stroke="#cba6f7" stroke-width="1.5"/>
  <circle cx="40" cy="11" r="3.5" fill="#f38ba8" filter="url(#redGlow)"/>
  <rect x="68" y="2" width="7" height="74" fill="#181825" stroke="#eba0ac" stroke-width="1.5"/>
  <path d="M 72 8 Q 115 -4 115 35 Q 115 74 72 62 Z" fill="url(#sacredMaple)" filter="url(#redGlow)"/>
  <path d="M 72 18 Q 105 10 105 35 Q 105 60 72 52 Z" fill="#cdd6f4" opacity="0.85"/>
`, 110, 80);

saveSvg('enemy_ninja.svg', `
  <polygon points="40,16 54,55 26,55" fill="#cdd6f4" stroke="#fab387" stroke-width="2"/>
  <polygon points="40,24 48,50 32,50" fill="url(#inkWashLight)"/>
  <line x1="40" y1="16" x2="40" y2="55" stroke="#cba6f7" stroke-width="1.2"/>
  <circle cx="40" cy="11" r="9" fill="#cdd6f4" stroke="#fab387" stroke-width="1.8"/>
  <polygon points="36,8 44,8 40,14" fill="#fab387" filter="url(#goldGlow)"/>
  <circle cx="40" cy="11" r="2.5" fill="#cdd6f4"/>
  <path d="M 24 38 L -4 60 Q 6 48 12 44 Z" fill="url(#spiritGold)" filter="url(#goldGlow)"/>
  <path d="M 56 38 L 84 60 Q 74 48 68 44 Z" fill="url(#spiritGold)" filter="url(#goldGlow)"/>
`, 80, 80);

saveSvg('enemy_sniper.svg', `
  <rect x="22" y="24" width="36" height="32" rx="3" fill="url(#inkWashGrad)" stroke="#fab387" stroke-width="2"/>
  <line x1="22" y1="24" x2="58" y2="56" stroke="#fab387" stroke-width="2.5"/>
  <line x1="22" y1="56" x2="58" y2="24" stroke="#fab387" stroke-width="2.5"/>
  <rect x="30" y="32" width="20" height="16" fill="#1e1e2e" stroke="#cba6f7" stroke-width="1"/>
  <path d="M 28 14 L 52 14 L 46 24 L 34 24 Z" fill="#181825" stroke="#fab387" stroke-width="1.2"/>
  <circle cx="40" cy="19" r="6" fill="#fab387" stroke="#1e1e2e" stroke-width="1.5"/>
  <circle cx="40" cy="19" r="2.5" fill="#cdd6f4" filter="url(#goldGlow)"/>
  <rect x="42" y="32" width="44" height="8" rx="1" fill="#11111b" stroke="#fab387" stroke-width="1.2"/>
  <polygon points="86,36 94,36 86,40" fill="#fab387" filter="url(#goldGlow)"/>
`, 90, 80);

saveSvg('projectile.svg', `
  <line x1="4" y1="10" x2="32" y2="10" stroke="#fab387" stroke-width="3" stroke-linecap="round" filter="url(#goldGlow)"/>
  <polygon points="32,7 39,10 32,13" fill="#cdd6f4" filter="url(#goldGlow)"/>
  <polygon points="4,10 -2,4 4,4" fill="#cba6f7"/>
  <polygon points="4,10 -2,16 4,16" fill="#cba6f7"/>
`, 40, 20);

saveSvg('player_wave.svg', `
  <g transform="translate(10, 10)">
    <path d="M -5 10 L 25 0 Q 35 15 28 35 L -2 45 Z" fill="#cdd6f4" stroke="#fab387" stroke-width="2.5" filter="url(#goldGlow)"/>
    <path d="M 5 15 C 8 20 12 18 10 32 M 5 22 L 15 18 M 8 28 C 14 28 12 34 16 34" fill="none" stroke="#cba6f7" stroke-width="2"/>
    <path d="M 22 -12 A 32 32 0 0 1 22 52 A 20 20 0 0 0 10 20 Z" fill="url(#spiritGold)" filter="url(#heavyGoldGlow)" opacity="0.8"/>
    <path d="M 12 20 C -2 15 -14 25 -25 20" fill="none" stroke="#181825" stroke-width="5" stroke-linecap="round" filter="url(#inkMisty)"/>
  </g>
`, 60, 60);

// ==========================================
// BOSS SPRITES
// ==========================================

saveSvg('boss_idle.svg', `
  <circle cx="60" cy="66" r="54" fill="none" stroke="#181825" stroke-width="6" opacity="0.3" filter="url(#inkMisty)"/>
  <path d="M 8 26 L 60 6 L 112 26 L 102 98 L 18 98 Z" fill="url(#inkWashGrad)" stroke="#cba6f7" stroke-width="5.5"/>
  <path d="M 0 28 Q 60 0 120 28" fill="none" stroke="#fab387" stroke-width="6"/>
  <circle cx="60" cy="66" r="32" fill="none" stroke="#fab387" stroke-width="2" stroke-dasharray="15 8" filter="url(#goldGlow)"/>
  <circle cx="60" cy="66" r="18" fill="#1e1e2e" stroke="#fab387" stroke-width="2" filter="url(#heavyGoldGlow)"/>
  <path d="M 60 48 A 9 9 0 0 0 60 66 A 9 9 0 0 1 60 84 A 18 18 0 0 0 60 48 Z" fill="#fab387"/>
  <circle cx="60" cy="57" r="3" fill="#1e1e2e"/>
  <circle cx="60" cy="75" r="3" fill="#cdd6f4"/>
  <rect x="-14" y="26" width="30" height="52" rx="5" fill="#11111b" stroke="#cba6f7" stroke-width="3"/>
  <rect x="104" y="26" width="30" height="52" rx="5" fill="#11111b" stroke="#cba6f7" stroke-width="3"/>
`, 140, 120);

saveSvg('boss_windup.svg', `
  <path d="M 8 26 L 60 6 L 112 26 L 102 98 L 18 98 Z" fill="url(#inkWashGrad)" stroke="#fab387" stroke-width="5.5"/>
  <path d="M 0 28 Q 60 0 120 28" fill="none" stroke="#cba6f7" stroke-width="6"/>
  <circle cx="60" cy="66" r="34" fill="none" stroke="#fab387" stroke-width="4" stroke-dasharray="8 6" filter="url(#goldGlow)"/>
  <circle cx="60" cy="66" r="22" fill="#1e1e2e" stroke="#cdd6f4" stroke-width="2.5" filter="url(#heavyGoldGlow)"/>
  <path d="M 60 44 A 11 11 0 0 0 60 66 A 11 11 0 0 1 60 88 A 22 22 0 0 0 60 44 Z" fill="#fab387"/>
  <text x="32" y="42" font-family="serif" font-weight="bold" font-size="15" fill="#cba6f7" filter="url(#redGlow)">神</text>
  <text x="76" y="42" font-family="serif" font-weight="bold" font-size="15" fill="#cba6f7" filter="url(#redGlow)">机</text>
  <rect x="-20" y="8" width="30" height="52" rx="5" fill="#11111b" stroke="#fab387" stroke-width="3" transform="rotate(-26 0 32)"/>
  <rect x="110" y="8" width="30" height="52" rx="5" fill="#11111b" stroke="#fab387" stroke-width="3" transform="rotate(26 120 32)"/>
`, 140, 120);

saveSvg('boss_rush.svg', `
  <g transform="rotate(12 60 60)">
    <path d="M 8 26 L 60 6 L 112 26 L 102 98 L 18 98 Z" fill="url(#inkWashGrad)" stroke="#cba6f7" stroke-width="5.5"/>
    <path d="M 0 28 Q 60 0 120 28" fill="none" stroke="#fab387" stroke-width="6"/>
    <circle cx="60" cy="66" r="25" fill="url(#spiritGold)" filter="url(#goldGlow)"/>
    <circle cx="60" cy="66" r="10" fill="#cdd6f4"/>
    <path d="M -20 46 C -40 30 -60 40 -80 46 C -60 52 -40 48 -20 46" fill="url(#spiritGold)" filter="url(#goldGlow)"/>
    <path d="M -15 66 C -35 50 -55 60 -75 66 C -55 72 -35 68 -15 66" fill="url(#spiritGold)" filter="url(#goldGlow)"/>
  </g>
`, 160, 120);

saveSvg('boss_attack.svg', `
  <path d="M 8 26 L 60 6 L 112 26 L 102 98 L 18 98 Z" fill="url(#inkWashGrad)" stroke="#cba6f7" stroke-width="5.5"/>
  <circle cx="60" cy="66" r="22" fill="#cdd6f4" filter="url(#heavyGoldGlow)"/>
  <path d="M -25 55 A 125 125 0 0 1 252 55" fill="none" stroke="url(#spiritGold)" stroke-width="18" filter="url(#heavyGoldGlow)" stroke-linecap="round"/>
  <path d="M -25 55 A 125 125 0 0 1 252 55" fill="none" stroke="#cdd6f4" stroke-width="6" stroke-linecap="round"/>
  <circle cx="-10" cy="30" r="4.5" fill="#181825" filter="url(#inkMisty)"/>
  <circle cx="120" cy="-12" r="5" fill="#181825" filter="url(#inkMisty)"/>
`, 220, 120);

// ==========================================
// BACKGROUNDS & PLATFORM
// ==========================================

saveBgSvg('platform.svg', `
  <rect width="64" height="64" fill="url(#inkWashGrad)" stroke="#1e1e2e" stroke-width="2.5"/>
  <path d="M 0 18 Q 32 12 64 18 M 0 34 Q 32 28 64 34 M 0 50 Q 32 44 64 50" stroke="#585b70" stroke-width="1.8"/>
  <rect x="0" y="0" width="64" height="6.5" fill="#fab387" filter="url(#bgGlow)"/>
  <rect x="0" y="0" width="64" height="2" fill="#cdd6f4"/>
  <rect x="12" y="2.5" width="4" height="2" fill="#cba6f7"/>
  <rect x="30" y="2.5" width="4" height="2" fill="#cba6f7"/>
  <rect x="48" y="2.5" width="4" height="2" fill="#cba6f7"/>
  <circle cx="8" cy="12" r="2.8" fill="#fab387" filter="url(#bgGlow)"/>
  <circle cx="56" cy="12" r="2.8" fill="#fab387" filter="url(#bgGlow)"/>
`, 64, 64);

saveBgSvg('bg_city_far.svg', `
  <rect width="1280" height="720" fill="url(#parchmentFade)"/>
  <circle cx="1020" cy="190" r="105" fill="#fab387" filter="url(#bgGlow)" opacity="0.65"/>
  <circle cx="1020" cy="190" r="90" fill="url(#spiritGold)" opacity="0.85"/>
  <path d="M 820 180 Q 980 140 1140 180 Q 1020 200 820 180 Z" fill="#ccc1aa" opacity="0.9"/>
  <path d="M 0 540 C 200 480 300 380 450 480 C 600 580 800 360 1000 460 C 1150 540 1200 490 1280 540 L 1280 720 L 0 720 Z" fill="#ccc1aa" filter="url(#inkMistyBg)" opacity="0.75"/>
  <path d="M 0 570 C 150 500 250 440 380 520 C 500 600 720 400 920 500 C 1080 580 1180 480 1280 550 L 1280 720 L 0 720 Z" fill="#a69b85" filter="url(#inkMistyBg)" opacity="0.9"/>
  <path d="M 0 600 L 150 530 L 280 590 L 450 460 L 620 560 L 820 410 L 980 520 L 1150 440 L 1280 520 L 1280 720 L 0 720 Z" fill="#2d281e" stroke="#1e1e2e" stroke-width="3"/>
`, 1280, 720);

saveBgSvg('bg_city_mid.svg', `
  <defs><linearGradient id="pagodaGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#3d3527"/><stop offset="100%" stop-color="#15120d"/></linearGradient></defs>
  <g fill="url(#pagodaGrad)" stroke="#fab387" stroke-width="2">
    <rect x="50" y="280" width="130" height="440"/>
    <path d="M 30 280 Q 115 220 200 280" fill="url(#pagodaGrad)" stroke="#cba6f7" stroke-width="2.5"/>
    <rect x="290" y="160" width="170" height="560"/>
    <path d="M 270 160 Q 375 100 480 160" fill="url(#pagodaGrad)" stroke="#cba6f7" stroke-width="2.5"/>
    <rect x="560" y="320" width="160" height="400"/>
    <path d="M 540 320 Q 640 260 740 320" fill="url(#pagodaGrad)" stroke="#cba6f7" stroke-width="2.5"/>
    <rect x="800" y="110" width="160" height="610"/>
    <path d="M 780 110 Q 880 50 980 110" fill="url(#pagodaGrad)" stroke="#cba6f7" stroke-width="2.5"/>
    <rect x="1060" y="240" width="150" height="480"/>
    <path d="M 1040 240 Q 1135 180 1230 240" fill="url(#pagodaGrad)" stroke="#cba6f7" stroke-width="2.5"/>
  </g>
  <g filter="url(#bgGlow)">
    <rect x="850" y="170" width="60" height="240" rx="6" fill="#f5efe0" stroke="#cba6f7" stroke-width="2"/>
    <text x="862" y="225" font-family="serif" font-weight="bold" font-size="48" fill="#181825">忍</text>
    <text x="862" y="325" font-family="serif" font-weight="bold" font-size="48" fill="#cba6f7">禅</text>
  </g>
`, 1280, 720);

saveBgSvg('bg_forest_far.svg', `
  <rect width="1280" height="720" fill="url(#parchmentFade)"/>
  <g fill="url(#inkMistyFade)" filter="url(#inkMistyBg)" opacity="0.55">
    <rect x="100" y="100" width="60" height="620" rx="4"/>
    <rect x="320" y="40" width="90" height="680" rx="5"/>
    <rect x="680" y="140" width="50" height="580" rx="3"/>
    <rect x="980" y="60" width="110" height="660" rx="6"/>
  </g>
`, 1280, 720);

saveBgSvg('bg_forest_mid.svg', `
  <g fill="#221e16" stroke="#fab387" stroke-width="2">
    <rect x="180" y="80" width="70" height="640" rx="3"/>
    <rect x="580" y="40" width="90" height="680" rx="4"/>
    <rect x="880" y="120" width="65" height="600" rx="3"/>
    <rect x="178" y="240" width="74" height="6" fill="#fab387"/>
    <rect x="578" y="200" width="94" height="8" fill="#fab387"/>
    <rect x="878" y="300" width="69" height="6" fill="#fab387"/>
    <polygon points="120,180 200,90 280,180 200,140" fill="#cba6f7" stroke="#fab387" stroke-width="1.2"/>
    <polygon points="480,130 625,30 770,130 625,90" fill="#2d281e" stroke="#fab387" stroke-width="1.2"/>
    <polygon points="780,220 910,120 1040,220 910,180" fill="#cba6f7" stroke="#fab387" stroke-width="1.2"/>
  </g>
  <g fill="#fab387" filter="url(#bgGlow)">
    <rect x="207" y="270" width="16" height="50" rx="4"/>
    <rect x="612" y="220" width="26" height="80" rx="6" fill="#cdd6f4"/>
    <rect x="898" y="320" width="28" height="60" rx="5"/>
  </g>
`, 1280, 720);

saveBgSvg('bg_core_far.svg', `
  <rect width="1280" height="720" fill="url(#parchmentFade)"/>
  <g fill="url(#inkMistyFade)" filter="url(#inkMistyBg)" opacity="0.6">
    <path d="M 200 720 L 200 240 L 1080 240 L 1080 720 L 980 720 L 980 340 L 300 340 L 300 720 Z"/>
    <path d="M 120 200 L 1160 200 L 1120 250 L 160 250 Z"/>
    <rect x="180" y="270" width="920" height="24"/>
  </g>
`, 1280, 720);

saveBgSvg('bg_core_mid.svg', `
  <g fill="#1a140f" stroke="#cba6f7" stroke-width="3.5">
    <rect x="220" y="0" width="100" height="720"/>
    <rect x="960" y="0" width="100" height="720"/>
  </g>
  <circle cx="640" cy="360" r="210" fill="#15120d" stroke="#fab387" stroke-width="12"/>
  <circle cx="640" cy="360" r="170" fill="none" stroke="#cba6f7" stroke-width="4.5" stroke-dasharray="20 12" filter="url(#bgGlow)"/>
  <circle cx="640" cy="360" r="110" fill="url(#spiritGold)" filter="url(#bgGlow)" opacity="0.7"/>
  <circle cx="640" cy="360" r="55" fill="#1e1e2e" stroke="#cdd6f4" stroke-width="2.5" filter="url(#bgGlow)"/>
  <path d="M 640 305 A 27.5 27.5 0 0 0 640 360 A 27.5 27.5 0 0 1 640 415 A 55 55 0 0 0 640 305 Z" fill="#fab387"/>
`, 1280, 720);

console.log('Generated 14 player animation spritesheets + enemies + backgrounds successfully!');

