
import { Place, PlaceHeat, UserLevel, Mission, Post } from './types';

export const INITIAL_USER = {
  id: 'u1',
  name: 'Leo Rolê',
  xp: 450,
  level: UserLevel.ESQUENTANDO,
  streak: 3,
};

export const MOCK_PLACES: Place[] = [
  {
    id: 'p1',
    name: 'Bar do Zeca',
    category: 'Boteco Chic',
    heatValue: 45,
    heatStatus: PlaceHeat.MORNO,
    checkInCount: 12,
    videoCount: 2,
    lastUpdate: Date.now(),
    location: { lat: -23.5505, lng: -46.6333 },
    trend: 'stable'
  },
  {
    id: 'p2',
    name: 'Techno Bunker',
    category: 'Balada',
    heatValue: 92,
    heatStatus: PlaceHeat.EXPLODINDO,
    checkInCount: 156,
    videoCount: 45,
    lastUpdate: Date.now(),
    location: { lat: -23.5605, lng: -46.6433 },
    trend: 'stable'
  },
  {
    id: 'p3',
    name: 'Skyline Rooftop',
    category: 'Lounge',
    heatValue: 72,
    heatStatus: PlaceHeat.FERVENDO,
    checkInCount: 88,
    videoCount: 18,
    lastUpdate: Date.now(),
    location: { lat: -23.5705, lng: -46.6533 },
    trend: 'stable'
  }
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'post1',
    userId: 'u2',
    userName: 'Ana Rave',
    userLevel: UserLevel.INCENDIARIO,
    placeId: 'p2',
    placeName: 'Techno Bunker',
    content: 'A curadoria de hoje tá impecável. Som absurdo.',
    imageUrl: 'https://images.unsplash.com/photo-1574391884720-bbc37bb01d74?q=80&w=800&auto=format&fit=crop',
    timestamp: Date.now() - 1000 * 60 * 15, // 15 min ago
    likes: 24
  },
  {
    id: 'post2',
    userId: 'u3',
    userName: 'Gui Noite',
    userLevel: UserLevel.FERVENDO,
    placeId: 'p3',
    placeName: 'Skyline Rooftop',
    content: 'Drink gelado e vista perfeita. O radar não errou.',
    imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop',
    timestamp: Date.now() - 1000 * 60 * 45, // 45 min ago
    likes: 12
  }
];

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm1',
    title: 'Pioneiro da Noite',
    description: 'Faça o primeiro check-in em um lugar que ainda está Morno.',
    rewardXP: 100,
    completed: false,
    type: 'checkin',
    expiresIn: 120
  },
  {
    id: 'm2',
    title: 'Diretor de Cena',
    description: 'Poste um vídeo de pelo menos 10s em um lugar Fervendo.',
    rewardXP: 150,
    completed: false,
    type: 'post',
    expiresIn: 120
  }
];
