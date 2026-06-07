import { existsSync, mkdirSync } from 'node:fs';
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

process.exit(result.status ?? 1);
