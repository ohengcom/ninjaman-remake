export class SoundManager {
    public static enabled: boolean = false;
    private static ctx: AudioContext | null = null;
    private static bgmOscillators: OscillatorNode[] = [];
    private static bgmGain: GainNode | null = null;
    private static isBGMPlaying: boolean = false;

    public static init() {
        if (!this.ctx && this.enabled) {
            try {
                this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (e) {
                console.error("Web Audio API not supported", e);
                this.enabled = false;
            }
        }
    }

    public static toggle() {
        this.enabled = !this.enabled;
        if (this.enabled) {
            this.init();
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            if (!this.isBGMPlaying) {
                this.startBGM(1); // Default to level 1 BGM on toggle
            }
        } else {
            this.stopBGM();
        }
    }

    private static playSweep(type: OscillatorType, startFreq: number, endFreq: number, duration: number, vol: number = 0.1) {
        if (!this.enabled || !this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);
        
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    private static playNoise(duration: number, vol: number = 0.1) {
        if (!this.enabled || !this.ctx) return;
        
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        noise.start();
    }

    // --- Procedural BGM ---

    public static startBGM(level: number) {
        this.stopBGM();
        if (!this.enabled || !this.ctx) return;
        
        this.isBGMPlaying = true;
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.value = 0.05; // Low volume for BGM
        this.bgmGain.connect(this.ctx.destination);

        const baseFreq = level === 3 ? 65 : (level === 2 ? 82 : 55); // Different root note per sector

        // Drone
        const drone = this.ctx.createOscillator();
        drone.type = 'sawtooth';
        drone.frequency.value = baseFreq;
        drone.connect(this.bgmGain);
        drone.start();
        this.bgmOscillators.push(drone);

        // Sub
        const sub = this.ctx.createOscillator();
        sub.type = 'square';
        sub.frequency.value = baseFreq / 2;
        sub.connect(this.bgmGain);
        sub.start();
        this.bgmOscillators.push(sub);
        
        // Simple LFO for drone filter
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.5; // 0.5 Hz
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 200;
        
        lfo.connect(lfoGain);
        lfoGain.connect(filter.detune);
        lfo.start();
        this.bgmOscillators.push(lfo);
        
        drone.disconnect();
        drone.connect(filter);
        filter.connect(this.bgmGain);
    }

    public static stopBGM() {
        this.isBGMPlaying = false;
        this.bgmOscillators.forEach(osc => {
            try { osc.stop(); osc.disconnect(); } catch (e) {}
        });
        this.bgmOscillators = [];
        if (this.bgmGain) {
            this.bgmGain.disconnect();
            this.bgmGain = null;
        }
    }

    // --- Specific Sound Effects ---

    public static playJump() {
        this.playSweep('square', 150, 400, 0.2, 0.05);
    }

    public static playDash() {
        this.playNoise(0.3, 0.15);
        this.playSweep('sine', 400, 100, 0.3, 0.1);
    }

    public static playSwing() {
        this.playNoise(0.1, 0.05);
        this.playSweep('triangle', 600, 200, 0.1, 0.1);
    }

    public static playHit() {
        this.playNoise(0.15, 0.2);
        this.playSweep('sawtooth', 200, 50, 0.15, 0.2);
    }

    public static playParry() {
        this.playSweep('sine', 1200, 2000, 0.1, 0.3);
        this.playSweep('square', 800, 1600, 0.1, 0.1);
    }

    public static playDamage() {
        this.playNoise(0.3, 0.3);
        this.playSweep('sawtooth', 150, 40, 0.3, 0.3);
    }

    public static playHadouken() {
        this.playSweep('sawtooth', 300, 800, 0.3, 0.1);
        this.playNoise(0.2, 0.1);
    }

    public static playMenuBlip() {
        this.playSweep('square', 800, 900, 0.05, 0.05);
    }
}
