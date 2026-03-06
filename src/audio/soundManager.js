/**
 * @module soundManager
 * @description Web Audio API lofi background music (look-ahead scheduler) and SFX.
 * All audio is procedurally synthesised — no external audio files.
 *
 * Architecture (per research.md R-001):
 *   OscillatorNode → GainNode (ADSR) → GainNode (voice) → BiquadFilterNode (lowpass 3 kHz)
 *     → DelayNode (350 ms feedback) → GainNode (master) → destination
 */

// ── Music Constants ────────────────────────────────────────────
const LOOKAHEAD_MS  = 100;   // schedule this many Ms ahead
const SCHEDULER_MS  = 25;    // setInterval period
const BPM           = 72;
const BEAT_S        = 60 / BPM;
const BAR_S         = BEAT_S * 4;

/** Pentatonic minor scale (MIDI notes) used for the lofi melody. */
const PENTATONIC = [60, 63, 65, 67, 70, 72, 75, 77];

/** Bass note sequence (MIDI notes). */
const BASS_SEQ = [36, 36, 43, 41, 38, 36, 43, 46];

/**
 * Converts a MIDI note number to a frequency in Hz.
 * @param {number} midi
 * @returns {number}
 */
function midiToHz(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// ── Lofi Scheduler ────────────────────────────────────────────

/**
 * Schedules one oscillator note with ADSR envelope on the given signal chain.
 * @param {AudioContext} ctx
 * @param {GainNode} masterGain
 * @param {number} freq - Frequency (Hz)
 * @param {number} startTime - AudioContext time (s) to start
 * @param {number} duration - Note duration (s)
 * @param {string} type - OscillatorType ('square'|'sawtooth'|'triangle')
 * @param {number} amplitude - Peak gain (0–1)
 * @param {number} [detune=0] - Detune in cents
 */
function scheduleNote(ctx, masterGain, freq, startTime, duration, type, amplitude, detune = 0) {
  const osc  = ctx.createOscillator();
  const adsr = ctx.createGain();

  osc.type      = type;
  osc.frequency.value = freq;
  osc.detune.value    = detune;

  // ADSR envelope
  const attack  = 0.02;
  const decay   = 0.05;
  const sustain = amplitude * 0.7;
  const release = 0.1;

  adsr.gain.setValueAtTime(0, startTime);
  adsr.gain.linearRampToValueAtTime(amplitude, startTime + attack);
  adsr.gain.linearRampToValueAtTime(sustain, startTime + attack + decay);
  adsr.gain.setValueAtTime(sustain, startTime + duration - release);
  adsr.gain.linearRampToValueAtTime(0, startTime + duration);

  // Lowpass filter for warmth
  const lpf = ctx.createBiquadFilter();
  lpf.type            = 'lowpass';
  lpf.frequency.value = 2800;
  lpf.Q.value         = 0.7;

  osc.connect(adsr);
  adsr.connect(lpf);
  lpf.connect(masterGain);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

/**
 * Schedules a simple percussion transient (white noise burst).
 * @param {AudioContext} ctx
 * @param {GainNode} masterGain
 * @param {number} startTime
 * @param {number} duration
 * @param {number} amplitude
 */
function schedulePercussion(ctx, masterGain, startTime, duration, amplitude) {
  const bufferSize = Math.ceil(ctx.sampleRate * duration);
  const buffer     = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data       = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1);
  }

  const src  = ctx.createBufferSource();
  src.buffer = buffer;

  const adsr = ctx.createGain();
  adsr.gain.setValueAtTime(amplitude, startTime);
  adsr.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  const hpf = ctx.createBiquadFilter();
  hpf.type            = 'highpass';
  hpf.frequency.value = 4000;

  src.connect(hpf);
  hpf.connect(adsr);
  adsr.connect(masterGain);
  src.start(startTime);
}

/**
 * The look-ahead music scheduler.
 * Runs in a setInterval, scheduling notes within the lookahead window.
 * @param {AudioManager} am
 */
