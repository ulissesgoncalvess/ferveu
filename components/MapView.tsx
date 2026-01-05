
import React, { useMemo } from 'react';
import { Place, PlaceHeat } from '../types';

interface MapViewProps {
  places: Place[];
  onSelectPlace: (id: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({ places, onSelectPlace }) => {
  // Simulação de coordenadas para escala local (0-100 para o container)
  const mapMarkers = useMemo(() => {
    return places.map(p => ({
      ...p,
      x: ((p.location.lng + 46.65) * 500) % 100, // Pseudo-mapeamento para visualização
      y: ((p.location.lat + 23.56) * 500) % 100,
    }));
  }, [places]);

  return (
    <div className="relative w-full h-[400px] bg-zinc-950 rounded-[2.5rem] border border-zinc-900 overflow-hidden premium-shadow group">
      {/* City Grid Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      
      {/* Heat Map Layer (Blurred Orbs) */}
      <div className="absolute inset-0 filter blur-[40px] opacity-40 mix-blend-screen pointer-events-none">
        {mapMarkers.map(p => (
          <div 
            key={`heat-${p.id}`}
            className={`absolute rounded-full transition-all duration-1000 ${
              p.heatStatus === PlaceHeat.EXPLODINDO ? 'bg-rose-600' : 
              p.heatStatus === PlaceHeat.FERVENDO ? 'bg-amber-500' : 'bg-zinc-600'
            }`}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.heatValue * 1.5}px`,
              height: `${p.heatValue * 1.5}px`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>

      {/* Interactive Markers */}
      <div className="absolute inset-0">
        {mapMarkers.map(p => (
          <button
            key={`marker-${p.id}`}
            onClick={() => onSelectPlace(p.id)}
            className="absolute group/marker transition-transform hover:scale-125"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Pulsing Aura for Hot Places */}
            {p.heatStatus !== PlaceHeat.MORNO && (
              <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${
                p.heatStatus === PlaceHeat.EXPLODINDO ? 'bg-rose-500' : 'bg-amber-500'
              }`} />
            )}
            
            {/* Core Marker */}
            <div className={`w-3 h-3 rounded-full border-2 border-white shadow-xl transition-colors ${
              p.heatStatus === PlaceHeat.EXPLODINDO ? 'bg-rose-600' : 
              p.heatStatus === PlaceHeat.FERVENDO ? 'bg-amber-500' : 'bg-zinc-300'
            }`} />

            {/* Tooltip on Hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg opacity-0 group-hover/marker:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">{p.name}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 flex flex-col gap-1.5 z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.1em]">Explodindo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.1em]">Fervendo</span>
        </div>
      </div>

      {/* Center UI Hint */}
      <div className="absolute top-6 right-6 z-10">
         <div className="glass px-3 py-1.5 rounded-full text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Pulse Active
         </div>
      </div>
    </div>
  );
};
