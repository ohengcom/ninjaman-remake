import { describe, it, expect } from 'vitest';
import { calculateSPEarned } from './ScoreHelper';

describe('ScoreHelper - calculateSPEarned', () => {
    it('awards 1 SP from 450 to 600', () => {
        expect(calculateSPEarned(450, 600, 500)).toBe(1);
    });

    it('awards 2 SP from 450 to 1100', () => {
        expect(calculateSPEarned(450, 1100, 500)).toBe(2);
    });

    it('awards 0 SP from 450 to 499', () => {
        expect(calculateSPEarned(450, 499, 500)).toBe(0);
    });

    it('awards 1 SP from 0 to 500', () => {
        expect(calculateSPEarned(0, 500, 500)).toBe(1);
    });

    it('handles negative jumps (no negative SP)', () => {
        expect(calculateSPEarned(600, 400, 500)).toBe(0);
    });
});
