const CHANNELS = [
  { name:"Justin Huhn",          handle:"UraniumInsider"     },
  { name:"Palisades Gold Radio",  handle:"PalisadesGoldRadio" },
  { name:"Commodity Culture",     handle:"CommodityCulture"   },
  { name:"Mining Stock Daily",    handle:"MiningStockDaily"   },
  { name:"Lobo Tiggre",           handle:"TheLoboTiggre"      },
  { name:"Sprott Media",          handle:"SprottMedia"        },
];

const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://api.piped.yt",
  "https://piped-api.privacy.com.de",
];

async function fetchChannel(handle) {
  for (const base of PIPED_INSTANCES) {
    try {
      const res = await fetch(`${base}/channel/@${handle}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const video = data.relatedStreams?.find(v => v.type === "stream");
      if (!video) continue;
      const videoId = video.url?.replace("/watch?v=", "");
      const date = video.uploaded
        ? new Date(video.uploaded).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })
        : "";
      return { videoId, videoTitle: video.title, date };
    } catch(e) { continue; }
  }
  return null;
}

exports.handler = async () => {
  try {
    const results = await Promise.all(CHANNELS.map(async (ch) => {
      const video = await fetchChannel(ch.handle);
      if (!video?.videoId) return null;
      return {
        channel:    ch.name,
        videoId:    video.videoId,
        videoTitle: video.videoTitle,
        date:       video.date,
        videoUrl:   `https://www.youtube.com/watch?v=${video.videoId}`,
      };
    }));

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(results.filter(Boolean)),
    };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
