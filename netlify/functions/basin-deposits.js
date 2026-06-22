// basin-deposits.js
// Pulls REAL uranium deposit/occurrence data from the Saskatchewan Mineral Deposit Index (SMDI)
// Source: Saskatchewan Geological Survey ArcGIS REST (public, no API key)
// Layer 5 = Mineral Deposits Index (points). Native SR is 2151; we request outSR=4326 (lat/lng).

const BASE = "https://gis.saskatchewan.ca/arcgis/rest/services/Economy/Mineral_Exploration/MapServer/5/query";

// Athabasca Basin bounding box (lat/lng) — generous box covering the uranium district
const BBOX = { xmin:-112.0, ymin:56.0, xmax:-102.0, ymax:60.5 };

exports.handler = async () => {
  // Query: uranium occurrences within the basin bbox, return geometry in WGS84
  const params = new URLSearchParams({
    where: "PRIMARYCOMMODITIES LIKE '%Uranium%' OR COMMODITY LIKE '%Uranium%'",
    geometry: JSON.stringify({ xmin:BBOX.xmin, ymin:BBOX.ymin, xmax:BBOX.xmax, ymax:BBOX.ymax, spatialReference:{ wkid:4326 } }),
    geometryType: "esriGeometryEnvelope",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "SMDI,NAME,LOCATION,STATUS,PRIMARYCOMMODITIES,GROUPING,DISCOVERYTYPE,PRODUCTION,RESERVESRESOURCES,WEBLINK",
    outSR: "4326",
    returnGeometry: "true",
    f: "json",
    resultRecordCount: "1000",
  });

  try {
    const res = await fetch(`${BASE}?${params.toString()}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AthabascaTracker/1.0)" },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error(`SMDI HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || "SMDI query error");

    const deposits = (data.features || []).map(f => {
      const a = f.attributes || {};
      const g = f.geometry || {};
      return {
        smdi:       a.SMDI || null,
        name:       a.NAME || "Unnamed occurrence",
        status:     a.STATUS || null,                 // e.g. "Deposit: Production", "Occurrence: Primary Exploration"
        stage:      classifyStage(a.STATUS),          // simplified: Producer/Developer/Explorer/Occurrence
        discovery:  a.DISCOVERYTYPE || null,
        production: a.PRODUCTION || null,
        resources:  a.RESERVESRESOURCES || null,
        weblink:    a.WEBLINK || (a.SMDI ? `https://mineraldeposits.saskatchewan.ca/Home/Viewdetails/${a.SMDI}` : null),
        lat:        g.y ?? null,
        lng:        g.x ?? null,
      };
    }).filter(d => d.lat != null && d.lng != null);

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=86400" },
      body: JSON.stringify({ count: deposits.length, source: "Saskatchewan Mineral Deposit Index (SMDI)", deposits }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message, deposits: [] }),
    };
  }
};

// Map SMDI status strings to a simplified stage bucket
function classifyStage(status) {
  if (!status) return "Occurrence";
  const s = status.toLowerCase();
  if (s.includes("post-production")) return "Producer";
  if (s.includes("production"))      return "Producer";
  if (s.includes("development") || s.includes("feasibility")) return "Developer";
  if (s.includes("advanced exploration")) return "Developer";
  if (s.includes("exploration"))     return "Explorer";
  return "Occurrence";
}
