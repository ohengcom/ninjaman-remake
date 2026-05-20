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
      <!-- Premium Oriental Cyber-Zen Filters -->
      <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="heavyGoldGlow" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="7" result="blur1" />
        <feGaussianBlur stdDeviation="2.5" result="blur2" />
        <feMerge>
          <feMergeNode in="blur1" />
          <feMergeNode in="blur2" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="sakuraGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="inkMisty" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="1.8" />
      </filter>
      <filter id="redGlow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="3.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <!-- Advanced Cyber-Zen Gradients -->
      <linearGradient id="inkWashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#313244"/>
        <stop offset="60%" stop-color="#11111b"/>
        <stop offset="100%" stop-color="#11111b"/>
      </linearGradient>
      <linearGradient id="inkWashLight" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6c7086"/>
        <stop offset="50%" stop-color="#45475a"/>
        <stop offset="100%" stop-color="#1e1e2e"/>
      </linearGradient>
      <linearGradient id="spiritGold" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#cdd6f4"/>
        <stop offset="35%" stop-color="#f9e2af"/>
        <stop offset="75%" stop-color="#fab387"/>
        <stop offset="100%" stop-color="#fab387"/>
      </linearGradient>
      <linearGradient id="sacredMaple" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f38ba8"/>
        <stop offset="50%" stop-color="#fab387"/>
        <stop offset="100%" stop-color="#eba0ac"/>
      </linearGradient>
      <linearGradient id="sakuraBlade" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#cdd6f4"/>
        <stop offset="40%" stop-color="#f2cdcd"/>
        <stop offset="85%" stop-color="#f5c2e7"/>
        <stop offset="100%" stop-color="#cba6f7"/>
      </linearGradient>
      <linearGradient id="crimsonGaze" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f38ba8"/>
        <stop offset="60%" stop-color="#eba0ac"/>
        <stop offset="100%" stop-color="#1e1e2e"/>
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
        <feGaussianBlur stdDeviation="5.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="inkMistyBg" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="8" />
      </filter>
      <!-- Traditional parchment rice-paper background pattern -->
      <linearGradient id="parchmentFade" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fdfbf7"/>
        <stop offset="40%" stop-color="#f5efe0"/>
        <stop offset="85%" stop-color="#ede3cd"/>
        <stop offset="100%" stop-color="#dfd2b5"/>
      </linearGradient>
      <linearGradient id="inkMistyFade" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ede3cd"/>
        <stop offset="50%" stop-color="#ccc1aa"/>
        <stop offset="100%" stop-color="#a69b85"/>
      </linearGradient>
    </defs>
    ${content}
  </svg>`;
  fs.writeFileSync(path.join(bgDir, filename), fullContent);
}

// ==========================================
// 1. PLAYER SPRITES (Wandering Cyber-Ronin)
// ==========================================

// Player - Idle (Intricate circular straw hat, flowing haori, V-shaped golden eye)
saveSvg('player_idle.svg', `
  <!-- Flowing Crimson Haori/Cape (Traditional calligraphic brush stroke lines) -->
  <path d="M 36 28 C 22 42 8 62 -2 74 C 10 58 24 42 34 32" fill="url(#sacredMaple)" opacity="0.85" filter="url(#sakuraGlow)"/>
  <path d="M 36 28 C 26 48 12 70 2 82 C 18 64 28 46 34 32" fill="url(#sacredMaple)" opacity="0.95"/>
  <path d="M 36 28 C 18 36 6 52 -4 64 C 8 50 22 36 34 32" fill="#cba6f7" opacity="0.7"/>

  <!-- Back Sheathed Sacred Katana with golden tassels -->
  <path d="M 28 32 L 8 10 L 12 6 L 32 28 Z" fill="#1e1e2e" stroke="#fab387" stroke-width="1.8"/>
  <path d="M 5 3 L 8 6 L 3 11" fill="none" stroke="#fab387" stroke-width="1.5" filter="url(#goldGlow)"/>
  <circle cx="8" cy="6" r="3" fill="#cdd6f4"/>

  <!-- Segmented Cyber-Samurai Chestpiece & Underlayer -->
  <path d="M 26 24 L 54 24 L 46 54 L 34 54 Z" fill="url(#inkWashGrad)" stroke="#fab387" stroke-width="1.5"/>
  <!-- Calligraphy golden rib-stripes -->
  <path d="M 32 38 L 48 38 M 33 44 L 47 44" stroke="#fab387" stroke-width="1.5" opacity="0.8"/>
  <!-- Central Glowing Spiritual Core (Circular golden Zen Enso) -->
  <circle cx="40" cy="35" r="7.5" fill="none" stroke="#fab387" stroke-width="2.5" filter="url(#heavyGoldGlow)"/>
  <circle cx="40" cy="35" r="3.5" fill="#cdd6f4"/>

  <!-- Dark wood-sandals legs -->
  <path d="M 32 54 L 28 68 L 22 68 L 26 54 Z" fill="url(#inkWashLight)"/>
  <path d="M 48 54 L 52 68 L 58 68 L 54 54 Z" fill="url(#inkWashLight)"/>
  <circle cx="28" cy="62" r="3" fill="#fab387" filter="url(#goldGlow)"/>
  <circle cx="52" cy="62" r="3" fill="#fab387" filter="url(#goldGlow)"/>

  <!-- Cyber-Zen Ronin Head with Circular Woven Straw Hat (斗笠) -->
  <!-- Straw hat structure (angled calligraphic curves) -->
  <ellipse cx="40" cy="18" rx="26" ry="7" fill="url(#inkWashLight)" stroke="#fab387" stroke-width="2"/>
  <path d="M 14 18 C 14 6 66 6 66 18 Z" fill="url(#inkWashGrad)" stroke="#fab387" stroke-width="1.5"/>
  <line x1="40" y1="6" x2="40" y2="24" stroke="#fab387" stroke-width="1"/>
  <line x1="20" y1="14" x2="60" y2="14" stroke="#fab387" stroke-width="0.8"/>

  <!-- V-shaped Glowing Golden Eyepiece beneath the hat shadow -->
  <path d="M 32 20 L 40 25 L 48 20" fill="none" stroke="#fab387" stroke-width="2.5" filter="url(#heavyGoldGlow)"/>
  <polygon points="38,20 40,23 42,20" fill="#cdd6f4"/>
`, 80, 80);

// Player - Run (Aggressive sprint lean, circular hat tilted, maple leaf winds)
saveSvg('player_run.svg', `
  <g transform="rotate(18 40 40) translate(2, 2)">
    <!-- Haori blowing backwards in calligraphy shapes -->
    <path d="M 34 26 C 8 34 -12 44 -28 50 C -14 32 8 24 28 22" fill="url(#sacredMaple)" filter="url(#sakuraGlow)"/>
    <path d="M 34 26 C 0 24 -18 30 -32 34 C -20 20 6 18 26 20" fill="#cba6f7" opacity="0.6"/>

    <!-- Sacred Sheathed Katana horizontal -->
    <path d="M 26 30 L -2 22 L 2 18 L 30 26 Z" fill="#1e1e2e" stroke="#fab387" stroke-width="1.5"/>

    <!-- Sprinting mechanical body -->
    <path d="M 26 22 L 54 22 L 46 52 L 28 52 Z" fill="url(#inkWashGrad)" stroke="#fab387" stroke-width="1.5"/>
    <circle cx="40" cy="33" r="6" fill="#fab387" filter="url(#goldGlow)"/>
    
    <!-- Arm swinging -->
    <path d="M 22 24 L 8 36 L 12 42 L 26 30 Z" fill="url(#inkWashLight)"/>
    <circle cx="10" cy="39" r="3.5" fill="#fab387" filter="url(#goldGlow)"/>

    <!-- Straw Hat tilted forward -->
    <ellipse cx="40" cy="14" rx="26" ry="7" fill="url(#inkWashLight)" stroke="#fab387" stroke-width="2"/>
    <path d="M 14 14 C 14 2 66 2 66 14 Z" fill="url(#inkWashGrad)" stroke="#fab387" stroke-width="1.5"/>
    <path d="M 32 16 L 40 21 L 48 16" fill="none" stroke="#fab387" stroke-width="2.5" filter="url(#heavyGoldGlow)"/>
  </g>
