import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Clock,
  QrCode,
  AlertOctagon,
  Users,
  Trophy,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { TeacherQRPrintModal } from "../../components/modals/TeacherQRPrintModal";
import { storage, STORAGE_KEYS } from "../../lib/storage";

interface TeacherHuntControllerScreenProps {
  lobby?: any;
  onFinish: () => void;
}

interface StudentRankEntry {
  userId: string;
  name: string;
  score: number;
  quizzesCompletedCount: number;
  completedQuizIds: string[];
  isFinished: boolean;
}

export function TeacherHuntControllerScreen({
  lobby: propLobby,
  onFinish,
}: TeacherHuntControllerScreenProps) {
  const { t } = useLanguage();
  const lobby = propLobby || storage.get(STORAGE_KEYS.ACTIVE_LOBBY, null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [students, setStudents] = useState<StudentRankEntry[]>([]);
  const [allowedQuizzes, setAllowedQuizzes] = useState<any[]>([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [isStoppedByMe, setIsStoppedByMe] = useState(false);
  const [loading, setLoading] = useState(true);

  const channelRef = useRef<any>(null);

  const isAllFinished =
    students.length > 0 && students.every((s) => s.isFinished);

  // 1. Elapsed Timer (mm:ss) - pauses when challenge stops or finishes
  useEffect(() => {
    if (isStoppedByMe || isAllFinished) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isStoppedByMe, isAllFinished]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

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

  // 3. Fetch Real-Time Student Progress
  const fetchStudentProgress = useCallback(async () => {
    if (!lobby?.id) return;
    try {
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
        const totalQuizzes = allowedQuizzes.length || 1;

        const mapped: StudentRankEntry[] = filtered.map((p: any) => {
          const completedList = Array.isArray(p.completed_quiz_ids) ? p.completed_quiz_ids : [];
          const count = p.quizzes_completed_count ?? completedList.length ?? 0;
          return {
            userId: p.user_id,
            name: p.profiles?.display_name || "Student",
            score: p.current_score || 0,
            quizzesCompletedCount: count,
            completedQuizIds: completedList,
            isFinished: totalQuizzes > 0 && count >= totalQuizzes,
          };
        });

        mapped.sort((a, b) => {
          if (b.quizzesCompletedCount !== a.quizzesCompletedCount) {
            return b.quizzesCompletedCount - a.quizzesCompletedCount;
          }
          return b.score - a.score;
        });

        setStudents(mapped);
      }
    } catch (err) {
      console.error("Error fetching student progress:", err);
    } finally {
      setLoading(false);
    }
  }, [lobby?.id, lobby?.host_id, allowedQuizzes.length]);

  // 4. Supabase Realtime Channel & Polling Fallback
  useEffect(() => {
    if (!lobby?.id) return;
    fetchStudentProgress();

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
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "hunt_progress_updated" }, () => {
        fetchStudentProgress();
      })
      .on("broadcast", { event: "participant_joined" }, () => {
        fetchStudentProgress();
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
          fetchStudentProgress();
        }
      )
      .subscribe();

    const interval = setInterval(fetchStudentProgress, 2000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [lobby?.id, fetchStudentProgress]);

  // 5. If all students finish naturally, automatically stop the lobby
  useEffect(() => {
    if (isAllFinished && lobby?.id && !isStoppedByMe) {
      supabase
        .from("lobbies")
        .update({ status: "stopped" })
        .eq("id", lobby.id)
        .then(() => {
          channelRef.current?.send({
            type: "broadcast",
            event: "lobby_stopped",
            payload: { lobbyId: lobby.id },
          });
        });
    }
  }, [isAllFinished, lobby?.id, isStoppedByMe]);

  // 6. Handle Stop Challenge
  const handleStopChallenge = async () => {
    if (!lobby?.id) return;
    setStopping(true);
    try {
      await supabase
        .from("lobbies")
        .update({ status: "stopped" })
        .eq("id", lobby.id);

      channelRef.current?.send({
        type: "broadcast",
        event: "lobby_stopped",
        payload: { lobbyId: lobby.id },
      });

      setShowStopConfirm(false);
      setIsStoppedByMe(true);
    } catch (err) {
      console.error("Failed to stop challenge:", err);
    } finally {
      setStopping(false);
    }
  };

  const totalStations = allowedQuizzes.length || 10;

  // --- DEDICATED TEACHER FINISH / LEADERBOARD VIEW ---
  if (isStoppedByMe || isAllFinished) {
    return (
      <div className="flex flex-col h-full px-5 py-5 justify-between overflow-y-auto scrollbar-none animate-fadeIn">
        <div className="space-y-4">
          {/* Header Status & Icon */}
          <div className="text-center pt-2">
            <div
              className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-3 shadow-lg ${
                isStoppedByMe
                  ? "bg-[#FFF4F6] border-2 border-[#FCC8D0] text-[#C0384E]"
                  : "bg-[#F0F8EC] border-2 border-[#B3D59F] text-[#3D6B2A] animate-bounce-short"
              }`}
            >
              {isStoppedByMe ? <AlertOctagon size={40} /> : <Trophy size={40} />}
            </div>

            <span
              className={`inline-block text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2 border ${
                isStoppedByMe
                  ? "bg-[#FFF0F2] border-[#FCC8D0] text-[#C0384E]"
                  : "bg-[#E8F5E2] border-[#B3D59F] text-[#3D6B2A]"
              }`}
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {isStoppedByMe
                ? t("hunt.teacherStoppedSelfTitle", "Ai oprit provocarea")
                : t("hunt.allFinishedTitle", "Toți elevii au finalizat provocarea!")}
            </span>

            <h3
              className="text-[22px] font-extrabold text-[#1A2816] mb-1 leading-tight"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {isStoppedByMe
                ? t("hunt.teacherStoppedSelfTitle", "Ai oprit provocarea")
                : t("hunt.allFinishedTitle", "Toți elevii au finalizat!")}
            </h3>
            <p
              className="text-[13px] text-[#6B7C6B] max-w-[320px] mx-auto font-semibold leading-relaxed"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              {isStoppedByMe
                ? t(
                    "hunt.teacherStoppedSelfDesc",
                    "Ai încheiat această sesiune de provocare. Mai jos poți consulta clasamentul final al clasei."
                  )
                : t(
                    "hunt.allFinishedDesc",
                    "Toți elevii din clasă au găsit și completat toate stațiile de prim ajutor."
                  )}
            </p>
          </div>

          {/* Session Overview Stats */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-[#1A2816] text-white rounded-2xl p-3 text-center shadow-sm">
              <span
                className="text-[10px] font-bold text-[#A8C895] uppercase block mb-1"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {t("hunt.elapsedTime", "Timp Scurs")}
              </span>
              <p
                className="text-[17px] font-extrabold font-mono text-white leading-none"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {formatTimer(elapsedSeconds)}
              </p>
            </div>

            <div className="bg-[#F7FBF5] border border-[#D4ECC5] rounded-2xl p-3 text-center shadow-sm">
              <span
                className="text-[10px] font-bold text-[#6B7C6B] uppercase block mb-1"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {t("hunt.studentHeader", "Elevi")}
              </span>
              <p
                className="text-[18px] font-extrabold text-[#1A2816] leading-none"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {students.length}
              </p>
              <span className="text-[10px] text-[#6B7C6B] font-bold">înscriși</span>
            </div>

            <div className="bg-[#F7FBF5] border border-[#D4ECC5] rounded-2xl p-3 text-center shadow-sm">
              <span
                className="text-[10px] font-bold text-[#6B7C6B] uppercase block mb-1"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {t("hunt.activeStations", "Stații")}
              </span>
              <p
                className="text-[18px] font-extrabold text-[#3D6B2A] leading-none"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {totalStations}
              </p>
              <span className="text-[10px] text-[#6B7C6B] font-bold">totale</span>
            </div>
          </div>

          {/* Final Classroom Leaderboard */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Trophy size={16} className="text-[#3D6B2A]" />
                <h4
                  className="text-[13px] font-extrabold text-[#1A2816]"
                  style={{ fontFamily: "'Lexend', sans-serif" }}
                >
                  {t("hunt.finalLeaderboard", "Clasament Final Elevi")}
                </h4>
              </div>
              <span className="text-[11px] font-bold text-[#6B7C6B]">
                {students.length} {t("hunt.studentHeader", "elevi")}
              </span>
            </div>

            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {students.length === 0 ? (
                <div className="py-6 text-center bg-[#F7FBF5] rounded-2xl border border-dashed border-[#D4ECC5]">
                  <p className="text-[12px] font-bold text-[#6B7C6B]">
                    {t("hunt.noStudents", "Niciun elev în această sesiune.")}
                  </p>
                </div>
              ) : (
                students.map((student, idx) => (
                  <div
                    key={student.userId}
                    className="p-3 rounded-2xl bg-white border border-[#E8EDE6] shadow-xs flex items-center justify-between gap-3"
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
                            : "bg-[#F0F5EE] text-[#6B7C6B]"
                        }`}
                        style={{ fontFamily: "'Lexend', sans-serif" }}
                      >
                        #{idx + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p
                            className="text-[13px] font-extrabold text-[#1A2816] truncate"
                            style={{ fontFamily: "'Lexend', sans-serif" }}
                          >
                            {student.name}
                          </p>
                          {student.isFinished && (
                            <span className="bg-[#E8F5E2] text-[#3D6B2A] text-[9px] font-extrabold px-1.5 py-0.2 rounded-md uppercase">
                              GATA
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-[#6B7C6B]">
                          {student.quizzesCompletedCount} / {totalStations}{" "}
                          {t("hunt.station", "stații")}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className="text-[13px] font-extrabold text-[#3D6B2A]"
                        style={{ fontFamily: "'Lexend', sans-serif" }}
                      >
                        +{student.score} {t("hunt.pointsSuffix", "PCT")}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Action Button: Mergi la Dashboard */}
        <div className="pt-3">
          <button
            type="button"
            onClick={onFinish}
            className="w-full py-4 rounded-2xl bg-[#3D6B2A] text-white font-extrabold text-[15px] shadow-lg hover:bg-[#2F5220] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            <span>{t("hunt.returnToDashboard", "Mergi la Dashboard")}</span>
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  }

  // --- ACTIVE CONTROLLER SCREEN ---
  return (
    <div className="flex flex-col h-full px-5 py-4 justify-between overflow-y-auto scrollbar-none">
      <div className="space-y-4">
        {/* Top Controller Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-[#3D6B2A] bg-[#E8F5E2] border border-[#B3D59F] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {t("hunt.title", "Treasure Hunt Controller")}
              </span>
            </div>
            <h2
              className="text-[20px] font-extrabold text-[#1A2816] mt-1"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {lobby?.school || "goMed Challenge"}
            </h2>
          </div>

          <div className="bg-[#F0F8EC] border-2 border-[#B3D59F] px-3.5 py-1.5 rounded-2xl text-center">
            <span className="text-[9px] font-bold text-[#6B7C6B] block uppercase tracking-wider">
              {t("hunt.sessionCode", "Session Code")}
            </span>
            <span
              className="text-[15px] font-extrabold text-[#1A3312] font-mono tracking-wider"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {lobby?.code}
            </span>
          </div>
        </div>

        {/* Live Timer & Stats Bar */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1A2816] text-white p-3.5 rounded-2xl border border-[#2D4522] shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#283C22] flex items-center justify-center text-[#B3D59F] shrink-0">
              <Clock size={22} className="animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#A8C895] uppercase tracking-wider block">
                {t("hunt.elapsedTime", "Elapsed Time")}
              </span>
              <span
                className="text-[20px] font-extrabold font-mono tracking-wider text-white"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {formatTimer(elapsedSeconds)}
              </span>
            </div>
          </div>

          <div className="bg-[#F7FBF5] border border-[#D4ECC5] p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5E2] text-[#3D6B2A] flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#6B7C6B] uppercase tracking-wider block">
                {t("hunt.studentHeader", "Students")}
              </span>
              <span
                className="text-[18px] font-extrabold text-[#1A2816]"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {students.length}{" "}
                <span className="text-[11px] font-bold text-[#6B7C6B]">
                  ({totalStations} {t("hunt.station", "stations")})
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* View QR Codes CTA Button */}
        <button
          onClick={() => setShowQRModal(true)}
          className="w-full py-3 px-4 bg-white hover:bg-[#F7FBF5] border-2 border-[#B3D59F] rounded-2xl text-[#1A3312] font-extrabold text-[14px] flex items-center justify-between shadow-sm active:scale-[0.99] transition-all cursor-pointer"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#E8F5E2] text-[#3D6B2A] flex items-center justify-center">
              <QrCode size={16} />
            </div>
            <span>{t("hunt.viewQRs", "View & Print QR Codes")}</span>
          </div>
          <ChevronRight size={18} className="text-[#3D6B2A]" />
        </button>

        {/* Live Student Ranking Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Trophy size={16} className="text-[#3D6B2A]" />
              <h3
                className="text-[14px] font-extrabold text-[#1A2816]"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {t("hunt.studentsRankTitle", "Live Student Ranking")}
              </h3>
            </div>
            <span className="text-[11px] font-bold text-[#6B7C6B]">
              {students.length} {t("hunt.studentHeader", "Students")}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {loading ? (
              <div className="py-6 text-center">
                <div className="w-6 h-6 border-2 border-[#B3D59F] border-t-[#3D6B2A] rounded-full animate-spin mx-auto mb-2" />
                <p className="text-[12px] font-bold text-[#6B7C6B]">
                  {t("common.loading", "Loading...")}
                </p>
              </div>
            ) : students.length === 0 ? (
              <div className="py-8 text-center bg-[#F7FBF5] rounded-3xl border-2 border-dashed border-[#D4ECC5] p-4">
                <Users size={28} className="mx-auto text-[#B3D59F] mb-1.5" />
                <p
                  className="text-[13px] font-extrabold text-[#1A2816]"
                  style={{ fontFamily: "'Lexend', sans-serif" }}
                >
                  {t("hunt.noStudents", "No students in this session yet.")}
                </p>
                <p
                  className="text-[11px] text-[#6B7C6B] mt-0.5"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  Share the session code or QR with your students to begin.
                </p>
              </div>
            ) : (
              students.map((student, idx) => (
                <div
                  key={student.userId}
                  className="p-3.5 rounded-2xl bg-white border border-[#E8EDE6] shadow-sm flex items-center justify-between gap-3 hover:border-[#B3D59F] transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-[12px] shrink-0 ${
                        idx === 0
                          ? "bg-[#FFE8A3] text-[#8C6200]"
                          : idx === 1
                          ? "bg-[#E2E8F0] text-[#475569]"
                          : idx === 2
                          ? "bg-[#FED7AA] text-[#9A3412]"
                          : "bg-[#F0F5EE] text-[#6B7C6B]"
                      }`}
                      style={{ fontFamily: "'Lexend', sans-serif" }}
                    >
                      #{idx + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className="text-[14px] font-extrabold text-[#1A2816] truncate"
                          style={{ fontFamily: "'Lexend', sans-serif" }}
                        >
                          {student.name}
                        </p>
                        {student.isFinished && (
                          <span className="flex items-center gap-0.5 bg-[#E8F5E2] text-[#3D6B2A] text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                            <CheckCircle2 size={10} /> Finished
                          </span>
                        )}
                      </div>

                      {/* Station Dots Progress */}
                      <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                        {Array.from({ length: totalStations }).map((_, sIdx) => {
                          const isDone = sIdx < student.quizzesCompletedCount;
                          return (
                            <div
                              key={sIdx}
                              className={`w-2 h-2 rounded-full transition-all ${
                                isDone ? "bg-[#3D6B2A]" : "bg-[#E0EAD8]"
                              }`}
                              title={`Station ${sIdx + 1}: ${
                                isDone ? "Completed" : "Pending"
                              }`}
                            />
                          );
                        })}
                        <span className="text-[10px] font-bold text-[#6B7C6B] ml-1.5">
                          {student.quizzesCompletedCount}/{totalStations}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className="text-[15px] font-extrabold text-[#3D6B2A]"
                      style={{ fontFamily: "'Lexend', sans-serif" }}
                    >
                      +{student.score}{" "}
                      <span className="text-[11px] text-[#6B7C6B]">
                        {t("hunt.pointsSuffix", "PTS")}
                      </span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Stop Challenge CTA Bottom Bar */}
      <div className="pt-3">
        <button
          onClick={() => setShowStopConfirm(true)}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#FFF0F2] border-2 border-[#FAD2D2] text-[#C0384E] hover:bg-[#FCE4E8] active:scale-[0.98] font-extrabold text-[14px] flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          <AlertOctagon size={18} />
          <span>{t("hunt.stopChallenge", "Stop Challenge")}</span>
        </button>
      </div>

      {/* QR Codes Modal */}
      <TeacherQRPrintModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        selectedStationIds={allowedQuizzes.map((q) => q.code || q.id)}
      />

      {/* Stop Confirmation Dialog Modal */}
      {showStopConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-[#FAD2D2] shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF0F2] text-[#C0384E] flex items-center justify-center mx-auto">
              <ShieldAlert size={30} />
            </div>

            <div>
              <h3
                className="text-[17px] font-extrabold text-[#1A2816] mb-1"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {t("hunt.stopConfirmTitle", "Stop Challenge Session?")}
              </h3>
              <p
                className="text-[12px] text-[#6B7C6B] leading-snug"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {t(
                  "hunt.stopConfirmDesc",
                  "All participants will be notified and the hunt will conclude immediately. Points earned will be preserved."
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={() => setShowStopConfirm(false)}
                disabled={stopping}
                className="py-3 rounded-xl bg-[#F0F5EE] text-[#1A2816] font-bold text-[13px] hover:bg-[#E8EDE6] transition-all cursor-pointer"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {t("common.cancel", "Cancel")}
              </button>
              <button
                onClick={handleStopChallenge}
                disabled={stopping}
                className="py-3 rounded-xl bg-[#C0384E] hover:bg-[#A82B40] text-white font-extrabold text-[13px] transition-all shadow-md active:scale-95 cursor-pointer"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {stopping
                  ? t("hunt.stoppingBtn", "Stopping...")
                  : t("hunt.confirmStopBtn", "Yes, Stop Challenge")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
