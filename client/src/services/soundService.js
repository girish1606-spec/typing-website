/**
 * Web Audio API Typing Sound Synthesizer
 * Provides crisp, zero-latency mechanical, soft, typewriter, click, minimal, and retro sounds.
 */

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const soundService = {
  /**
   * Play keypress sound based on selected soundType and volume
   */
  playKeyPress(soundType = 'mechanical', volume = 70, isEnabled = true) {
    if (!isEnabled || soundType === 'silent') return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const masterGain = ctx.createGain();
    const gainValue = Math.max(0.01, Math.min(1, (volume / 100) * 0.4));
    masterGain.gain.setValueAtTime(gainValue, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (soundType) {
      case 'mechanical': {
        // Deep tactile 'thock' with low-pass resonance and high transient click
        // Oscillator for bottom-out thock
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'triangle';
        // Random micro-pitch jitter for organic mechanical realism
        const baseFreq = 110 + (Math.random() * 20 - 10);
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.05);

        oscGain.gain.setValueAtTime(1, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.06);

        // Noise click for switch stem snap
        this._playNoiseClick(ctx, masterGain, now, 1200, 0.015, 0.5);
        break;
      }

      case 'soft': {
        // Cushioned membrane / silenced switch sound
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.04);

        oscGain.gain.setValueAtTime(0.6, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }

      case 'click': {
        // Crisp tactile clicky switch (Blue switch style)
        this._playNoiseClick(ctx, masterGain, now, 3500, 0.012, 0.9);

        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.025);

        oscGain.gain.setValueAtTime(0.4, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.025);

        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.025);
        break;
      }

      case 'typewriter': {
        // Vintage heavy metallic clack
        this._playNoiseClick(ctx, masterGain, now, 1800, 0.03, 1.0);

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const strikeGain = ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(320, now);
        osc2.frequency.setValueAtTime(160, now);
        osc1.frequency.exponentialRampToValueAtTime(80, now + 0.05);

        strikeGain.gain.setValueAtTime(0.8, now);
        strikeGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        osc1.connect(strikeGain);
        osc2.connect(strikeGain);
        strikeGain.connect(masterGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.05);
        osc2.stop(now + 0.05);
        break;
      }

      case 'minimal': {
        // Subtle modern micro-tap
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.018);

        oscGain.gain.setValueAtTime(0.4, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.018);

        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.018);
        break;
      }

      case 'retro': {
        // 8-bit chip blip
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(880, now + 0.015);

        oscGain.gain.setValueAtTime(0.3, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.03);
        break;
      }

      default:
        break;
    }
  },

  /**
   * Helper to generate a filtered noise click
   */
  _playNoiseClick(ctx, outputNode, now, cutoffFreq, duration, volumeMult = 1.0) {
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(cutoffFreq, now);
    filter.Q.setValueAtTime(1.5, now);

    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.5 * volumeMult, now);
    clickGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noiseSource.connect(filter);
    filter.connect(clickGain);
    clickGain.connect(outputNode);

    noiseSource.start(now);
    noiseSource.stop(now + duration);
  },

  /**
   * Play error buzzer sound when wrong key is pressed
   */
  playErrorSound(volume = 70, isEnabled = true) {
    if (!isEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    const gainValue = Math.max(0.01, Math.min(1, (volume / 100) * 0.35));
    masterGain.gain.setValueAtTime(gainValue, now);
    masterGain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.setValueAtTime(110, now + 0.05);

    oscGain.gain.setValueAtTime(0.4, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(oscGain);
    oscGain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.12);
  },

  /**
   * Play triumph completion chime when typing test finishes
   */
  playCompletionSound(volume = 70, isEnabled = true) {
    if (!isEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const chords = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

    chords.forEach((freq, idx) => {
      const noteTime = now + idx * 0.08;
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      const gainValue = Math.max(0.01, Math.min(1, (volume / 100) * 0.25));
      oscGain.gain.setValueAtTime(gainValue, noteTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.4);
    });
  }
};
