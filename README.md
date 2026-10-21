# Cast Weather

A polished MERN weather dashboard that keeps external API credentials on the server. Search any city to see current conditions, detailed metrics, and a five-day forecast. Recent searches are stored in MongoDB when a database connection is configured.

## Stack

- React + Vite
- Express + Node.js proxy server
- MongoDB + Mongoose search history
- OpenWeatherMap (when `WEATHER_API_KEY` is supplied) with a no-key Open-Meteo fallback for local demos

## Run locally

```bash
npm run install:all
Copy-Item backend/.env.example backend/.env
npm run dev
```

The frontend is available at `http://localhost:5173` and the API at `http://localhost:5000`.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | Backend port (defaults to `5000`) |
| `MONGODB_URI` | MongoDB connection string; search history is in-memory if omitted |
| `WEATHER_API_KEY` | OpenWeatherMap API key; if omitted, Open-Meteo powers weather results without exposing a key |
| `WEATHER_PROVIDER` | Optional: set to `openweather` to require OpenWeatherMap |

## API routes

- `GET /api/weather?city=London` — current weather and five-day forecast
- `GET /api/history` — most recent city searches
- `DELETE /api/history/:id` — remove a saved search
