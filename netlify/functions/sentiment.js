// sentiment.js
// Live community sentiment for the Athabasca uranium juniors.
// Sources: Reddit (public JSON) + Bluesky (public AT Protocol search) for content,
// Claude (ANTHROPIC_API_KEY) for bull/bear sentiment scoring.
//
// Env vars:
//   ANTHROPIC_API_KEY  – required for AI sentiment tagging (you already have this)
//
// Returns: { ok, score 0-100, label, volume, sources, updatedAt, tweets:[{text,author,score,tag,url,source}] }

const SUBREDDITS = ["UraniumSqueeze", "uranium", "SmallCap_MiningStocks"];
const BLUESKY_QUERIES = ["uranium stock", "Athabasca uranium", "$NXE", "$CCJ uranium"];
const KEYWORDS = /(uranium|athabasca|u3o8|yellowcake|nexgen|cameco|denison|fission|isoenergy|nuclear fuel|\$nxe|\$ccj|\$dnn|\$fcu|\$uec|\$uuuu|\$urnm)/i;

const UA = "Mozilla/5.0 (compatible; AthabascaTracker/1.0; +https://athabasca-tracker.netlify.app)";

exports.handler = async () => {
  const CORS = { "Access-Control-Allow-Origin":"*", "Content-Type":"application/json", "Cache-Control":"public, max-age=900" };
  try {
    // ---- 1. Gather posts from Reddit + Bluesky in parallel ----
    const [redditPosts, blueskyPosts] = await Promise.all([
      fetchReddit().catch(()=>[]),
      fetchBluesky().catch(()=>[]),
    ]);

    let posts = [...redditPosts, ...blueskyPosts]
      .filter(p => p.text && p.text.length > 12)
      .filter(p => KEYWORDS.test(p.text))           // keep only uranium-relevant chatter
      .slice(0, 40);

    if (!posts.length) {
      return { statusCode: 200, headers: CORS, body: JSON.stringify({
        ok:false, configured:true, error:"No relevant posts found right now",
        sources:{ reddit:redditPosts.length, bluesky:blueskyPosts.length },
      }) };
    }

    // ---- 2. Score sentiment with Claude (one batched call) ----
    const scored = await scoreWithClaude(posts);

    // ---- 3. Aggregate ----
    const valid = scored.filter(p => typeof p.score === "number");
    const score = valid.length ? Math.round(valid.reduce((a,p)=>a+p.score,0)/valid.length) : 50;

    return { statusCode: 200, headers: CORS, body: JSON.stringify({
      ok: true, configured: true,
      score,
      label: score>=60 ? "Bullish" : score<=40 ? "Bearish" : "Neutral",
      volume: posts.length,
      sources: { reddit: redditPosts.length, bluesky: blueskyPosts.length },
      updatedAt: new Date().toISOString(),
      tweets: scored.slice(0, 14),
    }) };
  } catch (err) {
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ ok:false, error:"Sentiment build failed", detail: err.message }) };
  }
};

// ---------- Reddit (public JSON, no OAuth needed for light reads) ----------
async function fetchReddit() {
  const out = [];
  for (const sub of SUBREDDITS) {
    try {
      const res = await fetch(`https://www.reddit.com/r/${sub}/new.json?limit=25`, {
        headers: { "User-Agent": UA, "Accept": "application/json" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const children = data?.data?.children || [];
      for (const c of children) {
        const d = c.data || {};
        const text = `${d.title || ""}${d.selftext ? " — " + d.selftext.slice(0,200) : ""}`.trim();
        if (!text) continue;
        out.push({
          text,
          author: `u/${d.author || "?"}`,
          url: d.permalink ? `https://www.reddit.com${d.permalink}` : null,
          upvotes: d.ups || 0,
          source: "Reddit",
          createdMs: (d.created_utc || 0) * 1000,
        });
      }
    } catch { /* skip this sub */ }
  }
  return out;
}

// ---------- Bluesky (public AT Protocol search, no auth) ----------
async function fetchBluesky() {
  const out = [];
  for (const q of BLUESKY_QUERIES) {
    try {
      const res = await fetch(
        `https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=${encodeURIComponent(q)}&limit=15&sort=latest`,
        { headers: { "User-Agent": UA, "Accept": "application/json" }, signal: AbortSignal.timeout(8000) }
      );
      if (!res.ok) continue;
      const data = await res.json();
      for (const p of (data?.posts || [])) {
        const text = p?.record?.text;
        if (!text) continue;
        const handle = p?.author?.handle;
        const rkey = p?.uri?.split("/").pop();
        out.push({
          text,
          author: `@${handle || "?"}`,
          url: handle && rkey ? `https://bsky.app/profile/${handle}/post/${rkey}` : null,
          upvotes: p?.likeCount || 0,
          source: "Bluesky",
          createdMs: p?.record?.createdAt ? new Date(p.record.createdAt).getTime() : Date.now(),
        });
      }
    } catch { /* skip this query */ }
  }
  return out;
}

// ---------- Claude sentiment scoring (batched) ----------
async function scoreWithClaude(posts) {
  const API_KEY = process.env.ANTHROPIC_API_KEY;
  // If no key, fall back to a light keyword heuristic so the feature still works.
  if (!API_KEY) return posts.map(p => ({ ...p, ...heuristic(p.text) }));

  const numbered = posts.map((p,i)=>`${i}. ${p.text.replace(/\s+/g," ").slice(0,200)}`).join("\n");
  const prompt = `You are a financial sentiment classifier for uranium mining stocks. For each numbered post, rate investor sentiment from 0 (very bearish) to 100 (very bullish), where 50 is neutral. Respond ONLY with a JSON array of objects like [{"i":0,"score":72,"tag":"Bullish"}], one per post, no prose. tag must be "Bullish" (score>=60), "Bearish" (score<=40), or "Neutral".\n\nPosts:\n${numbered}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type":"application/json", "x-api-key":API_KEY, "anthropic-version":"2023-06-01" },
      body: JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:1500, messages:[{ role:"user", content:prompt }] }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return posts.map(p => ({ ...p, ...heuristic(p.text) }));
    const data = await res.json();
    let txt = (data?.content?.[0]?.text || "").trim().replace(/```json|```/g,"").trim();
    const arr = JSON.parse(txt);
    const byIdx = new Map(arr.map(o => [o.i, o]));
    return posts.map((p,i)=>{
      const o = byIdx.get(i);
      const score = (o && typeof o.score==="number") ? clamp(o.score,0,100) : heuristic(p.text).score;
      return { text:p.text, author:p.author, url:p.url, source:p.source, score,
               tag: score>=60?"Bullish":score<=40?"Bearish":"Neutral" };
    });
  } catch {
    return posts.map(p => ({ ...p, ...heuristic(p.text) }));
  }
}

function clamp(n,lo,hi){ return Math.max(lo, Math.min(hi, n)); }
function heuristic(text){
  const t=(text||"").toLowerCase(); let s=50;
  ["buy","bull","moon","breakout","gain","strong","accumulate","undervalued","🚀","squeeze","rip"].forEach(w=>{ if(t.includes(w)) s+=6; });
  ["sell","bear","dump","loss","weak","crash","dilution","overvalued","drop","bag"].forEach(w=>{ if(t.includes(w)) s-=6; });
  s=clamp(s,0,100);
  return { score:s, tag: s>=60?"Bullish":s<=40?"Bearish":"Neutral" };
}