`, 80, 80);

// Player - Jump (Tucked spin, trailing long calligraphic vertical ink bands)
saveSvg('player_jump.svg', `
  <!-- Vertical calligraphic ink splatter trail -->
  <path d="M 40 18 C 34 46 28 70 20 96 C 42 72 46 46 42 18" fill="url(#inkWashGrad)" filter="url(#inkMisty)"/>
  <path d="M 40 22 C 37 40 34 58 31 76 C 43 58 44 40 41 22" fill="url(#sacredMaple)" opacity="0.6"/>

  <g transform="translate(0, -6)">
    <!-- Tucked cyber-shrine shell -->
    <path d="M 26 18 L 54 18 L 44 48 L 30 48 Z" fill="url(#inkWashGrad)" stroke="#fab387" stroke-width="1.5"/>
    <circle cx="40" cy="28" r="6" fill="#fab387" filter="url(#goldGlow)"/>
    
    <!-- Tucked legs in red silk loops -->
    <path d="M 30 48 C 18 62 14 74 12 82" stroke="#cba6f7" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M 44 48 C 56 62 60 74 62 82" stroke="#fab387" stroke-width="4.5" stroke-linecap="round" filter="url(#goldGlow)"/>
    
    <!-- Head tucked down inside the round straw hat -->
    <ellipse cx="40" cy="12" rx="22" ry="6" fill="url(#inkWashLight)" stroke="#fab387" stroke-width="1.5"/>
    <path d="M 18 12 Q 40 -4 62 12 Z" fill="url(#inkWashGrad)" stroke="#fab387" stroke-width="1.2"/>
  </g>
`, 80, 80);

// Player - Dash (Transformed into a hyper-speed calligraphy golden windstorm)
saveSvg('player_dash.svg', `
  <g transform="translate(0, 10) rotate(90 40 40)">
    <!-- Calligraphy brush speed traces -->
    <path d="M 10 20 C 25 -8 55 -8 70 20" fill="none" stroke="#fab387" stroke-width="2.5" filter="url(#goldGlow)" opacity="0.75"/>
    <path d="M 5 25 C 25 -18 55 -18 75 25" fill="none" stroke="#cba6f7" stroke-width="3" opacity="0.8"/>
    
    <!-- Floating gold cherry petals -->
    <circle cx="20" cy="4" r="3.5" fill="#fab387" filter="url(#goldGlow)"/>
    <circle cx="60" cy="4" r="4.5" fill="#f5c2e7" filter="url(#sakuraGlow)"/>
    <circle cx="40" cy="-12" r="3" fill="#cdd6f4"/>

    <!-- Spiritual Golden Windstorm Shell -->
    <path d="M 40 0 C 65 22 70 68 40 88 C 10 68 15 22 40 0 Z" fill="url(#spiritGold)" stroke="#cdd6f4" stroke-width="2" filter="url(#heavyGoldGlow)"/>
    
    <!-- Yin-Yang core swirling inside -->
    <circle cx="40" cy="44" r="15" fill="#1e1e2e" stroke="#fab387" stroke-width="1.5"/>
    <path d="M 40 29 A 7.5 7.5 0 0 0 40 44 A 7.5 7.5 0 0 1 40 59 A 15 15 0 0 0 40 29 Z" fill="#fab387"/>
    <circle cx="40" cy="36.5" r="2.5" fill="#1e1e2e"/>
    <circle cx="40" cy="51.5" r="2.5" fill="#cdd6f4"/>
  </g>
`, 80, 80);

// Player - Defend (Spectacular holographic golden Bagua shield)
saveSvg('player_defend.svg', `
  <!-- Solid defensive posture -->
  <path d="M 22 25 L 50 25 L 44 55 L 26 55 Z" fill="url(#inkWashGrad)" stroke="#fab387" stroke-width="1.8"/>
  <ellipse cx="36" cy="18" rx="22" ry="6" fill="url(#inkWashLight)" stroke="#fab387" stroke-width="1.5"/>
  <path d="M 14 18 Q 36 2 58 18 Z" fill="url(#inkWashGrad)"/>

  <!-- Calligraphy Katana Blocking Position -->
  <path d="M 42 12 L 48 8 L 48 58 L 42 58 Z" fill="url(#spiritGold)" filter="url(#goldGlow)"/>

  <!-- High-Fidelity Calligraphy Bagua Shield Matrix -->
  <!-- Outer glowing zen circle (Enso shape) -->
  <circle cx="50" cy="36" r="32" fill="none" stroke="#fab387" stroke-width="4.5" stroke-dasharray="160 40" filter="url(#heavyGoldGlow)" opacity="0.95"/>
  
  <!-- Inner Bagua symbols -->
  <circle cx="50" cy="36" r="22" fill="rgba(229, 193, 88, 0.08)" stroke="#fab387" stroke-width="1.5" stroke-dasharray="6 3"/>
  <path d="M 50 22 C 40 22 40 36 50 36 C 60 36 60 50 50 50" fill="none" stroke="#fab387" stroke-width="2"/>
  
  <!-- Digital brush details inside shield -->
  <circle cx="50" cy="29" r="2" fill="#fab387"/>
  <circle cx="50" cy="43" r="2" fill="#cdd6f4"/>
  
  <!-- Impact spark beads -->
  <circle cx="72" cy="18" r="4.5" fill="#cdd6f4" filter="url(#goldGlow)"/>
  <circle cx="28" cy="48" r="4" fill="#fab387" filter="url(#goldGlow)"/>
`, 80, 80);

// Player - Attack (Calligraphy ink sweep + pink sakura edge blade)
saveSvg('player_attack.svg', `
  <!-- Spectacular massive calligraphy ink-black crescent sweep with pink glowing wing -->
  <path d="M 12 10 A 75 75 0 0 1 122 45 L 105 58 A 52 52 0 0 0 25 32 Z" fill="url(#inkWashGrad)" filter="url(#inkMisty)" opacity="0.95"/>
  <path d="M 18 14 A 72 72 0 0 1 116 43 L 108 49 A 58 58 0 0 0 28 28 Z" fill="url(#sakuraBlade)" filter="url(#sakuraGlow)" opacity="0.85"/>
  <path d="M 24 18 A 66 66 0 0 1 110 41 L 105 45 A 61 61 0 0 0 32 30 Z" fill="#cdd6f4" opacity="0.95"/>

  <g transform="translate(10, 0)">
    <!-- Ronin Attacking Body -->
    <path d="M 18 24 L 46 24 L 40 54 L 22 54 Z" fill="url(#inkWashGrad)" stroke="#fab387" stroke-width="1.5"/>
    <ellipse cx="32" cy="16" rx="20" ry="5" fill="url(#inkWashLight)" stroke="#fab387" stroke-width="1.2"/>
    <path d="M 12 16 Q 32 -2 52 16 Z" fill="url(#inkWashGrad)"/>
    <circle cx="32" cy="36" r="6.5" fill="#fab387" filter="url(#goldGlow)"/>

    <!-- Extending sword arm -->
    <path d="M 36 28 L 72 38 L 68 45 L 32 36 Z" fill="url(#inkWashLight)"/>
    <!-- Intricate Katana Sword with pink glowing edge -->
    <path d="M 68 38 L 122 62 L 118 66 L 64 42 Z" fill="url(#sakuraBlade)" filter="url(#sakuraGlow)"/>
  </g>
