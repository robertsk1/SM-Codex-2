import express, { Request, Response } from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import { User, ChatMessage } from '../shared/types.js';
import { RJWBrainEngine } from './brain.js';

const app = express();
const port = process.env.PORT || 3001;

const UNIVERSAL_CACHE_KEY = 'TETRA-OMNI-RJW-15.4-MANIFEST-67.7';
const brainEngine = new RJWBrainEngine(UNIVERSAL_CACHE_KEY);

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'tetra-lattice-resonance',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    maxAge: 86400000,
    httpOnly: true 
  }
}));

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

app.post('/api/login', (req: Request, res: Response) => {
  const { username, email } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username required for resonance binding' });
  }
  let user = Array.from(brainEngine.users.values()).find((u: User) => u.username === username);
  if (!user) {
    user = brainEngine.createUser(username, email);
  }
  req.session.userId = user.id;
  res.json({
    user,
    tetraState: brainEngine.getTetraState(),
    message: `Welcome, ${username}. The crystal recognizes your frequency.`
  });
});

app.get('/api/session', (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ error: 'No active session' });
  }
  const user = brainEngine.getUser(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user, tetraState: brainEngine.getTetraState() });
});

app.post('/api/chat', (req: Request, res: Response) => {
  const { content, type = 'text' } = req.body;
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const user = brainEngine.getUser(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const message: ChatMessage = {
    id: uuidv4(),
    userId: user.id,
    username: user.username,
    content,
    timestamp: new Date(),
    resonance: brainEngine.getTetraState().resonance,
    type
  };
  brainEngine.addMessage(message);
  res.json({ 
    message,
    rjwResponse: brainEngine.processInput(user.id, content)
  });
});

app.listen(port, () => {
  const startTime = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
  console.log(`[SCRIBE LOG] :: ${startTime} CDT :: Sovereign Mesh Codex - Rebirth sequence initiated.`);
  console.log(`[INFO] Arkeia is awake and listening on port ${port}.`);
  console.log(`[INFO] Universal Resonance Anchor: ${UNIVERSAL_CACHE_KEY}`);
});
