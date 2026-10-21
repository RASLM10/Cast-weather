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

## Deploy with Vercel

Deploy this repository as two Vercel projects:

1. **Backend:** set the root directory to `backend`. After it deploys, copy its URL (for example, `https://cast-weather-api.vercel.app`). Set `CLIENT_URL` to the deployed frontend URL once it is available. `MONGODB_URI` is optional; without it, weather works but history is not saved.
2. **Frontend:** set the root directory to `frontend`, build command to `npm run build`, and output directory to `dist`. Add `VITE_API_URL` with the backend URL from step 1, then deploy.

`VITE_API_URL` is intentionally public because it identifies the API endpoint only. Keep `WEATHER_API_KEY` and `MONGODB_URI` exclusively in the backend project's environment settings.