`, 130, 80);

// Player - Uppercut (Vertical launcher calligraphy slash, spirit paper seals)
saveSvg('player_uppercut.svg', `
  <!-- Blazing vertical ink-crescent and sakura flame -->
  <path d="M 38 95 C 68 60 62 10 50 -2 L 35 8 C 45 45 40 70 15 85 Z" fill="url(#inkWashGrad)" filter="url(#inkMisty)" opacity="0.95"/>
  <path d="M 36 90 C 58 60 55 25 45 5 L 38 10 C 45 40 40 65 22 80 Z" fill="url(#sakuraBlade)" filter="url(#sakuraGlow)" opacity="0.85"/>
  <path d="M 34 85 C 50 55 48 30 40 12 L 36 15 C 40 38 36 60 25 75 Z" fill="#cdd6f4" opacity="0.95"/>

  <!-- Floating sacred paper talismans with golden symbols -->
  <g filter="url(#goldGlow)">
    <rect x="54" y="20" width="8" height="16" rx="1.5" fill="#fab387" transform="rotate(25 58 28)"/>
    <path d="M 57 23 L 59 33 M 56 26 L 60 26" stroke="#cba6f7" stroke-width="1"/>
    
    <rect x="22" y="38" width="6" height="12" rx="1" fill="#fab387" transform="rotate(-15 25 44)"/>
    
    <rect x="64" y="5" width="10" height="20" rx="2" fill="#cdd6f4" transform="rotate(45 69 15)"/>
    <path d="M 67 9 Q 71 14 69 21" fill="none" stroke="#cba6f7" stroke-width="1.2"/>
  </g>

  <!-- Dynamic posing body -->
  <g transform="translate(0, 10)">
    <path d="M 22 28 L 50 28 L 44 58 L 26 58 Z" fill="url(#inkWashGrad)" stroke="#fab387" stroke-width="1.5"/>
    <ellipse cx="36" cy="20" rx="22" ry="6" fill="url(#inkWashLight)" stroke="#fab387" stroke-width="1.5"/>
    <path d="M 14 20 Q 36 4 58 20 Z" fill="url(#inkWashGrad)"/>
    
    <!-- Laser Katana raised vertically -->
    <path d="M 48 34 L 56 -5 L 61 -5 L 53 34 Z" fill="url(#sakuraBlade)" filter="url(#sakuraGlow)"/>
  </g>
`, 100, 100);

// Player - Dive Attack (Aggressive angle, spinning ink blades, maple trails)
saveSvg('player_dive.svg', `
  <g transform="translate(0, 8) rotate(45 50 50)">
    <!-- Trailing autumn maple leaf fields -->
    <polygon points="70,40 140,20 130,58" fill="url(#sacredMaple)" opacity="0.6"/>
    <polygon points="80,45 135,30 130,50" fill="#cba6f7" opacity="0.8"/>

    <!-- Pushing Body -->
    <path d="M 20 22 L 48 22 L 42 52 L 24 52 Z" fill="url(#inkWashGrad)" stroke="#fab387" stroke-width="1.5"/>
    <ellipse cx="34" cy="14" rx="20" ry="5" fill="url(#inkWashLight)" stroke="#fab387" stroke-width="1.2"/>
    <path d="M 14 14 Q 34 -4 54 14 Z" fill="url(#inkWashGrad)"/>
    
    <!-- Diving Sword extended with spirit gold glow -->
    <path d="M 42 45 L 115 45 L 115 50 L 42 50 Z" fill="url(#spiritGold)" filter="url(#heavyGoldGlow)"/>
    <polygon points="115,40 130,47 115,55" fill="#cdd6f4"/>
  </g>
`, 100, 100);

// Player - Cast (Gathering sacred golden spirit light in palms)
saveSvg('player_cast.svg', `
  <!-- Ribbon Scarf flying back -->
  <path d="M 32 25 C 10 38 -5 48 -18 56 C -8 44 8 32 26 28" fill="url(#sacredMaple)"/>

  <!-- Torso thrusting forward -->
  <g transform="rotate(12 40 40)">
    <path d="M 22 22 L 50 22 L 44 52 L 26 52 Z" fill="url(#inkWashGrad)" stroke="#fab387" stroke-width="1.5"/>
    <ellipse cx="36" cy="14" rx="20" ry="5" fill="url(#inkWashLight)" stroke="#fab387" stroke-width="1.2"/>
    <path d="M 16 14 Q 36 -6 56 14 Z" fill="url(#inkWashGrad)"/>
    
    <!-- Arms pushing forward -->
    <path d="M 28 28 L 68 25 L 68 35 Z" fill="url(#inkWashLight)"/>
    
    <!-- Swirling golden Yin-Yang spiritual ball in hands -->
    <circle cx="74" cy="30" r="15" fill="url(#spiritGold)" filter="url(#heavyGoldGlow)"/>
    <circle cx="74" cy="30" r="6" fill="#cdd6f4"/>
    <path d="M 74 15 A 7.5 7.5 0 0 0 74 30 A 7.5 7.5 0 0 1 74 45 A 15 15 0 0 0 74 15 Z" fill="#cdd6f4" opacity="0.6"/>
  </g>
`, 90, 80);

// Player - Energy Wave (The Wave Projectile: sleek golden floating talisman/scroll)
saveSvg('player_wave.svg', `
  <g transform="translate(10, 10)">
    <!-- Floating sacred paper scroll body -->
    <path d="M -5 10 L 25 0 Q 35 15 28 35 L -2 45 Z" fill="#cdd6f4" stroke="#fab387" stroke-width="2.5" filter="url(#goldGlow)"/>
    
    <!-- Red calligraphic talisman glyphs on the scroll -->
    <path d="M 5 15 C 8 20 12 18 10 32 M 5 22 L 15 18 M 8 28 C 14 28 12 34 16 34" fill="none" stroke="#cba6f7" stroke-width="2"/>
    
    <!-- Golden energy aura wings -->
    <path d="M 22 -12 A 32 32 0 0 1 22 52 A 20 20 0 0 0 10 20 Z" fill="url(#spiritGold)" filter="url(#heavyGoldGlow)" opacity="0.8"/>
    <path d="M 20 -5 A 26 26 0 0 1 20 45 A 16 16 0 0 0 10 20 Z" fill="#cdd6f4" opacity="0.9"/>
    
    <!-- Swirling calligraphic ink brush stroke lines -->
    <path d="M 12 20 C -2 15 -14 25 -25 20" fill="none" stroke="#181825" stroke-width="5" stroke-linecap="round" filter="url(#inkMisty)"/>
    <path d="M 10 10 C -4 8 -16 14 -28 12" fill="none" stroke="#f5c2e7" stroke-width="3" stroke-linecap="round" filter="url(#sakuraGlow)"/>
    <path d="M 14 30 C 0 28 -12 34 -24 32" fill="none" stroke="#f5c2e7" stroke-width="3" stroke-linecap="round" filter="url(#sakuraGlow)"/>
  </g>
`, 60, 60);

// === PLAYER COMBO FRAMES ===

// Combo Hit 1: Calligraphic horizontal sweep
saveSvg('player_combo1.svg', `
  <!-- Horizontal slash arc -->
  <path d="M 24 35 L 122 30 L 118 42 L 24 45 Z" fill="url(#inkWashGrad)" filter="url(#inkMisty)" opacity="0.95"/>
  <path d="M 36 37 L 118 34 L 116 38 L 36 41 Z" fill="url(#sakuraBlade)" filter="url(#sakuraGlow)" opacity="0.85"/>
  <path d="M 42 38 L 114 36 M 44 40 L 110 38" stroke="#cdd6f4" stroke-width="1.5" opacity="0.9"/>

  <!-- Player body leaning -->
  <g transform="rotate(4 40 40)">
    <path d="M 22 22 L 50 22 L 44 52 L 26 52 Z" fill="url(#inkWashGrad)" stroke="#fab387" stroke-width="1.5"/>
    <ellipse cx="36" cy="14" rx="20" ry="5" fill="url(#inkWashLight)" stroke="#fab387" stroke-width="1.2"/>
    <!-- Extended arm -->
    <path d="M 42 26 L 76 30 L 74 36 L 40 32 Z" fill="url(#inkWashLight)"/>
  </g>
  <!-- Katana horizontal -->
  <path d="M 72 28 L 126 26 L 124 32 L 70 34 Z" fill="url(#sakuraBlade)" filter="url(#sakuraGlow)"/>
