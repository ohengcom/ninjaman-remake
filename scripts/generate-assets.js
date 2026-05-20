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
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <filter id="heavyGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3a3a4f"/>
        <stop offset="50%" stop-color="#1e1e2f"/>
        <stop offset="100%" stop-color="#0a0a14"/>
      </linearGradient>
      <linearGradient id="blade" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#00ffff"/>
      </linearGradient>
      <linearGradient id="energy" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ff0055"/>
        <stop offset="100%" stop-color="#ff9900"/>
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
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00ffff" stroke-width="0.5" opacity="0.15"/>
      </pattern>
      <linearGradient id="bgFade" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#05050a"/>
        <stop offset="50%" stop-color="#151025"/>
        <stop offset="100%" stop-color="#2a1b40"/>
      </linearGradient>
    </defs>
    ${content}
  </svg>`;
  fs.writeFileSync(path.join(bgDir, filename), fullContent);
}

// === PLAYER SPRITES ===

saveSvg('player_idle.svg', `
  <!-- Flowing Energy Scarf -->
  <path d="M 35 25 Q 15 45 5 65 Q 15 50 30 30" fill="url(#energy)" opacity="0.8" filter="url(#glow)"/>
  <path d="M 35 25 Q 20 50 15 70 Q 25 55 35 30" fill="#ff0055" opacity="0.6"/>
  <!-- Cyber Armor Core -->
  <path d="M 25 22 L 55 22 L 50 55 L 30 55 Z" fill="url(#metal)" stroke="#00ffff" stroke-width="1.5"/>
  <circle cx="40" cy="38" r="6" fill="#00ffff" filter="url(#glow)"/>
  <!-- Arms/Shoulders -->
  <path d="M 20 22 L 28 22 L 25 45 L 17 45 Z" fill="url(#metal)"/>
  <path d="M 52 22 L 60 22 L 63 45 L 55 45 Z" fill="url(#metal)"/>
  <circle cx="24" cy="26" r="5" fill="#ff0055"/>
  <circle cx="56" cy="26" r="5" fill="#ff0055"/>
  <!-- Head/Helmet -->
  <path d="M 28 15 Q 40 -5 52 15 L 48 25 L 32 25 Z" fill="#0f0f15" stroke="#3a3a50" stroke-width="2"/>
  <!-- V-Shaped Visor -->
  <path d="M 32 10 L 48 10 L 40 18 Z" fill="#00ffff" filter="url(#glow)"/>
  <!-- Katana Hilt -->
  <rect x="12" y="15" width="4" height="45" rx="2" fill="#111" transform="rotate(-25 12 15)"/>
  <rect x="8" y="25" width="12" height="4" fill="#00ffff" transform="rotate(-25 12 15)"/>
`, 80, 80);

saveSvg('player_run.svg', `
  <g transform="rotate(20 40 40) translate(5, 5)">
    <!-- Scarf blowing far back -->
    <path d="M 35 20 Q -10 30 -20 45 Q 0 30 25 25" fill="url(#energy)" filter="url(#glow)" opacity="0.9"/>
    <!-- Body -->
    <path d="M 25 22 L 55 22 L 50 55 L 30 55 Z" fill="url(#metal)" stroke="#00ffff" stroke-width="1.5"/>
    <circle cx="40" cy="38" r="6" fill="#00ffff" filter="url(#glow)"/>
    <!-- Head -->
    <path d="M 28 15 Q 40 -5 52 15 L 48 25 L 32 25 Z" fill="#0f0f15" stroke="#3a3a50" stroke-width="2"/>
    <path d="M 34 10 L 50 10 L 42 18 Z" fill="#00ffff" filter="url(#glow)"/>
    <!-- Arm running -->
    <path d="M 20 26 L 45 35 L 40 42 L 15 33 Z" fill="url(#metal)"/>
  </g>
`, 80, 80);

saveSvg('player_jump.svg', `
  <g transform="translate(0, -5)">
    <!-- Scarf trailing straight down -->
    <path d="M 35 25 Q 30 60 35 80 Q 45 55 45 25" fill="url(#energy)" filter="url(#glow)" opacity="0.8"/>
    <!-- Tucked Body -->
    <path d="M 25 20 L 55 20 L 45 45 L 35 45 Z" fill="url(#metal)" stroke="#00ffff" stroke-width="1.5"/>
    <!-- Legs tucked -->
    <path d="M 30 45 L 20 65 M 50 45 L 60 65" stroke="#ff0055" stroke-width="4" stroke-linecap="round"/>
    <!-- Head -->
    <path d="M 28 12 Q 40 -8 52 12 L 48 22 L 32 22 Z" fill="#0f0f15"/>
    <path d="M 32 7 L 48 7 L 40 15 Z" fill="#00ffff" filter="url(#glow)"/>
  </g>
