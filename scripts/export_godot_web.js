import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const godotProject = resolve(projectRoot, 'godot');
const output = resolve(godotProject, 'build', 'web', 'index.html');
const defaultWindowsGodot = 'C:\\Users\\lixia\\AppData\\Local\\Microsoft\\WinGet\\Packages\\GodotEngine.GodotEngine_Microsoft.Winget.Source_8wekyb3d8bbwe\\Godot_v4.6.3-stable_win64_console.exe';
const godotBin = process.env.GODOT_BIN || (existsSync(defaultWindowsGodot) ? defaultWindowsGodot : 'godot');

mkdirSync(dirname(output), { recursive: true });

const result = spawnSync(godotBin, [
  '--headless',
  '--path',
  godotProject,
  '--export-release',
  'Web',
  output,
], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

if (result.status !== 0) {
  console.error('\nGodot Web export failed. If the error mentions missing export templates, install the Godot 4.6.3 Web export templates from the Godot Editor export template manager, then rerun `npm run build:godot:web`.');
}

if (result.status === 0 && existsSync(output)) {
  const html = readFileSync(output, 'utf8');
  const polished = html
    .replace('<title>Ninja Man Godot Prototype</title>', '<title>Ninja Man Godot Prototype - Web Test</title>')
    .replace('</head>', `<style>
      body { background: radial-gradient(circle at 50% 20%, #15314a 0, #050711 48%, #02030a 100%); color: #d8f6ff; font-family: system-ui, Segoe UI, sans-serif; }
      #godot-loading-note { position: fixed; left: 50%; top: 22px; transform: translateX(-50%); z-index: 20; max-width: min(760px, calc(100vw - 32px)); padding: 12px 18px; border: 1px solid rgba(120, 220, 255, .25); border-radius: 14px; background: rgba(4, 9, 18, .72); box-shadow: 0 18px 54px rgba(0, 0, 0, .45); text-align: center; color: #d8f6ff; backdrop-filter: blur(8px); }
      #godot-loading-note strong { color: #74e7ff; }
      #godot-loading-note small { display: block; margin-top: 4px; color: rgba(216, 246, 255, .72); }
      canvas { image-rendering: pixelated; }
    </style></head>`)
    .replace('<body>', `<body><div id="godot-loading-note"><strong>Ninja Man Godot Prototype</strong><small>Loading WebAssembly build. Click the game once if keyboard controls do not respond. Desktop Chrome/Edge recommended.</small></div>`)
    .replace('</body>', `<script>window.addEventListener('load', () => setTimeout(() => document.getElementById('godot-loading-note')?.remove(), 6500));</script></body>`);
  writeFileSync(output, polished);
}

process.exit(result.status ?? 1);
