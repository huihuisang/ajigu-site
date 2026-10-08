const frequencies = [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88];

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

export class ToneEngine {
  private audio: AudioContext | null = null;
  private active = false;
  private generation = 0;
  private oscillators = new Set<OscillatorNode>();

  async toggle(): Promise<boolean> {
    if (this.active) {
      this.mute();
      return false;
    }
    const generation = ++this.generation;
    const Audio = window.AudioContext || (window as AudioWindow).webkitAudioContext;
    if (!Audio) return false;
    try {
      this.audio ??= new Audio();
      await this.audio.resume();
      if (generation !== this.generation || document.hidden) {
        await this.audio.suspend();
        return false;
      }
      this.active = this.audio.state === "running";
    } catch {
      this.active = false;
    }
    return this.active;
  }

  play(note: number): void {
    const audio = this.audio;
    if (!this.active || !audio || audio.state !== "running" || document.hidden) return;
    const frequency = frequencies[note - 1];
    if (!frequency) return;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, audio.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, audio.currentTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.36);
    oscillator.connect(gain).connect(audio.destination);
    this.oscillators.add(oscillator);
    oscillator.onended = () => {
      this.oscillators.delete(oscillator);
      oscillator.disconnect();
      gain.disconnect();
    };
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.4);
  }

  mute(): void {
    ++this.generation;
    this.active = false;
    void this.audio?.suspend().catch(() => {});
  }

  dispose(): void {
    this.mute();
    for (const oscillator of this.oscillators) {
      try {
        oscillator.stop();
      } catch {}
    }
    this.oscillators.clear();
    void this.audio?.close().catch(() => {});
  }
}