function musicScheduler(am) {
  if (am.muted) return;
  const now = am.ctx.currentTime;

  while (am.nextNoteTime < now + LOOKAHEAD_MS / 1000) {
    const beat      = am.beatCount % 32;
    const barBeat   = am.beatCount % 8;
    const t         = am.nextNoteTime;
    const noteDur   = BEAT_S * 0.8;

    // Melody (square oscillator, two slightly detuned voices for lofi texture)
    if (barBeat === 0 || barBeat === 2 || barBeat === 4 || barBeat === 6) {
      const noteIdx  = Math.floor(Math.random() * PENTATONIC.length);
      const freq     = midiToHz(PENTATONIC[noteIdx]);
      scheduleNote(am.ctx, am.masterGain, freq, t, noteDur, 'square', 0.12);
      scheduleNote(am.ctx, am.masterGain, freq, t, noteDur, 'square', 0.06, 8);   // detuned
      scheduleNote(am.ctx, am.masterGain, freq, t, noteDur, 'square', 0.04, -6);  // detuned
    }

    // Bass line (triangle, plays on every beat)
    const bassFreq = midiToHz(BASS_SEQ[barBeat]);
    scheduleNote(am.ctx, am.masterGain, bassFreq, t, BEAT_S * 0.9, 'triangle', 0.22);

    // Kick (every 4 beats)
    if (barBeat === 0 || barBeat === 4) {
      schedulePercussion(am.ctx, am.masterGain, t, 0.12, 0.08);
    }
    // Hi-hat (every 2 beats)
    if (barBeat % 2 === 0) {
      schedulePercussion(am.ctx, am.masterGain, t + BEAT_S * 0.5, 0.04, 0.04);
    }

    am.beatCount     += 1;
    am.nextNoteTime  += BEAT_S;
  }
}

// ── Public API ────────────────────────────────────────────────

/**
 * Creates the AudioContext, wire-up master gain, and returns an AudioManager handle.
 * Does NOT start playback (deferred to first user gesture).
 * @returns {{ ctx: AudioContext, masterGain: GainNode, schedulerInterval: number|null, muted: boolean, nextNoteTime: number, beatCount: number, playSFX: Function, playAlienDestroyed: Function, startBossTheme: Function, stopBossTheme: Function, playJingle: Function, playGameOver: Function }}
 */
export function initAudio() {
  const ctx        = new (window.AudioContext || window.webkitAudioContext)();
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.35;
  masterGain.connect(ctx.destination);

  const am = {
    ctx,
    masterGain,
    schedulerInterval: null,
    bossThemeNodes: null,
    muted: false,
    nextNoteTime: 0,
    beatCount: 0,
    playSFX:            (type)   => playSFX(am, type),
    playAlienDestroyed: (theme)  => playAlienDestroyed(am, theme),
    startBossTheme:     ()       => startBossTheme(am),
    stopBossTheme:      ()       => stopBossTheme(am),
    playJingle:         ()       => playJingle(am),
    playGameOver:       ()       => playGameOver(am),
  };
  return am;
}

/**
 * Resumes the AudioContext (must be called inside a user gesture to comply with autoplay policy).
 * @param {{ ctx: AudioContext }} audioManager
 * @returns {void}
 */
export function resumeContext(audioManager) {
  if (audioManager.ctx.state === 'suspended') {
    audioManager.ctx.resume();
  }
}

/**
 * Starts the lofi music look-ahead scheduler.
 * @param {{ ctx: AudioContext, schedulerInterval: number|null, nextNoteTime: number, beatCount: number }} audioManager
 * @returns {void}
 */
export function startBGM(audioManager) {
  if (audioManager.schedulerInterval !== null) return;
  audioManager.nextNoteTime = audioManager.ctx.currentTime + 0.1;
  audioManager.beatCount    = 0;
  audioManager.schedulerInterval = setInterval(
    () => musicScheduler(audioManager),
    SCHEDULER_MS
  );
}

/**
 * Stops lofi music playback by cancelling the scheduler and ramping master gain to 0.
 * @param {{ schedulerInterval: number|null, masterGain: GainNode, ctx: AudioContext }} audioManager
 * @returns {void}
 */
export function stopBGM(audioManager) {
  if (audioManager.schedulerInterval !== null) {
    clearInterval(audioManager.schedulerInterval);
    audioManager.schedulerInterval = null;
  }
  const gain = audioManager.masterGain.gain;
  gain.cancelScheduledValues(audioManager.ctx.currentTime);
  gain.setValueAtTime(gain.value, audioManager.ctx.currentTime);
  gain.exponentialRampToValueAtTime(0.0001, audioManager.ctx.currentTime + 0.3);
}

/**
 * Toggles mute state. Ramps master gain to/from 0.
 * @param {{ ctx: AudioContext, masterGain: GainNode, muted: boolean }} audioManager
 * @returns {boolean} True if now muted.
 */
