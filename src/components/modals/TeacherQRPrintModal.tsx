import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { X, Printer } from "lucide-react";
import { useLanguage } from "../../lib/i18n/LanguageContext";

interface TeacherQRPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStationIds?: string[];
}

const ALL_STATIONS = [
  { id: "siguranta_baze", name: "Siguranță, Legislație și Baze", category: "legal", color: "#4F46E5" },
  { id: "apel_112_abc", name: "Apelul la 112 și Evaluarea ABC", category: "emergency", color: "#DC2626" },
  { id: "rcp_adulti", name: "Resuscitarea Cardio-Pulmonară - Adulți", category: "cpr", color: "#3D6B2A" },
  { id: "aed", name: "Defibrilatorul Extern Automat", category: "aed", color: "#0284C7" },
  { id: "pls", name: "Poziția Laterală de Siguranță", category: "safety", color: "#0D9488" },
  { id: "dezobstructie", name: "Dezobstrucția Căilor Aeriene", category: "airway", color: "#D97706" },
  { id: "urgente_medicale_1", name: "Urgențe Medicale 1", category: "medical", color: "#2563EB" },
  { id: "traume_hemoragii", name: "Traume și Hemoragii", category: "trauma", color: "#C0384E" },
  { id: "arsuri", name: "Arsuri", category: "burns", color: "#EA580C" },
  { id: "urgente_mediu_intoxicatii", name: "Urgențe de Mediu și Intoxicații", category: "toxicology", color: "#7C3AED" },
];

export function TeacherQRPrintModal({
  isOpen,
  onClose,
  selectedStationIds,
}: TeacherQRPrintModalProps) {
  const { t } = useLanguage();
  const [qrCards, setQrCards] = useState<Array<{ station: (typeof ALL_STATIONS)[0]; dataUrl: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    const stationsToRender = selectedStationIds && selectedStationIds.length > 0
      ? ALL_STATIONS.filter((st) =>
          selectedStationIds.some(
            (id) =>
              id.toLowerCase() === st.id.toLowerCase() ||
              id.replace(/[-_]/g, "").toLowerCase() === st.id.replace(/[-_]/g, "").toLowerCase()
          )
        )
      : ALL_STATIONS;

    const list = stationsToRender.length > 0 ? stationsToRender : ALL_STATIONS;

    Promise.all(
      list.map(async (station) => {
        const payload = `GOMED:STATION:${station.id}`;
        const dataUrl = await QRCode.toDataURL(payload, {
          width: 320,
          margin: 1,
          color: { dark: "#1A2816", light: "#FFFFFF" },
        });
        return { station, dataUrl };
      })
    )
      .then((cards) => {
        setQrCards(cards);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to generate QR station preview:", err);
        setLoading(false);
      });
  }, [isOpen, selectedStationIds]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#D4ECC5] flex flex-col max-h-[90vh] overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E8EDE6] flex items-center justify-between bg-[#F7FBF5]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-[#3D6B2A] bg-[#E8F5E2] border border-[#B3D59F] px-2 py-0.5 rounded-full uppercase tracking-wider">
                {t("hunt.printTitle", "Station QR Cards")}
              </span>
            </div>
            <h3
              className="text-[18px] font-extrabold text-[#1A2816] mt-0.5"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {t("hunt.printSubtitle", "11 First-Aid Stations for School Placement")}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-[#B3D59F] hover:bg-[#9DC885] text-[#1A3312] font-extrabold text-[13px] rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              <Printer size={16} />
              <span>{t("hunt.printBtn", "Print All Sheets")}</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white border border-[#E8EDE6] text-[#6B7C6B] hover:text-[#1A2816] flex items-center justify-center transition-all cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body with Printable Card Previews */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F0F4EE]">
          <p
            className="text-[12px] text-[#6B7C6B] mb-4 text-center"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {t(
              "hunt.instruction",
              "Print these sheets and place them at designated checkpoints around your school or venue."
            )}
          </p>

          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-3 border-[#B3D59F] border-t-[#3D6B2A] rounded-full animate-spin mx-auto mb-2" />
              <p className="text-[13px] font-bold text-[#6B7C6B]">Generating QR codes...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {qrCards.map(({ station, dataUrl }) => (
                <div
                  key={station.id}
                  className="bg-white rounded-2xl border-2 border-[#B3D59F] p-4 text-center shadow-sm flex flex-col items-center justify-between"
                >
                  <div className="w-full flex items-center justify-between mb-2">
                    <span className="text-[9px] font-extrabold text-[#3D6B2A] uppercase tracking-wider">
                      goMed · Hunt
                    </span>
                    <span
                      className="text-[8px] font-extrabold px-1.5 py-0.5 rounded text-white uppercase"
                      style={{ backgroundColor: station.color }}
                    >
                      {station.category}
                    </span>
                  </div>

                  <h4
                    className="text-[14px] font-extrabold text-[#1A2816] mb-2 min-h-[36px] flex items-center justify-center"
                    style={{ fontFamily: "'Lexend', sans-serif" }}
                  >
                    {station.name}
                  </h4>

                  <div className="w-36 h-36 bg-[#F7FBF5] border-2 border-dashed border-[#B3D59F] rounded-xl p-2 mb-2 flex items-center justify-center">
                    <img
                      src={dataUrl}
                      alt={station.name}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>

                  <div className="font-mono text-[11px] font-bold text-[#3D6B2A] bg-[#F0F8EC] px-2.5 py-0.5 rounded-md mb-1 tracking-wider">
                    {station.id.toUpperCase()}
                  </div>
                  <p className="text-[10px] text-[#6B7C6B] leading-tight">
                    Scanează cu goMed pentru a debloca quiz-ul
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
