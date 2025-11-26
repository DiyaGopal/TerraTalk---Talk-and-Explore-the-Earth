import { createContext, useState } from 'react';

export const WeatherContext = createContext();

export const WeatherProvider = ({ children }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [showWeatherBox, setShowWeatherBox] = useState(false);

  return (
    <WeatherContext.Provider value={{ weatherData, setWeatherData, showWeatherBox, setShowWeatherBox }}>
      {children}
    </WeatherContext.Provider>
  );
};
