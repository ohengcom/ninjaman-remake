import Phaser from 'phaser';
import { gameConfig } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { registerAnimations } from './animations/AnimationDefs.js';

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
    window.startGameForTests = async () => {
      if (!game) throw new Error('Game is not initialized');
      const scenePlugin = game.scene;

      if (!scenePlugin.getScene('GameScene')) {
        const [
          { GameScene },
          { HUDScene },
          { GameOverScene },
          { PauseScene },
        ] = await Promise.all([
          import('./scenes/GameScene.js'),
          import('./scenes/HUDScene.js'),
          import('./scenes/GameOverScene.js'),
          import('./scenes/PauseScene.js'),
        ]);
        scenePlugin.add('GameScene', GameScene, false);
        scenePlugin.add('HUDScene', HUDScene, false);
        scenePlugin.add('GameOverScene', GameOverScene, false);
        scenePlugin.add('PauseScene', PauseScene, false);
      }

      const bootScene = scenePlugin.getScene('BootScene');
      if (bootScene && !game.anims.exists('player_idle')) {
        registerAnimations(bootScene);
      }

      scenePlugin.stop('MainMenuScene');
      scenePlugin.start('GameScene', { level: 1 });
    };
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
    delete window.startGameForTests;
    Reflect.deleteProperty(window, 'Phaser');
  });
}
