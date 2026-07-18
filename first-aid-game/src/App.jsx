import { useState } from 'react';
import { Trophy, Activity, Camera } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState('lobby'); // lobby, active, results

  return (
    <div className="relative w-screen h-screen bg-neutral-950 flex flex-col justify-between p-6 overflow-hidden select-none">
      
      {/* Premium HUD Header */}
      <header className="w-full max-w-xl mx-auto flex justify-between items-center bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl z-50">
        <div className="flex items-center gap-2">
          <Activity className="text-emerald-400 animate-pulse" size={24} />
          <span className="font-bold tracking-wide uppercase text-sm">Rescuer Room #402</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-neutral-400 font-medium">Global Rank</p>
            <p className="text-sm font-bold text-amber-400 flex items-center gap-1 justify-end">
              <Trophy size={14} /> #12
            </p>
          </div>
        </div>
      </header>

      {/* Main Canvas Area (Where the Video & 3D will sit) */}
      <main className="absolute inset-0 w-full h-full flex items-center justify-center bg-neutral-900">
        {gameState === 'lobby' ? (
          <div className="text-center max-w-xs space-y-4 z-50">
            <h1 className="text-3xl font-black uppercase tracking-tight">First Aid AR</h1>
            <p className="text-sm text-neutral-400">Position your phone on the floor at a side angle to calibrate body posture tracking.</p>
            <button 
              onClick={() => setGameState('active')}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-98 transition font-bold text-black rounded-xl shadow-lg shadow-emerald-500/20 uppercase tracking-wider text-sm"
            >
              Start Practice Session
            </button>
          </div>
        ) : (
          <div className="absolute bottom-10 z-50">
            <button 
              onClick={() => setGameState('lobby')}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold backdrop-blur"
            >
              Exit to Lobby
            </button>
          </div>
        )}
        
        {/* Placeholder representation for the camera stream layout */}
        <div className="absolute inset-0 opacity-20 flex items-center justify-center pointer-events-none">
          <Camera size={80} className="text-neutral-700" />
        </div>
      </main>

    </div>
  );
}