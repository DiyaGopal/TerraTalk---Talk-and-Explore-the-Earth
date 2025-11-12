# TerraTalk 🗣️🗺️

TerraTalk is a voice-activated geospatial application built with React, Node.js, and Leaflet. It allows users to control an interactive map, get real-time weather information, and share their location using natural voice commands.

The app uses a local **Ollama LLM** to interpret spoken language into actionable JSON commands, which are then executed by the application.



---

##  Core Features

* **Voice Control:** Uses the browser's built-in Web Speech API for both speech-to-text (hearing commands) and text-to-speech (providing feedback).
* **LLM Command Processing:** A custom prompt (`geoTools.ts`) teaches an Ollama model to understand natural language for navigation, zooming, layer changes, and more.
* **Real-Time Weather:** Fetches data from the **Open-Meteo API** (via the backend) and displays it on a dynamic UI card.
* **Location Sharing:** Integrates with the **Twilio API** to send the user's current location to a WhatsApp contact, all handled by a secure backend.
* **Interactive Map:** Built with React Leaflet, displaying OpenStreetMap tiles and custom routes.

---

## Technology Stack

This project is a monorepo containing two separate applications: a React frontend and a Node.js backend.

### 1. Frontend (`/terratalk`)

* **Framework:** React (Vite)
* **Mapping:** Leaflet & React Leaflet
* **Voice:** Web Speech API
* **State Management:** React Hooks (useState, useEffect, useRef)

### 2. Backend (`/terratalk-backend`)

* **Framework:** Node.js & Express.js
* **API Client:** Axios

### 3. APIs & Services

* **LLM:** Ollama
* **Weather:** Open-Meteo (Geocoding & Weather)
* **Messaging:** Twilio (WhatsApp API)

---

## Getting Started

To run this project, you will need two terminals open.

### 1. Backend Setup

First, set up and run the backend server:

```bash
# Navigate to the backend folder
cd terratalk-backend

# Install dependencies
npm install

# Run the server
node server.js
# Your server should now be running on http://localhost:3011
