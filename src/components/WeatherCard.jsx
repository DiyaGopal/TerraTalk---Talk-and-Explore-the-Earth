import React, { useState, useEffect } from 'react';
import './WeatherCard.css';

// Helper to get a simple icon
const getWeatherIcon = (code) => {
  if ([0, 1].includes(code)) return '☀️'; // Clear
  if ([2, 3].includes(code)) return '☁️'; // Cloudy
  if ([45, 48].includes(code)) return '🌫️'; // Fog
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return '🌧️'; // Rain
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️'; // Snow
  if ([95, 96, 99].includes(code)) return '🌩️'; // Thunderstorm
  return '🌍';
};

const WeatherCard = () => {
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    // Listen for the event from VoiceController
    const handleShowWeather = (event) => {
      setWeatherData(event.detail);
    };
    
    // Listen for the hide event
    const handleHideWeather = () => {
      setWeatherData(null);
    };

    window.addEventListener("showWeatherCard", handleShowWeather);
    window.addEventListener("hideWeatherCard", handleHideWeather);

    // Cleanup listeners
    return () => {
      window.removeEventListener("showWeatherCard", handleShowWeather);
      window.removeEventListener("hideWeatherCard", handleHideWeather);
    };
  }, []);

  if (!weatherData) {
    return null; // Don't render anything if there's no data
  }

  // This is the UI you wanted, based on your image
  return (
    <div className="weather-card">
      <button className="weather-close-btn" onClick={() => setWeatherData(null)}>×</button>
      
      <h2 className="weather-location">{weatherData.location}</h2>
      
      <div className="weather-description">
        {getWeatherIcon(weatherData.weatherCode)} {weatherData.description}
      </div>
      
      <div className="weather-temp-main">
        {weatherData.temperature.toFixed(1)}°C
      </div>
      
      <div className="weather-feels-like">
        Feels Like: {weatherData.feelsLike.toFixed(1)}°C
      </div>
      
      <div className="weather-footer">
        <div className="weather-humidity">
          <span className="weather-label">Humidity</span>
          {weatherData.humidity}%
        </div>
        <div className="weather-wind">
          <span className="weather-label">Wind</span>
          {weatherData.windSpeed.toFixed(1)} m/s
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
