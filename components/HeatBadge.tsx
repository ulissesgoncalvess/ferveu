
import React from 'react';
import { PlaceHeat } from '../types';

interface HeatBadgeProps {
  status: PlaceHeat;
  value: number;
}

export const HeatBadge: React.FC<HeatBadgeProps> = ({ status, value }) => {
  const getColors = () => {
    switch (status) {
      case PlaceHeat.MORNO: 
        return 'text-zinc-400 border-zinc-800 bg-zinc-900/40';
      case PlaceHeat.FERVENDO: 
        return 'text-amber-500 border-amber-900/30 bg-amber-500/5';
      case PlaceHeat.EXPLODINDO: 
        return 'text-rose-500 border-rose-900/40 bg-rose-500/10';
      default: return 'text-zinc-500 border-zinc-800 bg-zinc-900/40';
    }
  };

  return (
    <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border text-[10px] font-bold tracking-[0.1em] uppercase ${getColors()}`}>
      <div className="flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className={`w-1 h-3 rounded-full transition-all duration-700 ${
              (status === PlaceHeat.MORNO && i === 1) ||
              (status === PlaceHeat.FERVENDO && i <= 2) ||
              (status === PlaceHeat.EXPLODINDO && i <= 3)
              ? (status === PlaceHeat.EXPLODINDO ? 'bg-rose-500 animate-pulse' : status === PlaceHeat.FERVENDO ? 'bg-amber-500' : 'bg-zinc-400')
              : 'bg-zinc-800'
            }`}
          />
        ))}
      </div>
      <span>{value}% {status}</span>
    </div>
  );
};
