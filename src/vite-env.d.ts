/// <reference types="vite/client" />

import type Phaser from 'phaser';

declare global {
  interface Window {
    game?: Phaser.Game;
    Phaser?: typeof Phaser;
  }
}

export {};
