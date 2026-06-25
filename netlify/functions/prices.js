// prices.js
// Live stock quotes via Twelve Data, with a shared 15-minute cache (Netlify Blobs)
// so all visitors share ONE upstream fetch instead of each spending ~21 credits.
// This keeps usage far under the free plan's 8 credits/minute limit.
//
// Request:  POST { symbols: ["CCO.TO","NXE","SYH.V",...] }
// Response: { "CCO.TO": {price, changePct, volume}, ... } keyed by ORIGINAL ticker.
//
// Env var: TWELVE_DATA_KEY

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const CACHE_KEY = "quotes-v1";

const SUFFIX_TO_EXCHANGE = { "TO":"TSX", "V":"TSXV", "CN":"CSE", "NE":"NEO" };

function toTD(orig) {
  const m = orig.match(/^(.+)\.([A-Z]{1,2})$/);
  if (m && SUFFIX_TO_EXCHANGE[m[2]]) return { td: `${m[1]}:${SUFFIX_TO_EXCHANGE[m[2]]}`, orig };
  return { td: orig, orig };
}

// Lazy-load Netlify Blobs; if unavailable, we degrade to no-cache gracefully.
async function getStore() {
  try {
    const { getStore } = await import("@netlify/blobs");
    return getStore("prices-cache");
  } catch { return null; }
}

exports.handler = async (event) => {
  const CORS = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };
  try {
    const KEY = process.env.TWELVE_DATA_KEY;
    let symbols = [];
    try { symbols = (JSON.parse(event.body || "{}").symbols) || []; } catch {}
    symbols = [...new Set(symbols.filter(Boolean))];
    if (!symbols.length) return { statusCode: 200, headers: CORS, body: JSON.stringify({}) };
    if (!KEY) return { statusCode: 200, headers: CORS, body: JSON.stringify({ error: "Missing TWELVE_DATA_KEY" }) };

    const store = await getStore();

    // 1) Serve from cache if fresh
    if (store) {
      try {
        const cached = await store.get(CACHE_KEY, { type: "json" });
        if (cached && cached.ts && (Date.now() - cached.ts) < CACHE_TTL_MS && cached.data) {
          // Serve from cache only if it covers every requested symbol the upstream knows about.
          const subset = {};
          let haveCount = 0;
          for (const s of symbols) {
            if (cached.data[s] !== undefined) { subset[s] = cached.data[s]; haveCount++; }
          }
          // If cache has data for all requested symbols, serve it; else refetch to fill gaps.
          if (haveCount === symbols.length) {
            return { statusCode: 200, headers: { ...CORS, "X-Cache": "HIT" }, body: JSON.stringify(subset) };
          }
        }
      } catch { /* ignore cache read errors */ }
    }

    // 2) Cache miss/stale → fetch fresh from Twelve Data
    const mapped = symbols.map(toTD);
    const tdToOrig = {};
    mapped.forEach(({ td, orig }) => { tdToOrig[td] = orig; });
    const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(mapped.map(m=>m.td).join(","))}&apikey=${KEY}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) {
      // On upstream failure, serve stale cache if we have any
      if (store) {
        try {
          const cached = await store.get(CACHE_KEY, { type: "json" });
          if (cached?.data) {
            const subset = {};
            for (const s of symbols) if (cached.data[s]) subset[s] = cached.data[s];
            return { statusCode: 200, headers: { ...CORS, "X-Cache": "STALE" }, body: JSON.stringify(subset) };
          }
        } catch {}
      }
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ error: `TwelveData ${res.status}` }) };
    }

    const data = await res.json();
    const out = {};
    const normalize = (q, tdKey) => {
      if (!q || q.status === "error") return;
      const price = parseFloat(q.close ?? q.price);
      if (!isFinite(price)) return;
      let changePct = parseFloat(q.percent_change);
      if (!isFinite(changePct)) {
        const prev = parseFloat(q.previous_close);
        changePct = (isFinite(prev) && prev) ? ((price - prev) / prev) * 100 : 0;
      }
      const orig = tdToOrig[tdKey] || tdToOrig[q.symbol] || q.symbol;
      out[orig] = { price, changePct, volume: parseInt(q.volume) || 0 };
    };

    if (data && data.symbol && (data.close || data.price)) normalize(data, data.symbol);
    else if (data && typeof data === "object") for (const [k, q] of Object.entries(data)) normalize(q, k);

    // 3) Write merged cache (preserve any previously cached symbols not in this request)
    if (store && Object.keys(out).length) {
      try {
        let prev = {};
        try { const c = await store.get(CACHE_KEY, { type:"json" }); if (c?.data) prev = c.data; } catch {}
        await store.setJSON(CACHE_KEY, { ts: Date.now(), data: { ...prev, ...out } });
      } catch { /* ignore cache write errors */ }
    }

    return { statusCode: 200, headers: { ...CORS, "X-Cache": "MISS" }, body: JSON.stringify(out) };
  } catch (err) {
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
