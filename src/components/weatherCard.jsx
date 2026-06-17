function WeatherCard({ weather }) {
  return (
    <div className="weather-card">

      <div className="icon">
        ☁️
      </div>

      <h2>{weather.name}</h2>

      <div className="temp">
        {Math.round(weather.main.temp)}°
      </div>

      <p>{weather.weather[0].description}</p>

      <div className="info">
        <div className="box">
          💧
          <h3>{weather.main.humidity}%</h3>
          <p>Humidity</p>
        </div>

        <div className="box">
          🌬️
          <h3>{weather.wind.speed}</h3>
          <p>Wind</p>
        </div>
      </div>

    </div>
  );
}