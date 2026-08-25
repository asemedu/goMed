import React, { useState, useEffect, useRef } from "react";
import { X, Clock, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { QuizSummaryModal } from "./components/QuizSummaryModal";

interface SinglePlayerQuizScreenProps {
  category: string;
  onFinish: () => void;
}

export function SinglePlayerQuizScreen({ category, onFinish }: SinglePlayerQuizScreenProps) {
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
        const { data, error } = await supabase
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
          .eq("category", category);

        if (error) throw error;
        
        if (!data || data.length === 0) {
          setErrorMsg("No questions found for this quiz. Please run the seed_quizzes.sql script in your Supabase dashboard.");
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
        setErrorMsg(err.message || "Failed to load questions.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [category]);

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
            clearInterval(timerRef.current!);
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
  }, [currentIndex, questions, isAnswerSubmitted, isCompleted]);

  const handleTimeUp = () => {
    if (!isAnswerSubmitted) {
      setIsAnswerSubmitted(true);
      // Auto-submit with no selection (wrong answer)
      const timeTaken = Date.now() - questionStartTimeRef.current;
      setTotalTimeTaken(prev => prev + timeTaken);
    }
  };

  const handleSelectOption = (answerId: string) => {
    if (isAnswerSubmitted) return;
    
    // Stop the timer
    if (timerRef.current) clearInterval(timerRef.current);
    
    setSelectedAnswerId(answerId);
    setIsAnswerSubmitted(true);
    
    const timeTaken = Date.now() - questionStartTimeRef.current;
    setTotalTimeTaken(prev => prev + timeTaken);

    const currentQ = questions[currentIndex];
    const selected = currentQ?.answers?.find((a: any) => a.id === answerId);
    
    if (selected?.is_correct) {
      setCorrectCount(prev => prev + 1);
      
      // Calculate Kahoot-style points
      const basePoints = currentQ.points || 20;
      const speedMultiplier = Math.max(0, timeLeft / maxTime); // 1.0 to 0.0 depending on how fast
      const speedBonus = Math.round(basePoints * speedMultiplier);
      
      setTotalXP(prev => prev + basePoints + speedBonus);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswerId(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsCompleted(true);
      setShowSummary(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-12 h-full min-h-[600px]">
        <div className="w-12 h-12 rounded-full border-4 border-[#B3D59F] border-t-transparent animate-spin mb-4" />
        <p className="text-[14px] font-bold text-[#1A2816]">Loading Quiz...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-12 text-center h-full min-h-[600px]">
        <div className="w-14 h-14 rounded-2xl bg-[#FFF4F6] text-[#C0384E] flex items-center justify-center mb-3">
          <AlertCircle size={28} />
        </div>
        <h3 className="text-[18px] font-extrabold text-[#1A2816] mb-1">Oops!</h3>
        <p className="text-[13px] text-[#6B7C6B] mb-5 max-w-[260px]">{errorMsg}</p>
        <button
          onClick={onFinish}
          className="px-6 py-3 rounded-xl bg-[#B3D59F] text-[#1A3312] font-bold text-[14px]"
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
                {category.toUpperCase()} QUIZ
              </span>
              <p className="text-[13px] font-extrabold text-[#1A2816]">
                Question {currentIndex + 1} of {questions.length}
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
                      Correct! +{currentQ.points + Math.round(currentQ.points * (timeLeft / maxTime))} XP
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold bg-[#FFF0F2] text-[#C0384E] px-2 py-1 rounded-md">
                      Incorrect
                    </span>
                  )
                ) : (
                  <span className="text-[11px] font-bold bg-[#FFF0F2] text-[#C0384E] px-2 py-1 rounded-md">
                    Time's Up!
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
                  onClick={() => handleSelectOption(ans.id)}
                  disabled={isAnswerSubmitted}
                  className={`w-full p-4 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${cardStyle}`}
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
            className="w-full py-4 rounded-2xl bg-[#B3D59F] text-[#1A3312] font-extrabold text-[16px] shadow-md hover:bg-[#9DC885] active:scale-[0.98] transition-all flex items-center justify-center mt-2 shrink-0 animate-fadeIn"
          >
            {currentIndex + 1 < questions.length ? "Next Question" : "See Results"}
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