`, 135, 80);

// Combo Hit 2: Upward diagonal calligraphy slash
saveSvg('player_combo2.svg', `
  <!-- Upward slash curve -->
  <path d="M 26 62 Q 58 32 98 6 L 92 16 Q 54 40 32 67 Z" fill="url(#inkWashGrad)" filter="url(#inkMisty)" opacity="0.95"/>
  <path d="M 32 58 Q 58 32 92 10 L 88 15 Q 54 38 36 61 Z" fill="url(#sakuraBlade)" filter="url(#sakuraGlow)" opacity="0.85"/>
  <path d="M 35 52 Q 58 32 86 14" fill="none" stroke="#cdd6f4" stroke-width="2" opacity="0.9"/>

  <g transform="rotate(-8 40 40)">
    <path d="M 22 24 L 50 24 L 44 54 L 26 54 Z" fill="url(#inkWashGrad)" stroke="#fab387" stroke-width="1.5"/>
    <ellipse cx="36" cy="16" rx="20" ry="5" fill="url(#inkWashLight)" stroke="#fab387" stroke-width="1.2"/>
    <!-- Uppercut swing arm -->
    <path d="M 40 28 L 66 14 L 64 21 L 38 34 Z" fill="url(#inkWashLight)"/>
  </g>
  <!-- Katana raised diagonal -->
  <path d="M 62 16 L 102 -6 L 99 1 L 59 22 Z" fill="url(#sakuraBlade)" filter="url(#sakuraGlow)"/>
`, 110, 80);

// Combo Hit 3: Spin-slash with calligraphic Zen Enso circular trace
saveSvg('player_combo3.svg', `
  <!-- Full circular calligraphy Enso trace -->
  <circle cx="40" cy="40" r="36" fill="none" stroke="url(#inkWashGrad)" stroke-width="9" filter="url(#inkMisty)" opacity="0.8" stroke-dasharray="160 60"/>
  <circle cx="40" cy="40" r="36" fill="none" stroke="url(#sakuraBlade)" stroke-width="4.5" filter="url(#sakuraGlow)" opacity="0.85" stroke-dasharray="120 100"/>
  <circle cx="40" cy="40" r="36" fill="none" stroke="#cdd6f4" stroke-width="1.8" opacity="0.9" stroke-dasharray="80 140"/>

  <!-- Body in extreme rotation spin -->
  <g transform="rotate(180 40 40) translate(0, -4)">
    <path d="M 22 22 L 50 22 L 44 52 L 26 52 Z" fill="url(#inkWashGrad)" stroke="#fab387" stroke-width="1.5"/>
    <ellipse cx="36" cy="14" rx="20" ry="5" fill="url(#inkWashLight)" stroke="#fab387" stroke-width="1.2"/>
  </g>
  <!-- Scarf whipping outwards -->
  <path d="M 38 22 C 75 6 96 24 102 30 C 84 16 52 22 44 24" fill="url(#sacredMaple)" opacity="0.9"/>
`, 110, 80);

// Combo Hit 4: Heavy overhead slam (Earth-shattering ink blasts, gold lightnings)
saveSvg('player_combo4.svg', `
  <!-- Downward calligraphy impact brush stroke -->
  <path d="M 26 -2 L 46 -2 L 76 68 L -4 68 Z" fill="url(#inkWashGrad)" filter="url(#inkMisty)" opacity="0.85"/>
  <path d="M 32 -2 L 40 -2 L 58 68 L 14 68 Z" fill="url(#sakuraBlade)" filter="url(#sakuraGlow)" opacity="0.75"/>
  <path d="M 34 -2 L 36 -2 L 46 68 L 26 68 Z" fill="#cdd6f4" opacity="0.9"/>

  <!-- Blinding energy rings at ground impact -->
  <ellipse cx="36" cy="64" rx="30" ry="9" fill="none" stroke="#fab387" stroke-width="3" filter="url(#goldGlow)" opacity="0.95"/>
  <ellipse cx="36" cy="64" rx="18" ry="4.5" fill="#cdd6f4" filter="url(#heavyGoldGlow)"/>
  
  <!-- Calligraphy lightning fragments -->
  <line x1="16" y1="68" x2="-6" y2="75" stroke="#fab387" stroke-width="4.5" stroke-linecap="round" filter="url(#goldGlow)"/>
  <line x1="56" y1="68" x2="78" y2="75" stroke="#cba6f7" stroke-width="4" stroke-linecap="round"/>

  <!-- Slamming Body -->
  <g transform="translate(2, 6)">
    <path d="M 22 14 L 50 14 L 44 44 L 26 44 Z" fill="url(#inkWashGrad)" stroke="#fab387" stroke-width="2"/>
    <ellipse cx="36" cy="6" rx="20" ry="5" fill="url(#inkWashLight)" stroke="#fab387" stroke-width="1.2"/>
    <circle cx="36" cy="24" r="6" fill="#fab387" filter="url(#goldGlow)"/>
    <!-- Both hands slammed down -->
    <path d="M 31 16 L 36 -5 L 41 16 Z" fill="url(#inkWashLight)"/>
  </g>
  <!-- Vertical sword drove down -->
  <path d="M 34 -12 L 38 -12 L 40 62 L 32 62 Z" fill="url(#sakuraBlade)" filter="url(#sakuraGlow)"/>
`, 90, 80);


// ==========================================
// 2. ENEMIES SPRITES (Traditional Karakuri / Cyber-Zen Puppets)
// ==========================================

// Enemy - Guard (甲胄傀儡 - Segmented lacquer samurai armor puppet)
saveSvg('enemy_guard.svg', `
  <!-- Heavy carbon block armor in samurai design -->
  <path d="M 16 24 L 56 24 L 60 55 L 12 55 Z" fill="url(#inkWashGrad)" stroke="#cba6f7" stroke-width="2.5"/>
  <path d="M 12 55 L 60 55 L 56 68 L 16 68 Z" fill="#cba6f7" stroke="#181825" stroke-width="1"/>
  
  <!-- Glowing orange panel lines -->
  <path d="M 22 34 L 50 34 M 24 42 L 48 42 M 26 50 L 46 50" stroke="#cba6f7" stroke-width="1.8"/>
  <circle cx="36" cy="38" r="6" fill="#fab387" filter="url(#goldGlow)"/>
  
  <!-- Cyber samurai helm with glowing optic sensor -->
  <rect x="24" y="8" width="24" height="16" rx="2" fill="#1e1e2e" stroke="#cba6f7" stroke-width="1.5"/>
  <path d="M 20 6 L 24 10 L 28 8" fill="#cba6f7"/>
  <path d="M 52 6 L 48 10 L 44 8" fill="#cba6f7"/>
  <rect x="28" y="13" width="16" height="4" fill="#fab387" filter="url(#goldGlow)"/>

  <!-- High-voltage electric stun naginata spear -->
  <rect x="56" y="16" width="4" height="48" fill="#313244" stroke="#cba6f7" stroke-width="0.8"/>
  <path d="M 55 16 C 55 0 65 -8 72 -14 L 75 -10 C 65 0 58 10 58 16" fill="url(#spiritGold)" filter="url(#goldGlow)"/>
  <!-- Gold sparks around Naginata blade -->
  <path d="M 56 4 C 64 12 66 22 58 32" fill="none" stroke="#fab387" stroke-width="2" filter="url(#goldGlow)"/>