`, 80, 80);

saveSvg('player_attack.svg', `
  <!-- Massive crescent slash -->
  <path d="M 20 10 A 70 70 0 0 1 120 50 L 100 60 A 50 50 0 0 0 30 30 Z" fill="#00ffff" filter="url(#heavyGlow)" opacity="0.7"/>
  <!-- Body -->
  <path d="M 25 22 L 55 22 L 50 55 L 30 55 Z" fill="url(#metal)" stroke="#00ffff" stroke-width="1.5"/>
  <circle cx="40" cy="38" r="6" fill="#00ffff"/>
  <!-- Head -->
  <path d="M 28 15 Q 40 -5 52 15 L 48 25 L 32 25 Z" fill="#0f0f15"/>
  <path d="M 36 10 L 52 10 L 44 18 Z" fill="#00ffff" filter="url(#heavyGlow)"/>
  <!-- Attacking Arm -->
  <path d="M 40 26 L 75 35 L 70 42 L 35 33 Z" fill="url(#metal)"/>
  <!-- Katana -->
  <path d="M 70 36 L 125 55 L 120 58 L 65 39 Z" fill="url(#blade)" filter="url(#heavyGlow)"/>
`, 130, 80);

saveSvg('player_dash.svg', `
  <g transform="translate(0, 15) rotate(90 40 40)">
    <!-- Speed Lines -->
    <line x1="20" y1="0" x2="20" y2="-40" stroke="#00ffff" stroke-width="4" filter="url(#glow)"/>
    <line x1="60" y1="10" x2="60" y2="-30" stroke="#ff0055" stroke-width="4" filter="url(#glow)"/>
    <!-- Drill/Dash shape -->
    <polygon points="40,10 65,40 40,70 15,40" fill="url(#metal)" stroke="#00ffff" stroke-width="2"/>
    <circle cx="40" cy="40" r="10" fill="#ff0055" filter="url(#heavyGlow)"/>
  </g>
`, 80, 80);

saveSvg('player_defend.svg', `
  <!-- Scarf Back -->
  <path d="M 35 25 Q 15 45 5 65" fill="none" stroke="url(#energy)" stroke-width="6" opacity="0.7"/>
  <!-- Body Tucked -->
  <path d="M 25 22 L 55 22 L 50 50 L 30 50 Z" fill="url(#metal)"/>
  <!-- Head Tucked -->
  <path d="M 30 18 Q 40 -2 50 18 L 46 28 L 34 28 Z" fill="#0f0f15"/>
  <path d="M 34 14 L 46 14 L 40 20 Z" fill="#00ffff" filter="url(#glow)"/>
  <!-- Katana Block -->
  <rect x="45" y="10" width="6" height="50" fill="url(#blade)" filter="url(#heavyGlow)"/>
  <!-- Hexagon Energy Shield -->
  <polygon points="50,5 70,20 70,50 50,65 30,50 30,20" fill="none" stroke="#00ffff" stroke-width="3" filter="url(#glow)" opacity="0.9"/>
`, 80, 80);

saveSvg('player_uppercut.svg', `
  <!-- Vertical Slash -->
  <path d="M 40 90 Q 70 50 60 0 L 45 10 Q 55 50 30 80 Z" fill="#00ffff" filter="url(#heavyGlow)" opacity="0.8"/>
  <path d="M 25 32 L 55 32 L 50 65 L 30 65 Z" fill="url(#metal)"/>
  <path d="M 28 25 Q 40 5 52 25 L 48 35 L 32 35 Z" fill="#0f0f15"/>
  <path d="M 36 20 L 52 20 L 44 28 Z" fill="#00ffff" filter="url(#glow)"/>
  <!-- Katana -->
  <path d="M 55 40 L 65 0 L 70 0 L 60 40 Z" fill="url(#blade)" filter="url(#heavyGlow)"/>
