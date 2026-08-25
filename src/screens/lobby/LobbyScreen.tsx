import React, { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import {
  QrCode,
  X,
  Send,
  Crown,
  ArrowRight,
  Clock,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { LobbyQRCodeModal } from "../../components/modals/LobbyQRCodeModal";
import { useLanguage } from "../../lib/i18n/LanguageContext";

interface LobbyScreenProps {
  initialLobby?: any;
  _onLeave?: () => void;
  onStartGame?: (lobby: any) => void;
  onLobbyJoined?: (lobby: any) => void;
  onKicked?: (lobbyId?: string) => void;
}

export function LobbyScreen({
  initialLobby,
  _onLeave,
  onStartGame,
  onLobbyJoined,
  onKicked,
}: LobbyScreenProps) {
  const { t } = useLanguage();
  const [code, setCode] = useState(initialLobby?.code || "");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [lobby, setLobby] = useState<any>(initialLobby || null);
  const [participants, setParticipants] = useState<
    { userId: string; name: string; isCurrentUser: boolean; isHost: boolean }[]
  >([]);
  const [showQRModal, setShowQRModal] = useState(Boolean(initialLobby?.isNewlyCreated));
  const [startingLobby, setStartingLobby] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  // Temporary 5-second kick cooldown map to prevent initial flicker without blocking re-joining
  const kickedUserCooldownsRef = useRef<Map<string, number>>(new Map());

  const webcamRef = useRef<Webcam>(null);
  const lastScannedRef = useRef<string>("");

  // Get current user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  const isHost = Boolean(currentUserId && lobby && lobby.host_id === currentUserId);

  // Helper to extract clean lobby code from text or full URL
  const extractCode = (raw: string) => {
    try {
      if (raw.includes("://")) {
        const url = new URL(raw);
        const param = url.searchParams.get("code");
        if (param) return param.trim().toUpperCase();
      }
      return raw.trim().toUpperCase();
    } catch {
      return raw.trim().toUpperCase();
    }
  };

  const fetchParticipants = useCallback(
    async (lobbyId: string, currentLobbyHostId?: string) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const currentUserName =
          user?.user_metadata?.display_name ||
          user?.email?.split("@")[0] ||
          "User";

        const { data, error } = await supabase
          .from("lobby_participants")
          .select("user_id, profiles(display_name)")
          .eq("lobby_id", lobbyId);

        const effectiveHostId = currentLobbyHostId || lobby?.host_id;

        // If regular user joined previously but was deleted from participants by host, trigger onKicked
        if (data && !error && user && user.id !== effectiveHostId) {
          const userStillInLobby = data.some((p: any) => p.user_id === user.id);
          if (!userStillInLobby && participants.length > 0) {
            onKicked?.(lobbyId);
            return;
          }
        }

        const list: {
          userId: string;
          name: string;
          isCurrentUser: boolean;
          isHost: boolean;
        }[] = [];

        if (data && !error && data.length > 0) {
          const now = Date.now();
          data
            // Filter out only if user was kicked in the last 5 seconds (allows re-join after 5s or on re-scan)
            .filter((p: any) => (kickedUserCooldownsRef.current.get(p.user_id) ?? 0) <= now)
            .forEach((p: any) => {
              const isCurrent = Boolean(user && p.user_id === user.id);
              const isLobbyHost = Boolean(effectiveHostId && p.user_id === effectiveHostId);
              const name =
                p.profiles?.display_name || (isCurrent ? currentUserName : "Participant");
              list.push({
                userId: p.user_id,
                name,
                isCurrentUser: isCurrent,
                isHost: isLobbyHost,
              });
            });

          // Only ensure host is present if host is viewing and not in participant rows
          if (user && effectiveHostId === user.id && !list.some((item) => item.userId === user.id)) {
            list.unshift({
              userId: user.id,
              name: currentUserName,
              isCurrentUser: true,
              isHost: true,
            });
          }
        } else if (user && effectiveHostId === user.id) {
          list.push({
            userId: user.id,
            name: currentUserName,
            isCurrentUser: true,
            isHost: true,
          });
        }

        setParticipants(list);
      } catch (err) {
        console.error("Error fetching participants:", err);
      }
    },
    [lobby?.host_id, participants.length, onKicked]
  );

  const verifyAndJoinLobby = useCallback(
    async (rawCode: string) => {
      const cleanCode = extractCode(rawCode);
      if (!cleanCode) {
        setErrorMsg("Please enter a valid lobby code.");
        return;
      }

      setLoading(true);
      setErrorMsg("");

      try {
        // 1. Check if lobby code exists in database
        const { data: lobbyData, error: lobbyError } = await supabase
          .from("lobbies")
          .select("id, code, school, status, max_players, host_id")
          .ilike("code", cleanCode)
          .single();

        if (lobbyError || !lobbyData) {
          setErrorMsg(`Lobby "${cleanCode}" not found. Please check code.`);
          setLobby(null);
          return;
        }

        setLobby(lobbyData);
        setCode(lobbyData.code);
        onLobbyJoined?.(lobbyData);

        // 2. Add logged-in user to lobby_participants
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const fallbackName =
            user.user_metadata?.display_name ||
            user.email?.split("@")[0] ||
            "User";

          await supabase.from("profiles").upsert(
            {
              id: user.id,
              display_name: fallbackName,
            },
            { onConflict: "id" }
          );

          await supabase.from("lobby_participants").upsert(
            {
              lobby_id: lobbyData.id,
              user_id: user.id,
              current_score: 0,
            },
            { onConflict: "lobby_id,user_id" }
          );
        }

        // 3. Fetch participants list
        await fetchParticipants(lobbyData.id, lobbyData.host_id);

        // 4. Broadcast join event to host and peers
        roomChannelRef.current?.send({
          type: "broadcast",
          event: "participant_joined",
          payload: { userId: user?.id, code: lobbyData.code },
        });
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to join lobby.");
      } finally {
        setLoading(false);
      }
    },
    [fetchParticipants, onLobbyJoined]
  );

  const roomChannelRef = useRef<any>(null);

  // If initial lobby provided, fetch participants on mount
  useEffect(() => {
    if (initialLobby?.id) {
      fetchParticipants(initialLobby.id, initialLobby.host_id);
    }
  }, [initialLobby, fetchParticipants]);

  // Robust Dual-Sync: Supabase Realtime (Postgres Changes + Direct Broadcast) + Periodic Heartbeat
  useEffect(() => {
    if (!lobby?.id) return;

    // 1. Unified Real-Time Channel
    const channel = supabase.channel(`lobby-room-${lobby.id}`, {
      config: {
        broadcast: { self: true },
      },
    });
    roomChannelRef.current = channel;

    channel
      // A. Listen to Postgres table changes for participants
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lobby_participants",
          filter: `lobby_id=eq.${lobby.id}`,
        },
        () => {
          fetchParticipants(lobby.id);
        }
      )
      // B. Listen to Postgres table changes for lobby status
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "lobbies",
          filter: `id=eq.${lobby.id}`,
        },
        (payload: any) => {
          if (payload.new?.status) {
            setLobby((prev: any) => ({ ...prev, status: payload.new.status }));
          }
        }
      )
      // C. Instant Peer-to-Peer Broadcast Events (0ms network latency)
      .on("broadcast", { event: "participant_joined" }, (payload: any) => {
        if (payload?.payload?.userId) {
          // Immediately unblock user if they re-scan / re-join
          kickedUserCooldownsRef.current.delete(payload.payload.userId);
        }
        fetchParticipants(lobby.id);
      })
      .on("broadcast", { event: "participant_kicked" }, (payload: any) => {
        if (payload?.payload?.targetUserId && payload.payload.targetUserId === currentUserId) {
          onKicked?.(lobby.id);
        } else {
          fetchParticipants(lobby.id);
        }
      })
      .on("broadcast", { event: "game_started" }, () => {
        setLobby((prev: any) => ({ ...prev, status: "active" }));
      })
      .subscribe();

    // 2. Heartbeat Sync Polling Fallback (Runs every 2s to guarantee mobile sync)
    const heartbeatTimer = setInterval(async () => {
      try {
        const { data: latestLobby } = await supabase
          .from("lobbies")
          .select("status")
          .eq("id", lobby.id)
          .single();

        if (latestLobby?.status && latestLobby.status !== lobby.status) {
          setLobby((prev: any) => ({ ...prev, status: latestLobby.status }));
        }

        // Periodically refresh participant count
        fetchParticipants(lobby.id);
      } catch (e) {
        console.warn("[LobbySync] Heartbeat poll error:", e);
      }
    }, 2000);

    return () => {
      clearInterval(heartbeatTimer);
      supabase.removeChannel(channel);
      roomChannelRef.current = null;
    };
  }, [lobby?.id, lobby?.status, fetchParticipants, currentUserId, onKicked]);

  // Trigger game start when lobby status becomes active
  useEffect(() => {
    if (lobby?.status === "active") {
      const timer = setTimeout(() => {
        onStartGame?.(lobby);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [lobby?.status, lobby, onStartGame]);

  // Kick participant handler (Host only)
  const handleKickParticipant = async (targetUserId: string) => {
    if (!lobby || !isHost) return;
    try {
      // 1. Add 5-second cooldown to avoid instant flicker
      kickedUserCooldownsRef.current.set(targetUserId, Date.now() + 5000);

      // 2. Immediately remove from local state
      setParticipants((prev) => prev.filter((p) => p.userId !== targetUserId));

      // 3. Delete from database
      await supabase
        .from("lobby_participants")
        .delete()
        .eq("lobby_id", lobby.id)
        .eq("user_id", targetUserId);

      // 4. Broadcast kick event to peer
      roomChannelRef.current?.send({
        type: "broadcast",
        event: "participant_kicked",
        payload: { targetUserId },
      });

      // 5. Re-fetch participants to verify
      await fetchParticipants(lobby.id);
    } catch (err) {
      console.error("Error kicking participant:", err);
    }
  };

  // Start lobby challenge handler (Host only)
  const handleStartLobby = async () => {
    if (!lobby || !isHost) return;
    setStartingLobby(true);
    try {
      const { error } = await supabase
        .from("lobbies")
        .update({ status: "active" })
        .eq("id", lobby.id);

      if (error) throw error;

      // Broadcast game started event immediately across the room
      roomChannelRef.current?.send({
        type: "broadcast",
        event: "game_started",
        payload: { lobbyId: lobby.id },
      });

      setLobby((prev: any) => ({ ...prev, status: "active" }));
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to start lobby.");
    } finally {
      setStartingLobby(false);
    }
  };

  // Webcam QR scanner loop
  const capture = useCallback(() => {
    if (webcamRef.current && !loading && !lobby) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const image = new Image();
        image.src = imageSrc;
        image.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const qrCodeData = jsQR(imageData.data, imageData.width, imageData.height);
            if (qrCodeData && qrCodeData.data) {
              const scanned = qrCodeData.data.trim();
              if (scanned && scanned !== lastScannedRef.current) {
                lastScannedRef.current = scanned;
                verifyAndJoinLobby(scanned);
              }
            }
          }
        };
      }
    }
  }, [webcamRef, loading, lobby, verifyAndJoinLobby]);

  useEffect(() => {
    const interval = setInterval(capture, 500);
    return () => clearInterval(interval);
  }, [capture]);

  return (
    <div className="flex flex-col px-5 py-5" style={{ minHeight: 740 }}>
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2
            className="text-[22px] font-extrabold text-[#1A2816]"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            {t("lobby.title", "Challenge Lobby")}
          </h2>
          <p
            className="text-[13px] text-[#6B7C6B] mt-0.5"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {lobby ? t("lobby.subtitleWaiting", "Waiting room & participants") : t("lobby.subtitleJoin", "Scan QR or enter code to join live session")}
          </p>
        </div>

        {lobby && (
          <button
            onClick={() => setShowQRModal(true)}
            className="flex items-center gap-1.5 bg-[#F0F8EC] border border-[#D4ECC5] text-[#3D6B2A] px-3 py-1.5 rounded-xl text-[12px] font-extrabold shadow-sm hover:bg-[#E2F0DC] active:scale-95 transition-all cursor-pointer"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            <QrCode size={16} /> {t("lobby.qrCodeBtn", "QR Code")}
          </button>
        )}
      </div>

      {/* Feedback / Error banner */}
      {errorMsg && (
        <div
          className="mb-4 bg-[#FFF4F6] border border-[#FCC8D0] text-[#C0384E] text-[13px] px-4 py-3 rounded-2xl font-semibold flex items-center justify-between"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          <span>{errorMsg}</span>
          <button
            onClick={() => setErrorMsg("")}
            className="text-current opacity-70 hover:opacity-100 p-1 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Lobby Active Info Card */}
      {lobby && (
        <div
          className="mb-4 bg-[#F0F8EC] border border-[#D4ECC5] text-[#1A3312] p-4 rounded-2xl flex items-center justify-between shadow-sm"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-[11px] font-bold text-[#3D6B2A] uppercase tracking-wider block"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {t("lobby.roomCode", "Room Code")} · {lobby.code}
              </span>
              {isHost && (
                <span
                  className="bg-[#1A3312] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 uppercase tracking-wider"
                  style={{ fontFamily: "'Lexend', sans-serif" }}
                >
                  <Crown size={10} /> {t("lobby.youAreHost", "You are Host")}
                </span>
              )}
            </div>
            <p
              className="text-[16px] font-extrabold text-[#1A2816]"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {lobby.school}
            </p>
          </div>
          <span
            className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase ${
              lobby.status === "active"
                ? "bg-[#3D6B2A] text-white animate-pulse"
                : "bg-[#B3D59F] text-[#1A3312]"
            }`}
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            {lobby.status}
          </span>
        </div>
      )}

      {/* Camera viewfinder (hidden once joined) */}
      {!lobby && (
        <div
          className="bg-[#1A2816] rounded-3xl overflow-hidden mb-4 relative mx-auto w-full"
          style={{ aspectRatio: "1/1", maxWidth: 300 }}
        >
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "environment" }}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Corner brackets */}
          {([
            ["top-4 left-4", "rounded-tl-xl border-t-2 border-l-2 border-r-0 border-b-0"],
            ["top-4 right-4", "rounded-tr-xl border-t-2 border-r-2 border-l-0 border-b-0"],
            ["bottom-4 left-4", "rounded-bl-xl border-b-2 border-l-2 border-r-0 border-t-0"],
            ["bottom-4 right-4", "rounded-br-xl border-b-2 border-r-2 border-l-0 border-t-0"],
          ] as [string, string][]).map(([pos, border], i) => (
            <div
              key={i}
              className={`absolute ${pos} w-9 h-9 ${border} border-[#B3D59F] z-10`}
            />
          ))}

          {/* Scan line */}
          <div
            className="absolute left-8 right-8 h-0.5 bg-[#B3D59F]/70 z-10"
            style={{
              top: "50%",
              boxShadow: "0 0 10px #B3D59F",
              animation: "scanline 2.2s ease-in-out infinite",
            }}
          />

          {/* Bottom label */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10">
            <span
              className="bg-black/60 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full backdrop-blur-sm"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {loading ? t("lobby.verifyingQR", "Verifying QR Code...") : t("lobby.pointCamera", "Point camera at lobby QR")}
            </span>
          </div>
        </div>
      )}

      {/* Manual code input form */}
      {!lobby && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#E0EAD8]" />
            <span
              className="text-[12px] font-bold text-[#6B7C6B] bg-[#F0F5EE] px-3 py-1 rounded-full"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {t("lobby.orEnterCode", "OR ENTER CODE")}
            </span>
            <div className="flex-1 h-px bg-[#E0EAD8]" />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              verifyAndJoinLobby(code);
            }}
            className="flex gap-2 mb-4"
          >
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={t("lobby.codePlaceholder", "e.g. MED123")}
              maxLength={12}
              className="flex-1 px-4 py-3.5 rounded-xl border border-[#D8E8D0] bg-[#F7FBF5] text-[#1A2816] placeholder-[#6B7C6B] focus:outline-none focus:border-[#B3D59F] focus:ring-2 focus:ring-[#B3D59F]/30 transition-all text-[15px] font-mono tracking-widest uppercase font-bold"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-12 h-12 rounded-xl bg-[#B3D59F] flex items-center justify-center hover:bg-[#9DC885] active:scale-95 transition-all shrink-0 shadow-sm self-center disabled:opacity-60 cursor-pointer"
              title="Join Lobby"
            >
              <Send size={16} className="text-[#1A3312]" />
            </button>
          </form>
        </>
      )}

      {/* Participants waiting area */}
      <div className="bg-[#F7FBF5] border border-[#D4ECC5] rounded-2xl p-4 flex-1 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-2.5 h-2.5 rounded-full bg-[#B3D59F]"
            style={{ animation: "pulse 1.5s ease-in-out infinite" }}
          />
          <p
            className="text-[14px] font-bold text-[#1A2816]"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            {lobby ? t("lobby.participantsReady", "Participants Ready") : t("lobby.lobbyParticipants", "Lobby Participants")}
          </p>
          <span
            className="ml-auto text-[11px] text-[#6B7C6B] bg-white border border-[#D4ECC5] px-2.5 py-0.5 rounded-lg font-bold"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            {participants.length}/{lobby?.max_players || 8}
          </span>
        </div>

        <div className="space-y-2.5">
          {participants.map((p, i) => (
            <div
              key={p.userId || i}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
                p.isCurrentUser
                  ? "bg-[#F0F8EC] border-[#B3D59F] shadow-sm"
                  : "bg-white border-[#E8EDE6]"
              }`}
            >
              {/* Host kick button (shown on left for other participants) */}
              {isHost && !p.isCurrentUser && (
                <button
                  type="button"
                  onClick={() => handleKickParticipant(p.userId)}
                  className="w-7 h-7 rounded-lg bg-[#FFF0F2] text-[#C0384E] hover:bg-[#FDE2E6] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                  title={`Kick ${p.name}`}
                  aria-label={`Kick ${p.name}`}
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              )}

              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  p.isCurrentUser ? "bg-[#3D6B2A] text-white" : "bg-[#B3D59F] text-[#1A3312]"
                }`}
              >
                <span className="text-[12px] font-bold" style={{ fontFamily: "'Lexend', sans-serif" }}>
                  {p.name.charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span
                  className={`text-[14px] truncate ${
                    p.isCurrentUser ? "text-[#1A3312] font-extrabold" : "text-[#1A2816] font-semibold"
                  }`}
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  {p.name}
                </span>

                {p.isHost && (
                  <span
                    className="text-[9px] font-extrabold text-[#3D6B2A] bg-[#E8F5E2] border border-[#B3D59F] px-1.5 py-0.5 rounded flex items-center gap-0.5 uppercase tracking-wider shrink-0"
                    style={{ fontFamily: "'Lexend', sans-serif" }}
                  >
                    <Crown size={9} /> {t("lobby.hostBadge", "HOST")}
                  </span>
                )}
              </div>

              {p.isCurrentUser && (
                <span
                  className="ml-auto text-[10px] font-extrabold text-[#3D6B2A] bg-white border border-[#B3D59F] px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0"
                  style={{ fontFamily: "'Lexend', sans-serif" }}
                >
                  {t("lobby.youBadge", "YOU")}
                </span>
              )}
            </div>
          ))}

          {participants.length === 0 && (
            <div
              className="py-6 text-center text-[#6B7C6B] text-[13px]"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              {lobby
                ? t("lobby.waitingScan", "Waiting for participants to scan and join...")
                : t("lobby.scanInstruction", "Scan a QR code or enter a room code above.")}
            </div>
          )}
        </div>
      </div>

      {/* Host Controls & Action Buttons */}
      {lobby && (
        <div className="pt-2">
          {lobby.status === "active" ? (
            <div
              className="bg-[#3D6B2A] text-white p-4 rounded-2xl text-center font-extrabold text-[15px] shadow-lg animate-pulse flex items-center justify-center gap-2"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              {t("lobby.startingChallenge", "Starting Challenge Questions...")}
            </div>
          ) : isHost ? (
            <button
              onClick={handleStartLobby}
              disabled={startingLobby || participants.length === 0}
              className="w-full py-4 rounded-2xl bg-[#B3D59F] text-[#1A3312] font-extrabold text-[16px] shadow-md hover:bg-[#9DC885] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {startingLobby ? t("lobby.startingSession", "Starting Session...") : t("lobby.startChallengeNow", "Start Challenge Now")}
              <ArrowRight size={18} strokeWidth={2.5} />
            </button>
          ) : (
            <div
              className="flex items-center justify-center gap-2 p-3 bg-white border border-[#E8EDE6] rounded-2xl text-[#6B7C6B] text-[13px] font-semibold"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              <Clock size={15} className="text-[#3D6B2A] animate-spin" />
              {t("lobby.waitingHost", "Waiting for host to start challenge...")}
            </div>
          )}
        </div>
      )}

      {/* Modal to Broadcast QR Code to Classroom */}
      <LobbyQRCodeModal
        isOpen={showQRModal}
        lobby={lobby}
        onClose={() => setShowQRModal(false)}
      />
    </div>
  );
}