`, 80, 80);

// Enemy - Axe Brute (石佛巨像 - Colossal stone guardian statue, red Sanskrit runes)
saveSvg('enemy_axe.svg', `
  <!-- Giant industrial stone pagoda/Buddha body -->
  <rect x="12" y="16" width="56" height="54" rx="10" fill="url(#inkWashGrad)" stroke="#eba0ac" stroke-width="3.5"/>
  
  <!-- Glowing mechanical red Sanskrit/Zen signs on chest -->
  <path d="M 26 26 L 42 26 M 34 26 L 34 40 M 26 40 L 42 40 M 26 33 L 42 33" stroke="#cba6f7" stroke-width="2.5" filter="url(#redGlow)"/>
  <path d="M 28 46 L 50 46 M 39 46 L 39 58" stroke="#cba6f7" stroke-width="2.5" filter="url(#redGlow)"/>
  
  <!-- Large heavy stone joints -->
  <circle cx="12" cy="43" r="8.5" fill="#181825" stroke="#cba6f7" stroke-width="1.8"/>
  <circle cx="68" cy="43" r="8.5" fill="#181825" stroke="#cba6f7" stroke-width="1.8"/>

  <!-- Head with glowing red evil gaze visor -->
  <polygon points="30,16 50,16 46,6 34,6" fill="#181825" stroke="#cba6f7" stroke-width="1.5"/>
  <circle cx="40" cy="11" r="3.5" fill="#f38ba8" filter="url(#redGlow)"/>

  <!-- Colossal Lacquered Executioner Axe -->
  <rect x="68" y="2" width="7" height="74" fill="#181825" stroke="#eba0ac" stroke-width="1.5"/>
  <!-- Intricate thermal heat cutter axe blade in crimson/gold -->
  <path d="M 72 8 Q 115 -4 115 35 Q 115 74 72 62 Z" fill="url(#sacredMaple)" filter="url(#redGlow)"/>
  <path d="M 72 18 Q 105 10 105 35 Q 105 60 72 52 Z" fill="#cdd6f4" opacity="0.85"/>
`, 110, 80);

// Enemy - Ninja Bot (纸鸢忍者 - Origami white paper-crane drone, golden spirit claws)
saveSvg('enemy_ninja.svg', `
  <!-- Folded white paper-crane chassis -->
  <polygon points="40,16 54,55 26,55" fill="#cdd6f4" stroke="#fab387" stroke-width="2"/>
  <polygon points="40,24 48,50 32,50" fill="url(#inkWashLight)"/>
  <line x1="40" y1="16" x2="40" y2="55" stroke="#cba6f7" stroke-width="1.2"/>

  <!-- Spherical head with glowing golden paper mask eyepiece -->
  <circle cx="40" cy="11" r="9" fill="#cdd6f4" stroke="#fab387" stroke-width="1.8"/>
  <polygon points="36,8 44,8 40,14" fill="#fab387" filter="url(#goldGlow)"/>
  <circle cx="40" cy="11" r="2.5" fill="#cdd6f4"/>
  
  <!-- Digital dual claw blade attachments (Extremely glowing pink/gold) -->
  <path d="M 24 38 L -4 60 Q 6 48 12 44 Z" fill="url(#spiritGold)" filter="url(#goldGlow)"/>
  <path d="M 56 38 L 84 60 Q 74 48 68 44 Z" fill="url(#spiritGold)" filter="url(#goldGlow)"/>
  
  <!-- Hanging paper talismans on bottom -->
  <rect x="30" y="55" width="6" height="15" fill="#cba6f7"/>
  <rect x="44" y="55" width="6" height="15" fill="#cba6f7"/>
`, 80, 80);

// Enemy - Sniper (竹骨弩车 - Crawling bamboo ballista tripod turret drone)
saveSvg('enemy_sniper.svg', `
  <!-- Tripod support core built of bamboo rods -->
  <rect x="22" y="24" width="36" height="32" rx="3" fill="url(#inkWashGrad)" stroke="#fab387" stroke-width="2"/>
  <!-- Bamboo cross joint details -->
  <line x1="22" y1="24" x2="58" y2="56" stroke="#fab387" stroke-width="2.5"/>
  <line x1="22" y1="56" x2="58" y2="24" stroke="#fab387" stroke-width="2.5"/>
  <rect x="30" y="32" width="20" height="16" fill="#1e1e2e" stroke="#cba6f7" stroke-width="1"/>
  
  <!-- Turret neck -->
  <path d="M 28 14 L 52 14 L 46 24 L 34 24 Z" fill="#181825" stroke="#fab387" stroke-width="1.2"/>
  <!-- Optical high-tech charging lens inside copper ring -->
  <circle cx="40" cy="19" r="6" fill="#fab387" stroke="#1e1e2e" stroke-width="1.5"/>
  <circle cx="40" cy="19" r="2.5" fill="#cdd6f4" filter="url(#goldGlow)"/>

  <!-- Electromagnetic Ballista Rail-barrel -->
  <rect x="42" y="32" width="44" height="8" rx="1" fill="#11111b" stroke="#fab387" stroke-width="1.2"/>
  <!-- Charging spiritual energy arrow visible in barrel -->
  <polygon points="86,36 94,36 86,40" fill="#fab387" filter="url(#goldGlow)"/>
  <line x1="42" y1="36" x2="86" y2="36" stroke="#cdd6f4" stroke-width="1.8" filter="url(#goldGlow)"/>
`, 90, 80);

// Enemy Bullet - (Golden spiritual arrow projectile with mist trail)
saveSvg('projectile.svg', `
  <!-- Glowing Spirit Arrow -->
  <line x1="4" y1="10" x2="32" y2="10" stroke="#fab387" stroke-width="3" stroke-linecap="round" filter="url(#goldGlow)"/>
  <polygon points="32,7 39,10 32,13" fill="#cdd6f4" filter="url(#goldGlow)"/>
  <!-- Feathers at back -->
  <polygon points="4,10 -2,4 4,4" fill="#cba6f7"/>
  <polygon points="4,10 -2,16 4,16" fill="#cba6f7"/>
