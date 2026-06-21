import Phaser from 'phaser';
import { GAME_EVENTS, type GameEventMap } from '../events.js';

type EventName = typeof GAME_EVENTS[keyof typeof GAME_EVENTS];
type EventHandler<K extends EventName> = (...args: GameEventMap[K]) => void;

/**
 * Type-safe wrapper around Phaser's string-based event emitter.
 *
 * Mirrors Godot's typed `signal` declarations: each event name carries a
 * fixed argument tuple, and emit/on are checked at compile time.
 *
 * Usage:
 *   const bus = new TypedEventBus(scene.events);
 *   bus.on(GAME_EVENTS.UPDATE_HEALTH, (hp, max) => ...);  // typed args
 *   bus.emit(GAME_EVENTS.UPDATE_SCORE, 42);                // typed payload
 */
export class TypedEventBus {
    constructor(private emitter: Phaser.Events.EventEmitter) {}

    on<K extends EventName>(event: K, handler: EventHandler<K>, context?: unknown): this {
        this.emitter.on(event, handler as (...args: unknown[]) => void, context);
        return this;
    }

    once<K extends EventName>(event: K, handler: EventHandler<K>, context?: unknown): this {
        this.emitter.once(event, handler as (...args: unknown[]) => void, context);
        return this;
    }

    off<K extends EventName>(event: K, handler?: EventHandler<K>, context?: unknown): this {
        this.emitter.off(event, handler as (...args: unknown[]) => void | undefined, context);
        return this;
    }

    emit<K extends EventName>(event: K, ...args: GameEventMap[K]): boolean {
        return this.emitter.emit(event, ...args);
    }

    removeAllListeners<K extends EventName>(event?: K): this {
        this.emitter.removeAllListeners(event);
        return this;
    }
}

/** Re-export event constants for convenience. */
export { GAME_EVENTS };
export type { GameEventMap };
