import Phaser from 'phaser';
import { createGameConfig } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { GameScene } from './scenes/GameScene.js';
import { HudScene } from './scenes/HudScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { WinScene } from './scenes/WinScene.js';

const config = createGameConfig([
  BootScene,
  TitleScene,
  GameScene,
  HudScene,
  GameOverScene,
  WinScene,
]);

const game = new Phaser.Game(config);

// Phaser's Scale Manager `FIT` mode handles responsive sizing automatically,
// but we still trigger a refresh on orientation/resize.
const refresh = (): void => game.scale.refresh();
window.addEventListener('resize', refresh);
window.addEventListener('orientationchange', refresh);
