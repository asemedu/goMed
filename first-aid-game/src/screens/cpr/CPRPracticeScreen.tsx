import React, { useEffect, useState } from 'react';
import { useCameraStream } from '../../hooks/useCameraStream';
import { wakeLockManager } from '../../services/wakeLockManager';
import { ChevronLeft } from 'lucide-react';
import { Screen } from '../../types';
import { CameraMirrorView } from './components/CameraMirrorView';
import { FramingGuideModal } from './components/FramingGuideModal';
import { PoseLandmarkerResult } from '@mediapipe/tasks-vision';

interface Props {
  navigate: (screen: Screen) => void;
}

export function CPRPracticeScreen({ navigate }: Props) {
  const { videoRef, startStream, stopStream, error, isStreaming } = useCameraStream();
  const [hasStarted, setHasStarted] = useState(false);
  const [poseResult, setPoseResult] = useState<PoseLandmarkerResult | null>(null);

  useEffect(() => {
    // Start camera stream on mount
    startStream();

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

              {hasStarted && (
                <div className="bg-black/40 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 pointer-events-auto mt-auto">
                  <p className="text-sm font-semibold tracking-wider uppercase text-blue-400">
                    Phase 2 Running
                  </p>
                  <p className="text-xs text-gray-300 text-center">MediaPipe Pose tracking active</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