`, 100, 100);
// Player - Dive Attack
saveSvg('player_dive.svg', `
  <g transform="translate(0, 10) rotate(45 50 50)">
    <!-- Impact lines -->
    <polygon points="80,50 140,40 140,60" fill="#ff0055" filter="url(#heavyGlow)" opacity="0.6"/>
    <path d="M 25 22 L 55 22 L 50 55 L 30 55 Z" fill="url(#metal)"/>
    <path d="M 28 15 Q 40 -5 52 15 L 48 25 L 32 25 Z" fill="#0f0f15"/>
    <path d="M 50 45 L 110 45 L 110 50 L 50 50 Z" fill="url(#blade)" filter="url(#heavyGlow)"/>
  </g>
`, 100, 100);

// Player - Cast (Hadouken Pose)
saveSvg('player_cast.svg', `
  <!-- Scarf Back -->
  <path d="M 35 25 Q 10 40 0 50" fill="none" stroke="url(#energy)" stroke-width="4" filter="url(#glow)"/>
  <!-- Body leaning forward -->
  <g transform="rotate(10 40 40)">
      <path d="M 25 22 L 55 22 L 50 55 L 30 55 Z" fill="url(#metal)" stroke="#00ffff" stroke-width="1.5"/>
      <!-- Head -->
      <path d="M 28 15 Q 40 -5 52 15 L 48 25 L 32 25 Z" fill="#0f0f15"/>
      <path d="M 36 10 L 52 10 L 44 18 Z" fill="#00ffff" filter="url(#glow)"/>
      <!-- Arms thrust forward -->
      <path d="M 30 30 L 70 25 L 70 35 Z" fill="url(#metal)"/>
      <!-- Energy gathering in hands -->
      <circle cx="75" cy="30" r="10" fill="#00ffff" filter="url(#heavyGlow)"/>
      <circle cx="75" cy="30" r="4" fill="#ffffff"/>
  </g>
`, 90, 80);

// Player - Energy Wave (The Projectile)
saveSvg('player_wave.svg', `
  <g transform="translate(10, 10)">
      <!-- Crescent shape -->
      <path d="M 20 -10 A 30 30 0 0 1 20 50 A 20 20 0 0 0 10 20 Z" fill="#00ffff" filter="url(#heavyGlow)"/>
      <path d="M 20 -10 A 30 30 0 0 1 20 50 A 20 20 0 0 0 10 20 Z" fill="#ffffff" opacity="0.8"/>
      <!-- Trailing energy -->
      <line x1="20" y1="20" x2="-10" y2="20" stroke="#00ffff" stroke-width="6" filter="url(#glow)"/>
  </g>
`, 60, 60);

// === ENEMIES ===

saveSvg('enemy_guard.svg', `
  <!-- Chunky Enforcer -->
  <path d="M 20 25 L 60 25 L 65 55 L 15 55 Z" fill="#1b202c" stroke="#f39c12" stroke-width="2"/>
  <circle cx="40" cy="40" r="8" fill="#f39c12" filter="url(#glow)"/>
  <!-- Robotic Head -->
  <rect x="30" y="10" width="20" height="15" rx="2" fill="#1b202c"/>
  <rect x="30" y="15" width="20" height="4" fill="#ff0000" filter="url(#glow)"/>
  <!-- Stun Baton -->
  <rect x="60" y="20" width="8" height="40" rx="4" fill="#f39c12" filter="url(#heavyGlow)"/>
`, 80, 80);

saveSvg('enemy_axe.svg', `
  <!-- Huge Bruiser -->
  <rect x="15" y="20" width="50" height="50" rx="5" fill="#2c1515" stroke="#ff4444" stroke-width="3"/>
  <line x1="25" y1="30" x2="55" y2="30" stroke="#ff4444" stroke-width="2"/>
  <line x1="25" y1="40" x2="55" y2="40" stroke="#ff4444" stroke-width="2"/>
  <rect x="30" y="10" width="20" height="10" fill="#2c1515"/>
  <circle cx="40" cy="15" r="3" fill="#ff4444" filter="url(#glow)"/>
  <!-- Laser Axe -->
  <rect x="65" y="5" width="10" height="70" fill="#111"/>
  <path d="M 65 15 Q 100 5 100 35 Q 100 65 65 55 Z" fill="#ff4444" filter="url(#heavyGlow)"/>
