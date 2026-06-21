import { TypedEventBus, GAME_EVENTS } from './TypedEventBus.js';

/** Minimal EventEmitter stub mimicking Phaser.Events.EventEmitter surface. */
function makeStubEmitter() {
  const listeners = new Map<string, Array<(...args: unknown[]) => void>>();
  const stub = {
    on(event: string, fn: (...args: unknown[]) => void) {
      const arr = listeners.get(event) ?? [];
      arr.push(fn);
      listeners.set(event, arr);
      return stub;
    },
    once(event: string, fn: (...args: unknown[]) => void) {
      const wrap = (...args: unknown[]) => {
        stub.off(event, wrap);
        fn(...args);
      };
      return stub.on(event, wrap);
    },
    off(event: string, fn?: (...args: unknown[]) => void) {
      if (!fn) listeners.delete(event);
      else {
        const arr = listeners.get(event) ?? [];
        listeners.set(event, arr.filter((f) => f !== fn));
      }
      return stub;
    },
    emit(event: string, ...args: unknown[]) {
      const arr = listeners.get(event) ?? [];
      for (const fn of [...arr]) fn(...args);
      return arr.length > 0;
    },
    removeAllListeners(event?: string) {
      if (event) listeners.delete(event);
      else listeners.clear();
      return stub;
    },
  };
  return stub as unknown as Phaser.Events.EventEmitter;
}

describe('TypedEventBus', () => {
  it('delivers typed payloads to handlers', () => {
    const emitter = makeStubEmitter();
    const bus = new TypedEventBus(emitter);
    const received: Array<[number, number]> = [];

    bus.on(GAME_EVENTS.UPDATE_HEALTH, (hp, max) => {
      received.push([hp, max]);
    });
    bus.emit(GAME_EVENTS.UPDATE_HEALTH, 80, 100);

    expect(received).toEqual([[80, 100]]);
  });

  it('returns whether handlers were invoked from emit', () => {
    const emitter = makeStubEmitter();
    const bus = new TypedEventBus(emitter);

    expect(bus.emit(GAME_EVENTS.UPDATE_SCORE, 1)).toBe(false);

    bus.on(GAME_EVENTS.UPDATE_SCORE, () => {});
    expect(bus.emit(GAME_EVENTS.UPDATE_SCORE, 2)).toBe(true);
  });

  it('supports once semantics', () => {
    const emitter = makeStubEmitter();
    const bus = new TypedEventBus(emitter);
    let count = 0;

    bus.once(GAME_EVENTS.UPDATE_STYLE, () => {
      count += 1;
    });
    bus.emit(GAME_EVENTS.UPDATE_STYLE, 'A');
    bus.emit(GAME_EVENTS.UPDATE_STYLE, 'S');

    expect(count).toBe(1);
  });

  it('removes a specific handler via off', () => {
    const emitter = makeStubEmitter();
    const bus = new TypedEventBus(emitter);
    let calls = 0;
    const handler = () => {
      calls += 1;
    };

    bus.on(GAME_EVENTS.PLAYER_DEAD, handler);
    bus.emit(GAME_EVENTS.PLAYER_DEAD);
    bus.off(GAME_EVENTS.PLAYER_DEAD, handler);
    bus.emit(GAME_EVENTS.PLAYER_DEAD);

    expect(calls).toBe(1);
  });

  it('removes all listeners for an event', () => {
    const emitter = makeStubEmitter();
    const bus = new TypedEventBus(emitter);

    bus.on(GAME_EVENTS.UPDATE_LEVEL, () => {});
    bus.on(GAME_EVENTS.UPDATE_LEVEL, () => {});
    bus.removeAllListeners(GAME_EVENTS.UPDATE_LEVEL);

    expect(bus.emit(GAME_EVENTS.UPDATE_LEVEL, 2)).toBe(false);
  });
});
