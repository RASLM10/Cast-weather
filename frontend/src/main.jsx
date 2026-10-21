import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const api = async (path, options) => {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const text = response.status === 204 ? '' : await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; }
  catch { throw new Error(response.ok ? 'The weather service returned an invalid response.' : `The weather service is unavailable (${response.status}).`); }
  if (!response.ok) throw new Error(body?.message || 'Request failed');
  return body;
};

function Metric({ label, value, suffix, icon }) {
  return <div className="metric"><span className="metric-icon">{icon}</span><div><span>{label}</span><strong>{value}{suffix}</strong></div></div>;
}

function App() {
  const [city, setCity] = useState('New Delhi');
  const [weather, setWeather] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try { setHistory(await api('/api/history')); } catch { setHistory([]); }
  };
  const search = async (event, cityName = city) => {
    event?.preventDefault();
    if (!cityName.trim()) return;
    setLoading(true); setError('');
    try {
      const data = await api(`/api/weather?city=${encodeURIComponent(cityName.trim())}`);
      setWeather(data); setCity(data.location.city); fetchHistory();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { search(null, 'New Delhi'); fetchHistory(); }, []);
  const deleteHistory = async (id) => { await api(`/api/history/${id}`, { method: 'DELETE' }); fetchHistory(); };
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
  const isImageIcon = weather?.current.icon?.startsWith('http');

  return <main className={weather?.current.isDay === false ? 'app night' : 'app'}>
    <nav><a className="brand" href="/">cast<span>•</span>weather</a><p>Weather, beautifully clear.</p></nav>
    <section className="hero">
      <p className="eyebrow">LIVE WEATHER DASHBOARD</p>
      <h1>Find your forecast.</h1>
      <form onSubmit={search} className="search"><span>⌕</span><input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Search city, e.g. Mumbai" aria-label="City name"/><button disabled={loading}>{loading ? 'Searching...' : 'Search'}</button></form>
      {error && <p className="error">{error}</p>}
    </section>

    {weather && <section className="dashboard">
      <article className="today card">
        <div className="location"><div><p className="eyebrow">RIGHT NOW</p><h2>{weather.location.city}<small>{weather.location.country}</small></h2><p>{today}</p></div><span className="source">via {weather.source}</span></div>
        <div className="conditions"><div className="temperature">{weather.current.temperature}<sup>°C</sup></div><div className="condition-icon">{isImageIcon ? <img src={weather.current.icon} alt=""/> : weather.current.icon}</div><div><h3 className="capitalize">{weather.current.description}</h3><p>Feels like {weather.current.feelsLike}°</p></div></div>
        <div className="metrics"><Metric icon="💧" label="Humidity" value={weather.current.humidity} suffix="%"/><Metric icon="↗" label="Wind speed" value={weather.current.windSpeed} suffix=" km/h"/><Metric icon="☂" label="Precipitation" value={weather.current.precipitation} suffix=" mm"/></div>
      </article>

      <section className="forecast card"><div className="section-heading"><div><p className="eyebrow">OUTLOOK</p><h2>5-day forecast</h2></div><span>High / Low</span></div><div className="forecast-grid">{weather.forecast.map((day, index) => <article className={index === 0 ? 'forecast-day active' : 'forecast-day'} key={day.date}><strong>{index === 0 ? 'Today' : day.day}</strong><span className="forecast-icon">{day.icon.startsWith('http') ? <img src={day.icon} alt=""/> : day.icon}</span><small className="capitalize">{day.description}</small><div><b>{day.high}°</b><span>{day.low}°</span></div><em>☂ {day.rainChance}%</em></article>)}</div></section>
    </section>}

    <section className="history"><div><p className="eyebrow">SAVED SEARCHES</p><h2>Recently viewed</h2></div>{history.length ? <div className="history-list">{history.map((item) => <button className="history-pill" key={item._id} onClick={() => search(null, item.city)}>{item.city}{item.country && <small>, {item.country}</small>}<i onClick={(event) => { event.stopPropagation(); deleteHistory(item._id); }} aria-label={`Remove ${item.city}`}>×</i></button>)}</div> : <p className="empty">Connect MongoDB to save and revisit favorite cities.</p>}</section>
    <footer>Made for the everyday forecast. Your API key stays on the server.</footer>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
