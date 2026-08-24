import React, { useEffect, useState, useMemo } from 'react';
import { useCameraStream } from '../../hooks/useCameraStream';
import { wakeLockManager } from '../../services/wakeLockManager';
import { ChevronLeft } from 'lucide-react';
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
    <div className="min-h-screen bg-black text-white flex flex-col font-lexend relative">
      {/* Header (Absolute position to hover over camera) */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <button 
          onClick={() => navigate('dashboard')}
          className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition backdrop-blur-sm"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Live CPR Practice</h1>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Main Content Area - Camera View */}
      <div className="flex-1 relative overflow-hidden bg-zinc-900 flex flex-col items-center justify-center">
        
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
