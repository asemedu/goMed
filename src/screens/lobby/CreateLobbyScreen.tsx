import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

interface CreateLobbyScreenProps {
  onLobbyCreated: (lobby: any) => void;
  onBack: () => void;
}

export function CreateLobbyScreen({
  onLobbyCreated,
  onBack,
}: CreateLobbyScreenProps) {
  const [school, setSchool] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [category, setCategory] = useState("siguranta");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreate = async () => {
    setErrorMsg("");
    if (!school.trim()) {
      setErrorMsg("Please enter your school or organization name.");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to host a lobby.");
      }

      // Generate a random 6-char code: MED + 3 digits (e.g. MED842)
      const randomDigits = Math.floor(100 + Math.random() * 900);
      const generatedCode = `MED${randomDigits}`;

      // 1. Insert into lobbies table
      const { data: newLobby, error: insertError } = await supabase
        .from("lobbies")
        .insert({
          code: generatedCode,
          school: school.trim(),
          host_id: user.id,
          status: "waiting",
          max_players: maxPlayers,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 2. Link relevant questions to this lobby in lobby_questions
      const { data: qData } = await supabase
        .from("questions")
        .select("id")
        .eq("category", category)
        .limit(10);

      if (qData && qData.length > 0) {
        const links = qData.map((q: any, idx: number) => ({
          lobby_id: newLobby.id,
          question_id: q.id,
          order_index: idx + 1,
        }));
        await supabase.from("lobby_questions").insert(links);
      }

      // 3. Ensure host profile exists & add host to participants
      const hostDisplayName =
        user.user_metadata?.display_name ||
        user.email?.split("@")[0] ||
        "Host";

      await supabase.from("profiles").upsert(
        {
          id: user.id,
          display_name: hostDisplayName,
        },
        { onConflict: "id" }
      );

      await supabase.from("lobby_participants").upsert(
        {
          lobby_id: newLobby.id,
          user_id: user.id,
          current_score: 0,
        },
        { onConflict: "lobby_id,user_id" }
      );

      onLobbyCreated({ ...newLobby, isNewlyCreated: true });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create lobby.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col px-6 py-6" style={{ minHeight: 740 }}>
      {/* Header */}
      <div className="mb-6">
        <h2
          className="text-[22px] font-extrabold text-[#1A2816]"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          Host a Challenge
        </h2>
        <p
          className="text-[13px] text-[#6B7C6B] mt-0.5"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          Configure room settings and generate invite QR code
        </p>
      </div>

      {errorMsg && (
        <div
          className="mb-4 bg-[#FFF4F6] border border-[#FCC8D0] text-[#C0384E] text-[13px] px-4 py-3 rounded-2xl font-semibold flex items-center justify-between"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          <span>{errorMsg}</span>
          <button
            onClick={() => setErrorMsg("")}
            className="p-1 opacity-70 hover:opacity-100"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="space-y-4 flex-1">
        {/* School / Organization input */}
        <div>
          <label
            className="text-[13px] font-bold text-[#1A2816] mb-1.5 block"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            School or Organization
          </label>
          <input
            type="text"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder="e.g. Colegiul National Sfantul Sava"
            className="w-full px-4 py-3.5 rounded-xl border border-[#D8E8D0] bg-[#F7FBF5] text-[#1A2816] placeholder-[#6B7C6B] focus:outline-none focus:border-[#B3D59F] text-[14px]"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          />
        </div>

        {/* Max players selection */}
        <div>
          <label
            className="text-[13px] font-bold text-[#1A2816] mb-1.5 block"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            Maximum Players
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[4, 8, 12, 24].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setMaxPlayers(num)}
                className={`py-2.5 rounded-xl text-[13px] font-bold border transition-all ${
                  maxPlayers === num
                    ? "bg-[#B3D59F] text-[#1A3312] border-[#9DC885] shadow-sm"
                    : "bg-[#F7FBF5] text-[#6B7C6B] border-[#D8E8D0] hover:bg-white"
                }`}
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {num} max
              </button>
            ))}
          </div>
        </div>

        {/* Challenge Category */}
        <div>
          <label
            className="text-[13px] font-bold text-[#1A2816] mb-1.5 block"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            Challenge Module
          </label>
          <div className="space-y-2">
            {[
              {
                id: "siguranta",
                title: "1. Siguranță, Legislație și Baze",
                desc: "Norme legale, siguranța salvatorului și lanțul supraviețuirii.",
              },
              {
                id: "evaluare_112",
                title: "2. Apelul 112 & Evaluarea (A.B.C.)",
                desc: "Protocolul PAS, verificarea respirației și eliberarea căilor aeriene.",
              },
              {
                id: "rcp_adulti",
                title: "3. Resuscitarea (RCP) - Adulți",
                desc: "Compresii toracice, frecvență, adâncime și raportul 30:2.",
              },
              {
                id: "aed",
                title: "4. Defibrilatorul Extern Automat (AED)",
                desc: "Utilizarea corectă a defibrilatorului și siguranța șocului electric.",
              },
              {
                id: "pls",
                title: "5. Poziția Laterală de Siguranță (PLS)",
                desc: "Protejarea căilor aeriene la pacientul inconștient care respiră.",
              },
              {
                id: "dezobstructie",
                title: "6. Dezobstrucția Căilor Aeriene",
                desc: "Manevra Heimlich, lovituri interscapulare și cazuri speciale.",
              },
              {
                id: "copii_sugari",
                title: "7. Primul Ajutor la Copii & Sugari",
                desc: "Particularități de resuscitare și dezobstrucție la bebeluși.",
              },
              {
                id: "urgente_medicale",
                title: "8. Urgențe Medicale (Anafilaxie, Leșin, Epilepsie)",
                desc: "Prim ajutor în caz de anafilaxie, leșin și convulsii epileptice.",
              },
              {
                id: "trauma",
                title: "9. Traume & Hemoragii",
                desc: "Controlul sângerărilor arteriale, presiune directă și garou.",
              },
              {
                id: "arsuri",
                title: "10. Arsuri (Termice, Chimice, Electrice)",
                desc: "Regula de 10, răcire cu apă și măsuri de prim ajutor.",
              },
              {
                id: "intoxicatii",
                title: "11. Urgențe de Mediu & Intoxicații",
                desc: "Hipotermie, insolație gravă și intoxicații cu monoxid de carbon.",
              },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  category === cat.id
                    ? "bg-[#F0F8EC] border-[#B3D59F] ring-1 ring-[#B3D59F]"
                    : "bg-white border-[#E8EDE6] hover:bg-[#F7FBF5]"
                }`}
              >
                <div>
                  <p
                    className="text-[14px] font-extrabold text-[#1A2816]"
                    style={{ fontFamily: "'Lexend', sans-serif" }}
                  >
                    {cat.title}
                  </p>
                  <p
                    className="text-[12px] text-[#6B7C6B]"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    {cat.desc}
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    category === cat.id
                      ? "border-[#3D6B2A] bg-[#3D6B2A]"
                      : "border-[#D8E8D0]"
                  }`}
                >
                  {category === cat.id && (
                    <Check size={12} className="text-white" strokeWidth={3} />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="pt-4 space-y-2">
        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-[#B3D59F] text-[#1A3312] font-extrabold text-[16px] shadow-md hover:bg-[#9DC885] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          {loading ? "Creating Lobby..." : "Create Lobby & Show QR Code"}
        </button>

        <button
          onClick={onBack}
          type="button"
          className="w-full py-3 text-[#6B7C6B] font-bold text-[14px] hover:text-[#1A2816]"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
