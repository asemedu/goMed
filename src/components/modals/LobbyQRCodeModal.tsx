import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import QRCode from "qrcode";

interface LobbyQRCodeModalProps {
  isOpen: boolean;
  lobby: { code: string; school: string } | null;
  onClose: () => void;
}

export function LobbyQRCodeModal({
  isOpen,
  lobby,
  onClose,
}: LobbyQRCodeModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (lobby?.code) {
      QRCode.toDataURL(lobby.code, {
        width: 320,
        margin: 2,
        color: {
          dark: "#1A2816",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("QR generation error:", err));
    }
  }, [lobby?.code]);

  if (!isOpen || !lobby) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-[350px] bg-white rounded-3xl p-6 shadow-2xl border border-[#E8EDE6] text-center relative"
        style={{ fontFamily: "'Nunito', sans-serif" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A0B09A] hover:text-[#1A2816] p-1.5 rounded-full hover:bg-[#F0F5EE]"
          aria-label="Close QR Code"
        >
          <X size={18} />
        </button>

        <span
          className="text-[11px] font-bold text-[#3D6B2A] uppercase tracking-wider block mb-1"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          Join Challenge Session
        </span>
        <h3
          className="text-[18px] font-extrabold text-[#1A2816] mb-1"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          {lobby.school}
        </h3>
        <p className="text-[12px] text-[#6B7C6B] mb-4">
          Scan this QR code with your camera or enter room code below
        </p>

        {/* Rendered QR Code */}
        <div className="bg-[#F7FBF5] border border-[#D4ECC5] p-4 rounded-2xl inline-block mb-4 shadow-sm">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Lobby QR Code" className="w-52 h-52 mx-auto rounded-lg" />
          ) : (
            <div className="w-52 h-52 flex items-center justify-center text-[#6B7C6B]">
              Generating QR...
            </div>
          )}
        </div>

        {/* Code badge */}
        <div className="bg-[#F0F8EC] border border-[#D4ECC5] py-2 px-4 rounded-xl mb-5 inline-block">
          <span className="text-[12px] text-[#6B7C6B] font-bold mr-2">ROOM CODE:</span>
          <span
            className="text-[20px] font-extrabold text-[#1A3312] font-mono tracking-widest"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            {lobby.code}
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-[#B3D59F] text-[#1A3312] font-extrabold text-[15px] shadow-sm hover:bg-[#9DC885] active:scale-[0.98] transition-all"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          Close & Open Lobby Room
        </button>
      </div>
    </div>
  );
}
