import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';

export const CodeTimer: React.FC = () => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: number | undefined;

    if (isActive) {
      interval = window.setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setIsActive(false);
    setSeconds(0);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-medical-surface border border-slate-700 rounded-lg p-4 flex flex-col items-center justify-center shadow-lg">
      <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider mb-2">
        <Timer size={14} />
        <span>Crisis Duration</span>
      </div>
      <div className={`text-4xl font-mono font-bold tabular-nums mb-4 ${isActive ? 'text-medical-critical' : 'text-slate-200'}`}>
        {formatTime(seconds)}
      </div>
      <div className="flex gap-2 w-full">
        <button
          onClick={toggle}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded font-semibold transition-colors ${
            isActive 
              ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' 
              : 'bg-green-700 hover:bg-green-600 text-white'
          }`}
        >
          {isActive ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Start</>}
        </button>
        <button
          onClick={reset}
          className="flex items-center justify-center p-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
          title="Reset Timer"
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
};