`, 40, 20);


// ==========================================
// 3. CORE GUARDIAN BOSS (乾坤八卦神机 - Bagua Shrine Core)
// ==========================================

// Boss - Idle (Colossal floating pagoda core with warning hazard stripes, glowing Bagua signs)
saveSvg('boss_idle.svg', `
  <!-- Distant Calligraphy Fog -->
  <circle cx="60" cy="66" r="54" fill="none" stroke="#181825" stroke-width="6" opacity="0.3" filter="url(#inkMisty)"/>

  <!-- Colossal multi-tiered pagoda shrine core structure -->
  <path d="M 8 26 L 60 6 L 112 26 L 102 98 L 18 98 Z" fill="url(#inkWashGrad)" stroke="#cba6f7" stroke-width="5.5"/>
  
  <!-- Roof tiles of the Pagoda -->
  <path d="M 0 28 Q 60 0 120 28" fill="none" stroke="#fab387" stroke-width="6"/>
  <path d="M -5 32 Q 60 4 125 32" fill="none" stroke="#cba6f7" stroke-width="2"/>
  
  <!-- Swirling Bagua Glyphs around Core (乾坤震巽坎离艮兑) -->
  <!-- Active glowing symbols inside circle -->
  <circle cx="60" cy="66" r="32" fill="none" stroke="#fab387" stroke-width="2" stroke-dasharray="15 8" filter="url(#goldGlow)"/>
  <text x="54" y="44" font-family="sans-serif" font-weight="bold" font-size="9" fill="#fab387" filter="url(#goldGlow)">乾</text>
  <text x="54" y="96" font-family="sans-serif" font-weight="bold" font-size="9" fill="#fab387" filter="url(#goldGlow)">坤</text>
  <text x="32" y="70" font-family="sans-serif" font-weight="bold" font-size="9" fill="#fab387" filter="url(#goldGlow)">离</text>
  <text x="76" y="70" font-family="sans-serif" font-weight="bold" font-size="9" fill="#fab387" filter="url(#goldGlow)">坎</text>

  <!-- Pulsing central yin-yang reactor core -->
  <circle cx="60" cy="66" r="18" fill="#1e1e2e" stroke="#fab387" stroke-width="2" filter="url(#heavyGoldGlow)"/>
  <path d="M 60 48 A 9 9 0 0 0 60 66 A 9 9 0 0 1 60 84 A 18 18 0 0 0 60 48 Z" fill="#fab387"/>
  <circle cx="60" cy="57" r="3" fill="#1e1e2e"/>
  <circle cx="60" cy="75" r="3" fill="#cdd6f4"/>
  
  <!-- Hanging paper talismans along bottom -->
  <g fill="#fab387" stroke="#cba6f7" stroke-width="0.8">
    <rect x="22" y="98" width="8" height="20" rx="1"/>
    <rect x="42" y="98" width="8" height="24" rx="1"/>
    <rect x="70" y="98" width="8" height="24" rx="1"/>
    <rect x="90" y="98" width="8" height="20" rx="1"/>
  </g>

  <!-- Heavy mechanical iron claws/shoulders on sides -->
  <rect x="-14" y="26" width="30" height="52" rx="5" fill="#11111b" stroke="#cba6f7" stroke-width="3"/>
  <rect x="104" y="26" width="30" height="52" rx="5" fill="#11111b" stroke="#cba6f7" stroke-width="3"/>
`, 140, 120);

// Boss - Windup (Full spiritual overload, calligraphy runes bursting out)
saveSvg('boss_windup.svg', `
  <path d="M 8 26 L 60 6 L 112 26 L 102 98 L 18 98 Z" fill="url(#inkWashGrad)" stroke="#fab387" stroke-width="5.5"/>
  <path d="M 0 28 Q 60 0 120 28" fill="none" stroke="#cba6f7" stroke-width="6"/>

  <!-- Core charging yellow-hot -->
  <circle cx="60" cy="66" r="34" fill="none" stroke="#fab387" stroke-width="4" stroke-dasharray="8 6" filter="url(#goldGlow)"/>
  
  <!-- Yin-Yang spinning actively -->
  <circle cx="60" cy="66" r="22" fill="#1e1e2e" stroke="#cdd6f4" stroke-width="2.5" filter="url(#heavyGoldGlow)"/>
  <path d="M 60 44 A 11 11 0 0 0 60 66 A 11 11 0 0 1 60 88 A 22 22 0 0 0 60 44 Z" fill="#fab387"/>

  <!-- Massive glowing calligraphy signs erupting (Sanskrit/Kanji "神" / "力") -->
  <text x="32" y="42" font-family="serif" font-weight="bold" font-size="15" fill="#cba6f7" filter="url(#redGlow)">神</text>
  <text x="76" y="42" font-family="serif" font-weight="bold" font-size="15" fill="#cba6f7" filter="url(#redGlow)">机</text>
  <text x="32" y="96" font-family="serif" font-weight="bold" font-size="15" fill="#fab387" filter="url(#goldGlow)">乾</text>
  <text x="76" y="96" font-family="serif" font-weight="bold" font-size="15" fill="#fab387" filter="url(#goldGlow)">坤</text>

  <!-- Claws raised in charging pose -->
  <rect x="-20" y="8" width="30" height="52" rx="5" fill="#11111b" stroke="#fab387" stroke-width="3" transform="rotate(-26 0 32)"/>
  <rect x="110" y="8" width="30" height="52" rx="5" fill="#11111b" stroke="#fab387" stroke-width="3" transform="rotate(26 120 32)"/>
`, 140, 120);

// Boss - Rush (Aggressive forward tilt, massive golden jet clouds)
saveSvg('boss_rush.svg', `
  <g transform="rotate(12 60 60)">
    <path d="M 8 26 L 60 6 L 112 26 L 102 98 L 18 98 Z" fill="url(#inkWashGrad)" stroke="#cba6f7" stroke-width="5.5"/>
    <path d="M 0 28 Q 60 0 120 28" fill="none" stroke="#fab387" stroke-width="6"/>

    <!-- Swirling golden-hot core -->
    <circle cx="60" cy="66" r="25" fill="url(#spiritGold)" filter="url(#goldGlow)"/>
    <circle cx="60" cy="66" r="10" fill="#cdd6f4"/>

    <!-- Swirling calligraphic gold clouds blasting out as thrusters -->
    <path d="M -20 46 C -40 30 -60 40 -80 46 C -60 52 -40 48 -20 46" fill="url(#spiritGold)" filter="url(#goldGlow)"/>
    <path d="M -15 66 C -35 50 -55 60 -75 66 C -55 72 -35 68 -15 66" fill="url(#spiritGold)" filter="url(#goldGlow)"/>
    <path d="M -10 86 C -30 70 -50 80 -70 86 C -50 92 -30 88 -10 86" fill="url(#inkWashGrad)" opacity="0.6"/>
  </g>
`, 160, 120);

// Boss - Attack (Devastating wide double golden crescent sword sweep)
saveSvg('boss_attack.svg', `
  <path d="M 8 26 L 60 6 L 112 26 L 102 98 L 18 98 Z" fill="url(#inkWashGrad)" stroke="#cba6f7" stroke-width="5.5"/>
  <circle cx="60" cy="66" r="22" fill="#cdd6f4" filter="url(#heavyGoldGlow)"/>

  <!-- Colossal Double Golden Crescent Slash Sweep (Zen sword slash style) -->
  <path d="M -25 55 A 125 125 0 0 1 252 55" fill="none" stroke="url(#spiritGold)" stroke-width="18" filter="url(#heavyGoldGlow)" stroke-linecap="round"/>
  <path d="M -25 55 A 125 125 0 0 1 252 55" fill="none" stroke="#cdd6f4" stroke-width="6" stroke-linecap="round"/>
  
  <!-- Splattering black ink droplets around blade -->
  <circle cx="-10" cy="30" r="4.5" fill="#181825" filter="url(#inkMisty)"/>
  <circle cx="50" cy="-5" r="6" fill="#181825" filter="url(#inkMisty)"/>
  <circle cx="120" cy="-12" r="5" fill="#181825" filter="url(#inkMisty)"/>
  <circle cx="200" cy="18" r="4" fill="#181825" filter="url(#inkMisty)"/>
