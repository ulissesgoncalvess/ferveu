
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Place, Mission, UserLevel, PlaceHeat, Post } from './types';
import { INITIAL_USER, MOCK_PLACES, INITIAL_MISSIONS, MOCK_POSTS } from './constants';
import { PlaceCard } from './components/PlaceCard';
import { MapView } from './components/MapView';
import { PostCard } from './components/PostCard';
import { Login } from './components/Login';
import { ProfileView } from './components/ProfileView';
import { getNightStrategy } from './geminiService';

declare const google: any;

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User>({
    ...INITIAL_USER,
    joinedAt: new Date().toISOString()
  });
  const [places, setPlaces] = useState<Place[]>([]);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [view, setView] = useState<'map' | 'feed' | 'ranking' | 'missions' | 'profile'>('map');
  const [nightStrategy, setNightStrategy] = useState<string>("Buscando a vibe da cidade...");
  const [notifications, setNotifications] = useState<{ id: number, msg: string }[]>([]);
  const [rankCategory, setRankCategory] = useState<'users' | 'places'>('users');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

  // Carregar sessão
  useEffect(() => {
    const savedUser = localStorage.getItem('ferveu_session');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(prev => ({ ...prev, name: parsed.name, email: parsed.email }));
      setIsAuthenticated(true);
    }
  }, []);

  const addNotification = (msg: string) => {
    const id = Date.now();
    setNotifications(prev => [{ id, msg }, ...prev].slice(0, 1));
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
  };

  // Busca Real por Locais Próximos (Google Places)
  const fetchRealPlaces = useCallback(async (location: { lat: number, lng: number }) => {
    if (typeof google === 'undefined') {
      console.warn("Google Maps API not loaded yet.");
      return;
    }

    try {
      // Importar a nova biblioteca de Places (Modern API)
      const { Place: GooglePlace } = await google.maps.importLibrary("places") as any;

      const request = {
        fields: ['displayName', 'location', 'businessStatus', 'id', 'types', 'rating', 'userRatingCount'],
        locationRestriction: {
          center: location,
          radius: 2000,
        },
        includedPrimaryTypes: ['bar', 'night_club', 'restaurant'],
        maxResultCount: 20
      };

      const { places } = await GooglePlace.searchNearby(request);

      if (places && places.length > 0) {
        const realPlaces: Place[] = places.map((place: any) => {
          const popularity = place.userRatingCount || Math.floor(Math.random() * 200);
          const rating = place.rating || 4;
          const heatValue = Math.min(100, Math.floor((popularity / 500) * 50 + (rating * 10)));

          let heatStatus = PlaceHeat.MORNO;
          if (heatValue > 80) heatStatus = PlaceHeat.EXPLODINDO;
          else if (heatValue > 50) heatStatus = PlaceHeat.FERVENDO;

          return {
            id: place.id,
            name: place.displayName,
            category: place.types?.[0]?.replace('_', ' ') || 'Local',
            heatValue,
            heatStatus,
            checkInCount: popularity,
            videoCount: Math.floor(popularity / 10),
            lastUpdate: Date.now(),
            location: {
              lat: place.location.lat(),
              lng: place.location.lng()
            },
            trend: Math.random() > 0.5 ? 'up' : 'stable'
          };
        });
        setPlaces(realPlaces);
        addNotification(`${realPlaces.length} locais encontrados!`);
      } else {
        addNotification("Nenhum hotspot encontrado na área.");
      }
    } catch (error: any) {
      console.error("New Places API Error:", error);
      // Fallback or specific error handling
      addNotification(`Erro ao buscar locais: ${error.message || 'Verifique o console'}`);
    }
  }, [addNotification]);

  // Monitorar GPS e Disparar Busca
  useEffect(() => {
    if (!isAuthenticated) return;

    if (!navigator.geolocation) {
      addNotification("Seu navegador não suporta geolocalização.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(loc);
        fetchRealPlaces(loc);
      },
      (error) => {
        console.error("Erro GPS:", error);
        addNotification(`Erro no GPS: ${error.message}. Verifique as permissões.`);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  }, [isAuthenticated, fetchRealPlaces, addNotification]);

  // Estratégia da Noite via Gemini
  useEffect(() => {
    if (!isAuthenticated || places.length === 0) return;
    const fetchStrategy = async () => {
      const activeStr = places.slice(0, 3).map(p => `${p.name} (${p.heatStatus})`).join(', ');
      const strategy = await getNightStrategy(user.name, user.level, activeStr);
      setNightStrategy(strategy);
    };
    fetchStrategy();
  }, [user.level, isAuthenticated, places]);

  const handleLogin = (name: string, email: string) => {
    const newUser = { ...user, name, email };
    setUser(newUser);
    localStorage.setItem('ferveu_session', JSON.stringify({ name, email }));
    setIsAuthenticated(true);
    addNotification(`Identidade confirmada: ${name}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('ferveu_session');
    setIsAuthenticated(false);
    setView('map');
  };



  const handleAction = (type: 'checkin' | 'post', placeId: string) => {
    const xpGain = type === 'checkin' ? 50 : 120;
    setPlaces(prev => prev.map(p => p.id === placeId ? { ...p, heatValue: Math.min(100, p.heatValue + 5) } : p));
    setUser(prev => {
      const newXP = prev.xp + xpGain;
      let newLevel = prev.level;
      if (newXP >= 3000) newLevel = UserLevel.INCENDIARIO;
      else if (newXP >= 1500) newLevel = UserLevel.FERVENDO;
      return { ...prev, xp: newXP, level: newLevel };
    });
    addNotification(`+${xpGain} XP conquistados!`);
  };

  // Fix: Added missing handleLike function to update post likes state.
  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  };

  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 pb-32 max-w-md mx-auto relative animate-in fade-in duration-1000">
      {/* Sistema de Notificações */}
      <div className="fixed top-6 left-0 right-0 z-[100] px-6 pointer-events-none">
        {notifications.map((n) => (
          <div key={n.id} className="bg-white text-zinc-950 px-6 py-4 rounded-[1.5rem] text-[11px] font-black tracking-widest uppercase text-center shadow-2xl animate-in slide-in-from-top-4 fade-in">
            {n.msg}
          </div>
        ))}
      </div>

      <header className="sticky top-0 z-50 bg-[#050505]/90 backdrop-blur-2xl p-6 border-b border-zinc-900/50 flex justify-between items-end">
        <div onClick={() => setView('map')} className="cursor-pointer group">
          <h1 className="font-display text-2xl font-bold tracking-tighter text-white">
            FERVEU<span className="text-rose-500">.</span>
          </h1>
          <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] mt-1">{user.level}</p>
        </div>
        <div className="text-right">
          <span className="text-sm font-display font-medium text-zinc-400">{user.xp} <span className="text-[10px] opacity-40">XP</span></span>
          <div className="w-12 h-[2px] bg-zinc-900 mt-2 ml-auto overflow-hidden">
            <div className="h-full bg-rose-500" style={{ width: `${(user.xp % 1000) / 10}%` }} />
          </div>
        </div>
      </header>

      <main className="p-6">
        {view !== 'profile' && (
          <section className="mb-10 p-6 rounded-[2rem] glass border-zinc-800/40">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">Conselheiro Ferveu</span>
            <p className="text-sm font-medium leading-relaxed text-zinc-200 italic">"{nightStrategy}"</p>
          </section>
        )}

        {view === 'map' && (
          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="text-3xl font-display font-bold">O Radar Real</h2>
              {!userLocation ? (
                <div className="w-full h-[400px] bg-zinc-900/50 rounded-[2.5rem] flex items-center justify-center border border-zinc-800 animate-pulse">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Buscando satélites...</p>
                    <p className="text-zinc-600 text-[10px] mt-2">Permita o acesso à localização</p>
                  </div>
                </div>
              ) : (
                <MapView
                  places={places}
                  onSelectPlace={setSelectedPlaceId}
                  selectedId={selectedPlaceId}
                  userLocation={userLocation}
                />
              )}
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">Hotspots na sua área</h3>
              {places.length === 0 ? (
                <div className="p-12 text-center text-zinc-600 font-bold uppercase text-[10px] tracking-widest">Sincronizando locais reais...</div>
              ) : (
                places.map(place => (
                  <div key={place.id} id={`place-${place.id}`}>
                    <PlaceCard
                      place={place}
                      isSelected={selectedPlaceId === place.id}
                      onSelect={setSelectedPlaceId}
                      onCheckIn={(id) => handleAction('checkin', id)}
                      onPostVideo={(id) => handleAction('post', id)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {view === 'feed' && (
          <div className="animate-in fade-in">
            <h2 className="text-3xl font-display font-bold mb-8 tracking-tighter">Live Feed</h2>
            {posts.map(post => <PostCard key={post.id} post={post} onLike={handleLike} />)}
          </div>
        )}

        {view === 'profile' && <ProfileView user={user} onLogout={handleLogout} />}

        {view === 'ranking' && (
          <div className="animate-in fade-in">
            <h2 className="text-3xl font-display font-bold mb-8">Hall da Fama</h2>
            <div className="space-y-4">
              {places.slice(0, 5).map((p, i) => (
                <div key={p.id} className="flex items-center gap-5 p-5 rounded-[1.5rem] glass">
                  <span className="text-zinc-700 font-display text-xl">{i + 1}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{p.name}</h4>
                    <p className="text-[9px] text-zinc-500 uppercase tracking-widest">{p.heatStatus}</p>
                  </div>
                  <span className="text-rose-500 font-display font-bold">{p.heatValue}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] w-[92%] max-w-[380px]">
        <div className="bg-zinc-950/80 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-2 flex justify-between items-center premium-shadow">
          <button onClick={() => setView('map')} className={`flex-1 py-4 flex justify-center transition-all ${view === 'map' ? 'text-rose-500 scale-110' : 'text-zinc-600 hover:text-zinc-400'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
          <button onClick={() => setView('feed')} className={`flex-1 py-4 flex justify-center transition-all ${view === 'feed' ? 'text-rose-500 scale-110' : 'text-zinc-600 hover:text-zinc-400'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
          <button onClick={() => setView('ranking')} className={`flex-1 py-4 flex justify-center transition-all ${view === 'ranking' ? 'text-rose-500 scale-110' : 'text-zinc-600 hover:text-zinc-400'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </button>
          <button onClick={() => setView('profile')} className={`flex-1 py-4 flex justify-center transition-all ${view === 'profile' ? 'text-rose-500 scale-110' : 'text-zinc-600 hover:text-zinc-400'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
