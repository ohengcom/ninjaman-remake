import { MAX_LEVEL } from '../config/levels.js';

export interface SaveData {
  highScore: number;
  sp: number; // Skill Points
  maxHealth: number;
  unlockedLevel: number;
}

const DEFAULTS: SaveData = {
  highScore: 0,
  sp: 0,
  maxHealth: 100,
  unlockedLevel: 1,
};

const toFiniteNumber = (value: unknown, fallback: number, min: number = 0): number => {
  return typeof value === 'number' && Number.isFinite(value) && value >= min ? value : fallback;
};

const sanitizeSaveData = (data: Partial<SaveData>): SaveData => ({
  highScore: toFiniteNumber(data.highScore, DEFAULTS.highScore),
  sp: toFiniteNumber(data.sp, DEFAULTS.sp),
  maxHealth: toFiniteNumber(data.maxHealth, DEFAULTS.maxHealth, 1),
  unlockedLevel: Math.min(MAX_LEVEL, toFiniteNumber(data.unlockedLevel, DEFAULTS.unlockedLevel, 1)),
});

export class SaveManager {
  private static readonly SAVE_KEY = 'ninjaman_save_data';

  public static load(): SaveData {
    try {
      const raw = localStorage.getItem(this.SAVE_KEY);
      if (raw) {
        const decoded = atob(raw);
        const data = JSON.parse(decoded) as Partial<SaveData>;
        // Merge with defaults to handle missing fields from old saves
        return sanitizeSaveData({ ...DEFAULTS, ...data });
      }
    } catch (e) {
      console.error("Failed to load save data. Loading defaults.", e);
    }
    return { ...DEFAULTS };
  }

  public static save(data: SaveData) {
    try {
      const encoded = btoa(JSON.stringify(data));
      localStorage.setItem(this.SAVE_KEY, encoded);
    } catch (e) {
      console.error("Failed to save data.", e);
    }
  }

  /** Update high score if the current run score exceeds it */
  public static updateHighScore(runScore: number) {
    const data = this.load();
    if (runScore > data.highScore) {
      data.highScore = runScore;
      this.save(data);
    }
  }

  /** Award SP (e.g., for level completion, death, milestones) */
  public static addSP(amount: number) {
    const data = this.load();
    data.sp += amount;
    this.save(data);
  }

  public static updateLevel(level: number) {
    const data = this.load();
    if (level > data.unlockedLevel) {
      data.unlockedLevel = level;
      this.save(data);
    }
  }

  public static upgradeHealth(amount: number, cost: number): boolean {
    const data = this.load();
    if (data.sp >= cost) {
      data.sp -= cost;
      data.maxHealth += amount;
      this.save(data);
      return true;
    }
    return false;
  }

}
