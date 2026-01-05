
import React, { useMemo } from 'react';
import { Place, PlaceHeat } from '../types';

interface MapViewProps {
  places: Place[];
  onSelectPlace: (id: string) => void;
  selectedId?: string | null;
  userLocation: { lat: number; lng: number } | null;
}

export const MapView: React.FC<MapViewProps> = ({ places, onSelectPlace, selectedId, userLocation }) => {
  // Configuração do Radar: Raio de ~5km para o zoom inicial
  const ZOOM_RADIUS = 0.05; // Aproximadamente 5.5km em graus decimais

  const projectedMarkers = useMemo(() => {
    // Se não houver localização do usuário, usamos o centro de SP como fallback para os cálculos
    const center = userLocation || { lat: -23.5505, lng: -46.6333 };

    return places.map(p => {
      // Cálculo de delta relativo ao centro (usuário)
      // Mapeamos o range [-ZOOM_RADIUS, ZOOM_RADIUS] para [0, 100]%
      const dx = (p.location.lng - center.lng) / (ZOOM_RADIUS * 2) + 0.5;
      const dy = (center.lat - p.location.lat) / (ZOOM_RADIUS * 2) + 0.5; // Invertido pois Y cresce para baixo no CSS

      return {
        ...p,
        x: Math.max(0, Math.min(100, dx * 100)),
        y: Math.max(0, Math.min(100, dy * 100)),
        isOutRange: dx < 0 || dx > 1 || dy < 0 || dy > 1
      };
    });
  }, [places, userLocation]);

  return (
    <div className="relative w-full h-[400px] bg-zinc-950 rounded-[2.5rem] border border-zinc-900 overflow-hidden premium-shadow group">
      {/* Grid Dinâmica */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

      {/* Círculos de Distância (Radar Rings) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[80%] h-[80%] border border-zinc-800/30 rounded-full" />
        <div className="w-[50%] h-[50%] border border-zinc-800/30 rounded-full" />
        <div className="w-[20%] h-[20%] border border-zinc-800/30 rounded-full" />
      </div>
      
      {/* Camada de Calor (Heat Map Logic) */}
      <div className="absolute inset-0 filter blur-[35px] opacity-30 mix-blend-screen pointer-events-none">
        {projectedMarkers.filter(p => !p.isOutRange).map(p => (
          <div 
            key={`heat-${p.id}`}
            className={`absolute rounded-full transition-all duration-1000 ${
              p.heatStatus === PlaceHeat.EXPLODINDO ? 'bg-rose-600' : 
              p.heatStatus === PlaceHeat.FERVENDO ? 'bg-amber-500' : 'bg-zinc-700'
            }`}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.heatValue * 1.8}px`,
              height: `${p.heatValue * 1.8}px`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>

      {/* Marcadores de Lugares */}
      <div className="absolute inset-0">
        {projectedMarkers.filter(p => !p.isOutRange).map(p => {
          const isSelected = p.id === selectedId;
          return (
            <button
              key={`marker-${p.id}`}
              onClick={() => onSelectPlace(p.id)}
              className={`absolute group/marker transition-all duration-500 ${isSelected ? 'scale-150 z-30' : 'hover:scale-125 z-10'}`}
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {(p.heatStatus !== PlaceHeat.MORNO || isSelected) && (
                <div className={`absolute inset-0 rounded-full animate-ping opacity-30 ${
                  isSelected ? 'bg-white duration-700' : (p.heatStatus === PlaceHeat.EXPLODINDO ? 'bg-rose-500' : 'bg-amber-500')
                }`} />
              )}
              
              <div className={`w-3 h-3 rounded-full border-2 border-white shadow-xl transition-colors ${
                p.heatStatus === PlaceHeat.EXPLODINDO ? 'bg-rose-600' : 
                p.heatStatus === PlaceHeat.FERVENDO ? 'bg-amber-500' : 'bg-zinc-400'
              } ${isSelected ? 'shadow-[0_0_15px_rgba(255,255,255,0.8)]' : ''}`} />

              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-lg transition-opacity pointer-events-none whitespace-nowrap ${isSelected ? 'opacity-100' : 'opacity-0 group-hover/marker:opacity-100'}`}>
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">{p.name}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Marcador do Usuário (Centro) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
        <div className="relative">
          <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-40" />
          <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-[0_0_10px_rgba(37,99,235,0.6)]" />
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-blue-600 px-2 py-0.5 rounded text-[8px] font-black text-white uppercase tracking-widest whitespace-nowrap">
          VOCÊ
        </div>
      </div>

      {/* Overlay de Status do GPS */}
      <div className="absolute bottom-6 right-6 z-10">
         <div className="glass px-3 py-1.5 rounded-full text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${userLocation ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
            {userLocation ? 'GPS: Locked' : 'GPS: Searching...'}
         </div>
      </div>
    </div>
  );
};
