import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sfxDir = path.resolve(__dirname, '../public/assets/audio/SoundEffects');
const outputDir = path.resolve(__dirname, '../public/assets/audio');

console.log('--- Audio Sprite Generator ---');
console.log('This script requires FFmpeg to be installed on your system.');

// Verify ffmpeg is installed
try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
} catch (e) {
    console.error('ERROR: FFmpeg is not installed or not in PATH.');
    console.error('Please install FFmpeg (https://ffmpeg.org/download.html) and try again.');
    process.exit(1);
}

// Ensure audiosprite is available
try {
    execSync('npx audiosprite --version', { stdio: 'ignore' });
} catch (e) {
    console.log('Installing audiosprite globally via npx...');
}

const inputFiles = fs.readdirSync(sfxDir)
    .filter(f => f.endsWith('.mp3') || f.endsWith('.wav'))
    .map(f => path.join(sfxDir, f));

if (inputFiles.length === 0) {
    console.log('No audio files found in', sfxDir);
    process.exit(0);
}

console.log(`Found ${inputFiles.length} sound effects. Generating Audio Sprite...`);

const outputName = path.join(outputDir, 'sfx_sprite');
const command = `npx audiosprite --output ${outputName} --export mp3,ogg --format phaser3 ${inputFiles.join(' ')}`;

try {
    execSync(command, { stdio: 'inherit' });
    console.log('\nSuccess! Audio sprite generated at:', outputName);
    console.log('You can now update manifest.ts and SoundManager.ts to use the new sprite.');
} catch (e) {
    console.error('Failed to generate audio sprite:', e);
}
