import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLLM } from "../llm/useLLM"; // Import the hook



const speak = (message) => {
  if (!window.speechSynthesis) return;
  const utterance = new window.SpeechSynthesisUtterance(message);
  utterance.lang = "en-IN";
  utterance.pitch = 1;
  utterance.rate = 1;
  utterance.volume = 8;
  window.speechSynthesis.speak(utterance);
};

const VoiceController = () => {
  const recognitionRef = useRef(null);
  const journeyWatchIdRef = useRef(null); // <-- Add journey watch id here
  const navigate = useNavigate();
  const location = useLocation();

  const [status, setStatus] = useState("🎤 Click anywhere to activate mic");
  const [hasStarted, setHasStarted] = useState(false);

  const lastLayerRef = useRef("streets");
  const destinationCoordsRef = useRef(null);
  const startCoordsRef = useRef(null);

  // ORS API Key - Your provided key
  const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjAyMDdlNzAwZGRhNTkzOGIxMzc4ZjI4YTY0OTI1ZjZhZmE3Y2Y3MjNhMTUxYjIwY2JkODU2NGM2IiwiaCI6Im11cm11cjY0In0=";

  // Call LLM hook (Ollama backend)
  const { askLLM, loading } = useLLM();

  const getCurrentLayerFromURL = () => {
    const params = new URLSearchParams(location.search);
    return params.get("layer") || "streets";
  };

  const navigateWithLayer = (url) => {
    const layer = lastLayerRef.current || "streets";
    const urlObj = new URLSearchParams(url.split("?")[1] || "");
    if (!urlObj.has("layer")) {
      url += (url.includes("?") ? "&" : "?") + "layer=" + layer;
    }
    url += `&t=${Date.now()}`; // force refresh
    navigate(url);
  };

  // ========== JOURNEY: Start and Stop handlers ==========
  const startJourney = () => {
    if (journeyWatchIdRef.current) {
      setStatus("🚗 Journey already started, tracking your movement...");
      speak("Journey already started, tracking your movement.");
      return;
    }
    if (!navigator.geolocation) {
      setStatus("⚠️ Geolocation not supported.");
      speak("Geolocation is not supported on this device.");
      return;
    }
    setStatus("🚗 Journey started, tracking your movement...");
    speak("Journey started, tracking your movement.");
    // Start geolocation tracking
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed } = position.coords;
        startCoordsRef.current = [latitude, longitude];
        const to = destinationCoordsRef.current;
        let feedback = `Tracking... Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`;
        if (to) {
          const dist = Math.sqrt(
            (latitude - to[0]) ** 2 + (longitude - to[1]) ** 2
          );
          feedback += ` | Distance to destination: ${dist.toFixed(2)} (deg)`;
        }
        if (speed || speed === 0) {
          feedback += ` | Speed: ${(speed * 3.6).toFixed(1)} km/h`;
        }
        setStatus(`🚘 ${feedback}`);
      },
      (err) => {
        setStatus("⚠️ Geolocation error: " + err.message);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
    journeyWatchIdRef.current = watchId;
  };

  const stopJourney = () => {
    if (journeyWatchIdRef.current != null) {
      navigator.geolocation.clearWatch(journeyWatchIdRef.current);
      journeyWatchIdRef.current = null;
      setStatus("🛑 Journey stopped, tracking disabled.");
      speak("Journey stopped. Tracking disabled.");
    } else {
      setStatus("🚘 No journey in progress to stop.");
      speak("No journey in progress to stop.");
    }
  };

  // Central handler for commands including all features
  const handleTool = async (command) => {
    if (!command || !command.command) {
      setStatus("⚠️ Could not interpret command");
      speak("Sorry, I could not understand that.");
      return;
    }

    switch (command.command) {

        case "check_traffic": {
            window.dispatchEvent(new CustomEvent("voiceCheckTraffic"));
            setStatus("🚦 Checking real-time traffic conditions ahead...");
            speak("Checking real-time traffic conditions ahead.");
            break;
        }

        case "search_near_me": {
        const { query } = command;
        const feedback = `🔍 Searching for ${query} near you...`;

        setStatus(feedback);
        speak(feedback);
        
        // Fire a specific event for MapView to catch
        window.dispatchEvent(
          new CustomEvent("voiceSearchNearMe", {
            detail: { query } // Send the search query
          })
        );
        break;
      }

        case "send_whatsapp_location": {
        const contactName = command.contact;
        const feedback = `Sending location to ${contactName} on WhatsApp...`;
        
        setStatus(feedback);
        speak(feedback, () => startListening());
        
        // This event name 'voiceSendWhatsapp' must match MapView.jsx
        window.dispatchEvent(
          new CustomEvent("voiceSendWhatsapp", {
            detail: { contact: contactName.toLowerCase() } 
          })
        );
        break;
      }
      
      case "get_weather": {
        const { location } = command;
        
        const checkingMessage = `Checking the weather in ${location}...`;
        setStatus(checkingMessage);
        speak(checkingMessage);
        
        try {
          const response = await fetch('http://localhost:3011/get-weather', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ location })
          });
          
          const result = await response.json(); // This now contains {success, message, data}

          if (!response.ok) {
            throw new Error(result.error || 'Failed to get weather');
          }
          
          // 1. Speak the message from the server
          setStatus(`☀️ ${result.message.split('.')[0]}`);
          speak(result.message);
          
          // --- 2. THIS IS THE NEW PART ---
          // Broadcast the 'data' object to any component that is listening
          window.dispatchEvent(
            new CustomEvent("showWeatherCard", {
              detail: result.data 
            })
          );
          
        } catch (err) {
          console.error("Weather fetch error:", err);
          const errorMessage = `Sorry, I couldn't get the weather information. ${err.message}`;
          setStatus(`⚠️ Error: ${err.message}`);
          speak(errorMessage);
        }
        break;
      }
      
      // V V V V V ADD THIS NEW CASE V V V V V
      case "hide_weather": {
        setStatus("Hiding weather card.");
        speak("Okay, hiding weather.");
        window.dispatchEvent(new CustomEvent("hideWeatherCard"));
        break;
      }
      // ^ ^ ^ ^ ^ END OF NEW BLOCK ^ ^ ^ ^ ^

        case "show_traffic": {
            window.dispatchEvent(new CustomEvent("voiceShowTraffic"));
            setStatus("📈 Showing traffic overlay on the map.");
            speak("Showing traffic overlay on the map.");
            break;
        }
        
        case "hide_traffic": {
            window.dispatchEvent(new CustomEvent("voiceHideTraffic"));
            setStatus("📉 Hiding traffic overlay from the map.");
            speak("Hiding traffic overlay from the map.");
            break;
        }
        
        case "find_faster_route": {
            window.dispatchEvent(new CustomEvent("voiceFindFasterRoute"));
            setStatus("🚀 Searching for a faster route...");
            speak("Searching for a faster route.");
            break;
        }

        // =================================================================
        // 💡 NEW: POI SEARCH (Find coffee shops, gas stations, etc.)
        // =================================================================
        case "search_poi": {
            const query = command.query || "";
            const location = command.location || "";
            
            // Dispatch a CustomEvent that MapView.jsx will listen for
            // This is how the VoiceController talks to the MapView component.
            window.dispatchEvent(
                new CustomEvent("voiceSearchPOI", {
                    detail: { query, location }
                })
            );

            let feedback = `Searching for ${query}`;
            if (location) {
                feedback += ` near ${location}`;
            } else {
                feedback += ` in the current map view`;
            }

            setStatus(`🔍 ${feedback}...`);
            speak(feedback);
            break;
        }
        // =================================================================
      

      case "start_journey": {
        startJourney();
        break;
      }
      case "stop_journey": {
        stopJourney();
        break;
      }
      case "navigate": {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            startCoordsRef.current = [latitude, longitude];

            const places = [command.destination, ...(command.waypoints || [])];

            const coords = await Promise.all(
              places.map(async (place) => {
                try {
                  const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`
                  );
                  const data = await res.json();
                  if (data.length) {
                    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                  }
                  return null;
                } catch {
                  return null;
                }
              })
            );

            const destCoords = coords[0];
            const waypointCoords = coords.slice(1).filter(Boolean);

            if (!destCoords) {
              setStatus("⚠️ Could not geocode destination");
              speak("I could not find the destination location.");
              return;
            }
            destinationCoordsRef.current = destCoords;

            let mode = command.mode || "driving-car";
            if (!["driving-car", "cycling-regular", "foot-walking"].includes(mode)) {
              mode = "driving-car";
            }

            const query = new URLSearchParams();
            query.set("fromLat", latitude);
            query.set("fromLng", longitude);
            query.set("to", command.destination);
            if (
              command.waypoints &&
              command.waypoints.length &&
              waypointCoords.length === command.waypoints.length
            ) {
              query.set("via", command.waypoints.join(","));
            }
            query.set("mode", mode);
            query.set("layer", lastLayerRef.current);

            navigate(`/map?${query.toString()}&t=${Date.now()}`);

            let feedback = `Starting navigation to ${command.destination}`;
            
            // --- THIS IS THE FIX ---
            // Filter out any waypoints that are the same as the destination
            const filteredWaypoints = (command.waypoints || []).filter(
              wp => wp.toLowerCase() !== command.destination.toLowerCase()
            );
            
            if (filteredWaypoints.length > 0) {
              feedback += ` via ${filteredWaypoints.join(" and ")}`;
            }

            feedback += ` by ${mode.replace("-", " ")}`;
            setStatus("🗺️ " + feedback);
            speak(feedback);
          },
          () => {
            setStatus("⚠️ Could not get your location");
            speak("Could not get your location");
          }
        );
        break;
      }
      case "change_layer": {
        lastLayerRef.current = command.layer_type || "streets";
        setStatus(`🗺️ Switching to ${command.layer_type} view`);
        speak(`Switching to ${command.layer_type} view`);
        navigateWithLayer("/map");
        break;
      }
      case "zoom": {
        if (command.action === "in") {
          navigateWithLayer("/map?zoomTo=in");
          setStatus("🔍 Zooming in");
          speak("Zooming in");
        } else if (command.action === "out") {
          navigateWithLayer("/map?zoomTo=out");
          setStatus("🔍 Zooming out");
          speak("Zooming out");
        } else if (command.action === "to_location" && command.location) {
          const place = command.location;
          setStatus(`🔍 Zooming to ${place}...`);
          fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`)
            .then((res) => res.json())
            .then((data) => {
              if (data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                navigateWithLayer(`/map?zoomTo=${lat},${lon}&zoomLevel=${command.level || 15}`);
                setStatus(`🔍 Zoomed to ${place}`);
                speak(`Zoomed to ${place}`);
              } else {
                setStatus(`⚠️ Place not found: ${place}`);
                speak(`Could not find ${place}`);
              }
            })
            .catch(() => {
              setStatus(`⚠️ Failed to fetch location for ${place}`);
              speak(`Failed to find ${place}`);
            });
        } else if (command.action === "to_current_location") {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              navigateWithLayer(`/map?zoomTo=${latitude},${longitude}&zoomLevel=${command.level || 15}`);
              setStatus("📍 Zooming to your current location");
              speak("Zooming to your current location");
            },
            () => {
              setStatus("⚠️ Could not get current location");
              speak("Could not get your current location");
            }
          );
        } else if (command.action === "to_start" || command.action === "start_point") {
          const start = startCoordsRef.current;
          if (start) {
            navigateWithLayer(`/map?zoomTo=${start[0]},${start[1]}&zoomLevel=${command.level || 14}`);
            setStatus("🏁 Zooming to starting point");
            speak("Zooming to your start point");
          } else {
            setStatus("⚠️ No starting point available");
            speak("No starting point set yet");
          }
        } else if (command.action === "to_destination" || command.action === "destination") {
          const dest = destinationCoordsRef.current;
          if (dest) {
            navigateWithLayer(`/map?zoomTo=${dest[0]},${dest[1]}&zoomLevel=${command.level || 14}`);
            setStatus("🎯 Zooming to your destination");
            speak("Zooming to your destination");
          } else {
            setStatus("⚠️ No destination set");
            speak("Destination is not set yet");
          }
        } else if (command.level) {
          navigateWithLayer(`/map?zoomLevel=${command.level}`);
          setStatus(`🔍 Zooming to level ${command.level}`);
          speak(`Zooming to level ${command.level}`);
        } else {
          setStatus("⚠️ Zoom command not understood");
          speak("Did not understand zoom command");
        }
        break;
      }
      case "pan": {
        if (command.direction) {
          const query = new URLSearchParams(location.search);
          query.set("pan", command.direction);
          query.set("layer", lastLayerRef.current);
          query.set("t", Date.now());
          navigate(`/map?${query.toString()}`);
          setStatus(`🏞️ Panning ${command.direction}`);
          speak(`Panning ${command.direction}`);
        }
        break;
      }
      case "distance": {
        const q = encodeURIComponent(`${command.from} to ${command.to}`);
        fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=2`)
          .then((res) => res.json())
          .then((locs) => {
            if (locs.length === 2) {
              const from = [parseFloat(locs[0].lat), parseFloat(locs[0].lon)];
              const to = [parseFloat(locs[1].lat), parseFloat(locs[1].lon)];

              const R = 6371;
              const dLat = ((to[0] - from[0]) * Math.PI) / 180;
              const dLon = ((to[1] - from[1]) * Math.PI) / 180;
              const a =
                Math.sin(dLat / 2) ** 2 +
                Math.cos((from[0] * Math.PI) / 180) *
                  Math.cos((to[0] * Math.PI) / 180) *
                  Math.sin(dLon / 2) ** 2;
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              const dist = R * c;
              setStatus(`📏 Distance: ${dist.toFixed(1)} km`);
              speak(`Distance is ${dist.toFixed(1)} kilometers`);
            } else {
              setStatus("⚠️ Could not fetch both locations");
              speak("Could not fetch locations");
            }
          })
          .catch(() => {
            setStatus("⚠️ Failed to fetch location data");
            speak("Failed to fetch location data");
          });
        break;
      }


      case "get_eta": {
        // Validate inputs
        if (!command.from || !command.to) {
          setStatus("⚠️ Please specify both start and destination for ETA");
          speak("Please specify both start and destination to calculate ETA");
          return;
        }

        let mode = command.mode || "driving-car";
        if (!["driving-car", "cycling-regular", "foot-walking"].includes(mode)) {
          mode = "driving-car";
        }

        try {
          // Geocode 'from' and 'to' places in parallel
          const locations = await Promise.all(
            ["from", "to"].map(async (key) => {
              try {
                const res = await fetch(
                  `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    command[key]
                  )}`
                );
                const data = await res.json();
                if (data.length) {
                  return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                } else {
                  return null;
                }
              } catch {
                return null;
              }
            })
          );

          const fromCoords = locations[0];
          const toCoords = locations[1];

          if (!fromCoords || !toCoords) {
            setStatus("⚠️ Could not find start or destination location");
            speak("Could not find start or destination location");
            return;
          }

          // Build ORS request body with coords in [lng, lat] order
          const body = {
            coordinates: [
              [fromCoords[1], fromCoords[0]],
              [toCoords[1], toCoords[0]],
            ],
            instructions: false,
          };

          const response = await fetch(
            `https://api.openrouteservice.org/v2/directions/${mode}`,
            {
              method: "POST",
              headers: {
                Authorization: ORS_API_KEY,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
            }
          );

          if (!response.ok) {
            const text = await response.text();
            setStatus(`⚠️ ORS error: ${response.status} ${text}`);
            speak("Sorry, could not fetch ETA");
            return;
          }

          const data = await response.json();

          const seconds = data?.routes?.[0]?.summary?.duration;
          if (seconds) {
            const minutes = Math.round(seconds / 60);
            const etaStr =
              minutes >= 60
                ? `${Math.floor(minutes / 60)} hour(s) ${minutes % 60} minute(s)`
                : `${minutes} minute(s)`;
            setStatus(`⏱️ Estimated time of arrival: ${etaStr}`);
            speak(`The estimated time of arrival is ${etaStr}`);
          } else {
            setStatus("⚠️ ETA not available");
            speak("ETA not available");
          }
        } catch (err) {
          console.error("Error fetching ETA:", err);
          setStatus("⚠️ Failed to fetch ETA");
          speak("Failed to fetch estimated time");
        }
        break;
      }
      default:
        setStatus("⚠️ Sorry, unknown command");
        speak("Sorry, unknown command");
    }
  };

  useEffect(() => {
    lastLayerRef.current = getCurrentLayerFromURL();

    const startRecognition = () => {
      if (hasStarted || !(window.SpeechRecognition || window.webkitSpeechRecognition))
        return;
      setHasStarted(true);

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;   // ← FIX THIS
      recognition.maxAlternatives = 1;

      recognitionRef.current = recognition;

      recognition.onstart = () => setStatus("🎧 Listening...");

      recognition.onresult = async (event) => {
  let transcript = "";
  
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const isFinal = event.results[i].isFinal;
    transcript += event.results[i][0].transcript;
    
    // ✅ ONLY process final results
    if (isFinal) {
      transcript = transcript.trim();
      if (transcript.length < 2) {
        console.log("Waiting for more words...");
        return;
      }
      
      setStatus(`🗣️ ${transcript}`);
      console.log("🎤 Heard:", transcript);

      setStatus("🤖 Thinking...");
      try {
        const command = await askLLM(transcript);
        await handleTool(command);
      } catch (e) {
        setStatus("⚠️ LLM error: " + e.message);
        speak("Sorry, there was an error.");
      }
      break;
    }
  }
};


      recognition.onerror = (event) => {
        console.error("Speech error:", event.error);
        setStatus(`⚠️ Voice error: ${event.error}`);
      };

      recognition.onend = () => {
        console.log("🔁 Restarting speech recognition...");
        if (recognitionRef.current) recognitionRef.current.start();
      };

      recognition.start();
    };

    const handleClick = () => startRecognition();
    window.addEventListener("click", handleClick, { once: true });

    // =================================================================
    // 💡 NEW: Listener for the 'search_poi' command from MapView
    // The MapView needs to fire an event when it has the searchPois function ready
    // You must add this event listener to MapView.jsx
    // =================================================================
    const handleVoiceSearchPOI = (event) => {
        // If the LLM generates a tool call, we handle the corresponding action here.
        // The actual search logic is in MapView, so we dispatch another event.
        const { query, location } = event.detail;
        
        // This is a placeholder/confirmation, the actual search happens in MapView.jsx
        // via the CustomEvent dispatched from this case block.
        let feedback = `Searching for ${query}`;
        if (location) feedback += ` near ${location}`;
        setStatus(`🔍 ${feedback}...`);
        speak(feedback);
    }
    
    // This is not needed here as the 'search_poi' command is handled directly 
    // in the switch(command.command) block above.
    // However, if you have a component structure where VoiceController is a sibling 
    // of MapView, using a CustomEvent is the correct way to communicate.
    // For now, let's stick to the CustomEvent dispatch in the switch, and assume 
    // MapView has the corresponding event listener added in its useEffect.
    // window.addEventListener("voiceSearchPOI", handleVoiceSearchPOI);
    // return () => window.removeEventListener("voiceSearchPOI", handleVoiceSearchPOI);
    // =================================================================

    return () => {
      window.removeEventListener("click", handleClick);
      if (recognitionRef.current) recognitionRef.current.stop();
      // Important: Clear any watch when component unmounts to prevent leaks
      if (journeyWatchIdRef.current != null) {
        navigator.geolocation.clearWatch(journeyWatchIdRef.current);
        journeyWatchIdRef.current = null;
      }
    };
  }, [navigate, location, hasStarted, askLLM]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "10px 20px",
        borderRadius: "12px",
        fontFamily: "monospace",
        fontSize: "14px",
        zIndex: 1000,
      }}
    >
      {loading ? "🤖 Thinking..." : status}
    </div>
  );
};

export default VoiceController;
