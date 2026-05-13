import Phaser from 'phaser';
import { gameConfig } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { HUDScene } from './scenes/HUDScene.js';
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

const config = {
  ...gameConfig,
  scene: [BootScene, MainMenuScene, GameScene, HUDScene, GameOverScene],
};

window.addEventListener('load', () => {
  new Phaser.Game(config);
});