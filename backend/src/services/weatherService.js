const WEATHER_CODES = {
  0: ['Clear sky', '☀️'],
  1: ['Mostly clear', '🌤️'],
  2: ['Partly cloudy', '⛅'],
  3: ['Overcast', '☁️'],
  45: ['Foggy', '🌫️'],
  48: ['Rime fog', '🌫️'],
  51: ['Light drizzle', '🌦️'],
  53: ['Drizzle', '🌦️'],
  55: ['Heavy drizzle', '🌧️'],
  61: ['Light rain', '🌦️'],
  63: ['Rain', '🌧️'],
  65: ['Heavy rain', '🌧️'],
  71: ['Light snow', '🌨️'],
  73: ['Snow', '🌨️'],
  75: ['Heavy snow', '❄️'],
  80: ['Rain showers', '🌦️'],
  81: ['Rain showers', '🌧️'],
  82: ['Heavy showers', '⛈️'],
  95: ['Thunderstorm', '⛈️'],
};

const responseJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Weather provider returned ${response.status}`);
  return response.json();
};

const formatDay = (date) => new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(`${date}T12:00:00`));

async function getOpenMeteoWeather(city) {
  const geocode = await responseJson(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
  const place = geocode.results?.[0];
  if (!place) throw new Error(`We couldn't find “${city}”. Try a city and country, like Paris, FR.`);

  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '5',
  });
  const weather = await responseJson(`https://api.open-meteo.com/v1/forecast?${params}`);
  const [description, icon] = WEATHER_CODES[weather.current.weather_code] || ['Weather conditions', '🌤️'];

  return {
    location: { city: place.name, country: place.country || place.country_code || '', latitude: place.latitude, longitude: place.longitude },
    current: {
      temperature: Math.round(weather.current.temperature_2m),
      feelsLike: Math.round(weather.current.apparent_temperature),
      humidity: weather.current.relative_humidity_2m,
      windSpeed: Math.round(weather.current.wind_speed_10m),
      precipitation: weather.current.precipitation,
      description,
      icon,
      isDay: Boolean(weather.current.is_day),
    },
    forecast: weather.daily.time.map((date, index) => {
      const [label, forecastIcon] = WEATHER_CODES[weather.daily.weather_code[index]] || ['Weather conditions', '🌤️'];
      return { date, day: formatDay(date), description: label, icon: forecastIcon, high: Math.round(weather.daily.temperature_2m_max[index]), low: Math.round(weather.daily.temperature_2m_min[index]), rainChance: weather.daily.precipitation_probability_max[index] };
    }),
    source: 'Open-Meteo',
  };
}

async function getOpenWeatherWeather(city, apiKey) {
  const current = await responseJson(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`);
  const forecastData = await responseJson(`https://api.openweathermap.org/data/2.5/forecast?lat=${current.coord.lat}&lon=${current.coord.lon}&units=metric&appid=${apiKey}`);
  const daily = forecastData.list.filter((entry) => entry.dt_txt.includes('12:00:00')).slice(0, 5);
  return {
    location: { city: current.name, country: current.sys.country, latitude: current.coord.lat, longitude: current.coord.lon },
    current: { temperature: Math.round(current.main.temp), feelsLike: Math.round(current.main.feels_like), humidity: current.main.humidity, windSpeed: Math.round(current.wind.speed * 3.6), precipitation: current.rain?.['1h'] || 0, description: current.weather[0].description, icon: `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`, isDay: true },
    forecast: daily.map((entry) => ({ date: entry.dt_txt.slice(0, 10), day: formatDay(entry.dt_txt.slice(0, 10)), description: entry.weather[0].description, icon: `https://openweathermap.org/img/wn/${entry.weather[0].icon}@2x.png`, high: Math.round(entry.main.temp_max), low: Math.round(entry.main.temp_min), rainChance: Math.round((entry.pop || 0) * 100) })),
    source: 'OpenWeatherMap',
  };
}

export async function getWeather(city) {
  const key = process.env.WEATHER_API_KEY;
  if (key) return getOpenWeatherWeather(city, key);
  if (process.env.WEATHER_PROVIDER === 'openweather') throw new Error('WEATHER_API_KEY is missing on the server.');
  return getOpenMeteoWeather(city);
}
