export interface SaveData {
  score: number;
  sp: number; // Skill Points
  maxHealth: number;
  unlockedLevel: number;
  comboLevel: number; // 1 = 2 hits, 2 = 3 hits, 3 = 4 hits
  dashInvincible: boolean;
}

export class SaveManager {
  private static readonly SAVE_KEY = 'ninjaman_save_data';

  public static load(): SaveData {
    const raw = localStorage.getItem(this.SAVE_KEY);
    if (raw) {
      try {
        const decoded = atob(raw);
        const data = JSON.parse(decoded) as SaveData;
        // Migration logic for old saves
        if (data.comboLevel === undefined) data.comboLevel = 1;
        if (data.dashInvincible === undefined) data.dashInvincible = false;
        return data;
      } catch (e) {
        console.error("Failed to parse save data. Loading defaults.", e);
      }
    }
    
    // Defaults
    return {
      score: 0,
      sp: 0,
      maxHealth: 100,
      unlockedLevel: 1,
      comboLevel: 1,
      dashInvincible: false
    };
  }

  public static save(data: SaveData) {
    try {
      const encoded = btoa(JSON.stringify(data));
      localStorage.setItem(this.SAVE_KEY, encoded);
    } catch (e) {
      console.error("Failed to save data.", e);
    }
  }

  public static updateScoreAndSp(scoreToAdd: number, spToAdd: number) {
    const data = this.load();
    data.score += scoreToAdd;
    data.sp += spToAdd;
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

  public static upgradeCombo(cost: number): boolean {
    const data = this.load();
    if (data.sp >= cost && data.comboLevel < 3) {
      data.sp -= cost;
      data.comboLevel++;
      this.save(data);
      return true;
    }
    return false;
  }

  public static unlockDashInvincibility(cost: number): boolean {
    const data = this.load();
    if (data.sp >= cost && !data.dashInvincible) {
      data.sp -= cost;
      data.dashInvincible = true;
      this.save(data);
      return true;
    }
    return false;
  }
}

