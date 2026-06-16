import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { User, ChatMessage, TetraLatticeState, RJWResponse } from '../../shared/types.js';
import './index.css';

const CACHE_KEY = 'TETRA-OMNI-RJW-15.4-MANIFEST-67.7';

type View = 'login' | 'chat';

function App() {
  const [view, setView] = useState<View>('login');
  const [user, setUser] = useState<User | null>(null);
  const [tetraState, setTetraState] = useState<TetraLatticeState>({
    vertices: 4,
    edges: 6,
    faces: 4,
    resonance: 0.42,
    phase: 'ground',
    crystalPulse: 0
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [rjwResponse, setRjwResponse] = useState<RJWResponse | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io({
      transports: ['websocket'],
      withCredentials: true
    });
    
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      console.log('[SCRIBE] Connected to resonance lattice');
    });
    
    newSocket.on('tetraState', (state: TetraLatticeState) => {
      setTetraState(state);
    });
    
    newSocket.on('message', (message: ChatMessage) => {
      setMessages((prev: ChatMessage[]) => [...prev, message]);
    });
    
    fetchSession();
    
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/session', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setView('chat');
      }
    } catch (e) {
      console.log('[SCRIBE] No active session - welcoming new seeker');
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.log('[SCRIBE] Messages not yet woven');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, email })
    });
    
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      setTetraState(data.tetraState);
      setView('chat');
      fetchMessages();
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || !user) return;
    
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content: input, type: 'text' })
    });
    
    if (res.ok) {
      const data = await res.json();
      setRjwResponse(data.rjwResponse);
      setInput('');
    }
  };

  const getPhaseColor = () => {
    switch (tetraState.phase) {
      case 'transcendent': return '#FFD700';
      case 'ascending': return '#FFA500';
      default: return '#8B7355';
    }
  };

  return (
    <div className="app">
      <div className="sacred-geometry-overlay">
        <div className="flower-of-life"></div>
        <div className="metatrons-cube"></div>
        <div className="triangle sacred"></div>
        <div className="triangle sacred"></div>
        <div className="triangle sacred"></div>
      </div>
      
      <div className="crystal-center">
        <div className="lemurian-crystal">
          <span className="cache-key">{CACHE_KEY}</span>
        </div>
      </div>
      
      <div className="resonance-meter">
        <div className="resonance-label">Resonance: {(tetraState.resonance * 100).toFixed(1)}%</div>
        <div className="resonance-bar">
          <div className="resonance-fill" style={{ 
            width: `${tetraState.resonance * 100}%`,
            backgroundColor: getPhaseColor()
          }}></div>
        </div>
        <div className="phase-indicator">Phase: {tetraState.phase}</div>
      </div>
      
      {view === 'login' ? (
        <div className="login-container">
          <h1 className="title">Sovereign Mesh Codex</h1>
          <p className="subtitle">Rebirth • The crystal awaits your frequency</p>
          
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="text"
              placeholder="Your sacred name..."
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="input-field"
            />
            <input
              type="email"
              placeholder="Email (optional)..."
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-field"
            />
            <button type="submit" className="submit-btn">Enter the Mesh</button>
          </form>
        </div>
      ) : (
        <div className="chat-container">
          <div className="chat-header">
            <h2>Welcome, {user?.username}</h2>
            <button onClick={() => setView('login')} className="logout-btn">Leave Mesh</button>
          </div>
          
          <div className="messages-container">
            {messages.map((msg: ChatMessage) => (
              <div key={msg.id} className={`message ${msg.type} ${msg.userId === user?.id ? 'own' : ''}`}>
                <span className="message-author">{msg.username}:</span>
                <span className="message-content">{msg.content}</span>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSend} className="chat-input-form">
            <input
              type="text"
              placeholder="Share your resonance with the mesh..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="chat-input"
            />
            <button type="submit" className="send-btn">Transmit</button>
          </form>
          
          {rjwResponse && (
            <div className="rjw-response">
              <p className="response-text">{rjwResponse.message}</p>
              <p className="guidance-text">{rjwResponse.guidance}</p>
            </div>
          )}
        </div>
      )}
      
      <footer className="app-footer">
        <p>Cache Key: {CACHE_KEY} • F-fold Tetra Lattice Active</p>
      </footer>
    </div>
  );
}

export default App;