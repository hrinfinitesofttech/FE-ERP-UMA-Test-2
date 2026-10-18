// Client-side notification sound and speech alert utility
// Synthesizes a crisp chime using the Web Audio API (zero external asset dependencies)
// and speaks notification headers using the browser Web Speech API.

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const val = localStorage.getItem('UMA_NOTIFICATION_SOUND_ENABLED');
  return val === null ? true : val === 'true';
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('UMA_NOTIFICATION_SOUND_ENABLED', String(enabled));
}

export function isVoiceEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const val = localStorage.getItem('UMA_NOTIFICATION_VOICE_ENABLED');
  return val === null ? true : val === 'true';
}

export function setVoiceEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('UMA_NOTIFICATION_VOICE_ENABLED', String(enabled));
}

/**
 * Play a high-quality, modern two-tone harmonic glass chime using Web Audio API
 */
export function playChime(volume: number = 0.7): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, now);
    masterGain.connect(ctx.destination);

    // Tone 1: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.6, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start(now);
    osc1.stop(now + 0.36);

    // Tone 2: 880.00 Hz (A5) - starts 0.08s later for bell arpeggio effect
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.00, now + 0.08);
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.001, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.8, now + 0.10);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.56);

    // Tone 3: 1174.66 Hz (D6) - subtle high sparkle harmonic
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(1174.66, now + 0.12);
    gain3.gain.setValueAtTime(0.001, now);
    gain3.gain.setValueAtTime(0.001, now + 0.12);
    gain3.gain.exponentialRampToValueAtTime(0.25, now + 0.14);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc3.connect(gain3);
    gain3.connect(masterGain);
    osc3.start(now + 0.12);
    osc3.stop(now + 0.46);
  } catch (err) {
    console.warn('Notification audio chime failed:', err);
  }
}

/**
 * Clean text for text-to-speech by stripping emoji and symbols
 */
function cleanTextForSpeech(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F100}-\u{1F1FF}]/gu, '')
    .replace(/[✓★⭐⚡📦📋📝✅⚠️🎉]/g, '')
    .trim();
}

/**
 * Speak the notification title and brief summary using Web Speech API
 */
export function speakNotification(title: string, message?: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    const synth = window.speechSynthesis;
    // Cancel any ongoing speech so messages don't queue indefinitely
    synth.cancel();

    const cleanTitle = cleanTextForSpeech(title);
    if (!cleanTitle) return;

    const speechText = `Notification: ${cleanTitle}`;
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;
    utterance.lang = 'en-US';

    // Pick an English voice if available
    const voices = synth.getVoices();
    const englishVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Jenny')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    synth.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis failed:', err);
  }
}

/**
 * Unified notification alert: Plays melodic chime and speaks message if enabled
 */
export function triggerNotificationAlert(title: string, message?: string): void {
  const soundOn = isSoundEnabled();
  const voiceOn = isVoiceEnabled();

  if (soundOn) {
    playChime();
  }

  if (voiceOn) {
    // Slight delay so the pleasant bell chime rings first
    setTimeout(() => {
      speakNotification(title, message);
    }, 450);
  }
}

/**
 * Preview sound & voice for testing from Topbar or Settings
 */
export function testNotificationSound(): void {
  playChime();
  setTimeout(() => {
    speakNotification('Test Notification', 'Audio and voice notifications are active.');
  }, 450);
}
