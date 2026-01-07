
import React from 'react';
import { Place, PlaceHeat } from '../types';
import { HeatBadge } from './HeatBadge';

interface PlaceCardProps {
  place: Place;
  isSelected?: boolean;
  onCheckIn: (id: string) => void;
  onPostVideo: (id: string) => void;
  onSelect?: (id: string) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, isSelected, onCheckIn, onPostVideo, onSelect }) => {
  const isPeak = place.heatStatus === PlaceHeat.EXPLODINDO;

  return (
    <div 
      onClick={() => onSelect?.(place.id)}
      className={`group relative p-6 rounded-[2rem] border transition-all duration-500 cursor-pointer glass ${
        isSelected 
          ? 'border-zinc-100 bg-zinc-800/40 ring-1 ring-zinc-100/20' 
          : (isPeak ? 'border-zinc-700/50 bg-zinc-900/30 hover:border-zinc-600' : 'border-zinc-800/40 hover:border-zinc-700')
      }`}
    >
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
          onClick={(e) => { e.stopPropagation(); onCheckIn(place.id); }}
          className={`flex-1 py-4 rounded-2xl font-bold text-xs tracking-widest uppercase transition-all active:scale-[0.98] ${
            isSelected ? 'bg-white text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-zinc-100 text-zinc-950 hover:bg-white'
          }`}
        >
          Check-in
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onPostVideo(place.id); }}
          className="flex-1 py-4 rounded-2xl border border-zinc-700 text-zinc-100 font-bold text-xs tracking-widest uppercase hover:bg-zinc-800 transition-colors active:scale-[0.98]"
        >
          Post Live
        </button>
      </div>

      {(isPeak || isSelected) && (
        <div className={`absolute top-4 right-4 -z-10 blur-3xl w-24 h-24 rounded-full transition-colors duration-700 ${
          isSelected ? 'bg-zinc-100/5' : 'bg-rose-500/10'
        }`} />
      )}
    </div>
  );
};
