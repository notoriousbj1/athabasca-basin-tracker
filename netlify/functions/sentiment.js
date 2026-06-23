// sentiment.js
// Community sentiment for the Athabasca uranium juniors, sourced from a third-party
// X/Twitter sentiment API. Vendor-agnostic: set the provider URL + key, then adjust the
// ADAPTER section to map the provider's response shape to our format.
//
// Env vars (Netlify → Site settings → Environment variables):
//   SENTIMENT_API_URL   – the provider's endpoint (e.g. https://api.twitterapi.io/...)
//   SENTIMENT_API_KEY   – your API key for that provider
//
// Returns:
//   { ok, score (0-100), label, volume, volumeChangePct, updatedAt, tweets:[{text,author,score,tag,url,time}] }

const CASHTAGS = ["$NXE","$DNN","$CCJ","$FCU","$UEC","$ISO","$SYH","$URNM","$U.UN"];
const KEYWORDS = ["uranium","Athabasca","yellowcake","U3O8"];

exports.handler = async () => {
  const CORS = { "Access-Control-Allow-Origin":"*", "Content-Type":"application/json", "Cache-Control":"public, max-age=900" };
  const API_URL = process.env.SENTIMENT_API_URL;
  const API_KEY = process.env.SENTIMENT_API_KEY;

  // Not configured yet → tell the dashboard to show illustrative sample data, clearly labeled.
  if (!API_URL || !API_KEY) {
    return { statusCode: 200, headers: CORS, body: JSON.stringify({
      ok: false, configured: false,
      error: "Sentiment source not configured",
      detail: `Missing ${!API_URL ? "SENTIMENT_API_URL " : ""}${!API_KEY ? "SENTIMENT_API_KEY" : ""}`.trim(),
    }) };
  }

  try {
    const query = encodeURIComponent([...CASHTAGS, ...KEYWORDS].join(" OR "));
    const res = await fetch(`${API_URL}?query=${query}&limit=40`, {
      headers: { "Authorization": `Bearer ${API_KEY}`, "Accept": "application/json" },
      signal: AbortSignal.timeout(12000),
    });
    const text = await res.text();
    let raw; try { raw = JSON.parse(text); } catch { raw = { _raw: text }; }

    if (!res.ok) {
      return { statusCode: res.status, headers: CORS, body: JSON.stringify({
        ok:false, configured:true, error:"Provider rejected the request", status:res.status, provider: raw,
      }) };
    }

    // ───────────────────────── ADAPTER ─────────────────────────
    // Map the provider's response to our tweet array. ADJUST these field names to match
    // whichever vendor you choose (the common ones expose tweets under data/results/statuses).
    const items = raw.tweets || raw.data || raw.results || raw.statuses || [];
    const tweets = items.map(t => {
      const txt = t.text || t.full_text || t.content || "";
      // Provider may give a sentiment already; else derive a light heuristic.
      let s = (typeof t.sentiment_score === "number") ? t.sentiment_score
            : (typeof t.sentiment === "number") ? t.sentiment
            : heuristicScore(txt);
      // normalize to 0-100
      const score = clamp(Math.round(s <= 1 && s >= -1 ? (s + 1) * 50 : s), 0, 100);
      return {
        text: txt.slice(0, 240),
        author: t.author || t.username || t.user?.screen_name || "—",
        score,
        tag: score >= 60 ? "Bullish" : score <= 40 ? "Bearish" : "Neutral",
        url: t.url || (t.id ? `https://x.com/i/web/status/${t.id}` : null),
        time: t.created_at || t.time || null,
      };
    }).filter(t => t.text);
    // ────────────────────────────────────────────────────────────

    if (!tweets.length) {
      return { statusCode: 200, headers: CORS, body: JSON.stringify({
        ok:false, configured:true, error:"No posts returned for the query", provider_keys:Object.keys(raw),
      }) };
    }

    const score = Math.round(tweets.reduce((a,t)=>a+t.score,0) / tweets.length);
    const volume = (typeof raw.volume === "number") ? raw.volume
                 : (typeof raw.total === "number") ? raw.total
                 : tweets.length;
    const volumeChangePct = (typeof raw.volume_change_pct === "number") ? raw.volume_change_pct : null;

    return { statusCode: 200, headers: CORS, body: JSON.stringify({
      ok: true, configured: true,
      score,
      label: score >= 60 ? "Bullish" : score <= 40 ? "Bearish" : "Neutral",
      volume,
      volumeChangePct,
      updatedAt: new Date().toISOString(),
      tweets: tweets.slice(0, 12),
    }) };
  } catch (err) {
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ ok:false, configured:true, error:"Could not reach sentiment provider", detail: err.message }) };
  }
};

function clamp(n,lo,hi){ return Math.max(lo, Math.min(hi, n)); }

// Fallback heuristic if the provider doesn't return a per-post sentiment score.
function heuristicScore(text){
  const t = (text||"").toLowerCase();
  const bull = ["buy","bull","moon","breakout","up","gain","strong","accumulate","undervalued","rip","🚀","green"];
  const bear = ["sell","bear","dump","down","loss","weak","crash","dilution","red","overvalued","drop"];
  let s = 50;
  bull.forEach(w=>{ if(t.includes(w)) s += 6; });
  bear.forEach(w=>{ if(t.includes(w)) s -= 6; });
  return clamp(s, 0, 100);
}