`, 110, 80);

saveSvg('enemy_ninja.svg', `
  <!-- Sleek Stealth Bot -->
  <polygon points="40,20 50,55 30,55" fill="#0f1f2f" stroke="#00ffcc" stroke-width="1.5"/>
  <circle cx="40" cy="15" r="8" fill="#0f1f2f" stroke="#00ffcc"/>
  <circle cx="40" cy="15" r="3" fill="#00ffcc" filter="url(#glow)"/>
  <!-- Energy Blades -->
  <path d="M 25 40 L 0 60 L 10 50 Z" fill="#00ffcc" filter="url(#glow)"/>
  <path d="M 55 40 L 80 60 L 70 50 Z" fill="#00ffcc" filter="url(#glow)"/>
`, 80, 80);

saveSvg('enemy_sniper.svg', `
  <!-- Ranged Turret/Sniper Bot -->
  <rect x="25" y="25" width="30" height="30" rx="2" fill="#15201b" stroke="#00ff55" stroke-width="1.5"/>
  <path d="M 30 15 L 50 15 L 45 25 L 35 25 Z" fill="#15201b" stroke="#00ff55" stroke-width="1.5"/>
  <!-- Sniper Eye -->
  <circle cx="40" cy="20" r="4" fill="#00ff55" filter="url(#heavyGlow)"/>
  <!-- Long Rifle -->
  <rect x="40" y="35" width="40" height="6" fill="#111" stroke="#333" stroke-width="1"/>
  <circle cx="80" cy="38" r="3" fill="#00ff55" filter="url(#glow)"/>
`, 90, 80);

saveSvg('projectile.svg', `
  <!-- Energy Bolt -->
  <ellipse cx="20" cy="10" rx="15" ry="4" fill="#00ff55" filter="url(#heavyGlow)"/>
  <ellipse cx="20" cy="10" rx="8" ry="2" fill="#ffffff"/>
`, 40, 20);

saveSvg('boss_idle.svg', `
  <path d="M 10 30 L 60 10 L 110 30 L 100 100 L 20 100 Z" fill="#1a0b12" stroke="#ff0055" stroke-width="4"/>
  <polygon points="60,10 40,-15 50,10" fill="#ff0055"/>
  <polygon points="60,10 80,-15 70,10" fill="#ff0055"/>
  <!-- Eyes -->
  <line x1="45" y1="35" x2="55" y2="40" stroke="#ff0055" stroke-width="4" filter="url(#glow)"/>
  <line x1="75" y1="35" x2="65" y2="40" stroke="#ff0055" stroke-width="4" filter="url(#glow)"/>
  <!-- Chest Core -->
  <circle cx="60" cy="70" r="15" fill="#ff0055" filter="url(#heavyGlow)"/>
  <circle cx="60" cy="70" r="5" fill="#fff"/>
  <!-- Huge Shoulders -->
  <rect x="-10" y="30" width="30" height="50" rx="10" fill="#111" stroke="#ff0055" stroke-width="3"/>
  <rect x="100" y="30" width="30" height="50" rx="10" fill="#111" stroke="#ff0055" stroke-width="3"/>
`, 140, 120);

saveSvg('boss_attack.svg', `
  <path d="M 10 30 L 60 10 L 110 30 L 100 100 L 20 100 Z" fill="#2a0010" stroke="#ff0055" stroke-width="4"/>
  <line x1="30" y1="35" x2="90" y2="35" stroke="#ffffff" stroke-width="6" filter="url(#heavyGlow)"/>
  <circle cx="60" cy="70" r="15" fill="#ffffff" filter="url(#heavyGlow)"/>
  <!-- Devastating Blade Arc -->
  <path d="M -20 60 A 120 120 0 0 1 200 60" fill="none" stroke="#ff0055" stroke-width="15" filter="url(#heavyGlow)" stroke-linecap="round"/>
  <path d="M -20 60 A 120 120 0 0 1 200 60" fill="none" stroke="#ffffff" stroke-width="5" filter="url(#glow)" stroke-linecap="round"/>
