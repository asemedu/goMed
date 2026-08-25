import React, { useState, useEffect } from "react";
import { X, Trophy, CheckCircle, ArrowRight } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

interface QuizScreenProps {
  lobby: any;
  onFinish: () => void;
}

export function QuizScreen({ lobby, onFinish }: QuizScreenProps) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load questions for this lobby
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        let loadedQuestions: any[] = [];

        // 1. Try to fetch questions linked to this lobby
        if (lobby?.id) {
          const { data: lqData, error: lqError } = await supabase
            .from("lobby_questions")
            .select(`
              order_index,
              questions (
                id,
                question_text,
                category,
                points,
                time_limit_seconds,
                answers (
                  id,
                  answer_text,
                  is_correct,
                  order_index
                )
              )
            `)
            .eq("lobby_id", lobby.id)
            .order("order_index", { ascending: true });

          if (!lqError && lqData && lqData.length > 0) {
            loadedQuestions = lqData
              .map((item: any) => item.questions)
              .filter(Boolean);
          }
        }

        // 2. Fallback: If no lobby_questions, fetch from questions table
        if (loadedQuestions.length === 0) {
          const { data: allQ, error: allQError } = await supabase
            .from("questions")
            .select(`
              id,
              question_text,
              category,
              points,
              time_limit_seconds,
              answers (
                id,
                answer_text,
                is_correct,
                order_index
              )
            `)
            .limit(5);

          if (!allQError && allQ) {
            loadedQuestions = allQ;
          }
        }

        // Sort answers by order_index
        loadedQuestions.forEach((q) => {
          if (q.answers) {
            q.answers.sort(
              (a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)
            );
          }
        });

        setQuestions(loadedQuestions);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load questions.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [lobby?.id]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (answerId: string) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswerId(answerId);
  };

  const handleSubmitOrNext = () => {
    if (!isAnswerSubmitted) {
      if (!selectedAnswerId) return;

      const selected = currentQ?.answers?.find(
        (a: any) => a.id === selectedAnswerId
      );
      if (selected?.is_correct) {
        setScore((prev) => prev + (currentQ.points || 100));
      }
      setIsAnswerSubmitted(true);
    } else {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswerId(null);
        setIsAnswerSubmitted(false);
      } else {
        setIsCompleted(true);
      }
    }
  };

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center px-6 py-12"
        style={{ minHeight: 600 }}
      >
        <div className="w-12 h-12 rounded-full border-4 border-[#B3D59F] border-t-transparent animate-spin mb-4" />
        <p
          className="text-[14px] font-bold text-[#1A2816]"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          Loading Challenge Questions...
        </p>
      </div>
    );
  }

  if (errorMsg || questions.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center px-6 py-12 text-center"
        style={{ minHeight: 600 }}
      >
        <div className="w-14 h-14 rounded-2xl bg-[#FFF4F6] text-[#C0384E] flex items-center justify-center mb-3">
          <X size={28} />
        </div>
        <h3
          className="text-[18px] font-extrabold text-[#1A2816] mb-1"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          No Questions Found
        </h3>
        <p
          className="text-[13px] text-[#6B7C6B] mb-5 max-w-[260px]"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          {errorMsg || "No questions have been attached to this lobby yet."}
        </p>
        <button
          onClick={onFinish}
          className="px-6 py-3 rounded-xl bg-[#B3D59F] text-[#1A3312] font-bold text-[14px]"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div
        className="flex flex-col items-center justify-center px-6 py-8 text-center"
        style={{ minHeight: 650 }}
      >
        <div className="w-20 h-20 rounded-3xl bg-[#F0F8EC] border-2 border-[#B3D59F] text-[#3D6B2A] flex items-center justify-center mb-4 shadow-lg">
          <Trophy size={40} />
        </div>

        <span
          className="text-[11px] font-extrabold text-[#3D6B2A] bg-[#E8F5E2] border border-[#B3D59F] px-3 py-1 rounded-full uppercase tracking-wider mb-2"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          Challenge Complete
        </span>

        <h3
          className="text-[24px] font-extrabold text-[#1A2816] mb-1"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          Great Job!
        </h3>
        <p
          className="text-[13px] text-[#6B7C6B] mb-6"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          You have completed all questions in this session.
        </p>

        {/* Score Card */}
        <div className="w-full bg-[#F7FBF5] border border-[#D4ECC5] rounded-2xl p-5 mb-6">
          <p
            className="text-[12px] font-bold text-[#6B7C6B] uppercase tracking-wider mb-1"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            Total Score Earned
          </p>
          <p
            className="text-[36px] font-extrabold text-[#1A3312]"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            +{score} <span className="text-[16px] text-[#3D6B2A]">XP</span>
          </p>
        </div>

        <button
          onClick={onFinish}
          className="w-full py-4 rounded-2xl bg-[#B3D59F] text-[#1A3312] font-extrabold text-[16px] shadow-md hover:bg-[#9DC885] active:scale-[0.98] transition-all"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          Finish & Return to Dashboard
        </button>
      </div>
    );
  }

  const optionLabels = ["A", "B", "C", "D"];

  return (
    <div className="flex flex-col h-full justify-between px-4 pt-3 pb-5 overflow-hidden">
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header Info */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <span
              className="text-[10px] font-bold text-[#3D6B2A] uppercase tracking-wider block"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {lobby?.school || "Challenge Session"}
            </span>
            <p
              className="text-[12px] font-bold text-[#1A2816]"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>

          <div className="bg-[#F0F8EC] border border-[#D4ECC5] text-[#3D6B2A] px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold">
            +{currentQ.points || 100} XP
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#E0EAD8] rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-[#3D6B2A] transition-all duration-300 rounded-full"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        {/* Question Card */}
        <div className="bg-[#F7FBF5] border border-[#D4ECC5] rounded-2xl p-3.5 mb-2.5 shadow-sm">
          <span
            className="text-[9px] font-extrabold text-[#3D6B2A] bg-white border border-[#B3D59F] px-1.5 py-0.5 rounded uppercase tracking-wider inline-block mb-1.5"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            {currentQ.category?.toUpperCase() || "FIRST AID"}
          </span>
          <h3
            className="text-[14px] font-bold text-[#1A2816] leading-tight"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            {currentQ.question_text}
          </h3>
        </div>

        {/* Answer Options */}
        <div className="space-y-2 mb-2 flex-1 flex flex-col justify-center">
          {(currentQ.answers || []).map((ans: any, idx: number) => {
            const isSelected = selectedAnswerId === ans.id;
            let cardStyle =
              "bg-white border-[#E8EDE6] text-[#1A2816] hover:bg-[#F7FBF5]";
            let badgeStyle = "bg-[#F0F5EE] text-[#6B7C6B]";

            if (isAnswerSubmitted) {
              if (ans.is_correct) {
                cardStyle =
                  "bg-[#E8F5E2] border-[#3D6B2A] text-[#1A3312] ring-1 ring-[#3D6B2A]";
                badgeStyle = "bg-[#3D6B2A] text-white";
              } else if (isSelected && !ans.is_correct) {
                cardStyle = "bg-[#FFF0F2] border-[#C0384E] text-[#C0384E]";
                badgeStyle = "bg-[#C0384E] text-white";
              } else {
                cardStyle =
                  "bg-white border-[#E8EDE6] text-[#6B7C6B] opacity-60";
              }
            } else if (isSelected) {
              cardStyle =
                "bg-[#F0F8EC] border-[#B3D59F] text-[#1A3312] ring-2 ring-[#B3D59F]/50 shadow-sm";
              badgeStyle = "bg-[#B3D59F] text-[#1A3312]";
            }

            return (
              <button
                key={ans.id || idx}
                type="button"
                onClick={() => handleSelectOption(ans.id)}
                disabled={isAnswerSubmitted}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${cardStyle}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center shrink-0 text-[12px] transition-colors ${badgeStyle}`}
                  style={{ fontFamily: "'Lexend', sans-serif" }}
                >
                  {optionLabels[idx] || idx + 1}
                </div>
                <span
                  className="text-[13px] font-semibold flex-1 leading-snug"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  {ans.answer_text}
                </span>
                {isAnswerSubmitted && ans.is_correct && (
                  <CheckCircle size={16} className="text-[#3D6B2A] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleSubmitOrNext}
        disabled={!selectedAnswerId}
        className="w-full py-3.5 rounded-2xl bg-[#B3D59F] text-[#1A3312] font-extrabold text-[15px] shadow-md hover:bg-[#9DC885] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 mt-2"
        style={{ fontFamily: "'Lexend', sans-serif" }}
      >
        {isAnswerSubmitted
          ? currentIndex + 1 < questions.length
            ? "Next Question"
            : "View Results"
          : "Submit Answer"}
        <ArrowRight size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}