`, 220, 120);


// ==========================================
// 4. ENVIRONMENT & PLATFORMS (Sacred Ink Wood)
// ==========================================

// Lacquered Wood Platform Tile (Intricate calligraphic grains, copper plates, glowing gold top border)
saveBgSvg('platform.svg', `
  <rect width="64" height="64" fill="url(#inkWashGrad)" stroke="#1e1e2e" stroke-width="2.5"/>
  
  <!-- Golden/copper grain lines on lacquered wood -->
  <path d="M 0 18 Q 32 12 64 18 M 0 34 Q 32 28 64 34 M 0 50 Q 32 44 64 50" stroke="#585b70" stroke-width="1.8"/>
  <path d="M 8 0 Q 8 32 12 64 M 54 0 Q 52 32 54 64" stroke="#150d08" stroke-width="1"/>
  
  <!-- Digital brush grains for rustic traditional feel -->
  <line x1="4" y1="8" x2="60" y2="8" stroke="#fab387" stroke-width="0.5" opacity="0.15"/>
  <line x1="4" y1="42" x2="60" y2="42" stroke="#fab387" stroke-width="0.5" opacity="0.15"/>

  <!-- Ancient Sacred Top Edge Golden Border (The Golden Seal / 符文) -->
  <rect x="0" y="0" width="64" height="6.5" fill="#fab387" filter="url(#bgGlow)"/>
  <rect x="0" y="0" width="64" height="2" fill="#cdd6f4"/>
  
  <!-- Red sacred warning symbols on the gold edge -->
  <rect x="12" y="2.5" width="4" height="2" fill="#cba6f7"/>
  <rect x="30" y="2.5" width="4" height="2" fill="#cba6f7"/>
  <rect x="48" y="2.5" width="4" height="2" fill="#cba6f7"/>

  <!-- Copper corner reinforcement brackets and rivets -->
  <circle cx="8" cy="12" r="2.8" fill="#fab387" filter="url(#bgGlow)"/>
  <circle cx="56" cy="12" r="2.8" fill="#fab387" filter="url(#bgGlow)"/>
  <circle cx="8" cy="52" r="2" fill="#585b70"/>
  <circle cx="56" cy="52" r="2" fill="#585b70"/>
`, 64, 64);

// City Background - Far (水墨写意山河 - Parallax Misty Ink Mountains, Giant Golden Moon)
saveBgSvg('bg_city_far.svg', `
  <rect width="1280" height="720" fill="url(#parchmentFade)"/>
  
  <!-- Distant giant calligraphic gold-red moon -->
  <circle cx="1020" cy="190" r="105" fill="#fab387" filter="url(#bgGlow)" opacity="0.65"/>
  <circle cx="1020" cy="190" r="90" fill="url(#spiritGold)" opacity="0.85"/>
  <!-- Traditional brush-stroke ink clouds slicing the golden moon -->
  <path d="M 820 180 Q 980 140 1140 180 Q 1020 200 820 180 Z" fill="#ccc1aa" opacity="0.9"/>
  <path d="M 880 220 Q 1020 185 1160 220 Q 1000 240 880 220 Z" fill="#ede3cd" opacity="0.95"/>
  <path d="M 850 140 Q 960 115 1070 140 Q 960 155 850 140 Z" fill="#ccc1aa" opacity="0.75"/>

  <!-- High-fidelity flying paper-cranes silhouette (distant stars replacement) -->
  <g fill="#cba6f7" opacity="0.65" filter="url(#bgGlow)">
    <!-- Crane 1 -->
    <polygon points="120,100 135,90 128,105 125,102" transform="rotate(-15 120 100)"/>
    <!-- Crane 2 -->
    <polygon points="280,140 292,132 286,144" transform="rotate(10 280 140)"/>
    <!-- Crane 3 -->
    <polygon points="530,90 540,82 535,93"/>
    <!-- Crane 4 -->
    <polygon points="780,110 795,100 788,115"/>
  </g>

  <!-- Majestic Calligraphic Misty Ink Mountains Skyline -->
  <!-- Mountain Tier 1 (Farthest - very misty) -->
  <path d="M 0 540 C 200 480 300 380 450 480 C 600 580 800 360 1000 460 C 1150 540 1200 490 1280 540 L 1280 720 L 0 720 Z" fill="#ccc1aa" filter="url(#inkMistyBg)" opacity="0.75"/>
  <!-- Mountain Tier 2 (Mid-distance - ink grey) -->
  <path d="M 0 570 C 150 500 250 440 380 520 C 500 600 720 400 920 500 C 1080 580 1180 480 1280 550 L 1280 720 L 0 720 Z" fill="#a69b85" filter="url(#inkMistyBg)" opacity="0.9"/>
  <!-- Mountain Tier 3 (Closest - deep black brush stroke silhouette) -->
  <path d="M 0 600 L 150 530 L 280 590 L 450 460 L 620 560 L 820 410 L 980 520 L 1150 440 L 1280 520 L 1280 720 L 0 720 Z" fill="#2d281e" stroke="#1e1e2e" stroke-width="3"/>
`, 1280, 720);

// Midground City (金碧楼阁 - Traditional multi-tiered Golden Digital Pagodas, Kanji Banners)
saveBgSvg('bg_city_mid.svg', `
  <defs>
    <linearGradient id="pagodaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3d3527"/>
      <stop offset="100%" stop-color="#15120d"/>
    </linearGradient>
  </defs>
  
  <!-- Beautiful multi-tiered Silhouette Pagodas and Shrines -->
  <g fill="url(#pagodaGrad)" stroke="#fab387" stroke-width="2">
    <!-- Pagoda 1 -->
    <rect x="50" y="280" width="130" height="440" />
    <path d="M 30 280 Q 115 220 200 280" fill="url(#pagodaGrad)" stroke="#cba6f7" stroke-width="2.5"/>
    <path d="M 40 360 Q 115 310 190 360" fill="url(#pagodaGrad)" stroke="#cba6f7" stroke-width="2"/>
    
    <!-- Pagoda 2 -->
    <rect x="290" y="160" width="170" height="560" />
    <path d="M 270 160 Q 375 100 480 160" fill="url(#pagodaGrad)" stroke="#cba6f7" stroke-width="2.5"/>
    <path d="M 280 280 Q 375 220 470 280" fill="url(#pagodaGrad)" stroke="#cba6f7" stroke-width="2"/>
    <path d="M 285 400 Q 375 340 465 400" fill="url(#pagodaGrad)" stroke="#cba6f7" stroke-width="2"/>
    
    <!-- Pagoda 3 -->
    <rect x="560" y="320" width="160" height="400" />
    <path d="M 540 320 Q 640 260 740 320" fill="url(#pagodaGrad)" stroke="#cba6f7" stroke-width="2.5"/>
    
    <!-- Pagoda 4 -->
    <rect x="800" y="110" width="160" height="610" />
    <path d="M 780 110 Q 880 50 980 110" fill="url(#pagodaGrad)" stroke="#cba6f7" stroke-width="2.5"/>
    <path d="M 790 230 Q 880 170 970 230" fill="url(#pagodaGrad)" stroke="#cba6f7" stroke-width="2"/>
    <path d="M 795 350 Q 880 290 965 350" fill="url(#pagodaGrad)" stroke="#cba6f7" stroke-width="2"/>
    
    <!-- Pagoda 5 -->
    <rect x="1060" y="240" width="150" height="480" />
    <path d="M 1040 240 Q 1135 180 1230 240" fill="url(#pagodaGrad)" stroke="#cba6f7" stroke-width="2.5"/>
  </g>

  <!-- Glowing spiritual paper lanterns and calligraphic typography signs -->
  <g filter="url(#bgGlow)">
    <!-- Pagoda 1 hanging lantern lights -->
    <rect x="105" y="300" width="20" height="30" rx="3" fill="#fab387" opacity="0.9"/>
    <line x1="115" y1="300" x2="115" y2="330" stroke="#cba6f7" stroke-width="1.8"/>

    <!-- Pagoda 2 Calligraphy grid -->
    <line x1="290" y1="230" x2="460" y2="230" stroke="#fab387" stroke-width="4"/>
    <rect x="330" y="300" width="16" height="80" fill="#cba6f7" opacity="0.85"/>
    <rect x="375" y="300" width="16" height="80" fill="#cba6f7" opacity="0.85"/>
    <rect x="420" y="300" width="16" height="80" fill="#cba6f7" opacity="0.85"/>

    <!-- Giant Calligraphic Banner Kanji "忍" and "禅" vertically -->
    <rect x="850" y="170" width="60" height="240" rx="6" fill="#f5efe0" stroke="#cba6f7" stroke-width="2"/>
    <text x="862" y="225" font-family="serif" font-weight="bold" font-size="48" fill="#181825" letter-spacing="4">忍</text>
    <text x="862" y="325" font-family="serif" font-weight="bold" font-size="48" fill="#cba6f7" letter-spacing="4">禅</text>

    <!-- Spiritual sacred maples flying across background -->
    <circle cx="640" cy="200" r="14" fill="#cba6f7" opacity="0.85"/>
    <path d="M 625 200 L 655 200 L 640 185 Z" fill="#cdd6f4"/>
  </g>
