import { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

export default function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isAiLoaded, setIsAiLoaded] = useState(false);
  
  // We store the AI engine in a reference so it persists between React renders
  const landmarkerRef = useRef(null); 

  // 1. INITIALIZE THE AI
  useEffect(() => {
    async function loadAI() {
      // Fetch the WebAssembly core from Google's CDN
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      
      // Load the specific "Pose" model
      landmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU" // Use the phone's graphics chip for speed
        },
        runningMode: "VIDEO", // Tell it we are feeding it a live camera, not a static photo
      });

      setIsAiLoaded(true);
    }
    loadAI();
  }, []);

  // 2. THE GAME LOOP (Runs 30 times a second)
  const runPrediction = () => {
    if (
      webcamRef.current && 
      webcamRef.current.video.readyState === 4 && 
      landmarkerRef.current
    ) {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Match canvas internal size to the video resolution
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Ask the AI: "Where is the person in this specific video frame?"
      // performance.now() acts as a timestamp so the AI knows the video is moving forward
      const results = landmarkerRef.current.detectForVideo(video, performance.now());

      // Clear the previous frame's drawings
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // If the AI sees a human, draw on them!
      if (results.landmarks && results.landmarks.length > 0) {
        const skeleton = results.landmarks[0]; // Get the first person it sees

        // Example: Grab the Nose (index 0), Left Wrist (15), and Right Wrist (16)
        const nose = skeleton[0];
        const leftWrist = skeleton[15];
        const rightWrist = skeleton[16];

        // Draw a neon green dot exactly on the nose
        ctx.beginPath();
        ctx.arc(nose.x * canvas.width, nose.y * canvas.height, 10, 0, 2 * Math.PI);
        ctx.fillStyle = "#00FF00";
        ctx.fill();
        
        // Draw blue dots on the wrists
        ctx.beginPath();
        ctx.arc(leftWrist.x * canvas.width, leftWrist.y * canvas.height, 15, 0, 2 * Math.PI);
        ctx.arc(rightWrist.x * canvas.width, rightWrist.y * canvas.height, 15, 0, 2 * Math.PI);
        ctx.fillStyle = "#00BFFF";
        ctx.fill();
      }
    }
    
    // Keep looping forever
    requestAnimationFrame(runPrediction);
  };

  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center">
      
      <div className="absolute top-6 z-10 text-white font-bold tracking-widest uppercase">
        {isAiLoaded ? "AI is Ready - Step into frame!" : "Downloading AI Brain..."}
      </div>

      <div className="relative w-full max-w-md h-[80vh] bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-800">
        
        {/* The Real World */}
        <Webcam
          ref={webcamRef}
          onUserMedia={runPrediction} // Start the loop the second the camera turns on
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* The Augmented Reality Layer */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full z-10 pointer-events-none object-cover" 
        />
      </div>
    </div>
  );
}