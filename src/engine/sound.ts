class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private tone(freq: number, duration: number, type: OscillatorType = "sine", delay = 0, gainVal = 0.06) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainVal, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playClick() {
    this.tone(520, 0.06, "triangle", 0, 0.035);
  }

  playCoin() {
    this.tone(880, 0.09, "sine", 0, 0.05);
    this.tone(1318, 0.14, "sine", 0.06, 0.05);
  }

  playTravel() {
    this.tone(330, 0.12, "triangle", 0, 0.045);
    this.tone(440, 0.16, "triangle", 0.08, 0.045);
  }

  playCraft() {
    this.tone(523.25, 0.12, "sine", 0, 0.05);
    this.tone(659.25, 0.12, "sine", 0.07, 0.05);
    this.tone(783.99, 0.2, "sine", 0.14, 0.055);
  }

  playAchievement() {
    this.tone(587.33, 0.12, "triangle", 0, 0.06);
    this.tone(739.99, 0.12, "triangle", 0.08, 0.06);
    this.tone(880, 0.14, "triangle", 0.16, 0.06);
    this.tone(1174.66, 0.28, "triangle", 0.24, 0.065);
  }
}

export const soundEngine = new SoundEngine();