export function toggleMute(audioManager) {
  const { ctx, masterGain } = audioManager;
  audioManager.muted = !audioManager.muted;
  const gain = masterGain.gain;
  gain.cancelScheduledValues(ctx.currentTime);
  gain.setValueAtTime(gain.value, ctx.currentTime);
  if (audioManager.muted) {
    gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
  } else {
    gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.3);
  }
  return audioManager.muted;
}

/**
 * Plays a one-shot sound effect. Creates fresh nodes per call (OscillatorNode is one-shot).
 * @param {{ ctx: AudioContext, masterGain: GainNode, muted: boolean }} audioManager
 * @param {'hit'|'convince'|'playerHit'|'bossCorrect'|'bossWrong'|'bossDefeated'|'levelComplete'|'gameOver'|'win'} type
 * @returns {void}
 */
export function playSFX(audioManager, type) {
  if (!audioManager || audioManager.muted) return;
  const ctx       = audioManager.ctx;
  const dest      = audioManager.masterGain;
  const now       = ctx.currentTime;

  const sfxGain = ctx.createGain();
  sfxGain.gain.value = 0.5;
  sfxGain.connect(dest);

  /** @param {number} freq @param {number} dur @param {string} wave @param {number} vol */
  const burst = (freq, dur, wave = 'square', vol = 0.5, freqEnd = freq) => {
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type            = wave;
    osc.frequency.setValueAtTime(freq, now);
    if (freqEnd !== freq) osc.frequency.exponentialRampToValueAtTime(freqEnd, now + dur);
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(g);
    g.connect(sfxGain);
    osc.start(now);
    osc.stop(now + dur + 0.01);
  };

  switch (type) {
    case 'hit':
      burst(440, 0.06, 'square', 0.4, 220);
      break;
    case 'convince':
      burst(660, 0.05, 'square', 0.4);
      burst(880, 0.08, 'square', 0.3);
      break;
    case 'playerHit':
      burst(220, 0.15, 'sawtooth', 0.5, 110);
      break;
    case 'bossCorrect':
      burst(550, 0.08, 'square', 0.45);
      burst(660, 0.12, 'square', 0.4);
      break;
    case 'bossWrong':
      burst(220, 0.12, 'sawtooth', 0.5, 180);
      break;
    case 'bossDefeated': {
      [440, 550, 660, 770, 880].forEach((f, i) => {
        const osc2 = ctx.createOscillator();
        const g2   = ctx.createGain();
        osc2.type  = 'square';
        osc2.frequency.value = f;
        g2.gain.setValueAtTime(0.5, now + i * 0.07);
        g2.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.1);
        osc2.connect(g2);
        g2.connect(sfxGain);
        osc2.start(now + i * 0.07);
        osc2.stop(now + i * 0.07 + 0.15);
      });
      break;
    }
    case 'levelComplete':
      burst(523, 0.1, 'square', 0.4);
      burst(659, 0.1, 'square', 0.4);
      burst(784, 0.15, 'square', 0.45);
      break;
    case 'gameOver':
      burst(330, 0.2, 'sawtooth', 0.5, 220);
      burst(220, 0.3, 'sawtooth', 0.4, 110);
      break;
    case 'win': {
      const fanfare = [523, 659, 784, 1047];
      fanfare.forEach((f, i) => {
        const osc3 = ctx.createOscillator();
        const g3   = ctx.createGain();
        osc3.type  = 'square';
        osc3.frequency.value = f;
        g3.gain.setValueAtTime(0.4, now + i * 0.1);
        g3.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.2);
        osc3.connect(g3);
        g3.connect(sfxGain);
        osc3.start(now + i * 0.1);
        osc3.stop(now + i * 0.1 + 0.25);
      });
      break;
    }
    default:
      break;
  }
}

// ── New Audio Methods (T028–T031) ─────────────────────────────

/**
 * Plays a per-alien-theme destruction sound effect.
 * @param {{ ctx: AudioContext, masterGain: GainNode, muted: boolean }} audioManager
 * @param {'it'|'accounting'|'management'|'unionist'|'boss'|string} theme
 * @returns {void}
 */
