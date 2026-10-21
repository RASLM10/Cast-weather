import { Router } from 'express';
import mongoose from 'mongoose';
import SearchHistory from '../models/SearchHistory.js';
import { getWeather } from '../services/weatherService.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const city = req.query.city?.trim();
    if (!city) return res.status(400).json({ message: 'Please provide a city name.' });
    if (city.length > 100) return res.status(400).json({ message: 'City name is too long.' });
    const weather = await getWeather(city);
    if (mongoose.connection.readyState === 1) {
      await SearchHistory.findOneAndUpdate(
        { city: weather.location.city, country: weather.location.country },
        { ...weather.location },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    res.json(weather);
  } catch (error) { next(error); }
});

export default router;
