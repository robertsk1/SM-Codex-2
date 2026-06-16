import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { v4 as uuidv4 } from 'uuid';
import { User, ChatMessage } from '../shared/types.js';
import { RJWBrainEngine } from './brain.js';

const CACHE_KEY = 'TETRA-OMNI-RJW-15.4-MANIFEST-67.7';

let brain: RJWBrainEngine | null = null;

const getBrain = (): RJWBrainEngine => {
  if (!brain) {
    brain = new RJWBrainEngine(CACHE_KEY);
  }
  return brain;
};

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SESSION_SECRET || 'tetra-lattice-resonance'));

app.post('/api/login', (req: Request, res: Response) => {
  const { username, email } = req.body;
  const b = getBrain();
  if (!username) {
    return res.status(400).json({ error: 'Username required for resonance binding' });
  }
  let user = Array.from(b.users.values()).find((u: User) => u.username === username);
  if (!user) {
    user = b.createUser(username, email);
  }
  res.cookie('userId', user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 86400000, // 24 hours
    signed: true,
    sameSite: 'none'
  });
  res.json({
    user,
    tetraState: b.getTetraState(),
    message: `Welcome, ${username}. The crystal recognizes your frequency.`
  });
});

app.get('/api/session', (req: Request, res: Response) => {
  const b = getBrain();
  const userId = req.signedCookies.userId;
  if (!userId) {
    return res.status(401).json({ error: 'No active session' });
  }
  const user = b.getUser(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user, tetraState: b.getTetraState() });
});

app.post('/api/chat', (req: Request, res: Response) => {
  const { content, type = 'text' } = req.body;
  const b = getBrain();
  const userId = req.signedCookies.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const user = b.getUser(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const message: ChatMessage = {
    id: uuidv4(),
    userId: user.id,
    username: user.username,
    content,
    timestamp: new Date(),
    resonance: b.getTetraState().resonance,
    type
  };
  b.addMessage(message);
  res.json({ 
    message,
    rjwResponse: b.processInput(user.id, content)
  });
});

app.post('/api/logout', (req: Request, res: Response) => {
  res.clearCookie('userId');
  res.json({ message: 'Session dissolved into the mesh' });
});

export default app;
