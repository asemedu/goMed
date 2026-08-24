import React, { useEffect, useRef, useState } from 'react';
import { poseService } from '../../../services/mediapipePose';
import { PoseLandmarkerResult } from '@mediapipe/tasks-vision';

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
  onPoseUpdate?: (result: PoseLandmarkerResult) => void;
}

export function CameraMirrorView({ videoRef, isActive, onPoseUpdate }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const [modelReady, setModelReady] = useState(false);

  // Initialize MediaPipe
  useEffect(() => {
    poseService.initialize().then(() => {
      setModelReady(true);
    });
  }, []);

  // Main Render Loop
  useEffect(() => {
    if (!isActive || !modelReady || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastVideoTime = -1;

    const renderLoop = () => {
      // Ensure canvas matches video dimensions
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
      }

      // Only run inference if the video frame has advanced
      if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        
        const timestamp = performance.now();
        const results = poseService.detectVideo(video, timestamp);
        
        // Pass results up to parent (for Framing Check or CPR Math)
        if (results && onPoseUpdate) {
          onPoseUpdate(results);
        }

        // Draw skeleton
        if (results && results.landmarks && results.landmarks.length > 0) {
          drawSkeleton(ctx, results.landmarks[0], canvas.width, canvas.height);
        } else {
          // Clear canvas if no pose detected
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }

      animationFrameId.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isActive, modelReady, videoRef, onPoseUpdate]);

  // Basic skeleton drawing utility
  const drawSkeleton = (
    ctx: CanvasRenderingContext2D, 
    landmarks: any[], 
    width: number, 
    height: number
  ) => {
    ctx.clearRect(0, 0, width, height);

    // Connections to draw (simplified CPR upper body focus)
    const connections = [
      [11, 12], // Shoulders
      [11, 13], [13, 15], // Left Arm
      [12, 14], [14, 16], // Right Arm
      [11, 23], [12, 24], // Torso (Shoulders to Hips)
      [23, 24], // Hips
      [23, 25], [25, 27], // Left Leg
      [24, 26], [26, 28], // Right Leg
    ];

    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(0, 255, 100, 0.8)';
    
    // Draw connections
    connections.forEach(([i, j]) => {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      
      // Only draw if confidence is decent
      if (p1 && p2 && p1.visibility > 0.6 && p2.visibility > 0.6) {
        ctx.beginPath();
        // NOTE: X is mirrored because the video is mirrored via CSS!
        ctx.moveTo((1 - p1.x) * width, p1.y * height);
        ctx.lineTo((1 - p2.x) * width, p2.y * height);
        ctx.stroke();
      }
    });

    // Draw joints
    ctx.fillStyle = 'white';
    [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].forEach(i => {
      const p = landmarks[i];
      if (p && p.visibility > 0.6) {
        ctx.beginPath();
        ctx.arc((1 - p.x) * width, p.y * height, 6, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
      // Note: we DO NOT mirror the canvas via CSS transform here,
      // instead we mirror the X coordinates mathematically in drawSkeleton.
      // This is because MediaPipe coordinates map to the unmirrored video source.
    />
  );
}
