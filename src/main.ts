import Phaser from 'phaser';
import { gameConfig } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { HUDScene } from './scenes/HUDScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { SoundManager } from './managers/SoundManager.js';

const config = {
  ...gameConfig,
  scene: [BootScene, MainMenuScene, GameScene, HUDScene, GameOverScene, PauseScene],
};

let game: Phaser.Game | null = null;

window.addEventListener('load', () => {
  game = new Phaser.Game(config);

  // Global user interaction unlock for suspended Web Audio Contexts
  const unlockAudio = () => {
    SoundManager.init();
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('keydown', unlockAudio);
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    game?.destroy(true);
    game = null;
  });
}
