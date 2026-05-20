import Phaser from 'phaser';
import { gameConfig } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { HUDScene } from './scenes/HUDScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { PauseScene } from './scenes/PauseScene.js';

const config = {
  ...gameConfig,
  scene: [BootScene, MainMenuScene, GameScene, HUDScene, GameOverScene, PauseScene],
};

let game: Phaser.Game | null = null;

window.addEventListener('load', () => {
  game = new Phaser.Game(config);
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    game?.destroy(true);
    game = null;
  });
}
