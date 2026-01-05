
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Place, Mission, UserLevel, PlaceHeat, Post } from './types';
import { INITIAL_USER, MOCK_PLACES, INITIAL_MISSIONS, MOCK_POSTS } from './constants';
import { PlaceCard } from './components/PlaceCard';
import { MapView } from './components/MapView';
import { PostCard } from './components/PostCard';
import { Login } from './components/Login';
import { getNightStrategy } from './geminiService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [places, setPlaces] = useState<Place[]>(MOCK_PLACES);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [view, setView] = useState<'map' | 'feed' | 'ranking' | 'missions'>('map');
  const [nightStrategy, setNightStrategy] = useState<string>("Analizando a curadoria da noite...");
  const [notifications, setNotifications] = useState<{id: number, msg: string}[]>([]);
  const [rankCategory, setRankCategory] = useState<'users' | 'places'>('users');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Carregar sessão existente
  useEffect(() => {
    const savedUser = localStorage.getItem('ferveu_session');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(prev => ({ ...prev, name: parsed.name }));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (name: string) => {
    const newUser = { ...user, name };
    setUser(newUser);
    localStorage.setItem('ferveu_session', JSON.stringify({ name }));
    setIsAuthenticated(true);
    addNotification(`Bem-vindo, ${name}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('ferveu_session');
    setIsAuthenticated(false);
  };

  // Monitorar Geolocalização Real
  useEffect(() => {
    if (!isAuthenticated || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error("Error obtaining location", error);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      setPlaces(prev => prev.map(p => {
        const decayAmount = p.heatStatus === PlaceHeat.EXPLODINDO ? 2 : 1;
        const newValue = Math.max(0, p.heatValue - decayAmount);
        let newStatus = PlaceHeat.MORNO;
        if (newValue > 85) newStatus = PlaceHeat.EXPLODINDO;
        else if (newValue > 50) newStatus = PlaceHeat.FERVENDO;
        return { 
          ...p, 
          heatValue: newValue, 
          heatStatus: newStatus,
          trend: newValue < p.heatValue ? 'down' : (newValue > p.heatValue ? 'up' : 'stable')
        };
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchStrategy = async () => {
      const activeStr = places.map(p => `${p.name} (${p.heatStatus})`).join(', ');
      const strategy = await getNightStrategy(user.name, user.level, activeStr);
      setNightStrategy(strategy);
    };
    fetchStrategy();
  }, [user.level, isAuthenticated]);

  const addNotification = (msg: string) => {
    const id = Date.now();
    setNotifications(prev => [{id, msg}, ...prev].slice(0, 1));
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const handleAction = (type: 'checkin' | 'post', placeId: string) => {
    const xpGain = type === 'checkin' ? 40 : 100;
    setPlaces(prev => prev.map(p => {
      if (p.id === placeId) {
        const newValue = Math.min(100, p.heatValue + (type === 'checkin' ? 8 : 20));
        let newStatus = PlaceHeat.MORNO;
        if (newValue > 85) newStatus = PlaceHeat.EXPLODINDO;
        else if (newValue > 50) newStatus = PlaceHeat.FERVENDO;
        return { 
          ...p, 
          checkInCount: type === 'checkin' ? p.checkInCount + 1 : p.checkInCount,
          videoCount: type === 'post' ? p.videoCount + 1 : p.videoCount,
          heatValue: newValue,
          heatStatus: newStatus,
          trend: 'up'
        };
      }
      return p;
    }));
    
    setUser(prev => {
      const newXP = prev.xp + xpGain;
      let newLevel = prev.level;
      if (newXP >= 3000) newLevel = UserLevel.INCENDIARIO;
      else if (newXP >= 1500) newLevel = UserLevel.FERVENDO;
      else if (newXP >= 500) newLevel = UserLevel.ESQUENTANDO;
      return { ...prev, xp: newXP, level: newLevel };
    });

    addNotification(`Atualizando status: +${xpGain} pontos`);
  };

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  };

  const onSelectPlace = (id: string) => {
    setSelectedPlaceId(id);
    const element = document.getElementById(`place-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 pb-32 max-w-md mx-auto relative animate-in fade-in duration-1000">
      <div className="fixed top-6 left-0 right-0 z-[60] px-6 pointer-events-none">
        {notifications.map((n) => (
          <div key={n.id} className="bg-white text-zinc-950 px-6 py-3 rounded-2xl text-[11px] font-bold tracking-widest uppercase text-center shadow-2xl animate-in slide-in-from-top-4 fade-in duration-500">
            {n.msg}
          </div>
        ))}
      </div>

      <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-2xl p-6 border-b border-zinc-900/50 flex justify-between items-end">
        <div onClick={() => setSelectedPlaceId(null)} className="cursor-pointer group">
          <h1 className="font-display text-xl font-bold tracking-[-0.04em] text-white">
            FERVEU<span className="text-rose-500 ml-0.5">.</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
             <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{user.level}</p>
             <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} className="opacity-0 group-hover:opacity-100 transition-opacity text-[8px] text-rose-500 font-black uppercase tracking-widest">Sair</button>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-display font-medium text-zinc-400">{user.xp} <span className="text-[10px] uppercase opacity-50">PTS</span></span>
          <div className="w-16 h-[2px] bg-zinc-900 mt-2 ml-auto overflow-hidden">
            <div className="h-full bg-zinc-400 transition-all duration-1000" style={{ width: `${(user.xp % 1000) / 10}%` }} />
          </div>
        </div>
      </header>

      <main className="p-6">
        <section className="mb-10 p-5 rounded-[2rem] border border-zinc-800/60 bg-zinc-900/20">
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 block">Curadoria Ferveu</span>
          <p className="text-sm font-medium leading-relaxed text-zinc-300 italic">
            "{nightStrategy}"
          </p>
        </section>

        {view === 'map' && (
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-display font-bold tracking-tight">O Radar</h2>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900/40 px-3 py-1.5 rounded-full border border-zinc-800">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                  Realtime Heat
                </div>
              </div>
              <MapView 
                places={places} 
                onSelectPlace={onSelectPlace} 
                selectedId={selectedPlaceId}
                userLocation={userLocation}
              />
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-baseline mb-4">
                <h2 className="text-xl font-display font-bold tracking-tight">Hotspots Próximos</h2>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Detectados Agora</span>
              </div>
              {places.sort((a, b) => b.heatValue - a.heatValue).map(place => (
                <div key={place.id} id={`place-${place.id}`} className="transition-transform duration-300">
                  <PlaceCard 
                    place={place}
                    isSelected={selectedPlaceId === place.id}
                    onSelect={setSelectedPlaceId}
                    onCheckIn={(id) => handleAction('checkin', id)}
                    onPostVideo={(id) => handleAction('post', id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'feed' && (
          <div className="animate-in fade-in duration-700">
            <div className="flex justify-between items-baseline mb-8">
              <h2 className="text-3xl font-display font-bold tracking-tight">Live Feed</h2>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Sincronizado Agora</span>
            </div>
            {posts.map(post => (
              <PostCard key={post.id} post={post} onLike={handleLike} />
            ))}
          </div>
        )}

        {view === 'ranking' && (
          <div className="animate-in fade-in duration-700">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-display font-bold">Patentes</h2>
              <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
                {['users', 'places'].map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => setRankCategory(cat as any)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-bold transition-all uppercase tracking-widest ${rankCategory === cat ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-500'}`}
                  >
                    {cat === 'users' ? 'Elite' : 'Hotspots'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {(rankCategory === 'users' ? [
                { name: 'Gui Noite', score: 4890, level: 'Incendiário' },
                { name: 'Ana Rave', score: 3210, level: 'Incendiário' },
                { name: user.name + ' (You)', score: user.xp, level: user.level },
              ] : places).map((r: any, i) => (
                <div key={i} className="flex items-center gap-5 p-5 rounded-3xl glass hover:bg-zinc-900/40 transition-colors">
                  <span className="font-display text-xl text-zinc-700 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-zinc-200">{r.name}</h4>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{r.level || r.heatStatus}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-display font-medium">{r.score || `${r.heatValue}%`}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'missions' && (
          <div className="space-y-4 animate-in fade-in duration-700">
            <h2 className="text-3xl font-display font-bold mb-8">Objetivos</h2>
            {missions.map(m => (
              <div key={m.id} className={`p-6 rounded-[2rem] border-2 transition-all ${m.completed ? 'bg-zinc-900/10 border-zinc-900/50 opacity-40' : 'bg-zinc-900/30 border-zinc-800'}`}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-zinc-100 tracking-tight">{m.title}</h3>
                  <span className="text-[10px] font-black text-amber-500/80">+{m.rewardXP} PTS</span>
                </div>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">{m.description}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[380px]">
        <div className="bg-zinc-900/80 backdrop-blur-3xl border border-zinc-800/50 rounded-[2.5rem] p-2 flex justify-between items-center premium-shadow">
          <button onClick={() => setView('map')} className={`flex-1 py-4 flex justify-center transition-all ${view === 'map' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>

          <button onClick={() => setView('feed')} className={`flex-1 py-4 flex justify-center transition-all ${view === 'feed' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
          
          <button onClick={() => setView('missions')} className={`flex-1 py-4 flex justify-center transition-all ${view === 'missions' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>

          <button onClick={() => setView('ranking')} className={`flex-1 py-4 flex justify-center transition-all ${view === 'ranking' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
