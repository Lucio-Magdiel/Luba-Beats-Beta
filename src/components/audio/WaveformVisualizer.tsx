'use client';

import { useRef } from 'react';

interface WaveformVisualizerProps {
  waveform: number[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeek: (percent: number) => void;
  barColor?: string;
  activeColor?: string;
  height?: number;
  interactive?: boolean;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  waveform,
  currentTime,
  duration,
  isPlaying,
  onSeek,
  barColor = 'bg-zinc-700',
  activeColor = 'bg-gradient-to-t from-purple-500 to-cyan-400',
  height = 36,
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(percent);
  };

  const safeWaveform = waveform && waveform.length > 0 ? waveform : Array(50).fill(0.35);

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      style={{ height: `${height}px` }}
      className={`group relative flex w-full items-center justify-between gap-[2px] sm:gap-[3px] overflow-hidden py-1 ${
        interactive ? 'cursor-pointer' : ''
      }`}
    >
      {safeWaveform.map((bar, index) => {
        const barPercent = (index / safeWaveform.length) * 100;
        const isActive = barPercent <= progressPercent;

        // Scale bar height between 15% and 100%
        const barHeightPct = Math.max(15, bar * 100);

        return (
          <div
            key={index}
            style={{ height: `${barHeightPct}%` }}
            className={`flex-1 min-w-[2px] rounded-full transition-all duration-100 ${
              isActive
                ? `${activeColor} ${isPlaying ? 'shadow-[0_0_8px_rgba(168,85,247,0.4)]' : ''}`
                : `${barColor} group-hover:bg-zinc-600`
            }`}
          />
        );
      })}
    </div>
  );
};
