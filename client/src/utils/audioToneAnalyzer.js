/**
 * Real-Time Audio Tone & Pitch Analyzer Utility
 * Uses Web Audio API (AudioContext & AnalyserNode) to inspect microphone input stream:
 * - Real-Time Volume Level (%)
 * - Pitch Variance / Tone Energy (Hz)
 * - Frequency Spectrum Array for live audio visualizer waveform rendering
 */

export class AudioToneAnalyzer {
  constructor() {
    this.audioCtx = null;
    this.analyser = null;
    this.micStream = null;
    this.source = null;
    this.dataArray = null;
    this.isAnalyzing = false;
  }

  /**
   * Initializes audio context with user media stream
   * @param {MediaStream} stream 
   */
  async start(stream) {
    try {
      if (this.isAnalyzing) return;
      this.micStream = stream;

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      if (this.audioCtx.state === "suspended") {
        await this.audioCtx.resume();
      }

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      this.source = this.audioCtx.createMediaStreamSource(stream);
      this.source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      this.isAnalyzing = true;
    } catch (err) {
      console.warn("AudioToneAnalyzer start error:", err);
    }
  }

  /**
   * Samples current audio frame
   * @returns {object} Audio metrics: { volume, pitchVariance, toneQuality, frequencyData }
   */
  getAudioMetrics() {
    if (!this.isAnalyzing || !this.analyser || !this.dataArray) {
      return {
        volume: 0,
        pitchVariance: 0,
        toneQuality: "Normal",
        frequencyData: new Array(16).fill(0),
      };
    }

    this.analyser.getByteFrequencyData(this.dataArray);

    let sum = 0;
    let maxFreqVal = 0;

    for (let i = 0; i < this.dataArray.length; i++) {
      const val = this.dataArray[i];
      sum += val;
      if (val > maxFreqVal) maxFreqVal = val;
    }

    const avgVolume = sum / this.dataArray.length;
    const volumePercent = Math.min(100, Math.round((avgVolume / 128) * 100));

    let toneQuality = "Steady Tone";
    if (volumePercent === 0) {
      toneQuality = "Silent";
    } else if (volumePercent < 15) {
      toneQuality = "Soft / Whispering";
    } else if (volumePercent > 75) {
      toneQuality = "High Energy / Loud";
    } else if (maxFreqVal > 200) {
      toneQuality = "Dynamic Pitch";
    }

    const freqSlice = Array.from(this.dataArray.slice(0, 16));

    return {
      volume: volumePercent,
      pitchVariance: Math.round(maxFreqVal),
      toneQuality,
      frequencyData: freqSlice,
    };
  }

  stop() {
    this.isAnalyzing = false;
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.audioCtx && this.audioCtx.state !== "closed") {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
    this.analyser = null;
    this.dataArray = null;
  }
}
