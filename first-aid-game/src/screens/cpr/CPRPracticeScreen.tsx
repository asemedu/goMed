import React, { useEffect, useState, useMemo } from 'react';
import { useCameraStream } from '../../hooks/useCameraStream';
import { wakeLockManager } from '../../services/wakeLockManager';
import { Screen } from '../../types';
import { CameraMirrorView } from './components/CameraMirrorView';
import { FramingGuideModal } from './components/FramingGuideModal';
import { LiveHUDOverlay } from './components/LiveHUDOverlay';
import { PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import { cprMetrics } from '../../services/cprMetricsCalculator';
import { audioCoach } from '../../services/audioCoachQueue';

interface Props {
  navigate: (screen: Screen) => void;
}

export function CPRPracticeScreen({ navigate }: Props) {
  const { videoRef, startStream, stopStream, error, isStreaming } = useCameraStream();
  const [hasStarted, setHasStarted] = useState(false);
  const [poseResult, setPoseResult] = useState<PoseLandmarkerResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);

  // Compute metrics live
  const liveMetrics = useMemo(() => {
    if (!hasStarted || !poseResult || !poseResult.landmarks || poseResult.landmarks.length === 0) {
      return null;
    }
    return cprMetrics.processFrame(poseResult.landmarks[0], performance.now());
  }, [poseResult, hasStarted]);

  useEffect(() => {
    // Start camera stream on mount
    startStream();
    cprMetrics.reset();

    return () => {
      stopStream();
      wakeLockManager.releaseWakeLock();
      audioCoach.cancel();
    };
  }, []); // Run only once on mount

  // Timer loop
  useEffect(() => {
    if (!hasStarted) return;
    
    audioCoach.speak("Begin CPR", true);
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          audioCoach.speak("Stop CPR. Session complete.", true);
          // TODO: Save stats and navigate to summary screen
          setTimeout(() => navigate('dashboard'), 3000); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [hasStarted, navigate]);

  // Audio Coaching Loop (Runs at 30fps with liveMetrics, audioCoach automatically throttles repeats to every 4s)
  useEffect(() => {
    if (!hasStarted || !liveMetrics || timeLeft === 0) return;

    if (liveMetrics.isTooSlow) {
      audioCoach.speak("Push faster");
    } else if (liveMetrics.isTooFast) {
      audioCoach.speak("Slow down");
    } else if (liveMetrics.isGoodPace && liveMetrics.bpm > 0) {
      // Occasional positive reinforcement (higher throttle to not be annoying)
      audioCoach.speak("Good pace, keep it up", false, 10000);
    }

    if (!liveMetrics.isArmsLocked) {
      audioCoach.speak("Lock your elbows");
    }
  }, [liveMetrics, hasStarted, timeLeft]);

  const handleStartPractice = () => {
    // Acquire wake lock
    wakeLockManager.requestWakeLock();
    setHasStarted(true);
  };

  return (
    <div className="absolute inset-0 bg-black text-white flex flex-col font-lexend overflow-hidden">
      {/* Main Content Area - Camera View */}
      <div className="flex-1 relative bg-black flex flex-col items-center justify-center">
        
        {error ? (
          <div className="p-6 bg-red-900/50 rounded-xl border border-red-500 max-w-sm text-center z-50">
            <p className="text-red-200 mb-2">Camera Error</p>
            <p className="text-sm">{error}</p>
            <button 
              onClick={startStream}
              className="mt-4 px-4 py-2 bg-white text-red-900 rounded-lg font-bold w-full"
            >
              Retry Camera
            </button>
          </div>
        ) : (
          <>
            {/* The Video Element - Mirrored via CSS transform */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            
            {/* MediaPipe Overlay Layer */}
            <CameraMirrorView 
              videoRef={videoRef} 
              isActive={isStreaming} 
              onPoseUpdate={setPoseResult}
            />
            
            {/* UI Overlay on top of video */}
            {!hasStarted && isStreaming && (
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 z-50 pointer-events-none">
                <FramingGuideModal 
                  poseResult={poseResult}
                  onFramingComplete={handleStartPractice}
                />
              </div>
            )}

            {hasStarted && (
              <LiveHUDOverlay metrics={liveMetrics} timeLeft={timeLeft} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
