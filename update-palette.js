import fs from 'fs';

const file = 'scripts/generate-assets.js';
let content = fs.readFileSync(file, 'utf8');

const colorMap = {
  // Deep darks -> Base, Mantle, Crust
  '#151515': '#181825', // Mantle
  '#1c1c1c': '#1e1e2e', // Base
  '#111': '#11111b', // Crust
  '#333': '#313244', // Surface0
  '#2a2a2a': '#313244', 
  '#121212': '#11111b',
  '#050505': '#11111b',
  '#000000': '#11111b',

  // Greys -> Overlays, Surfaces
  '#6e6e6e': '#6c7086', // Overlay0
  '#444': '#45475a', // Surface1
  '#3c3c3c': '#45475a',
  '#2d1d11': '#585b70', // Surface2
  '#888': '#7f849c', // Overlay1

  // Yellows/Golds -> Peach, Yellow
  '#e5c158': '#fab387', // Peach
  '#ffe680': '#f9e2af', // Yellow
  '#fff2a3': '#f9e2af',
  '#d4af37': '#fab387',
  '#b8860b': '#fab387',
  '#ffd700': '#f9e2af',

  // Reds/Crimsons -> Mauve, Red, Maroon
  '#cc1100': '#cba6f7', // Mauve
  '#ff2200': '#f38ba8', // Red
  '#ff3333': '#f38ba8',
  '#aa0000': '#eba0ac', // Maroon
  '#800000': '#eba0ac',
  '#d43f00': '#fab387', // Peach
  '#550000': '#1e1e2e', // Dark red -> Base
  '#e94560': '#f38ba8', // Cyberpunk red -> Red
  '#ff0055': '#f5c2e7', // Pink

  // Pinks -> Flamingo, Pink, Rosewater
  '#ff5599': '#f5c2e7', // Pink
  '#ffb3d9': '#f2cdcd', // Flamingo
  '#ff3399': '#f5c2e7',
  '#cc0066': '#cba6f7', // Mauve

  // Cyans/Blues -> Teal, Sky, Blue, Sapphire
  '#00ffff': '#89dceb', // Sky
  '#00cccc': '#94e2d5', // Teal
  '#008888': '#74c7ec', // Sapphire
  '#111122': '#181825', // Mantle
  '#0f3460': '#1e1e2e', // Base
  '#1a1a2e': '#11111b', // Crust

  // White
  '#ffffff': '#cdd6f4', // Text
  '#fff': '#cdd6f4'
};

// Also we should comment out the background generation calls
content = content.replace(/fs\.writeFileSync\(path\.join\(bgDir,\s*'bg_city/g, '// fs.writeFileSync(path.join(bgDir, \'bg_city');
content = content.replace(/fs\.writeFileSync\(path\.join\(bgDir,\s*'bg_forest/g, '// fs.writeFileSync(path.join(bgDir, \'bg_forest');
content = content.replace(/fs\.writeFileSync\(path\.join\(bgDir,\s*'bg_core/g, '// fs.writeFileSync(path.join(bgDir, \'bg_core');

Object.entries(colorMap).forEach(([oldColor, newColor]) => {
  const regex = new RegExp(oldColor, 'gi');
  content = content.replace(regex, newColor);
});

// Fix platform gradient that was hardcoded
content = content.replace(/stop-color="[^"]+"/gi, (match) => {
  for (const [oldC, newC] of Object.entries(colorMap)) {
      if (match.includes(oldC)) return `stop-color="${newC}"`;
  }
  return match; // fallback
});

fs.writeFileSync(file, content);
console.log('Palette updated to Catppuccin Mocha successfully.');
