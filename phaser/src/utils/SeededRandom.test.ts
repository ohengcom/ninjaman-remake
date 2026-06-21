import { SeededRandom } from './SeededRandom.js';

describe('SeededRandom', () => {
  it('produces deterministic sequences', () => {
    const a = new SeededRandom(42);
    const b = new SeededRandom(42);

    const seqA = Array.from({ length: 10 }, () => a.next());
    const seqB = Array.from({ length: 10 }, () => b.next());

    expect(seqA).toEqual(seqB);
  });

  it('produces values in [0, 1)', () => {
    const rng = new SeededRandom(123);
    for (let i = 0; i < 100; i++) {
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('nextInt returns integers in [min, max)', () => {
    const rng = new SeededRandom(999);
    for (let i = 0; i < 50; i++) {
      const v = rng.nextInt(5, 10);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThan(10);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it('pick returns elements from the array', () => {
    const rng = new SeededRandom(7);
    const arr = ['a', 'b', 'c'] as const;
    for (let i = 0; i < 20; i++) {
      expect(arr).toContain(rng.pick(arr));
    }
  });

  it('throws for invalid ranges and empty picks', () => {
    const rng = new SeededRandom(1);
    expect(() => rng.nextInt(5, 5)).toThrow(RangeError);
    expect(() => rng.pick([])).toThrow(RangeError);
  });
});
