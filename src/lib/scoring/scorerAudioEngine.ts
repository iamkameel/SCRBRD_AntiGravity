/**
 * Scorer Audio Engine - Web Audio Synthesizer & Web Speech API Synthesizer
 * 100% Client-side, zero external assets, instant zero-latency feedback
 */

class ScorerAudioEngine {
    private audioCtx: AudioContext | null = null;
    private soundMuted: boolean = false;
    private ttsEnabled: boolean = true;

    private getContext(): AudioContext | null {
        if (typeof window === 'undefined') return null;
        if (!this.audioCtx) {
            const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (AudioContextClass) {
                this.audioCtx = new AudioContextClass();
            }
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        return this.audioCtx;
    }

    public setMuted(muted: boolean) {
        this.soundMuted = muted;
    }

    public isMuted(): boolean {
        return this.soundMuted;
    }

    public setTtsEnabled(enabled: boolean) {
        this.ttsEnabled = enabled;
    }

    public isTtsEnabled(): boolean {
        return this.ttsEnabled;
    }

    /**
     * Crisp acoustic bat crack sound
     */
    public playBatHit(quality: 'solid' | 'edge' | 'mishit' = 'solid') {
        if (this.soundMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        const now = ctx.currentTime;

        const startFreq = quality === 'solid' ? 750 : quality === 'edge' ? 1200 : 400;
        osc.type = quality === 'solid' ? 'triangle' : 'sawtooth';
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(quality === 'solid' ? 950 : 1600, now);
        filter.Q.setValueAtTime(3.5, now);

        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    /**
     * Ascending celebration sound for a FOUR boundary
     */
    public playFourCheer() {
        if (this.soundMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        this.playBatHit('solid');

        const now = ctx.currentTime + 0.05;
        const notes = [330, 440, 554, 659];

        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const noteTime = now + idx * 0.07;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteTime);

            gain.gain.setValueAtTime(0, noteTime);
            gain.gain.linearRampToValueAtTime(0.25, noteTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.28);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(noteTime);
            osc.stop(noteTime + 0.3);
        });
    }

    /**
     * Deep powerful chord + shimmer for a massive SIX
     */
    public playSixExplosion() {
        if (this.soundMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        this.playBatHit('solid');

        const now = ctx.currentTime + 0.04;

        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(140, now);
        subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.4);

        subGain.gain.setValueAtTime(0.6, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        subOsc.connect(subGain);
        subGain.connect(ctx.destination);
        subOsc.start(now);
        subOsc.stop(now + 0.45);

        [440, 554.37, 659.25, 880].forEach((f, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const st = now + 0.03 * i;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, st);

            gain.gain.setValueAtTime(0, st);
            gain.gain.linearRampToValueAtTime(0.2, st + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, st + 0.5);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(st);
            osc.stop(st + 0.55);
        });
    }

    /**
     * Dramatic wicket siren
     */
    public playWicketSiren() {
        if (this.soundMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.linearRampToValueAtTime(440, now + 0.18);
        osc.frequency.linearRampToValueAtTime(880, now + 0.36);
        osc.frequency.linearRampToValueAtTime(220, now + 0.6);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.68);
    }

    /**
     * Subtle dot ball acoustic tap
     */
    public playDotTap() {
        if (this.soundMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.03);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    /**
     * Browser Text-to-Speech Commentary synthesizer
     */
    public speakCommentary(text: string, rate: number = 1.05, pitch: number = 1.0) {
        if (!this.ttsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
            return;
        }

        try {
            const cleanText = text.replace(/\[.*?\]/g, '').replace(/[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/gu, '').trim();
            if (!cleanText) return;

            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.rate = rate;
            utterance.pitch = pitch;

            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => (v.lang.startsWith('en-GB') || v.lang.startsWith('en-ZA') || v.lang.startsWith('en-US')) && !v.name.includes('Google') === false) || voices.find(v => v.lang.startsWith('en'));

            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            window.speechSynthesis.speak(utterance);
        } catch {
            // Graceful fallback
        }
    }

    public stopSpeech() {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }
}

export const scorerAudio = new ScorerAudioEngine();
