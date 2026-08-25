# MediaPipe Inference Benchmark

**Date:** August 25, 2026

**Hardware Tested On:** Apple Silicon Mac (Safari)

**Methodology:** Averaged the `performance.now()` delta across 30 frames during live webcam inference running entirely client-side via WebAssembly.

**Target FPS:** 30 FPS (Max allowable inference time: < 33.3ms)

## Results
**Average Inference Time:** ~13.5 ms

*(Test run showed a stable range between 12.90ms and 14.93ms, with a single spike to 17.80ms. This confirms the engine is efficient enough to comfortably run at 30 FPS.)*

## Proof / Logs
```text
[Log] [MediaPipe Benchmark] Average processing time over 30 frames: 13.43ms (mediapipePose.ts, line 50)
[Log] [MediaPipe Benchmark] Average processing time over 30 frames: 13.27ms (mediapipePose.ts, line 50)
[Log] [MediaPipe Benchmark] Average processing time over 30 frames: 13.47ms (mediapipePose.ts, line 50)
[Log] [MediaPipe Benchmark] Average processing time over 30 frames: 13.80ms (mediapipePose.ts, line 50)
[Log] [MediaPipe Benchmark] Average processing time over 30 frames: 12.90ms (mediapipePose.ts, line 50)
```
