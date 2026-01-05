
export enum UserLevel {
  CURIOSO = 'Curioso',
  ESQUENTANDO = 'Esquentando',
  FERVENDO = 'Fervendo',
  INCENDIARIO = 'Incendiário'
}

export enum PlaceHeat {
  MORNO = 'Morno',
  FERVENDO = 'Fervendo',
  EXPLODINDO = 'Explodindo'
}

export interface User {
  id: string;
  name: string;
  xp: number;
  level: UserLevel;
  streak: number;
  lastCheckIn?: string;
  sessionRank?: number;
}

export interface Place {
  id: string;
  name: string;
  category: string;
  heatValue: number; // 0-100
  heatStatus: PlaceHeat;
  checkInCount: number;
  videoCount: number;
  lastUpdate: number;
  location: { lat: number; lng: number };
  trend: 'up' | 'down' | 'stable';
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userLevel: UserLevel;
  placeId: string;
  placeName: string;
  content: string;
  imageUrl: string;
  timestamp: number;
  likes: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  rewardXP: number;
  completed: boolean;
  expiresIn: number; // Minutes remaining
  type: 'post' | 'checkin' | 'social';
}
