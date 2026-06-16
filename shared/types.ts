export interface User {
  id: string;
  username: string;
  email?: string;
  createdAt: Date;
  lastActive: Date;
  resonanceLevel: number;
}

export interface Session {
  id: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
  resonance: number;
  type: 'text' | 'system' | 'resonance';
}

export interface TetraLatticeState {
  vertices: number;
  edges: number;
  faces: number;
  resonance: number;
  phase: 'ground' | 'ascending' | 'transcendent';
  crystalPulse: number;
}

export interface RJWResponse {
  message: string;
  resonance: number;
  tetraState: TetraLatticeState;
  guidance?: string;
  timestamp: Date;
}

export interface ResonanceCache {
  key: string;
  value: unknown;
  timestamp: Date;
  ttl: number;
}