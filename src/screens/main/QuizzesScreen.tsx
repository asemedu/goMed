import React, { useState } from "react";
import { Heart, Shield, Activity, BookOpen, HelpCircle, X, Zap, ArrowRight } from "lucide-react";

interface QuizzesScreenProps {
  onExploreCPR: () => void;
  onSelectQuiz: (category: string) => void;
}

export function QuizzesScreen({ onExploreCPR, onSelectQuiz }: QuizzesScreenProps) {
  const [selectedModule, setSelectedModule] = useState<any | null>(null);

  const modules = [
    {
      id: "siguranta",
      title: "1. Siguranță, Legislație și Baze",
      categoryName: "Siguranță & Legislație",
      desc: "Norme legale, siguranța salvatorului și lanțul supraviețuirii.",
      icon: Shield,
      tag: "QUIZ",
      questionCount: 5,
      xp: "+70 XP",
      time: "5 min",
      status: "Available",
    },
    {
      id: "evaluare_112",
      title: "2. Apelul 112 & Evaluarea (A.B.C.)",
      categoryName: "Evaluare & Apel 112",
      desc: "Protocolul PAS, verificarea respirației și eliberarea căilor aeriene.",
      icon: BookOpen,
      tag: "QUIZ",
      questionCount: 4,
      xp: "+70 XP",
      time: "5 min",
      status: "Available",
    },
    {
      id: "rcp_adulti",
      title: "3. Resuscitarea (RCP) - Adulți",
      categoryName: "Resuscitare Adulți",
      desc: "Compresii toracice, frecvență, adâncime și raportul 30:2.",
      icon: Heart,
      tag: "QUIZ",
      questionCount: 5,
      xp: "+110 XP",
      time: "6 min",
      status: "Available",
    },
    {
      id: "aed",
      title: "4. Defibrilatorul Extern Automat (AED)",
      categoryName: "Defibrilare",
      desc: "Utilizarea corectă a defibrilatorului și siguranța șocului electric.",
      icon: Activity,
      tag: "QUIZ",
      questionCount: 4,
      xp: "+60 XP",
      time: "4 min",
      status: "Available",
    },
    {
      id: "pls",
      title: "5. Poziția Laterală de Siguranță (PLS)",
      categoryName: "Prim Ajutor",
      desc: "Protejarea căilor aeriene la pacientul inconștient care respiră.",
      icon: Shield,
      tag: "QUIZ",
      questionCount: 4,
      xp: "+100 XP",
      time: "5 min",
      status: "Available",
    },
    {
      id: "dezobstructie",
      title: "6. Dezobstrucția Căilor Aeriene",
      categoryName: "Dezobstrucție",
      desc: "Manevra Heimlich, lovituri interscapulare și cazuri speciale.",
      icon: HelpCircle,
      tag: "QUIZ",
      questionCount: 5,
      xp: "+110 XP",
      time: "6 min",
      status: "Available",
    },
    {
      id: "copii_sugari",
      title: "7. Primul Ajutor la Copii & Sugari",
      categoryName: "Pediatrie",
      desc: "Particularități de resuscitare și dezobstrucție la bebeluși.",
      icon: Heart,
      tag: "QUIZ",
      questionCount: 4,
      xp: "+110 XP",
      time: "5 min",
      status: "Available",
    },
    {
      id: "urgente_medicale",
      title: "8. Urgențe Medicale (Anafilaxie, Leșin, Epilepsie)",
      categoryName: "Urgențe Medicale",
      desc: "Prim ajutor în caz de anafilaxie, leșin și convulsii epileptice.",
      icon: Activity,
      tag: "QUIZ",
      questionCount: 5,
      xp: "+80 XP",
      time: "5 min",
      status: "Available",
    },
    {
      id: "trauma",
      title: "9. Traume & Hemoragii",
      categoryName: "Traumatologie",
      desc: "Controlul sângerărilor arteriale, presiune directă și garou.",
      icon: Shield,
      tag: "QUIZ",
      questionCount: 4,
      xp: "+80 XP",
      time: "5 min",
      status: "Available",
    },
    {
      id: "arsuri",
      title: "10. Arsuri (Termice, Chimice, Electrice)",
      categoryName: "Arsuri",
      desc: "Regula de 10, răcire cu apă și măsuri de prim ajutor.",
      icon: BookOpen,
      tag: "QUIZ",
      questionCount: 5,
      xp: "+80 XP",
      time: "5 min",
      status: "Available",
    },
    {
      id: "intoxicatii",
      title: "11. Urgențe de Mediu & Intoxicații",
      categoryName: "Mediu & Toxice",
      desc: "Hipotermie, insolație gravă și intoxicații cu monoxid de carbon.",
      icon: HelpCircle,
      tag: "QUIZ",
      questionCount: 5,
      xp: "+90 XP",
      time: "5 min",
      status: "Available",
    },
  ];

  return (
    <div className="flex flex-col px-5 py-5" style={{ minHeight: 740 }}>
      {/* Top Header */}
      <div className="mb-5">
        <span
          className="text-[11px] font-bold text-[#3D6B2A] uppercase tracking-wider block"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          Test Your Knowledge
        </span>
        <h2
          className="text-[22px] font-extrabold text-[#1A2816]"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          Quizzes & Challenges
        </h2>
        <p
          className="text-[13px] text-[#6B7C6B] mt-0.5"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          Earn XP by completing time-based clinical quizzes.
        </p>
      </div>

      {/* Modules List */}
      <div className="space-y-3.5 flex-1">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.id}
              onClick={() => {
                if (mod.status === "Available") {
                  setSelectedModule(mod);
                }
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                mod.status === "Available"
                  ? "bg-white border-[#E8EDE6] hover:border-[#B3D59F] hover:bg-[#F7FBF5] shadow-sm active:scale-[0.99]"
                  : "bg-[#FAFCF9] border-[#E8EDE6] opacity-75"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#F0F8EC] border border-[#D4ECC5] flex items-center justify-center text-[#3D6B2A] shrink-0">
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[9px] font-extrabold text-[#3D6B2A] bg-[#E8F5E2] border border-[#B3D59F] px-1.5 py-0.5 rounded uppercase"
                      style={{ fontFamily: "'Lexend', sans-serif" }}
                    >
                      {mod.tag}
                    </span>
                    <span className="text-[11px] text-[#6B7C6B] ml-auto font-semibold">
                      {mod.time}
                    </span>
                  </div>
                  <h3
                    className="text-[15px] font-bold text-[#1A2816] mt-1 truncate"
                    style={{ fontFamily: "'Lexend', sans-serif" }}
                  >
                    {mod.title}
                  </h3>
                </div>
              </div>

              <p
                className="text-[12px] text-[#6B7C6B] line-clamp-2 mb-3"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {mod.desc}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-[#F0F5EE]">
                <span
                  className="text-[11px] font-bold text-[#3D6B2A]"
                  style={{ fontFamily: "'Lexend', sans-serif" }}
                >
                  {mod.xp}
                </span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 ${
                    mod.status === "Available"
                      ? "bg-[#B3D59F] text-[#1A3312]"
                      : "bg-[#E8EDE6] text-[#6B7C6B]"
                  }`}
                  style={{ fontFamily: "'Lexend', sans-serif" }}
                >
                  {mod.status === "Available" ? (
                    <>
                      <HelpCircle size={14} /> Start Quiz
                    </>
                  ) : (
                    "Locked"
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quiz Details Modal */}
      {selectedModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#1A2816]/60 backdrop-blur-sm"
            onClick={() => setSelectedModule(null)}
          />
          <div className="relative w-full max-w-[340px] bg-white rounded-3xl p-6 shadow-2xl animate-slideUp">
            <button
              onClick={() => setSelectedModule(null)}
              className="absolute top-5 right-5 text-[#6B7C6B] hover:text-[#1A2816] transition-colors"
            >
              <X size={22} />
            </button>
            <div className="mb-4 text-center pr-4 pl-4 mt-2">
              <div className="w-14 h-14 rounded-2xl bg-[#F0F8EC] border border-[#D4ECC5] flex items-center justify-center text-[#3D6B2A] mx-auto mb-3">
                {React.createElement(selectedModule.icon, { size: 26 })}
              </div>
              <span className="text-[10px] font-extrabold text-[#3D6B2A] bg-[#E8F5E2] border border-[#B3D59F] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block">
                {selectedModule.categoryName}
              </span>
              <h3
                className="text-[18px] font-extrabold text-[#1A2816] leading-snug"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {selectedModule.title}
              </h3>
            </div>

            <p
              className="text-[13px] font-semibold text-[#587058] leading-relaxed text-center px-2 mb-5"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              {selectedModule.desc}
            </p>

            <div className="grid grid-cols-2 gap-2.5 mb-6">
              <div className="bg-[#F7FBF5] border border-[#E8EDE6] rounded-2xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-[#6B7C6B] text-[11px] font-bold mb-0.5">
                  <HelpCircle size={13} /> Întrebări
                </div>
                <p
                  className="text-[16px] font-extrabold text-[#1A2816]"
                  style={{ fontFamily: "'Lexend', sans-serif" }}
                >
                  {selectedModule.questionCount}
                </p>
              </div>

              <div className="bg-[#F7FBF5] border border-[#E8EDE6] rounded-2xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-[#3D6B2A] text-[11px] font-bold mb-0.5">
                  <Zap size={13} /> Recompensă
                </div>
                <p
                  className="text-[16px] font-extrabold text-[#3D6B2A]"
                  style={{ fontFamily: "'Lexend', sans-serif" }}
                >
                  {selectedModule.xp}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                const id = selectedModule.id;
                setSelectedModule(null);
                onSelectQuiz(id);
              }}
              className="w-full py-3.5 rounded-xl bg-[#B3D59F] text-[#1A3312] font-extrabold text-[15px] hover:bg-[#9DC885] active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              Start Quiz <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

