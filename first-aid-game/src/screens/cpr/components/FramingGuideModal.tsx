import React, { useEffect, useState } from 'react';
import { PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import { CheckCircle2, AlertCircle, Hand } from 'lucide-react';

interface Props {
  poseResult: PoseLandmarkerResult | null;
  onFramingComplete: () => void;
}

export function FramingGuideModal({ poseResult, onFramingComplete }: Props) {
  const [phase, setPhase] = useState<'visibility' | 'clasped' | 'done'>('visibility');
  const [holdTimer, setHoldTimer] = useState(0); 
  
  const HOLD_THRESHOLD = 30; // ~1 second of good frames

  useEffect(() => {
    if (phase === 'done' || !poseResult || !poseResult.landmarks || poseResult.landmarks.length === 0) {
      if (phase !== 'done') setHoldTimer(0);
      return;
    }

    const landmarks = poseResult.landmarks[0];
    
    if (phase === 'visibility') {
      // 11: left shoulder, 12: right shoulder, 13: left elbow, 15: left wrist
      const hasShoulders = landmarks[11].visibility > 0.65 && landmarks[12].visibility > 0.65;
      const hasLeftArm = landmarks[13].visibility > 0.6 && landmarks[15].visibility > 0.5;
      const hasRightArm = landmarks[14].visibility > 0.6 && landmarks[16].visibility > 0.5;

      if (hasShoulders && (hasLeftArm || hasRightArm)) {
        setHoldTimer(prev => {
          const next = prev + 1;
          if (next >= HOLD_THRESHOLD) {
            setPhase('clasped');
            return 0; // reset timer for next phase
          }
          return next;
        });
      } else {
        setHoldTimer(0);
      }
    } 
    else if (phase === 'clasped') {
      // Check if palms are together using wrists (15, 16)
      const lw = landmarks[15];
      const rw = landmarks[16];
      
      if (lw.visibility > 0.5 && rw.visibility > 0.5) {
        const dx = lw.x - rw.x;
        const dy = lw.y - rw.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        // Threshold for hands being "together" (0.15 is fairly close in normalized screen coords)
        if (distance < 0.15) {
          setHoldTimer(prev => {
            const next = prev + 1;
            if (next >= HOLD_THRESHOLD) {
              setPhase('done');
              setTimeout(onFramingComplete, 500); // 500ms delay to see the green checkmark
            }
            return next;
          });
        } else {
          setHoldTimer(0);
        }
      } else {
        setHoldTimer(0);
      }
    }
  }, [poseResult, phase, onFramingComplete]);

  const progress = Math.min(100, (holdTimer / HOLD_THRESHOLD) * 100);

  // Dynamic UI based on phase
  let title = "Position Your Phone";
  let description = "Step back so your shoulders and arms are visible in the frame.";
  let icon = <AlertCircle size={32} className="text-blue-400" />;
  let colorClass = "border-blue-500 bg-blue-500/20";
  
  if (phase === 'clasped') {
    title = "Clasp Your Hands";
    description = "Put your palms together like you are about to perform CPR.";
    icon = <Hand size={32} className="text-orange-400" />;
    colorClass = "border-orange-500 bg-orange-500/20";
  } else if (phase === 'done') {
    title = "Perfect Position!";
    description = "You are clearly visible. Starting session...";
    icon = <CheckCircle2 size={32} className="text-green-400" />;
    colorClass = "border-green-500 bg-green-500/20";
  }

  return (
    <div className="bg-black/70 p-6 rounded-2xl backdrop-blur-md mb-8 max-w-sm w-[90%] text-center pointer-events-auto border border-white/10 shadow-2xl transition-all">
      <div className="mb-4 relative">
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center border-4 transition-colors duration-300 ${colorClass}`}>
          {icon}
        </div>
      </div>
      
      <h2 className="text-xl font-bold mb-2 text-white">{title}</h2>
      <p className="text-sm text-gray-300 mb-6">{description}</p>

      {/* Progress Bar */}
      {phase !== 'done' && (
        <div className="w-full bg-white/10 h-2 rounded-full mb-2 overflow-hidden">
          <div 
            className={`h-full transition-all duration-100 ease-linear ${phase === 'visibility' ? 'bg-blue-500' : 'bg-orange-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
