import { useState, useEffect, useCallback } from "react";
import "./App.css";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;const BASE = "https://api.openweathermap.org/data/2.5";

const weatherIcon = (code) => {
  if (code >= 200 && code < 300) return "⛈️";
  if (code >= 300 && code < 400) return "🌦️";
  if (code >= 500 && code < 600) return "🌧️";
  if (code >= 600 && code < 700) return "❄️";
  if (code >= 700 && code < 800) return "🌫️";
  if (code === 800) return "☀️";
  if (code > 800) return "🌤️";
  return "🌡️";
};

const groupByDay = (list) => {
  const days = {};
  list.forEach((item) => {
    const day = item.dt_txt.split(" ")[0];
    if (!days[day]) days[day] = [];
    days[day].push(item);
  });
  return days;
};

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState("hourly");

  useEffect(() => {
    document.body.style.background = dark ? "#0f172a" : "#e0f2fe";
    document.body.style.color = dark ? "#f1f5f9" : "#0f172a";
  }, [dark]);

  const fetchWeather = useCallback(async (lat, lon, cityName) => {
    setLoading(true);
    setError("");
    try {
      const [cur, fore] = await Promise.all([
        fetch(
          lat != null
            ? `${BASE}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
            : `${BASE}/weather?q=${cityName}&units=metric&appid=${API_KEY}`
        ),
        fetch(
          lat != null
            ? `${BASE}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
            : `${BASE}/forecast?q=${cityName}&units=metric&appid=${API_KEY}`
        ),
      ]);
      if (!cur.ok) throw new Error("City not found");
      const [curData, foreData] = await Promise.all([cur.json(), fore.json()]);
      setWeather(curData);
      setForecast(foreData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) fetchWeather(null, null, city.trim());
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) return setError("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      () => setError("Location access denied")
    );
  };

  const card = {
    background: dark ? "#1e293b" : "#ffffff",
    borderRadius: 16,
    padding: "1.25rem",
    marginBottom: "1rem",
    boxShadow: dark
      ? "0 2px 12px rgba(0,0,0,0.4)"
      : "0 2px 12px rgba(0,0,0,0.08)",
  };

  const days = forecast ? groupByDay(forecast.list) : {};

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "1.5rem",
        fontFamily: "system-ui, sans-serif",
        maxWidth: 600,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
          ⛅ Weather App
        </h1>
        <button
          onClick={() => setDark((d) => !d)}
          style={{
            background: dark ? "#334155" : "#bae6fd",
            border: "none",
            borderRadius: 99,
            padding: "6px 14px",
            cursor: "pointer",
            fontSize: 18,
          }}
          aria-label="Toggle dark mode"
        >
          {dark ? "🌙" : "☀️"}
        </button>
      </div>

      {/* Search */}
      <form
        onSubmit={handleSearch}
        style={{ display: "flex", gap: 8, marginBottom: "1rem" }}
      >
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Search city..."
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 10,
            border: dark ? "1px solid #334155" : "1px solid #bae6fd",
            background: dark ? "#1e293b" : "#fff",
            color: "inherit",
            fontSize: 15,
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            background: "#0ea5e9",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Search
        </button>
        <button
          type="button"
          onClick={handleGeolocate}
          title="Use my location"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: dark ? "#334155" : "#e0f2fe",
            border: "none",
            cursor: "pointer",
            fontSize: 18,
          }}
        >
          📍
        </button>
      </form>

      {error && (
        <p style={{ color: "#ef4444", fontWeight: 500, marginBottom: "1rem" }}>
          {error}
        </p>
      )}
      {loading && <p style={{ opacity: 0.6 }}>Loading...</p>}

      {/* Current weather */}
      {weather && (
        <div style={card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>
                {weather.name}, {weather.sys.country}
              </h2>
              <p
                style={{
                  margin: "4px 0 0",
                  opacity: 0.6,
                  fontSize: 14,
                  textTransform: "capitalize",
                }}
              >
                {weather.weather[0].description}
              </p>
            </div>
            <span style={{ fontSize: 56 }}>
              {weatherIcon(weather.weather[0].id)}
            </span>
          </div>

          <p style={{ fontSize: 52, fontWeight: 700, margin: "0.5rem 0" }}>
            {Math.round(weather.main.temp)}°C
          </p>
          <p style={{ opacity: 0.5, fontSize: 14, margin: 0 }}>
            Feels like {Math.round(weather.main.feels_like)}°C
          </p>

          {/* Details grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
              marginTop: "1.25rem",
            }}
          >
            {[
              { label: "Humidity", value: `${weather.main.humidity}%`, icon: "💧" },
              {
                label: "Wind",
                value: `${Math.round(weather.wind.speed * 3.6)} km/h`,
                icon: "💨",
              },
              {
                label: "Pressure",
                value: `${weather.main.pressure} hPa`,
                icon: "🌡️",
              },
              {
                label: "Visibility",
                value: `${((weather.visibility || 10000) / 1000).toFixed(1)} km`,
                icon: "👁️",
              },
              {
                label: "Min/Max",
                value: `${Math.round(weather.main.temp_min)}° / ${Math.round(
                  weather.main.temp_max
                )}°`,
                icon: "📊",
              },
              { label: "Clouds", value: `${weather.clouds.all}%`, icon: "☁️" },
            ].map((d) => (
              <div
                key={d.label}
                style={{
                  background: dark ? "#0f172a" : "#f0f9ff",
                  borderRadius: 10,
                  padding: "10px 12px",
                  textAlign: "center",
                }}
              >
                <p style={{ margin: 0, fontSize: 20 }}>{d.icon}</p>
                <p style={{ margin: "4px 0 2px", fontSize: 13, opacity: 0.55 }}>
                  {d.label}
                </p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                  {d.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forecast tabs */}
      {forecast && (
        <div style={card}>
          <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
            {["hourly", "5day"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 99,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                  background:
                    tab === t ? "#0ea5e9" : dark ? "#334155" : "#e0f2fe",
                  color: tab === t ? "#fff" : "inherit",
                }}
              >
                {t === "hourly" ? "Hourly" : "5-Day"}
              </button>
            ))}
          </div>

          {tab === "hourly" && (
            <div
              style={{
                display: "flex",
                gap: 10,
                overflowX: "auto",
                paddingBottom: 8,
              }}
            >
              {forecast.list.slice(0, 8).map((item) => (
                <div
                  key={item.dt}
                  style={{
                    minWidth: 72,
                    background: dark ? "#0f172a" : "#f0f9ff",
                    borderRadius: 10,
                    padding: "10px 8px",
                    textAlign: "center",
                    flexShrink: 0,
                  }}
                >
                  <p style={{ margin: 0, fontSize: 12, opacity: 0.55 }}>
                    {item.dt_txt.split(" ")[1].slice(0, 5)}
                  </p>
                  <p style={{ margin: "6px 0", fontSize: 22 }}>
                    {weatherIcon(item.weather[0].id)}
                  </p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                    {Math.round(item.main.temp)}°
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 11, opacity: 0.5 }}>
                    {item.main.humidity}%💧
                  </p>
                </div>
              ))}
            </div>
          )}

          {tab === "5day" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.entries(days)
                .slice(0, 5)
                .map(([day, items]) => {
                  const temps = items.map((i) => i.main.temp);
                  const lo = Math.round(Math.min(...temps));
                  const hi = Math.round(Math.max(...temps));
                  const icon = weatherIcon(
                    items[Math.floor(items.length / 2)].weather[0].id
                  );
                  const label = new Date(day).toLocaleDateString("en-IN", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  });
                  return (
                    <div
                      key={day}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: dark ? "#0f172a" : "#f0f9ff",
                        borderRadius: 10,
                        padding: "10px 14px",
                      }}
                    >
                      <span
                        style={{ fontSize: 14, fontWeight: 500, minWidth: 110 }}
                      >
                        {label}
                      </span>
                      <span style={{ fontSize: 24 }}>{icon}</span>
                      <span style={{ fontSize: 14, opacity: 0.55 }}>
                        {lo}° / {hi}°
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}