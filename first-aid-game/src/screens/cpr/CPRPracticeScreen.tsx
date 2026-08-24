import React, { useEffect, useState } from 'react';
import { useCameraStream } from '../../hooks/useCameraStream';
import { wakeLockManager } from '../../services/wakeLockManager';
import { ChevronLeft } from 'lucide-react';
import { Screen } from '../../types';

interface Props {
  navigate: (screen: Screen) => void;
}

export function CPRPracticeScreen({ navigate }: Props) {
  const { videoRef, startStream, stopStream, error, isStreaming } = useCameraStream();
  const [hasStarted, setHasStarted] = useState(false);

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
    
    // 2. Unlock Audio on iOS (needs a user gesture)
    // We will do this properly when Audio Coach Queue is implemented.
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      const audioCtx = new AudioContext();
      audioCtx.resume();
    }
    // Also init SpeechSynthesis
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('');
      utterance.volume = 0;
      window.speechSynthesis.speak(utterance);
    }

    setHasStarted(true);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-lexend relative">
      {/* Header (Absolute position to hover over camera) */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
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
          <div className="p-6 bg-red-900/50 rounded-xl border border-red-500 max-w-sm text-center">
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
            
            {/* UI Overlay on top of video */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 z-20 pointer-events-none">
              {!hasStarted && isStreaming && (
                <div className="bg-black/60 p-6 rounded-2xl backdrop-blur-md mb-8 max-w-sm w-[90%] text-center pointer-events-auto border border-white/10">
                  <h2 className="text-xl font-bold mb-2">Position Your Phone</h2>
                  <p className="text-sm text-gray-300 mb-6">
                    Prop up your phone so you can see your upper body and arms while performing CPR on the mannequin.
                  </p>
                  <button
                    onClick={handleStartPractice}
                    className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-blue-600 transition shadow-lg shadow-blue-500/30"
                  >
                    Start Practice
                  </button>
                </div>
              )}

              {hasStarted && (
                <div className="bg-black/40 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 pointer-events-auto">
                  <p className="text-sm font-semibold tracking-wider uppercase text-blue-400">
                    Phase 1 Running
                  </p>
                  <p className="text-xs text-gray-300 text-center">Camera & Wake Lock Active</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
