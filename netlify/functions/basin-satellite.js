// basin-satellite.js
// Returns a real satellite image of the Athabasca Basin region as base64
// Uses Esri World Imagery (no API key required) via static export

exports.handler = async () => {
  // Athabasca Basin bounding box (approx): covers the main uranium district
  // Centre ~ 58.0N, 106.5W
  const bbox = "-110.5,57.0,-103.0,59.5"; // minLng,minLat,maxLng,maxLat
  const width = 800, height = 440;

  // Esri World Imagery export endpoint (public, no key)
  const url = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${bbox}&bboxSR=4326&imageSR=4326&size=${width},${height}&format=jpg&f=image`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AthabascaTracker/1.0)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const b64 = buf.toString("base64");
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400", // cache 24h
      },
      body: JSON.stringify({ image: `data:image/jpeg;base64,${b64}` }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
