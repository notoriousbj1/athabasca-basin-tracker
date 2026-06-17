// videos.js
// Pulls each channel's latest video via YouTube's native RSS feed (no API key, no Piped).
// Resolves @handle -> channelId by scraping the channel page, then reads feeds/videos.xml

const CHANNELS = [
  { name:"Uranium Insider",  handle:"@UraniumInsider"   },
  { name:"Palisades Radio",  handle:"@PalisadesGoldRadio" },
  { name:"Commodity Culture",handle:"@CommodityCulture"  },
  { name:"Mining Stock Daily",handle:"@MiningStockDaily" },
  { name:"Louis James LLC",  handle:"@LoboTiggre"        },
  { name:"Sprott Media",     handle:"@SprottMedia"       },
];

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function resolveChannelId(handle) {
  // Fetch the channel page and extract the canonical channelId
  const url = `https://www.youtube.com/${handle}`;
  const res = await fetch(url, { headers:{ "User-Agent":UA, "Accept-Language":"en-US,en;q=0.9" }, signal:AbortSignal.timeout(9000) });
  if (!res.ok) throw new Error(`channel page ${res.status}`);
  const html = await res.text();
  // Look for "channelId":"UC..." or browseId, or the rss link
  const m = html.match(/"channelId":"(UC[0-9A-Za-z_-]{22})"/)
        || html.match(/"externalId":"(UC[0-9A-Za-z_-]{22})"/)
        || html.match(/channel\/(UC[0-9A-Za-z_-]{22})/)
        || html.match(/feeds\/videos\.xml\?channel_id=(UC[0-9A-Za-z_-]{22})/);
  if (!m) throw new Error("channelId not found");
  return m[1];
}

async function latestVideo(channelId) {
  const rss = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const res = await fetch(rss, { headers:{ "User-Agent":UA }, signal:AbortSignal.timeout(9000) });
  if (!res.ok) throw new Error(`rss ${res.status}`);
  const xml = await res.text();
  const entry = xml.match(/<entry>[\s\S]*?<\/entry>/);
  if (!entry) return null;
  const block = entry[0];
  const videoId = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
  const title   = (block.match(/<title>([^<]+)<\/title>/)?.[1]||"").replace(/&amp;/g,"&").replace(/&#39;/g,"'").replace(/&quot;/g,'"');
  const pub     = block.match(/<published>([^<]+)<\/published>/)?.[1];
  const date    = pub ? new Date(pub).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : null;
  if (!videoId) return null;
  return { videoId, videoTitle:title, videoUrl:`https://www.youtube.com/watch?v=${videoId}`, date };
}

exports.handler = async () => {
  const results = await Promise.all(CHANNELS.map(async (ch) => {
    try {
      const id = await resolveChannelId(ch.handle);
      const vid = await latestVideo(id);
      if (!vid) return { channel:ch.name, error:"no video" };
      return { channel:ch.name, ...vid };
    } catch (e) {
      return { channel:ch.name, error:e.message };
    }
  }));

  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin":"*", "Cache-Control":"public, max-age=3600" },
    body: JSON.stringify(results.filter(r=>r.videoId)),
  };
};
