import React, { useEffect, useState } from 'react';
import { PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  poseResult: PoseLandmarkerResult | null;
  onFramingComplete: () => void;
}

export function FramingGuideModal({ poseResult, onFramingComplete }: Props) {
  const [isFramed, setIsFramed] = useState(false);
  const [holdTimer, setHoldTimer] = useState(0); // target: 1.5s (approx 45 frames at 30fps)
  
  const HOLD_THRESHOLD = 30; // ~1 second of good frames

  useEffect(() => {
    if (!poseResult || !poseResult.landmarks || poseResult.landmarks.length === 0) {
      setHoldTimer(0);
      setIsFramed(false);
      return;
    }

    const landmarks = poseResult.landmarks[0];
    
    // MediaPipe indices:
    // 11: left shoulder, 12: right shoulder
    // 13: left elbow, 14: right elbow
    // 15: left wrist, 16: right wrist
    
    const hasShoulders = landmarks[11].visibility > 0.65 && landmarks[12].visibility > 0.65;
    const hasLeftArm = landmarks[13].visibility > 0.6 && landmarks[15].visibility > 0.5;
    const hasRightArm = landmarks[14].visibility > 0.6 && landmarks[16].visibility > 0.5;

    // We want at least both shoulders and ONE full arm visible to start.
    if (hasShoulders && (hasLeftArm || hasRightArm)) {
      setHoldTimer(prev => {
        const next = prev + 1;
        if (next >= HOLD_THRESHOLD && !isFramed) {
          setIsFramed(true);
          // Auto-start!
          setTimeout(onFramingComplete, 500); // 500ms delay to let user see the green checkmark
        }
        return next;
      });
    } else {
      setHoldTimer(0);
      setIsFramed(false);
    }
  }, [poseResult, isFramed, onFramingComplete]);

  const progress = Math.min(100, (holdTimer / HOLD_THRESHOLD) * 100);

  return (
    <div className="bg-black/70 p-6 rounded-2xl backdrop-blur-md mb-8 max-w-sm w-[90%] text-center pointer-events-auto border border-white/10 shadow-2xl transition-all">
      <div className="mb-4 relative">
        {/* Silhouette guide icon */}
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center border-4 transition-colors duration-300 ${isFramed ? 'border-green-500 bg-green-500/20' : 'border-blue-500 bg-blue-500/20'}`}>
          {isFramed ? (
            <CheckCircle2 size={32} className="text-green-400" />
          ) : (
            <AlertCircle size={32} className="text-blue-400" />
          )}
        </div>
      </div>
      
      <h2 className="text-xl font-bold mb-2 text-white">
        {isFramed ? "Perfect Position!" : "Position Your Phone"}
      </h2>
      
      <p className="text-sm text-gray-300 mb-6">
        {isFramed 
          ? "You are clearly visible. Starting session..." 
          : "Step back so your shoulders and arms are visible in the frame."}
      </p>

      {/* Progress Bar */}
      {!isFramed && (
        <div className="w-full bg-white/10 h-2 rounded-full mb-2 overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
