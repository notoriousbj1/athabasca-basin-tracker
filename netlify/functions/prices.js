// prices.js
// Live stock quotes for the tracked companies.
// Request:  POST { symbols: ["CCO.TO","NXE",...] }
// Response: { "CCO.TO": {price, changePct, volume}, ... } keyed by ticker.
//
// Yahoo Finance tightened access and now requires a cookie + "crumb" for the quote API,
// and often serves an HTML consent page to bare requests (causing "Unexpected end of JSON input").
// This version:
//   1) does the cookie+crumb handshake for the quote endpoint, and
//   2) falls back to the per-symbol chart endpoint (more lenient) if the quote call fails.

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "application/json,text/plain,*/*",
  "Accept-Language": "en-US,en;q=0.9",
};

exports.handler = async (event) => {
  const CORS = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };
  try {
    let symbols = [];
    try { symbols = (JSON.parse(event.body || "{}").symbols) || []; } catch {}
    symbols = [...new Set(symbols.filter(Boolean))];
    if (!symbols.length) return { statusCode: 200, headers: CORS, body: JSON.stringify({}) };

    let out = {};

    // ---- Strategy 1: quote endpoint with cookie + crumb ----
    try {
      const { cookie, crumb } = await getCrumb();
      if (cookie && crumb) {
        const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(","))}&crumb=${encodeURIComponent(crumb)}`;
        const res = await fetch(url, { headers: { ...BROWSER_HEADERS, "Cookie": cookie }, signal: AbortSignal.timeout(9000) });
        if (res.ok) {
          const data = await res.json();
          for (const q of (data?.quoteResponse?.result || [])) {
            if (q?.symbol && typeof q.regularMarketPrice === "number") {
              out[q.symbol] = {
                price: q.regularMarketPrice,
                changePct: typeof q.regularMarketChangePercent === "number" ? q.regularMarketChangePercent : 0,
                volume: q.regularMarketVolume || 0,
              };
            }
          }
        }
      }
    } catch (e) { /* fall through to chart fallback */ }

    // ---- Strategy 2: per-symbol chart endpoint for anything still missing ----
    const missing = symbols.filter(s => !out[s]);
    if (missing.length) {
      const results = await Promise.all(missing.map(s => chartQuote(s).catch(() => null)));
      results.forEach((r, i) => { if (r) out[missing[i]] = r; });
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify(out) };
  } catch (err) {
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};

// Fetch a Yahoo cookie, then a crumb tied to that cookie.
async function getCrumb() {
  const c = await fetch("https://fc.yahoo.com/", { headers: BROWSER_HEADERS, redirect: "manual", signal: AbortSignal.timeout(8000) }).catch(() => null);
  let cookie = c?.headers?.get("set-cookie") || "";
  // Some environments expose only the first cookie; that's usually enough (the A1/A3 session cookie).
  cookie = cookie.split(",").map(s => s.split(";")[0]).join("; ");
  if (!cookie) {
    // Try the consent host as a fallback cookie source
    const c2 = await fetch("https://finance.yahoo.com/", { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(8000) }).catch(() => null);
    cookie = (c2?.headers?.get("set-cookie") || "").split(",").map(s => s.split(";")[0]).join("; ");
  }
  if (!cookie) return { cookie: null, crumb: null };

  const res = await fetch("https://query2.finance.yahoo.com/v1/test/getcrumb", {
    headers: { ...BROWSER_HEADERS, "Cookie": cookie }, signal: AbortSignal.timeout(8000),
  });
  const crumb = (await res.text()).trim();
  if (!crumb || crumb.includes("<") || crumb.length > 32) return { cookie, crumb: null };
  return { cookie, crumb };
}

// Lenient fallback: the chart endpoint usually works without a crumb.
async function chartQuote(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`;
  const res = await fetch(url, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const data = await res.json();
  const r = data?.chart?.result?.[0];
  const meta = r?.meta;
  if (!meta || typeof meta.regularMarketPrice !== "number") return null;
  const prev = meta.chartPreviousClose ?? meta.previousClose;
  const price = meta.regularMarketPrice;
  const changePct = (typeof prev === "number" && prev) ? ((price - prev) / prev) * 100 : 0;
  const volume = meta.regularMarketVolume
    || r?.indicators?.quote?.[0]?.volume?.filter(Boolean).slice(-1)[0]
    || 0;
  return { price, changePct, volume };
}
