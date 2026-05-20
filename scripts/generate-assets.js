import fs from 'fs';
import path from 'path';

const publicDir = path.join(process.cwd(), 'public');
const assetsDir = path.join(publicDir, 'assets');
const outDir = path.join(assetsDir, 'sprites');
const bgDir = path.join(assetsDir, 'backgrounds');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

[outDir, bgDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function saveSvg(filename, content, width, height) {
  const fullContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <!-- High-Fidelity Filters -->
      <filter id="cyanGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="heavyCyanGlow" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="6" result="blur1" />
        <feGaussianBlur stdDeviation="2" result="blur2" />
        <feMerge>
          <feMergeNode in="blur1" />
          <feMergeNode in="blur2" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="pinkGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="greenGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="orangeGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <!-- Advanced Cyber Gradients -->
      <linearGradient id="cyberMetal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#2a2a3e"/>
        <stop offset="35%" stop-color="#1b1b26"/>
        <stop offset="70%" stop-color="#0e0e16"/>
        <stop offset="100%" stop-color="#050508"/>
      </linearGradient>
      <linearGradient id="cyberMetalLight" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4e4e6a"/>
        <stop offset="50%" stop-color="#2a2a3c"/>
        <stop offset="100%" stop-color="#14141e"/>
      </linearGradient>
      <linearGradient id="ninjaBlade" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="30%" stop-color="#dffffc"/>
        <stop offset="75%" stop-color="#00ffff"/>
        <stop offset="100%" stop-color="#0088cc"/>
      </linearGradient>
      <linearGradient id="cyberScarf" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ff0055"/>
        <stop offset="45%" stop-color="#ff3300"/>
        <stop offset="90%" stop-color="#ffcc00"/>
      </linearGradient>
      <linearGradient id="plasmaBlue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="50%" stop-color="#00ffff"/>
        <stop offset="100%" stop-color="#0033aa"/>
      </linearGradient>
      <linearGradient id="heavyAxe" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ff3333"/>
        <stop offset="50%" stop-color="#ff7700"/>
        <stop offset="100%" stop-color="#550000"/>
      </linearGradient>
      <linearGradient id="ninjaGreen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00ffcc"/>
        <stop offset="60%" stop-color="#00ff55"/>
        <stop offset="100%" stop-color="#003311"/>
      </linearGradient>
    </defs>
    ${content}
  </svg>`;
  fs.writeFileSync(path.join(outDir, filename), fullContent);
}

function saveBgSvg(filename, content, width, height) {
  const fullContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <filter id="bgGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00ffff" stroke-width="0.75" opacity="0.12"/>
      </pattern>
      <linearGradient id="bgFade" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#04030a"/>
        <stop offset="40%" stop-color="#0f0c21"/>
        <stop offset="85%" stop-color="#180e32"/>
        <stop offset="100%" stop-color="#241245"/>
      </linearGradient>
    </defs>
    ${content}
  </svg>`;
  fs.writeFileSync(path.join(bgDir, filename), fullContent);
}

// ==========================================
// 1. PLAYER SPRITES (Intricate Cyber Shinobi)
// ==========================================

// Player - Idle (Intricate design, gorgeous armor layers, detailed sheath & helm)
saveSvg('player_idle.svg', `
  <!-- Flowing energy scarf (dynamic layered ribbons) -->
  <path d="M 36 28 C 22 42 12 55 2 64 C 10 52 24 38 34 32" fill="url(#cyberScarf)" opacity="0.8" filter="url(#pinkGlow)"/>
  <path d="M 36 28 C 26 48 16 63 6 74 C 18 56 28 42 34 32" fill="url(#cyberScarf)" opacity="0.9"/>
  <path d="M 36 28 C 18 36 8 50 0 58 C 8 46 22 34 34 32" fill="#ff0055" opacity="0.6"/>

  <!-- Back Scabbard / Katana Hilt on back -->
  <path d="M 28 32 L 10 12 L 14 8 L 32 28 Z" fill="#0b0b10" stroke="#00ffff" stroke-width="1.5"/>
  <rect x="5" y="5" width="5" height="15" fill="#ff0055" transform="rotate(45 5 5)" filter="url(#pinkGlow)"/>
  <circle cx="10" cy="10" r="3" fill="#ffffff"/>

  <!-- Left/Right Mechanical Shoulder Pauldrons -->
  <path d="M 22 24 L 14 30 L 16 42 L 26 36 Z" fill="url(#cyberMetalLight)" stroke="#00ffff" stroke-width="1.2"/>
  <path d="M 58 24 L 66 30 L 64 42 L 54 36 Z" fill="url(#cyberMetalLight)" stroke="#00ffff" stroke-width="1.2"/>
  
  <!-- Cyber Armor Core Body with segmented panels -->
  <path d="M 26 24 L 54 24 L 48 54 L 32 54 Z" fill="url(#cyberMetal)" stroke="#00ffff" stroke-width="1.5"/>
  <!-- Abdominal grid lines -->
  <path d="M 32 38 L 48 38 M 33 44 L 47 44 M 34 50 L 46 50" stroke="#0088cc" stroke-width="1" opacity="0.7"/>
  <!-- Central Glowing Fusion Core (Arc Reactor) -->
  <polygon points="40,28 46,34 44,42 36,42 34,34" fill="#00ffff" filter="url(#heavyCyanGlow)"/>
  <polygon points="40,31 43,35 42,40 38,40 37,35" fill="#ffffff"/>

  <!-- Cyber Legs (Segmented plates) -->
  <path d="M 32 54 L 28 66 L 22 66 L 26 54 Z" fill="url(#cyberMetalLight)"/>
  <path d="M 48 54 L 52 66 L 58 66 L 54 54 Z" fill="url(#cyberMetalLight)"/>
  <circle cx="28" cy="60" r="2.5" fill="#00ffff"/>
  <circle cx="52" cy="60" r="2.5" fill="#00ffff"/>

  <!-- Cyber Ninja Helmet & Visor -->
  <path d="M 28 16 C 28 4 52 4 52 16 L 49 26 L 31 26 Z" fill="#0f0f18" stroke="#33334d" stroke-width="2"/>
  <!-- Sleek angular segmented V-Visor -->
  <path d="M 31 12 L 40 21 L 49 12 L 44 11 L 40 15 L 36 11 Z" fill="#00ffff" filter="url(#heavyCyanGlow)"/>
  <path d="M 33 13 L 40 19 L 47 13 Z" fill="#ffffff"/>
  <!-- Side Horns/Sensors -->
  <polygon points="28,12 20,8 28,6" fill="#ff0055" filter="url(#pinkGlow)"/>
  <polygon points="52,12 60,8 52,6" fill="#ff0055" filter="url(#pinkGlow)"/>
`, 80, 80);

// Player - Run (Aggressive lean, scarf and energy fields blurs back)
saveSvg('player_run.svg', `
  <g transform="rotate(18 40 40) translate(2, 2)">
    <!-- Scarf blowing far back -->
    <path d="M 34 26 C 10 32 -10 40 -25 46 C -12 30 10 24 30 24" fill="url(#cyberScarf)" filter="url(#pinkGlow)"/>
    <path d="M 34 26 C 2 24 -15 28 -28 32 C -18 20 8 18 28 20" fill="#ff0055" opacity="0.6"/>

    <!-- Sheath -->
    <path d="M 26 30 L 0 20 L 4 16 L 30 26 Z" fill="#0b0b10" stroke="#00ffff" stroke-width="1.2"/>

    <!-- Segmented Torso leaning forward -->
    <path d="M 26 22 L 54 22 L 46 52 L 28 52 Z" fill="url(#cyberMetal)" stroke="#00ffff" stroke-width="1.5"/>
    <polygon points="40,26 46,32 44,40 36,40 34,32" fill="#00ffff" filter="url(#cyanGlow)"/>
    <line x1="30" y1="34" x2="48" y2="34" stroke="#0088cc" stroke-width="1"/>
    
    <!-- Arm (Sprinting pose) -->
    <path d="M 22 24 L 10 36 L 14 42 L 26 30 Z" fill="url(#cyberMetalLight)"/>
    <circle cx="12" cy="39" r="3" fill="#ff0055" filter="url(#pinkGlow)"/>

    <!-- Helmet -->
    <path d="M 30 14 C 30 2 54 2 54 14 L 50 24 L 32 24 Z" fill="#0f0f18" stroke="#33334d" stroke-width="2"/>
    <path d="M 33 10 L 42 19 L 51 10 Z" fill="#00ffff" filter="url(#heavyCyanGlow)"/>
  </g>
`, 80, 80);

// Player - Jump (Aerodynamic spin tucked, trailing energy grids)
saveSvg('player_jump.svg', `
  <!-- Vertical scarf trail -->
  <path d="M 40 20 C 35 48 30 72 25 95 C 45 70 48 45 42 20" fill="url(#cyberScarf)" filter="url(#pinkGlow)"/>
  
  <g transform="translate(0, -6)">
    <!-- Tucked cyber-shell body -->
    <path d="M 26 18 L 54 18 L 44 48 L 30 48 Z" fill="url(#cyberMetal)" stroke="#00ffff" stroke-width="1.5"/>
    <polygon points="40,22 45,27 43,34 37,34 35,27" fill="#00ffff" filter="url(#cyanGlow)"/>
    
    <!-- Tucked legs -->
    <path d="M 30 48 C 20 62 16 75 14 82" stroke="#ff0055" stroke-width="5" stroke-linecap="round" filter="url(#pinkGlow)"/>
    <path d="M 44 48 C 54 62 58 75 60 82" stroke="#00ffff" stroke-width="5" stroke-linecap="round" filter="url(#cyanGlow)"/>
    
    <!-- Head tucked down -->
    <path d="M 28 10 Q 40 -8 52 10 L 47 20 L 33 20 Z" fill="#0f0f18"/>
    <path d="M 32 6 L 40 14 L 48 6 Z" fill="#00ffff" filter="url(#cyanGlow)"/>
  </g>
`, 80, 80);

// Player - Dash (Transformed into a hyper-speed plasma drilling cone)
saveSvg('player_dash.svg', `
  <g transform="translate(0, 10) rotate(90 40 40)">
    <!-- Shockwave lines -->
    <path d="M 10 20 C 25 -5 55 -5 70 20" fill="none" stroke="#00ffff" stroke-width="2" filter="url(#cyanGlow)" opacity="0.6"/>
    <path d="M 5 25 C 25 -15 55 -15 75 25" fill="none" stroke="#ff0055" stroke-width="2.5" filter="url(#pinkGlow)" opacity="0.8"/>
    
    <!-- Speed tail particles -->
    <circle cx="20" cy="5" r="3" fill="#00ffff" filter="url(#cyanGlow)"/>
    <circle cx="60" cy="5" r="4" fill="#ff0055" filter="url(#pinkGlow)"/>
    <circle cx="40" cy="-10" r="2.5" fill="#ffffff"/>

    <!-- Drill Capsule -->
    <path d="M 40 0 C 65 20 70 65 40 85 C 10 65 15 20 40 0 Z" fill="url(#plasmaBlue)" stroke="#ffffff" stroke-width="2" filter="url(#heavyCyanGlow)"/>
    
    <!-- Cyber Core glowing inside capsule -->
    <circle cx="40" cy="42" r="14" fill="url(#cyberScarf)" filter="url(#pinkGlow)"/>
    <polygon points="40,32 48,46 32,46" fill="#ffffff"/>
  </g>
`, 80, 80);

// Player - Defend (Spectacular holographic hexagon energy shield)
saveSvg('player_defend.svg', `
  <!-- Solid defensive posture -->
  <path d="M 22 25 L 50 25 L 44 55 L 26 55 Z" fill="url(#cyberMetal)" stroke="#333" stroke-width="2"/>
  <path d="M 25 18 Q 36 2 47 18 L 43 27 L 29 27 Z" fill="#0f0f18"/>
  <path d="M 31 14 L 36 19 L 41 14 Z" fill="#00ffff" filter="url(#cyanGlow)"/>

  <!-- Cyber Katana Blocking Position -->
  <path d="M 42 12 L 48 8 L 48 58 L 42 58 Z" fill="url(#ninjaBlade)" filter="url(#cyanGlow)"/>

  <!-- High-Fidelity Holographic Shield Matrix -->
  <!-- Outer glowing hexagon -->
  <polygon points="50,2 78,18 78,54 50,70 22,54 22,18" fill="none" stroke="#00ffff" stroke-width="2.5" filter="url(#heavyCyanGlow)" opacity="0.9"/>
  <!-- Inner hexagon structure -->
  <polygon points="50,10 70,22 70,50 50,60 30,50 30,22" fill="rgba(0, 255, 255, 0.1)" stroke="#00ffff" stroke-width="1" stroke-dasharray="4 2"/>
  
  <!-- Digital grid subelements inside shield -->
  <line x1="50" y1="2" x2="50" y2="70" stroke="#00ffff" stroke-width="0.75" opacity="0.5"/>
  <line x1="22" y1="18" x2="78" y2="54" stroke="#00ffff" stroke-width="0.75" opacity="0.5"/>
  <line x1="22" y1="54" x2="78" y2="18" stroke="#00ffff" stroke-width="0.75" opacity="0.5"/>
  
  <!-- Defend impact sparks -->
  <circle cx="70" cy="22" r="3" fill="#ffffff" filter="url(#cyanGlow)"/>
  <circle cx="30" cy="50" r="3" fill="#ffffff" filter="url(#cyanGlow)"/>
`, 80, 80);

// Player - Attack (Massive crescent energy sweep + high tech sword action)
saveSvg('player_attack.svg', `
  <!-- Spectacular massive neon cyan sweep arc -->
  <path d="M 12 10 A 75 75 0 0 1 122 45 L 105 58 A 52 52 0 0 0 25 32 Z" fill="url(#ninjaBlade)" filter="url(#heavyCyanGlow)" opacity="0.8"/>
  <path d="M 18 14 A 72 72 0 0 1 116 43 L 108 49 A 58 58 0 0 0 28 28 Z" fill="#ffffff" opacity="0.9"/>

  <g transform="translate(10, 0)">
    <!-- Attacking Body -->
    <path d="M 18 24 L 46 24 L 40 54 L 22 54 Z" fill="url(#cyberMetal)" stroke="#00ffff" stroke-width="1.5"/>
    <circle cx="32" cy="38" r="6" fill="#00ffff" filter="url(#cyanGlow)"/>
    <path d="M 20 16 Q 32 -4 44 16 L 40 26 L 24 26 Z" fill="#0f0f18"/>
    <path d="M 26 12 L 32 17 L 38 12 Z" fill="#00ffff" filter="url(#cyanGlow)"/>

    <!-- Extending sword arm -->
    <path d="M 36 28 L 72 38 L 68 45 L 32 36 Z" fill="url(#cyberMetalLight)"/>
    <!-- Intricate Katana Sword Base and Core -->
    <path d="M 68 38 L 122 62 L 118 66 L 64 42 Z" fill="url(#ninjaBlade)" filter="url(#heavyCyanGlow)"/>
  </g>
`, 130, 80);

// Player - Uppercut (Vertical launcher slash, digital particle trails)
saveSvg('player_uppercut.svg', `
  <!-- Blazing vertical slash sweep -->
  <path d="M 38 95 C 68 60 62 10 50 -2 L 35 8 C 45 45 40 70 15 85 Z" fill="url(#ninjaBlade)" filter="url(#heavyCyanGlow)" opacity="0.85"/>
  <path d="M 36 90 C 58 60 55 25 45 5 L 38 10 C 45 40 40 65 22 80 Z" fill="#ffffff" opacity="0.95"/>

  <!-- Floating digitizing squares -->
  <rect x="52" y="20" width="6" height="6" fill="#00ffff" filter="url(#cyanGlow)" transform="rotate(45 55 23)"/>
  <rect x="35" y="40" width="4" height="4" fill="#00ffff" filter="url(#cyanGlow)" transform="rotate(15 37 42)"/>
  <rect x="62" y="5" width="8" height="8" fill="#ffffff" filter="url(#cyanGlow)" transform="rotate(30 66 9)"/>

  <!-- Dynamic posing body -->
  <g transform="translate(0, 10)">
    <path d="M 22 28 L 50 28 L 44 58 L 26 58 Z" fill="url(#cyberMetal)" stroke="#00ffff" stroke-width="1.5"/>
    <path d="M 25 20 Q 36 2 47 20 L 43 29 L 29 29 Z" fill="#0f0f18"/>
    <path d="M 31 15 L 36 20 L 41 15 Z" fill="#00ffff"/>
    <!-- Laser Katana raised vertically -->
    <path d="M 48 34 L 56 -5 L 61 -5 L 53 34 Z" fill="url(#ninjaBlade)" filter="url(#heavyCyanGlow)"/>
  </g>
`, 100, 100);

// Player - Dive Attack (Dynamic head-first angle, high energy drill tip)
saveSvg('player_dive.svg', `
  <g transform="translate(0, 8) rotate(45 50 50)">
    <!-- Trailing plasma fields -->
    <polygon points="70,40 140,25 130,55" fill="url(#cyberScarf)" filter="url(#pinkGlow)" opacity="0.5"/>
    <polygon points="80,45 135,35 130,50" fill="#ff0055" opacity="0.7"/>

    <!-- Pushing Body -->
    <path d="M 20 22 L 48 22 L 42 52 L 24 52 Z" fill="url(#cyberMetal)" stroke="#00ffff" stroke-width="1.5"/>
    <path d="M 22 14 Q 34 -4 46 14 Z" fill="#0f0f18"/>
    
    <!-- Diving Sword extended -->
    <path d="M 42 45 L 115 45 L 115 50 L 42 50 Z" fill="url(#ninjaBlade)" filter="url(#heavyCyanGlow)"/>
    <polygon points="115,42 128,47 115,53" fill="#ffffff" filter="url(#cyanGlow)"/>
  </g>
`, 100, 100);

// Player - Cast (Gathering pure plasma energy in palms, Hadouken style)
saveSvg('player_cast.svg', `
  <!-- Ribbon Scarf flying back -->
  <path d="M 32 25 C 10 38 -5 48 -18 56 C -8 44 8 32 26 28" fill="url(#cyberScarf)" filter="url(#pinkGlow)"/>

  <!-- Torso thrusting forward -->
  <g transform="rotate(12 40 40)">
    <path d="M 22 22 L 50 22 L 44 52 L 26 52 Z" fill="url(#cyberMetal)" stroke="#00ffff" stroke-width="1.5"/>
    <path d="M 24 14 Q 36 -6 48 14 Z" fill="#0f0f18"/>
    <path d="M 30 10 L 36 15 L 42 10 Z" fill="#00ffff"/>
    
    <!-- Arms pushing forward -->
    <path d="M 28 28 L 68 25 L 68 35 Z" fill="url(#cyberMetalLight)"/>
    
    <!-- Blinding glowing core of raw plasma energy in hands -->
    <circle cx="74" cy="30" r="14" fill="url(#plasmaBlue)" filter="url(#heavyCyanGlow)"/>
    <circle cx="74" cy="30" r="6" fill="#ffffff"/>
  </g>
`, 90, 80);

// Player - Energy Wave (The Wave Projectile: sleek energy shape with code patterns)
saveSvg('player_wave.svg', `
  <g transform="translate(10, 10)">
    <!-- Outer wave glow -->
    <path d="M 24 -15 A 34 34 0 0 1 24 55 A 22 22 0 0 0 12 25 Z" fill="url(#plasmaBlue)" filter="url(#heavyCyanGlow)"/>
    <path d="M 22 -8 A 28 28 0 0 1 22 48 A 18 18 0 0 0 12 24 Z" fill="#ffffff" opacity="0.9"/>
    
    <!-- Digital tracer streams -->
    <line x1="22" y1="20" x2="-8" y2="20" stroke="#00ffff" stroke-width="5" stroke-linecap="round" filter="url(#cyanGlow)"/>
    <line x1="16" y1="10" x2="-14" y2="10" stroke="#0088cc" stroke-width="3" stroke-linecap="round" filter="url(#cyanGlow)"/>
    <line x1="18" y1="30" x2="-12" y2="30" stroke="#0088cc" stroke-width="3" stroke-linecap="round" filter="url(#cyanGlow)"/>

    <!-- Data matrix codes/squares behind projectile -->
    <rect x="-4" y="5" width="4" height="4" fill="#00ffff" opacity="0.6"/>
    <rect x="-18" y="16" width="3" height="3" fill="#ffffff" opacity="0.8"/>
    <rect x="-10" y="32" width="4" height="4" fill="#00ffff" opacity="0.5"/>
  </g>
`, 60, 60);

// === PLAYER COMBO FRAMES ===

// Combo Hit 1: Swift mid horizontal slash
saveSvg('player_combo1.svg', `
  <!-- Horizontal slash arc -->
  <path d="M 24 35 L 122 30 L 118 42 L 24 45 Z" fill="url(#ninjaBlade)" filter="url(#heavyCyanGlow)" opacity="0.8"/>
  <path d="M 36 37 L 118 34 L 116 38 L 36 41 Z" fill="#ffffff" opacity="0.95"/>

  <!-- Player body leaning -->
  <g transform="rotate(4 40 40)">
    <path d="M 22 22 L 50 22 L 44 52 L 26 52 Z" fill="url(#cyberMetal)" stroke="#00ffff" stroke-width="1.5"/>
    <path d="M 24 14 Q 36 -6 48 14 Z" fill="#0f0f18"/>
    <path d="M 30 10 L 36 15 L 42 10 Z" fill="#00ffff"/>
    <!-- Extended arm -->
    <path d="M 42 26 L 76 30 L 74 36 L 40 32 Z" fill="url(#cyberMetalLight)"/>
  </g>
  <!-- Katana horizontal -->
  <path d="M 72 28 L 126 26 L 124 32 L 70 34 Z" fill="url(#ninjaBlade)" filter="url(#cyanGlow)"/>
`, 135, 80);

// Combo Hit 2: Upward diagonal slash
saveSvg('player_combo2.svg', `
  <!-- Beautiful upward slash curve -->
  <path d="M 26 62 Q 58 32 98 6 L 92 16 Q 54 40 32 67 Z" fill="url(#ninjaBlade)" filter="url(#heavyCyanGlow)" opacity="0.75"/>
  <path d="M 32 58 Q 58 32 92 10 L 88 15 Q 54 38 36 61 Z" fill="#ffffff" opacity="0.95"/>

  <g transform="rotate(-8 40 40)">
    <path d="M 22 24 L 50 24 L 44 54 L 26 54 Z" fill="url(#cyberMetal)" stroke="#00ffff" stroke-width="1.5"/>
    <path d="M 24 16 Q 36 -4 48 16 Z" fill="#0f0f18"/>
    <!-- Uppercut swing arm -->
    <path d="M 40 28 L 66 14 L 64 21 L 38 34 Z" fill="url(#cyberMetalLight)"/>
  </g>
  <!-- Katana raised diagonal -->
  <path d="M 62 16 L 102 -6 L 99 1 L 59 22 Z" fill="url(#ninjaBlade)" filter="url(#heavyCyanGlow)"/>
`, 110, 80);

// Combo Hit 3: Spin-slash with dramatic circular tracer
saveSvg('player_combo3.svg', `
  <!-- Full circular trace -->
  <circle cx="40" cy="40" r="36" fill="none" stroke="url(#ninjaBlade)" stroke-width="8" filter="url(#heavyCyanGlow)" opacity="0.65" stroke-dasharray="140 80"/>
  <circle cx="40" cy="40" r="36" fill="none" stroke="#ffffff" stroke-width="2.5" opacity="0.9" stroke-dasharray="100 120"/>

  <!-- Body in extreme rotation spin -->
  <g transform="rotate(180 40 40) translate(0, -4)">
    <path d="M 22 22 L 50 22 L 44 52 L 26 52 Z" fill="url(#cyberMetal)" stroke="#ff0055" stroke-width="1.5"/>
    <path d="M 24 14 Q 36 -6 48 14 Z" fill="#0f0f18"/>
    <path d="M 30 10 L 36 15 L 42 10 Z" fill="#ff0055" filter="url(#pinkGlow)"/>
  </g>
  <!-- Scarf whipping outwards -->
  <path d="M 38 22 C 75 8 96 26 102 32 C 84 18 52 24 44 26" fill="url(#cyberScarf)" filter="url(#pinkGlow)" opacity="0.9"/>
`, 110, 80);

// Combo Hit 4: Heavy overhead slam (Earth-shattering dynamic graphics)
saveSvg('player_combo4.svg', `
  <!-- Dynamic downward impact blast -->
  <path d="M 26 -2 L 46 -2 L 76 68 L -4 68 Z" fill="url(#ninjaBlade)" filter="url(#heavyCyanGlow)" opacity="0.5"/>
  <path d="M 32 -2 L 40 -2 L 58 68 L 14 68 Z" fill="#ffffff" opacity="0.75"/>

  <!-- Blinding energy rings at ground impact -->
  <ellipse cx="36" cy="64" rx="28" ry="8" fill="none" stroke="#ffffff" stroke-width="3" filter="url(#cyanGlow)" opacity="0.8"/>
  <ellipse cx="36" cy="64" rx="16" ry="4" fill="#ffffff" filter="url(#heavyCyanGlow)"/>
  
  <!-- Laser impact fragments -->
  <line x1="16" y1="68" x2="-4" y2="74" stroke="#00ffff" stroke-width="4" stroke-linecap="round" filter="url(#cyanGlow)"/>
  <line x1="56" y1="68" x2="76" y2="74" stroke="#ff0055" stroke-width="4" stroke-linecap="round" filter="url(#pinkGlow)"/>

  <!-- Slamming Body -->
  <g transform="translate(2, 6)">
    <path d="M 22 14 L 50 14 L 44 44 L 26 44 Z" fill="url(#cyberMetal)" stroke="#00ffff" stroke-width="2"/>
    <circle cx="36" cy="26" r="6" fill="#00ffff" filter="url(#cyanGlow)"/>
    <path d="M 24 6 Q 36 -12 48 6 Z" fill="#0f0f18"/>
    <!-- Both hands slammed down -->
    <path d="M 31 16 L 36 -5 L 41 16 Z" fill="url(#cyberMetalLight)"/>
  </g>
  <!-- Vertical sword drove down -->
  <path d="M 34 -12 L 38 -12 L 40 62 L 32 62 Z" fill="url(#ninjaBlade)" filter="url(#heavyCyanGlow)"/>
`, 90, 80);


// ==========================================
// 2. ENEMIES SPRITES (Futuristic Cyberbots)
// ==========================================

// Enemy - Guard (Segmented RIOT armored enforcer)
saveSvg('enemy_guard.svg', `
  <!-- Heavy carbon block armor -->
  <path d="M 18 24 L 58 24 L 62 55 L 14 55 Z" fill="#181822" stroke="#f39c12" stroke-width="2.5"/>
  <!-- Glowing orange panel lines -->
  <path d="M 22 34 L 54 34 M 24 42 L 52 42 M 26 50 L 50 50" stroke="#f39c12" stroke-width="1.5" filter="url(#orangeGlow)"/>
  <circle cx="38" cy="38" r="6.5" fill="#f39c12" filter="url(#orangeGlow)"/>
  
  <!-- Robot Helm with glowing visor sensor -->
  <rect x="26" y="8" width="24" height="16" rx="4" fill="#0f0f15" stroke="#f39c12" stroke-width="1.2"/>
  <rect x="28" y="13" width="20" height="4" fill="#ff3300" filter="url(#orangeGlow)"/>

  <!-- High-voltage electric stun baton -->
  <rect x="58" y="16" width="6" height="44" rx="3" fill="#333" stroke="#f39c12" stroke-width="1"/>
  <!-- Crackling electric plasma arcs around baton -->
  <path d="M 58 10 C 66 18 68 28 60 38" fill="none" stroke="#00ffff" stroke-width="2.5" filter="url(#cyanGlow)"/>
  <path d="M 64 22 C 54 32 62 42 66 52" fill="none" stroke="#00ffff" stroke-width="1.5" filter="url(#cyanGlow)"/>
`, 80, 80);

// Enemy - Axe Brute (Colossal mechanoid, glowing thermal power generator)
saveSvg('enemy_axe.svg', `
  <!-- Giant industrial generator body -->
  <rect x="12" y="16" width="56" height="54" rx="8" fill="#241010" stroke="#ff3333" stroke-width="3"/>
  
  <!-- Glowing mechanical heating grids -->
  <rect x="22" y="26" width="36" height="10" rx="2" fill="#ff3300" filter="url(#orangeGlow)"/>
  <rect x="22" y="42" width="36" height="10" rx="2" fill="#ff3300" filter="url(#orangeGlow)"/>
  
  <!-- Massive mechanical joints -->
  <circle cx="12" cy="43" r="7" fill="#111" stroke="#ff3333" stroke-width="1.5"/>
  <circle cx="68" cy="43" r="7" fill="#111" stroke="#ff3333" stroke-width="1.5"/>

  <!-- Head with glowing red sensor array -->
  <polygon points="30,16 50,16 46,6 34,6" fill="#180b0b" stroke="#ff3333" stroke-width="1.2"/>
  <circle cx="40" cy="11" r="3.5" fill="#ff0000" filter="url(#orangeGlow)"/>

  <!-- Colossal Laser Axe -->
  <rect x="68" y="2" width="8" height="74" fill="#0f0f15" stroke="#333" stroke-width="1.5"/>
  <!-- Intricate thermal heat cutter axe blade -->
  <path d="M 72 10 Q 112 0 112 35 Q 112 70 72 60 Z" fill="url(#heavyAxe)" filter="url(#orangeGlow)"/>
  <path d="M 72 20 Q 102 12 102 35 Q 102 58 72 50 Z" fill="#ffffff" opacity="0.85"/>
`, 110, 80);

// Enemy - Ninja Bot (Sleek aerodynamic frame, digital green blades)
saveSvg('enemy_ninja.svg', `
  <!-- Lightweight insectoid chassis -->
  <polygon points="40,16 52,55 28,55" fill="#0d141e" stroke="#00ffcc" stroke-width="1.8"/>
  <line x1="40" y1="20" x2="40" y2="52" stroke="#00ffcc" stroke-width="1" filter="url(#greenGlow)"/>

  <!-- Spherical head with glowing green ocular sensor -->
  <circle cx="40" cy="11" r="9" fill="#0d141e" stroke="#00ffcc" stroke-width="1.5"/>
  <circle cx="40" cy="11" r="3.5" fill="#00ffcc" filter="url(#greenGlow)"/>
  
  <!-- Digital dual claw blade attachments (Extremely glowing) -->
  <path d="M 24 38 L -4 60 Q 6 48 12 44 Z" fill="url(#ninjaGreen)" filter="url(#greenGlow)"/>
  <path d="M 56 38 L 84 60 Q 74 48 68 44 Z" fill="url(#ninjaGreen)" filter="url(#greenGlow)"/>
  
  <!-- Secondary optic nodes -->
  <circle cx="34" cy="11" r="1.5" fill="#00ffcc"/>
  <circle cx="46" cy="11" r="1.5" fill="#00ffcc"/>
`, 80, 80);

// Enemy - Sniper (Crawling defense drone, railgun barrel + laser tracer)
saveSvg('enemy_sniper.svg', `
  <!-- Tripod support core -->
  <rect x="22" y="24" width="36" height="32" rx="4" fill="#0e1a14" stroke="#00ff55" stroke-width="2"/>
  <!-- Glowing code segments -->
  <path d="M 28 34 L 52 34 M 30 42 L 50 42" stroke="#00ff55" stroke-width="1.5" filter="url(#greenGlow)"/>
  
  <!-- Turret neck -->
  <path d="M 28 14 L 52 14 L 46 24 L 34 24 Z" fill="#0e1a14" stroke="#00ff55" stroke-width="1.2"/>
  <!-- Optical high-tech charging lens -->
  <circle cx="40" cy="19" r="6" fill="#0e1a14" stroke="#00ff55" stroke-width="1.5"/>
  <circle cx="40" cy="19" r="2.5" fill="#ffffff" filter="url(#greenGlow)"/>

  <!-- Electromagnetic Railgun barrel -->
  <rect x="42" y="32" width="44" height="8" rx="1.5" fill="#111" stroke="#333" stroke-width="1"/>
  <!-- Electromagnetic coils charging green plasma -->
  <rect x="50" y="34" width="4" height="4" fill="#00ff55" filter="url(#greenGlow)"/>
  <rect x="62" y="34" width="4" height="4" fill="#00ff55" filter="url(#greenGlow)"/>
  <rect x="74" y="34" width="4" height="4" fill="#00ff55" filter="url(#greenGlow)"/>
`, 90, 80);

// Enemy Bullet - (Laser bolt with white hot core)
saveSvg('projectile.svg', `
  <!-- Energy Bolt -->
  <ellipse cx="20" cy="10" rx="16" ry="5" fill="#00ff55" filter="url(#greenGlow)"/>
  <ellipse cx="20" cy="10" rx="9" ry="2" fill="#ffffff"/>
`, 40, 20);


// ==========================================
// 3. CORE GUARDIAN BOSS SPRITES
// ==========================================

// Boss - Idle (Massive core mech with safety hazard stripes and plasma shielding)
saveSvg('boss_idle.svg', `
  <!-- Heavy Reactor Shield Plates -->
  <path d="M 8 26 L 60 6 L 112 26 L 102 98 L 18 98 Z" fill="#14070b" stroke="#ff0055" stroke-width="5"/>
  
  <!-- Hazard safety warnings -->
  <line x1="22" y1="36" x2="36" y2="22" stroke="#ffcc00" stroke-width="3" opacity="0.6"/>
  <line x1="84" y1="36" x2="98" y2="22" stroke="#ffcc00" stroke-width="3" opacity="0.6"/>
  
  <!-- Evil visor eyes -->
  <polygon points="42,32 54,36 50,42" fill="#ff0055" filter="url(#pinkGlow)"/>
  <polygon points="78,32 66,36 70,42" fill="#ff0055" filter="url(#pinkGlow)"/>

  <!-- CENTRAL FUSION CORE (Pulsing pink reactor) -->
  <circle cx="60" cy="66" r="22" fill="url(#heavyAxe)" stroke="#ff0055" stroke-width="2" filter="url(#heavyCyanGlow)"/>
  <circle cx="60" cy="66" r="10" fill="#ffffff" filter="url(#pinkGlow)"/>
  
  <!-- Cooling pipe networks -->
  <path d="M 32 66 L 18 66 M 88 66 L 102 66" stroke="#555" stroke-width="3"/>
  <path d="M 32 66 L 32 98 M 88 66 L 88 98" stroke="#ff0055" stroke-width="1.5" opacity="0.5"/>

  <!-- Colossal hydraulic shoulders -->
  <rect x="-14" y="26" width="30" height="52" rx="10" fill="#0f0709" stroke="#ff0055" stroke-width="3"/>
  <rect x="104" y="26" width="30" height="52" rx="10" fill="#0f0709" stroke="#ff0055" stroke-width="3"/>
`, 140, 120);

// Boss - Windup (Core fully overloaded, glowing yellow/orange)
saveSvg('boss_windup.svg', `
  <path d="M 8 26 L 60 6 L 112 26 L 102 98 L 18 98 Z" fill="#1c1206" stroke="#ffaa00" stroke-width="5"/>
  
  <!-- Visor overloaded warning yellow -->
  <polygon points="42,32 54,36 50,42" fill="#ffaa00" filter="url(#orangeGlow)"/>
  <polygon points="78,32 66,36 70,42" fill="#ffaa00" filter="url(#orangeGlow)"/>

  <!-- Core charging yellow-hot -->
  <circle cx="60" cy="66" r="28" fill="none" stroke="#ffaa00" stroke-width="4" stroke-dasharray="8 4" filter="url(#orangeGlow)"/>
  <circle cx="60" cy="66" r="22" fill="url(#heavyAxe)" filter="url(#orangeGlow)"/>
  <circle cx="60" cy="66" r="8" fill="#ffffff"/>

  <!-- Power gathering grids -->
  <path d="M 32 40 L 40 66 L 32 90" fill="none" stroke="#ffaa00" stroke-width="2" opacity="0.8"/>
  <path d="M 88 40 L 80 66 L 88 90" fill="none" stroke="#ffaa00" stroke-width="2" opacity="0.8"/>

  <!-- Hydraulic arms raised -->
  <rect x="-20" y="8" width="30" height="52" rx="10" fill="#111" stroke="#ffaa00" stroke-width="3" transform="rotate(-26 0 32)"/>
  <rect x="110" y="8" width="30" height="52" rx="10" fill="#111" stroke="#ffaa00" stroke-width="3" transform="rotate(26 120 32)"/>
`, 140, 120);

// Boss - Rush (Aggressive forward tilt, massive exhaust trails)
saveSvg('boss_rush.svg', `
  <g transform="rotate(12 60 60)">
    <path d="M 8 26 L 60 6 L 112 26 L 102 98 L 18 98 Z" fill="#24040a" stroke="#ff0000" stroke-width="5"/>
    
    <!-- Angry red visors -->
    <line x1="38" y1="32" x2="52" y2="38" stroke="#ff0000" stroke-width="6" filter="url(#orangeGlow)"/>
    <line x1="82" y1="32" x2="68" y2="38" stroke="#ff0000" stroke-width="6" filter="url(#orangeGlow)"/>

    <!-- Overheated red core -->
    <circle cx="60" cy="66" r="25" fill="#ff0000" filter="url(#orangeGlow)"/>
    <circle cx="60" cy="66" r="10" fill="#ffffff"/>

    <!-- Dynamic thruster exhaust sparks -->
    <polygon points="-20,46 -60,46 -40,36" fill="url(#heavyAxe)" filter="url(#orangeGlow)"/>
    <polygon points="-15,66 -55,66 -35,56" fill="url(#heavyAxe)" filter="url(#orangeGlow)"/>
    <polygon points="-10,86 -50,86 -30,76" fill="url(#heavyAxe)" filter="url(#orangeGlow)"/>
  </g>
`, 160, 120);

// Boss - Attack (Devastating wide sweep, double crescent energy arc)
saveSvg('boss_attack.svg', `
  <path d="M 8 26 L 60 6 L 112 26 L 102 98 L 18 98 Z" fill="#2a000f" stroke="#ff0055" stroke-width="5"/>
  <circle cx="60" cy="66" r="22" fill="#ffffff" filter="url(#heavyCyanGlow)"/>

  <!-- Colossal Dual Blade Slash Sweep -->
  <path d="M -25 55 A 125 125 0 0 1 205 55" fill="none" stroke="url(#heavyAxe)" stroke-width="16" filter="url(#orangeGlow)" stroke-linecap="round"/>
  <path d="M -25 55 A 125 125 0 0 1 205 55" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
`, 220, 120);


// ==========================================
// 4. ENVIRONMENT & PLATFORMS
// ==========================================

// Cyber Platform Tile (Intricate metal texture, cyber grid, rivets, glowing edge)
saveBgSvg('platform.svg', `
  <rect width="64" height="64" fill="url(#cyberMetal)" stroke="#1a1a2e" stroke-width="2.5"/>
  
  <!-- Hexagonal reinforcement pattern inside platform -->
  <path d="M 0 16 L 64 16 M 0 32 L 64 32 M 0 48 L 64 48" stroke="#111" stroke-width="1.5"/>
  <path d="M 16 0 L 16 64 M 32 0 L 32 64 M 48 0 L 48 64" stroke="#111" stroke-width="1.5"/>
  
  <!-- Diagonal braces for extra detail -->
  <line x1="0" y1="16" x2="16" y2="0" stroke="#00ffff" stroke-width="0.5" opacity="0.3"/>
  <line x1="48" y1="64" x2="64" y2="48" stroke="#00ffff" stroke-width="0.5" opacity="0.3"/>
  <line x1="0" y1="48" x2="16" y2="64" stroke="#00ffff" stroke-width="0.5" opacity="0.3"/>
  <line x1="48" y1="0" x2="64" y2="16" stroke="#00ffff" stroke-width="0.5" opacity="0.3"/>

  <!-- Cyberpunk Top Edge Neon Glow -->
  <rect x="0" y="0" width="64" height="6" fill="#00ffff" filter="url(#bgGlow)"/>
  <rect x="0" y="0" width="64" height="2" fill="#ffffff"/>

  <!-- Cyber rivets -->
  <circle cx="8" cy="11" r="2.5" fill="#00ffff" filter="url(#bgGlow)"/>
  <circle cx="56" cy="11" r="2.5" fill="#00ffff" filter="url(#bgGlow)"/>
  <circle cx="8" cy="53" r="2" fill="#333"/>
  <circle cx="56" cy="53" r="2" fill="#333"/>
`, 64, 64);

// City Background (Distant Megastructures, Cyber Moon, Parallax Data Starfields)
saveBgSvg('bg_city_far.svg', `
  <rect width="1280" height="720" fill="url(#bgFade)"/>
  <rect width="1280" height="720" fill="url(#grid)" opacity="0.6"/>
  
  <!-- Giant Cyber Moon -->
  <circle cx="1020" cy="180" r="110" fill="#ff0055" filter="url(#bgGlow)" opacity="0.55"/>
  <circle cx="1020" cy="180" r="95" fill="url(#cyberScarf)" opacity="0.8"/>
  <!-- Horizon Scanlines slicing the moon -->
  <rect x="800" y="150" width="400" height="12" fill="#0f0c21"/>
  <rect x="830" y="190" width="350" height="16" fill="#0f0c21"/>
  <rect x="810" y="230" width="380" height="8" fill="#0f0c21"/>

  <!-- High tech floating data spores -->
  <g fill="#00ffff" filter="url(#bgGlow)" opacity="0.7">
    <circle cx="120" cy="100" r="2.5"/><circle cx="280" cy="140" r="3.5"/>
    <circle cx="530" cy="90" r="2"/><circle cx="780" cy="110" r="3"/>
    <rect x="340" y="70" width="6" height="6" transform="rotate(45 343 73)"/>
    <rect x="880" y="60" width="5" height="5" transform="rotate(45 882 62)"/>
  </g>

  <!-- Distant Megastructures Skyline -->
  <path d="M 0 530 L 100 440 L 150 440 L 180 470 L 290 360 L 360 360 L 400 410 L 520 290 L 610 290 L 680 370 L 810 260 L 880 260 L 960 370 L 1080 300 L 1160 300 L 1220 380 L 1280 310 L 1280 720 L 0 720 Z" fill="#090515" stroke="#33144a" stroke-width="2.5"/>
`, 1280, 720);

// Midground City (Detailed Skyscrapers, Holograms, Glowing Advertisements)
saveBgSvg('bg_city_mid.svg', `
  <defs>
    <linearGradient id="bldgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#120e24"/>
      <stop offset="100%" stop-color="#05030d"/>
    </linearGradient>
  </defs>
  
  <!-- Detailed Buildings -->
  <g fill="url(#bldgGrad)" stroke="#00ffff" stroke-width="1.8">
    <rect x="40" y="260" width="150" height="460" />
    <polygon points="40,260 115,190 190,260" fill="url(#bldgGrad)"/>
    
    <rect x="290" y="160" width="170" height="560" />
    
    <rect x="540" y="300" width="190" height="420" />
    
    <rect x="800" y="100" width="160" height="620" />
    <polygon points="800,100 880,30 960,100" fill="url(#bldgGrad)"/>
    
    <rect x="1050" y="230" width="170" height="490" />
  </g>

  <!-- High-Fidelity Hologram Ads & Neon Signage -->
  <g filter="url(#bgGlow)">
    <!-- Bldg 1 Windows -->
    <rect x="65" y="300" width="22" height="44" fill="#00ffff" opacity="0.85"/>
    <rect x="105" y="300" width="22" height="44" fill="#00ffff" opacity="0.85"/>
    <rect x="145" y="300" width="22" height="44" fill="#00ffff" opacity="0.85"/>
    <rect x="65" y="370" width="22" height="44" fill="#ff0055" opacity="0.8"/>
    <rect x="105" y="370" width="22" height="44" fill="#ff0055" opacity="0.8"/>

    <!-- Bldg 2 Cyber Circuit Core -->
    <line x1="290" y1="230" x2="460" y2="230" stroke="#f39c12" stroke-width="8"/>
    <rect x="330" y="260" width="16" height="180" fill="#ff0055" opacity="0.85"/>
    <rect x="375" y="260" width="16" height="180" fill="#ff0055" opacity="0.85"/>
    <rect x="420" y="260" width="16" height="180" fill="#ff0055" opacity="0.85"/>

    <!-- Bldg 4 Giant Japanese Kanji/Hologram Text -->
    <text x="835" y="190" font-family="Impact, sans-serif" font-size="54" fill="#00ffff" letter-spacing="4" transform="rotate(90 835 190)">NINJA</text>
    <text x="895" y="190" font-family="Impact, sans-serif" font-size="54" fill="#ff0055" letter-spacing="4" transform="rotate(90 895 190)">CYBER</text>

    <!-- Bldg 5 Cyber Grid matrix -->
    <path d="M 1070 280 L 1200 280 M 1070 310 L 1200 310 M 1070 340 L 1200 340 M 1070 370 L 1200 370" stroke="#00ffcc" stroke-width="5" stroke-dasharray="8 4"/>
  </g>
`, 1280, 720);

// Forest Backgrounds - Far (Digital Cyber forest with glowing matrices)
saveBgSvg('bg_forest_far.svg', `
  <rect width="1280" height="720" fill="#020a04"/>
  <rect width="1280" height="720" fill="url(#grid)" opacity="0.4"/>
  
  <!-- Giant code pillars representing trees -->
  <g fill="#041a0b" stroke="#083817" stroke-width="2.5">
    <rect x="120" y="180" width="55" height="540" />
    <rect x="380" y="100" width="75" height="620" />
    <rect x="720" y="220" width="45" height="500" />
    <rect x="1020" y="80" width="95" height="640" />
  </g>
`, 1280, 720);

// Forest Backgrounds - Mid (Segmented cyber leaves, glowing electronic spores)
saveBgSvg('bg_forest_mid.svg', `
  <!-- Digital trees -->
  <g fill="#072b12" stroke="#00ff55" stroke-width="2">
    <rect x="180" y="80" width="85" height="640" />
    <rect x="580" y="40" width="105" height="680" />
    <rect x="880" y="120" width="75" height="600" />
    
    <!-- Segmented angular high tech leaves -->
    <polygon points="120,180 220,70 320,180 220,130" fill="#083d19" stroke="#00ff55" stroke-width="1"/>
    <polygon points="480,130 630,20 780,130 630,80" fill="#083d19" stroke="#00ff55" stroke-width="1"/>
    <polygon points="780,220 915,110 1050,220 915,170" fill="#083d19" stroke="#00ff55" stroke-width="1"/>
  </g>

  <!-- Glowing cybernetic data spores -->
  <g fill="#00ff55" filter="url(#bgGlow)">
    <rect x="215" y="260" width="15" height="90" rx="7" fill="#00ffcc"/>
    <rect x="620" y="200" width="25" height="140" rx="12" fill="#00ff55"/>
    <circle cx="915" cy="350" r="18" fill="#00ffcc"/>

    <!-- Code spores floating in forest -->
    <circle cx="280" cy="360" r="5"/><circle cx="480" cy="460" r="4"/>
    <circle cx="780" cy="260" r="6"/><circle cx="1080" cy="400" r="5"/>
  </g>
`, 1280, 720);

// Reactor Core Backgrounds - Far (Heavy machinery pipelines, warning safety grid)
saveBgSvg('bg_core_far.svg', `
  <rect width="1280" height="720" fill="#0d0202"/>
  <rect width="1280" height="720" fill="url(#grid)" opacity="0.35"/>
  
  <!-- Distant massive rotating fans -->
  <circle cx="200" cy="360" r="320" fill="none" stroke="#220505" stroke-width="50" stroke-dasharray="70 40"/>
  <circle cx="1080" cy="200" r="280" fill="none" stroke="#220505" stroke-width="40" stroke-dasharray="60 30"/>
`, 1280, 720);

// Reactor Core Backgrounds - Mid (Glowing cooling towers, massive fusion engine)
saveBgSvg('bg_core_mid.svg', `
  <!-- Power Pipes -->
  <g fill="#140003" stroke="#ff0055" stroke-width="4.5">
    <rect x="250" y="0" width="130" height="720" />
    <rect x="900" y="0" width="130" height="720" />
  </g>
  
  <!-- High Tech Central Fusion Core Engine -->
  <circle cx="640" cy="360" r="230" fill="#140003" stroke="#ff0055" stroke-width="16"/>
  <!-- Warning neon orange outer core ring -->
  <circle cx="640" cy="360" r="190" fill="none" stroke="#ff9900" stroke-width="6" stroke-dasharray="30 15" filter="url(#bgGlow)"/>
  <!-- Active plasma center (Extremely glowing) -->
  <circle cx="640" cy="360" r="130" fill="url(#heavyAxe)" filter="url(#bgGlow)" opacity="0.6"/>
  <circle cx="640" cy="360" r="70" fill="#ffffff" filter="url(#bgGlow)"/>
  
  <!-- Glowing warning terminals on midground towers -->
  <g fill="#ffffff" filter="url(#bgGlow)">
    <rect x="295" y="100" width="40" height="40" rx="20" fill="#ff0055"/>
    <rect x="295" y="420" width="40" height="40" rx="20" fill="#ff0055"/>
    <rect x="945" y="200" width="40" height="40" rx="20" fill="#ff0055"/>
    <rect x="945" y="520" width="40" height="40" rx="20" fill="#ff0055"/>
  </g>
`, 1280, 720);

console.log('High-fidelity intricate cybernetic SVG graphics programmatically generated successfully!');
