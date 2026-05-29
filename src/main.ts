import Phaser from 'phaser';
import { gameConfig } from './config.js';
import { BootScene } from './scenes/BootScene.js';

import { MainMenuScene } from './scenes/MainMenuScene.js';
import { SoundManager } from './managers/SoundManager.js';

const config = {
  ...gameConfig,
  scene: [BootScene, MainMenuScene],
};

let game: Phaser.Game | null = null;

const exposeTestHooks = () => {
  if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
    window.Phaser = Phaser;
    if (game) window.game = game;
  }
};

const unlockAudio = () => {
  SoundManager.init();
  window.removeEventListener('click', unlockAudio);
  window.removeEventListener('keydown', unlockAudio);
};

window.addEventListener('load', () => {
  game = new Phaser.Game(config);
  exposeTestHooks();

  // Global user interaction unlock for suspended Web Audio Contexts
  window.addEventListener('click', unlockAudio);
  window.addEventListener('keydown', unlockAudio);
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    game?.destroy(true);
    game = null;
    delete window.game;
    Reflect.deleteProperty(window, 'Phaser');
  });
}
