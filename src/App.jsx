import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Features from "./pages/FeaturesPage"; // <-- FIX 1: Changed from FeaturesPage
import About from './pages/About';
import MapView from "./pages/MapView";
import EarthPage from "./pages/EarthPage";
import VoiceController from "./components/VoiceController"; // Global Voice Control

function speakGreeting() {
  if (!window.speechSynthesis) return;

  // Optional: Prevent multiple greetings if speech was queued
  window.speechSynthesis.cancel();

  const hour = new Date().getHours();
  let greeting = "Good morning";
  if (hour >= 12 && hour < 17) greeting = "Good afternoon";
  else if (hour >= 17) greeting = "Good evening";

  // --- FIX 2: Added backticks (`) to fix the syntax error ---
  const utterance = new SpeechSynthesisUtterance(`${greeting}, welcome to TerraTalk`);
  utterance.lang = "en-IN";
  utterance.pitch = 1;
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
}

function AppWrapper() {
  const location = useLocation();
  const showNavbar = location.pathname !== "/map";

  return (
    <>
      {showNavbar && <Navbar />}
      <VoiceController />

      <Routes>
        <Route path="/" element={<EarthPage />} />
        <Route path="/features" element={<Features />} />
        <Route path="/about" element={<About />} />
        <Route path="/map" element={<MapView />} />
        {/* --- FIX 3: Removed the extra /map/:location route --- */}
      </Routes>
    </>
  );
}

function App() {
  // ✅ Greeting runs once when app starts
  useEffect(() => {
    speakGreeting();
  }, []);

  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
