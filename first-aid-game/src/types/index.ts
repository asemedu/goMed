export type Screen =
  | "landing"
  | "cpr"
  | "cpr-practice"
  | "onboarding"
  | "auth"
  | "dashboard"
  | "lobby"
  | "profile"
  | "create-lobby"
  | "quiz"
  | "learn"
  | "ar-hub"
  | "ar-try";

export interface UserProfile {
  id?: string;
  display_name?: string;
  avatar_url?: string;
  total_xp?: number;
  current_streak?: number;
  challenges_completed?: number;
}

export interface LobbyParticipant {
  userId: string;
  name: string;
  isCurrentUser: boolean;
  isHost: boolean;
}

export interface LobbyData {
  id: string;
  code: string;
  school?: string;
  status: "waiting" | "active" | "completed";
  max_players?: number;
  host_id?: string;
  isNewlyCreated?: boolean;
}

export interface MovementItem {
  id: string;
  title: string;
  badge: string;
  duration: string;
  accuracy: string;
  level: string;
  desc: string;
  icon: any;
  color: string;
  bgGradient: string;
  borderColor: string;
  accentColor: string;
  instructions: string[];
  keyCriteria: string[];
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": any;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": any;
    }
  }
}
