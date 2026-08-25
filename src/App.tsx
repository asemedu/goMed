import React, { useState, useEffect } from "react";
import { ArrowLeft, Heart } from "lucide-react";
import { supabase } from "./lib/supabaseClient";
import { storage, STORAGE_KEYS } from "./lib/storage";
import { Screen } from "./types";

// Layout & Modals
import { BottomNavBar } from "./components/layout/BottomNavBar";
import { ResetPasswordModal } from "./components/modals/ResetPasswordModal";

// Screens
import { LandingScreen } from "./screens/auth/LandingScreen";
import { CPRScreen } from "./screens/ar/CPRScreen";
import { OnboardingScreen } from "./screens/auth/OnboardingScreen";
import { AuthScreen } from "./screens/auth/AuthScreen";
import { DashboardScreen } from "./screens/main/DashboardScreen";
import { QuizzesScreen } from "./screens/main/QuizzesScreen";
import { SinglePlayerQuizScreen } from "./screens/quiz/SinglePlayerQuizScreen";
import { ARHubScreen } from "./screens/ar/ARHubScreen";
import { ARTryScreen } from "./screens/ar/ARTryScreen";
import { CreateLobbyScreen } from "./screens/lobby/CreateLobbyScreen";
import { LobbyScreen } from "./screens/lobby/LobbyScreen";
import { QuizScreen } from "./screens/lobby/QuizScreen";
import { ProfileScreen } from "./screens/main/ProfileScreen";
import { CPRPracticeScreen } from "./screens/cpr/CPRPracticeScreen";

