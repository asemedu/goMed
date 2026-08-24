// ─── Type-Safe Storage Helper for goMed ──────────────────────────────

export const STORAGE_KEYS = {
  PROFILE: "gomed_profile",
  LAST_SCREEN: "gomed_last_screen",
  ACTIVE_LOBBY: "gomed_active_lobby",
  COMPLETED_MODULES: "gomed_completed_modules",
  STREAK_INFO: "gomed_streak_info",
} as const;

export interface CachedProfile {
  id: string;
  display_name: string;
  email?: string;
  points: number;
  ranking: number;
  streak?: number;
  avatar_url?: string;
  updated_at?: string;
}

export interface CachedLobby {
  id: string;
  code: string;
  school?: string;
  host_id?: string;
  status: string;
  max_players?: number;
  isNewlyCreated?: boolean;
}

export const storage = {
  get: <T>(key: string, fallback: T): T => {
    try {
      if (typeof window === "undefined") return fallback;
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (err) {
      console.warn(`[storage] Failed to parse key "${key}":`, err);
      return fallback;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`[storage] Failed to save key "${key}":`, err);
    }
  },

  remove: (key: string): void => {
    try {
      if (typeof window === "undefined") return;
      localStorage.removeItem(key);
    } catch (err) {
      console.warn(`[storage] Failed to remove key "${key}":`, err);
    }
  },

  // Clear all goMed user state on logout
  clearUserSession: (): void => {
    try {
      if (typeof window === "undefined") return;
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
      localStorage.removeItem(STORAGE_KEYS.LAST_SCREEN);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_LOBBY);
      localStorage.removeItem(STORAGE_KEYS.COMPLETED_MODULES);
    } catch (err) {
      console.warn("[storage] Failed to clear user session:", err);
    }
  },
};
