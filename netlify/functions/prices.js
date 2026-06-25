// prices.js
// Live stock quotes via Twelve Data (reliable, free tier: 800 calls/day).
// Request:  POST { symbols: ["CCO.TO","NXE","SYH.V",...] }
// Response: { "CCO.TO": {price, changePct, volume}, ... } keyed by the ORIGINAL ticker.
//
// Env var (Netlify):  TWELVE_DATA_KEY  – free key from twelvedata.com
//
// Symbol mapping: the dashboard uses Yahoo-style suffixes (.TO, .V, .CN, .NE).
// Twelve Data uses a colon + exchange code instead, e.g. CCO:TSX, SYH:TSXV.

const SUFFIX_TO_EXCHANGE = {
  "TO": "TSX",     // Toronto Stock Exchange
  "V":  "TSXV",    // TSX Venture
  "CN": "CSE",     // Canadian Securities Exchange
  "NE": "NEO",     // Cboe Canada / NEO
};

// Map a dashboard ticker -> { td: "TwelveDataSymbol", orig: "OriginalTicker" }
function toTD(orig) {
  const m = orig.match(/^(.+)\.([A-Z]{1,2})$/);
  if (m && SUFFIX_TO_EXCHANGE[m[2]]) {
    return { td: `${m[1]}:${SUFFIX_TO_EXCHANGE[m[2]]}`, orig };
  }
  return { td: orig, orig }; // US tickers (NXE, UEC, API, URC) pass through unchanged
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

    // Build TD symbol list + a map back to original tickers
    const mapped = symbols.map(toTD);
    const tdToOrig = {};
    mapped.forEach(({ td, orig }) => { tdToOrig[td] = orig; });
    const tdSymbols = mapped.map(m => m.td);

    const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(tdSymbols.join(","))}&apikey=${KEY}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) return { statusCode: 200, headers: CORS, body: JSON.stringify({ error: `TwelveData ${res.status}` }) };

    const data = await res.json();
    const out = {};

    // Twelve Data returns either a single quote object (1 symbol) or a map keyed by TD symbol (batch).
    const normalize = (q, tdKey) => {
      if (!q || q.status === "error") return;
      const price = parseFloat(q.close ?? q.price);
      if (!isFinite(price)) return;
      let changePct = parseFloat(q.percent_change);
      if (!isFinite(changePct)) {
        const prev = parseFloat(q.previous_close);
        changePct = (isFinite(prev) && prev) ? ((price - prev) / prev) * 100 : 0;
      }
      const volume = parseInt(q.volume) || 0;
      const orig = tdToOrig[tdKey] || tdToOrig[q.symbol] || q.symbol;
      out[orig] = { price, changePct, volume };
    };

    if (data && data.symbol && (data.close || data.price)) {
      // single-symbol shape
      normalize(data, data.symbol);
    } else if (data && typeof data === "object") {
      // batch shape: keys are the TD symbols we sent
      for (const [tdKey, q] of Object.entries(data)) normalize(q, tdKey);
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify(out) };
  } catch (err) {
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