export default function App() {
  const [selectedQuizCategory, setSelectedQuizCategory] = useState<string>("bls");
  const [historyStack, setHistoryStack] = useState<Screen[]>(() => {
    // Check if user has an active cached profile and saved screen
      const cachedProfile = storage.get(STORAGE_KEYS.PROFILE, null);
    const cachedScreen = storage.get<Screen>(
      STORAGE_KEYS.LAST_SCREEN,
      "dashboard"
    );
    if (
      cachedProfile &&
      ["dashboard", "quizzes", "ar-hub", "profile"].includes(cachedScreen)
    ) {
      return [cachedScreen];
    }
    return ["landing"];
  });

  const [showResetModal, setShowResetModal] = useState(false);
  const [activeLobby, setActiveLobby] = useState<any>(() =>
    storage.get(STORAGE_KEYS.ACTIVE_LOBBY, null)
  );
  const [selectedMovement, setSelectedMovement] = useState<any>(null);
  const [kickedToast, setKickedToast] = useState<string | null>(null);
  const current = historyStack[historyStack.length - 1];

  const handleUserKicked = async (lobbyId?: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && (lobbyId || activeLobby?.id)) {
        await supabase
          .from("lobby_participants")
          .delete()
          .eq("lobby_id", lobbyId || activeLobby?.id)
          .eq("user_id", user.id);
      }
    } catch (e) {
      console.warn("Error deleting self from lobby participants:", e);
    }
    setActiveLobby(null);
    storage.remove(STORAGE_KEYS.ACTIVE_LOBBY);
    navigate("dashboard", true);
    setKickedToast("You were kicked by the host.");
    setTimeout(() => {
      setKickedToast(null);
    }, 2000);
  };

  const showBottomNav =
    current === "dashboard" || current === "quizzes" || current === "ar-hub";

  useEffect(() => {
    // Check live Supabase session and hydrate state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const lastScreen = storage.get<Screen>(
          STORAGE_KEYS.LAST_SCREEN,
          "dashboard"
        );
        const targetScreen = [
          "dashboard",
          "quizzes",
          "ar-hub",
          "profile",
        ].includes(lastScreen)
          ? lastScreen
          : "dashboard";
        setHistoryStack([targetScreen]);
        window.history.replaceState(
          { screen: targetScreen, index: 0 },
          "",
          `?screen=${targetScreen}`
        );
      } else {
        // If not logged in, ensure we don't land on a protected screen
        setHistoryStack((prev) => {
          const cur = prev[prev.length - 1];
          if (
            [
              "dashboard",
              "quizzes",
              "ar-hub",
              "profile",
              "quiz",
              "lobby",
            ].includes(cur)
          ) {
            return ["landing"];
          }
          return prev;
        });
      }
    });

    const handlePopState = (e: PopStateEvent) => {
      if (e.state && typeof e.state.index === "number") {
        const newIndex = e.state.index;
        // Keep the stack aligned with the history index
        setHistoryStack((prev) => prev.slice(0, newIndex + 1));
      }
    };

    window.addEventListener("popstate", handlePopState);

    // Listen for password recovery from Supabase email link
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setShowResetModal(true);
      } else if (event === "SIGNED_OUT") {
        storage.clearUserSession();
        setHistoryStack(["auth"]);
      } else if (event === "SIGNED_IN" && session) {
        setHistoryStack(["dashboard"]);
      }
    });

    if (window.location.hash.includes("type=recovery")) {
      setShowResetModal(true);
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
      subscription.unsubscribe();
    };
  }, []);

  const navigate = (s: Screen, replace = false) => {
    if (["dashboard", "quizzes", "ar-hub"].includes(s)) {
      storage.set(STORAGE_KEYS.LAST_SCREEN, s);
    }

    if (replace) {
      const index = Math.max(0, historyStack.length - 1);
      window.history.replaceState({ screen: s, index }, "", `?screen=${s}`);
      setHistoryStack((prev) => [...prev.slice(0, -1), s]);
    } else {
      const newIndex = historyStack.length;
      window.history.pushState(
        { screen: s, index: newIndex },
        "",
        `?screen=${s}`
      );
      setHistoryStack((prev) => [...prev, s]);
    }
  };

  const goBack = () => {
    if (historyStack.length > 1) {
      window.history.back();
    }
  };

  return (
    <>
      <style>{`
        @keyframes scanline {
          0%   { top: 20%; }
          50%  { top: 80%; }
          100% { top: 20%; }
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div
        className="min-h-[100dvh] h-full w-full bg-white sm:bg-[#EDF3E9] flex flex-col items-center justify-start sm:justify-center py-0 sm:py-8 px-0 sm:px-4"
        style={{ fontFamily: "'Nunito', sans-serif" }}
      >
        {/* The "Invisible Frame" that fixes the layout and scrolling */}
        <div
          className="w-full sm:max-w-[390px] h-[100dvh] sm:h-[820px] bg-white sm:rounded-[48px] sm:shadow-2xl overflow-hidden flex flex-col relative"
          style={{
            paddingTop: "env(safe-area-inset-top)",
          }}
        >
          {/* Back Button Header with ASEM Branding */}
          <div className="w-full px-5 pt-5 pb-1 flex items-center justify-between z-10 shrink-0 bg-transparent gap-2">
            <button
              onClick={historyStack.length > 1 ? goBack : undefined}
              disabled={historyStack.length <= 1}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${
                historyStack.length > 1 
                  ? "bg-white/80 backdrop-blur-md shadow-sm border border-[#E8EDE6] text-[#1A2816] hover:bg-white active:scale-95 cursor-pointer" 
                  : "bg-[#F7FBF5] border border-[#E8EDE6] text-[#6B7C6B] cursor-not-allowed"
              }`}
              aria-label="Go back"
            >
              <ArrowLeft size={20} strokeWidth={2.5} />
            </button>

            <span
              className="flex-1 text-center text-[10px] sm:text-[11px] font-extrabold text-[#1A3312] leading-tight uppercase tracking-wide"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              Asociatia pentru Sustinerea<br />Educatiei Medicale
            </span>

            <div className="w-10 h-10 flex items-center justify-center shrink-0 bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-[#E8EDE6] p-0.5 overflow-hidden">
              <img src="/logo_asem.png" alt="ASEM Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* This inner div is what actually enables the scrolling! */}
          <div
            className={`flex-1 overflow-y-auto scrollbar-none relative ${showBottomNav ? "pb-24" : ""
              }`}
          >
            {current === "landing" && (
              <LandingScreen onNext={() => navigate("cpr")} />
            )}
            {current === "cpr" && (
              <CPRScreen onNext={() => navigate("onboarding")} />
            )}
            {current === "onboarding" && (
              <OnboardingScreen onNext={() => navigate("auth")} />
            )}
            {current === "auth" && (
              <AuthScreen onNext={() => navigate("dashboard")} />
            )}
            {current === "dashboard" && (
              <DashboardScreen
                onScan={() => {
                  setActiveLobby(null);
                  storage.remove(STORAGE_KEYS.ACTIVE_LOBBY);
                  navigate("lobby");
                }}
                onOpenProfile={() => navigate("profile")}
                onCreateLobby={() => navigate("create-lobby")}
                onStartCPRPractice={() => navigate("cpr-practice")}
              />
            )}
            {current === "quizzes" && (
              <QuizzesScreen
                onExploreCPR={() => navigate("cpr")}
                onSelectQuiz={(category) => {
                  setSelectedQuizCategory(category);
                  navigate("single-player-quiz");
                }}
              />
            )}
            {current === "single-player-quiz" && (
              <SinglePlayerQuizScreen
                category={selectedQuizCategory}
                onFinish={() => navigate("quizzes", true)}
              />
            )}
            {current === "ar-hub" && (
              <ARHubScreen
                onSelectMovement={(move, mode) => {
                  setSelectedMovement(move);
                  if (mode === "learn") {
                    navigate("cpr");
                  } else {
                    navigate("ar-try");
                  }
                }}
              />
            )}
            {current === "ar-try" && (
              <ARTryScreen
                movement={selectedMovement}
                onBack={goBack}
              />
            )}
            {current === "cpr-practice" && (
              <CPRPracticeScreen navigate={navigate} />
            )}
            {current === "create-lobby" && (
              <CreateLobbyScreen
                onBack={goBack}
                onLobbyCreated={(lobby) => {
                  setActiveLobby(lobby);
                  storage.set(STORAGE_KEYS.ACTIVE_LOBBY, lobby);
                  navigate("lobby");
                }}
              />
            )}
            {current === "lobby" && (
              <LobbyScreen
                initialLobby={activeLobby}
                _onLeave={() => {
                  storage.remove(STORAGE_KEYS.ACTIVE_LOBBY);
                  goBack();
                }}
                onLobbyJoined={(lobby) => {
                  setActiveLobby(lobby);
                  storage.set(STORAGE_KEYS.ACTIVE_LOBBY, lobby);
                }}
                onStartGame={(lobby) => {
                  setActiveLobby(lobby);
                  navigate("quiz", true);
                }}
                onKicked={handleUserKicked}
              />
            )}
            {current === "quiz" && (
              <QuizScreen
                lobby={activeLobby}
                onFinish={() => {
                  storage.remove(STORAGE_KEYS.ACTIVE_LOBBY);
                  navigate("dashboard");
                }}
              />
            )}
            {current === "profile" && (
              <ProfileScreen
                onBack={goBack}
                onSignOut={() => {
                  storage.clearUserSession();
                  navigate("auth", true);
                }}
              />
            )}
          </div>

          {/* Kicked by Host Notification Banner */}
          {kickedToast && (
            <div className="absolute top-14 left-4 right-4 z-50 bg-[#F0F8EC] border-2 border-[#B3D59F] rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 animate-fadeIn">
              <div className="w-8 h-8 rounded-xl bg-[#FFF0F2] border border-[#FAD2D2] flex items-center justify-center text-[#D93838] shrink-0 font-extrabold text-[14px]">
                ✕
              </div>
              <p
                className="text-[13px] font-extrabold text-[#C0384E]"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {kickedToast}
              </p>
            </div>
          )}

          {/* Persistent Bottom Navigation Bar */}
          {showBottomNav && (
            <BottomNavBar
              current={current}
              onNavigate={(tab) => {
                if (tab !== current) {
                  navigate(tab);
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Password Reset Modal */}
      <ResetPasswordModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onSuccess={() => {
          navigate("auth");
        }}
      />
    </>
  );
}