const FEEDS = [
  { url:"https://www.world-nuclear-news.org/rss",                   source:"World Nuclear News"       },
  { url:"https://www.ans.org/news/rss/",                            source:"American Nuclear Society" },
  { url:"https://www.power-technology.com/category/nuclear/feed/",  source:"Power Technology"         },
  { url:"https://www.neimagazine.com/rss",                          source:"NEI Magazine"             },
  { url:"https://www.mining.com/category/uranium/feed/",            source:"Mining.com"               },
];

const CATEGORIES = [
  { keys:["reactor","build","construct","new plant","unit"],  label:"New Builds" },
  { keys:["policy","law","regulation","government","act"],    label:"Policy"     },
  { keys:["uranium","fuel","supply","demand","price","spot"], label:"Market"     },
  { keys:["smr","small modular","advanced","technology"],     label:"Technology" },
];

const CUTOFF = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

function classify(text) {
  const lower = text.toLowerCase();
  return CATEGORIES.find(c => c.keys.some(k => lower.includes(k)))?.label || "Nuclear";
}

function extractUrl(item) {
  // Try href attribute first (Atom feeds)
  const href = item.match(/<link[^>]+href="([^"]+)"/)?.[1];
  if (href && href.startsWith("http")) return href.trim();
  // Try link tag content (RSS 2.0)
  const link = item.match(/<link>([^<]+)<\/link>/)?.[1];
  if (link && link.trim().startsWith("http")) return link.trim();
  // Try guid
  const guid = item.match(/<guid[^>]*>([^<]+)<\/guid>/)?.[1];
  if (guid && guid.trim().startsWith("http")) return guid.trim();
  return null;
}

function parseRSS(xml, source) {
  const items = [
    ...(xml.match(/<item[\s\S]*?<\/item>/g)   || []),
    ...(xml.match(/<entry[\s\S]*?<\/entry>/g) || []),
  ];

  return items.map(item => {
    const getText = (tag) => {
      const cd = item.match(new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`));
      const pl = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return (cd?.[1] || pl?.[1] || "").trim();
    };

    const headline = getText("title");
    const url      = extractUrl(item);
    const pubDate  = getText("pubDate") || getText("published") || getText("updated");
    const summary  = (getText("description") || getText("summary") || getText("content"))
      .replace(/<[^>]+>/g, "").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim().substring(0, 220);

    if (!headline || !url) return null;

    let parsedDate;
    try { parsedDate = new Date(pubDate); } catch { return null; }
    if (!parsedDate || isNaN(parsedDate.getTime()) || parsedDate < CUTOFF) return null;

    const date = parsedDate.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
    return { headline, url, date, dateMs:parsedDate.getTime(), summary, source,
             category:classify(headline + " " + summary) };
  }).filter(Boolean);
}

exports.handler = async () => {
  try {
    const allItems = [];

    await Promise.all(FEEDS.map(async ({ url, source }) => {
      try {
        const res = await fetch(url, {
          headers: { "User-Agent":"Mozilla/5.0 (compatible; RSS reader)" },
          signal:  AbortSignal.timeout(8000),
        });
        if (!res.ok) return;
        const xml  = await res.text();
        const items = parseRSS(xml, source);
        // Max 3 articles per source to ensure variety
        allItems.push(...items.slice(0, 3));
      } catch(e) { console.error(`Feed error ${url}:`, e.message); }
    }));

    const seen = new Set();
    const results = allItems
      .filter(i => { if (seen.has(i.headline)) return false; seen.add(i.headline); return true; })
      .sort((a, b) => b.dateMs - a.dateMs)
      .map(({ dateMs, ...rest }) => rest)
      .slice(0, 10);

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(results),
    };
  } catch(e) {
    return { statusCode:500, body: JSON.stringify({ error:e.message }) };
  }
};
