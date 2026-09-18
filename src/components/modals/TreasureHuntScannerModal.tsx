import React, { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import { X, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";
import { useLanguage } from "../../lib/i18n/LanguageContext";

interface TreasureHuntScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  allowedQuizzes: Array<{ id: string; code?: string; name?: string; category?: string }>;
  completedQuizIds: string[];
  onQuizDetected: (matchedQuiz: any) => void;
}

export function TreasureHuntScannerModal({
  isOpen,
  onClose,
  allowedQuizzes,
  completedQuizIds,
  onQuizDetected,
}: TreasureHuntScannerModalProps) {
  const { t } = useLanguage();
  const webcamRef = useRef<Webcam>(null);
  const lastScannedRawRef = useRef<string>("");
  const scanLockRef = useRef<boolean>(false);

  const [feedback, setFeedback] = useState<{
    type: "error" | "warning" | "success";
    title?: string;
    message: string;
  } | null>(null);

  // Helper to extract clean station ID from scanned payload
  const parseStationPayload = (raw: string): string => {
    const trimmed = raw.trim();
    if (trimmed.toUpperCase().startsWith("GOMED:STATION:")) {
      return trimmed.substring("GOMED:STATION:".length).trim().toLowerCase();
    }
    if (trimmed.includes("://")) {
      try {
        const url = new URL(trimmed);
        const paramStation =
          url.searchParams.get("station") ||
          url.searchParams.get("quiz") ||
          url.searchParams.get("code");
        if (paramStation) return paramStation.trim().toLowerCase();
        const segments = url.pathname.split("/").filter(Boolean);
        if (segments.length > 0) return segments[segments.length - 1].toLowerCase();
      } catch {
        // Ignore URL parse error
      }
    }
    return trimmed.toLowerCase();
  };

  const handleDecodedQR = useCallback(
    (rawCode: string) => {
      if (scanLockRef.current) return;
      const cleanStation = parseStationPayload(rawCode);
      if (!cleanStation) return;

      // 1. Whitelist Check: Find if station matches any allowed quiz in this lobby
      const matched = allowedQuizzes.find((q) => {
        const idLower = (q.id || "").toLowerCase();
        const codeLower = (q.code || "").toLowerCase();
        const cleanNoUnder = cleanStation.replace(/[-_]/g, "");
        return (
          idLower === cleanStation ||
          codeLower === cleanStation ||
          idLower.replace(/[-_]/g, "") === cleanNoUnder ||
          codeLower.replace(/[-_]/g, "") === cleanNoUnder
        );
      });

      if (!matched) {
        scanLockRef.current = true;
        setFeedback({
          type: "error",
          message: t(
            "hunt.invalidStation",
            "This QR code is not part of today's challenge! Look for another station."
          ),
        });
        setTimeout(() => {
          setFeedback(null);
          scanLockRef.current = false;
          lastScannedRawRef.current = "";
        }, 3000);
        return;
      }

      // 2. Duplicate Check: Find if student already completed this quiz
      const isAlreadyCompleted = completedQuizIds.some((doneId) => {
        const doneLower = (doneId || "").toLowerCase();
        return (
          doneLower === matched.id.toLowerCase() ||
          (matched.code && doneLower === matched.code.toLowerCase())
        );
      });

      if (isAlreadyCompleted) {
        scanLockRef.current = true;
        setFeedback({
          type: "warning",
          message: t(
            "hunt.alreadyCompleted",
            "You already completed this quiz! Look for the next station."
          ),
        });
        setTimeout(() => {
          setFeedback(null);
          scanLockRef.current = false;
          lastScannedRawRef.current = "";
        }, 3000);
        return;
      }

      // 3. Valid and New Station Found!
      scanLockRef.current = true;
      setFeedback({
        type: "success",
        title: matched.name || matched.code,
        message: t("hunt.validStationFound", "Station found! Loading questions..."),
      });

      setTimeout(() => {
        onQuizDetected(matched);
        onClose();
        scanLockRef.current = false;
        setFeedback(null);
        lastScannedRawRef.current = "";
      }, 750);
    },
    [allowedQuizzes, completedQuizIds, onQuizDetected, onClose, t]
  );

  // Continuous Camera Frame Scanning Loop
  const capture = useCallback(() => {
    if (!isOpen || scanLockRef.current || !webcamRef.current) return;
    try {
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
              if (scanned && scanned !== lastScannedRawRef.current) {
                lastScannedRawRef.current = scanned;
                handleDecodedQR(scanned);
              }
            }
          }
        };
      }
    } catch (e) {
      console.warn("QR frame scan exception:", e);
    }
  }, [isOpen, handleDecodedQR]);

  useEffect(() => {
    if (!isOpen) {
      setFeedback(null);
      scanLockRef.current = false;
      lastScannedRawRef.current = "";
      return;
    }
    const interval = setInterval(capture, 350);
    return () => clearInterval(interval);
  }, [isOpen, capture]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-[390px] h-[640px] bg-[#121A10] rounded-[36px] overflow-hidden border border-[#2D4522] shadow-2xl flex flex-col justify-between">
        {/* Top Floating Controls */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
          <div className="bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 flex items-center gap-2 text-white">
            <Sparkles size={14} className="text-[#B3D59F]" />
            <span
              className="text-[12px] font-extrabold tracking-wide uppercase"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {t("hunt.scannerTitle", "Scan Station QR")}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer"
            aria-label="Close Scanner"
          >
            <X size={20} />
          </button>
        </div>

        {/* Camera Viewport */}
        <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "environment" }}
            className="w-full h-full object-cover"
          />

          {/* Viewfinder Target Box with Corner Accents */}
          <div className="absolute w-[240px] h-[240px] pointer-events-none flex items-center justify-center">
            {/* Outer Target Corners */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#B3D59F] rounded-tl-xl shadow-[0_0_12px_#B3D59F]" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#B3D59F] rounded-tr-xl shadow-[0_0_12px_#B3D59F]" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#B3D59F] rounded-bl-xl shadow-[0_0_12px_#B3D59F]" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#B3D59F] rounded-br-xl shadow-[0_0_12px_#B3D59F]" />

            {/* Glowing Laser Scanline Animation */}
            <div
              className="absolute left-2 right-2 h-0.5 bg-[#B3D59F] shadow-[0_0_10px_#B3D59F]"
              style={{
                animation: "scanline 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            />
          </div>

          {/* Dynamic Feedback Pop-Up Modal */}
          {feedback && (
            <div className="absolute inset-x-5 bottom-8 z-30 animate-bounce-short">
              <div
                className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur-xl ${
                  feedback.type === "error"
                    ? "bg-[#2A1014]/95 border-[#C0384E] text-[#FFD4DC]"
                    : feedback.type === "warning"
                    ? "bg-[#2A210A]/95 border-[#D97706] text-[#FFE8B8]"
                    : "bg-[#102A14]/95 border-[#3D6B2A] text-[#D8F8CA]"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    feedback.type === "error"
                      ? "bg-[#C0384E] text-white"
                      : feedback.type === "warning"
                      ? "bg-[#D97706] text-white"
                      : "bg-[#3D6B2A] text-white"
                  }`}
                >
                  {feedback.type === "error" ? (
                    <ShieldAlert size={20} />
                  ) : feedback.type === "warning" ? (
                    <AlertTriangle size={20} />
                  ) : (
                    <CheckCircle2 size={20} />
                  )}
                </div>
                <div className="flex-1">
                  {feedback.title && (
                    <p
                      className="text-[14px] font-extrabold text-white mb-0.5"
                      style={{ fontFamily: "'Lexend', sans-serif" }}
                    >
                      {feedback.title}
                    </p>
                  )}
                  <p
                    className="text-[12px] font-bold leading-snug"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    {feedback.message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Helper Bar */}
        <div className="bg-[#182314] px-5 py-4 border-t border-[#2D4522] text-center z-10">
          <p
            className="text-[13px] font-bold text-[#A8C895]"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {t("hunt.alignFrame", "Point camera at a station QR code")}
          </p>
        </div>
      </div>
    </div>
  );
}
