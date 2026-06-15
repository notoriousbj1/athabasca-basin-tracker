const CHANNELS = [
  { name:"Justin Huhn",          handle:"UraniumInsider"     },
  { name:"Palisades Gold Radio",  handle:"PalisadesGoldRadio" },
  { name:"Commodity Culture",     handle:"CommodityCulture"   },
  { name:"Mining Stock Daily",    handle:"MiningStockDaily"   },
  { name:"Lobo Tiggre",           handle:"TheLoboTiggre"      },
  { name:"Sprott Media",          handle:"SprottMedia"        },
];

exports.handler = async () => {
  try {
    const results = await Promise.all(CHANNELS.map(async (ch) => {
      try {
        const page = await fetch(`https://www.youtube.com/@${ch.handle}`, {
          headers:{ "User-Agent":"Mozilla/5.0" }
        });
        const html = await page.text();
        const cidMatch = html.match(/"channelId":"(UC[^"]+)"/);
        if (!cidMatch) return null;
        const rss = await fetch(
          `https://www.youtube.com/feeds/videos.xml?channel_id=${cidMatch[1]}`,
          { headers:{ "User-Agent":"Mozilla/5.0" } }
        );
        const xml = await rss.text();
        const videoId  = xml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
        const titles   = xml.match(/<title>([^<]+)<\/title>/g) || [];
        const title    = titles[1]?.replace(/<\/?title>/g,"") || ch.name;
        const dateRaw  = xml.match(/<published>([^<]+)<\/published>/)?.[1] || "";
        const date     = dateRaw ? new Date(dateRaw).toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" }) : "";
        if (!videoId) return null;
        return { channel:ch.name, videoId, videoTitle:title, date,
                 videoUrl:`https://www.youtube.com/watch?v=${videoId}` };
      } catch(e) { return null; }
    }));
    return {
      statusCode:200,
      headers:{ "Access-Control-Allow-Origin":"*" },
      body: JSON.stringify(results.filter(Boolean)),
    };
  } catch(e) {
    return { statusCode:500, body: JSON.stringify({ error:e.message }) };
  }
};
