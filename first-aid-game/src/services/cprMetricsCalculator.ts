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

  // Cadence tracking state (Hysteresis)
  private isMovingDown: boolean = true;
  private peakTimestamps: number[] = [];

  // To prevent micro-jitters at 30fps from counting as full compressions,
  // we require the shoulders to travel a minimum distance.
  private movementThreshold: number = 0.012; // ~1.5% of the camera frame height
  private currentExtremeY: number = 0;

  // Arms locked debouncer state
  private isArmsLockedState: boolean = true;
  private armsBentStartTime: number = 0;

  /**
   * Calculate 2D angle between three points (Shoulder, Elbow, Wrist)
   */
  private calculateAngle(a: NormalizedLandmark, b: NormalizedLandmark, c: NormalizedLandmark): number {
    const ab = { x: a.x - b.x, y: a.y - b.y };
    const cb = { x: c.x - b.x, y: c.y - b.y };

    const dotProduct = ab.x * cb.x + ab.y * cb.y;
    const magAB = Math.sqrt(ab.x * ab.x + ab.y * ab.y);
    const magCB = Math.sqrt(cb.x * cb.x + cb.y * cb.y);

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
    // (Calculated in 2D to avoid Z-axis depth distortion when leaning).
    const currentlyLocked = leftAngle > 150 && rightAngle > 150;

    // Debouncer: Only trigger the warning if arms are bent for at least 0.5 seconds (500ms)
    if (currentlyLocked) {
      this.isArmsLockedState = true;
      this.armsBentStartTime = 0;
    } else {
      if (this.armsBentStartTime === 0) {
        this.armsBentStartTime = timestamp;
      } else if (timestamp - this.armsBentStartTime >= 500) {
        this.isArmsLockedState = false;
      }
    }

    // ---------------------------------------------------------
    // CADENCE (BPM) TRACKING
    // Track the vertical displacement of the SHOULDERS instead of wrists
    // (Wrists jiggle when pressing onto the dummy, causing noise).
    // ---------------------------------------------------------
    let currentShoulderY = 0;
    let shoulderCount = 0;

    if (leftShoulder.visibility > 0.6) {
      currentShoulderY += leftShoulder.y;
      shoulderCount++;
    }
    if (rightShoulder.visibility > 0.6) {
      currentShoulderY += rightShoulder.y;
      shoulderCount++;
    }

    if (shoulderCount > 0) {
      currentShoulderY /= shoulderCount;

      // Note: In image coordinates, Y=0 is the top, Y=1 is the bottom.
      // So pushing down = Y increases. Releasing = Y decreases.

      if (this.isMovingDown) {
        // While moving down, keep tracking the lowest physical point (highest Y value)
        if (currentShoulderY > this.currentExtremeY) {
          this.currentExtremeY = currentShoulderY;
        }
        // If we bounce UP by more than the threshold, the push is over!
        else if (currentShoulderY < this.currentExtremeY - this.movementThreshold) {
          this.isMovingDown = false;
          this.currentExtremeY = currentShoulderY; // Reset extreme for the upward journey

          // --- We register this as one beat (bottom of the compression) ---
          this.peakTimestamps.push(timestamp);

          if (this.peakTimestamps.length > 6) {
            this.peakTimestamps.shift();
          }

          if (this.peakTimestamps.length >= 2) {
            const dt = timestamp - this.peakTimestamps[this.peakTimestamps.length - 2];
            if (dt > 200 && dt < 2000) {
              const instantBPM = 60000 / dt;
              if (this.emaBPM === 0) {
                this.emaBPM = instantBPM;
              } else {
                this.emaBPM = (instantBPM * 0.3) + (this.emaBPM * 0.7);
              }
            }
          }
        }
      } else {
        // While moving UP (releasing), keep tracking the highest physical point (lowest Y value)
        if (currentShoulderY < this.currentExtremeY) {
          this.currentExtremeY = currentShoulderY;
        }
        // If we bounce DOWN by more than the threshold, a new push has started!
        else if (currentShoulderY > this.currentExtremeY + this.movementThreshold) {
          this.isMovingDown = true;
          this.currentExtremeY = currentShoulderY; // Reset extreme for the downward journey
        }
      }
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
      isArmsLocked: this.isArmsLockedState,
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
    this.currentExtremeY = 0;
    this.isMovingDown = true;
    this.peakTimestamps = [];
    this.isArmsLockedState = true;
    this.armsBentStartTime = 0;
  }
}

export const cprMetrics = new CPRMetricsCalculator();
