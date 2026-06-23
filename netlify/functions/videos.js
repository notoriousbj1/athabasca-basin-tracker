// videos.js
// Pulls each channel's latest video via YouTube's native RSS feed (no API key).
// Resolves @handle -> channelId robustly, with multiple strategies.
// If you know a channel's UC... id, put it in `id:` to skip resolution entirely (most reliable).

const CHANNELS = [
  { name:"Uranium Insider",   handle:"@UraniumInsider",    id:null },
  { name:"Palisades Radio",   handle:"@PalisadesGoldRadio",id:null },
  { name:"Commodity Culture", handle:"@CommodityCulture",  id:null },
  { name:"Mining Stock Daily",handle:"@MiningStockDaily",  id:null },
  { name:"Louis James LLC",   handle:"@LoboTiggre",        id:null },
  { name:"Sprott Media",      handle:"@SprottMedia",       id:null },
];

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const COMMON_HEADERS = {
  "User-Agent": UA,
  "Accept-Language": "en-US,en;q=0.9",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  // The CONSENT cookie skips YouTube's EU consent interstitial that hides the channelId
  "Cookie": "CONSENT=YES+cb.20210328-17-p0.en+FX+000",
};

// Extract a UC... channel id from arbitrary channel-page HTML using several patterns.
function extractChannelId(html) {
  const patterns = [
    /"channelId":"(UC[0-9A-Za-z_-]{22})"/,
    /"externalId":"(UC[0-9A-Za-z_-]{22})"/,
    /<meta itemprop="(?:channelId|identifier)" content="(UC[0-9A-Za-z_-]{22})">/,
    /rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[0-9A-Za-z_-]{22})"/,
    /feeds\/videos\.xml\?channel_id=(UC[0-9A-Za-z_-]{22})/,
    /channel\/(UC[0-9A-Za-z_-]{22})/,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return m[1];
  }
  return null;
}

async function resolveChannelId(ch) {
  if (ch.id) return ch.id; // hardcoded — most reliable, skip network
  const urls = [
    `https://www.youtube.com/${ch.handle}`,
    `https://www.youtube.com/${ch.handle}/about`,
    `https://m.youtube.com/${ch.handle}`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: COMMON_HEADERS, signal: AbortSignal.timeout(9000) });
      if (!res.ok) continue;
      const html = await res.text();
      const id = extractChannelId(html);
      if (id) return id;
    } catch { /* try next */ }
  }
  return null;
}

async function latestVideo(channelId) {
  const rss = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const res = await fetch(rss, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(9000) });
  if (!res.ok) throw new Error(`rss ${res.status}`);
  const xml = await res.text();
  const entry = xml.match(/<entry>[\s\S]*?<\/entry>/);
  if (!entry) return null;
  const block = entry[0];
  const videoId = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
  const title = (block.match(/<title>([^<]+)<\/title>/)?.[1] || "")
    .replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  const pub = block.match(/<published>([^<]+)<\/published>/)?.[1];
  const date = pub ? new Date(pub).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;
  if (!videoId) return null;
  return { videoId, videoTitle: title, videoUrl: `https://www.youtube.com/watch?v=${videoId}`, date };
}

exports.handler = async () => {
  const results = await Promise.all(CHANNELS.map(async (ch) => {
    try {
      const id = await resolveChannelId(ch);
      if (!id) return { channel: ch.name, error: "channelId not resolved" };
      const vid = await latestVideo(id);
      if (!vid) return { channel: ch.name, channelId: id, error: "no video" };
      return { channel: ch.name, channelId: id, ...vid };
    } catch (e) {
      return { channel: ch.name, error: e.message };
    }
  }));

  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=1800" },
    body: JSON.stringify(results),
  };
};
