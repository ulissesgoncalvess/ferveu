
import React from 'react';
import { Place, PlaceHeat } from '../types';
import { HeatBadge } from './HeatBadge';

interface PlaceCardProps {
  place: Place;
  onCheckIn: (id: string) => void;
  onPostVideo: (id: string) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, onCheckIn, onPostVideo }) => {
  const isPeak = place.heatStatus === PlaceHeat.EXPLODINDO;

  return (
    <div className={`group relative p-6 rounded-[2rem] border transition-all duration-500 glass ${
      isPeak ? 'border-zinc-700/50 bg-zinc-900/30' : 'border-zinc-800/40'
    }`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-display font-bold text-2xl text-zinc-100 tracking-tight">{place.name}</h3>
            {place.trend === 'up' && (
              <div className="flex items-center text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                RISING
              </div>
            )}
          </div>
          <p className="text-zinc-500 text-xs font-medium tracking-widest uppercase">{place.category}</p>
        </div>
        <HeatBadge status={place.heatStatus} value={place.heatValue} />
      </div>

      <div className="flex gap-6 mb-8">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Check-ins</span>
          <span className="text-lg font-display font-medium text-zinc-300">{place.checkInCount}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Live Feed</span>
          <span className="text-lg font-display font-medium text-zinc-300">{place.videoCount}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={() => onCheckIn(place.id)}
          className="flex-1 py-4 rounded-2xl bg-zinc-100 text-zinc-950 font-bold text-xs tracking-widest uppercase hover:bg-white transition-colors active:scale-[0.98]"
        >
          Check-in
        </button>
        <button 
          onClick={() => onPostVideo(place.id)}
          className="flex-1 py-4 rounded-2xl border border-zinc-700 text-zinc-100 font-bold text-xs tracking-widest uppercase hover:bg-zinc-800 transition-colors active:scale-[0.98]"
        >
          Post Live
        </button>
      </div>

      {isPeak && (
        <div className="absolute top-4 right-4 -z-10 blur-3xl w-24 h-24 bg-rose-500/10 rounded-full" />
      )}
    </div>
  );
};
