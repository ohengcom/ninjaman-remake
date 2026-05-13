import fs from 'fs';
import path from 'path';

const outDir = path.join(process.cwd(), 'public', 'assets', 'sprites');
const bgDir = path.join(process.cwd(), 'public', 'assets', 'backgrounds');

[outDir, bgDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function saveSvg(filename, content, width, height) {
  const fullContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <filter id="heavyGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#2a2a35"/>
        <stop offset="50%" stop-color="#1a1a2e"/>
        <stop offset="100%" stop-color="#0f0f1a"/>
      </linearGradient>
      <linearGradient id="blade" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#00ffff"/>
      </linearGradient>
    </defs>
    ${content}
  </svg>`;
  fs.writeFileSync(path.join(outDir, filename), fullContent);
}

function saveBgSvg(filename, content, width, height) {
  const fullContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    ${content}
  </svg>`;
  fs.writeFileSync(path.join(bgDir, filename), fullContent);
}

// Modern Cyber Ninja (Player) - Idle (Detailed)
saveSvg('player_idle.svg', `
  <!-- Scarf Back -->
  <path d="M 35 25 Q 20 40 10 55 Q 20 45 30 30" fill="#e94560" opacity="0.7"/>
  <!-- Body Armor -->
  <rect x="25" y="22" width="30" height="36" rx="6" fill="url(#metal)" stroke="#3a3a50" stroke-width="2"/>
  <path d="M 25 35 L 55 35 M 25 45 L 55 45" stroke="#0f3460" stroke-width="2"/>
  <polygon points="35,22 45,22 40,30" fill="#e94560"/>
  <!-- Arms/Shoulders -->
  <circle cx="25" cy="26" r="6" fill="#0f3460" stroke="#e94560" stroke-width="1"/>
  <rect x="20" y="26" width="10" height="20" rx="3" fill="url(#metal)"/>
  <circle cx="55" cy="26" r="6" fill="#0f3460" stroke="#e94560" stroke-width="1"/>
  <!-- Head/Helmet -->
  <path d="M 28 15 Q 40 0 52 15 Q 40 25 28 15" fill="#1a1a2e" stroke="#3a3a50" stroke-width="2"/>
  <!-- Cyber Visor -->
  <path d="M 36 10 L 48 10 L 46 16 L 38 16 Z" fill="#00ffff" filter="url(#glow)"/>
  <!-- Scarf Front -->
  <path d="M 25 20 Q 40 25 55 20 L 50 28 Q 40 32 30 28 Z" fill="#e94560"/>
  <!-- Katana Sheathed -->
  <rect x="15" y="20" width="4" height="40" rx="2" fill="#111" transform="rotate(-30 15 20)"/>
`, 80, 80);

// Player - Run
saveSvg('player_run.svg', `
  <g transform="rotate(15 40 40) translate(0, 5)">
    <!-- Scarf blowing far back -->
    <path d="M 35 20 Q 0 25 -10 35 Q 5 28 25 25" fill="#e94560" opacity="0.9"/>
    <!-- Body Armor -->
    <rect x="25" y="22" width="30" height="36" rx="6" fill="url(#metal)" stroke="#3a3a50" stroke-width="2"/>
    <polygon points="35,22 45,22 40,30" fill="#e94560"/>
    <!-- Head/Helmet -->
    <path d="M 28 15 Q 40 0 52 15 Q 40 25 28 15" fill="#1a1a2e" stroke="#3a3a50" stroke-width="2"/>
    <!-- Cyber Visor -->
    <path d="M 38 10 L 50 10 L 48 16 L 40 16 Z" fill="#00ffff" filter="url(#glow)"/>
    <!-- Arms running pose -->
    <rect x="20" y="26" width="25" height="8" rx="3" fill="url(#metal)" transform="rotate(-45 20 26)"/>
    <!-- Scarf Front -->
    <path d="M 25 20 Q 40 25 55 20 L 50 28 Q 40 32 30 28 Z" fill="#e94560"/>
  </g>
`, 80, 80);

// Player - Jump
saveSvg('player_jump.svg', `
  <g transform="translate(0, -5)">
    <!-- Scarf trailing down -->
    <path d="M 35 25 Q 30 50 40 65 Q 45 45 45 25" fill="#e94560" opacity="0.8"/>
    <!-- Body Armor -->
    <rect x="25" y="20" width="30" height="30" rx="6" fill="url(#metal)" stroke="#3a3a50" stroke-width="2"/>
    <!-- Legs tucked up -->
    <path d="M 30 50 L 25 60 M 50 50 L 45 60" stroke="#0f3460" stroke-width="6" stroke-linecap="round"/>
    <path d="M 30 50 L 25 60 M 50 50 L 45 60" stroke="#e94560" stroke-width="2" stroke-linecap="round"/>
    <!-- Head/Helmet -->
    <path d="M 28 12 Q 40 -3 52 12 Q 40 22 28 12" fill="#1a1a2e" stroke="#3a3a50" stroke-width="2"/>
    <path d="M 36 7 L 48 7 L 46 13 L 38 13 Z" fill="#00ffff" filter="url(#glow)"/>
    <!-- Scarf Front -->
    <path d="M 25 17 Q 40 22 55 17 L 50 25 Q 40 29 30 25 Z" fill="#e94560"/>
  </g>
`, 80, 80);

// Player - Attack (Cyber Katana Swipe)
saveSvg('player_attack.svg', `
  <!-- Motion blur trail -->
  <path d="M 30 20 A 60 60 0 0 1 110 50 L 100 55 A 50 50 0 0 0 30 30 Z" fill="#00ffff" filter="url(#glow)" opacity="0.6"/>
  <!-- Body -->
  <rect x="25" y="22" width="30" height="36" rx="6" fill="url(#metal)" stroke="#3a3a50" stroke-width="2"/>
  <!-- Head -->
  <path d="M 28 15 Q 40 0 52 15 Q 40 25 28 15" fill="#1a1a2e" stroke="#3a3a50" stroke-width="2"/>
  <path d="M 38 10 L 50 10 L 48 16 L 40 16 Z" fill="#00ffff" filter="url(#heavyGlow)"/>
  <!-- Arm holding sword -->
  <rect x="40" y="26" width="35" height="8" rx="4" fill="url(#metal)" transform="rotate(20 40 26)"/>
  <!-- The glowing Katana -->
  <path d="M 70 36 L 115 52 L 113 55 L 68 39 Z" fill="url(#blade)" filter="url(#heavyGlow)"/>
  <rect x="65" y="32" width="6" height="12" fill="#111" transform="rotate(20 68 38)"/>
`, 120, 80);

// Enemy - Guard (Detailed Cyborg)
saveSvg('enemy_guard.svg', `
  <!-- Heavy cybernetic body -->
  <rect x="20" y="25" width="40" height="35" rx="4" fill="#15202b" stroke="#f39c12" stroke-width="2"/>
  <path d="M 25 35 L 55 35 M 25 45 L 55 45" stroke="#333" stroke-width="2"/>
  <!-- Robotic Head -->
  <rect x="30" y="10" width="20" height="15" rx="3" fill="#15202b" stroke="#f39c12" stroke-width="1"/>
  <!-- Red glowing eye -->
  <circle cx="45" cy="17" r="3" fill="#ff0000" filter="url(#glow)"/>
  <line x1="30" y1="17" x2="40" y2="17" stroke="#ff0000" stroke-width="1" filter="url(#glow)"/>
  <!-- Energy Shield or baton -->
  <rect x="55" y="25" width="6" height="30" rx="3" fill="#f39c12" filter="url(#glow)"/>
`, 80, 80);

// Background - Cyber City Layer 1 (Far - Detailed with moon/stars)
saveBgSvg('bg_city_far.svg', `
  <defs>
    <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="40%" stop-color="#e94560" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#0f0c29" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0a0510"/>
      <stop offset="50%" stop-color="#1b1130"/>
      <stop offset="100%" stop-color="#2a1b40"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#skyGrad)"/>
  
  <!-- Stars -->
  <g fill="#fff" opacity="0.6">
    <circle cx="100" cy="50" r="1.5"/><circle cx="250" cy="120" r="1"/>
    <circle cx="500" cy="80" r="2"/><circle cx="800" cy="40" r="1.5"/>
    <circle cx="1100" cy="150" r="2"/><circle cx="1200" cy="60" r="1"/>
    <circle cx="350" cy="200" r="1"/><circle cx="650" cy="180" r="1.5"/>
  </g>

  <!-- Cyber Moon -->
  <circle cx="900" cy="150" r="100" fill="url(#moonGlow)"/>
  
  <!-- Distant Silhouette -->
  <path d="M 0 500 L 80 420 L 100 420 L 150 480 L 250 380 L 280 380 L 320 450 L 450 350 L 500 350 L 550 420 L 700 320 L 750 320 L 850 450 L 1000 380 L 1050 380 L 1150 480 L 1280 400 L 1280 720 L 0 720 Z" fill="#0f111a" opacity="0.8"/>
`, 1280, 720);

// Background - Cyber City Layer 2 (Mid - Detailed Buildings)
saveBgSvg('bg_city_mid.svg', `
  <defs>
    <linearGradient id="bldgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1c1c2d"/>
      <stop offset="100%" stop-color="#0a0a14"/>
    </linearGradient>
    <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Buildings -->
  <g fill="url(#bldgGrad)" stroke="#3a2e5d" stroke-width="2">
    <rect x="80" y="320" width="100" height="400" />
    <polygon points="80,320 130,280 180,320" fill="url(#bldgGrad)"/>
    
    <rect x="250" y="220" width="140" height="500" />
    <rect x="280" y="180" width="80" height="40" />
    <line x1="320" y1="180" x2="320" y2="120" stroke="#e94560" stroke-width="2"/>

    <rect x="480" y="380" width="120" height="340" />

    <rect x="680" y="150" width="180" height="570" />
    <polygon points="680,150 770,100 860,150" fill="url(#bldgGrad)"/>

    <rect x="950" y="280" width="120" height="440" />
    <rect x="1150" y="350" width="100" height="370" />
  </g>

  <!-- Detailed Neon Windows & Accents -->
  <g filter="url(#neonGlow)">
    <!-- Bldg 1 -->
    <rect x="100" y="350" width="15" height="30" fill="#00ffff" opacity="0.8"/>
    <rect x="140" y="350" width="15" height="30" fill="#00ffff" opacity="0.8"/>
    <rect x="100" y="400" width="15" height="30" fill="#e94560" opacity="0.6"/>
    <!-- Bldg 2 -->
    <line x1="250" y1="300" x2="390" y2="300" stroke="#00ffff" stroke-width="4"/>
    <rect x="270" y="320" width="10" height="80" fill="#e94560" opacity="0.7"/>
    <rect x="300" y="320" width="10" height="80" fill="#e94560" opacity="0.7"/>
    <rect x="330" y="320" width="10" height="80" fill="#e94560" opacity="0.7"/>
    <!-- Bldg 4 (Tall) -->
    <text x="730" y="250" font-family="Arial" font-size="40" font-weight="bold" fill="#00ffff" transform="rotate(90 730 250)">CYBER</text>
    <!-- Bldg 5 -->
    <line x1="950" y1="350" x2="1070" y2="350" stroke="#f39c12" stroke-width="4"/>
    <rect x="980" y="380" width="60" height="20" fill="#f39c12" opacity="0.8"/>
    <rect x="980" y="420" width="60" height="20" fill="#f39c12" opacity="0.8"/>
  </g>
`, 1280, 720);

// Platform Tile (More industrial/cyber)
saveBgSvg('platform.svg', `
  <defs>
    <linearGradient id="platGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2a2a3a"/>
      <stop offset="100%" stop-color="#151520"/>
    </linearGradient>
    <filter id="platGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <!-- Main block -->
  <rect width="64" height="64" fill="url(#platGrad)" stroke="#0f3460" stroke-width="2"/>
  <!-- Industrial grating pattern -->
  <line x1="0" y1="16" x2="64" y2="16" stroke="#111" stroke-width="2"/>
  <line x1="0" y1="32" x2="64" y2="32" stroke="#111" stroke-width="2"/>
  <line x1="0" y1="48" x2="64" y2="48" stroke="#111" stroke-width="2"/>
  <!-- Neon Edge -->
  <rect x="0" y="0" width="64" height="6" fill="#00ffff" filter="url(#platGlow)" opacity="0.9"/>
  <!-- Rivets -->
  <circle cx="8" cy="12" r="2" fill="#555"/>
  <circle cx="56" cy="12" r="2" fill="#555"/>
`, 64, 64);

// Boss - Cyber Shogun (Huge and detailed)
saveSvg('boss_idle.svg', `
  <rect x="10" y="10" width="100" height="90" rx="10" fill="#0b0c10" stroke="#ff0055" stroke-width="4"/>
  <!-- Horns -->
  <polygon points="60,10 40,-10 50,10" fill="#ff0055"/>
  <polygon points="60,10 80,-10 70,10" fill="#ff0055"/>
  <!-- Face -->
  <path d="M 40 20 L 80 20 L 70 40 L 50 40 Z" fill="#1a1a2e" stroke="#ff0055" stroke-width="2"/>
  <circle cx="50" cy="30" r="5" fill="#ff0055" filter="url(#glow)"/>
  <circle cx="70" cy="30" r="5" fill="#ff0055" filter="url(#glow)"/>
  <!-- Heavy Armor Core -->
  <circle cx="60" cy="60" r="15" fill="#1a1a2e" stroke="#ff0055" stroke-width="3"/>
  <circle cx="60" cy="60" r="8" fill="#ff0055" filter="url(#heavyGlow)"/>
  <!-- Arms -->
  <rect x="0" y="30" width="30" height="60" rx="5" fill="#151520" stroke="#ff0055" stroke-width="2"/>
  <rect x="90" y="30" width="30" height="60" rx="5" fill="#151520" stroke="#ff0055" stroke-width="2"/>
`, 120, 120);

saveSvg('boss_attack.svg', `
  <rect x="10" y="10" width="100" height="90" rx="10" fill="#2a0010" stroke="#ff0055" stroke-width="4"/>
  <!-- Eye Flare -->
  <path d="M 30 30 L 120 30 L 120 35 L 30 35 Z" fill="#ff0055" filter="url(#heavyGlow)"/>
  <circle cx="60" cy="60" r="15" fill="#1a1a2e" stroke="#ff0055" stroke-width="3"/>
  <circle cx="60" cy="60" r="8" fill="#ffffff" filter="url(#heavyGlow)"/>
  <!-- Giant energy blade slash -->
  <path d="M 0 50 A 100 100 0 0 1 180 50" fill="none" stroke="#ff0055" stroke-width="12" filter="url(#heavyGlow)" stroke-linecap="round"/>
  <path d="M 0 50 A 100 100 0 0 1 180 50" fill="none" stroke="#ffffff" stroke-width="4" filter="url(#glow)" stroke-linecap="round"/>
`, 200, 120);

// Level 2 - Cyber Forest
saveBgSvg('bg_forest_far.svg', `
  <linearGradient id="forestSky" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#0a1a10"/>
    <stop offset="100%" stop-color="#113320"/>
  </linearGradient>
  <rect width="1280" height="720" fill="url(#forestSky)"/>
  <!-- Tech Trees Far -->
  <g fill="#0a2215" opacity="0.8">
    <rect x="100" y="200" width="40" height="520" />
    <rect x="350" y="150" width="60" height="570" />
    <rect x="700" y="250" width="30" height="470" />
    <rect x="1000" y="100" width="80" height="620" />
  </g>
`, 1280, 720);

saveBgSvg('bg_forest_mid.svg', `
  <g fill="#113320" stroke="#00ff55" stroke-width="1" opacity="0.9">
    <!-- Trunks -->
    <rect x="200" y="100" width="80" height="620" />
    <rect x="550" y="50" width="100" height="670" />
    <rect x="850" y="150" width="60" height="570" />
    <!-- Tech Leaves / Branches -->
    <polygon points="150,200 240,100 330,200" fill="#0f4a25"/>
    <polygon points="450,150 600,50 750,150" fill="#0f4a25"/>
    <polygon points="780,250 880,150 980,250" fill="#0f4a25"/>
  </g>
  <g fill="#00ff55" opacity="0.6">
    <rect x="230" y="300" width="10" height="50" />
    <rect x="590" y="250" width="20" height="80" />
    <circle cx="880" cy="400" r="10" filter="url(#glow)"/>
  </g>
`, 1280, 720);

// Level 3 - Reactor Core (Boss Room)
saveBgSvg('bg_core_far.svg', `
  <linearGradient id="coreSky" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#1a0505"/>
    <stop offset="100%" stop-color="#330a10"/>
  </linearGradient>
  <rect width="1280" height="720" fill="url(#coreSky)"/>
  <!-- Giant gears/machinery -->
  <circle cx="200" cy="400" r="300" fill="none" stroke="#220a10" stroke-width="40" stroke-dasharray="50 20"/>
  <circle cx="1080" cy="200" r="250" fill="none" stroke="#220a10" stroke-width="30" stroke-dasharray="40 20"/>
`, 1280, 720);

saveBgSvg('bg_core_mid.svg', `
  <!-- Power conduits -->
  <g fill="#2a0010" stroke="#ff0055" stroke-width="2">
    <rect x="300" y="0" width="100" height="720" />
    <rect x="880" y="0" width="100" height="720" />
  </g>
  <!-- Reactor Energy Core in background -->
  <circle cx="640" cy="360" r="200" fill="#1a0005" stroke="#ff0055" stroke-width="10"/>
  <circle cx="640" cy="360" r="150" fill="#ff0055" opacity="0.3" filter="url(#heavyGlow)"/>
  <circle cx="640" cy="360" r="50" fill="#ffffff" filter="url(#heavyGlow)"/>
  <!-- Pulses -->
  <g fill="#ff0055">
    <rect x="330" y="100" width="40" height="20" filter="url(#glow)"/>
    <rect x="330" y="400" width="40" height="20" filter="url(#glow)"/>
    <rect x="910" y="200" width="40" height="20" filter="url(#glow)"/>
    <rect x="910" y="500" width="40" height="20" filter="url(#glow)"/>
  </g>
`, 1280, 720);

// Player - Dash / Roll
saveSvg('player_dash.svg', `
  <g transform="translate(0, 15) rotate(90 40 40)">
    <!-- Motion blur trail -->
    <path d="M 40 0 L 40 -40" stroke="#00ffff" stroke-width="15" opacity="0.4" filter="url(#glow)"/>
    <rect x="25" y="20" width="30" height="30" rx="15" fill="url(#metal)" stroke="#00ffff" stroke-width="2"/>
    <circle cx="40" cy="35" r="10" fill="#1a1a2e" stroke="#e94560" stroke-width="2"/>
  </g>
`, 80, 80);

// Player - Defend / Block
saveSvg('player_defend.svg', `
  <!-- Scarf Back -->
  <path d="M 35 25 Q 20 40 10 55 Q 20 45 30 30" fill="#e94560" opacity="0.7"/>
  <!-- Body Armor -->
  <rect x="25" y="22" width="30" height="36" rx="6" fill="url(#metal)" stroke="#3a3a50" stroke-width="2"/>
  <!-- Head/Helmet tucked -->
  <path d="M 30 18 Q 40 3 50 18 Q 40 28 30 18" fill="#1a1a2e" stroke="#3a3a50" stroke-width="2"/>
  <!-- Sword blocking -->
  <rect x="45" y="10" width="6" height="50" fill="url(#blade)" filter="url(#heavyGlow)"/>
  <!-- Shield Energy Flare -->
  <circle cx="50" cy="35" r="25" fill="none" stroke="#00ffff" stroke-width="4" filter="url(#glow)" opacity="0.8"/>
`, 80, 80);

// Player - Uppercut
saveSvg('player_uppercut.svg', `
  <!-- Motion blur trail upwards -->
  <path d="M 40 70 A 50 50 0 0 1 70 10" fill="none" stroke="#00ffff" stroke-width="8" filter="url(#heavyGlow)" opacity="0.8"/>
  <rect x="25" y="22" width="30" height="36" rx="6" fill="url(#metal)" stroke="#3a3a50" stroke-width="2"/>
  <path d="M 28 15 Q 40 0 52 15 Q 40 25 28 15" fill="#1a1a2e" stroke="#3a3a50" stroke-width="2"/>
  <path d="M 38 10 L 50 10 L 48 16 L 40 16 Z" fill="#00ffff" filter="url(#heavyGlow)"/>
  <!-- Katana pointing up -->
  <path d="M 60 40 L 75 0 L 80 0 L 65 40 Z" fill="url(#blade)" filter="url(#heavyGlow)"/>
`, 100, 100);

// Player - Dive Attack
saveSvg('player_dive.svg', `
  <g transform="translate(0, 10) rotate(45 50 50)">
    <!-- Downward blur -->
    <path d="M 80 50 L 120 50" stroke="#ff0055" stroke-width="20" opacity="0.5" filter="url(#heavyGlow)"/>
    <rect x="25" y="22" width="30" height="36" rx="6" fill="url(#metal)"/>
    <path d="M 28 15 Q 40 0 52 15 Q 40 25 28 15" fill="#1a1a2e"/>
    <path d="M 50 40 L 100 40 L 100 45 L 50 45 Z" fill="url(#blade)" filter="url(#heavyGlow)"/>
  </g>
`, 100, 100);

// Enemy - Axe Brute (Slow, High HP/Damage)
saveSvg('enemy_axe.svg', `
  <rect x="15" y="20" width="50" height="50" rx="8" fill="#301515" stroke="#ff4444" stroke-width="3"/>
  <circle cx="40" cy="15" r="10" fill="#301515" stroke="#ff4444" stroke-width="2"/>
  <circle cx="45" cy="15" r="3" fill="#ff0000" filter="url(#glow)"/>
  <!-- Giant Axe -->
  <rect x="65" y="10" width="8" height="60" fill="#222"/>
  <path d="M 65 20 Q 90 10 90 30 Q 90 50 65 40 Z" fill="#ff4444" filter="url(#glow)"/>
`, 100, 80);

// Enemy - Ninja (Fast, Low HP)
saveSvg('enemy_ninja.svg', `
  <rect x="30" y="25" width="20" height="30" rx="4" fill="#102030" stroke="#00ffcc" stroke-width="1"/>
  <circle cx="40" cy="15" r="8" fill="#102030" stroke="#00ffcc" stroke-width="1"/>
  <line x1="35" y1="15" x2="45" y2="15" stroke="#00ffcc" stroke-width="2" filter="url(#glow)"/>
  <!-- Twin Daggers -->
  <path d="M 20 40 L 0 50 L 5 45 Z" fill="#00ffcc" filter="url(#glow)"/>
  <path d="M 60 40 L 80 50 L 75 45 Z" fill="#00ffcc" filter="url(#glow)"/>
`, 80, 80);

console.log('Detailed Modern Vector SVGs generated successfully!');
