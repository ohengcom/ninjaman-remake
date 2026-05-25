import Phaser from 'phaser';
import { gameConfig } from './config.js';
import { BootScene } from './scenes/BootScene.js';

(window as any).Phaser = Phaser;
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { SoundManager } from './managers/SoundManager.js';

const config = {
  ...gameConfig,
  scene: [BootScene, MainMenuScene],
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
