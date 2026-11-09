import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';
const origin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
app.use(cors({ origin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  name: 'library.sid',
  secret: process.env.SESSION_SECRET || 'development-only-change-this-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI, collectionName: 'sessions', ttl: 60 * 60 * 24 * 14 }),
  cookie: { httpOnly: true, secure: isProduction, sameSite: isProduction ? 'none' : 'lax', maxAge: 14 * 24 * 60 * 60 * 1000 }
}));

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: true, legacyHeaders: false }), authRoutes);
app.get('/api/health', (_req, res) => res.json({ status: 'ok', app: 'My Library API' }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

if (process.env.SERVE_CLIENT === 'true') {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const dist = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

await connectDB();
app.listen(PORT, () => console.log(`My Library API running on http://localhost:${PORT}`));
