import Phaser from 'phaser';

export class SoundManager {
    public static enabled: boolean = false;
    private static soundManager: Phaser.Sound.BaseSoundManager | null = null;
    private static activeBGM: Phaser.Sound.BaseSound | null = null;

    /**
     * Bind the Phaser Sound Manager to this class.
     * Called once from BootScene or MainMenuScene.
     */
    public static setSoundManager(sound: Phaser.Sound.BaseSoundManager) {
        this.soundManager = sound;
    }

    public static init() {
        // Keeps the same signature for compatibility with main.ts, but handled dynamically in Phaser
    }

    public static toggle(level: number = 1) {
        this.enabled = !this.enabled;
        
        if (this.soundManager) {
            // Mute/unmute all sounds globally
            this.soundManager.mute = !this.enabled;
        }

        if (this.enabled) {
            if (!this.activeBGM || !this.activeBGM.isPlaying) {
                this.startBGM(level);
            }
        } else {
            this.stopBGM();
        }
    }

    // --- BGM Loops ---

    public static startBGM(level: number) {
        this.stopBGM();
        if (!this.enabled || !this.soundManager) return;

        // Map sector/level to BGM keys
        let bgmKey = 'bgm_sector1';
        if (level === 2) {
            bgmKey = 'bgm_sector2';
        } else if (level === 3) {
            bgmKey = 'bgm_sector3';
        }

        try {
            // Play with a soft, cinematic background volume that loops perfectly
            this.activeBGM = this.soundManager.add(bgmKey, {
                loop: true,
                volume: 0.2
            });
            this.activeBGM.play();
        } catch (e) {
            console.error("Failed to play BGM:", bgmKey, e);
        }
    }

    public static stopBGM() {
        if (this.activeBGM) {
            try {
                this.activeBGM.stop();
                this.activeBGM.destroy();
            } catch (e) {}
            this.activeBGM = null;
        }
    }

    // --- Sound Effects with Panning and Volume ---

    private static playSFX(key: string, pan: number = 0, volume: number = 0.5) {
        if (!this.enabled || !this.soundManager) return;
        try {
            // Native Phaser Sound engine supports Web Audio panning out of the box
            this.soundManager.play(key, {
                pan: Math.max(-1, Math.min(1, pan)),
                volume: volume
            });
        } catch (e) {
            console.warn(`Failed to play SFX ${key}:`, e);
        }
    }

    public static playJump(pan: number = 0) {
        this.playSFX('snd_jump', pan, 0.45);
    }

    public static playDash(pan: number = 0) {
        this.playSFX('snd_dash', pan, 0.55);
    }

    public static playSwing(pan: number = 0) {
        this.playSFX('snd_swing', pan, 0.35);
    }

    public static playHit(pan: number = 0) {
        this.playSFX('snd_hit', pan, 0.5);
    }

    public static playParry(pan: number = 0) {
        this.playSFX('snd_parry', pan, 0.6);
    }

    public static playDamage(pan: number = 0) {
        this.playSFX('snd_damage', pan, 0.65);
    }

    public static playHadouken(pan: number = 0) {
        this.playSFX('snd_hadouken', pan, 0.5);
    }

    public static playShoot(pan: number = 0) {
        // High quality futuristic arrow/laser release sound for the mechanical sniper
        this.playSFX('snd_shoot', pan, 0.55);
    }

    public static playMenuBlip() {
        this.playSFX('snd_menu_blip', 0, 0.4);
    }
}
