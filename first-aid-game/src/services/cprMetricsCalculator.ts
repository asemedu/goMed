import { NormalizedLandmark } from '@mediapipe/tasks-vision';

export interface CPRMetrics {
  leftElbowAngle: number;
  rightElbowAngle: number;
  isArmsLocked: boolean;
  bpm: number;
  isGoodPace: boolean;
  isTooFast: boolean;
  isTooSlow: boolean;
}

class CPRMetricsCalculator {
  private emaBPM: number = 0;
  
  // Peak detection state
  private lastWristY: number = 0;
  private isMovingDown: boolean = true;
  private peakTimestamps: number[] = [];

  /**
   * Calculate 3D angle between three points (Shoulder, Elbow, Wrist)
   */
  private calculateAngle(a: NormalizedLandmark, b: NormalizedLandmark, c: NormalizedLandmark): number {
    const ab = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
    const cb = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };
    
    const dotProduct = ab.x * cb.x + ab.y * cb.y + ab.z * cb.z;
    const magAB = Math.sqrt(ab.x * ab.x + ab.y * ab.y + ab.z * ab.z);
    const magCB = Math.sqrt(cb.x * cb.x + cb.y * cb.y + cb.z * cb.z);
    
    if (magAB === 0 || magCB === 0) return 0;
    
    const cosAngle = dotProduct / (magAB * magCB);
    // Clamp to avoid NaN from floating point precision issues
    const clampedCos = Math.max(-1.0, Math.min(1.0, cosAngle));
    const angleRad = Math.acos(clampedCos);
    
    return angleRad * (180.0 / Math.PI);
  }

  /**
   * Process a single frame of landmarks to extract CPR metrics
   */
  processFrame(landmarks: NormalizedLandmark[], timestamp: number): CPRMetrics {
    // Indices based on MediaPipe Pose (BlazePose)
    const leftShoulder = landmarks[11];
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];
    
    const rightShoulder = landmarks[12];
    const rightElbow = landmarks[14];
    const rightWrist = landmarks[16];

    let leftAngle = 180;
    let rightAngle = 180;

    // Only calculate angles if we have decent confidence in the arm joints
    if (leftShoulder.visibility > 0.6 && leftElbow.visibility > 0.6 && leftWrist.visibility > 0.6) {
      leftAngle = this.calculateAngle(leftShoulder, leftElbow, leftWrist);
    }
    
    if (rightShoulder.visibility > 0.6 && rightElbow.visibility > 0.6 && rightWrist.visibility > 0.6) {
      rightAngle = this.calculateAngle(rightShoulder, rightElbow, rightWrist);
    }

    // A perfect lock is 180°. We allow a tolerance down to 150° before warning the user.
    const isArmsLocked = leftAngle > 150 && rightAngle > 150;

    // ---------------------------------------------------------
    // CADENCE (BPM) TRACKING
    // Track the vertical displacement of the wrists
    // ---------------------------------------------------------
    let currentWristY = 0;
    let wristCount = 0;
    
    if (leftWrist.visibility > 0.6) {
      currentWristY += leftWrist.y;
      wristCount++;
    }
    if (rightWrist.visibility > 0.6) {
      currentWristY += rightWrist.y;
      wristCount++;
    }

    if (wristCount > 0) {
      currentWristY /= wristCount;
      
      // Note: In image coordinates, Y=0 is the top, Y=1 is the bottom.
      // So pushing down = Y is increasing. Releasing = Y is decreasing.
      
      if (currentWristY > this.lastWristY && !this.isMovingDown) {
        this.isMovingDown = true; // Started pushing down
      } else if (currentWristY < this.lastWristY && this.isMovingDown) {
        // Transition: Was moving down, now moving up. This is the BOTTOM of a compression.
        this.isMovingDown = false;
        
        // We register this as one beat
        this.peakTimestamps.push(timestamp);
        
        // Keep a rolling window of the last 6 beats
        if (this.peakTimestamps.length > 6) {
          this.peakTimestamps.shift();
        }

        if (this.peakTimestamps.length >= 2) {
          const dt = timestamp - this.peakTimestamps[this.peakTimestamps.length - 2];
          // Filter out impossible noise (faster than 300 BPM or slower than 30 BPM)
          if (dt > 200 && dt < 2000) { 
            const instantBPM = 60000 / dt;
            // Apply Exponential Moving Average (EMA) to smooth out erratic jumps
            if (this.emaBPM === 0) {
              this.emaBPM = instantBPM;
            } else {
              this.emaBPM = (instantBPM * 0.3) + (this.emaBPM * 0.7);
            }
          }
        }
      }
      this.lastWristY = currentWristY;
    }

    // If the user stops moving for more than 2 seconds, reset the BPM meter
    if (this.peakTimestamps.length > 0) {
      const timeSinceLastPeak = timestamp - this.peakTimestamps[this.peakTimestamps.length - 1];
      if (timeSinceLastPeak > 2000) {
        this.emaBPM = 0; 
        this.peakTimestamps = [];
      }
    }

    const bpm = Math.round(this.emaBPM);

    return {
      leftElbowAngle: Math.round(leftAngle),
      rightElbowAngle: Math.round(rightAngle),
      isArmsLocked,
      bpm,
      isGoodPace: bpm >= 100 && bpm <= 120,
      isTooFast: bpm > 120,
      isTooSlow: bpm > 0 && bpm < 100
    };
  }

  /**
   * Reset the tracker for a new session
   */
  reset() {
    this.emaBPM = 0;
    this.lastWristY = 0;
    this.isMovingDown = true;
    this.peakTimestamps = [];
  }
}

export const cprMetrics = new CPRMetricsCalculator();
