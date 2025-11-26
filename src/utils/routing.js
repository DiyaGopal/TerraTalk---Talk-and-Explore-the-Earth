// utils/routing.js
const API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjZiMDg1NDBiODcxYjQzOGJiNGQ1ZjY5N2Q5NDAyZTA4IiwiaCI6Im11cm11cjY0In0=";

export const getRoute = async (from, to) => {
  const url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

  const body = {
    coordinates: [
      [from.lng, from.lat],
      [to.lng, to.lat]
    ]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    const coords = data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
    return coords;
  } catch (error) {
    console.error("❌ Route fetching failed:", error);
    return null;
  }
};
