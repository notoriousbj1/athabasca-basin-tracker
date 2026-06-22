// basin-claims.js
// Pulls REAL active mineral claims (dispositions) from the Saskatchewan Mineral Tenure service.
// Source: Saskatchewan Govt ArcGIS REST (public, no API key)
// Layer 0 = Mineral Dispositions (polygons). Native SR 2151; we request outSR=4326 and centroids.
// Field OWNERS = claim holder (company). DISPOSIT_1 = disposition number.

const BASE = "https://gis.saskatchewan.ca/arcgis/rest/services/Economy/P_Mineral_Tenure_Crown_Dispositions/MapServer/0/query";

// Athabasca Basin bounding box (lat/lng)
const BBOX = { xmin:-112.0, ymin:56.0, xmax:-102.0, ymax:60.5 };

exports.handler = async () => {
  const params = new URLSearchParams({
    where: "1=1",
    geometry: JSON.stringify({ xmin:BBOX.xmin, ymin:BBOX.ymin, xmax:BBOX.xmax, ymax:BBOX.ymax, spatialReference:{ wkid:4326 } }),
    geometryType: "esriGeometryEnvelope",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "DISPOSIT_1,OWNERS,EFFECTIVED,GOODSTANDI,WORKWAITIN",
    outSR: "4326",
    returnGeometry: "true",
    returnCentroid: "true",       // ask for polygon centroids
    f: "json",
    resultRecordCount: "2000",
  });

  try {
    const res = await fetch(`${BASE}?${params.toString()}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AthabascaTracker/1.0)" },
      signal: AbortSignal.timeout(14000),
    });
    if (!res.ok) throw new Error(`Claims HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || "Claims query error");

    // Compute a representative point for each polygon (centroid if provided, else ring average)
    const claims = (data.features || []).map(f => {
      const a = f.attributes || {};
      let lat = null, lng = null;
      if (f.centroid && f.centroid.x != null) {
        lng = f.centroid.x; lat = f.centroid.y;
      } else if (f.geometry && f.geometry.rings && f.geometry.rings[0]) {
        const ring = f.geometry.rings[0];
        let sx = 0, sy = 0;
        ring.forEach(([x, y]) => { sx += x; sy += y; });
        lng = sx / ring.length; lat = sy / ring.length;
      }
      return {
        id:        a.DISPOSIT_1 || null,
        owner:     (a.OWNERS || "").trim() || "Unknown holder",
        effective: a.EFFECTIVED ? new Date(a.EFFECTIVED).getFullYear() : null,
        goodUntil: a.GOODSTANDI ? new Date(a.GOODSTANDI).getFullYear() : null,
        lat, lng,
      };
    }).filter(c => c.lat != null && c.lng != null);

    // Aggregate top owners for a quick summary
    const ownerCounts = {};
    claims.forEach(c => { ownerCounts[c.owner] = (ownerCounts[c.owner] || 0) + 1; });
    const topOwners = Object.entries(ownerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([owner, count]) => ({ owner, count }));

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=86400" },
      body: JSON.stringify({
        count: claims.length,
        source: "Saskatchewan Mineral Tenure — Crown Dispositions",
        topOwners,
        claims,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message, claims: [], topOwners: [] }),
    };
  }
};
