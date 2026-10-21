import { Router } from 'express';
import mongoose from 'mongoose';
import SearchHistory from '../models/SearchHistory.js';

const router = Router();
const unavailable = (res) => res.status(503).json({ message: 'Search history needs a MongoDB connection.' });

router.get('/', async (_req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) return unavailable(res);
    res.json(await SearchHistory.find().sort({ updatedAt: -1 }).limit(8).lean());
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) return unavailable(res);
    await SearchHistory.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) { next(error); }
});

export default router;
