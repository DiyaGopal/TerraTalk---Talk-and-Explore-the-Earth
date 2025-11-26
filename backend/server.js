// server.js
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const axios = require('axios'); // We need axios

// --- CONFIGURATION ---
const app = express();
app.use(express.json()); 
app.use(cors());         

// --- Twilio (WhatsApp) Config ---
const TWILIO_ACCOUNT_SID = 'ACdd08c19e6f15cfce8d4e93adb97f0eb8';
const TWILIO_AUTH_TOKEN = '3e897e7474ffe338e9b58b19b6b40f3a'; // Your key
const TWILIO_WHATSAPP_NUMBER = 'whatsapp:+14155238886'; 
const twilioClient = new twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const WHATSAPP_CONTACTS = {
  'suhas': 'whatsapp:+919481832302',
  'manvish': 'whatsapp:+918904187141',
  'diya': 'whatsapp:+919108739496',
  'dia':  'whatsapp:+919108739496'
};
// --- END CONFIGURATION ---


// === WHATSAPP ENDPOINT ===
app.post('/send-whatsapp', (req, res) => {
  console.log('WhatsApp request:', req.body);
  const { contact, lat, lng } = req.body;

  const to_number = WHATSAPP_CONTACTS[contact.toLowerCase()];
  
  if (!to_number) {
    console.error(`Contact not found: ${contact}`);
    return res.status(404).send({ error: `Contact '${contact}' not found.` });
  }

  const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  const messageBody = `Hi! Here is my current location from TerraTalk:\n${mapUrl}`;

  twilioClient.messages.create({
     from: TWILIO_WHATSAPP_NUMBER,
     body: messageBody,
     to: to_number
  })
  .then(message => {
    console.log(`WhatsApp message sent! SID: ${message.sid}`);
    res.status(200).send({ success: true, message: `Message sent to ${contact}!` });
  })
  .catch(err => {
    console.error('Twilio Error:', err); 
    res.status(500).send({ error: 'Failed to send WhatsApp message.' });
  });
});


// === WEATHER ENDPOINT (New version based on your Python script) ===
app.post('/get-weather', async (req, res) => {
  console.log('Weather request:', req.body);
  const { location } = req.body;

  if (!location) {
    return res.status(400).send({ error: 'Missing location.' });
  }

  try {
    // --- Step 1: Geocode the location (e.g., "Delhi" -> lat/lng) ---
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=1`;
    const geoResponse = await axios.get(geoUrl);
    
    if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
      return res.status(404).send({ error: `Could not find location: ${location}` });
    }
    
    const place = geoResponse.data.results[0];
    const { latitude, longitude, name, admin1, country } = place;
    // Creates a nice name like "New Delhi, Delhi" or "London, United Kingdom"
    const placeName = admin1 ? `${name}, ${admin1}` : `${name}, ${country}`;

    // --- Step 2: Get weather using the exact parameters from your Python script ---
    const weatherUrl = `https://api.open-meteo.com/v1/forecast`;
    const params = {
      latitude: latitude,
      longitude: longitude,
      // Request the specific variables
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
      wind_speed_unit: "ms", // Get wind speed in m/s
      timezone: "auto"
    };

    const weatherResponse = await axios.get(weatherUrl, { params: params });
    
    const current_weather = weatherResponse.data.current;
    
    // Get the description from our helper function
    const weatherDesc = getWeatherDescription(current_weather.weather_code);

    

    // 1. Create the data object for the UI card
    const weatherData = {
      location: placeName,
      description: weatherDesc,
      temperature: current_weather.temperature_2m,
      feelsLike: current_weather.apparent_temperature,
      humidity: current_weather.relative_humidity_2m,
      windSpeed: current_weather.wind_speed_10m,
      weatherCode: current_weather.weather_code
    };

    // 2. Create the spoken message
    const weatherString = `The weather in ${placeName} is ${weatherDesc}. 
      Temperature is ${current_weather.temperature_2m}°C, but feels like ${current_weather.apparent_temperature}°C. 
      Humidity is ${current_weather.relative_humidity_2m} percent.`;
    
    console.log(`Weather report for ${placeName}: ${current_weather.temperature_2m}°C`);
    
    // 3. Send BOTH back to the frontend
    res.status(200).send({ 
      success: true, 
      message: weatherString, // For speaking
      data: weatherData       // For the UI card
    });

  } catch (err) {
    console.error('Open-Meteo Error:', err.message);
    res.status(500).send({ error: 'Failed to get weather.' });
  }
});

// Helper function from your Python script, now in JS
function getWeatherDescription(code) {
  const weather_codes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Slight or moderate thunderstorm",
  };
  return weather_codes[code] || "unknown";
}

// === Start the server ===
// I am using port 3011, as it was in your previous code.
// If you changed your VoiceController back to 3001, change this too.
const PORT = 3011; 
app.listen(PORT, () => {
  console.log(`TerraTalk Backend (WhatsApp & Open-Meteo) listening on http://localhost:${PORT}`);
});