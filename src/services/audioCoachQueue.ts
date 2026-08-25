import { storage, STORAGE_KEYS } from "../lib/storage";

export type AudioCue =
  | "begin_cpr"
  | "push_faster"
  | "slow_down"
  | "good_pace"
  | "lock_elbows"
  | "session_complete";

const CUES: AudioCue[] = [
  "begin_cpr",
  "push_faster",
  "slow_down",
  "good_pace",
  "lock_elbows",
  "session_complete",
];

const TEXT_TO_CUE: Record<string, AudioCue> = {
  // Direct keys
  begin_cpr: "begin_cpr",
  push_faster: "push_faster",
  slow_down: "slow_down",
  good_pace: "good_pace",
  lock_elbows: "lock_elbows",
  session_complete: "session_complete",

  // English strings
  "begin cpr": "begin_cpr",
  "push faster": "push_faster",
  "slow down": "slow_down",
  "good pace, keep it up": "good_pace",
  "lock your elbows": "lock_elbows",
  "stop cpr. session complete.": "session_complete",
  "stop cpr. session complete": "session_complete",

  // Romanian strings
  "începeți resuscitarea": "begin_cpr",
  "apăsați mai repede": "push_faster",
  "încetiniți ritmul": "slow_down",
  "ritm bun, continuați așa": "good_pace",
  "țineți brațele drepte": "lock_elbows",
  "opriți resuscitarea. sesiune finalizată.": "session_complete",
  "opriți resuscitarea. sesiune finalizată": "session_complete",
};

export class AudioCoachQueue {
  private currentAudio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private queue: { cue: AudioCue; lang: "ro" | "en" }[] = [];
  private lastPlayedTime: Record<string, number> = {};
  private language: "ro" | "en" = "ro";
  private audioPool: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    this.preloadAudio();
    this.setupUserInteractionUnlocker();
  }

  /**
   * Pre-instantiate Audio instances so the browser buffers them in advance
   */
  private preloadAudio() {
    if (typeof window === "undefined") return;

    for (const lang of ["ro", "en"] as const) {
      for (const cue of CUES) {
        const key = `${lang}_${cue}`;
        if (!this.audioPool.has(key)) {
          const audio = new Audio(`/audio/${lang}/${cue}.mp3`);
          audio.preload = "auto";
          this.audioPool.set(key, audio);
        }
      }
    }
  }

  /**
   * Prime audio playback permissions on first user touch/click
   */
  private setupUserInteractionUnlocker() {
    if (typeof window === "undefined") return;

    const unlock = () => {
      // Warm up audio elements
      this.audioPool.forEach((audio) => {
        try {
          audio.load();
        } catch (e) {
          // Ignore
        }
      });
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };

    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
  }

  setLanguage(lang: "ro" | "en") {
    this.language = lang;
  }

  /**
   * Play a CPR audio cue or string.
   * @param cueOrText Audio cue key ("begin_cpr", etc.) or text
   * @param priority If true, immediately interrupts currently playing audio
   * @param throttleMs Minimum cooldown (ms) before repeating this specific cue
   */
  play(cueOrText: AudioCue | string, priority: boolean = false, throttleMs: number = 4000) {
    if (typeof window === "undefined") return;

    const normalized = cueOrText.trim().toLowerCase().replace(/[.!?]+$/, "");
    const cue: AudioCue =
      TEXT_TO_CUE[cueOrText] ||
      TEXT_TO_CUE[normalized] ||
      (CUES.includes(cueOrText as AudioCue) ? (cueOrText as AudioCue) : "begin_cpr");

    const effectiveLang =
      this.language || storage.get<"ro" | "en">(STORAGE_KEYS.LANGUAGE, "ro");

    const now = Date.now();
    const lastTime = this.lastPlayedTime[cue] || 0;

    // Cooldown check for repetitive feedback
    if (!priority && now - lastTime < throttleMs) {
      return;
    }

    if (priority) {
      this.cancel();
    } else if (this.queue.some((item) => item.cue === cue)) {
      // Already queued, avoid double queue
      return;
    }

    this.queue.push({ cue, lang: effectiveLang });
    this.processQueue();
  }

  /**
   * Backward compatible speak method
   */
  speak(cueOrText: string, priority: boolean = false, throttleMs: number = 4000) {
    this.play(cueOrText, priority, throttleMs);
  }

  private processQueue() {
    if (this.isPlaying || this.queue.length === 0) return;

    this.isPlaying = true;
    const item = this.queue.shift()!;
    this.lastPlayedTime[item.cue] = Date.now();

    const poolKey = `${item.lang}_${item.cue}`;
    let audio = this.audioPool.get(poolKey);

    if (!audio) {
      audio = new Audio(`/audio/${item.lang}/${item.cue}.mp3`);
      this.audioPool.set(poolKey, audio);
    }

    this.currentAudio = audio;
    audio.currentTime = 0;

    audio.onended = () => {
      this.currentAudio = null;
      this.isPlaying = false;
      this.processQueue();
    };

    audio.onerror = (e) => {
      console.warn("[AudioCoach] Error playing audio asset:", poolKey, e);
      this.currentAudio = null;
      this.isPlaying = false;
      this.processQueue();
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("[AudioCoach] Play rejected by browser:", poolKey, err);
        this.currentAudio = null;
        this.isPlaying = false;
        this.processQueue();
      });
    }
  }

  cancel() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {
        // Ignore pause errors
      }
      this.currentAudio = null;
    }
    this.queue = [];
    this.isPlaying = false;
  }
}

export const audioCoach = new AudioCoachQueue();
