import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import weatherRouter from './routes/weather.js';
import historyRouter from './routes/history.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
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