`, 1280, 720);

// Forest Backgrounds - Far (水墨竹影 - Watercolor calligraphic bamboo stalks, far)
saveBgSvg('bg_forest_far.svg', `
  <rect width="1280" height="720" fill="url(#parchmentFade)"/>
  
  <!-- Beautiful giant watercolor silhouettes of bamboo stalks in grey ink -->
  <g fill="url(#inkMistyFade)" filter="url(#inkMistyBg)" opacity="0.55">
    <rect x="100" y="100" width="60" height="620" rx="4" />
    <rect x="320" y="40" width="90" height="680" rx="5" />
    <rect x="680" y="140" width="50" height="580" rx="3" />
    <rect x="980" y="60" width="110" height="660" rx="6" />
    
    <!-- Big bamboo segments lines -->
    <line x1="100" y1="300" x2="160" y2="300" stroke="#f5efe0" stroke-width="4"/>
    <line x1="320" y1="240" x2="410" y2="240" stroke="#f5efe0" stroke-width="5"/>
    <line x1="680" y1="340" x2="730" y2="340" stroke="#f5efe0" stroke-width="3"/>
    <line x1="980" y1="280" x2="1090" y2="280" stroke="#f5efe0" stroke-width="6"/>
  </g>
`, 1280, 720);

// Forest Backgrounds - Mid (数字竹林 - Calligraphic wood, golden bamboo leaves)
saveBgSvg('bg_forest_mid.svg', `
  <!-- Digital Zen bamboo stalks in ink-black with golden rings -->
  <g fill="#221e16" stroke="#fab387" stroke-width="2">
    <!-- Bamboo 1 -->
    <rect x="180" y="80" width="70" height="640" rx="3" />
    <!-- Bamboo 2 -->
    <rect x="580" y="40" width="90" height="680" rx="4" />
    <!-- Bamboo 3 -->
    <rect x="880" y="120" width="65" height="600" rx="3" />
    
    <!-- Golden segments connections -->
    <rect x="178" y="240" width="74" height="6" fill="#fab387"/>
    <rect x="178" y="420" width="74" height="6" fill="#fab387"/>
    <rect x="578" y="200" width="94" height="8" fill="#fab387"/>
    <rect x="578" y="440" width="94" height="8" fill="#fab387"/>
    <rect x="878" y="300" width="69" height="6" fill="#fab387"/>
    <rect x="878" y="480" width="69" height="6" fill="#fab387"/>

    <!-- High-fidelity segmented bamboo leaves (gold/crimson water-color brush paths) -->
    <!-- Leaf clusters -->
    <polygon points="120,180 200,90 280,180 200,140" fill="#cba6f7" stroke="#fab387" stroke-width="1.2"/>
    <polygon points="480,130 625,30 770,130 625,90" fill="#2d281e" stroke="#fab387" stroke-width="1.2"/>
    <polygon points="780,220 910,120 1040,220 910,180" fill="#cba6f7" stroke="#fab387" stroke-width="1.2"/>
  </g>

  <!-- Glowing spiritual calligraphic lanterns suspended from stalks -->
  <g fill="#fab387" filter="url(#bgGlow)">
    <rect x="207" y="270" width="16" height="50" rx="4" fill="#fab387"/>
    <rect x="612" y="220" width="26" height="80" rx="6" fill="#cdd6f4"/>
    <rect x="898" y="320" width="28" height="60" rx="5" fill="#fab387"/>
    
    <!-- Calligraphic red ink tassels on lanterns -->
    <line x1="215" y1="320" x2="215" y2="335" stroke="#cba6f7" stroke-width="1.5"/>
    <line x1="625" y1="300" x2="625" y2="320" stroke="#cba6f7" stroke-width="2"/>
    <line x1="912" y1="380" x2="912" y2="400" stroke="#cba6f7" stroke-width="1.8"/>

    <!-- Floating spirit cherry blossom flower seeds -->
    <circle cx="280" cy="360" r="5" fill="#f5c2e7" filter="url(#bgGlow)"/>
    <circle cx="480" cy="460" r="4.5" fill="#f5c2e7" filter="url(#bgGlow)"/>
    <circle cx="780" cy="260" r="6" fill="#fab387"/>
    <circle cx="1080" cy="400" r="5" fill="#fab387"/>
  </g>
`, 1280, 720);

// Reactor Core Backgrounds - Far (乾坤大殿 - Calligraphic red shrine interior, massive Torii Gates)
saveBgSvg('bg_core_far.svg', `
  <rect width="1280" height="720" fill="url(#parchmentFade)"/>
  
  <!-- Silhouette of massive traditional Torii Gates (神道鸟居) -->
  <g fill="url(#inkMistyFade)" filter="url(#inkMistyBg)" opacity="0.6">
    <path d="M 200 720 L 200 240 L 1080 240 L 1080 720 L 980 720 L 980 340 L 300 340 L 300 720 Z" />
    <path d="M 120 200 L 1160 200 L 1120 250 L 160 250 Z" />
    <!-- Secondary header bar -->
    <rect x="180" y="270" width="920" height="24" />
  </g>
`, 1280, 720);

// Reactor Core Backgrounds - Mid (太极神机炉 - Sacred golden Bagua furnace, spiritual talismans)
saveBgSvg('bg_core_mid.svg', `
  <!-- Sacred Temple Columns on sides -->
  <g fill="#1a140f" stroke="#cba6f7" stroke-width="3.5">
    <rect x="220" y="0" width="100" height="720" />
    <rect x="960" y="0" width="100" height="720" />
  </g>
  
  <!-- Colossal Golden Bagua Core Divine Furnace (太极八卦炉) -->
  <!-- Outer bronze furnace container -->
  <circle cx="640" cy="360" r="210" fill="#15120d" stroke="#fab387" stroke-width="12"/>
  
  <!-- Glowing neon Bagua rings (rotating hazard replacement) -->
  <circle cx="640" cy="360" r="170" fill="none" stroke="#cba6f7" stroke-width="4.5" stroke-dasharray="20 12" filter="url(#bgGlow)"/>
  
  <!-- Blinding active golden spiritual plasma fire center -->
  <circle cx="640" cy="360" r="110" fill="url(#spiritGold)" filter="url(#bgGlow)" opacity="0.7"/>
  
  <!-- Pure white Yin-Yang swirling core -->
  <circle cx="640" cy="360" r="55" fill="#1e1e2e" stroke="#cdd6f4" stroke-width="2.5" filter="url(#bgGlow)"/>
  <path d="M 640 305 A 27.5 27.5 0 0 0 640 360 A 27.5 27.5 0 0 1 640 415 A 55 55 0 0 0 640 305 Z" fill="#fab387"/>

  <!-- Golden sacred paper seals (符咒) hanging from temple beams -->
  <g fill="#fab387" stroke="#cba6f7" stroke-width="1" filter="url(#bgGlow)">
    <rect x="250" y="100" width="40" height="120" rx="3" fill="#f5efe0"/>
    <text x="258" y="170" font-family="serif" font-weight="bold" font-size="28" fill="#181825">符</text>
    
    <rect x="990" y="150" width="40" height="120" rx="3" fill="#f5efe0"/>
    <text x="998" y="220" font-family="serif" font-weight="bold" font-size="28" fill="#cba6f7">神</text>
  </g>
`, 1280, 720);

console.log('High-fidelity Calligraphic Ink-Wash / Cyber-Zen SVG graphics programmatically generated successfully!');
