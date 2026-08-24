import { PoseLandmarker, FilesetResolver, PoseLandmarkerResult } from '@mediapipe/tasks-vision';

class MediapipePoseService {
  private poseLandmarker: PoseLandmarker | null = null;
  private isInitializing: boolean = false;
  private isReady: boolean = false;

  /**
   * Initialize the WASM files and load the PoseLandmarker Lite model.
   * Lite is used for maximum FPS on mobile devices.
   */
  async initialize(): Promise<void> {
    if (this.poseLandmarker || this.isInitializing) return;
    this.isInitializing = true;
    
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      
      this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU" // Attempt to use WebGL/GPU acceleration
        },
        runningMode: "VIDEO",
        numPoses: 1
      });
      this.isReady = true;
      console.log('[MediaPipe] PoseLandmarker Lite initialized successfully.');
    } catch (e) {
      console.error('[MediaPipe] Failed to initialize:', e);
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Run inference on a video frame.
   * @param video The HTMLVideoElement to process
   * @param timestamp The performance.now() timestamp
   */
  detectVideo(video: HTMLVideoElement, timestamp: number): PoseLandmarkerResult | null {
    if (!this.isReady || !this.poseLandmarker) return null;
    
    // Ensure video is playing and has dimensions
    if (video.readyState < 2 || video.videoWidth === 0) return null;

    try {
      return this.poseLandmarker.detectForVideo(video, timestamp);
    } catch (e) {
      console.warn('[MediaPipe] Inference error:', e);
      return null;
    }
  }

  get isModelReady() {
    return this.isReady;
  }
}

export const poseService = new MediapipePoseService();
