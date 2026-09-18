import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  QrCode,
  Trophy,
  Sparkles,
  AlertCircle,
  ArrowRight,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { TreasureHuntScannerModal } from "../../components/modals/TreasureHuntScannerModal";
import { storage, STORAGE_KEYS } from "../../lib/storage";

interface TreasureHuntHubScreenProps {
  lobby?: any;
  onScanStation: (quiz: any) => void;
  onFinish: () => void;
}

interface ParticipantRank {
  userId: string;
  name: string;
  score: number;
  quizzesCompletedCount: number;
  completedQuizIds: string[];
  isCurrentUser: boolean;
}

export function TreasureHuntHubScreen({
  lobby: propLobby,
  onScanStation,
  onFinish,
}: TreasureHuntHubScreenProps) {
  const { t } = useLanguage();
  const lobby = propLobby || storage.get(STORAGE_KEYS.ACTIVE_LOBBY, null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [allowedQuizzes, setAllowedQuizzes] = useState<any[]>([]);
  const [completedQuizIds, setCompletedQuizIds] = useState<string[]>([]);
  const [myScore, setMyScore] = useState<number>(0);
  const [participants, setParticipants] = useState<ParticipantRank[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isStopped, setIsStopped] = useState<boolean>(false);
  const [savingProgress, setSavingProgress] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState<boolean>(false);

  const roomChannelRef = useRef<any>(null);
  const activityRecordedRef = useRef<boolean>(false);

  // 1. Get current logged-in user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  // 2. Fetch Selected Quizzes for this Lobby
  useEffect(() => {
    const fetchLobbyQuizzes = async () => {
      if (!lobby?.id) return;
      try {
        const { data, error } = await supabase
          .from("lobby_quizzes")
          .select("quiz_id, order_index, quizzes(*)")
          .eq("lobby_id", lobby.id)
          .order("order_index", { ascending: true });

        if (!error && data) {
          const list = data.map((item: any) => item.quizzes).filter(Boolean);
          setAllowedQuizzes(list);
        }
      } catch (err) {
        console.error("Failed to fetch lobby quizzes:", err);
      }
    };
    fetchLobbyQuizzes();
  }, [lobby?.id]);

  // 3. Fetch Real-Time Leaderboard & My Progress
  const fetchParticipantsProgress = useCallback(async () => {
    if (!lobby?.id) {
      setLoading(false);
      return;
    }
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const currentUid = user?.id || currentUserId;

      const { data, error } = await supabase
        .from("lobby_participants")
        .select(`
          user_id,
          current_score,
          completed_quiz_ids,
          quizzes_completed_count,
          profiles (
            display_name
          )
        `)
        .eq("lobby_id", lobby.id);

      if (!error && data) {
        const filtered = data.filter((p: any) => p.user_id !== lobby?.host_id);

        let myFoundCompleted: string[] = [];
        let myFoundScore = 0;

        const list: ParticipantRank[] = filtered.map((p: any) => {
          const isMe = Boolean(currentUid && p.user_id === currentUid);
          const completedList = Array.isArray(p.completed_quiz_ids)
            ? p.completed_quiz_ids
            : [];
          const count = p.quizzes_completed_count ?? completedList.length ?? 0;

          if (isMe) {
            myFoundCompleted = completedList;
            myFoundScore = p.current_score || 0;
          }

          return {
            userId: p.user_id,
            name: p.profiles?.display_name || (isMe ? "You" : "Participant"),
            score: p.current_score || 0,
            quizzesCompletedCount: count,
            completedQuizIds: completedList,
            isCurrentUser: isMe,
          };
        });

        if (currentUid) {
          setCompletedQuizIds(myFoundCompleted);
          setMyScore(myFoundScore);
        }

        list.sort((a, b) => {
          if (b.quizzesCompletedCount !== a.quizzesCompletedCount) {
            return b.quizzesCompletedCount - a.quizzesCompletedCount;
          }
          return b.score - a.score;
        });

        setParticipants(list);
      }
    } catch (err) {
      console.error("Error fetching participant ranking:", err);
    } finally {
      setLoading(false);
    }
  }, [lobby?.id, lobby?.host_id, currentUserId]);

  // 4. Real-time Subscription (Broadcast + Postgres Changes)
  useEffect(() => {
    if (!lobby?.id) return;
    fetchParticipantsProgress();

    // Unified channel with cleanup
    const channelName = `hunt-session-${lobby.id}`;
    const channels = supabase.getChannels();
    for (const ch of channels) {
      if (ch.topic === `realtime:${channelName}` || ch.topic === channelName) {
        supabase.removeChannel(ch);
      }
    }

    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: true } },
    });
    roomChannelRef.current = channel;

    channel
      .on("broadcast", { event: "hunt_progress_updated" }, () => {
        fetchParticipantsProgress();
      })
      .on("broadcast", { event: "lobby_stopped" }, () => {
        setIsStopped(true);
      })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lobby_participants",
          filter: `lobby_id=eq.${lobby.id}`,
        },
        () => {
          fetchParticipantsProgress();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "lobbies",
          filter: `id=eq.${lobby.id}`,
        },
        (payload: any) => {
          if (payload.new?.status === "stopped") {
            setIsStopped(true);
          }
        }
      )
      .subscribe();

    const interval = setInterval(async () => {
      fetchParticipantsProgress();
      try {
        const { data: latestLobby } = await supabase
          .from("lobbies")
          .select("status")
          .eq("id", lobby.id)
          .single();
        if (latestLobby?.status === "stopped") {
          setIsStopped(true);
        }
      } catch (e) {
        // Ignore poll error
      }
    }, 2500);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
      roomChannelRef.current = null;
    };
  }, [lobby?.id, fetchParticipantsProgress]);

  // Auto-record activity helper (saves to user_activities & updates profiles)
  const recordActivityToDb = useCallback(
    async (earnedScore: number) => {
      if (activityRecordedRef.current) return;
      activityRecordedRef.current = true;
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user && earnedScore > 0) {
          try {
            await supabase.rpc("record_activity", {
              xp_earned: earnedScore,
              activity_title: `Treasure Hunt: ${lobby?.school || "Provocare"}`,
            });
          } catch (rpcErr) {
            // Fallback direct insert into user_activities & profile points upsert
            await supabase.from("user_activities").insert({
              user_id: user.id,
              title: `Treasure Hunt: ${lobby?.school || "Provocare"}`,
              xp_earned: earnedScore,
            });
            await supabase.from("profiles").upsert(
              {
                id: user.id,
                points: earnedScore,
                last_activity_date: new Date().toISOString(),
              },
              { onConflict: "id" }
            );
          }
        }
      } catch (err) {
        console.error("Error auto-recording activity:", err);
      }
    },
    [lobby?.school]
  );

  const totalStations = allowedQuizzes.length || 1;
  const completedCount = completedQuizIds.length;
  const isAllCompleted = totalStations > 0 && completedCount >= totalStations;
  const progressPercentage = Math.min(
    100,
    Math.round((completedCount / totalStations) * 100)
  );

  // Auto-record if hunt is stopped or fully completed
  useEffect(() => {
    if ((isStopped || isAllCompleted) && myScore > 0) {
      recordActivityToDb(myScore);
    }
  }, [isStopped, isAllCompleted, myScore, recordActivityToDb]);

  // 5. Finalize Challenge & Sync XP to Profile & Activities
  const handleFinalizeAndExit = async () => {
    setSavingProgress(true);
    try {
      if (myScore > 0 && !activityRecordedRef.current) {
        await recordActivityToDb(myScore);
      }
      onFinish();
    } catch (err) {
      console.error("Error finalizing hunt session:", err);
      onFinish();
    } finally {
      setSavingProgress(false);
    }
  };

  const getProgressLabel = () => {
    try {
      const raw = t("hunt.progressLabel", "Ai găsit {count} din {total} quizz-uri");
      if (typeof raw === "string") {
        return raw
          .replace("{count}", String(completedCount))
          .replace("{total}", String(totalStations));
      }
    } catch {
      // Ignore string format error
    }
    return `Ai găsit ${completedCount} din ${totalStations} quizz-uri`;
  };

  if (!lobby?.id) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full px-6 py-12 text-center"
        style={{ minHeight: 500 }}
      >
        <div className="w-16 h-16 rounded-3xl bg-[#FFF4F6] border-2 border-[#FCC8D0] text-[#C0384E] flex items-center justify-center mb-4 shadow-lg text-2xl font-bold">
          ⚠️
        </div>
        <h3
          className="text-[18px] font-extrabold text-[#1A2816] mb-2"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          {t("hunt.noActiveSession", "Nicio sesiune activă găsită")}
        </h3>
        <p
          className="text-[13px] text-[#6B7C6B] mb-6 max-w-[280px]"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          {t(
            "hunt.sessionNotFoundDesc",
            "Nu a fost găsită o sesiune de joc activă. Te rugăm să te alături din nou unui lobby."
          )}
        </p>
        <button
          onClick={onFinish}
          className="w-full py-4 rounded-2xl bg-[#B3D59F] text-[#1A3312] font-extrabold text-[15px] shadow-md hover:bg-[#9DC885] active:scale-[0.98] transition-all cursor-pointer"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          {t("hunt.returnToDashboard", "Mergi la Dashboard")}
        </button>
      </div>
    );
  }

  // --- DEDICATED FINISH / STOPPED SCREEN ---
  if (isStopped || isAllCompleted) {
    const myRankIndex = participants.findIndex((p) => p.isCurrentUser);
    const myRankDisplay = myRankIndex >= 0 ? `#${myRankIndex + 1}` : "—";

    return (
      <div className="flex flex-col h-full px-5 py-5 justify-between overflow-y-auto scrollbar-none animate-fadeIn">
        <div className="space-y-4">
          {/* Header Status & Icon */}
          <div className="text-center pt-2">
            <div
              className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-3 shadow-lg ${
                isStopped
                  ? "bg-[#FFF4F6] border-2 border-[#FCC8D0] text-[#C0384E]"
                  : "bg-[#F0F8EC] border-2 border-[#B3D59F] text-[#3D6B2A] animate-bounce-short"
              }`}
            >
              {isStopped ? <AlertCircle size={40} /> : <Trophy size={40} />}
            </div>

            <span
              className={`inline-block text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2 border ${
                isStopped
                  ? "bg-[#FFF0F2] border-[#FCC8D0] text-[#C0384E]"
                  : "bg-[#E8F5E2] border-[#B3D59F] text-[#3D6B2A]"
              }`}
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {isStopped
                ? t("hunt.stoppedNoticeTitle", "Profesorul a oprit provocarea")
                : t("hunt.completedTitle", "Ai terminat challenge-ul!")}
            </span>

            <h3
              className="text-[22px] font-extrabold text-[#1A2816] mb-1 leading-tight"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {isStopped
                ? t("hunt.teacherStoppedTitle", "Profesorul a oprit provocarea")
                : t("lobby.greatJob", "Excelent!")}
            </h3>
            <p
              className="text-[13px] text-[#6B7C6B] max-w-[320px] mx-auto font-semibold leading-relaxed"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              {isStopped
                ? t(
                    "hunt.teacherStoppedDesc",
                    "Profesorul a încheiat această sesiune de provocare. Punctele și progresul tău au fost salvate cu succes!"
                  )
                : t(
                    "hunt.completedSubtitle",
                    "Excelent! Ai găsit și completat toate stațiile din această provocare."
                  )}
            </p>
          </div>

          {/* Stats Highlight Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-[#F7FBF5] border border-[#D4ECC5] rounded-2xl p-3 text-center shadow-sm">
              <span
                className="text-[10px] font-bold text-[#6B7C6B] uppercase block mb-1"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {t("hunt.scoreHeader", "Scor")}
              </span>
              <p
                className="text-[20px] font-extrabold text-[#3D6B2A] leading-none"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                +{myScore}
              </p>
              <span className="text-[10px] text-[#6B7C6B] font-bold">
                {t("hunt.pointsSuffix", "PCT")}
              </span>
            </div>

            <div className="bg-[#F7FBF5] border border-[#D4ECC5] rounded-2xl p-3 text-center shadow-sm">
              <span
                className="text-[10px] font-bold text-[#6B7C6B] uppercase block mb-1"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {t("hunt.stationsFound", "Stații")}
              </span>
              <p
                className="text-[20px] font-extrabold text-[#1A2816] leading-none"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {completedCount}
                <span className="text-[14px] text-[#6B7C6B] font-semibold">
                  /{totalStations}
                </span>
              </p>
              <span className="text-[10px] text-[#6B7C6B] font-bold">
                completate
              </span>
            </div>

            <div className="bg-[#F7FBF5] border border-[#D4ECC5] rounded-2xl p-3 text-center shadow-sm">
              <span
                className="text-[10px] font-bold text-[#6B7C6B] uppercase block mb-1"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {t("profile.globalRank", "Locul")}
              </span>
              <p
                className="text-[20px] font-extrabold text-[#1A3312] leading-none"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {myRankDisplay}
              </p>
              <span className="text-[10px] text-[#6B7C6B] font-bold">în sesiune</span>
            </div>
          </div>

          {/* Final Leaderboard Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Trophy size={16} className="text-[#3D6B2A]" />
                <h4
                  className="text-[13px] font-extrabold text-[#1A2816]"
                  style={{ fontFamily: "'Lexend', sans-serif" }}
                >
                  {t("hunt.liveLeaderboard", "Clasament Final")}
                </h4>
              </div>
              <span className="text-[11px] font-bold text-[#6B7C6B]">
                {participants.length} {t("hunt.studentHeader", "participanți")}
              </span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {participants.map((p, idx) => {
                const isMe = p.isCurrentUser;
                return (
                  <div
                    key={p.userId}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isMe
                        ? "bg-[#F0F8EC] border-[#3D6B2A] ring-2 ring-[#B3D59F]/50 shadow-sm"
                        : "bg-white border-[#E8EDE6]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-[11px] shrink-0 ${
                          idx === 0
                            ? "bg-[#FFE8A3] text-[#8C6200]"
                            : idx === 1
                            ? "bg-[#E2E8F0] text-[#475569]"
                            : idx === 2
                            ? "bg-[#FED7AA] text-[#9A3412]"
                            : isMe
                            ? "bg-[#3D6B2A] text-white"
                            : "bg-[#F0F5EE] text-[#6B7C6B]"
                        }`}
                        style={{ fontFamily: "'Lexend', sans-serif" }}
                      >
                        #{idx + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p
                            className={`text-[12px] font-extrabold truncate ${
                              isMe ? "text-[#1A3312]" : "text-[#1A2816]"
                            }`}
                            style={{ fontFamily: "'Lexend', sans-serif" }}
                          >
                            {p.name}
                          </p>
                          {isMe && (
                            <span className="text-[8px] font-extrabold bg-[#3D6B2A] text-white px-1.5 py-0.2 rounded uppercase">
                              TU
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-[#6B7C6B]">
                          {p.quizzesCompletedCount} / {totalStations}{" "}
                          {t("hunt.station", "stații")}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className="text-[12px] font-extrabold text-[#3D6B2A]"
                        style={{ fontFamily: "'Lexend', sans-serif" }}
                      >
                        +{p.score} {t("hunt.pointsSuffix", "PCT")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Button to Dashboard */}
        <div className="pt-3">
          <button
            type="button"
            onClick={handleFinalizeAndExit}
            disabled={savingProgress}
            className="w-full py-4 rounded-2xl bg-[#3D6B2A] text-white font-extrabold text-[15px] shadow-lg hover:bg-[#2F5220] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            <span>
              {savingProgress
                ? t("common.saving", "Se salvează...")
                : t("hunt.returnToDashboard", "Mergi la Dashboard")}
            </span>
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  }

  // --- ACTIVE HUNT SCREEN ---
  return (
    <div className="flex flex-col h-full px-5 py-4 justify-between overflow-y-auto scrollbar-none">
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-[#3D6B2A] bg-[#E8F5E2] border border-[#B3D59F] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {t("hunt.hubTitle", "Treasure Hunt")}
              </span>
            </div>
            <h2
              className="text-[20px] font-extrabold text-[#1A2816] mt-1"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {lobby?.school || "goMed Challenge"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-[#F0F8EC] border-2 border-[#B3D59F] px-3 py-1 rounded-2xl text-center">
              <span className="text-[9px] font-bold text-[#6B7C6B] block uppercase tracking-wider">
                {t("hunt.sessionCode", "Session Code")}
              </span>
              <span
                className="text-[14px] font-extrabold text-[#1A3312] font-mono tracking-wider"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {lobby?.code}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowLeaveConfirm(true)}
              className="p-2.5 rounded-2xl bg-[#FFF0F2] border border-[#FCC8D0] text-[#C0384E] hover:bg-[#FDE2E6] active:scale-95 transition-all cursor-pointer shadow-xs"
              title={t("hunt.leaveBtn", "Părăsește")}
              aria-label={t("hunt.leaveBtn", "Părăsește")}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Student Progress Tracker Card */}
        <div className="bg-[#F7FBF5] border-2 border-[#B3D59F] rounded-3xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#E8F5E2] text-[#3D6B2A] flex items-center justify-center font-extrabold text-[13px]">
                🎯
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#6B7C6B] block">
                  {t("hunt.progressHeader", "Progress")}
                </span>
                <p
                  className="text-[14px] font-extrabold text-[#1A2816]"
                  style={{ fontFamily: "'Lexend', sans-serif" }}
                >
                  {getProgressLabel()}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-[#6B7C6B] uppercase block">
                {t("hunt.scoreHeader", "Score")}
              </span>
              <span
                className="text-[16px] font-extrabold text-[#3D6B2A]"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                +{myScore} {t("hunt.pointsSuffix", "PTS")}
              </span>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-3 bg-[#E8EDE6] rounded-full overflow-hidden mb-2 relative">
            <div
              className="h-full bg-gradient-to-r from-[#70A558] to-[#3D6B2A] transition-all duration-500 rounded-full shadow-inner"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <p
            className="text-[11px] text-[#6B7C6B] text-center"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {t(
              "hunt.scanPrompt",
              "Find physical station QR codes around the venue to unlock questions!"
            )}
          </p>
        </div>

        {/* Live Leaderboard Table */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <Trophy size={16} className="text-[#3D6B2A]" />
              <h3
                className="text-[14px] font-extrabold text-[#1A2816]"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {t("hunt.liveLeaderboard", "Live Session Ranking")}
              </h3>
            </div>
            <span className="text-[11px] font-bold text-[#6B7C6B]">
              {participants.length} {t("hunt.studentHeader", "Students")}
            </span>
          </div>

          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {loading ? (
              <div className="py-6 text-center">
                <div className="w-6 h-6 border-2 border-[#B3D59F] border-t-[#3D6B2A] rounded-full animate-spin mx-auto mb-2" />
                <p className="text-[12px] font-bold text-[#6B7C6B]">
                  {t("common.loading", "Loading...")}
                </p>
              </div>
            ) : participants.length === 0 ? (
              <div className="py-6 text-center bg-[#F7FBF5] rounded-2xl border border-dashed border-[#D4ECC5]">
                <p
                  className="text-[12px] font-bold text-[#6B7C6B]"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  {t("hunt.noStudents", "No students in this session yet.")}
                </p>
              </div>
            ) : (
              participants.map((p, idx) => {
                const isMe = p.isCurrentUser;
                return (
                  <div
                    key={p.userId}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isMe
                        ? "bg-[#F0F8EC] border-[#3D6B2A] ring-2 ring-[#B3D59F]/50 shadow-sm"
                        : "bg-white border-[#E8EDE6] shadow-xs"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-[12px] shrink-0 ${
                          idx === 0
                            ? "bg-[#FFE8A3] text-[#8C6200]"
                            : idx === 1
                            ? "bg-[#E2E8F0] text-[#475569]"
                            : idx === 2
                            ? "bg-[#FED7AA] text-[#9A3412]"
                            : isMe
                            ? "bg-[#3D6B2A] text-white"
                            : "bg-[#F0F5EE] text-[#6B7C6B]"
                        }`}
                        style={{ fontFamily: "'Lexend', sans-serif" }}
                      >
                        #{idx + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p
                            className={`text-[13px] font-extrabold truncate ${
                              isMe ? "text-[#1A3312]" : "text-[#1A2816]"
                            }`}
                            style={{ fontFamily: "'Lexend', sans-serif" }}
                          >
                            {p.name}
                          </p>
                          {isMe && (
                            <span className="text-[9px] font-extrabold bg-[#3D6B2A] text-white px-1.5 py-0.2 rounded uppercase">
                              TU
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-[#6B7C6B]">
                          {p.quizzesCompletedCount} / {totalStations}{" "}
                          {t("hunt.station", "stations")}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className="text-[13px] font-extrabold text-[#3D6B2A]"
                        style={{ fontFamily: "'Lexend', sans-serif" }}
                      >
                        +{p.score} {t("hunt.pointsSuffix", "PTS")}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="pt-3">
        <button
          onClick={() => setIsScannerOpen(true)}
          className="w-full py-4 rounded-2xl bg-[#B3D59F] hover:bg-[#9DC885] text-[#1A3312] font-extrabold text-[16px] shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          <QrCode size={22} className="text-[#1A3312]" strokeWidth={2.2} />
          <span>{t("hunt.scanBtn", "Scan QR Code")}</span>
        </button>
      </div>

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#FCC8D0] text-center animate-scaleUp">
            <div className="w-14 h-14 bg-[#FFF0F2] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#C0384E]">
              <AlertTriangle size={28} />
            </div>
            <h3
              className="text-[18px] font-extrabold text-[#1A2816] mb-2"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {t("hunt.leaveConfirmTitle", "Părăsești vânătoarea?")}
            </h3>
            <p
              className="text-[13px] text-[#6B7C6B] leading-relaxed mb-6 font-semibold"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              {t(
                "hunt.leaveConfirmDesc",
                "Ești sigur că vrei să părăsești sesiunea? Nu vei mai putea reintra în acest lobby."
              )}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-[#D8E8D0] bg-[#F7FBF5] text-[#1A2816] font-bold text-[14px] hover:bg-[#E8F5E2] transition-all cursor-pointer"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {t("common.cancel", "Anulează")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLeaveConfirm(false);
                  handleFinalizeAndExit();
                }}
                className="flex-1 py-3 rounded-xl bg-[#C0384E] text-white font-bold text-[14px] shadow-md hover:bg-[#A32A3E] active:scale-95 transition-all cursor-pointer"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {t("hunt.confirmLeaveBtn", "Da, părăsește")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal with Whitelist and Anti-Cheat */}
      <TreasureHuntScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        allowedQuizzes={allowedQuizzes}
        completedQuizIds={completedQuizIds}
        onQuizDetected={(matchedQuiz) => {
          onScanStation(matchedQuiz);
        }}
      />
    </div>
  );
}