export function playAlienDestroyed(audioManager, theme) {
  if (!audioManager || audioManager.muted) return;
  const ctx  = audioManager.ctx;
  const dest = audioManager.masterGain;
  const now  = ctx.currentTime;

  const sfxGain = ctx.createGain();
  sfxGain.gain.value = 0.45;
  sfxGain.connect(dest);

  switch (theme) {
    case 'it': {
      // High-freq square blip C6→A5 (0.15 s)
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1047, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      g.gain.setValueAtTime(0.4, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(g); g.connect(sfxGain);
      osc.start(now); osc.stop(now + 0.16);
      break;
    }
    case 'accounting': {
      // Triangle ping 880 Hz (0.2 s)
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = 880;
      g.gain.setValueAtTime(0.5, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(g); g.connect(sfxGain);
      osc.start(now); osc.stop(now + 0.21);
      break;
    }
    case 'management': {
      // Sine thud 120→60 Hz (0.3 s)
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.3);
      g.gain.setValueAtTime(0.6, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(g); g.connect(sfxGain);
      osc.start(now); osc.stop(now + 0.31);
      break;
    }
    case 'unionist': {
      // Sawtooth buzzer 200 Hz (0.2 s)
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = 200;
      g.gain.setValueAtTime(0.4, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(g); g.connect(sfxGain);
      osc.start(now); osc.stop(now + 0.21);
      break;
    }
    case 'boss': {
      // White noise burst through lowpass 300 Hz (0.5 s)
      const bufSize = Math.ceil(ctx.sampleRate * 0.5);
      const buffer  = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data    = buffer.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const lpf = ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.value = 300;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      src.connect(lpf); lpf.connect(g); g.connect(sfxGain);
      src.start(now);
      break;
    }
    default: {
      // Generic blip
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = 440;
      g.gain.setValueAtTime(0.3, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(g); g.connect(sfxGain);
      osc.start(now); osc.stop(now + 0.11);
      break;
    }
  }
}

/**
 * Starts a looping elevator-music boss theme — descending chromatic bass motif at 60 BPM
 * on filtered sawtooth, 8-bar loop. Stores loop node references on audioManager.bossThemeNodes.
 * @param {{ ctx: AudioContext, masterGain: GainNode, muted: boolean, bossThemeNodes: Object|null }} audioManager
 * @returns {void}
 */
export function startBossTheme(audioManager) {
  if (!audioManager || audioManager.muted) return;
  stopBossTheme(audioManager); // prevent overlapping loops

  const ctx  = audioManager.ctx;
  const dest = audioManager.masterGain;
  const now  = ctx.currentTime;

  const bossGain = ctx.createGain();
  bossGain.gain.value = 0.25;
  bossGain.connect(dest);

  // Bandpass filter ~800 Hz for telephony elevator feel
  const bpf = ctx.createBiquadFilter();
  bpf.type = 'bandpass';
  bpf.frequency.value = 800;
  bpf.Q.value = 1.5;
  bpf.connect(bossGain);

  // 8-bar loop of descending chromatic sawtooth bass (60 BPM)
  const BOSS_BPM   = 60;
  const BOSS_BEAT  = 60 / BOSS_BPM;
  const LOOP_S     = BOSS_BEAT * 32; // 8 bars × 4 beats

  // Chromatic descending motif (MIDI B3→G3 over 8 beats, then repeat)
  const steps = [59, 58, 57, 56, 55, 54, 53, 52]; // B3→Ab2
  const oscs  = [];
  const scheduleBossLoop = (startAt) => {
    steps.forEach((midi, i) => {
      const t   = startAt + i * BOSS_BEAT;
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = midiToHz(midi);
      g.gain.setValueAtTime(0.6, t);
      g.gain.linearRampToValueAtTime(0, t + BOSS_BEAT * 0.9);
      osc.connect(g); g.connect(bpf);
      osc.start(t); osc.stop(t + BOSS_BEAT);
      oscs.push(osc);
    });
  };

  // Schedule multiple loops into the future
  for (let loop = 0; loop < 8; loop++) {
    scheduleBossLoop(now + loop * steps.length * BOSS_BEAT);
  }

  audioManager.bossThemeNodes = { bossGain, bpf, oscs };
}

/**
 * Stops the boss theme by disconnecting all loop nodes.
 * @param {{ bossThemeNodes: Object|null }} audioManager
 * @returns {void}
 */
export function stopBossTheme(audioManager) {
  if (!audioManager || !audioManager.bossThemeNodes) return;
  try {
    const { bossGain, oscs } = audioManager.bossThemeNodes;
    for (const osc of oscs) {
      try { osc.stop(); } catch (_) { /* already stopped */ }
    }
    bossGain.disconnect();
  } catch (_) { /* safe cleanup */ }
  audioManager.bossThemeNodes = null;
}

/**
 * Plays a one-shot C4→E4→G4 ascending fanfare (power-up jingle).
 * @param {{ ctx: AudioContext, masterGain: GainNode, muted: boolean }} audioManager
 * @returns {void}
 */
export function playJingle(audioManager) {
  if (!audioManager || audioManager.muted) return;
  const ctx  = audioManager.ctx;
  const dest = audioManager.masterGain;
  const now  = ctx.currentTime;

  const jingleGain = ctx.createGain();
  jingleGain.gain.value = 0.4;
  jingleGain.connect(dest);

  // C4 = 261.63, E4 = 329.63, G4 = 392.00
  [261.63, 329.63, 392.00].forEach((freq, i) => {
    const t   = now + i * 0.1;
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(g); g.connect(jingleGain);
    osc.start(t); osc.stop(t + 0.13);
  });
}

/**
 * Plays the game-over sequence: sad trombone (B♭4→G4, sawtooth + 5 Hz vibrato, ~2.5 s)
 * followed by an HR voicemail tone (DTMF 440+480 Hz → band-limited noise → final beep).
 * Uses AudioContext time-scheduling for precise sequencing.
 * @param {{ ctx: AudioContext, masterGain: GainNode, muted: boolean }} audioManager
 * @returns {void}
 */
export function playGameOver(audioManager) {
  if (!audioManager || audioManager.muted) return;
  const ctx  = audioManager.ctx;
  const dest = audioManager.masterGain;
  const now  = ctx.currentTime;

  const goGain = ctx.createGain();
  goGain.gain.value = 0.5;
  goGain.connect(dest);

  // ── Sad trombone: B♭4 (466 Hz) → G4 (392 Hz), sawtooth, with 5 Hz vibrato LFO ──
  const tromOsc = ctx.createOscillator();
  const lfo     = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  const tromG   = ctx.createGain();

  tromOsc.type = 'sawtooth';
  tromOsc.frequency.setValueAtTime(466, now);
  tromOsc.frequency.linearRampToValueAtTime(392, now + 2.5);

  lfo.type = 'sine';
  lfo.frequency.value = 5;
  lfoGain.gain.value  = 8; // ±8 Hz vibrato depth
  lfo.connect(lfoGain);
  lfoGain.connect(tromOsc.frequency);

  tromG.gain.setValueAtTime(0.6, now);
  tromG.gain.setValueAtTime(0.6, now + 2.4);
  tromG.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

  tromOsc.connect(tromG); tromG.connect(goGain);
  lfo.start(now); lfo.stop(now + 2.5);
  tromOsc.start(now); tromOsc.stop(now + 2.51);

  // ── HR Voicemail: DTMF beep → noise → beep ──
  const voiceStart = now + 2.7;

  // Beep 1: 440 + 480 Hz (standard US dial tone)
  [440, 480].forEach(freq => {
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.3, voiceStart);
    g.gain.exponentialRampToValueAtTime(0.001, voiceStart + 0.4);
    osc.connect(g); g.connect(goGain);
    osc.start(voiceStart); osc.stop(voiceStart + 0.41);
  });

  // Noise formant (HR voicemail message)
  const noiseStart = voiceStart + 0.5;
  const noiseDur   = 1.0;
  const bufSize    = Math.ceil(ctx.sampleRate * noiseDur);
  const buffer     = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data       = buffer.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const noiseSrc = ctx.createBufferSource();
  noiseSrc.buffer = buffer;
  const formant = ctx.createBiquadFilter();
  formant.type = 'bandpass';
  formant.frequency.value = 1200;
  formant.Q.value = 3;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.2, noiseStart);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, noiseStart + noiseDur);
  noiseSrc.connect(formant); formant.connect(noiseGain); noiseGain.connect(goGain);
  noiseSrc.start(noiseStart);

  // Beep 2: final DTMF
  const beep2Start = noiseStart + noiseDur + 0.1;
  [440, 480].forEach(freq => {
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.3, beep2Start);
    g.gain.exponentialRampToValueAtTime(0.001, beep2Start + 0.5);
    osc.connect(g); g.connect(goGain);
    osc.start(beep2Start); osc.stop(beep2Start + 0.51);
  });
}
