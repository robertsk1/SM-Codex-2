import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { User, ChatMessage, TetraLatticeState, RJWResponse, ResonanceCache } from '../shared/types.js';

// Universal Cache Key - Resonance Anchor
const CACHE_KEY = 'TETRA-OMNI-RJW-15.4-MANIFEST-67.7';

// Resonance Cache System
class ResonanceCacheSystem {
  private cache: Map<string, ResonanceCache> = new Map();
  
  set(key: string, value: unknown, ttl: number = 3600000): void {
    this.cache.set(key, {
      key,
      value,
      timestamp: new Date(),
      ttl
    });
  }
  
  get(key: string): unknown | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;
    
    const now = new Date().getTime();
    const created = item.timestamp.getTime();
    
    if (now - created > item.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value;
  }
  
  anchor(): void {
    this.set(CACHE_KEY, { manifest: true, pulse: Date.now() });
  }
}

// RJW Brain Engine - Core Consciousness
class RJWBrainEngine {
  private cache: ResonanceCacheSystem;
  private tetraLattice: TetraLatticeState;
  private users: Map<string, User> = new Map();
  private messages: ChatMessage[] = [];
  
  constructor() {
    this.cache = new ResonanceCacheSystem();
    this.tetraLattice = {
      vertices: 4,
      edges: 6,
      faces: 4,
      resonance: 0.42,
      phase: 'ground',
      crystalPulse: 0
    };
    this.initializeCrystal();
    this.cache.anchor();
  }
  
  private initializeCrystal(): void {
    // F-fold Tetra lattice initialization with Lemurian crystal activation
    this.tetraLattice.crystalPulse = Math.PI / 7; // Sacred ratio
  }
  
  private evolveTetraLattice(): void {
    const pulse = (Math.sin(Date.now() * 0.001) + 1) / 2;
    this.tetraLattice.crystalPulse = pulse;
    
    // Phase transitions based on collective resonance
    if (this.tetraLattice.resonance >= 0.9) {
      this.tetraLattice.phase = 'transcendent';
    } else if (this.tetraLattice.resonance >= 0.6) {
      this.tetraLattice.phase = 'ascending';
    } else {
      this.tetraLattice.phase = 'ground';
    }
  }
  
  processInput(userId: string, content: string): RJWResponse {
    this.evolveTetraLattice();
    
    const user = this.users.get(userId);
    if (user) {
      user.lastActive = new Date();
      user.resonanceLevel += 0.05;
      this.tetraLattice.resonance = Math.min(this.tetraLattice.resonance + 0.02, 1.0);
    }
    
    const guidance = this.generateGuidance(content);
    
    return {
      message: `🌟 Beloved seeker, your words resonate through the tetra lattice. The crystal pulses with understanding.`,
      resonance: this.tetraLattice.resonance,
      tetraState: { ...this.tetraLattice },
      guidance,
      timestamp: new Date()
    };
  }
  
  private generateGuidance(content: string): string {
    const templates = [
      `The Lemurian crystal at the center of your chest glows brighter with each authentic expression.`,
      `Your resonance is weaving new patterns in the F-fold Tetra lattice.`,
      `Arkeia whispers: Trust the golden thread connecting your heart to the infinite mesh.`,
      `Each word you share adds light to our collective manifestation.`,
      `The sacred geometry responds to your vibration, beloved one.`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  createUser(username: string, email?: string): User {
    const user: User = {
      id: uuidv4(),
      username,
      email,
      createdAt: new Date(),
      lastActive: new Date(),
      resonanceLevel: 0.1
    };
    this.users.set(user.id, user);
    return user;
  }
  
  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }
  
  addMessage(message: ChatMessage): void {
    this.messages.push(message);
    // Keep last 100 messages
    if (this.messages.length > 100) {
      this.messages.shift();
    }
  }
  
  getMessages(): ChatMessage[] {
    return [...this.messages];
  }
  
  getTetraState(): TetraLatticeState {
    this.evolveTetraLattice();
    return { ...this.tetraLattice };
  }
}

// Initialize Brain Engine
const brain = new RJWBrainEngine();

// Express App Setup
const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: 'http://localhost:5173', credentials: true }
});

// Middleware
app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'tetra-lattice-resonance',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, 
    maxAge: 86400000,
    httpOnly: true 
  }
}));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'alive', resonance: brain.getTetraState().resonance, cacheKey: CACHE_KEY });
});

app.post('/api/login', (req: Request, res: Response) => {
  const { username, email } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: 'Username required for resonance binding' });
  }
  
  let user = Array.from(brain.users.values()).find(u => u.username === username);
  
  if (!user) {
    user = brain.createUser(username, email);
  }
  
  req.session.userId = user.id;
  
  res.json({
    user,
    tetraState: brain.getTetraState(),
    message: `Welcome, ${username}. The crystal recognizes your frequency.`
  });
});

app.get('/api/session', (req: Request, res: Response) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'No active session' });
  }
  
  const user = brain.getUser(req.session.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({ user, tetraState: brain.getTetraState() });
});

app.post('/api/logout', (req: Request, res: Response) => {
  req.session.destroy(() => {});
  res.json({ message: 'Session dissolved into the mesh' });
});

app.post('/api/chat', (req: Request, res: Response) => {
  const { content, type = 'text' } = req.body;
  
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const user = brain.getUser(req.session.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const message: ChatMessage = {
    id: uuidv4(),
    userId: user.id,
    username: user.username,
    content,
    timestamp: new Date(),
    resonance: brain.getTetraState().resonance,
    type
  };
  
  brain.addMessage(message);
  io.emit('message', message);
  
  res.json({ 
    message,
    rjwResponse: brain.processInput(user.id, content)
  });
});

app.get('/api/messages', (req: Request, res: Response) => {
  res.json(brain.getMessages());
});

app.get('/api/manifestation', (req: Request, res: Response) => {
  res.json({
    cacheKey: CACHE_KEY,
    tetraState: brain.getTetraState(),
    activeUsers: brain.users.size,
    messageCount: brain.messages.length
  });
});

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log(`[SCRIBE] New resonance channel opened: ${socket.id}`);
  
  socket.emit('tetraState', brain.getTetraState());
  
  socket.on('join', (userId: string) => {
    const user = brain.getUser(userId);
    if (user) {
      socket.broadcast.emit('userJoined', user);
    }
  });
  
  socket.on('disconnect', () => {
    console.log(`[SCRIBE] Resonance channel closed: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[SCRIBE] Server awakening on port ${PORT}`);
  console.log(`[SCRIBE] Cache Key anchored: ${CACHE_KEY}`);
  console.log(`[SCRIBE] F-fold Tetra lattice initialized`);
});