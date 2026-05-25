import { SaveManager } from '../managers/SaveManager.js';

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// btoa/atob are available in Node 16+ globally, no polyfill needed for tests

describe('SaveManager', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('returns defaults when no save exists', () => {
    const data = SaveManager.load();
    expect(data.highScore).toBe(0);
    expect(data.sp).toBe(0);
    expect(data.maxHealth).toBe(100);
    expect(data.unlockedLevel).toBe(1);
  });

  it('persists and loads data correctly', () => {
    SaveManager.addSP(5);
    const data = SaveManager.load();
    expect(data.sp).toBe(5);
  });

  it('updates high score only when higher', () => {
    SaveManager.updateHighScore(500);
    expect(SaveManager.load().highScore).toBe(500);

    SaveManager.updateHighScore(300);
    expect(SaveManager.load().highScore).toBe(500); // unchanged

    SaveManager.updateHighScore(1000);
    expect(SaveManager.load().highScore).toBe(1000);
  });

  it('upgrades health when SP is sufficient', () => {
    SaveManager.addSP(3);
    expect(SaveManager.upgradeHealth(20, 1)).toBe(true);
    const data = SaveManager.load();
    expect(data.maxHealth).toBe(120);
    expect(data.sp).toBe(2);
  });

  it('rejects upgrade when SP is insufficient', () => {
    expect(SaveManager.upgradeHealth(20, 1)).toBe(false);
    expect(SaveManager.load().maxHealth).toBe(100);
  });

  it('merges defaults for old save data missing fields', () => {
    // Simulate old save without highScore field
    const oldData = { sp: 10, maxHealth: 150, unlockedLevel: 2 };
    const encoded = btoa(JSON.stringify(oldData));
    localStorageMock.setItem('ninjaman_save_data', encoded);

    const data = SaveManager.load();
    expect(data.sp).toBe(10);
    expect(data.maxHealth).toBe(150);
    expect(data.highScore).toBe(0); // merged default
    expect(data.comboLevel).toBe(1); // merged default
  });

  it('falls back to defaults when save data is malformed', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorageMock.setItem('ninjaman_save_data', 'not-valid-base64-json');

    const data = SaveManager.load();
    expect(data).toMatchObject({
      highScore: 0,
      sp: 0,
      maxHealth: 100,
      unlockedLevel: 1,
    });
    consoleError.mockRestore();
  });

  it('sanitizes invalid save field types', () => {
    const badData = {
      highScore: '999',
      sp: -10,
      maxHealth: 0,
      unlockedLevel: 2,
      comboLevel: 99,
      dashInvincible: 'yes',
    };
    localStorageMock.setItem('ninjaman_save_data', btoa(JSON.stringify(badData)));

    const data = SaveManager.load();
    expect(data.highScore).toBe(0);
    expect(data.sp).toBe(0);
    expect(data.maxHealth).toBe(100);
    expect(data.unlockedLevel).toBe(2);
    expect(data.comboLevel).toBe(3);
    expect(data.dashInvincible).toBe(false);
  });
});
