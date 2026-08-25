import React, { useEffect, useState, useMemo } from 'react';
import { useCameraStream } from '../../hooks/useCameraStream';
import { wakeLockManager } from '../../services/wakeLockManager';
import { Screen } from '../../types';
import { CameraMirrorView } from './components/CameraMirrorView';
import { FramingGuideModal } from './components/FramingGuideModal';
import { LiveHUDOverlay } from './components/LiveHUDOverlay';
import { CPRSummaryModal } from './components/CPRSummaryModal';
import { PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import { cprMetrics } from '../../services/cprMetricsCalculator';
import { audioCoach } from '../../services/audioCoachQueue';
import { useLanguage } from '../../lib/i18n/LanguageContext';

interface Props {
  navigate: (screen: Screen) => void;
}

export function CPRPracticeScreen({ navigate }: Props) {
  const { t, language } = useLanguage();
  const { videoRef, startStream, stopStream, error, isStreaming } = useCameraStream();
  const [hasStarted, setHasStarted] = useState(false);
  const [poseResult, setPoseResult] = useState<PoseLandmarkerResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showSummary, setShowSummary] = useState(false);

  // Sync language with audio coach
  useEffect(() => {
    audioCoach.setLanguage(language);
  }, [language]);

  // Compute metrics live
  const liveMetrics = useMemo(() => {
    if (!hasStarted || !poseResult || !poseResult.landmarks || poseResult.landmarks.length === 0 || showSummary) {
      return null;
    }
    return cprMetrics.processFrame(poseResult.landmarks[0], performance.now());
  }, [poseResult, hasStarted, showSummary]);

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
    if (!hasStarted || showSummary) return;
    
    audioCoach.play("begin_cpr", true);
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowSummary(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [hasStarted, showSummary]);

  // Trigger stop CPR speech exactly once when session finishes
  useEffect(() => {
    if (showSummary) {
      audioCoach.play("session_complete", true);
    }
  }, [showSummary]);

  // Audio Coaching Loop
  useEffect(() => {
    if (!hasStarted || !liveMetrics || timeLeft === 0 || showSummary) return;

    if (liveMetrics.isTooSlow) {
      audioCoach.play("push_faster");
    } else if (liveMetrics.isTooFast) {
      audioCoach.play("slow_down");
    } else if (liveMetrics.isGoodPace && liveMetrics.bpm > 0) {
      // Occasional positive reinforcement (higher throttle to not be annoying)
      audioCoach.play("good_pace", false, 10000);
    }

    if (!liveMetrics.isArmsLocked) {
      audioCoach.play("lock_elbows");
    }
  }, [liveMetrics, hasStarted, timeLeft, showSummary]);

  const handleStartPractice = () => {
    wakeLockManager.requestWakeLock();
    setHasStarted(true);
  };

  const handleFinish = () => {
    navigate('dashboard');
  };

  return (
    <div className="absolute inset-0 bg-black text-white flex flex-col font-lexend overflow-hidden">
      {/* Main Content Area - Camera View */}
      <div className="flex-1 relative bg-black flex flex-col items-center justify-center">
        
        {error ? (
          <div className="p-6 bg-red-900/50 rounded-xl border border-red-500 max-w-sm text-center z-50">
            <p className="text-red-200 mb-2">{t("cpr.cameraError", "Camera Error")}</p>
            <p className="text-sm">{error}</p>
            <button 
              onClick={startStream}
              className="mt-4 px-4 py-2 bg-white text-red-900 rounded-lg font-bold w-full cursor-pointer"
            >
              {t("cpr.retryCamera", "Retry Camera")}
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
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${showSummary ? 'opacity-30 blur-sm' : 'opacity-100'}`}
              style={{ transform: 'scaleX(-1)' }}
            />
            
            {/* MediaPipe Overlay Layer */}
            {!showSummary && (
              <CameraMirrorView 
                videoRef={videoRef} 
                isActive={isStreaming} 
                onPoseUpdate={setPoseResult}
              />
            )}
            
            {/* UI Overlay on top of video */}
            {!hasStarted && isStreaming && (
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 z-50 pointer-events-none">
                <FramingGuideModal 
                  poseResult={poseResult}
                  onFramingComplete={handleStartPractice}
                />
              </div>
            )}

            {hasStarted && !showSummary && (
              <LiveHUDOverlay metrics={liveMetrics} timeLeft={timeLeft} />
            )}

            {/* Post-Practice Summary */}
            {showSummary && (
              <CPRSummaryModal 
                stats={cprMetrics.getSessionStats()}
                onFinish={handleFinish}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