`, 220, 120);


// === BACKGROUNDS ===

saveBgSvg('bg_city_far.svg', `
  <rect width="1280" height="720" fill="url(#bgFade)"/>
  <rect width="1280" height="720" fill="url(#grid)"/>
  
  <!-- Cyber Moon / Data Sun -->
  <circle cx="1000" cy="200" r="120" fill="#e94560" filter="url(#bgGlow)" opacity="0.6"/>
  <circle cx="1000" cy="200" r="100" fill="#ff0055" opacity="0.8"/>
  <rect x="800" y="180" width="400" height="10" fill="#151025"/>
  <rect x="850" y="220" width="300" height="15" fill="#151025"/>
  <rect x="820" y="260" width="350" height="8" fill="#151025"/>

  <!-- Stars / Data Particles -->
  <g fill="#00ffff" filter="url(#bgGlow)" opacity="0.7">
    <circle cx="100" cy="80" r="2"/><circle cx="250" cy="150" r="3"/>
    <circle cx="500" cy="100" r="2"/><circle cx="800" cy="60" r="1.5"/>
    <circle cx="1150" cy="80" r="4"/><circle cx="350" cy="250" r="2"/>
    <rect x="400" y="50" width="4" height="4" transform="rotate(45 402 52)"/>
    <rect x="700" y="120" width="6" height="6" transform="rotate(45 703 123)"/>
  </g>

  <!-- Distant Megastructures -->
  <path d="M 0 500 L 80 400 L 120 400 L 160 450 L 250 350 L 300 350 L 340 420 L 450 300 L 520 300 L 580 380 L 700 280 L 760 280 L 850 400 L 1000 320 L 1080 320 L 1150 420 L 1280 350 L 1280 720 L 0 720 Z" fill="#0c0715" stroke="#3a1b40" stroke-width="2"/>
`, 1280, 720);

saveBgSvg('bg_city_mid.svg', `
  <defs>
    <linearGradient id="bldg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#141428"/>
      <stop offset="100%" stop-color="#0a0a14"/>
    </linearGradient>
  </defs>
  
  <!-- Buildings -->
  <g fill="url(#bldg)" stroke="#00ffff" stroke-width="1.5">
    <rect x="50" y="280" width="140" height="440" />
    <polygon points="50,280 120,220 190,280" fill="url(#bldg)"/>
    <rect x="280" y="180" width="160" height="540" />
    <rect x="520" y="320" width="180" height="400" />
    <rect x="760" y="120" width="150" height="600" />
    <polygon points="760,120 835,60 910,120" fill="url(#bldg)"/>
    <rect x="1000" y="250" width="160" height="470" />
  </g>

  <!-- Intense Neon Accents -->
  <g filter="url(#bgGlow)">
    <!-- Bldg 1 Windows -->
    <rect x="70" y="320" width="20" height="40" fill="#00ffff" opacity="0.9"/>
    <rect x="110" y="320" width="20" height="40" fill="#00ffff" opacity="0.9"/>
    <rect x="150" y="320" width="20" height="40" fill="#00ffff" opacity="0.9"/>
    <rect x="70" y="380" width="20" height="40" fill="#ff0055" opacity="0.8"/>
    <!-- Bldg 2 Cyber Lines -->
    <line x1="280" y1="250" x2="440" y2="250" stroke="#f39c12" stroke-width="6"/>
    <rect x="320" y="280" width="15" height="150" fill="#ff0055" opacity="0.8"/>
    <rect x="360" y="280" width="15" height="150" fill="#ff0055" opacity="0.8"/>
    <rect x="400" y="280" width="15" height="150" fill="#ff0055" opacity="0.8"/>
    <!-- Bldg 4 Hologram Text -->
    <text x="800" y="200" font-family="Impact" font-size="60" fill="#00ffff" transform="rotate(90 800 200)">NINJA</text>
    <text x="860" y="200" font-family="Impact" font-size="60" fill="#ff0055" transform="rotate(90 860 200)">CYBER</text>
    <!-- Bldg 5 Grid -->
    <path d="M 1020 300 L 1140 300 M 1020 330 L 1140 330 M 1020 360 L 1140 360" stroke="#00ffcc" stroke-width="4"/>
  </g>
