import { useEffect, useRef, useState } from "react";

import { useSearchParams } from "react-router-dom";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import 'leaflet-minimap';

import 'leaflet-minimap/dist/Control.MiniMap.min.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});


L.Icon.Default.mergeOptions({
  iconUrl: "/images/leaflet/marker-icon.png",
  shadowUrl: "/images/leaflet/marker-shadow.png",
  iconRetinaUrl: "/images/leaflet/marker-icon-2x.png",
});



const MapView = () => {

  const [searchParams] = useSearchParams();

  const mapRef = useRef(null);

  const routeLayerRef = useRef(null);

  const currentRouteGeoJSON = useRef(null);

  const baseLayerRef = useRef(null);

  const lastFocus = useRef([20, 0]);

  const lastZoom = useRef(2);

  const markerGroupRef = useRef(null);

  const distanceLabelsRef = useRef([]);

  const viaMarkersRef = useRef([]);

  const animatedMarkerRef = useRef(null);

  const [weatherData, setWeatherData] = useState(null);



  const baseLayers = {

    streets: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {

      attribution: '© OpenStreetMap contributors',

    }),

    satellite: L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {

      attribution: "Tiles © Esri",

    }),

    grayscale: L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {

      attribution: "© CARTO",

    }),



    humanitarian: L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {

      attribution: '© OpenStreetMap contributors, Tiles courtesy of HOT',

    }),

    topographic: L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {

        attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)',

    }),

    watercolor: L.tileLayer("https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg", {

        attribution: '© Stadia Maps, © Stamen Design, © OpenStreetMap contributors'

    }),

    transport: L.tileLayer("https://tile.memomaps.de/tilegen/{z}/{x}/{y}.png", {

        attribution: 'Map data: © OpenStreetMap contributors, © ÖPNVKarte'

    }),

    cyclosm: L.tileLayer("https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png", {

        attribution: '© CyclOSM, © OpenStreetMap contributors'

    }),

    toner: L.tileLayer("https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png", {

        attribution: '© Stadia Maps, © Stamen Design, © OpenStreetMap contributors'

    }),

    labels_overlay: L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png", {

      attribution: '© CARTO, © OpenStreetMap contributors',

      pane: 'shadowPane' // Optional: puts it on a specific pane to ensure it's on top

    }),

    rail: L.tileLayer("https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png", {

        attribution: '© OpenRailwayMap, © OpenStreetMap contributors'

    }),

  };



  const showCurrentLocation = () => {

    if (!navigator.geolocation || !markerGroupRef.current) return;

    navigator.geolocation.getCurrentPosition(

      ({ coords: { latitude, longitude } }) => {

        L.marker([latitude, longitude], { title: "You are here" })

          .bindPopup("📍 You are here")

          .addTo(markerGroupRef.current);

      },

      (e) => console.warn("Geo error:", e.message)

    );

  };



  const renderRoute = () => {

    const map = mapRef.current;

    if (!map || !currentRouteGeoJSON.current) return;

    if (routeLayerRef.current) map.removeLayer(routeLayerRef.current);

    routeLayerRef.current = L.geoJSON(currentRouteGeoJSON.current, {

      style: { color: "#2c84ff", weight: 5 },

    }).addTo(map);

  };



  const startAnimation = () => {

    const mode = searchParams.get("mode") || "driving-car";

    const feature = currentRouteGeoJSON.current?.features?.[0];

    if (!feature) return;

    const coords = feature.geometry.coordinates;

    if (!coords.length) return;

    if (animatedMarkerRef.current) {

      mapRef.current.removeLayer(animatedMarkerRef.current);

    }



    const iconSymbol = mode.includes("cycling")

      ? "🚴‍♀️"

      : mode.includes("foot")

      ? "🚶‍♂️"

      : "🚗";



    const icon = L.divIcon({

      html: `<div style="font-size:24px">${iconSymbol}</div>`,

      className: "",

      iconSize: [24, 24],

    });



    const animatedMarker = L.marker([coords[0][1], coords[0][0]], { icon }).addTo(mapRef.current);

    animatedMarkerRef.current = animatedMarker;



    let idx = 0;

    const step = () => {

      if (idx >= coords.length) return;

      animatedMarker.setLatLng([coords[idx][1], coords[idx][0]]);

      idx++;

      requestAnimationFrame(step);

    };

    step();

  };



  useEffect(() => {

    if (!mapRef.current && document.getElementById("map")) {

      const map = L.map("map", {

        center: lastFocus.current,

        zoom: lastZoom.current,

        zoomControl: true,

      });

      mapRef.current = map;

      baseLayers.streets.addTo(map);

      baseLayerRef.current = baseLayers.streets;

      markerGroupRef.current = L.layerGroup().addTo(map);

      showCurrentLocation();

    }

  }, []);



  useEffect(() => {

  const query = new URLSearchParams(location.search);

  const shouldTrack = query.get("track") === "true";



  if (!shouldTrack) return;



  if (!navigator.geolocation) {

    console.warn("Geolocation not supported");

    return;

  }



  const watchId = navigator.geolocation.watchPosition(

    (pos) => {

      const { latitude, longitude } = pos.coords;

      const latLng = [latitude, longitude];

      setCurrentLocation(latLng);

      startCoordsRef.current = latLng;



   

      if (mainMapRef.current) {

        mainMapRef.current.setView(latLng);

      }



      // Updating miniMap focus

      if (miniMapRef.current) {

        miniMapRef.current.setView(latLng);

      }

    },

    (err) => console.error("Geo error:", err),

    {

      enableHighAccuracy: true,

      maximumAge: 10000,

      timeout: 10000

    }

  );



  return () => {

    navigator.geolocation.clearWatch(watchId);

  };

}, [location.search]);


  // This hook contains your Minimap AND your Share Logic
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // --- 1. Your Minimap Code (Unchanged) ---
    const miniMapLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '',
      minZoom: 0,
      maxZoom: 13,
    });
    const miniMap = new L.Control.MiniMap(miniMapLayer, {
      toggleDisplay: true,
      minimized: false,
      position: 'bottomright',
      width: 180,
      height: 120,
      zoomLevelOffset: -5,
      aimingRectOptions: { color: "#2c84ff", weight: 2 },
      shadowRectOptions: { color: "#000", opacity: 0, fillOpacity: 0 }
    });
    miniMap.addTo(map);
    setTimeout(() => {
      const miniMapContainer = document.querySelector('.leaflet-control-minimap');
      if (miniMapContainer) {
        miniMapContainer.style.right = '-10px';
        miniMapContainer.style.bottom = '10px';
      }
    }, 100);

    
    // --- 2. Your Share Logic (WHATSAPP ONLY) ---

    // --- Listener: Specific "Send location to [contact]" (WHATSAPP) ---
    const handleSendWhatsapp = (event) => {
      const { contact } = event.detail; // e.g., "suhas"

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          
          try {
            const response = await fetch('http://localhost:3011/send-whatsapp', { // <-- FIX THIS
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contact: contact, // The name, e.g., "suhas"
                lat: latitude,
                lng: longitude
              })
            });

            const result = await response.json();

            if (!response.ok) {
              throw new Error(result.error || 'Server failed to send WhatsApp.');
            }

            console.log(result.message);
            alert(`WhatsApp sent to ${contact}!`); // Success!

          } catch (err) {
            console.error("Failed to send automatic WhatsApp:", err);
            alert(`Error: ${err.message}`);
          }
        },
        (err) => alert("Error: Could not get your precise location to share."),
        { enableHighAccuracy: true }
      );
    };

    // Listen for the WhatsApp event
    window.addEventListener("voiceSendWhatsapp", handleSendWhatsapp);

    // ✅ ADD THIS BLOCK:
    const handleShowWeatherCard = (event) => {
      setWeatherData(event.detail);
    };

    const handleHideWeatherCard = () => {
      setWeatherData(null);
    };

    window.addEventListener("showWeatherCard", handleShowWeatherCard);
    window.addEventListener("hideWeatherCard", handleHideWeatherCard);

    // 4. RETURN A CLEANUP FUNCTION
        return () => {
      if (map && miniMap) map.removeControl(miniMap);
      window.removeEventListener("voiceSendWhatsapp", handleSendWhatsapp);
      window.removeEventListener("showWeatherCard", handleShowWeatherCard);  // ✅ ADD
      window.removeEventListener("hideWeatherCard", handleHideWeatherCard);  // ✅ ADD
    };

  }, []);

  useEffect(() => {

    const map = mapRef.current;

    if (!map) return;



    const zoomTo = searchParams.get("zoomTo");

    const zoomLevelParam = parseInt(searchParams.get("zoomLevel"));

    const fromLat = searchParams.get("fromLat");

    const fromLng = searchParams.get("fromLng");

    const to = searchParams.get("to");

    const via = searchParams.get("via");

    const pan = searchParams.get("pan");

    const layer = searchParams.get("layer") || "streets";



    map.removeLayer(baseLayerRef.current);

    baseLayers[layer].addTo(map);

    baseLayerRef.current = baseLayers[layer];



    markerGroupRef.current.clearLayers();

    showCurrentLocation();

    viaMarkersRef.current.forEach((m) => m.addTo(markerGroupRef.current));

    distanceLabelsRef.current.forEach((lbl) => map.removeLayer(lbl));

    distanceLabelsRef.current = [];

    if (animatedMarkerRef.current) {

      map.removeLayer(animatedMarkerRef.current);

      animatedMarkerRef.current = null;

    }



    renderRoute();



    const doZoom = (latlng, zl) => {

      map.setView(latlng, zl);

      lastFocus.current = latlng;

      lastZoom.current = zl;

    };



    if (zoomTo && !["in", "out", "world"].includes(zoomTo)) {

      if (/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(zoomTo)) {

        const [lat, lon] = zoomTo.split(",").map(Number);

        doZoom([lat, lon], zoomLevelParam || 14);

      } else {

        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${zoomTo}`)

          .then((r) => r.json())

          .then((data) => {

            if (!data.length) throw new Error("not found");

            const lat = +data[0].lat;

            const lon = +data[0].lon;

            doZoom([lat, lon], zoomLevelParam || 10);

          })

          .catch(() => alert("Could not find: " + zoomTo));

      }

    } else if (zoomTo === "in" || zoomTo === "out") {

      const delta = zoomTo === "in" ? 1 : -1;

      const center = map.getCenter();

      const newZoom = Math.max(2, Math.min(18, map.getZoom() + delta));

      map.setView(center, newZoom);

      lastFocus.current = [center.lat, center.lng];

      lastZoom.current = newZoom;

    } else if (zoomTo === "world") {

      doZoom([20, 0], 2);

    }



    if (fromLat && fromLng && to) {

      // To Remove previous via/destination markers from the map

  viaMarkersRef.current.forEach(marker => {

  if (markerGroupRef.current) {

    markerGroupRef.current.removeLayer(marker);

  }

});

viaMarkersRef.current = [];



      const allPlaces = via ? via.split(",").map((v) => v.trim()).concat(to.trim()) : [to.trim()];

      const coords = [[+fromLng, +fromLat]];



      Promise.all(

        allPlaces.map((place) =>

          fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${place}`)

            .then((r) => r.json())

            .then((res) => {

              if (!res.length) throw new Error(place + " not found");

              const [lon, lat] = [+res[0].lon, +res[0].lat];

              const marker = L.marker([lat, lon]).bindPopup(`📍 ${place}`);

              marker.addTo(markerGroupRef.current);

              viaMarkersRef.current.push(marker);

              return [lon, lat];

            })

        )

      )

        .then((waypoints) => {

          coords.push(...waypoints);

          const from = L.latLng(+fromLat, +fromLng);

          const toCoord = L.latLng(waypoints[waypoints.length - 1][1], waypoints[waypoints.length - 1][0]);

          map.flyToBounds([from, toCoord], { padding: [80, 80] });

          lastFocus.current = [toCoord.lat, toCoord.lng];

          lastZoom.current = 10;



          const query = new URLSearchParams(window.location.search);

          query.set("destinationLat", toCoord.lat);

          query.set("destinationLng", toCoord.lng);

          query.set("startingLat", from.lat);

          query.set("startingLng", from.lng);

          window.history.replaceState(null, "", `${window.location.pathname}?${query.toString()}`);



          const mode = searchParams.get("mode") || "driving-car";

          return fetch(`https://api.openrouteservice.org/v2/directions/${mode}/geojson`, {

            method: "POST",

            headers: {

              Authorization: "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjAyMDdlNzAwZGRhNTkzOGIxMzc4ZjI4YTY0OTI1ZjZhZmE3Y2Y3MjNhMTUxYjIwY2JkODU2NGM2IiwiaCI6Im11cm11cjY0In0=",

              "Content-Type": "application/json",

            },

            body: JSON.stringify({ coordinates: coords }),

          });

        })

        .then((r) => r.json())

        .then((routeData) => {

          currentRouteGeoJSON.current = routeData;

          renderRoute();



          const summary = routeData.features?.[0]?.properties?.summary;

          const meters = summary?.distance || 0;

          const seconds = summary?.duration || 0;

          const coordsArr = routeData.features[0].geometry.coordinates;

          const [midLng, midLat] = coordsArr[Math.floor(coordsArr.length / 2)];



          const mode = searchParams.get("mode") || "driving-car";

          let adjustedSeconds = seconds;

          const hour = new Date().getHours();



          // ETA logic

          if (mode === "driving-car") {

  if (meters < 2000) adjustedSeconds = Math.max(adjustedSeconds * 3.0, 300);

  else if (meters < 5000) adjustedSeconds *= 2.5;

  else if (meters < 12000) adjustedSeconds *= 2.2;

  else if (meters < 20000) adjustedSeconds *= 2.0;

  else if (meters < 50000) adjustedSeconds *= 1.8;

  else if (meters < 100000) adjustedSeconds *= 1.7;

  else if (meters < 200000) adjustedSeconds *= 1.65;

  else if (meters < 300000) adjustedSeconds *= 1.6;

  else if (meters < 500000) adjustedSeconds *= 1.55;

  else if (meters < 700000) adjustedSeconds *= 1.5;

  else if (meters < 900000) adjustedSeconds *= 1.45;

  else adjustedSeconds *= 1.4;



  if ((hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20)) {

    adjustedSeconds *= 1.2;

  }

}





 else if (mode === "cycling-regular") {

  adjustedSeconds *= 1.35;

 



} else if (mode === "foot-walking") {

  adjustedSeconds *= 1.25;

}





          const timeMin = Math.ceil(adjustedSeconds / 60);

          const timeStr = timeMin < 60 ? `${timeMin} min` : `${Math.floor(timeMin / 60)} hr ${timeMin % 60} min`;



          const labelHTML = `

            <div style="

              background: white;

              padding: 6px 12px;

              border-radius: 8px;

              box-shadow: 0 0 6px rgba(0,0,0,0.3);

              font-size: 14px;

              font-weight: 500;

              color: #333;

              white-space: nowrap;

            ">

              Distance: ${(meters / 1000).toFixed(2)} km<br/>

              ETA: ${timeStr} <span style="font-size:11px;color:gray">(Approx)</span>

            </div>`;



          const labelIcon = L.divIcon({

            className: "distance-label",

            html: labelHTML,

            iconSize: [180, 60],

            iconAnchor: [90, 30],

          });



          const labelMarker = L.marker([midLat, midLng], {

            icon: labelIcon,

            interactive: false,

          }).addTo(map);



          distanceLabelsRef.current.push(labelMarker);

          startAnimation();

        })

        .catch((err) => alert("⚠️ " + err.message));

    }



        if (pan) {

      const panDist = 300;

      const panMap = {

        left: [-panDist, 0],

        right: [panDist, 0],

        up: [0, -panDist],

        down: [0, panDist],

      };



      const directions = pan.split(",").map(d => d.trim()).filter(d => panMap[d]);



      const applyPanStep = (i) => {

        if (i >= directions.length) {

          const center = map.getCenter();

          lastFocus.current = [center.lat, center.lng];

          renderRoute();

          return;

        }

        map.panBy(panMap[directions[i]], { animate: true });

        setTimeout(() => applyPanStep(i + 1), 600);

      };



      applyPanStep(0);

    }

  }, [searchParams]);



    return (
    <>
      <div id="map" style={{ height: "100vh", width: "100vw" }} />
      
      {weatherData && (
        <div style={{
          position: "fixed", bottom: "20px", left: "20px",
          backgroundColor: "white", borderRadius: "12px", padding: "20px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)", zIndex: 999,
          minWidth: "320px", maxWidth: "400px",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          border: "2px solid #e0e0e0",
        }}>
          <div style={{ marginBottom: "15px", borderBottom: "2px solid #007AFF", paddingBottom: "10px" }}>
            <h2 style={{ margin: "0", color: "#333", fontSize: "20px" }}>📍 {weatherData.location}</h2>
          </div>
          
          <div style={{ marginBottom: "15px", padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "8px", textAlign: "center" }}>
            <p style={{ margin: "0", fontSize: "24px", fontWeight: "bold", color: "#007AFF" }}>{weatherData.description}</p>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "15px" }}>
            <div style={{ padding: "12px", backgroundColor: "#FFE5E5", borderRadius: "8px", textAlign: "center" }}>
              <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "#666" }}>Temperature</p>
              <p style={{ margin: "0", fontSize: "22px", fontWeight: "bold", color: "#E74C3C" }}>{weatherData.temperature}°C</p>
            </div>
            <div style={{ padding: "12px", backgroundColor: "#E5F2FF", borderRadius: "8px", textAlign: "center" }}>
              <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "#666" }}>Feels Like</p>
              <p style={{ margin: "0", fontSize: "22px", fontWeight: "bold", color: "#3498DB" }}>{weatherData.feelsLike}°C</p>
            </div>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div style={{ padding: "12px", backgroundColor: "#E5F5F2", borderRadius: "8px", textAlign: "center" }}>
              <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "#666" }}>💧 Humidity</p>
              <p style={{ margin: "0", fontSize: "20px", fontWeight: "bold", color: "#27AE60" }}>{weatherData.humidity}%</p>
            </div>
            <div style={{ padding: "12px", backgroundColor: "#FFF5E5", borderRadius: "8px", textAlign: "center" }}>
              <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "#666" }}>💨 Wind</p>
              <p style={{ margin: "0", fontSize: "20px", fontWeight: "bold", color: "#F39C12" }}>{weatherData.windSpeed} m/s</p>
            </div>
          </div>
        </div>
      )}
    </>
  );

};

export default MapView;
