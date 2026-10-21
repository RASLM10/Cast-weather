import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import weatherRouter from './routes/weather.js';
import historyRouter from './routes/history.js';

const app = express();
const port = process.env.PORT || 5000;
const configuredOrigins = (process.env.CLIENT_URL || '').split(',').map((origin) => origin.trim()).filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    const isLocal = !origin || /^http:\/\/localhost:\d+$/.test(origin);
    const isVercelDeployment = origin?.endsWith('.vercel.app');
    if (isLocal || isVercelDeployment || configuredOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS.'));
  },
}));
app.use(express.json());
app.get('/', (_req, res) => res.json({ name: 'Cast Weather API', status: 'ok', health: '/api/health' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'offline' }));
app.use('/api/weather', weatherRouter);
app.use('/api/history', historyRouter);
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: error.message || 'Something went wrong while getting weather.' });
});

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI).then(() => console.log('MongoDB connected')).catch((error) => console.error('MongoDB connection failed:', error.message));
} else {
  console.log('No MONGODB_URI set — recent searches will not persist.');
}

app.listen(port, () => console.log(`Cast Weather API running on http://localhost:${port}`));