`, 1280, 720);

// Enhancing platform
saveBgSvg('platform.svg', `
  <defs>
    <linearGradient id="pGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1f1f2e"/>
      <stop offset="100%" stop-color="#0d0d16"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" fill="url(#pGrad)" stroke="#0f3460" stroke-width="2"/>
  <!-- Hexagon grid inside platform -->
  <path d="M 0 16 L 64 16 M 0 32 L 64 32 M 0 48 L 64 48" stroke="#111" stroke-width="2"/>
  <path d="M 16 0 L 16 64 M 32 0 L 32 64 M 48 0 L 48 64" stroke="#111" stroke-width="2"/>
  <!-- Neon Edge Glow -->
  <rect x="0" y="0" width="64" height="5" fill="#00ffff" filter="url(#bgGlow)"/>
  <rect x="0" y="0" width="64" height="2" fill="#ffffff"/>
  <!-- Rivets -->
  <circle cx="8" cy="10" r="2" fill="#00ffff" filter="url(#bgGlow)"/>
  <circle cx="56" cy="10" r="2" fill="#00ffff" filter="url(#bgGlow)"/>
`, 64, 64);


saveBgSvg('bg_forest_far.svg', `
  <rect width="1280" height="720" fill="#05150a"/>
  <rect width="1280" height="720" fill="url(#grid)"/>
  <g fill="#0a2a15" stroke="#0f4a25" stroke-width="2">
    <rect x="150" y="200" width="50" height="520" />
    <rect x="400" y="120" width="70" height="600" />
    <rect x="750" y="250" width="40" height="470" />
    <rect x="1050" y="100" width="90" height="620" />
  </g>
`, 1280, 720);

saveBgSvg('bg_forest_mid.svg', `
  <g fill="#0c3a1c" stroke="#00ff55" stroke-width="2">
    <rect x="200" y="100" width="80" height="620" />
    <rect x="600" y="50" width="100" height="670" />
    <rect x="900" y="150" width="70" height="570" />
    <!-- Angular Digital Leaves -->
    <polygon points="150,200 240,100 330,200 240,150" fill="#0f4a25"/>
    <polygon points="500,150 650,50 800,150 650,100" fill="#0f4a25"/>
    <polygon points="800,250 935,150 1070,250 935,200" fill="#0f4a25"/>
  </g>
  <g fill="#00ff55" filter="url(#bgGlow)">
    <rect x="235" y="300" width="10" height="80" rx="5"/>
    <rect x="640" y="250" width="20" height="120" rx="10"/>
    <circle cx="935" cy="400" r="15"/>
    <!-- Floating Data Spores -->
    <circle cx="300" cy="400" r="4"/><circle cx="500" cy="500" r="3"/>
    <circle cx="800" cy="300" r="5"/><circle cx="1100" cy="450" r="4"/>
  </g>
`, 1280, 720);

saveBgSvg('bg_core_far.svg', `
  <rect width="1280" height="720" fill="#150505"/>
  <rect width="1280" height="720" fill="url(#grid)" opacity="0.3"/>
  <circle cx="200" cy="400" r="350" fill="none" stroke="#2a0505" stroke-width="60" stroke-dasharray="80 30"/>
  <circle cx="1100" cy="200" r="300" fill="none" stroke="#2a0505" stroke-width="50" stroke-dasharray="60 30"/>
`, 1280, 720);

saveBgSvg('bg_core_mid.svg', `
  <!-- Pipes -->
  <g fill="#1a0005" stroke="#ff0055" stroke-width="4">
    <rect x="280" y="0" width="120" height="720" />
    <rect x="880" y="0" width="120" height="720" />
  </g>
  <!-- Main Core -->
  <circle cx="640" cy="360" r="220" fill="#1a0005" stroke="#ff0055" stroke-width="15"/>
  <circle cx="640" cy="360" r="180" fill="none" stroke="#ff9900" stroke-width="5" stroke-dasharray="20 10"/>
  <circle cx="640" cy="360" r="120" fill="#ff0055" filter="url(#heavyGlow)" opacity="0.5"/>
  <circle cx="640" cy="360" r="60" fill="#ffffff" filter="url(#heavyGlow)"/>
  
  <g fill="#ffffff" filter="url(#bgGlow)">
    <rect x="320" y="100" width="40" height="40" rx="20"/>
    <rect x="320" y="400" width="40" height="40" rx="20"/>
    <rect x="920" y="200" width="40" height="40" rx="20"/>
    <rect x="920" y="500" width="40" height="40" rx="20"/>
  </g>
`, 1280, 720);

console.log('Enhanced Cyber Ninja SVGs with neon & detailed aesthetic generated successfully!');

