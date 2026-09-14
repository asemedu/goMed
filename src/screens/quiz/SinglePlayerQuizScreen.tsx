import React, { useState, useEffect, useRef } from "react";
import { X, Clock, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { QuizSummaryModal } from "./components/QuizSummaryModal";
import { useLanguage } from "../../lib/i18n/LanguageContext";

interface SinglePlayerQuizScreenProps {
  quizId: string;
  onFinish: () => void;
}

export function SinglePlayerQuizScreen({ quizId, onFinish }: SinglePlayerQuizScreenProps) {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Stats for the summary
  const [totalXP, setTotalXP] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalTimeTaken, setTotalTimeTaken] = useState(0); // in ms
  const [showSummary, setShowSummary] = useState(false);

  // Timer logic for Kahoot style
  const [timeLeft, setTimeLeft] = useState(0);
  const [maxTime, setMaxTime] = useState(0);
  const timerRef = useRef<number | null>(null);
  const questionStartTimeRef = useRef<number>(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        // Query questions matching active user language
        let { data, error } = await supabase
          .from("questions")
          .select(`
            id,
            question_text,
            category,
            points,
            time_limit_seconds,
            language,
            answers (
              id,
              answer_text,
              is_correct,
              order_index
            )
          `)
          .eq("quiz_id", quizId)
          .eq("language", language);

        if (error) throw error;

        // Fallback: If no questions found for active language, fetch any for this quiz_id
        if (!data || data.length === 0) {
          const fallbackRes = await supabase
            .from("questions")
            .select(`
              id,
              question_text,
              category,
              points,
              time_limit_seconds,
              language,
              answers (
                id,
                answer_text,
                is_correct,
                order_index
              )
            `)
            .eq("quiz_id", quizId);
          data = fallbackRes.data;
        }

        if (!data || data.length === 0) {
          setErrorMsg(t("quizzes.noQuestions", "No questions found for this quiz. Please make sure questions are seeded in Supabase."));
        } else {
          // Sort answers
          data.forEach((q) => {
            if (q.answers) {
              q.answers.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));
            }
          });
          setQuestions(data);
        }
      } catch (err: any) {
        setErrorMsg(err.message || t("common.error", "Failed to load questions."));
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [quizId, language]);

  // Start timer when a new question mounts
  useEffect(() => {
    if (questions.length > 0 && !isAnswerSubmitted && !isCompleted) {
      const currentQ = questions[currentIndex];
      const limit = currentQ.time_limit_seconds || 15;
      setMaxTime(limit);
      setTimeLeft(limit);
      questionStartTimeRef.current = Date.now();

      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isAnswerSubmitted, isCompleted, questions]);

  const handleTimeUp = () => {
    setIsAnswerSubmitted(true);
  };

  const handleSelectAnswer = (ansId: string) => {
    if (isAnswerSubmitted) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const timeTaken = Date.now() - questionStartTimeRef.current;
    setTotalTimeTaken((prev) => prev + timeTaken);

    setSelectedAnswerId(ansId);
    setIsAnswerSubmitted(true);

    const currentQ = questions[currentIndex];
    const isCorrect = currentQ.answers?.find((a: any) => a.id === ansId)?.is_correct;

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);

      let points = currentQ.points || 100;
      const percentageTime = Math.max(0, timeLeft) / (maxTime || 15);
      if (percentageTime > 0.5) points += 20;

      setTotalXP((prev) => prev + points);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswerId(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsCompleted(true);
      setTimeout(() => setShowSummary(true), 500);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#D8E8D0] border-t-[#3D6B2A] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-6">
        <div className="bg-[#FFF4F6] text-[#C0384E] p-4 rounded-xl flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-[14px] font-bold" style={{ fontFamily: "'Nunito', sans-serif" }}>
            {errorMsg}
          </p>
        </div>
        <button
          onClick={onFinish}
          className="mt-6 w-full py-4 rounded-2xl border-2 border-[#D8E8D0] text-[#1A2816] font-bold text-[16px]"
        >
          Go Back
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const optionLabels = ["A", "B", "C", "D"];

  return (
    <>
      <div className="flex flex-col h-full justify-between px-4 pt-3 pb-5 overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0">

          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] font-bold text-[#3D6B2A] uppercase tracking-wider block">
                {t("quizzes.quizBadge", "QUIZ")}
              </span>
              <p className="text-[13px] font-extrabold text-[#1A2816]">
                {t("quizzes.questionOf", "Question")} {currentIndex + 1} {t("quizzes.of", "of")} {questions.length}
              </p>
            </div>

            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-[13px] transition-colors ${
              timeLeft <= 5 ? "bg-[#FFF0F2] text-[#C0384E] animate-pulse" : "bg-[#F0F8EC] text-[#3D6B2A]"
            }`}>
              <Clock size={16} />
              {timeLeft}s
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-[#E8EDE6] rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-[#3D6B2A] transition-all duration-300 rounded-full"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="bg-[#F7FBF5] border border-[#D4ECC5] rounded-3xl p-5 mb-4 shadow-sm flex-shrink-0">
            <h3 className="text-[16px] font-extrabold text-[#1A2816] leading-snug">
              {currentQ.question_text}
            </h3>

            {isAnswerSubmitted && (
              <div className="mt-3 inline-block">
                {selectedAnswerId ? (
                  currentQ.answers.find((a: any) => a.id === selectedAnswerId)?.is_correct ? (
                    <span className="text-[11px] font-bold bg-[#E8F5E2] text-[#3D6B2A] px-2 py-1 rounded-md">
                      {t("quizzes.correct", "Correct!")} +{currentQ.points + Math.round(currentQ.points * (timeLeft / maxTime))} {t("common.points", "PTS")}
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold bg-[#FFF0F2] text-[#C0384E] px-2 py-1 rounded-md">
                      {t("quizzes.incorrect", "Incorrect")}
                    </span>
                  )
                ) : (
                  <span className="text-[11px] font-bold bg-[#FFF0F2] text-[#C0384E] px-2 py-1 rounded-md">
                    {t("quizzes.timesUp", "Time's Up!")}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Answer Options */}
          <div className="space-y-3 flex-1 overflow-y-auto pb-4 scrollbar-none">
            {(currentQ.answers || []).map((ans: any, idx: number) => {
              const isSelected = selectedAnswerId === ans.id;
              let cardStyle = "bg-white border-[#E8EDE6] text-[#1A2816] hover:border-[#B3D59F]";
              let badgeStyle = "bg-[#F0F5EE] text-[#6B7C6B]";

              if (isAnswerSubmitted) {
                if (ans.is_correct) {
                  cardStyle = "bg-[#E8F5E2] border-[#3D6B2A] text-[#1A3312] ring-2 ring-[#3D6B2A]";
                  badgeStyle = "bg-[#3D6B2A] text-white";
                } else if (isSelected && !ans.is_correct) {
                  cardStyle = "bg-[#FFF0F2] border-[#C0384E] text-[#C0384E]";
                  badgeStyle = "bg-[#C0384E] text-white";
                } else {
                  cardStyle = "bg-white border-[#E8EDE6] text-[#6B7C6B] opacity-50";
                }
              }

              return (
                <button
                  key={ans.id || idx}
                  onClick={() => handleSelectAnswer(ans.id)}
                  disabled={isAnswerSubmitted}
                  className={`w-full p-4 rounded-2xl border-2 text-left flex items-center gap-3 transition-all cursor-pointer ${cardStyle}`}
                >
                  <div className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center shrink-0 text-[13px] transition-colors ${badgeStyle}`}>
                    {optionLabels[idx] || idx + 1}
                  </div>
                  <span className="text-[14px] font-bold flex-1 leading-snug">
                    {ans.answer_text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        {isAnswerSubmitted && (
          <button
            onClick={handleNext}
            className="w-full py-4 rounded-2xl bg-[#B3D59F] text-[#1A3312] font-extrabold text-[16px] shadow-md hover:bg-[#9DC885] active:scale-[0.98] transition-all flex items-center justify-center mt-2 shrink-0 animate-fadeIn cursor-pointer"
          >
            {currentIndex + 1 < questions.length ? t("quizzes.nextQuestion", "Next Question") : t("quizzes.seeResults", "See Results")}
          </button>
        )}
      </div>

      {showSummary && (
        <QuizSummaryModal
          totalXP={totalXP}
          correctCount={correctCount}
          totalQuestions={questions.length}
          averageTimeMs={questions.length > 0 ? totalTimeTaken / questions.length : 0}
          onClose={onFinish}
        />
      )}
    </>
  );
}
