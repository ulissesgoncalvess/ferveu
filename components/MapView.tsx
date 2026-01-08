
import React, { useEffect, useRef } from 'react';
import { Place, PlaceHeat } from '../types';

interface MapViewProps {
  places: Place[];
  onSelectPlace: (id: string) => void;
  selectedId?: string | null;
  userLocation: { lat: number; lng: number } | null;
}

declare const google: any;

export const MapView: React.FC<MapViewProps> = ({ places, onSelectPlace, selectedId, userLocation }) => {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: any }>({});

  const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#212121" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
    { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#181818" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
    { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  ];

  useEffect(() => {
    if (!containerRef.current || typeof google === 'undefined') return;

    const initialCenter = userLocation || { lat: -23.5505, lng: -46.6333 };

    if (!mapRef.current) {
      mapRef.current = new google.maps.Map(containerRef.current, {
        center: initialCenter,
        zoom: 15,
        styles: darkMapStyle,
        disableDefaultUI: true,
        gestureHandling: "greedy",
      });
    }

    // Se a localização do usuário carregar depois do mapa, centralizar nele
    if (userLocation && mapRef.current) {
      // Opcional: só centralizar se não estiver focado em um lugar
      if (!selectedId) {
        mapRef.current.setCenter(userLocation);
      }
    }

    // Limpar marcadores antigos
    Object.values(markersRef.current).forEach((m: any) => m.setMap(null));
    markersRef.current = {};

    // Marcador do Usuário
    if (userLocation) {
      new google.maps.Marker({
        position: userLocation,
        map: mapRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#3b82f6",
          fillOpacity: 1,
          strokeWeight: 3,
          strokeColor: "#ffffff",
        },
        title: "Você",
      });
    }

    // Marcadores dos Lugares
    places.forEach((place) => {
      const isPeak = place.heatStatus === PlaceHeat.EXPLODINDO;
      const color = isPeak ? '#f43f5e' : (place.heatStatus === PlaceHeat.FERVENDO ? '#f59e0b' : '#a1a1aa');

      const marker = new google.maps.Marker({
        position: place.location,
        map: mapRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isPeak ? 12 : 8,
          fillColor: color,
          fillOpacity: 0.9,
          strokeWeight: 2,
          strokeColor: "#ffffff",
        },
        title: place.name,
      });

      marker.addListener("click", () => onSelectPlace(place.id));
      markersRef.current[place.id] = marker;
    });

  }, [places, userLocation]);

  useEffect(() => {
    if (selectedId && markersRef.current[selectedId] && mapRef.current) {
      mapRef.current.panTo(markersRef.current[selectedId].getPosition());
      mapRef.current.setZoom(17);
    }
  }, [selectedId]);

  return (
    <div className="relative w-full h-[400px] bg-zinc-950 rounded-[2.5rem] border border-zinc-900 overflow-hidden premium-shadow">
      <div ref={containerRef} className="w-full h-full" />

      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <div className="glass px-3 py-1.5 rounded-full text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          Live Google Radar
        </div>
      </div>
    </div>
  );
};
