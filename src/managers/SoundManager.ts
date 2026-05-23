export class SoundManager {
    public static enabled: boolean = false;
    private static ctx: AudioContext | null = null;
    private static bgmOscillators: OscillatorNode[] = [];
    private static bgmGain: GainNode | null = null;
    private static isBGMPlaying: boolean = false;

    public static init() {
        if (!this.ctx && this.enabled) {
            try {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                this.ctx = new AudioContextClass();
            } catch (e) {
                console.error("Web Audio API not supported", e);
                this.enabled = false;
            }
        }
    }

    public static toggle(level: number = 1) {
        this.enabled = !this.enabled;
        if (this.enabled) {
            this.init();
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            if (!this.isBGMPlaying) {
                this.startBGM(level);
            }
        } else {
            this.stopBGM();
        }
    }

    private static playSweep(
        type: OscillatorType,
        startFreq: number,
        endFreq: number,
        duration: number,
        vol: number = 0.1,
        pan: number = 0,
        adsr?: { attack?: number; decay?: number; sustain?: number; release?: number }
    ) {
        if (!this.enabled || !this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);
        
        // Dynamic ADSR Volume Envelope
        const now = this.ctx.currentTime;
        const a = (adsr?.attack ?? 0.05) * duration;
        const d = (adsr?.decay ?? 0.15) * duration;
        const s = adsr?.sustain ?? 0.6;
        const r = (adsr?.release ?? 0.2) * duration;

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(vol, now + a);
        gain.gain.exponentialRampToValueAtTime(vol * s, now + a + d);
        
        const releaseStart = now + duration - r;
        gain.gain.setValueAtTime(vol * s, Math.max(now + a + d, releaseStart));
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        
        osc.connect(gain);
        
        // Panning node
        const panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime(pan, now);
        
        gain.connect(panner);
        panner.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + duration);
    }

    private static playNoise(duration: number, vol: number = 0.1, pan: number = 0) {
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
        
        // Simplified ADSR envelope for noise bursts
        const now = this.ctx.currentTime;
        const a = 0.05 * duration;
        const d = 0.15 * duration;
        const s = 0.6;
        const r = 0.3 * duration;

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(vol, now + a);
        gain.gain.exponentialRampToValueAtTime(vol * s, now + a + d);
        
        const releaseStart = now + duration - r;
        gain.gain.setValueAtTime(vol * s, Math.max(now + a + d, releaseStart));
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        
        noise.connect(filter);
        filter.connect(gain);
        
        // Panning node
        const panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime(pan, now);
        
        gain.connect(panner);
        panner.connect(this.ctx.destination);
        
        noise.start(now);
        noise.stop(now + duration);
    }

    /** FM (Frequency Modulation) synthesis sweep for modern digital/futuristic sound effects */
    private static playFMSweep(
        carrierType: OscillatorType,
        modulatorType: OscillatorType,
        carrierFreq: number,
        modulatorFreq: number,
        modulationIndex: number,
        duration: number,
        vol: number = 0.1,
        pan: number = 0,
        adsr?: { attack?: number; decay?: number; sustain?: number; release?: number }
    ) {
        if (!this.enabled || !this.ctx) return;

        const carrier = this.ctx.createOscillator();
        const modulator = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();
        const mainGain = this.ctx.createGain();

        carrier.type = carrierType;
        carrier.frequency.setValueAtTime(carrierFreq, this.ctx.currentTime);

        modulator.type = modulatorType;
        modulator.frequency.setValueAtTime(modulatorFreq, this.ctx.currentTime);

        modGain.gain.setValueAtTime(modulationIndex, this.ctx.currentTime);

        // Cyber frequency sweeps
        carrier.frequency.exponentialRampToValueAtTime(carrierFreq * 0.2, this.ctx.currentTime + duration);
        modulator.frequency.exponentialRampToValueAtTime(modulatorFreq * 0.5, this.ctx.currentTime + duration);

        // Apply ADSR envelope to mainGain
        const now = this.ctx.currentTime;
        const a = (adsr?.attack ?? 0.05) * duration;
        const d = (adsr?.decay ?? 0.15) * duration;
        const s = adsr?.sustain ?? 0.5;
        const r = (adsr?.release ?? 0.2) * duration;

        mainGain.gain.setValueAtTime(0, now);
        mainGain.gain.linearRampToValueAtTime(vol, now + a);
        mainGain.gain.exponentialRampToValueAtTime(vol * s, now + a + d);
        
        const releaseStart = now + duration - r;
        mainGain.gain.setValueAtTime(vol * s, Math.max(now + a + d, releaseStart));
        mainGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        // Connect modulator to modulator gain, and connect modulator gain to carrier frequency
        modulator.connect(modGain);
        modGain.connect(carrier.frequency);

        carrier.connect(mainGain);

        // Panning node
        const panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime(pan, now);
        
        mainGain.connect(panner);
        panner.connect(this.ctx.destination);

        // Start both oscillators
        modulator.start(now);
        carrier.start(now);

        modulator.stop(now + duration);
        carrier.stop(now + duration);
    }

    // --- Procedural BGM ---

    public static startBGM(level: number) {
        this.stopBGM();
        if (!this.enabled || !this.ctx) return;
        
        this.isBGMPlaying = true;
        this.bgmGain = this.ctx.createGain();
        
        // Smooth BGM fade-in to prevent pops
        this.bgmGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.bgmGain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 1.5);
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

    public static playJump(pan: number = 0) {
        // Crisp, clean rising jump sweep
        this.playSweep('triangle', 180, 480, 0.18, 0.06, pan, { attack: 0.05, decay: 0.1, sustain: 0.6 });
    }

    public static playDash(pan: number = 0) {
        // Soft wind-like dash swoosh
        this.playNoise(0.2, 0.06, pan);
        this.playFMSweep('sine', 'triangle', 250, 80, 150, 0.2, 0.04, pan, { attack: 0.1, decay: 0.1, sustain: 0.3 });
    }

    public static playSwing(pan: number = 0) {
        // Crisp wooden-slash swoosh
        this.playNoise(0.06, 0.02, pan);
        this.playFMSweep('sine', 'triangle', 440, 150, 180, 0.08, 0.03, pan, { attack: 0.03, decay: 0.05, sustain: 0.3 });
    }

    public static playHit(pan: number = 0) {
        // Crisp tactile wooden chop impact
        this.playNoise(0.08, 0.05, pan);
        this.playFMSweep('triangle', 'sine', 300, 600, 200, 0.12, 0.08, pan, { attack: 0.01, decay: 0.08, sustain: 0.2 });
    }

    public static playParry(pan: number = 0) {
        // Gorgeous pure crystal bell-like parry chime
        this.playSweep('sine', 1600, 1600, 0.3, 0.12, pan, { attack: 0.005, decay: 0.2, sustain: 0.1, release: 0.2 });
        this.playSweep('sine', 1200, 1200, 0.2, 0.06, pan, { attack: 0.005, decay: 0.15, sustain: 0.1, release: 0.15 });
    }

    public static playDamage(pan: number = 0) {
        // Soft thud alert chime
        this.playNoise(0.2, 0.08, pan);
        this.playFMSweep('triangle', 'sine', 180, 90, 300, 0.25, 0.1, pan, { attack: 0.05, decay: 0.15, sustain: 0.4 });
    }

    public static playHadouken(pan: number = 0) {
        // Breezy plasma wind release
        this.playFMSweep('sine', 'sine', 220, 440, 200, 0.32, 0.06, pan, { attack: 0.12, decay: 0.1, sustain: 0.4 });
        this.playNoise(0.2, 0.05, pan);
    }

    public static playMenuBlip() {
        // Ultra crisp high-frequency synth click
        this.playSweep('sine', 1100, 1200, 0.04, 0.05, 0, { attack: 0.01, decay: 0.03, sustain: 0.5 });
    }
}
