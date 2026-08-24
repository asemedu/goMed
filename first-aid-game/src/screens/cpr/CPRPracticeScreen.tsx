import React, { useEffect, useState, useMemo } from 'react';
import { useCameraStream } from '../../hooks/useCameraStream';
import { wakeLockManager } from '../../services/wakeLockManager';
import { ChevronLeft } from 'lucide-react';
import { Screen } from '../../types';
import { CameraMirrorView } from './components/CameraMirrorView';
import { FramingGuideModal } from './components/FramingGuideModal';
import { PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import { cprMetrics } from '../../services/cprMetricsCalculator';

interface Props {
  navigate: (screen: Screen) => void;
}

export function CPRPracticeScreen({ navigate }: Props) {
  const { videoRef, startStream, stopStream, error, isStreaming } = useCameraStream();
  const [hasStarted, setHasStarted] = useState(false);
  const [poseResult, setPoseResult] = useState<PoseLandmarkerResult | null>(null);

  // Compute metrics live for testing purposes
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
    };
  }, []); // Run only once on mount

  const handleStartPractice = () => {
    // 1. Acquire wake lock
    wakeLockManager.requestWakeLock();
    setHasStarted(true);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-lexend relative">
      {/* Header (Absolute position to hover over camera) */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
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
          <div className="p-6 bg-red-900/50 rounded-xl border border-red-500 max-w-sm text-center z-20">
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
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 z-30 pointer-events-none">
              {!hasStarted && isStreaming && (
                <FramingGuideModal 
                  poseResult={poseResult}
                  onFramingComplete={handleStartPractice}
                />
              )}

              {hasStarted && liveMetrics && (
                <div className="bg-black/70 backdrop-blur-md p-4 rounded-xl border border-white/20 pointer-events-auto w-[90%] max-w-sm mb-4">
                  <h3 className="text-blue-400 font-bold uppercase tracking-wider text-sm mb-3">Live Math Engine Test</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-3 rounded-lg text-center">
                      <p className="text-xs text-gray-400 mb-1">Cadence (BPM)</p>
                      <p className={`text-2xl font-bold ${liveMetrics.isGoodPace ? 'text-green-400' : 'text-red-400'}`}>
                        {liveMetrics.bpm}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">Target: 100-120</p>
                    </div>
                    
                    <div className="bg-white/5 p-3 rounded-lg text-center">
                      <p className="text-xs text-gray-400 mb-1">Arms Locked?</p>
                      <p className={`text-xl font-bold ${liveMetrics.isArmsLocked ? 'text-green-400' : 'text-orange-400'}`}>
                        {liveMetrics.isArmsLocked ? 'YES' : 'BENT'}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">L: {liveMetrics.leftElbowAngle}° R: {liveMetrics.rightElbowAngle}°</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
