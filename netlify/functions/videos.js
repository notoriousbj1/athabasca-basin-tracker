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

async function latestVideos(channelId, max = 4) {
  const rss = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const res = await fetch(rss, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(9000) });
  if (!res.ok) throw new Error(`rss ${res.status}`);
  const xml = await res.text();
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
  const out = [];
  for (const block of entries.slice(0, max)) {
    const videoId = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    if (!videoId) continue;
    const title = (block.match(/<title>([^<]+)<\/title>/)?.[1] || "")
      .replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    const pub = block.match(/<published>([^<]+)<\/published>/)?.[1];
    const date = pub ? new Date(pub).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;
    out.push({ videoId, videoTitle: title, videoUrl: `https://www.youtube.com/watch?v=${videoId}`, date, publishedAt: pub || null });
  }
  return out;
}

exports.handler = async () => {
  const perChannel = await Promise.all(CHANNELS.map(async (ch) => {
    try {
      const id = await resolveChannelId(ch);
      if (!id) return [{ channel: ch.name, error: "channelId not resolved" }];
      const vids = await latestVideos(id, 4);
      if (!vids.length) return [{ channel: ch.name, channelId: id, error: "no video" }];
      return vids.map(v => ({ channel: ch.name, channelId: id, ...v }));
    } catch (e) {
      return [{ channel: ch.name, error: e.message }];
    }
  }));

  // Flatten, then sort newest-first across all channels
  const results = perChannel.flat();
  results.sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tb - ta;
  });

  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=1800" },
    body: JSON.stringify(results),
  };
};
