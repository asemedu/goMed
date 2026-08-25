# Supabase WebSocket Load Test

**Date:** August 25, 2026
**Hardware Tested On:** Apple Silicon Mac (Local Node.js) -> Supabase Realtime
**Methodology:** Spawned 100 concurrent connections distributed evenly across 5 simultaneous Supabase Realtime channels (lobbies). A Host in each lobby broadcasted a start signal, and 19 students in each lobby immediately replied to simulate peak quiz traffic.

## Results
**Concurrent Connections Handled:** 100 (Zero dropped connections)
**Average Propagation Delay:** 77.07 ms
**Fastest Message:** 54 ms
**Slowest Message:** 86 ms

*(Analysis: Supabase Realtime perfectly handled the simultaneous multi-channel traffic spike. An average round-trip latency of ~77ms for 95 simultaneous broadcasts is well below the human perception threshold for real-time multiplayer (~150ms). The tight variance (54ms-86ms) proves the server did not choke under load.)*

## Proof / Logs
```text
Starting Load Test
----------------------------------------
Lobbies: 5
Bots per Lobby: 20
Total Connections: 100
----------------------------------------

Connecting bots to Supabase Realtime (this might take a few seconds)...

Lobby 2 ready (20/20 bots)
Lobby 4 ready (20/20 bots)
Lobby 1 ready (20/20 bots)
Lobby 5 ready (20/20 bots)
Lobby 3 ready (20/20 bots)

All 100 bots successfully connected!
3... 2... 1... Firing Simultaneous Quizzes!

Load Test Complete! All 95 answers received.

RESULTS:
Total Concurrent Connections: 100
Average Propagation Latency:  77.07 ms
Slowest Answer Received In:   86 ms
Fastest Answer Received In:   54 ms
```


