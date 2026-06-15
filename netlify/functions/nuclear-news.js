const FEEDS = [
  { url:"https://www.world-nuclear-news.org/rss",               source:"World Nuclear News"        },
  { url:"https://www.neimagazine.com/rss",                      source:"NEI Magazine"              },
  { url:"https://nuclear-news.net/feed/",                       source:"Nuclear News Net"          },
  { url:"https://www.powermag.com/category/nuclear/feed/",      source:"Power Magazine"            },
  { url:"https://www.mining.com/category/uranium/feed/",        source:"Mining.com"                },
  { url:"https://www.nrc.gov/public-involve/rss-feeds/nrc-news.xml", source:"US NRC"              },
  { url:"https://www.ans.org/news/feed",                        source:"American Nuclear Society"  },
  { url:"https://feeds.reuters.com/reuters/environment",        source:"Reuters"                   },
  { url:"https://www.energy.gov/ne/ne-rss-feeds",              source:"US Dept. of Energy"        },
  { url:"https://www.iaea.org/newscenter/news/rss",             source:"IAEA"                      },
];

const CATEGORIES = [
  { keys:["reactor","build","construct","new plant","unit","hinkley","ap1000","bwrx"], label:"New Builds" },
  { keys:["policy","law","regulation","government","act","congress","senate","bill"],  label:"Policy"     },
  { keys:["uranium","fuel","supply","demand","price","spot","kazatomprom"],            label:"Market"     },
  { keys:["smr","small modular","advanced reactor","fusion","technology"],             label:"Technology" },
];

const CUTOFF = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

function classify(text) {
  const lower = text.toLowerCase();
  return CATEGORIES.find(c => c.keys.some(k => lower.includes(k)))?.label || "Nuclear";
}

function extractUrl(item) {
  const href = item.match(/<link[^>]+href="([^"]+)"/)?.[1];
  if (href?.startsWith("http")) return href.trim();
  const link = item.match(/<link>([^<]+)<\/link>/)?.[1];
  if (link?.trim().startsWith("http")) return link.trim();
  const guid = item.match(/<guid[^>]*>([^<]+)<\/guid>/)?.[1];
  if (guid?.trim().startsWith("http")) return guid.trim();
  return null;
}

function parseDate(str) {
  if (!str) return null;
  let d = new Date(str.trim());
  if (!isNaN(d.getTime())) return d;
  d = new Date(str.trim().replace(/\s*\+\d{4}$/, "").replace(/\s*[A-Z]{3}$/, ""));
  if (!isNaN(d.getTime())) return d;
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
    const pubDate  = getText("pubDate") || getText("published") || getText("updated") || getText("dc:date");
    const rawDesc  = getText("description") || getText("summary") || getText("content") || "";
    const summary  = rawDesc.replace(/<[^>]+>/g,"").replace(/&[^;]+;/g," ").replace(/\s+/g," ").trim().substring(0,220);
    if (!headline || !url) return null;
    const parsedDate = parseDate(pubDate);
    if (!parsedDate || parsedDate < CUTOFF) return null;
    const date = parsedDate.toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" });
    return { headline, url, date, dateMs:parsedDate.getTime(), summary, source,
             category:classify(headline + " " + summary) };
  }).filter(Boolean);
}

exports.handler = async () => {
  try {
    const perSource = {};

    await Promise.all(FEEDS.map(async ({ url, source }) => {
      try {
        const res = await fetch(url, {
          headers:{ "User-Agent":"Mozilla/5.0 (compatible; RSS reader)" },
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) return;
        const xml   = await res.text();
        const items = parseRSS(xml, source);
        if (items.length > 0) perSource[source] = items.slice(0, 2);
      } catch(e) { /* silently skip failed feeds */ }
    }));

    // Interleave sources for guaranteed variety
    const sources = Object.values(perSource);
    const allItems = [];
    const maxLen = Math.max(...sources.map(a => a.length), 0);
    for (let i = 0; i < maxLen; i++) {
      sources.forEach(arr => { if (arr[i]) allItems.push(arr[i]); });
    }

    const seen = new Set();
    const results = allItems
      .filter(i => { if (seen.has(i.headline)) return false; seen.add(i.headline); return true; })
      .sort((a,b) => b.dateMs - a.dateMs)
      .map(({ dateMs, ...rest }) => rest)
      .slice(0, 12);

    return {
      statusCode:200,
      headers:{ "Access-Control-Allow-Origin":"*" },
      body: JSON.stringify(results),
    };
  } catch(e) {
    return { statusCode:500, body: JSON.stringify({ error:e.message }) };
  }
};
